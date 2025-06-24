import pandas as pd
import pickle
from glob import glob
import json
import os
import re
import numpy as np

def save_data(datas:pd.DataFrame):
    datas.to_json('data/all_data.json', orient='records')
    datas.to_csv('data/temp.csv', encoding='utf-8', index=False)

    with open('data/all_data.json', 'r') as f:
        data = json.load(f)
        
    with open('data/all_data.data', 'wb') as f:
        pickle.dump(data, f)

    os.remove('data/all_data.json')



def load_data():
    files = glob('data/*.data')

    all_data = []
    for file in files:
        with open(file, 'rb') as f:
            data = pickle.load(f)
            all_data.extend(data)


    cleaned_data = [item for item in all_data if isinstance(item, dict)]
    print('불러온 데이터: ', len(cleaned_data))
    return cleaned_data

def drop_dupl(df:pd.DataFrame):
    new_df = df.drop_duplicates(['url'])
    new_df = new_df.drop_duplicates(['title'])
    return new_df

# keywords 처리
def process_keywords(keywords):
    if isinstance(keywords, list):  # 리스트인 경우
        return "#" + " #".join(keywords)
    elif isinstance(keywords, str):  # 문자열인 경우
        return "#" + " #".join(keywords.split())
    return ""  # 다른 데이터 타입은 빈 문자열로 처리

def str_preprocessing(df: pd.DataFrame):
    # 복사본 생성해서 안전하게 처리
    try:
        df = df.copy()
        
        df['viewers'] = df['viewers'].map(lambda x: '0' if x is np.nan else x)
        df['rating'] = df['rating'].map(lambda x: '0' if x is np.nan else x)
        df['keywords'] = df['keywords'].map(lambda x: '' if x is np.nan else x)
        df['viewers'] = df['viewers'].map(lambda x: '0' if x is None else x)
        df['rating'] = df['rating'].map(lambda x: '0' if x is None else x)
        df['keywords'] = df['keywords'].map(lambda x: '' if x is None else x)

        df = df[df['url'].notnull()]
        df = df[df.notnull()]
        # df = df.dropna()
        # print('df shape: ', df.shape)
        
        df['title'] = df['title'].str.strip()
        df['summary'] = df['summary'].str.replace(r'[\r, \n, \t]',' ', regex=True).replace(r'\s{2,}', ' ', regex=True).str.strip()
        df['keywords'] = df['keywords'].str.replace(r'[\r, \n, \t]',' ', regex=True).replace(r'\s{2,}', ' ', regex=True).str.strip()

        # df['summary'] = df['summary'].str.replace('\xa0', ' ').str.strip()
        df['summary'] = df['summary'].map(lambda x: x.replace('\xa0', ' ').strip())

        df['page_count'] = df['page_count'].astype(str).str.replace(r'[^0-9]', '', regex=True)
        
        
        # page_unit과 page_count 처리 (한 번만 실행되도록)
        # 먼저 "권" 처리
        mask_kwon = df['page_unit'] == '권'

        df['page_count'] = df['page_count'].astype(int)
        # df.loc[mask_kwon, 'page_count'] = df.loc[mask_kwon, 'page_count'] * 25
        df.loc[mask_kwon, 'page_unit'] = '회차'
        
        # 그 다음 "화" 처리
        mask_hwa = df['page_unit'] == '화'
        df.loc[mask_hwa, 'page_unit'] = '회차'

        df['recommend'] = df['recommend'].astype(str).str.replace(',', '').replace('nan', '0').replace('', '0').astype(int)
        
        df['viewers'] = df['viewers'].astype(str).str.replace(',', '').replace('nan', '0').replace('', '0').astype(int)

        df['id'] = range(1, len(df)+1)
        # df = df[df['page_count'] < 10000]

        return df
    except Exception as e:
        import traceback
        traceback.print_exc()

        print(e)


if __name__ == '__main__':
    datas = load_data()
    df = pd.DataFrame(datas)
    # print(df.head())

    df = drop_dupl(df)

    df = str_preprocessing(df)

    print(df.shape)
    save_data(df)