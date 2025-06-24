import { type NextRequest, NextResponse } from "next/server"
import { getUserByEmail } from "@/lib/database"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // 입력값 검증
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // 사용자 조회
    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // 비밀번호 검증 (간단한 해싱 방식)
    const passwordHash = crypto.createHash('sha256').update(password + 'your_salt_here').digest('hex')
    
    if (user.password_hash !== passwordHash) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // 로그인 성공 - 민감한 정보 제거
    const { password_hash, ...userResponse } = user

    return NextResponse.json({ 
      success: true, 
      message: "Login successful",
      user: userResponse
    })

  } catch (error) {
    console.error("Login Error:", error)
    return NextResponse.json({ error: "Failed to login" }, { status: 500 })
  }
}
