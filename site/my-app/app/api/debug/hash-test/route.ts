import { NextResponse } from "next/server"
import bcrypt from "bcrypt"

export async function POST(request: Request) {
  try {
    const { testPassword } = await request.json()
    
    console.log("=== 암호화 과정 테스트 시작 ===")
    console.log("테스트 비밀번호:", testPassword)
    
    if (!testPassword) {
      return NextResponse.json({ error: "Test password required" }, { status: 400 })
    }
    
    // 1. 회원가입 시와 동일한 방식으로 해싱 (saltRounds = 12)
    console.log("1. 회원가입 방식으로 해싱...")
    const saltRounds = 12
    const registrationHash = await bcrypt.hash(testPassword, saltRounds)
    
    console.log("회원가입 해시 생성:")
    console.log("- 길이:", registrationHash.length)
    console.log("- 전체:", registrationHash)
    console.log("- 시작 부분:", registrationHash.substring(0, 29))
    
    // 2. 동일한 비밀번호로 다시 해싱 (bcrypt는 매번 다른 해시 생성)
    console.log("\n2. 같은 비밀번호 다시 해싱...")
    const secondHash = await bcrypt.hash(testPassword, saltRounds)
    
    console.log("두 번째 해시:")
    console.log("- 길이:", secondHash.length)
    console.log("- 전체:", secondHash)
    console.log("- 시작 부분:", secondHash.substring(0, 29))
    
    // 3. 두 해시가 다른지 확인
    const hashesAreDifferent = registrationHash !== secondHash
    console.log("\n3. 해시 비교:")
    console.log("- 두 해시가 다른가?", hashesAreDifferent)
    
    // 4. 로그인 시와 동일한 방식으로 비교
    console.log("\n4. 로그인 방식으로 비교 테스트...")
    
    const match1 = await bcrypt.compare(testPassword, registrationHash)
    const match2 = await bcrypt.compare(testPassword, secondHash)
    
    console.log("- 원본 비밀번호 vs 첫 번째 해시:", match1)
    console.log("- 원본 비밀번호 vs 두 번째 해시:", match2)
    
    // 5. 잘못된 비밀번호로 테스트
    console.log("\n5. 잘못된 비밀번호 테스트...")
    const wrongPassword = testPassword + "wrong"
    const wrongMatch = await bcrypt.compare(wrongPassword, registrationHash)
    console.log(`- "${wrongPassword}" vs 해시:`, wrongMatch)
    
    // 6. Salt 정보 분석
    console.log("\n6. Salt 정보 분석:")
    const saltInfo1 = registrationHash.substring(0, 29) // $2b$12$ + 22자 salt
    const saltInfo2 = secondHash.substring(0, 29)
    
    console.log("- 첫 번째 해시 salt:", saltInfo1)
    console.log("- 두 번째 해시 salt:", saltInfo2)
    console.log("- Salt가 다른가?", saltInfo1 !== saltInfo2)
    
    return NextResponse.json({
      success: true,
      testPassword: testPassword,
      results: {
        registrationHash: {
          full: registrationHash,
          length: registrationHash.length,
          prefix: registrationHash.substring(0, 29)
        },
        secondHash: {
          full: secondHash,
          length: secondHash.length,
          prefix: secondHash.substring(0, 29)
        },
        comparisons: {
          hashesAreDifferent: hashesAreDifferent,
          originalVsFirst: match1,
          originalVsSecond: match2,
          wrongPasswordMatch: wrongMatch
        },
        salts: {
          first: saltInfo1,
          second: saltInfo2,
          saltsAreDifferent: saltInfo1 !== saltInfo2
        }
      }
    })
    
  } catch (error) {
    console.error("암호화 테스트 오류:", error)
    return NextResponse.json({ 
      error: "Test failed", 
      details: error.message 
    }, { status: 500 })
  }
}
