"""
간단한 데이터베이스 설정 및 회원가입 테스트
"""

import mysql.connector
import json
import bcrypt

def setup_minimal_db():
    """최소한의 데이터베이스 설정"""
    print("=== 데이터베이스 최소 설정 시작 ===")
    
    try:
        # MySQL 연결
        conn = mysql.connector.connect(
            host='localhost',
            user='root',
            password='1234567890',
            charset='utf8mb4'
        )
        
        cursor = conn.cursor()
        
        # 데이터베이스 생성
        cursor.execute("CREATE DATABASE IF NOT EXISTS webtoon_novel_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
        cursor.execute("USE webtoon_novel_db")
        print("✅ 데이터베이스 생성/선택 완료")
        
        # users 테이블 생성 (최소 구조)
        users_table_sql = """
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            is_active BOOLEAN DEFAULT TRUE,
            last_login TIMESTAMP NULL,
            blocked_tags JSON DEFAULT NULL,
            preferences JSON DEFAULT NULL
        )
        """
        
        cursor.execute(users_table_sql)
        print("✅ users 테이블 생성 완료")
        
        # 테이블 구조 확인
        cursor.execute("DESCRIBE users")
        columns = cursor.fetchall()
        print("users 테이블 구조:")
        for col in columns:
            print(f"  - {col[0]}: {col[1]}")
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print("✅ 데이터베이스 설정 완료!")
        return True
        
    except mysql.connector.Error as err:
        print(f"❌ 오류: {err}")
        return False

def test_user_insert():
    """사용자 삽입 테스트"""
    print("\n=== 사용자 삽입 테스트 ===")
    
    try:
        conn = mysql.connector.connect(
            host='localhost',
            user='root',
            password='1234567890',
            database='webtoon_novel_db',
            charset='utf8mb4'
        )
        
        cursor = conn.cursor()
        
        # 테스트 사용자 데이터
        test_user = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpassword123',
            'blocked_tags': ['폭력', '성인'],
            'preferences': {'theme': 'dark', 'notifications': True}
        }
        
        # 비밀번호 해싱
        password_hash = bcrypt.hashpw(test_user['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # 기존 사용자 삭제 (테스트를 위해)
        cursor.execute("DELETE FROM users WHERE email = %s", (test_user['email'],))
        
        # 사용자 삽입
        insert_sql = """
        INSERT INTO users (username, email, password_hash, blocked_tags, preferences)
        VALUES (%s, %s, %s, %s, %s)
        """
        
        params = (
            test_user['username'],
            test_user['email'],
            password_hash,
            json.dumps(test_user['blocked_tags']),
            json.dumps(test_user['preferences'])
        )
        
        cursor.execute(insert_sql, params)
        user_id = cursor.lastrowid
        
        conn.commit()
        print(f"✅ 테스트 사용자 삽입 성공! ID: {user_id}")
        
        # 삽입된 데이터 확인
        cursor.execute("SELECT id, username, email, created_at FROM users WHERE id = %s", (user_id,))
        user_data = cursor.fetchone()
        print(f"삽입된 데이터: {user_data}")
        
        cursor.close()
        conn.close()
        
        return True
        
    except mysql.connector.Error as err:
        print(f"❌ 사용자 삽입 실패: {err}")
        return False

def check_current_users():
    """현재 사용자 목록 확인"""
    print("\n=== 현재 사용자 목록 ===")
    
    try:
        conn = mysql.connector.connect(
            host='localhost',
            user='root',
            password='1234567890',
            database='webtoon_novel_db',
            charset='utf8mb4'
        )
        
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM users")
        user_count = cursor.fetchone()[0]
        print(f"총 사용자 수: {user_count}")
        
        if user_count > 0:
            cursor.execute("SELECT id, username, email, created_at FROM users ORDER BY created_at DESC LIMIT 10")
            users = cursor.fetchall()
            print("최근 사용자 목록:")
            for user in users:
                print(f"  ID: {user[0]}, 사용자명: {user[1]}, 이메일: {user[2]}, 생성일: {user[3]}")
        
        cursor.close()
        conn.close()
        
    except mysql.connector.Error as err:
        print(f"❌ 사용자 조회 실패: {err}")

def main():
    """메인 함수"""
    print("🚀 회원가입 문제 해결을 위한 DB 설정")
    print("=" * 50)
    
    # 1. 데이터베이스 설정
    if not setup_minimal_db():
        print("데이터베이스 설정 실패")
        return
    
    # 2. 사용자 삽입 테스트
    if not test_user_insert():
        print("사용자 삽입 테스트 실패")
        return
    
    # 3. 현재 사용자 확인
    check_current_users()
    
    print("\n" + "=" * 50)
    print("🎉 설정 완료!")
    print("\n📋 다음 단계:")
    print("1. Next.js 서버 실행:")
    print("   cd /home/apic/python/recommend_site/site/my-app")
    print("   npm run dev")
    print("\n2. 회원가입 테스트:")
    print("   http://localhost:3000/register")
    print("\n3. API 직접 테스트:")
    print("   curl -X POST http://localhost:3000/api/auth/register \\")
    print("     -H 'Content-Type: application/json' \\")
    print("     -d '{\"username\":\"newuser\",\"email\":\"new@test.com\",\"password\":\"password123\"}'")

if __name__ == "__main__":
    main()
