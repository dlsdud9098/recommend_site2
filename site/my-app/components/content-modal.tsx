"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Heart, Eye, BookOpen, ExternalLink } from "lucide-react"
import Image from "next/image"
import type { ContentItem } from "@/lib/database"
import { useAuth } from "@/lib/auth-context"
import { formatNumber } from "@/lib/utils"
import { useState } from "react"

interface ContentModalProps {
  content: ContentItem | null
  isOpen: boolean
  onClose: () => void
}

// 이미지 URL 처리 함수
function processImageUrl(url: string | undefined): string {
  if (!url) return "/placeholder.svg"
  
  // 프로토콜 상대 URL (//) 처리
  if (url.startsWith('//')) {
    return `https:${url}`
  }
  
  // 이미 절대 URL인 경우
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  
  // 상대 경로인 경우
  if (url.startsWith('/')) {
    return url
  }
  
  // 기본값
  return "/placeholder.svg"
}

// 이미지 컴포넌트 (오류 처리 포함)
function ContentImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  const processedSrc = processImageUrl(src)
  
  if (imageError) {
    return (
      <div className={`bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-sm font-bold text-gray-600">{alt.slice(0, 2)}</span>
          </div>
          <p className="text-xs text-gray-600 font-medium">{alt}</p>
        </div>
      </div>
    )
  }
  
  return (
    <>
      {isLoading && (
        <div className={`absolute inset-0 bg-gray-200 animate-pulse ${className}`} />
      )}
      <Image
        src={processedSrc}
        alt={alt}
        fill
        className={className}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImageError(true)
          setIsLoading(false)
        }}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
      />
    </>
  )
}

interface ContentModalProps {
  content: ContentItem | null
  isOpen: boolean
  onClose: () => void
}

export default function ContentModal({ content, isOpen, onClose }: ContentModalProps) {
  const { user, toggleFavorite } = useAuth()

  if (!content) return null

  const isFavorite = user?.favoriteWorks.includes(content.id.toString()) || false

  const handleFavoriteToggle = () => {
    if (user) {
      toggleFavorite(content.id.toString())
    }
  }

  const handleVisitSite = () => {
    const url = content.url || content.siteUrl
    if (url) {
      window.open(url, "_blank")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{content.title}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="aspect-[3/4] relative">
              <ContentImage
                src={content.coverImage || content.img || ""}
                alt={content.title}
                className="object-cover rounded-lg"
              />
            </div>
          </div>

          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant={content.type === "webtoon" ? "default" : "secondary"} className="text-sm">
                {content.type === "webtoon" ? "웹툰" : "소설"}
              </Badge>
              {user && (
                <Button variant="ghost" size="sm" onClick={handleFavoriteToggle}>
                  <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
                </Button>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">작가</h3>
              <p className="text-muted-foreground">{content.author || '니명'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{(content.rating || content.recommend || 0).toFixed(1)}</span>
                <span className="text-muted-foreground">평점</span>
              </div>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4" />
                <span className="font-medium">{content.page_count || 0}{content.page_unit || '화'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4" />
                <span className="font-medium">{formatNumber(content.views || content.viewers || 0)}</span>
                <span className="text-muted-foreground">조회수</span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">장르</h3>
              <Badge variant="outline">{content.genre || '기타'}</Badge>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">태그</h3>
              <div className="flex flex-wrap gap-2">
                {(content.tags || content.keywords || []).slice(0, 10).map((tag, index) => (
                  <Badge key={`${tag}-${index}`} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">줄거리</h3>
              <p className="text-muted-foreground leading-relaxed">
                {content.description || content.summary || '줄거리가 없습니다.'}
              </p>
            </div>

            <div className="pt-4">
              <Button onClick={handleVisitSite} className="w-full">
                <ExternalLink className="mr-2 h-4 w-4" />
                작품 보러가기
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
