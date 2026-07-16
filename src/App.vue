<script setup lang="ts">
import { ref, onMounted, defineAsyncComponent, provide } from 'vue'
import ChatWidget from './components/ChatWidget.vue'

import { useAttractions } from './composables/useAttractions'
import { useReviews } from './composables/useReviews'
import { useBookmarks } from './composables/useBookmarks'
import { useComments } from './composables/useComments'
import { useFestivals } from './composables/useFestivals'
import { useMatching } from './composables/useMatching'
import { useUserProfile } from './composables/useUserProfile'

const { initializeAttractions } = useAttractions()
const { loadReviews } = useReviews()
const { loadBookmarks } = useBookmarks()
const { loadComments } = useComments()
const { loadFestivals } = useFestivals()
const { loadMatchingPosts } = useMatching()
const { loadUserProfile } = useUserProfile()

onMounted(async () => {
  // 관광지 데이터를 먼저 로드(비동기 완료 대기)해야 리뷰 마이그레이션 등 동기화가 잘 됨
  await initializeAttractions()
  loadReviews()
  loadBookmarks()
  loadComments()
  loadFestivals()
  loadMatchingPosts()
  loadUserProfile()
})

// Lazy / safe component imports (fallback to HelloWorld if missing)
const Home = defineAsyncComponent(() => import('./components/HelloWorld.vue'))
const Bookmarks = defineAsyncComponent(() => import('./components/BookmarkPanel.vue'))
const Profile = defineAsyncComponent(() => import('./components/ProfilePage.vue').catch(() => import('./components/HelloWorld.vue')))
const Community = defineAsyncComponent(() => import('./components/CommunityPage.vue').catch(() => import('./components/HelloWorld.vue')))
const PostDetail = defineAsyncComponent(() => import('./components/PostDetailView.vue').catch(() => import('./components/HelloWorld.vue')))
const Matching = defineAsyncComponent(() => import('./components/MatchingPage.vue').catch(() => import('./components/HelloWorld.vue')))
const MapPage = defineAsyncComponent(() => import('./components/MapPage.vue').catch(() => import('./components/HelloWorld.vue')))
const FestivalCalendar = defineAsyncComponent(() => import('./components/FestivalCalendar.vue').catch(() => import('./components/HelloWorld.vue')))

type PageType = 'home'|'bookmarks'|'profile'|'community'|'postDetail'|'matching'|'map'|'calendar'
const currentPage = ref<PageType>('home')
const selectedPostId = ref<string | null>(null)

// Map 포커스용 상태 및 함수 (단일 정의)
const mapFocusContentId = ref<string | null>(null)
const focusAttraction = (contentid: string) => {
  mapFocusContentId.value = contentid
  go('map')
}

const currentComponent = () => {
  switch (currentPage.value) {
    case 'home': return Home
    case 'bookmarks': return Bookmarks
    case 'profile': return Profile
    case 'community': return Community
    case 'postDetail': return PostDetail
    case 'matching': return Matching
    case 'map': return MapPage
    case 'calendar': return FestivalCalendar
    default: return Home
  }
}

const go = (page: PageType) => {
  currentPage.value = page
}
// App.vue 쪽: provide('communityOpenParams', communityOpenParams)
const communityOpenParams = ref<{ board?: 'free'|'attraction'; openForm?: boolean; postId?: string } | null>(null)
const openCommunity = (params: { board?: 'free'|'attraction'; openForm?: boolean; postId?: string } = {}) => {
  communityOpenParams.value = params
  go('community')
}
provide('communityOpenParams', communityOpenParams)
provide('openCommunity', openCommunity)

// 게시물 상세 페이지로 이동
const viewPost = (postId: string) => {
  selectedPostId.value = postId
  currentPage.value = 'postDetail'
}

// 게시물 목록으로 돌아가기
const backToCommunity = () => {
  selectedPostId.value = null
  currentPage.value = 'community'
}

// provide로 함수/상태 제공
provide('go', go)
provide('viewPost', viewPost)
provide('backToCommunity', backToCommunity)
provide('selectedPostId', selectedPostId)
provide('mapFocusContentId', mapFocusContentId)
provide('focusAttraction', focusAttraction)
</script>

<template>
  <div id="app" class="app-shell">
    <nav class="navbar">
      <div class="navbar-left" @click="go('home')" role="button" aria-label="홈으로">
        <h1 class="brand">🌍 서울 여행 커뮤니티</h1>
      </div>

      <ul class="nav-tabs" role="tablist">
        <li :class="['tab', { active: currentPage === 'home' }]" @click="go('home')">🏠 홈</li>
        <li :class="['tab', { active: currentPage === 'bookmarks' }]" @click="go('bookmarks')">♥ 찜</li>
        <li :class="['tab', { active: currentPage === 'profile' }]" @click="go('profile')">👤 프로필</li>
        <li :class="['tab', { active: currentPage === 'community' }]" @click="go('community')">💬 커뮤니티</li>
        <li :class="['tab', { active: currentPage === 'matching' }]" @click="go('matching')">🧑‍🤝‍🧑 매칭</li>
        <li :class="['tab', { active: currentPage === 'map' }]" @click="go('map')">🗺️ 지도</li>
        <li :class="['tab', { active: currentPage === 'calendar' }]" @click="go('calendar')">🎉 축제</li>
      </ul>
    </nav>

    <main class="main-content">
      <component :is="currentComponent()" />
    </main>

    <ChatWidget />
  </div>
</template>

<style scoped>
* { box-sizing: border-box; }
.app-shell { min-height: 100vh; display: flex; flex-direction: column; background: #f5f7fb; color: #1f2937; }

/* Navbar */
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 20px;
  background: var(--primary-color);
  color: #fff;
  position: sticky;
  top: 0;
  z-index: 200;
  box-shadow: 0 6px 18px rgba(0,0,0,0.08);
}
.brand { margin: 0; font-size: 18px; cursor: pointer; user-select: none; }
.nav-tabs { display: flex; gap: 8px; list-style: none; margin: 0; padding: 0; align-items: center; }
.tab {
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(255,255,255,0.12);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s;
}
.tab:hover { transform: translateY(-1px); background: rgba(255,255,255,0.18); }
.tab.active { background: #fff; color: var(--primary-color); box-shadow: 0 6px 18px rgba(102,126,234,0.12); }

/* Main */
.main-content {
  width: 100%;
  max-width: 1300px;
  margin: 24px auto;
  padding: 16px;
  flex: 1 1 auto;
  box-sizing: border-box;
}

/* Responsive */
@media (max-width: 900px) {
  .nav-tabs { gap: 6px; flex-wrap: wrap; justify-content: center; }
  .brand { font-size: 16px; }
  .main-content { margin: 16px; padding: 12px; }
}
</style>