import { ref } from 'vue'
import type { UserProfile } from '../types/tourism'

const currentUser = ref<UserProfile | null>(null)
const storageKey = 'current-user-profile'

// 사용자 로드
const loadUserProfile = () => {
  const saved = localStorage.getItem(storageKey)
  if (saved) {
    currentUser.value = JSON.parse(saved)
    // review-user-id도 동기화
    if (currentUser.value?.id) {
      localStorage.setItem('review-user-id', currentUser.value.id)
    }
  }
}

// 사용자 생성/저장
const createUserProfile = (name: string, email: string) => {
  // 기존에 생성된 review-user-id가 있으면 그 값을 id로 재사용해 일관성 유지
  const existingReviewId = localStorage.getItem('review-user-id')
  const id = existingReviewId || `user-${Date.now()}`

  currentUser.value = {
    id,
    name,
    email,
    createdAt: new Date().toISOString(),
    bookmarks: [],
    reviews: [],
    comments: [],
    role: 'user'
  }
  localStorage.setItem(storageKey, JSON.stringify(currentUser.value))
  // review-user-id에 현재 사용자 id 저장 (통일)
  localStorage.setItem('review-user-id', currentUser.value.id)
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
    if (currentUser.value.id) {
      localStorage.setItem('review-user-id', currentUser.value.id)
    }
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
  // review-user-id는 유지하지 않음(필요하면 여기서도 제거하세요)
}

export const useUserProfile = () => ({
  currentUser,
  loadUserProfile,
  createUserProfile,
  updateUserProfile,
  isUserLoggedIn,
  logout
})