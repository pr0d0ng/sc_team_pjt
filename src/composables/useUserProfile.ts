import { ref } from 'vue'
import type { UserProfile } from '../types/tourism'

const currentUser = ref<UserProfile | null>(null)
const storageKey = 'current-user-profile'

// 사용자 로드
const loadUserProfile = () => {
  const saved = localStorage.getItem(storageKey)
  if (saved) {
    currentUser.value = JSON.parse(saved)
  }
}

// 사용자 생성/저장
const createUserProfile = (name: string, email: string) => {
  currentUser.value = {
    id: `user-${Date.now()}`,
    name,
    email,
    createdAt: new Date().toISOString(),
    bookmarks: [],
    reviews: [],
    comments: [],
    role: 'user'
  }
  localStorage.setItem(storageKey, JSON.stringify(currentUser.value))
  return currentUser.value
}

// 사용자 정보 업데이트
const updateUserProfile = (updates: Partial<UserProfile>) => {
  if (currentUser.value) {
    currentUser.value = {
      ...currentUser.value,
      ...updates
    }
    localStorage.setItem(storageKey, JSON.stringify(currentUser.value))
  }
}

// 사용자 존재 여부
const isUserLoggedIn = () => {
  return currentUser.value !== null
}

// 사용자 로그아웃
const logout = () => {
  currentUser.value = null
  localStorage.removeItem(storageKey)
}

export const useUserProfile = () => ({
  currentUser,
  loadUserProfile,
  createUserProfile,
  updateUserProfile,
  isUserLoggedIn,
  logout
})