import mysql.connector

def check_users_table():
    try:
        # MySQL 연결
        conn = mysql.connector.connect(
            host='localhost',
            user='root',
            password='1234567890',
            database='webtoon_novel_db',
            charset='utf8mb4'
        )
        
        cursor = conn.cursor()
        
        # 테이블 구조 확인
        cursor.execute("DESCRIBE users")
        columns = cursor.fetchall()
        
        print("📋 users 테이블 구조:")
        print("컬럼명\t\t타입\t\tNull\t키\t기본값")
        print("-" * 60)
        for col in columns:
            field, type_, null, key, default, extra = col
            print(f"{field:<15} {type_:<15} {null:<8} {key:<8} {default}")
        
        # NULL이 허용되지 않는 컬럼들 확인
        not_null_columns = [col[0] for col in columns if col[2] == 'NO' and col[0] not in ['id', 'created_at', 'updated_at']]
        print(f"\n❌ NOT NULL 필수 컬럼들: {not_null_columns}")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"오류: {e}")

if __name__ == "__main__":
    check_users_table()
