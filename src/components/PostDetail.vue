<template>
  <div class="post-detail">
    <button @click="goBack" class="back-btn">← 목록으로</button>

    <div class="post-container">
      <div class="post-header">
        <h1>{{ post.title }}</h1>
        <div class="post-info">
          <span class="author">{{ post.author }}</span>
          <span class="date">{{ formatDate(post.createdAt) }}</span>
          <span class="stats">👁 {{ post.views }} · ❤️ {{ post.likes }}</span>
        </div>
      </div>

      <div v-if="post.location" class="location-section">
        <button @click="goToMap" class="map-link-btn">
          📍 {{ post.location }} 지도에서 보기
        </button>
      </div>

      <div class="post-content">
        {{ post.content }}
      </div>

      <div class="post-actions">
        <button @click="likePost" class="action-btn">
          ❤️ 좋아요 ({{ post.likes }})
        </button>
        <button @click="showDeleteForm = true" class="action-btn danger">
          🗑️ 삭제
        </button>
      </div>
    </div>

    <!-- 댓글 섹션 -->
    <div class="comments-section">
      <h3>댓글 ({{ post.comments.length }})</h3>

      <div class="comment-form">
        <input v-model="newComment.author" type="text" placeholder="이름" class="input-small" />
        <textarea v-model="newComment.content" placeholder="댓글을 입력하세요" rows="3"></textarea>
        <input v-model="newComment.password" type="password" placeholder="비밀번호 (4자리)" class="input-small" />
        <button @click="submitComment" class="submit-btn">댓글 작성</button>
      </div>

      <div class="comments-list">
        <div v-for="comment in post.comments" :key="comment.id" class="comment-item">
          <div class="comment-header">
            <span class="comment-author">{{ comment.author }}</span>
            <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
          </div>
          <p class="comment-text">{{ comment.content }}</p>
          <div class="comment-actions">
            <button @click="likeComment(comment.id)" class="comment-btn">
              ❤️ {{ comment.likes }}
            </button>
            <button @click="showDeleteCommentForm(comment.id)" class="comment-btn">
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 삭제 모달 -->
    <div v-if="showDeleteForm" class="modal-overlay" @click="showDeleteForm = false">
      <div class="modal" @click.stop>
        <h3>게시물 삭제</h3>
        <p>비밀번호를 입력하세요</p>
        <input v-model="deletePassword" type="password" placeholder="비밀번호" />
        <div class="modal-actions">
          <button @click="confirmDelete" class="btn-danger">삭제</button>
          <button @click="showDeleteForm = false" class="btn-cancel">취소</button>
        </div>
      </div>
    </div>

    <!-- 댓글 삭제 모달 -->
    <div v-if="showDeleteCommentModal" class="modal-overlay" @click="showDeleteCommentModal = false">
      <div class="modal" @click.stop>
        <h3>댓글 삭제</h3>
        <p>비밀번호를 입력하세요</p>
        <input v-model="deleteCommentPassword" type="password" placeholder="비밀번호" />
        <div class="modal-actions">
          <button @click="confirmDeleteComment" class="btn-danger">삭제</button>
          <button @click="showDeleteCommentModal = false" class="btn-cancel">취소</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePosts } from '../composables/usePosts'
import type { Post } from '../types/tourism'

const props = defineProps<{
  post: Post
}>()

const emit = defineEmits<{
  back: []
  delete: [postId: string, password: string]
}>()

const { incrementViews, likePost: likePostFn, addComment, deleteComment } = usePosts()

const showDeleteForm = ref(false)
const deletePassword = ref('')
const showDeleteCommentModal = ref(false)
const deleteCommentId = ref<string | null>(null)
const deleteCommentPassword = ref('')

const newComment = ref({
  author: '',
  content: '',
  password: ''
})

onMounted(() => {
  incrementViews(props.post.id)
})

const goBack = () => {
  emit('back')
}

const goToMap = () => {
  // 나중에 지도 페이지로 이동
  window.alert('지도로 이동 (구현 예정)')
}

const likePost = () => {
  likePostFn(props.post.id)
}

const submitComment = () => {
  if (!newComment.value.author || !newComment.value.content || !newComment.value.password) {
    alert('모든 필드를 입력해주세요')
    return
  }

  if (newComment.value.password.length !== 4) {
    alert('비밀번호는 4자리여야 합니다')
    return
  }

  addComment(
    props.post.id,
    newComment.value.author,
    newComment.value.password,
    newComment.value.content
  )

  newComment.value = { author: '', content: '', password: '' }
}

const showDeleteCommentForm = (commentId: string) => {
  deleteCommentId.value = commentId
  showDeleteCommentModal.value = true
}

const confirmDeleteComment = () => {
  if (!deleteCommentId.value) return
  
  if (deleteComment(props.post.id, deleteCommentId.value, deleteCommentPassword.value)) {
    showDeleteCommentModal.value = false
    deleteCommentPassword.value = ''
  } else {
    alert('비밀번호가 틀렸습니다')
  }
}

const confirmDelete = () => {
  if (deletePassword.value.length !== 4) {
    alert('비밀번호는 4자리여야 합니다')
    return
  }

  emit('delete', props.post.id, deletePassword.value)
  showDeleteForm.value = false
}

const likeComment = (commentId: string) => {
  likeComment(commentId)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.post-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.back-btn {
  padding: 8px 16px;
  background: #f0f0f0;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 20px;
  font-weight: 600;
  transition: all 0.3s;
}

.back-btn:hover {
  background: #e0e0e0;
}

.post-container {
  background: white;
  border-radius: 8px;
  padding: 30px;
  margin-bottom: 30px;
  border: 1px solid #e0e0e0;
}

.post-header h1 {
  margin: 0 0 15px;
  color: #333;
  font-size: 28px;
}

.post-info {
  display: flex;
  gap: 20px;
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
}

.author {
  color: var(--primary-color);
  font-weight: 600;
}

.date {
  color: #999;
}

.stats {
  color: #999;
  margin-left: auto;
}

.location-section {
  margin: 20px 0;
}

.map-link-btn {
  background: #f0f8ff;
  color: var(--primary-color);
  border: 2px solid var(--primary-color);
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.map-link-btn:hover {
  background: var(--primary-color);
  color: white;
}

.post-content {
  color: #333;
  line-height: 1.8;
  font-size: 16px;
  white-space: pre-wrap;
  word-break: break-word;
  margin: 30px 0;
}

.post-actions {
  display: flex;
  gap: 10px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.action-btn {
  padding: 10px 16px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.action-btn:hover {
  background: #f0f0f0;
}

.action-btn.danger {
  color: #e74c3c;
  border-color: #e74c3c;
}

.action-btn.danger:hover {
  background: #ffe0e0;
}

.comments-section {
  background: white;
  border-radius: 8px;
  padding: 30px;
  border: 1px solid #e0e0e0;
}

.comments-section h3 {
  margin: 0 0 20px;
  color: #333;
}

.comment-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 30px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 6px;
}

.input-small {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

textarea {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
}

.submit-btn {
  padding: 10px 16px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.submit-btn:hover {
  background: var(--secondary-color);
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.comment-item {
  padding: 15px;
  background: #f9f9f9;
  border-radius: 6px;
  border-left: 3px solid var(--primary-color);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.comment-author {
  font-weight: 600;
  color: #333;
}

.comment-date {
  font-size: 12px;
  color: #999;
}

.comment-text {
  color: #666;
  margin: 8px 0;
  word-break: break-word;
}

.comment-actions {
  display: flex;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid #e0e0e0;
}

.comment-btn {
  padding: 4px 8px;
  background: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s;
}

.comment-btn:hover {
  background: #f0f0f0;
}

/* 모달 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  padding: 30px;
  min-width: 300px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.modal h3 {
  margin: 0 0 10px;
  color: #333;
}

.modal p {
  color: #666;
  margin: 0 0 15px;
}

.modal input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  margin-bottom: 20px;
  font-size: 14px;
}

.modal-actions {
  display: flex;
  gap: 10px;
}

.btn-danger,
.btn-cancel {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.btn-danger {
  background: #e74c3c;
  color: white;
}

.btn-danger:hover {
  background: #c0392b;
}

.btn-cancel {
  background: #f0f0f0;
  color: #333;
}

.btn-cancel:hover {
  background: #e0e0e0;
}

@media (max-width: 768px) {
  .post-container,
  .comments-section {
    padding: 20px;
  }

  .post-header h1 {
    font-size: 22px;
  }

  .post-info {
    flex-direction: column;
    gap: 10px;
  }

  .stats {
    margin-left: 0;
  }
}
</style>