import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"
import bcrypt from "bcrypt"

export async function POST(request: Request) {
  try {
    const { email, newPassword } = await request.json()
    
    console.log("=== 비밀번호 재설정 시작 ===")
    console.log("이메일:", email)
    console.log("새 비밀번호 존재:", !!newPassword)
    
    if (!email || !newPassword) {
      return NextResponse.json({ error: "Email and new password required" }, { status: 400 })
    }
    
    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }
    
    // 사용자 존재 확인
    const users = await executeQuery(
      "SELECT id, name, email FROM users WHERE email = ?", 
      [email]
    ) as any[]
    
    if (users.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "사용자를 찾을 수 없음"
      }, { status: 404 })
    }
    
    const user = users[0]
    
    // 새 비밀번호 해싱
    console.log("새 비밀번호 해싱 중...")
    const saltRounds = 12
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds)
    
    console.log("새 해시 생성됨:")
    console.log("- 길이:", newPasswordHash.length)
    console.log("- 시작부분:", newPasswordHash.substring(0, 10))
    console.log("- bcrypt 형식:", newPasswordHash.startsWith('$2b$'))
    
    // 데이터베이스 업데이트
    const updateResult = await executeQuery(
      "UPDATE users SET password_hash = ? WHERE email = ?",
      [newPasswordHash, email]
    )
    
    console.log("업데이트 결과:", updateResult)
    
    // 즉시 검증
    console.log("새 비밀번호 검증 테스트...")
    const verifyMatch = await bcrypt.compare(newPassword, newPasswordHash)
    console.log("검증 결과:", verifyMatch)
    
    return NextResponse.json({
      success: true,
      message: "비밀번호가 성공적으로 재설정되었습니다",
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      verification: {
        newHashLength: newPasswordHash.length,
        isBcryptFormat: newPasswordHash.startsWith('$2b$'),
        immediateVerification: verifyMatch
      }
    })
    
  } catch (error) {
    console.error("비밀번호 재설정 오류:", error)
    return NextResponse.json({ 
      error: "Password reset failed", 
      details: error.message 
    }, { status: 500 })
  }
}
