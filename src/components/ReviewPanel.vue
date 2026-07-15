<template>
  <div class="review-panel">
    <div class="panel-header">
      <h3>리뷰 & 평점</h3>
      <button @click="showForm = !showForm" class="write-review-btn">
        {{ showForm ? '닫기' : '리뷰 작성' }}
      </button>
    </div>

    <!-- 리뷰 작성 폼 -->
    <div v-if="showForm" class="review-form">
      <div class="form-group">
        <label>평점</label>
        <div class="rating-input">
          <button
            v-for="star in 5"
            :key="star"
            @click="newReview.rating = star"
            :class="['star', { active: star <= newReview.rating }]"
          >
            ★
          </button>
        </div>
      </div>

      <div class="form-group">
        <label>제목</label>
        <input v-model="newReview.title" type="text" placeholder="리뷰 제목을 입력하세요" />
      </div>

      <div class="form-group">
        <label>내용</label>
        <textarea v-model="newReview.content" placeholder="상세한 리뷰를 작성해주세요" rows="5"></textarea>
      </div>

      <div class="form-group">
        <label>이름</label>
        <input v-model="newReview.userName" type="text" placeholder="이름을 입력하세요" />
      </div>

      <button @click="submitReview" class="submit-btn">리뷰 제출</button>
    </div>

    <!-- 리뷰 목록 -->
    <div class="reviews-list">
      <div v-if="reviews.length === 0" class="no-reviews">리뷰가 없습니다</div>

      <div v-for="review in reviews" :key="review.id" class="review-item">
        <div class="review-header">
          <div class="review-meta">
            <span class="reviewer-name">{{ review.userName }}</span>
            <span class="review-date">{{ formatDate(review.createdAt) }}</span>
          </div>
          <div class="review-rating">
            <span class="stars">{{ '★'.repeat(review.rating) }}{{ '☆'.repeat(5 - review.rating) }}</span>
            <span class="rating-number">{{ review.rating }}.0</span>
          </div>
        </div>

        <h4 class="review-title">{{ review.title }}</h4>
        <p class="review-content">{{ review.content }}</p>

        <div class="review-footer">
          <button @click="likeReview(review.id)" class="like-btn">
            👍 좋아요 ({{ review.likes }})
          </button>
          <button @click="toggleComments(review.id)" class="comment-btn">
            💬 댓글 ({{ getCommentCount(review.id) }})
          </button>
          <button v-if="isOwnReview(review.userId)" @click="deleteReview(review.id)" class="delete-btn">
            🗑️ 삭제
          </button>
        </div>

        <!-- 댓글 섹션 -->
        <div v-if="expandedReviewId === review.id" class="comments-section">
          <div class="comment-form">
            <input v-model="newComment.content" type="text" placeholder="댓글을 입력하세요" />
            <button @click="submitComment(review.id)" class="comment-submit">댓글</button>
          </div>

          <div class="comments-list">
            <div v-for="comment in getReviewComments(review.id)" :key="comment.id" class="comment-item">
              <div class="comment-header">
                <span class="comment-author">{{ comment.userName }}</span>
                <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
              </div>
              <p class="comment-text">{{ comment.content }}</p>
              <div class="comment-actions">
                <button @click="likeComment(comment.id)" class="like-btn">
                  👍 {{ comment.likes }}
                </button>
                <button v-if="isOwnComment(comment.userId)" @click="deleteComment(comment.id)" class="delete-btn">
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
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
    createUserProfile('익명의 사용자', 'anonymous@example.com')
  }
})

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('ko-KR')
}

const submitReview = () => {
  if (!newReview.value.title || !newReview.value.content) {
    alert('제목과 내용을 모두 입력해주세요')
    return
  }

  addReview(
    props.contentid,
    currentUser.value?.id || 'anonymous',
    newReview.value.userName || '익명',
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
  return currentUser.value?.id === userId
}

const isOwnComment = (userId: string) => {
  return currentUser.value?.id === userId
}
</script>

<style scoped>
.review-panel {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.panel-header h3 {
  margin: 0;
  color: #333;
  font-size: 20px;
}

.write-review-btn {
  padding: 10px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.write-review-btn:hover {
  background: #764ba2;
}

.review-form {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #e0e0e0;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
  font-size: 14px;
}

.form-group textarea {
  resize: vertical;
}

.rating-input {
  display: flex;
  gap: 10px;
}

.star {
  width: 40px;
  height: 40px;
  font-size: 24px;
  background: none;
  border: 2px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  color: #ddd;
  transition: all 0.3s;
}

.star.active {
  color: #ffc107;
  border-color: #ffc107;
  background: #fffaf0;
}

.star:hover {
  transform: scale(1.1);
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s;
}

.submit-btn:hover {
  background: #764ba2;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.no-reviews {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.review-item {
  background: white;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.review-meta {
  display: flex;
  gap: 12px;
  align-items: center;
}

.reviewer-name {
  font-weight: 600;
  color: #333;
}

.review-date {
  font-size: 12px;
  color: #999;
}

.review-rating {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stars {
  font-size: 14px;
  color: #ffc107;
}

.rating-number {
  font-weight: 600;
  color: #ffc107;
}

.review-title {
  margin: 8px 0;
  color: #333;
  font-size: 16px;
}

.review-content {
  color: #666;
  line-height: 1.6;
  margin: 12px 0;
  white-space: pre-wrap;
}

.review-footer {
  display: flex;
  gap: 10px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #eee;
}

.like-btn,
.comment-btn,
.delete-btn {
  padding: 6px 12px;
  background: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s;
}

.like-btn:hover {
  background: #f0f0f0;
}

.comment-btn:hover {
  background: #f0f0f0;
}

.delete-btn:hover {
  background: #ffe0e0;
  border-color: #e74c3c;
}

.comments-section {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.comment-form {
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
}

.comment-form input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.comment-submit {
  padding: 8px 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.comment-item {
  background: #f9f9f9;
  padding: 12px;
  border-radius: 4px;
  border-left: 3px solid #667eea;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.comment-author {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.comment-date {
  font-size: 11px;
  color: #999;
}

.comment-text {
  color: #666;
  font-size: 14px;
  margin: 6px 0;
  word-break: break-word;
}

.comment-actions {
  display: flex;
  gap: 8px;
}

.comment-actions .like-btn,
.comment-actions .delete-btn {
  padding: 4px 8px;
  font-size: 11px;
}
</style>