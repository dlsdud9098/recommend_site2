echo "🚀 회원가입 문제 해결을 위한 설정 시작"
echo "=================================="

# Python 가상환경 활성화 (있다면)
if [ -d "/home/apic/python/recommend_site/.venv" ]; then
    echo "Python 가상환경 활성화..."
    source /home/apic/python/recommend_site/.venv/bin/activate
fi

# MySQL 서비스 상태 확인
echo "MySQL 서비스 상태 확인..."
sudo systemctl status mysql --no-pager -l

# 데이터베이스 설정 실행
echo "데이터베이스 설정 실행..."
cd /home/apic/python/recommend_site/site/my-app

# Python 의존성 설치
echo "Python 의존성 설치..."
pip install mysql-connector-python bcrypt

# 데이터베이스 설정 실행
echo "데이터베이스 초기화..."
python3 fix_registration.py

echo "✅ 설정 완료!"
echo ""
echo "📋 다음 단계:"
echo "1. Next.js 서버 실행:"
echo "   cd /home/apic/python/recommend_site/site/my-app"
echo "   npm run dev"
echo ""
echo "2. 데이터베이스 테스트:"
echo "   curl http://localhost:3000/api/test"
echo ""
echo "3. 회원가입 테스트:"
echo "   http://localhost:3000/register"
