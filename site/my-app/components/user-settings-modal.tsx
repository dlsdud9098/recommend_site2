"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Shield, Settings, X, Plus } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import AdultVerificationModal from "./adult-verification-modal"

interface UserSettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function UserSettingsModal({ isOpen, onClose }: UserSettingsModalProps) {
  const { user, updateUserSettings, verifyAdult, toggleAdultContent } = useAuth()
  const [showAdultVerification, setShowAdultVerification] = useState(false)
  const [blockedGenresInput, setBlockedGenresInput] = useState("")
  const [blockedTagsInput, setBlockedTagsInput] = useState("")

  const handleAddBlockedGenre = useCallback(() => {
    if (!user) return
    if (blockedGenresInput.trim()) {
      const newGenre = blockedGenresInput.trim()
      if (!user.blockedGenres.includes(newGenre)) {
        const newGenres = [...user.blockedGenres, newGenre]
        updateUserSettings({ blockedGenres: newGenres })
      }
      setBlockedGenresInput("")
    }
  }, [blockedGenresInput, user?.blockedGenres, updateUserSettings])

  const handleRemoveBlockedGenre = useCallback(
    (genre: string) => {
      if (!user) return
      const newGenres = user.blockedGenres.filter((g) => g !== genre)
      updateUserSettings({ blockedGenres: newGenres })
    },
    [user?.blockedGenres, updateUserSettings],
  )

  const handleAddBlockedTag = useCallback(() => {
    if (!user) return
    if (blockedTagsInput.trim()) {
      const newTag = blockedTagsInput.trim()
      if (!user.blockedTags.includes(newTag)) {
        const newTags = [...user.blockedTags, newTag]
        updateUserSettings({ blockedTags: newTags })
      }
      setBlockedTagsInput("")
    }
  }, [blockedTagsInput, user?.blockedTags, updateUserSettings])

  const handleRemoveBlockedTag = useCallback(
    (tag: string) => {
      if (!user) return
      const newTags = user.blockedTags.filter((t) => t !== tag)
      updateUserSettings({ blockedTags: newTags })
    },
    [user?.blockedTags, updateUserSettings],
  )

  const handleAdultContentToggle = (checked: boolean) => {
    if (!user) return
    if (checked && !user.isAdultVerified) {
      setShowAdultVerification(true)
    } else if (user.isAdultVerified) {
      toggleAdultContent(checked)
    }
  }

  const handleGenreKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddBlockedGenre()
    }
  }

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddBlockedTag()
    }
  }

  if (!user) return null

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              사용자 설정
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* 사용자 정보 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5" />내 정보
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>이름</Label>
                  <p className="text-sm text-muted-foreground">{user.name}</p>
                </div>
                <div>
                  <Label>이메일</Label>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* 성인 콘텐츠 설정 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5" />
                성인 콘텐츠 설정
              </h3>

              {!user.isAdultVerified && (
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>성인 콘텐츠를 보시려면 먼저 성인 인증을 완료해주세요.</AlertDescription>
                </Alert>
              )}

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">성인 콘텐츠 표시</Label>
                  <p className="text-sm text-muted-foreground">
                    19세 이용가 작품을 표시합니다
                    {user.isAdultVerified && (
                      <Badge variant="secondary" className="ml-2">
                        <Shield className="h-3 w-3 mr-1" />
                        인증 완료
                      </Badge>
                    )}
                  </p>
                </div>
                <Switch
                  checked={user.showAdultContent}
                  onCheckedChange={handleAdultContentToggle}
                  disabled={!user.isAdultVerified && !user.showAdultContent}
                />
              </div>
            </div>

            <Separator />

            {/* 차단된 장르 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">차단된 장르</h3>
              <div className="flex gap-2">
                <Input
                  id="blocked-genre-input"
                  placeholder="차단할 장르 입력"
                  value={blockedGenresInput}
                  onChange={(e) => setBlockedGenresInput(e.target.value)}
                  onKeyPress={handleGenreKeyPress}
                />
                <Button type="button" onClick={handleAddBlockedGenre}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {user.blockedGenres.map((genre) => (
                  <Badge key={`blocked-genre-${genre}`} variant="destructive" className="flex items-center gap-1">
                    <span>{genre}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 w-4 h-4 hover:bg-transparent text-white hover:text-white"
                      onClick={() => handleRemoveBlockedGenre(genre)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
                {user.blockedGenres.length === 0 && (
                  <p className="text-sm text-muted-foreground">차단된 장르가 없습니다.</p>
                )}
              </div>
            </div>

            <Separator />

            {/* 차단된 태그 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">차단된 태그</h3>
              <div className="flex gap-2">
                <Input
                  id="blocked-tag-input"
                  placeholder="차단할 태그 입력"
                  value={blockedTagsInput}
                  onChange={(e) => setBlockedTagsInput(e.target.value)}
                  onKeyPress={handleTagKeyPress}
                />
                <Button type="button" onClick={handleAddBlockedTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {user.blockedTags.map((tag) => (
                  <Badge key={`blocked-tag-${tag}`} variant="destructive" className="flex items-center gap-1">
                    <span>{tag}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 w-4 h-4 hover:bg-transparent text-white hover:text-white"
                      onClick={() => handleRemoveBlockedTag(tag)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
                {user.blockedTags.length === 0 && (
                  <p className="text-sm text-muted-foreground">차단된 태그가 없습니다.</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={onClose}>확인</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AdultVerificationModal
        isOpen={showAdultVerification}
        onClose={() => setShowAdultVerification(false)}
        onVerify={verifyAdult}
      />
    </>
  )
}
