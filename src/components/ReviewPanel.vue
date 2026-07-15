<template>
  <!-- 기존 template (변경 없음) -->
  ... (template unchanged, keep your existing template)
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useReviews } from '../composables/useReviews'
import { useComments } from '../composables/useComments'
import { useUserProfile } from '../composables/useUserProfile'

const props = defineProps<{
  contentid: string
}>()

const { addReview, deleteReview, getReviewsByAttraction, likeReview } = useReviews()
const { addComment, deleteComment, getCommentsByReview, likeComment } = useComments()
const { currentUser, loadUserProfile, createUserProfile } = useUserProfile()

const showForm = ref(false)
const expandedReviewId = ref<string | null>(null)

const newReview = ref({
  title: '',
  content: '',
  rating: 5,
  userName: ''
})

const newComment = ref({
  content: ''
})

const reviews = computed(() => getReviewsByAttraction(props.contentid))

onMounted(() => {
  loadUserProfile()
  if (!currentUser.value) {
    // 생성 시 useUserProfile이 review-user-id와 동기화하도록 변경했음
    createUserProfile('익명의 사용자', 'anonymous@example.com')
  }
})

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('ko-KR')
}

function getOrCreateReviewUserIdFromProfile() {
  if (currentUser.value?.id) {
    localStorage.setItem('review-user-id', currentUser.value.id)
    return currentUser.value.id
  }
  const key = 'review-user-id'
  const saved = localStorage.getItem(key)
  if (saved) return saved
  const gen = `review-user-${Date.now()}`
  localStorage.setItem(key, gen)
  return gen
}

const submitReview = () => {
  if (!newReview.value.title || !newReview.value.content) {
    alert('제목과 내용을 모두 입력해주세요')
    return
  }

  addReview(
    props.contentid,
    getOrCreateReviewUserIdFromProfile(),
    newReview.value.userName || (currentUser.value?.name || '익명'),
    newReview.value.rating,
    newReview.value.title,
    newReview.value.content
  )

  newReview.value = { title: '', content: '', rating: 5, userName: '' }
  showForm.value = false
  alert('리뷰가 등록되었습니다!')
}

const toggleComments = (reviewId: string) => {
  expandedReviewId.value = expandedReviewId.value === reviewId ? null : reviewId
}

const getReviewComments = (reviewId: string) => {
  return getCommentsByReview(reviewId)
}

const getCommentCount = (reviewId: string) => {
  return getCommentsByReview(reviewId).length
}

const submitComment = (reviewId: string) => {
  if (!newComment.value.content.trim()) return

  addComment(
    reviewId,
    currentUser.value?.id || 'anonymous',
    newComment.value.content.split(' ')[0] || '익명',
    newComment.value.content
  )

  newComment.value.content = ''
}

const isOwnReview = (userId: string) => {
  return (currentUser.value?.id || localStorage.getItem('review-user-id')) === userId
}

const isOwnComment = (userId: string) => {
  return (currentUser.value?.id || localStorage.getItem('review-user-id')) === userId
}
</script>

<style scoped>
/* 기존 스타일 유지 */
</style>