<template>
  <div class="review-panel">
    <div class="header">
      <h3>리뷰</h3>
      <button class="btn-toggle" @click="showForm = !showForm">
        {{ showForm ? '작성 폼 닫기' : '리뷰 작성' }}
      </button>
    </div>

    <div v-if="reviewsComputed.length === 0" class="empty">아직 작성된 리뷰가 없습니다.</div>

    <ul class="reviews-list">
      <li v-for="r in reviewsComputed" :key="r.id" class="review-item">
        <div v-if="editingId !== r.id" class="review-view">
          <div class="meta">
            <strong>{{ r.userName }}</strong>
            <span class="date">{{ formatDate(r.createdAt) }}</span>
            <span class="rating">· {{ r.rating }}점</span>
          </div>
          <div class="title">{{ r.title }}</div>
          <div class="content">{{ r.content }}</div>
          <div class="actions">
            <button v-if="isOwner(r)" class="btn-link" @click="startEdit(r)">수정</button>
            <button v-if="isOwner(r)" class="btn-link danger" @click="openDeleteConfirm(r.id)">삭제</button>
            
          </div>
        </div>

        <div v-else class="edit-form">
          <input v-model="editTitle" placeholder="제목" />
          <div class="star-picker">
            <button v-for="n in 5" :key="n" type="button" :class="['star-btn', { active: editRating >= n }]" @click="editRating = n">★</button>
          </div>
          <textarea v-model="editContent" rows="4" placeholder="리뷰 내용을 입력하세요"></textarea>
          <div class="modal-actions">
            <button class="btn-primary" @click="saveEdit(editingId!)">저장</button>
            <button class="btn-cancel" @click="cancelEdit">취소</button>
          </div>
        </div>
      </li>
    </ul>

    <div v-if="showForm" class="write-section">
      <input v-model="author" placeholder="이름 (선택)" />
      <div class="star-picker">
        <button v-for="n in 5" :key="n" type="button" :class="['star-btn', { active: rating >= n }]" @click="rating = n">★</button>
      </div>
      <input v-model="title" placeholder="제목" />
      <textarea v-model="content" rows="4" placeholder="리뷰 내용을 입력하세요"></textarea>
      <div class="modal-actions">
        <button class="btn-primary" @click="submitReview">작성</button>
        <button class="btn-cancel" @click="showForm = false">닫기</button>
      </div>
    </div>

    <div v-if="showDeleteConfirm" class="confirm-overlay" @click.self="cancelDelete">
      <div class="confirm-box" @click.stop>
        <h4>리뷰 삭제</h4>
        <p>이 리뷰를 정말 삭제하시겠습니까?</p>
        <div class="modal-actions">
          <button class="btn-danger" @click="confirmDelete">삭제</button>
          <button class="btn-cancel" @click="cancelDelete">취소</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useReviews } from '../composables/useReviews'
import { useUserProfile } from '../composables/useUserProfile'
import type { Review } from '../types/tourism'

const props = defineProps<{ contentid: string }>()

const { loadReviews, addReview, updateReview, deleteReview, getReviewsByAttraction } = useReviews()
const { currentUser, loadUserProfile, createUserProfile } = useUserProfile()

const showForm = ref(false)
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

onMounted(() => {
  loadUserProfile()
  loadReviews()
  if (!currentUser.value) {
    createUserProfile('익명의 사용자', 'anonymous@example.com')
  }
  author.value = currentUser.value?.name || ''
})

const reviewsComputed = computed(() => getReviewsByAttraction(props.contentid))

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
  } catch {
    return d
  }
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

function submitReview() {
  const userId = getOrCreateReviewUserIdFromProfile()
  const name = author.value.trim() || (currentUser.value?.name || '익명')
  if (!title.value.trim() || !content.value.trim()) {
    alert('제목과 내용을 입력하세요.')
    return
  }
  addReview(props.contentid, userId, name, rating.value, title.value.trim(), content.value.trim())
  // reset
  title.value = ''
  content.value = ''
  rating.value = 5
  author.value = currentUser.value?.name || ''
  showForm.value = false
}

function isOwner(r: Review) {
  // 리뷰 작성자는 currentUser id와 비교하거나, 로컬에 저장된 review-user-id와 비교
  if (currentUser.value?.id) return r.userId === currentUser.value.id
  // if user's name matches review author name, consider it owned (local single-user app heuristic)
  if (currentUser.value?.name && r.userName && currentUser.value.name === r.userName) return true
  const saved = localStorage.getItem('review-user-id')
  if (!saved) return false
  if (r.userId === saved) return true
  // normalize: allow matching different prefixes like 'anon-123' and 'review-user-123'
  const extractSuffix = (id?: string | null) => {
    if (!id) return null
    const m = id.match(/(\d+)$/)
    return m ? m[0] : id
  }
  const s = extractSuffix(saved)
  const u = extractSuffix(r.userId)
  return s && u ? s === u : false
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
  editRating.value = 5
}

function saveEdit(id: string) {
  if (!editTitle.value.trim() || !editContent.value.trim()) {
    alert('제목과 내용을 입력하세요.')
    return
  }
  const ok = updateReview(id, { title: editTitle.value.trim(), content: editContent.value.trim(), rating: editRating.value })
  if (!ok) {
    alert('리뷰 수정에 실패했습니다.')
    return
  }
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

function confirmDelete() {
  if (!deleteTargetId.value) return
  const ok = deleteReview(deleteTargetId.value)
  if (!ok) {
    alert('삭제에 실패했습니다.')
    return
  }
  cancelDelete()
}


</script>

<style scoped>
.review-panel { border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px; background: #fff; }
.header { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
.btn-toggle { background:transparent; border:none; color:#667eea; cursor:pointer; font-weight:600; }
.reviews-list { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:10px; }
.review-item { border:1px solid #f1f5f9; border-radius:8px; padding:10px; background:#fcfcfd; }
.meta { font-size:13px; color:#6b7280; display:flex; gap:8px; align-items:center; }
.title { font-weight:700; margin-top:6px; color:#111827; }
.content { color:#4b5563; margin-top:6px; white-space:pre-wrap; }
.actions { margin-top:8px; display:flex; gap:8px; }
.btn-link { border:none; background:none; color:#667eea; cursor:pointer; padding:0; font-weight:600; }
.btn-link.danger { color:#e74c3c; }
.write-section { margin-top:12px; }
.star-picker { display:flex; gap:6px; margin:8px 0; }
.star-btn { border:none; background:transparent; font-size:20px; cursor:pointer; color:#d1d5db; padding:0; }
.star-btn.active { color:#f59e0b; }
.modal-actions { display:flex; gap:8px; margin-top:8px; }
.btn-primary { background:#667eea; color:#fff; border:none; padding:8px 12px; border-radius:6px; cursor:pointer; }
.btn-cancel { background:#f3f4f6; color:#374151; border:none; padding:8px 12px; border-radius:6px; cursor:pointer; }
.btn-danger { background:#e74c3c; color:#fff; border:none; padding:8px 12px; border-radius:6px; cursor:pointer; }
.confirm-overlay { position:fixed; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.45); z-index:3000; }
.confirm-box { background:#fff; padding:18px; border-radius:10px; min-width:300px; }
.empty { padding:12px; color:#6b7280; border:1px dashed #e5e7eb; border-radius:8px; background:#fafafa; }
</style>