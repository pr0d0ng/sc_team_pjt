<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Attraction, SearchFilter } from './types/tourism'
import { useAttractions } from './composables/useAttractions'
import { useReviews } from './composables/useReviews'
import { useBookmarks } from './composables/useBookmarks'
import { useComments } from './composables/useComments'
import ChatWidget from './components/ChatWidget.vue'
import SearchBar from './components/SearchBar.vue'
import AttractionsList from './components/AttractionsList.vue'
import AttractionDetail from './components/AttractionDetail.vue'
import BookmarkPanel from './components/BookmarkPanel.vue'

type PageType = 'home' | 'bookmarks' | 'profile'

const currentPage = ref<PageType>('home')
const selectedAttraction = ref<Attraction | null>(null)

const {
  filteredAttractions,
  initializeAttractions,
  searchAttractions,
  getAttractionDetail
} = useAttractions()

const { loadReviews } = useReviews()
const { loadBookmarks } = useBookmarks()
const { loadComments } = useComments()

onMounted(() => {
  initializeAttractions()
  loadReviews()
  loadBookmarks()
  loadComments()
})

const handleSearch = (filter: SearchFilter) => {
  searchAttractions(filter)
}

const handleSelectAttraction = (attraction: Attraction) => {
  getAttractionDetail(attraction.contentid)
  selectedAttraction.value = attraction
  currentPage.value = 'home'
}

const handleBack = () => {
  selectedAttraction.value = null
}
</script>

<template>
  <div class="app">
    <nav class="navbar">
      <div class="navbar-brand">
        <h1>🌍 서울 관광 커뮤니티</h1>
      </div>
      <div class="navbar-menu">
        <button
          @click="currentPage = 'home'"
          :class="['nav-btn', { active: currentPage === 'home' }]"
        >
          🏠 홈
        </button>
        <button
          @click="currentPage = 'bookmarks'"
          :class="['nav-btn', { active: currentPage === 'bookmarks' }]"
        >
          ♥ 찜한 것
        </button>
        <button
          @click="currentPage = 'profile'"
          :class="['nav-btn', { active: currentPage === 'profile' }]"
        >
          👤 프로필
        </button>
      </div>
    </nav>

    <main class="main-content">
      <!-- 홈 페이지 -->
      <div v-if="currentPage === 'home'" class="page">
        <div v-if="!selectedAttraction" class="home-content">
          <SearchBar @search="handleSearch" />
          <AttractionsList
            :attractions="filteredAttractions"
            @select="handleSelectAttraction"
          />
        </div>
        <div v-else class="detail-view">
          <AttractionDetail
            :attraction="selectedAttraction"
            @back="handleBack"
          />
        </div>
      </div>

      <!-- 북마크 페이지 -->
      <div v-if="currentPage === 'bookmarks'" class="page">
        <BookmarkPanel @select="handleSelectAttraction" />
      </div>

      <!-- 프로필 페이지 -->
      <div v-if="currentPage === 'profile'" class="page profile-page">
        <div class="profile-container">
          <h2>📋 마이 페이지</h2>
          <div class="profile-info">
            <p><strong>사용 가이드:</strong></p>
            <ul>
              <li>🔍 검색창에서 관광지, 레포츠, 문화시설 등을 찾아보세요</li>
              <li>♡ 관광지를 클릭하여 상세 정보와 지도를 확인하세요</li>
              <li>⭐ 리뷰를 작성하여 다른 사용자와 경험을 공유하세요</li>
              <li>💬 다른 사용자의 리뷰에 댓글로 대화를 나누세요</li>
              <li>♥ 찜한 목록에서 관심 있는 장소들을 한눈에 볼 수 있습니다</li>
            </ul>
          </div>
          <div class="data-source">
            <h3>📊 데이터 출처</h3>
            <p>한국관광공사 Tour API 4.0</p>
            <p>라이선스: 공공누리 제3유형 (출처 표시)</p>
          </div>
        </div>
      </div>
    </main>

    <!-- 채팅 위젯 -->
    <ChatWidget />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #f5f5f5;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-brand h1 {
  font-size: 24px;
  margin: 0;
  padding: 16px 0;
  letter-spacing: 0.5px;
}

.navbar-menu {
  display: flex;
  gap: 10px;
}

.nav-btn {
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  font-size: 14px;
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.nav-btn.active {
  background: white;
  color: #667eea;
}

.main-content {
  flex: 1;
  padding: 30px 40px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.page {
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.home-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.detail-view {
  animation: slideIn 0.3s;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.profile-page {
  max-width: 600px;
}

.profile-container {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.profile-container h2 {
  color: #333;
  margin-bottom: 20px;
  font-size: 28px;
}

.profile-info {
  margin-bottom: 30px;
  padding-bottom: 30px;
  border-bottom: 1px solid #eee;
}

.profile-info p {
  color: #667eea;
  font-weight: 600;
  margin-bottom: 12px;
}

.profile-info ul {
  list-style: none;
  padding-left: 0;
}

.profile-info li {
  padding: 8px 0 8px 24px;
  color: #666;
  position: relative;
}

.profile-info li:before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #667eea;
  font-weight: bold;
}

.data-source {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
}

.data-source h3 {
  color: #333;
  margin-bottom: 10px;
}

.data-source p {
  color: #666;
  margin: 5px 0;
  font-size: 14px;
}

@media (max-width: 1024px) {
  .navbar {
    padding: 0 20px;
  }

  .main-content {
    padding: 20px;
  }
}

@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    gap: 10px;
    padding: 15px 20px;
  }

  .navbar-brand h1 {
    font-size: 18px;
  }

  .navbar-menu {
    width: 100%;
    justify-content: space-around;
  }

  .nav-btn {
    flex: 1;
    padding: 8px 12px;
    font-size: 12px;
  }

  .main-content {
    padding: 15px;
  }
}
</style>