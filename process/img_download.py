import pickle
import requests
import parmap
import os
import time
from urllib.parse import urlparse
import random
import re

def load_and_prepare_data():
    try:
        with open('data/all_data.data', 'rb') as f:
            datas = pickle.load(f)
    except FileNotFoundError:
        print("'data/all_data.data' 파일을 찾을 수 없습니다. 빈 데이터를 반환합니다.")
        return {}

    all_urls = {'naver': [], 'novelpia': [], 'munpia': []}
    for data in datas:
        platform = data.get('platform')
        img_url = data.get('img')
        title = str(data.get('id'))

        if not platform or not img_url:
            continue

        if platform == 'novelpia':
            all_urls['novelpia'].append((title, img_url.replace('//images.', 'https://')))
        elif platform == 'naver':
            all_urls['naver'].append((title, img_url))
        elif platform == 'munpia':
            all_urls['munpia'].append((title, 'https:' + img_url))

    print(f"총 {len(datas)}개 데이터 로드 완료")
    return all_urls

# [수정됨] download_image 함수
def download_image(folder, file_path, url):
    """
    하나의 URL에서 이미지를 다운로드하여 지정된 플랫폼 폴더에 저장합니다.
    성공 또는 실패 결과를 반드시 반환(return)해야 합니다.
    """
    try:
        # 전체 저장 경로 생성
        full_save_path = os.path.join(folder, file_path)

        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'}
        response = requests.get(url, stream=True, headers=headers, timeout=10)
        response.raise_for_status()

        with open(full_save_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        time.sleep(random.uniform(0.1, 0.5)) # 서버 부하를 줄이기 위한 약간의 딜레이
        
        # [핵심 수정 1] 성공했을 때 반드시 결과를 반환합니다.
        return url, "성공"

    except requests.exceptions.RequestException as e:
        # 실패 로그는 print 대신 logging 라이브러리를 사용하는 것이 더 좋습니다.
        # print(f"[PID {os.getpid()}] 다운로드 실패: {url}, 오류: {e}")
        return url, "실패"
    except Exception as e:
        # 기타 예외 처리
        return url, f"기타 오류: {e}"


if __name__ == "__main__":
    datas = load_and_prepare_data()

    if not any(datas.values()):
        print("처리할 데이터가 없습니다.")
    else:
        main_save_folder = "img_downloaded"
        # exist_ok=True를 사용하면 폴더가 이미 있어도 오류가 발생하지 않습니다.
        os.makedirs(main_save_folder, exist_ok=True)

        start_time = time.time()
        
        download_tasks = []
        for platform, groups in datas.items():
            platform_folder = os.path.join(main_save_folder, platform)
            os.makedirs(platform_folder, exist_ok=True)

            for file_id, url in groups:
                file_name = file_id + '_image.jpg'
                # [수정됨] task에는 폴더 경로, 최종 파일명, URL을 전달합니다.
                download_tasks.append((platform_folder, file_name, url))

        print(f"총 {len(download_tasks)}개의 이미지 다운로드를 시작합니다...")
        
        # parmap.starmap으로 (폴더, 파일명, url) 인자를 함수에 전달
        results = parmap.starmap(download_image, download_tasks, pm_pbar=True, pm_processes=5)

        end_time = time.time()
        
        print("\n--- 모든 작업 완료 ---")
        print(f"총 {len(results)}개의 이미지 처리를 {end_time - start_time:.2f}초 만에 완료했습니다.")
        
        # [핵심 수정 2] 반환된 결과를 바탕으로 성공/실패 횟수를 집계합니다.
        success_count = sum(1 for res in results if res[1] == "성공")
        failure_count = len(results) - success_count
        print(f"성공: {success_count}개, 실패: {failure_count}개")
