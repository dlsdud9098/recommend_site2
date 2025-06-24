const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    console.log('MySQL 연결 테스트 시작...');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '1234567890',
      charset: 'utf8mb4'
    });
    
    console.log('✅ MySQL 연결 성공!');
    
    // 데이터베이스 목록 확인
    const [databases] = await connection.execute('SHOW DATABASES');
    console.log('데이터베이스 목록:');
    databases.forEach(db => console.log(`  - ${db.Database}`));
    
    // webtoon_novel_db 확인
    const dbExists = databases.some(db => db.Database === 'webtoon_novel_db');
    console.log(`webtoon_novel_db 존재: ${dbExists ? '✅' : '❌'}`);
    
    if (dbExists) {
      await connection.execute('USE webtoon_novel_db');
      const [tables] = await connection.execute('SHOW TABLES');
      console.log(`테이블 개수: ${tables.length}`);
      tables.forEach(table => console.log(`  - ${Object.values(table)[0]}`));
      
      // users 테이블 구조 확인
      if (tables.some(table => Object.values(table)[0] === 'users')) {
        const [userColumns] = await connection.execute('DESCRIBE users');
        console.log('\nusers 테이블 구조:');
        userColumns.forEach(col => console.log(`  - ${col.Field}: ${col.Type}`));
      }
    }
    
    await connection.end();
    console.log('연결 종료');
    
  } catch (error) {
    console.error('❌ 연결 실패:', error.message);
  }
}

testConnection();
