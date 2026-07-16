<template>
  <!-- 기존 template (변경 없음) -->
  ... (template unchanged, keep your existing template)
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useReviews } from '../composables/useReviews'
import { useUserProfile } from '../composables/useUserProfile'

const props = defineProps<{
  contentid: string
}>()

const { addReview } = useReviews()
const { currentUser, loadUserProfile, createUserProfile } = useUserProfile()

const showForm = ref(false)

const newReview = ref({
  title: '',
  content: '',
  rating: 5,
  userName: ''
})

onMounted(() => {
  loadUserProfile()
  if (!currentUser.value) {
    // 생성 시 useUserProfile이 review-user-id와 동기화하도록 변경했음
    createUserProfile('익명의 사용자', 'anonymous@example.com')
  }
})

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

</script>

<style scoped>
/* 기존 스타일 유지 */
</style>