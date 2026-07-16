<template>
  <div class="matching-page">
    <div class="matching-header">
      <h1>👫 같이 여행갈 친구 찾기</h1>
      <p>서울의 구별로 함께 놀 친구를 찾아보세요!</p>
      <button @click="showForm = true" class="write-btn">✍️ 매칭 글 작성</button>
    </div>

    <!-- 서울 구별 지도 -->
    <div class="seoul-map">
      <div class="map-grid">
        <div
          v-for="gu in seoulGus"
          :key="gu.code"
          @click="selectGu(gu.name)"
          :class="['gu-card', { active: selectedGu === gu.name }]"
        >
          <span class="gu-name">{{ gu.name }}</span>
          <span class="post-count">{{ getPostCountByGu(gu.name) }}건</span>
        </div>
      </div>
    </div>

    <!-- 선택된 구의 매칭 글 -->
    <div v-if="selectedGu" class="posts-section">
      <h2>{{ selectedGu }} 관련 매칭</h2>

      <div v-if="selectedGuPosts.length === 0" class="empty-state">
        <p>{{ selectedGu }}에 등록된 글이 없습니다</p>
        <p class="hint">첫 번째 글을 작성해보세요!</p>
      </div>

      <div v-else class="posts-grid">
        <div
          v-for="post in selectedGuPosts"
          :key="post.id"
          class="matching-card"
          @click="selectPost(post)"
        >
          <div class="card-header">
            <h3>{{ post.title }}</h3>
            <span class="date">{{ formatDate(post.createdAt) }}</span>
          </div>

          <div class="card-meta">
            <span class="gender" :class="`gender-${post.gender}`">
              {{ genderLabel(post.gender) }}
            </span>
            <span class="age">{{ post.age }}</span>
          </div>

          <p class="excerpt">{{ post.content.slice(0, 80) }}...</p>

          <div class="interests">
            <span v-for="interest in post.interests" :key="interest" class="tag">
              {{ interest }}
            </span>
          </div>

          <div class="post-stats">
            <span>👁 {{ post.views }}</span>
            <span>❤️ {{ post.likes }}</span>
          </div>

          <a :href="post.kakaoLink" target="_blank" class="kakao-btn">
            🔗 오픈톡 바로가기
          </a>
        </div>
      </div>
    </div>

    <!-- 상세보기 모달 -->
    <div v-if="selectedPost && !showForm" class="modal-overlay" @click="selectedPost = null">
      <div class="modal" @click.stop>
        <button @click="selectedPost = null" class="close-btn">✕</button>

        <h2>{{ selectedPost.title }}</h2>
        <div class="modal-meta">
          <span>{{ selectedPost.gu }} · {{ selectedPost.age}} · {{ genderLabel(selectedPost.gender) }}</span>
          <span>{{ formatDate(selectedPost.createdAt) }}</span>
        </div>

        <div class="modal-content">
          {{ selectedPost.content }}
        </div>

        <div class="interests-large">
          <span v-for="interest in selectedPost.interests" :key="interest" class="tag">
            {{ interest }}
          </span>
        </div>

        <a :href="selectedPost.kakaoLink" target="_blank" class="kakao-btn-large">
          🔗 오픈톡 채팅방 입장하기
        </a>

        <button @click="deletPost(selectedPost.id)" class="delete-btn">삭제</button>
      </div>
    </div>

    <!-- 작성 폼 -->
    <div v-if="showForm" class="modal-overlay" @click="showForm = false">
      <div class="modal form-modal" @click.stop>
        <button @click="showForm = false" class="close-btn">✕</button>

        <h2>매칭 글 작성</h2>

        <form @submit.prevent="submitPost">
          <div class="form-group">
            <label>구 선택</label>
            <select v-model="form.gu" required>
              <option value="">선택해주세요</option>
              <option v-for="gu in seoulGus" :key="gu.code" :value="gu.name">
                {{ gu.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>제목</label>
            <input
              v-model="form.title"
              type="text"
              placeholder="예) 강남에서 놀 20대 여성 구합니다"
              required
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>나이대</label>
              <select v-model="form.age" required>
                <option value="">선택</option>
                <option value="10대">10대</option>
                <option value="20대">20대</option>
                <option value="30대">30대</option>
                <option value="40대">40대</option>
                <option value="50대">50대 이상</option>
              </select>
            </div>

            <div class="form-group">
              <label>성별</label>
              <select v-model="form.gender" required>
                <option value="All">무관</option>
                <option value="M">남자</option>
                <option value="F">여자</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>관심사 (콤마로 구분)</label>
            <input
              v-model="form.interestsText"
              type="text"
              placeholder="쇼핑, 맛집, 야경 등"
            />
          </div>

          <div class="form-group">
            <label>내용</label>
            <textarea
              v-model="form.content"
              placeholder="자신을 소개하고 함께하고 싶은 활동을 설명해주세요"
              rows="5"
              required
            ></textarea>
          </div>

          <div class="form-group">
            <label>오픈톡 링크</label>
            <input
              v-model="form.kakaoLink"
              type="url"
              placeholder="https://open.kakao.com/..."
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
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-submit">등록</button>
            <button type="button" @click="showForm = false" class="btn-cancel">취소</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMatching } from '../composables/useMatching'
import { seoulGuData } from '../utils/seoul-gu-data'
import type { MatchingPost } from '../types/tourism'

const { matchingPosts, loadMatchingPosts, createMatchingPost, deleteMatchingPost } = useMatching()

const selectedGu = ref<string | null>(null)
const selectedPost = ref<MatchingPost | null>(null)
const showForm = ref(false)

const form = ref({
  gu: '',
  title: '',
  age: '',
  gender: 'All' as 'M' | 'F' | 'All',
  interestsText: '',
  content: '',
  kakaoLink: '',
  password: ''
})

const seoulGus = seoulGuData

const selectedGuPosts = computed(() => {
  if (!selectedGu.value) return []
  return matchingPosts.value.filter(p => p.gu === selectedGu.value)
})

onMounted(() => {
  loadMatchingPosts()
})

const selectGu = (gu: string) => {
  selectedGu.value = selectedGu.value === gu ? null : gu
}

const selectPost = (post: MatchingPost) => {
  selectedPost.value = post
}

const getPostCountByGu = (gu: string) => {
  return matchingPosts.value.filter(p => p.gu === gu).length
}

const genderLabel = (gender: 'M' | 'F' | 'All') => {
  const labels = { M: '남자', F: '여자', All: '무관' }
  return labels[gender]
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('ko-KR')
}

const submitPost = () => {
  if (form.value.password.length !== 4 || !/^\d{4}$/.test(form.value.password)) {
    alert('비밀번호는 4자리 숫자여야 합니다')
    return
  }

  const interests = form.value.interestsText
    .split(',')
    .map(i => i.trim())
    .filter(i => i.length > 0)

  createMatchingPost(
    form.value.gu,
    form.value.title,
    form.value.content,
    '익명',
    form.value.password,
    form.value.kakaoLink,
    interests,
    form.value.age,
    form.value.gender
  )

  form.value = {
    gu: '',
    title: '',
    age: '',
    gender: 'All',
    interestsText: '',
    content: '',
    kakaoLink: '',
    password: ''
  }
  showForm.value = false
  alert('매칭 글이 등록되었습니다!')
}

const deletPost = (postId: string) => {
  const password = prompt('비밀번호를 입력하세요:')
  if (password && deleteMatchingPost(postId, password)) {
    selectedPost.value = null
    alert('삭제되었습니다')
  } else {
    alert('비밀번호가 틀렸습니다')
  }
}
</script>

<style scoped>
.matching-page {
  padding: 30px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.matching-header {
  text-align: center;
  margin-bottom: 40px;
}

.matching-header h1 {
  font-size: 32px;
  color: #333;
  margin-bottom: 10px;
}

.matching-header p {
  color: #666;
  font-size: 16px;
  margin-bottom: 20px;
}

.write-btn {
  padding: 12px 24px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.write-btn:hover {
  background: var(--secondary-color);
}

.seoul-map {
  margin-bottom: 40px;
}

.map-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
}

.gu-card {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.gu-card:hover {
  border-color: var(--primary-color);
  background: #f9f9f9;
}

.gu-card.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.gu-name {
  display: block;
  font-weight: 600;
  margin-bottom: 4px;
}

.post-count {
  display: block;
  font-size: 12px;
  opacity: 0.8;
}

.posts-section {
  margin-top: 40px;
}

.posts-section h2 {
  margin-bottom: 20px;
  color: #333;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  background: #f9f9f9;
  border-radius: 8px;
}

.hint {
  font-size: 13px;
  color: #bbb;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.matching-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.matching-card:hover {
  border-color: var(--primary-color);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
  transform: translateY(-5px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.date {
  font-size: 12px;
  color: #999;
}

.card-meta {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.gender {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.gender-M {
  background: #e3f2fd;
  color: #1976d2;
}

.gender-F {
  background: #fce4ec;
  color: #c2185b;
}

.gender-All {
  background: #f3e5f5;
  color: #7b1fa2;
}

.age {
  padding: 4px 8px;
  background: #f0f0f0;
  border-radius: 4px;
  font-size: 12px;
}

.excerpt {
  color: #666;
  margin: 12px 0;
  font-size: 14px;
}

.interests {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 12px 0;
}

.tag {
  background: #f0f8ff;
  color: var(--primary-color);
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.post-stats {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #999;
  margin: 12px 0;
  padding: 12px 0;
  border-top: 1px solid #f0f0f0;
}

.kakao-btn {
  display: inline-block;
  width: 100%;
  padding: 10px;
  background: #fbe34d;
  color: #3c1e1e;
  text-align: center;
  border-radius: 6px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s;
  margin-top: 12px;
}

.kakao-btn:hover {
  background: #f5d547;
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
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.modal h2 {
  margin: 0 0 20px;
  color: #333;
}

.modal-meta {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #999;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-content {
  color: #666;
  line-height: 1.8;
  margin: 20px 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.interests-large {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 20px 0;
}

.kakao-btn-large {
  display: block;
  padding: 12px;
  background: #fbe34d;
  color: #3c1e1e;
  text-align: center;
  border-radius: 6px;
  font-weight: 600;
  text-decoration: none;
  margin: 20px 0;
}

.delete-btn {
  width: 100%;
  padding: 10px;
  background: #ffe0e0;
  color: #e74c3c;
  border: 1px solid #e74c3c;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

/* 폼 */
.form-modal {
  max-width: 600px;
}

form {
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
.form-group select,
.form-group textarea {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
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
  .matching-page {
    padding: 20px 15px;
  }

  .map-grid {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  }

  .posts-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>