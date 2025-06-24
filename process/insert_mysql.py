import pymysql
import pickle
from glob import glob
import re
from tqdm import tqdm

if __name__ == '__main__':

    db = pymysql.connect(
        host='localhost',
        port=3306,
        user='root',
        passwd='1234567890',
        db='webtoon_novel_db',
        charset='utf8mb4'
    )

    cursor = db.cursor()

    # 테이블 초기화
    table_name = "novels"
    # cursor.execute(f"DROP TABLE IF EXISTS {table_name}")
    
    # # 테이블 재생성
    # create_table_sql = f"""
    # CREATE TABLE {table_name} (
    #     id INT AUTO_INCREMENT PRIMARY KEY,
    #     url VARCHAR(255),
    #     img VARCHAR(255),
    #     title VARCHAR(255),
    #     author VARCHAR(255),
    #     recommend INT,
    #     genre VARCHAR(255),
    #     serial VARCHAR(255),
    #     publisher VARCHAR(255),
    #     summary TEXT,
    #     page_count INT,
    #     page_unit VARCHAR(10),
    #     age VARCHAR(10),
    #     platform VARCHAR(255),
    #     keywords TEXT,
    #     viewers INT
    # )
    # """
    # cursor.execute(create_table_sql)

    insert_sql = """
    INSERT INTO novels (url, img, title, author, recommend, genre, serial, publisher, summary, page_count, page_unit, age, platform, keywords, viewers, type) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """

    with open('data/all_data.data', 'rb') as f:
        datas = pickle.load(f)


    for data in tqdm(datas, total=len(datas)):
        try:
            novel_data = (
                        data['url'],
                        data['img'],
                        data['title'],
                        data['author'],
                        data['recommend'],
                        data['genre'],
                        data['serial'],
                        data['publisher'],
                        data['summary'],
                        data['page_count'],
                        data['page_unit'],
                        data['age'],
                        data['platform'],
                        data['keywords'],
                        data['viewers'],
                        data['type']
                    )
            # 1. URL이 이미 존재하는지 확인
            check_sql = "SELECT url FROM novels WHERE url = %s"
            cursor.execute(check_sql, (data['url'],))
            result = cursor.fetchone()

            # 2. 존재하지 않을 경우에만 INSERT
            if result is None:
                cursor.execute(insert_sql, novel_data)

        except:
            import traceback
            traceback.print_exc()

            print(novel_data)
            break

    db.commit()

    db.close()