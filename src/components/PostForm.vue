<template>
  <div class="post-form-container">
    <div class="form-header">
      <h2>새 글 작성</h2>
      <button @click="cancel" class="close-btn">✕</button>
    </div>

    <form @submit.prevent="submit" class="post-form">
      <div class="form-group">
        <label>제목</label>
        <input
          v-model="form.title"
          type="text"
          placeholder="제목을 입력하세요"
          required
        />
      </div>

      <div class="form-group">
        <label>내용</label>
        <textarea
          v-model="form.content"
          placeholder="내용을 입력하세요"
          rows="8"
          required
        ></textarea>
      </div>

      <div v-if="boardType === 'attraction'" class="form-group">
        <label>명소명 (선택사항)</label>
        <input
          v-model="form.location"
          type="text"
          placeholder="추천하는 명소 이름을 입력하세요"
        />
      </div>

      <div class="form-group">
        <label>이름</label>
        <input
          v-model="form.author"
          type="text"
          placeholder="이름을 입력하세요"
          required
        />
      </div>

      <div class="form-group">
        <label>비밀번호 (4자리)</label>
        <input
          v-model="form.password"
          type="password"
          placeholder="4자리 숫자"
          maxlength="4"
          pattern="[0-9]{4}"
          required
        />
        <small>나중에 글을 수정하거나 삭제할 때 사용됩니다</small>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn-submit">작성 완료</button>
        <button type="button" @click="cancel" class="btn-cancel">취소</button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  boardType: 'free' | 'attraction'
}>()

const emit = defineEmits<{
  submit: [data: {
    title: string
    content: string
    author: string
    password: string
    location?: string
  }]
  cancel: []
}>()

const form = ref({
  title: '',
  content: '',
  author: '',
  password: '',
  location: ''
})

const submit = () => {
  if (form.value.password.length !== 4 || !/^\d{4}$/.test(form.value.password)) {
    alert('비밀번호는 4자리 숫자여야 합니다')
    return
  }

  emit('submit', {
    title: form.value.title,
    content: form.value.content,
    author: form.value.author,
    password: form.value.password,
    location: form.value.location || undefined
  })

  // 폼 초기화
  form.value = { title: '', content: '', author: '', password: '', location: '' }
}

const cancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.post-form-container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  padding: 30px;
  border: 1px solid #e0e0e0;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
}

.form-header h2 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.post-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.form-group input,
.form-group textarea {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group small {
  margin-top: 6px;
  color: #999;
  font-size: 12px;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn-submit,
.btn-cancel {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s;
}

.btn-submit {
  background: var(--primary-color);
  color: white;
}

.btn-submit:hover {
  background: var(--secondary-color);
}

.btn-cancel {
  background: #f0f0f0;
  color: #333;
}

.btn-cancel:hover {
  background: #e0e0e0;
}

@media (max-width: 768px) {
  .post-form-container {
    padding: 20px;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>