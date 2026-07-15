import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import type { Review } from '../types/tourism'
import { useAttractions } from './useAttractions'

const reviews = ref<Review[]>([])
const storageKey = 'attraction-reviews'

const loadReviews = () => {
  try {
    if (typeof window === 'undefined') return
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      reviews.value = JSON.parse(saved)
    }
    try {
      const { allAttractions } = useAttractions()
      if (allAttractions.value && allAttractions.value.length > 0) {
        let changed = false
        reviews.value = reviews.value.map(r => {
          const copy = { ...r }
          const a = allAttractions.value.find(at => at.contentid === r.contentid)
          if (a) {
            if (!copy.attractionTitle) { copy.attractionTitle = a.title || ''; changed = true }
            if (!copy.attractionAddress) { copy.attractionAddress = a.addr1 || a.addr2 || ''; changed = true }
            if (!copy.attractionCategory) { copy.attractionCategory = a.contenttypeid || ''; changed = true }
          }
          return copy
        })
        if (changed) saveReviews()
      }
    } catch (e) {
      // ignore
    }
  } catch (e) {
    // optional: console.error('loadReviews error', e)
  }
}

const saveReviews = () => {
  try {
    if (typeof window === 'undefined') return
    localStorage.setItem(storageKey, JSON.stringify(reviews.value))
  } catch (e) {
    // optional: console.error('saveReviews error', e)
  }
}

const addReview = (
  contentid: string,
  userId: string,
  userName: string,
  rating: number,
  title: string,
  content: string,
  attractionTitle = '',
  attractionAddress = '',
  attractionCategory = ''
) => {
  try {
    const { allAttractions } = useAttractions()
    const a = allAttractions.value.find(at => at.contentid === contentid)
    if (a) {
      if (!attractionTitle) attractionTitle = a.title || ''
      if (!attractionAddress) attractionAddress = a.addr1 || a.addr2 || ''
      if (!attractionCategory) attractionCategory = a.contenttypeid || ''
    }
  } catch (e) {
    // ignore
  }

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
    likes: 0,
    attractionTitle,
    attractionAddress,
    attractionCategory
  }
  reviews.value.push(review)
  saveReviews()
  return review
}

const updateReview = (id: string, updates: Partial<Review>) => {
  console.log('[useReviews] updateReview called', id, updates)
  const index = reviews.value.findIndex(r => r.id === id)
  if (index !== -1) {
    reviews.value[index] = {
      ...reviews.value[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    saveReviews()
    console.log('[useReviews] updateReview succeeded', reviews.value[index])
    return true
  } else {
    console.warn('[useReviews] updateReview: id not found', id)
    return false
  }
}

const deleteReview = (id: string) => {
  console.log('[useReviews] deleteReview called', id)
  const before = reviews.value.length
  reviews.value = reviews.value.filter(r => r.id !== id)
  const after = reviews.value.length
  saveReviews()
  console.log('[useReviews] deleteReview removed', before - after, 'items')
  return before !== after
}

const getReviewsByAttraction = (contentid: string) => {
  return reviews.value.filter(r => r.contentid === contentid)
}

const getAverageRating = (contentid: string) => {
  const attractionReviews = getReviewsByAttraction(contentid)
  if (attractionReviews.length === 0) return 0
  const sum = attractionReviews.reduce((acc, r) => acc + r.rating, 0)
  return Math.round((sum / attractionReviews.length) * 10) / 10
}

const likeReview = (id: string) => {
  const review = reviews.value.find(r => r.id === id)
  if (review) {
    review.likes++
    saveReviews()
  }
}

if (typeof window !== 'undefined') {
  loadReviews()
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