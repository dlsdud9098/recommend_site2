"""
users 테이블의 name 컬럼을 NULL 허용으로 변경하는 스크립트
"""
import mysql.connector

def modify_users_table():
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
        
        print("📋 현재 users 테이블 구조 확인 중...")
        cursor.execute("DESCRIBE users")
        columns = cursor.fetchall()
        
        # name 컬럼 찾기
        name_column = None
        for col in columns:
            if col[0] == 'name':
                name_column = col
                break
        
        if name_column:
            field, type_, null, key, default, extra = name_column
            print(f"현재 name 컬럼: {field} {type_} NULL={null}")
            
            if null == 'NO':
                print("🔧 name 컬럼을 NULL 허용으로 변경 중...")
                cursor.execute("ALTER TABLE users MODIFY COLUMN name VARCHAR(100) NULL")
                conn.commit()
                print("✅ name 컬럼이 NULL 허용으로 변경되었습니다.")
            else:
                print("✅ name 컬럼은 이미 NULL을 허용합니다.")
        else:
            print("❌ name 컬럼을 찾을 수 없습니다.")
        
        # username 컬럼도 확인
        username_column = None
        for col in columns:
            if col[0] == 'username':
                username_column = col
                break
        
        if username_column:
            field, type_, null, key, default, extra = username_column
            print(f"현재 username 컬럼: {field} {type_} NULL={null}")
            
            if null == 'NO':
                print("🔧 username 컬럼을 NULL 허용으로 변경 중...")
                cursor.execute("ALTER TABLE users MODIFY COLUMN username VARCHAR(50) NULL")
                conn.commit()
                print("✅ username 컬럼이 NULL 허용으로 변경되었습니다.")
            else:
                print("✅ username 컬럼은 이미 NULL을 허용합니다.")
        
        # 변경 후 구조 확인
        print("\n📋 변경 후 테이블 구조:")
        cursor.execute("DESCRIBE users")
        columns = cursor.fetchall()
        for col in columns:
            if col[0] in ['name', 'username', 'email']:
                field, type_, null, key, default, extra = col
                print(f"{field:<15} {type_:<15} NULL={null}")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ 오류 발생: {e}")

if __name__ == "__main__":
    modify_users_table()
