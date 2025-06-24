"""
더미 데이터 삭제 스크립트
"""

import mysql.connector

def clear_dummy_data():
    """더미 데이터 삭제"""
    print("=== 더미 데이터 삭제 시작 ===")
    
    try:
        conn = mysql.connector.connect(
            host='localhost',
            user='root',
            password='1234567890',
            database='webtoon_novel_db',
            charset='utf8mb4'
        )
        
        cursor = conn.cursor()
        
        # 1. 현재 사용자 목록 확인
        print("1. 현재 사용자 목록 확인:")
        cursor.execute("SELECT id, name, email, created_at FROM users ORDER BY created_at")
        users = cursor.fetchall()
        
        if users:
            print("현재 사용자 목록:")
            for user in users:
                print(f"  ID: {user[0]}, 이름: {user[1]}, 이메일: {user[2]}, 생성일: {user[3]}")
        else:
            print("사용자가 없습니다.")
        
        # 2. 더미/테스트 사용자들 삭제
        print("\n2. 더미/테스트 사용자 삭제 중...")
        
        # 더미 이메일 패턴들
        dummy_patterns = [
            '%test%',
            '%asdf%', 
            '%example.com%',
            '%dummy%',
            '%sample%',
            '테스트%'
        ]
        
        total_deleted = 0
        for pattern in dummy_patterns:
            cursor.execute("DELETE FROM users WHERE email LIKE %s OR name LIKE %s", (pattern, pattern))
            deleted_count = cursor.rowcount
            if deleted_count > 0:
                print(f"  패턴 '{pattern}': {deleted_count}개 삭제")
                total_deleted += deleted_count
        
        # 3. 특정 더미 이메일들 직접 삭제
        specific_dummy_emails = [
            'test@example.com',
            'asdf@asdf.com',
            'hong@example.com',
            'newuser@test.com'
        ]
        
        for email in specific_dummy_emails:
            cursor.execute("DELETE FROM users WHERE email = %s", (email,))
            if cursor.rowcount > 0:
                print(f"  이메일 '{email}': 삭제됨")
                total_deleted += cursor.rowcount
        
        conn.commit()
        print(f"\n총 {total_deleted}개의 더미 사용자가 삭제되었습니다.")
        
        # 4. 삭제 후 남은 사용자 확인
        print("\n3. 삭제 후 남은 사용자:")
        cursor.execute("SELECT id, name, email, created_at FROM users ORDER BY created_at")
        remaining_users = cursor.fetchall()
        
        if remaining_users:
            print("남은 사용자 목록:")
            for user in remaining_users:
                print(f"  ID: {user[0]}, 이름: {user[1]}, 이메일: {user[2]}, 생성일: {user[3]}")
        else:
            print("모든 사용자가 삭제되었습니다.")
        
        cursor.close()
        conn.close()
        
        print("\n✅ 더미 데이터 삭제 완료!")
        
    except mysql.connector.Error as err:
        print(f"❌ 데이터베이스 오류: {err}")
    except Exception as e:
        print(f"❌ 일반 오류: {e}")

def clear_sample_content():
    """샘플 컨텐츠 데이터 삭제"""
    print("\n=== 샘플 컨텐츠 삭제 시작 ===")
    
    try:
        conn = mysql.connector.connect(
            host='localhost',
            user='root',
            password='1234567890',
            database='webtoon_novel_db',
            charset='utf8mb4'
        )
        
        cursor = conn.cursor()
        
        # 샘플 소설 삭제
        sample_novel_titles = [
            '%마법사의 탑%',
            '%시간 여행자의 일기%',
            '%테스트%',
            '%샘플%',
            '%더미%'
        ]
        
        total_novels_deleted = 0
        for pattern in sample_novel_titles:
            cursor.execute("DELETE FROM novels WHERE title LIKE %s", (pattern,))
            deleted_count = cursor.rowcount
            if deleted_count > 0:
                print(f"  소설 패턴 '{pattern}': {deleted_count}개 삭제")
                total_novels_deleted += deleted_count
        
        # 샘플 웹툰 삭제
        sample_webtoon_titles = [
            '%용사의 귀환%',
            '%테스트%',
            '%샘플%',
            '%더미%'
        ]
        
        total_webtoons_deleted = 0
        for pattern in sample_webtoon_titles:
            cursor.execute("DELETE FROM webtoons WHERE title LIKE %s", (pattern,))
            deleted_count = cursor.rowcount
            if deleted_count > 0:
                print(f"  웹툰 패턴 '{pattern}': {deleted_count}개 삭제")
                total_webtoons_deleted += deleted_count
        
        conn.commit()
        
        print(f"\n총 {total_novels_deleted}개의 샘플 소설이 삭제되었습니다.")
        print(f"총 {total_webtoons_deleted}개의 샘플 웹툰이 삭제되었습니다.")
        
        # 남은 컨텐츠 확인
        cursor.execute("SELECT COUNT(*) FROM novels")
        novel_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM webtoons") 
        webtoon_count = cursor.fetchone()[0]
        
        print(f"\n남은 컨텐츠:")
        print(f"  소설: {novel_count}개")
        print(f"  웹툰: {webtoon_count}개")
        
        cursor.close()
        conn.close()
        
        print("\n✅ 샘플 컨텐츠 삭제 완료!")
        
    except mysql.connector.Error as err:
        print(f"❌ 데이터베이스 오류: {err}")

def main():
    """메인 함수"""
    print("🗑️ 프로젝트 더미 데이터 전체 삭제")
    print("=" * 50)
    
    # 1. 더미 사용자 삭제
    clear_dummy_data()
    
    # 2. 샘플 컨텐츠 삭제
    clear_sample_content()
    
    print("\n" + "=" * 50)
    print("🎉 모든 더미 데이터 삭제 완료!")
    print("\n📋 확인 사항:")
    print("1. 실제 크롤링한 데이터는 보존됨")
    print("2. 테스트용 사용자 계정들 삭제됨") 
    print("3. 샘플 소설/웹툰 데이터 삭제됨")
    print("\n✨ 이제 깨끗한 상태에서 실제 사용자 등록 가능!")

if __name__ == "__main__":
    main()
