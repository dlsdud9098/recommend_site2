import { useState, useEffect, useCallback } from "react"
import type { ContentItem } from "@/lib/database"

interface UseInfiniteContentsProps {
  type: "all" | "webtoon" | "novel"
  title?: string
  author?: string
  genre?: string
  tags?: string[]
  minEpisodes?: number
  maxEpisodes?: number
  minRating?: number
  maxRating?: number
  blockedGenres?: string[]
  blockedTags?: string[]
  sortBy?: string
  showAdultContent?: boolean
}

interface ApiResponse {
  success: boolean
  data: ContentItem[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
  error?: string
}

export function useInfiniteContents(filters: UseInfiniteContentsProps) {
  const [contents, setContents] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [offset, setOffset] = useState(0)

  const LIMIT = 20

  // API 호출 함수
  const fetchContents = useCallback(async (currentOffset: number, reset = false) => {
    if (loading) return

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        type: filters.type,
        limit: LIMIT.toString(),
        offset: currentOffset.toString(),
        sortBy: filters.sortBy || "popularity"
      })

      // 필터 추가
      if (filters.title) params.append("title", filters.title)
      if (filters.author) params.append("author", filters.author)
      if (filters.genre) params.append("genre", filters.genre)
      if (filters.tags && filters.tags.length > 0) {
        filters.tags.forEach(tag => params.append("tags", tag))
      }
      if (filters.minEpisodes) params.append("minEpisodes", filters.minEpisodes.toString())
      if (filters.maxEpisodes) params.append("maxEpisodes", filters.maxEpisodes.toString())
      if (filters.minRating) params.append("minRating", filters.minRating.toString())
      if (filters.maxRating) params.append("maxRating", filters.maxRating.toString())
      if (filters.blockedGenres && filters.blockedGenres.length > 0) {
        filters.blockedGenres.forEach(genre => params.append("blockedGenres", genre))
      }
      if (filters.blockedTags && filters.blockedTags.length > 0) {
        filters.blockedTags.forEach(tag => params.append("blockedTags", tag))
      }
      if (filters.showAdultContent !== undefined) params.append("showAdultContent", filters.showAdultContent.toString())

      console.log("🔍 API 요청:", `/api/contents?${params.toString()}`)

      const response = await fetch(`/api/contents?${params.toString()}`)
      const result: ApiResponse = await response.json()

      console.log("📋 API 응답:", result)

      if (!response.ok || !result.success) {
        throw new Error(result.error || `HTTP ${response.status}`)
      }

      if (reset) {
        setContents(result.data)
      } else {
        setContents(prev => [...prev, ...result.data])
      }

      setTotalCount(result.pagination.total)
      setHasMore(result.data.length === LIMIT && result.pagination.hasMore)
      setOffset(currentOffset + result.data.length)

    } catch (err) {
      console.error("❌ API 오류:", err)
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다")
    } finally {
      setLoading(false)
    }
  }, [filters, loading])

  // 초기 로드 및 필터 변경 시 리셋
  useEffect(() => {
    setOffset(0)
    setHasMore(true)
    fetchContents(0, true)
  }, [
    filters.type, 
    filters.title, 
    filters.author, 
    filters.genre,
    filters.genreOperator,
    filters.tagOperator,
    filters.sortBy, 
    filters.minEpisodes,
    filters.maxEpisodes,
    filters.minRating,
    filters.maxRating,
    filters.showAdultContent,
    JSON.stringify(filters.tags),
    JSON.stringify(filters.blockedGenres),
    JSON.stringify(filters.blockedTags)
  ])

  // 더 많은 콘텐츠 로드
  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      fetchContents(offset, false)
    }
  }, [hasMore, loading, offset, fetchContents])

  return {
    contents,
    loading,
    error,
    hasMore,
    totalCount,
    loadMore
  }
}
