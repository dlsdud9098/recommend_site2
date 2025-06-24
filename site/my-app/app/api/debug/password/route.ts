import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"
import bcrypt from "bcrypt"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    
    console.log("=== 비밀번호 디버깅 시작 ===")
    console.log("이메일:", email)
    
    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 })
    }
    
    // 사용자 조회
    const users = await executeQuery(
      "SELECT id, name, email, username, password_hash, created_at FROM users WHERE email = ?", 
      [email]
    ) as any[]
    
    if (users.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "사용자를 찾을 수 없음"
      })
    }
    
    const user = users[0]
    const passwordHash = user.password_hash
    
    console.log("사용자 정보:")
    console.log("- ID:", user.id)
    console.log("- 이름:", user.name) 
    console.log("- 이메일:", user.email)
    console.log("- 생성일:", user.created_at)
    console.log("- 비밀번호 해시 존재:", !!passwordHash)
    console.log("- 해시 길이:", passwordHash?.length)
    console.log("- 해시 시작부분:", passwordHash?.substring(0, 10))
    
    // bcrypt 해시 형식 검증
    const isBcryptFormat = passwordHash?.startsWith('$2b$') || passwordHash?.startsWith('$2a$')
    console.log("- bcrypt 형식 여부:", isBcryptFormat)
    
    if (!isBcryptFormat) {
      console.log("⚠️ 경고: 저장된 비밀번호가 bcrypt 형식이 아닙니다!")
      console.log("저장된 값:", passwordHash)
    }
    
    // 테스트용 비밀번호들로 검증해보기
    const testPasswords = ["password123", "123456", "test", "asdf"]
    const testResults = []
    
    for (const testPw of testPasswords) {
      try {
        const match = await bcrypt.compare(testPw, passwordHash)
        testResults.push({
          password: testPw,
          match: match
        })
        console.log(`테스트 비밀번호 "${testPw}": ${match ? "일치" : "불일치"}`)
      } catch (error) {
        console.log(`테스트 비밀번호 "${testPw}": 비교 오류 -`, error.message)
        testResults.push({
          password: testPw,
          match: false,
          error: error.message
        })
      }
    }
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at
      },
      passwordInfo: {
        hasHash: !!passwordHash,
        hashLength: passwordHash?.length,
        hashFormat: passwordHash?.substring(0, 10),
        isBcryptFormat: isBcryptFormat,
        testResults: testResults
      }
    })
    
  } catch (error) {
    console.error("비밀번호 디버깅 오류:", error)
    return NextResponse.json({ 
      error: "Debug failed", 
      details: error.message 
    }, { status: 500 })
  }
}
