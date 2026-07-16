<template>
  <teleport to="body">
    <div class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal">
        <header class="modal-header">
          <div>
            <h3>리뷰 보기 · {{ title || contentid }}</h3>
            <p class="modal-subtitle">이 장소에 대한 방문 후기를 남겨보세요.</p>
          </div>
          <button class="close-btn" @click="$emit('close')">✕</button>
        </header>

        <section class="review-section">
          <div class="section-title">리뷰 목록</div>
          <div v-if="reviews.length === 0" class="empty">아직 작성된 리뷰가 없습니다.</div>

          <div v-for="r in reviews" :key="r.id" class="review-item">
            <div class="review-top">
              <div>
                <div class="review-author">{{ r.userName }}</div>
                <div class="review-date">{{ formatDate(r.createdAt) }}</div>
              </div>
              <div class="stars-display" :aria-label="`${r.rating}점`">
                <span v-for="n in 5" :key="n" :class="['star', { filled: n <= r.rating }]">★</span>
              </div>
            </div>

            <div v-if="editingId === r.id" class="edit-form">
              <input v-model="editTitle" placeholder="제목" />
              <div class="star-picker">
                <button
                  v-for="n in 5"
                  :key="n"
                  type="button"
                  :class="['star-btn', { active: editRating >= n }]"
                  @click="editRating = n"
                >★</button>
              </div>
              <textarea v-model="editContent" rows="4" placeholder="리뷰 내용을 입력하세요"></textarea>
              <div class="modal-actions">
                <button class="btn-primary" @click="saveEdit(r.id)">저장</button>
                <button class="btn-cancel" @click="cancelEdit">취소</button>
              </div>
            </div>

            <div v-else class="content">
              <div class="title">{{ r.title }}</div>
              <div class="body">{{ r.content }}</div>
              <div class="review-actions">
                <button v-if="isOwner(r)" class="btn-link" @click="startEdit(r)">수정</button>
                <button v-if="isOwner(r)" class="btn-link danger" @click="openDeleteConfirm(r.id)">삭제</button>
              </div>
            </div>
          </div>
        </section>

        <section class="review-section write-section">
          <div class="section-title">리뷰 작성</div>
          <input v-model="author" placeholder="이름 (선택)" />
          <div class="star-picker">
            <button
              v-for="n in 5"
              :key="n"
              type="button"
              :class="['star-btn', { active: rating >= n }]"
              @click="rating = n"
            >★</button>
          </div>
          <input v-model="title" placeholder="제목" />
          <textarea v-model="content" rows="5" placeholder="리뷰 내용을 입력하세요"></textarea>
          <div class="modal-actions">
            <button class="btn-primary" @click="submitReview">작성</button>
            <button class="btn-cancel" @click="$emit('close')">닫기</button>
          </div>
        </section>
      </div>

      <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="cancelDelete">
        <div class="confirm-modal" @click.stop>
          <h3>리뷰 삭제</h3>
          <p>이 리뷰를 정말 삭제하시겠습니까?</p>
          <div class="modal-actions">
            <button class="btn-danger" @click="deleteCurrentReview">삭제</button>
            <button class="btn-cancel" @click="cancelDelete">취소</button>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>


<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useReviews } from '../composables/useReviews'
import { useUserProfile } from '../composables/useUserProfile'
import type { Review } from '../types/tourism'

const props = defineProps<{ contentid: string | null; title?: string }>()
const contentid = computed(() => props.contentid)

const { reviews: allReviews, loadReviews, addReview, updateReview, deleteReview } = useReviews()
const { currentUser, loadUserProfile } = useUserProfile()

onMounted(() => {
  loadReviews()
  loadUserProfile()
  author.value = currentUser.value?.name || ''
})

const reviews = computed(() => allReviews.value.filter(r => r.contentid === contentid.value))

const author = ref('')
const rating = ref<number>(5)
const title = ref('')
const content = ref('')

const editingId = ref<string | null>(null)
const editTitle = ref('')
const editContent = ref('')
const editRating = ref<number>(5)

const showDeleteConfirm = ref(false)
const deleteTargetId = ref<string | null>(null)

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return d
  }
}

function submitReview() {
  const name = author.value.trim() || (currentUser.value?.name || '익명')
  const userId = currentUser.value?.id || `anon-${Date.now()}`
  if (!title.value.trim() || !content.value.trim()) {
    alert('제목과 내용을 입력하세요.')
    return
  }

  if (contentid.value) {
    addReview(
      contentid.value,  // 이제 string만 가능
      userId,
      name,
      rating.value,
      title.value.trim(),
      content.value.trim(),
      props.title || ''
    )
  }
  title.value = ''
  content.value = ''
  rating.value = 5
  author.value = currentUser.value?.name || ''
}

function isOwner(r: Review) {
  if (!currentUser.value) return false
  return r.userId === currentUser.value.id
}

function startEdit(r: Review) {
  editingId.value = r.id
  editTitle.value = r.title
  editContent.value = r.content
  editRating.value = r.rating
}

function cancelEdit() {
  editingId.value = null
  editTitle.value = ''
  editContent.value = ''
}

function saveEdit(id: string) {
  if (!editTitle.value.trim() || !editContent.value.trim()) {
    alert('제목과 내용을 입력하세요.')
    return
  }
  updateReview(id, {
    title: editTitle.value.trim(),
    content: editContent.value.trim(),
    rating: editRating.value
  } as Partial<Review>)
  cancelEdit()
}

function openDeleteConfirm(id: string) {
  deleteTargetId.value = id
  showDeleteConfirm.value = true
}

function cancelDelete() {
  showDeleteConfirm.value = false
  deleteTargetId.value = null
}

function deleteCurrentReview() {
  if (!deleteTargetId.value) return
  deleteReview(deleteTargetId.value)
  cancelDelete()
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  padding: 20px;
}
.modal {
  width: min(920px, 100%);
  max-height: 90vh;
  overflow: auto;
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 16px;
  margin-bottom: 16px;
}
.modal-header h3 {
  margin: 0;
  color: #333;
}
.modal-subtitle {
  margin: 4px 0 0;
  color: #6b7280;
  font-size: 13px;
}
.close-btn {
  border: none;
  background: #f3f4f6;
  color: #374151;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
}
.review-section {
  margin-bottom: 20px;
}
.section-title {
  font-weight: 700;
  color: #4b5563;
  margin-bottom: 12px;
}
.empty {
  padding: 14px;
  border: 1px dashed #d1d5db;
  border-radius: 8px;
  color: #6b7280;
  background: #fafafa;
}
.review-item {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 10px;
  background: #fcfcfd;
}
.review-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.review-author {
  font-weight: 700;
  color: #374151;
}
.review-date {
  font-size: 12px;
  color: #9ca3af;
}
.stars-display {
  display: flex;
  gap: 2px;
  color: #f59e0b;
  font-size: 16px;
}
.star.filled {
  color: #f59e0b;
}
.star:not(.filled) {
  color: #d1d5db;
}
.title {
  font-weight: 700;
  margin-bottom: 6px;
  color: #111827;
}
.body {
  color: #4b5563;
  line-height: 1.5;
}
.review-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}
.btn-link {
  border: none;
  background: none;
  color: #667eea;
  cursor: pointer;
  padding: 0;
  font-weight: 600;
}
.btn-link.danger {
  color: #e74c3c;
}
input,
textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  box-sizing: border-box;
  font-size: 14px;
  margin-bottom: 10px;
}
textarea {
  min-height: 90px;
  resize: vertical;
}
.star-picker {
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
}
.star-btn {
  border: none;
  background: transparent;
  font-size: 24px;
  cursor: pointer;
  color: #d1d5db;
  padding: 0;
}
.star-btn.active {
  color: #f59e0b;
}
.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}
.btn-primary,
.btn-cancel,
.btn-danger {
  border: none;
  border-radius: 8px;
  padding: 10px 14px;
  cursor: pointer;
  font-weight: 600;
}
.btn-primary {
  background: #667eea;
  color: white;
}
.btn-cancel {
  background: #f3f4f6;
  color: #374151;
}
.btn-danger {
  background: #e74c3c;
  color: white;
}
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3200;
  padding: 20px;
}
.confirm-modal {
  background: white;
  border-radius: 10px;
  padding: 24px;
  min-width: 300px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.2);
}
.confirm-modal h3 {
  margin: 0 0 8px;
}
.confirm-modal p {
  margin: 0 0 16px;
  color: #6b7280;
}
</style>