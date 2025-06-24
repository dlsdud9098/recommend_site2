"""
데이터베이스의 콘텐츠 확인 스크립트
"""
import mysql.connector

def check_content_data():
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
        
        # 테이블 존재 확인
        cursor.execute("SHOW TABLES")
        tables = [table[0] for table in cursor.fetchall()]
        print(f"📋 존재하는 테이블들: {tables}")
        
        # 각 테이블의 데이터 개수 확인
        if 'novels' in tables:
            cursor.execute("SELECT COUNT(*) FROM novels")
            novel_count = cursor.fetchone()[0]
            print(f"📚 소설 개수: {novel_count}")
            
            if novel_count > 0:
                cursor.execute("SELECT id, title, author, recommend FROM novels LIMIT 5")
                novels = cursor.fetchall()
                print("📝 소설 샘플:")
                for novel in novels:
                    print(f"  - ID: {novel[0]}, 제목: {novel[1]}, 작가: {novel[2]}, 추천: {novel[3]}")
        
        if 'webtoons' in tables:
            cursor.execute("SELECT COUNT(*) FROM webtoons")
            webtoon_count = cursor.fetchone()[0]
            print(f"🎨 웹툰 개수: {webtoon_count}")
            
            if webtoon_count > 0:
                cursor.execute("SELECT id, title, author, recommend FROM webtoons LIMIT 5")
                webtoons = cursor.fetchall()
                print("📝 웹툰 샘플:")
                for webtoon in webtoons:
                    print(f"  - ID: {webtoon[0]}, 제목: {webtoon[1]}, 작가: {webtoon[2]}, 추천: {webtoon[3]}")
        
        # 총 콘텐츠 수
        total_count = 0
        if 'novels' in tables:
            cursor.execute("SELECT COUNT(*) FROM novels")
            total_count += cursor.fetchone()[0]
        if 'webtoons' in tables:
            cursor.execute("SELECT COUNT(*) FROM webtoons")
            total_count += cursor.fetchone()[0]
        
        print(f"\n📊 총 콘텐츠 수: {total_count}")
        
        if total_count == 0:
            print("\n❌ 콘텐츠 데이터가 없습니다!")
            print("다음 명령어로 데이터를 추가하세요:")
            print("  1. python3 import_data.py")
            print("  2. python3 complete_db_setup.py")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ 오류 발생: {e}")

if __name__ == "__main__":
    check_content_data()
