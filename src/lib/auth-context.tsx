"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  blockedGenres: string[]
  blockedTags: string[]
  favoriteWorks: string[]
  isAdultVerified: boolean
  showAdultContent: boolean
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  updateUserSettings: (settings: Partial<User>) => Promise<boolean>
  toggleFavorite: (workId: string) => void
  verifyAdult: () => Promise<boolean>
  toggleAdultContent: (show: boolean) => Promise<boolean>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 로컬 스토리지에서 사용자 정보 확인
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log("=== AuthContext login 함수 시작 ===")
    console.log("Login 파라미터:", { email, hasPassword: !!password })
    setIsLoading(true)

    try {
      console.log("/api/auth/login에 POST 요청 시도...")
      
      const requestBody = {
        email: email,
        password: password
      }
      
      console.log("Login request body:", { email, hasPassword: !!password })
      
      // 실제 API 호출
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      console.log("로그인 API 응답 수신:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })

      let data
      try {
        data = await response.json()
        console.log("로그인 API 응답 데이터:", data)
      } catch (parseError) {
        console.error("로그인 JSON 파싱 오류:", parseError)
        setIsLoading(false)
        return false
      }

      if (response.ok && data.success) {
        console.log("로그인 API 성공! 사용자 데이터:", data.user)
        
        // 서버에서 받은 사용자 데이터로 설정
        const userData = {
          id: data.user.id.toString(),
          name: data.user.name,
          email: data.user.email,
          avatar: data.user.avatar || "/placeholder-avatar.jpg",
          blockedGenres: data.user.blockedGenres || [],
          blockedTags: data.user.blockedTags || [],
          favoriteWorks: data.user.favoriteWorks || [],
          isAdultVerified: data.user.isAdultVerified || false,
          showAdultContent: data.user.showAdultContent || false,
        }
        
        setUser(userData)
        localStorage.setItem("user", JSON.stringify(userData))
        setIsLoading(false)
        console.log("로그인 사용자 데이터 설정 완료")
        return true
      } else {
        console.error('로그인 실패 - Response not OK or success false')
        console.error('Status:', response.status, 'Data:', data)
        setIsLoading(false)
        return false
      }
    } catch (error) {
      console.error('로그인 오류:', error)
      setIsLoading(false)
      return false
    }
  }

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    console.log("=== AuthContext register 함수 시작 ===")
    console.log("Register 파라미터:", { name, email, hasPassword: !!password })
    setIsLoading(true)

    try {
      console.log("/api/auth/register에 POST 요청 시도...")
      
      const requestBody = {
        username: name,
        email: email,
        password: password,
        blockedTags: [],
        preferences: {}
      }
      
      console.log("Request body:", requestBody)
      
      // 실제 API 호출
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      console.log("API 응답 수신:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      })

      let data
      try {
        data = await response.json()
        console.log("API 응답 데이터:", data)
      } catch (parseError) {
        console.error("JSON 파싱 오류:", parseError)
        console.error("응답 텍스트 확인 필요")
        setIsLoading(false)
        return false
      }

      if (response.ok && data.success) {
        console.log("회원가입 API 성공! 응답 데이터:", data)
        // 회원가입 성공 시 사용자 데이터 설정
        const userData = {
          id: Date.now().toString(), // 실제로는 서버에서 받은 ID 사용
          name: name,
          email: email,
          avatar: "/placeholder-avatar.jpg",
          blockedGenres: [],
          blockedTags: [],
          favoriteWorks: [],
          isAdultVerified: false,
          showAdultContent: false,
        }
        setUser(userData)
        localStorage.setItem("user", JSON.stringify(userData))
        setIsLoading(false)
        console.log("사용자 데이터 설정 완료")
        return true
      } else {
        console.error('Registration failed - Response not OK or success false')
        console.error('Status:', response.status, 'Data:', data)
        setIsLoading(false)
        return false
      }
    } catch (error) {
      console.error('Registration error:', error)
      setIsLoading(false)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  const updateUserSettings = async (settings: Partial<User>): Promise<boolean> => {
    if (!user) {
      console.error("updateUserSettings: 사용자가 로그인되어 있지 않음")
      return false
    }

    try {
      console.log("프로필 업데이트 API 호출:", settings)
      
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: parseInt(user.id),
          ...settings
        }),
      })

      const data = await response.json()
      
      if (response.ok && data.success) {
        console.log("프로필 업데이트 성공:", data)
        
        // 로컬 상태도 업데이트
        const updatedUser = { ...user, ...settings }
        setUser(updatedUser)
        localStorage.setItem("user", JSON.stringify(updatedUser))
        
        return true
      } else {
        console.error("프로필 업데이트 실패:", data)
        return false
      }
    } catch (error) {
      console.error("프로필 업데이트 오류:", error)
      return false
    }
  }

  const toggleFavorite = (workId: string) => {
    if (user) {
      const favoriteWorks = user.favoriteWorks.includes(workId)
        ? user.favoriteWorks.filter((id) => id !== workId)
        : [...user.favoriteWorks, workId]

      updateUserSettings({ favoriteWorks })
    }
  }

  const verifyAdult = async (): Promise<boolean> => {
    if (user) {
      const success = await updateUserSettings({
        isAdultVerified: true,
        showAdultContent: true,
      })
      return success
    }
    return false
  }

  const toggleAdultContent = async (show: boolean): Promise<boolean> => {
    if (user && user.isAdultVerified) {
      const success = await updateUserSettings({ showAdultContent: show })
      return success
    }
    return false
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateUserSettings,
        toggleFavorite,
        verifyAdult,
        toggleAdultContent,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
