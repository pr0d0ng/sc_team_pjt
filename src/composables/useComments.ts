import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import type { Comment } from '../types/tourism'

const comments = ref<Comment[]>([])
const storageKey = 'attraction-comments'

// LocalStorage에서 로드
const loadComments = () => {
  const saved = localStorage.getItem(storageKey)
  if (saved) {
    comments.value = JSON.parse(saved)
  }
}

// LocalStorage에 저장
const saveComments = () => {
  localStorage.setItem(storageKey, JSON.stringify(comments.value))
}

// 댓글 추가
const addComment = (
  reviewId: string,
  userId: string,
  userName: string,
  content: string
) => {
  const comment: Comment = {
    id: uuidv4(),
    reviewId,
    userId,
    userName,
    content,
    createdAt: new Date().toISOString(),
    likes: 0
  }
  comments.value.push(comment)
  saveComments()
  return comment
}

// 댓글 삭제
const deleteComment = (id: string) => {
  comments.value = comments.value.filter(c => c.id !== id)
  saveComments()
}

// 특정 리뷰의 댓글 조회
const getCommentsByReview = (reviewId: string) => {
  return comments.value.filter(c => c.reviewId === reviewId)
}

// 댓글 좋아요
const likeComment = (id: string) => {
  const comment = comments.value.find(c => c.id === id)
  if (comment) {
    comment.likes++
    saveComments()
  }
}

export const useComments = () => ({
  comments,
  loadComments,
  saveComments,
  addComment,
  deleteComment,
  getCommentsByReview,
  likeComment
})