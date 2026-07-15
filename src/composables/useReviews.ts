import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import type { Review } from '../types/tourism'

const reviews = ref<Review[]>([])
const storageKey = 'attraction-reviews'

// LocalStorage에서 로드
const loadReviews = () => {
  const saved = localStorage.getItem(storageKey)
  if (saved) {
    reviews.value = JSON.parse(saved)
  }
}

// LocalStorage에 저장
const saveReviews = () => {
  localStorage.setItem(storageKey, JSON.stringify(reviews.value))
}

// 리뷰 추가
const addReview = (
  contentid: string,
  userId: string,
  userName: string,
  rating: number,
  title: string,
  content: string
) => {
  const review: Review = {
    id: uuidv4(),
    contentid,
    userId,
    userName,
    rating,
    title,
    content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    likes: 0
  }
  reviews.value.push(review)
  saveReviews()
  return review
}

// 리뷰 수정
const updateReview = (id: string, updates: Partial<Review>) => {
  const index = reviews.value.findIndex(r => r.id === id)
  if (index !== -1) {
    reviews.value[index] = {
      ...reviews.value[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    saveReviews()
  }
}

// 리뷰 삭제
const deleteReview = (id: string) => {
  reviews.value = reviews.value.filter(r => r.id !== id)
  saveReviews()
}

// 특정 관광지의 리뷰 조회
const getReviewsByAttraction = (contentid: string) => {
  return reviews.value.filter(r => r.contentid === contentid)
}

// 평균 평점 계산
const getAverageRating = (contentid: string) => {
  const attractionReviews = getReviewsByAttraction(contentid)
  if (attractionReviews.length === 0) return 0
  const sum = attractionReviews.reduce((acc, r) => acc + r.rating, 0)
  return Math.round((sum / attractionReviews.length) * 10) / 10
}

// 리뷰 좋아요
const likeReview = (id: string) => {
  const review = reviews.value.find(r => r.id === id)
  if (review) {
    review.likes++
    saveReviews()
  }
}

export const useReviews = () => ({
  reviews,
  loadReviews,
  saveReviews,
  addReview,
  updateReview,
  deleteReview,
  getReviewsByAttraction,
  getAverageRating,
  likeReview
})