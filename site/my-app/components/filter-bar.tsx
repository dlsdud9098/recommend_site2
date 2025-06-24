"use client"

import type React from "react"

import { useState, useCallback, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, X, Plus } from "lucide-react"
import type { FilterState } from "@/app/page"

interface FilterBarProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
}

export default function FilterBar({ filters, onFiltersChange }: FilterBarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [tempGenreInput, setTempGenreInput] = useState("")
  const [tempTagInput, setTempTagInput] = useState("")
  
  // ref를 사용하여 포커스 유지
  const genreInputRef = useRef<HTMLInputElement>(null)
  const tagInputRef = useRef<HTMLInputElement>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const authorInputRef = useRef<HTMLInputElement>(null)

  const updateFilter = useCallback(
    (key: keyof FilterState, value: string | "AND" | "OR") => {
      onFiltersChange({
        ...filters,
        [key]: value,
      })
    },
    [filters, onFiltersChange],
  )

  const removeFilter = useCallback(
    (key: keyof FilterState) => {
      onFiltersChange({
        ...filters,
        [key]: "",
      })
    },
    [filters, onFiltersChange],
  )

  const addGenre = useCallback(() => {
    if (tempGenreInput.trim()) {
      const currentGenres = filters.genre
        .split(",")
        .map((g) => g.trim())
        .filter(Boolean)

      if (!currentGenres.includes(tempGenreInput.trim())) {
        const newGenres = [...currentGenres, tempGenreInput.trim()]
        updateFilter("genre", newGenres.join(", "))
      }
      setTempGenreInput("")
      // 포커스를 다시 input으로 이동
      setTimeout(() => {
        genreInputRef.current?.focus()
      }, 0)
    }
  }, [tempGenreInput, filters.genre, updateFilter])

  const addTag = useCallback(() => {
    if (tempTagInput.trim()) {
      const currentTags = filters.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)

      if (!currentTags.includes(tempTagInput.trim())) {
        const newTags = [...currentTags, tempTagInput.trim()]
        updateFilter("tags", newTags.join(", "))
      }
      setTempTagInput("")
      // 포커스를 다시 input으로 이동
      setTimeout(() => {
        tagInputRef.current?.focus()
      }, 0)
    }
  }, [tempTagInput, filters.tags, updateFilter])

  const removeTagFilter = useCallback(
    (tagToRemove: string) => {
      const currentTags = filters.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
      const newTags = currentTags.filter((tag) => tag !== tagToRemove)
      updateFilter("tags", newTags.join(", "))
    },
    [filters.tags, updateFilter],
  )

  const removeGenreFilter = useCallback(
    (genreToRemove: string) => {
      const currentGenres = filters.genre
        .split(",")
        .map((g) => g.trim())
        .filter(Boolean)
      const newGenres = currentGenres.filter((genre) => genre !== genreToRemove)
      updateFilter("genre", newGenres.join(", "))
    },
    [filters.genre, updateFilter],
  )

  const clearAllFilters = useCallback(() => {
    onFiltersChange({
      type: filters.type,
      title: "",
      author: "",
      tags: "",
      genre: "",
      genreOperator: "AND",
      tagOperator: "AND",
      minEpisodes: "",
      maxEpisodes: "",
      minRating: "",
      maxRating: "",
    })
    setTempGenreInput("")
    setTempTagInput("")
  }, [filters.type, onFiltersChange])

  const handleGenreKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addGenre()
    }
  }, [addGenre])

  const handleTagKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addTag()
    }
  }, [addTag])

  // 활성 필터들 계산
  const getActiveFilters = useCallback(() => {
    const active = []

    if (filters.title) active.push({ key: "title", label: "제목", value: filters.title })
    if (filters.author) active.push({ key: "author", label: "작가", value: filters.author })
    if (filters.minEpisodes)
      active.push({ key: "minEpisodes", label: "최소 화수", value: `${filters.minEpisodes}화 이상` })
    if (filters.maxEpisodes)
      active.push({ key: "maxEpisodes", label: "최대 화수", value: `${filters.maxEpisodes}화 이하` })
    if (filters.minRating) active.push({ key: "minRating", label: "최소 평점", value: `${filters.minRating}점 이상` })
    if (filters.maxRating) active.push({ key: "maxRating", label: "최대 평점", value: `${filters.maxRating}점 이하` })

    return active
  }, [filters])

  const getActiveTagFilters = useCallback(() => {
    if (!filters.tags) return []
    return filters.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
  }, [filters.tags])

  const getActiveGenreFilters = useCallback(() => {
    if (!filters.genre) return []
    return filters.genre
      .split(",")
      .map((g) => g.trim())
      .filter(Boolean)
  }, [filters.genre])

  const activeFilters = getActiveFilters()
  const activeTagFilters = getActiveTagFilters()
  const activeGenreFilters = getActiveGenreFilters()
  const hasActiveFilters = activeFilters.length > 0 || activeTagFilters.length > 0 || activeGenreFilters.length > 0

  const FilterContent = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="filter-title">작품 제목</Label>
          <Input
            ref={titleInputRef}
            id="filter-title"
            placeholder="작품 제목을 입력하세요"
            value={filters.title}
            onChange={(e) => updateFilter("title", e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="filter-author">작가</Label>
          <Input
            ref={authorInputRef}
            id="filter-author"
            placeholder="작가명을 입력하세요"
            value={filters.author}
            onChange={(e) => updateFilter("author", e.target.value)}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="filter-genre">장르 추가</Label>
            {activeGenreFilters.length > 1 && (
              <Select value={filters.genreOperator} onValueChange={(value: "AND" | "OR") => updateFilter("genreOperator", value)}>
                <SelectTrigger className="w-20 h-7">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AND">AND</SelectItem>
                  <SelectItem value="OR">OR</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="flex gap-2">
            <Input
              ref={genreInputRef}
              id="filter-genre"
              placeholder="장르를 입력하고 Enter 또는 + 버튼을 누르세요"
              value={tempGenreInput}
              onChange={(e) => setTempGenreInput(e.target.value)}
              onKeyDown={handleGenreKeyDown}
            />
            <Button type="button" size="sm" onClick={addGenre} disabled={!tempGenreInput.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {activeGenreFilters.length > 0 && (
            <div className="mt-2">
              <div className="flex flex-wrap gap-2">
                {activeGenreFilters.map((genre, index) => (
                  <div key={`genre-${genre}-${index}`} className="flex items-center gap-1">
                    {index > 0 && (
                      <span className="text-xs text-muted-foreground font-medium px-1">
                        {filters.genreOperator}
                      </span>
                    )}
                    <Badge variant="outline" className="flex items-center gap-1">
                      <span className="text-xs">{genre}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 w-4 h-4 hover:bg-transparent"
                        onClick={() => removeGenreFilter(genre)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="filter-tags">태그 추가</Label>
            {activeTagFilters.length > 1 && (
              <Select value={filters.tagOperator} onValueChange={(value: "AND" | "OR") => updateFilter("tagOperator", value)}>
                <SelectTrigger className="w-20 h-7">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AND">AND</SelectItem>
                  <SelectItem value="OR">OR</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="flex gap-2">
            <Input
              ref={tagInputRef}
              id="filter-tags"
              placeholder="태그를 입력하고 Enter 또는 + 버튼을 누르세요"
              value={tempTagInput}
              onChange={(e) => setTempTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
            />
            <Button type="button" size="sm" onClick={addTag} disabled={!tempTagInput.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {activeTagFilters.length > 0 && (
            <div className="mt-2">
              <div className="flex flex-wrap gap-2">
                {activeTagFilters.map((tag, index) => (
                  <div key={`tag-${tag}-${index}`} className="flex items-center gap-1">
                    {index > 0 && (
                      <span className="text-xs text-muted-foreground font-medium px-1">
                        {filters.tagOperator}
                      </span>
                    )}
                    <Badge variant="default" className="flex items-center gap-1">
                      <span className="text-xs">{tag}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 w-4 h-4 hover:bg-transparent text-white hover:text-white"
                        onClick={() => removeTagFilter(tag)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="filter-min-episodes">최소 화수</Label>
            <Input
              id="filter-min-episodes"
              type="number"
              placeholder="최소"
              value={filters.minEpisodes}
              onChange={(e) => updateFilter("minEpisodes", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="filter-max-episodes">최대 화수</Label>
            <Input
              id="filter-max-episodes"
              type="number"
              placeholder="최대"
              value={filters.maxEpisodes}
              onChange={(e) => updateFilter("maxEpisodes", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="filter-min-rating">최소 평점</Label>
            <Input
              id="filter-min-rating"
              type="number"
              step="0.1"
              min="0"
              max="5"
              placeholder="0.0"
              value={filters.minRating}
              onChange={(e) => updateFilter("minRating", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="filter-max-rating">최대 평점</Label>
            <Input
              id="filter-max-rating"
              type="number"
              step="0.1"
              min="0"
              max="5"
              placeholder="5.0"
              value={filters.maxRating}
              onChange={(e) => updateFilter("maxRating", e.target.value)}
            />
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-sm font-medium">활성 필터</Label>
            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs">
              모두 지우기
            </Button>
          </div>

          <div className="space-y-2">
            {/* 일반 필터들 */}
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <Badge key={filter.key} variant="secondary" className="flex items-center gap-1">
                  <span className="text-xs">
                    {filter.label}: {filter.value}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 w-4 h-4 hover:bg-transparent"
                    onClick={() => removeFilter(filter.key as keyof FilterState)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="relative">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="relative">
            <Filter className="mr-2 h-4 w-4" />
            필터
            {hasActiveFilters && (
              <Badge className="ml-2 h-5 w-5 p-0 text-xs">
                {activeFilters.length + activeTagFilters.length + activeGenreFilters.length}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[400px] sm:w-[500px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>필터</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <FilterContent />
          </div>
        </SheetContent>
      </Sheet>

      {/* 활성 필터 표시 (메인 페이지용) */}
      {hasActiveFilters && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-muted-foreground">활성 필터</Label>
            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs h-6">
              모두 지우기
            </Button>
          </div>

          <div className="space-y-2">
            {/* 일반 필터들 */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {activeFilters.map((filter) => (
                  <Badge key={filter.key} variant="secondary" className="flex items-center gap-1">
                    <span className="text-xs">
                      {filter.label}: {filter.value}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 w-4 h-4 hover:bg-transparent"
                      onClick={() => removeFilter(filter.key as keyof FilterState)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}

            {/* 장르 필터들 */}
            {activeGenreFilters.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {activeGenreFilters.map((genre, index) => (
                  <div key={`genre-main-${genre}-${index}`} className="flex items-center gap-1">
                    {index > 0 && (
                      <span className="text-xs text-muted-foreground font-medium px-1">
                        {filters.genreOperator}
                      </span>
                    )}
                    <Badge variant="outline" className="flex items-center gap-1">
                      <span className="text-xs">장르: {genre}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 w-4 h-4 hover:bg-transparent"
                        onClick={() => removeGenreFilter(genre)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            {/* 태그 필터들 */}
            {activeTagFilters.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {activeTagFilters.map((tag, index) => (
                  <div key={`tag-main-${tag}-${index}`} className="flex items-center gap-1">
                    {index > 0 && (
                      <span className="text-xs text-muted-foreground font-medium px-1">
                        {filters.tagOperator}
                      </span>
                    )}
                    <Badge variant="default" className="flex items-center gap-1">
                      <span className="text-xs">태그: {tag}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 w-4 h-4 hover:bg-transparent text-white hover:text-white"
                        onClick={() => removeTagFilter(tag)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
