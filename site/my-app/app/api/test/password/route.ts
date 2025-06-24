import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"
import bcrypt from "bcrypt"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    
    console.log("=== 비밀번호 테스트 시작 ===")
    console.log("테스트 파라미터:", { email, hasPassword: !!password })
    
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }
    
    // 사용자 조회
    const users = await executeQuery(
      "SELECT id, name, email, username, password_hash FROM users WHERE email = ?", 
      [email]
    ) as any[]
    
    if (users.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "사용자를 찾을 수 없음",
        found: false
      })
    }
    
    const user = users[0]
    console.log("DB에서 찾은 사용자:", { 
      id: user.id, 
      name: user.name, 
      email: user.email,
      hasPasswordHash: !!user.password_hash,
      passwordHashLength: user.password_hash?.length
    })
    
    // 비밀번호 비교
    console.log("비밀번호 비교 시작...")
    console.log("입력된 비밀번호:", password)
    console.log("저장된 해시 (처음 10자):", user.password_hash?.substring(0, 10) + "...")
    
    const passwordMatch = await bcrypt.compare(password, user.password_hash)
    console.log("비밀번호 매치 결과:", passwordMatch)
    
    // 테스트용으로 새로운 해시도 생성해보기
    const newHash = await bcrypt.hash(password, 12)
    console.log("새로 생성한 해시 (처음 10자):", newHash.substring(0, 10) + "...")
    
    const newHashMatch = await bcrypt.compare(password, newHash)
    console.log("새 해시와 매치 결과:", newHashMatch)
    
    return NextResponse.json({
      success: true,
      found: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      passwordTest: {
        inputPassword: password,
        storedHashPrefix: user.password_hash?.substring(0, 20),
        passwordMatch: passwordMatch,
        newHashTest: newHashMatch
      }
    })
    
  } catch (error) {
    console.error("비밀번호 테스트 오류:", error)
    return NextResponse.json({ 
      error: "Test failed", 
      details: error.message 
    }, { status: 500 })
  }
}
