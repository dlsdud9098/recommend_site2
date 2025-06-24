import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"

export async function GET() {
  try {
    console.log("=== 데이터베이스 연결 테스트 시작 ===")
    
    // 1. 기본 연결 테스트
    console.log("1. MySQL 버전 확인...")
    const versionResult = await executeQuery("SELECT VERSION() as version")
    console.log("MySQL 버전:", versionResult)
    
    // 2. 현재 데이터베이스 확인
    console.log("2. 현재 데이터베이스 확인...")
    const dbResult = await executeQuery("SELECT DATABASE() as current_db")
    console.log("현재 데이터베이스:", dbResult)
    
    // 3. 테이블 목록 확인
    console.log("3. 테이블 목록 확인...")
    const tablesResult = await executeQuery("SHOW TABLES")
    console.log("테이블 목록:", tablesResult)
    
    // 4. users 테이블 구조 확인
    let usersStructure = null
    try {
      console.log("4. users 테이블 구조 확인...")
      usersStructure = await executeQuery("DESCRIBE users")
      console.log("users 테이블 구조:", usersStructure)
    } catch (error) {
      console.log("users 테이블이 존재하지 않거나 접근할 수 없음:", error.message)
    }
    
    // 5. users 테이블 데이터 개수 및 샘플 확인
    let userCount = null
    let sampleUsers = null
    try {
      console.log("5. users 테이블 데이터 개수 확인...")
      const countResult = await executeQuery("SELECT COUNT(*) as count FROM users")
      userCount = countResult[0]?.count || 0
      console.log("사용자 수:", userCount)
      
      if (userCount > 0) {
        console.log("최근 사용자 샘플 조회...")
        sampleUsers = await executeQuery("SELECT id, name, email, username, created_at FROM users ORDER BY created_at DESC LIMIT 3")
        console.log("샘플 사용자:", sampleUsers)
      }
    } catch (error) {
      console.log("users 테이블 데이터 조회 실패:", error.message)
    }
    
    return NextResponse.json({
      success: true,
      message: "데이터베이스 연결 테스트 성공",
      data: {
        mysqlVersion: versionResult[0]?.version,
        currentDatabase: dbResult[0]?.current_db,
        tables: tablesResult,
        usersStructure: usersStructure,
        userCount: userCount,
        sampleUsers: sampleUsers
      }
    })
    
  } catch (error) {
    console.error("데이터베이스 테스트 실패:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Database connection failed",
        details: {
          message: error.message,
          code: error.code,
          errno: error.errno
        }
      }, 
      { status: 500 }
    )
  }
}
