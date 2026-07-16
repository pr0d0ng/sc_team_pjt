import { ref } from 'vue'
import type { Bookmark, Attraction } from '../types/tourism'

const bookmarks = ref<Bookmark[]>([])
const storageKey = 'attraction-bookmarks'

// LocalStorage에서 로드
const loadBookmarks = () => {
  const saved = localStorage.getItem(storageKey)
  if (saved) {
    bookmarks.value = JSON.parse(saved)
  }
}

// LocalStorage에 저장
const saveBookmarks = () => {
  localStorage.setItem(storageKey, JSON.stringify(bookmarks.value))
}

// 북마크 추가
const addBookmark = (attraction: Attraction) => {
  if (
    !bookmarks.value.find(b => b.contentid === attraction.contentid)
  ) {
    bookmarks.value.push({
      contentid: attraction.contentid,
      title: attraction.title,
      attractionData: attraction,
      bookmarkedAt: new Date().toISOString()
    })
    saveBookmarks()
  }
}

// 북마크 제거
const removeBookmark = (contentid: string) => {
  bookmarks.value = bookmarks.value.filter(b => b.contentid !== contentid)
  saveBookmarks()
}

// 북마크 여부 확인
const isBookmarked = (contentid: string) => {
  return bookmarks.value.some(b => b.contentid === contentid)
}

// 북마크 토글
const toggleBookmark = (attraction: Attraction) => {
  if (isBookmarked(attraction.contentid)) {
    removeBookmark(attraction.contentid)
  } else {
    addBookmark(attraction)
  }
}

export const useBookmarks = () => ({
  bookmarks,
  loadBookmarks,
  saveBookmarks,
  addBookmark,
  removeBookmark,
  isBookmarked,
  toggleBookmark
})