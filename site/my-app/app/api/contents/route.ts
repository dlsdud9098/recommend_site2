import { type NextRequest, NextResponse } from "next/server"
import { getContents } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // 쿼리 파라미터 파싱
    const type = searchParams.get("type") as "all" | "webtoon" | "novel" || "all"
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = parseInt(searchParams.get("offset") || "0")
    const sortBy = searchParams.get("sortBy") as "popularity" | "rating" | "views" | "recommend" | "newest" | "viewers" || "popularity"
    const showAdultContent = searchParams.get("showAdultContent") === "true"
    
    // 필터 파라미터 추가
    const title = searchParams.get("title") || undefined
    const author = searchParams.get("author") || undefined
    const genre = searchParams.get("genre") || undefined // 쉼표로 구분된 문자열
    const genreOperator = searchParams.get("genreOperator") as "AND" | "OR" || "AND"
    const tags = searchParams.getAll("tags").filter(Boolean)
    const tagOperator = searchParams.get("tagOperator") as "AND" | "OR" || "AND"
    const minEpisodes = searchParams.get("minEpisodes") ? parseInt(searchParams.get("minEpisodes")!) : undefined
    const maxEpisodes = searchParams.get("maxEpisodes") ? parseInt(searchParams.get("maxEpisodes")!) : undefined
    const minRating = searchParams.get("minRating") ? parseFloat(searchParams.get("minRating")!) : undefined
    const maxRating = searchParams.get("maxRating") ? parseFloat(searchParams.get("maxRating")!) : undefined
    const blockedGenres = searchParams.getAll("blockedGenres").filter(Boolean)
    const blockedTags = searchParams.getAll("blockedTags").filter(Boolean)
    
    console.log("📋 API 요청 파라미터:", { 
      type, limit, offset, sortBy, 
      title, author, genre, genreOperator, tags, tagOperator, 
      minEpisodes, maxEpisodes, minRating, maxRating,
      blockedGenres, blockedTags
    })

    // 데이터베이스에서 콘텐츠 조회
    const contents = await getContents({
      type,
      limit,
      offset,
      sortBy,
      showAdultContent,
      title,
      author,
      genre,
      genreOperator,
      tags,
      tagOperator,
      minEpisodes,
      maxEpisodes,
      minRating,
      maxRating,
      blockedGenres,
      blockedTags
    })

    console.log(`✅ API 응답: ${contents.length}개 콘텐츠`)

    return NextResponse.json({
      success: true,
      data: contents,
      pagination: {
        total: contents.length,
        limit,
        offset,
        hasMore: contents.length === limit
      }
    })

  } catch (error) {
    console.error("❌ Contents API Error:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch contents",
        details: error instanceof Error ? error.message : "Unknown error"
      }, 
      { status: 500 }
    )
  }
}
