import { type NextRequest, NextResponse } from "next/server"
import { updateUser, getUserById } from "@/lib/database"

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, name, email, bio, blockedGenres, blockedTags, ...otherFields } = body

    console.log("📝 프로필 업데이트 요청:", body)

    // 입력값 검증
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // 현재 사용자 정보 확인
    const currentUser = await getUserById(userId)
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log("👤 현재 사용자:", {
      id: currentUser.id,
      name: currentUser.name,
      bio: currentUser.bio,
      blocked_genres: currentUser.blocked_genres,
      blocked_tags: currentUser.blocked_tags
    })

    // 업데이트할 데이터 준비
    const updateData: any = {}

    if (name !== undefined) updateData.name = name
    if (email !== undefined) updateData.email = email
    if (bio !== undefined) updateData.bio = bio
    if (blockedGenres !== undefined) updateData.blocked_genres = blockedGenres
    if (blockedTags !== undefined) updateData.blocked_tags = blockedTags

    // 기타 필드들도 포함
    Object.keys(otherFields).forEach(key => {
      if (otherFields[key] !== undefined) {
        updateData[key] = otherFields[key]
      }
    })

    console.log("🔄 업데이트할 데이터:", updateData)

    // 데이터베이스 업데이트
    const success = await updateUser(userId, updateData)

    if (success) {
      // 업데이트된 사용자 정보 조회
      const updatedUser = await getUserById(userId)
      
      console.log("✅ 업데이트 성공:", updatedUser)

      return NextResponse.json({ 
        success: true, 
        message: "Profile updated successfully",
        user: updatedUser
      })
    } else {
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
    }

  } catch (error) {
    console.error("❌ Profile update error:", error)
    return NextResponse.json({ 
      error: "Failed to update profile",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const user = await getUserById(parseInt(userId))

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // 비밀번호 해시 제거
    const { password_hash, ...userResponse } = user

    return NextResponse.json({ 
      success: true, 
      user: userResponse
    })

  } catch (error) {
    console.error("❌ Profile fetch error:", error)
    return NextResponse.json({ 
      error: "Failed to fetch profile",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
