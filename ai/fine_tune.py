import os
import torch
from datasets import Dataset
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    BitsAndBytesConfig,
    TrainingArguments,
)
from peft import LoraConfig, get_peft_model
# SFTConfig를 trl에서 함께 import합니다.
from trl import SFTTrainer, SFTConfig


# --- 환경 설정 ---
# os.environ = "true"

if __name__ == '__main__':
    base_path = '/home/apic/python/recommend_site'
    
    # --- 모델 및 토크나이저 설정 ---
    model_id = "Bllossom/llama-3.2-Korean-Bllossom-3B"

    # 4-bit QLoRA 설정 (메모리 효율 극대화)
    quantization_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_use_double_quant=True,
        bnb_4bit_compute_dtype=torch.bfloat16
    )

    # 모델 불러오기
    model = AutoModelForCausalLM.from_pretrained(
        model_id,
        quantization_config=quantization_config,
        device_map='auto',
        cache_dir=os.path.join(base_path, 'workspace/cache'),
        attn_implementation="flash_attention_2" # 이 부분 추가
    )
    
    # 토크나이저 설정
    tokenizer = AutoTokenizer.from_pretrained(
        model_id,
        cache_dir=os.path.join(base_path, 'workspace/cache')
    )
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
    
    # --- 데이터 준비 ---
    train_file = os.path.join(base_path, 'ai/data/process_datas.json')
    dataset = Dataset.from_json(train_file)

    # 데이터셋을 훈련용과 검증용으로 분리 (90% 훈련, 10% 검증)
    dataset = dataset.train_test_split(test_size=0.1, seed=42) # 재현성을 위해 seed 추가
    train_dataset = dataset['train']
    eval_dataset = dataset['test']

    # 모델의 공식 채팅 템플릿을 사용한 데이터 형식화 함수
    def formatting_func(example):
        messages = [
            {"role": "user", "content": f"이 소설의 태그는 뭘까?\nInput: {example['input']}"},
            {"role": "assistant", "content": f"Output: {example['output']}"}
        ]
        return tokenizer.apply_chat_template(messages, tokenize=False)

    # --- LoRA 설정 ---
    lora_config = LoraConfig(
        r=16,
        lora_alpha=32,
        target_modules="all-linear",
        lora_dropout=0.05,
        bias='none',
        task_type='CAUSAL_LM'
    )
    
    model = get_peft_model(model, lora_config)
    model.print_trainable_parameters()

    # --- 학습 인자 (SFTConfig) 설정 ---
    # 기존 TrainingArguments를 SFTConfig로 대체하여 한번에 관리합니다.
    # SFTConfig는 TrainingArguments를 상속받아 모든 인자를 포함합니다.
    sft_config = SFTConfig(
        output_dir=os.path.join(base_path, 'workspace/Llama-3-8B-Instruct-story-finetuned'),
        num_train_epochs=3,
        per_device_train_batch_size=1,
        per_device_eval_batch_size=2,
        gradient_accumulation_steps=8,
        eval_strategy="epoch",
        save_strategy="epoch",
        learning_rate=1e-5,
        weight_decay=0.01,
        fp16=True, # Ampere 아키텍처 이상 GPU에서는 bf16=True 권장
        logging_strategy="epoch",
        load_best_model_at_end=True,
        metric_for_best_model="eval_loss",
        report_to="none", # W&B 로깅 비활성화 시 명시적으로 설정

        # SFTTrainer 관련 인자들을 이곳으로 이동시킵니다.
        max_seq_length=1024,
        packing=True,
    )

    # --- SFTTrainer 설정 및 학습 시작 ---
    trainer = SFTTrainer(
        model=model,
        train_dataset=train_dataset,
        eval_dataset=eval_dataset,
        peft_config=lora_config,
        args=sft_config, # 분리했던 training_args 대신 sft_config 객체를 전달합니다.
        formatting_func=formatting_func,
        # max_seq_length와 packing 인자는 sft_config에 포함되어 있으므로 여기서 제거합니다.
    )

    # 학습 시작
    trainer.train()
    
    # --- 모델 저장 ---
    final_model_path = os.path.join(base_path, 'workspace/create_tags_final')
    trainer.model.save_pretrained(final_model_path)
    print(f'최종 모델이 {final_model_path}에 저장되었습니다.')