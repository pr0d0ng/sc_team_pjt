<script setup lang="ts">
import { ref, onMounted, defineAsyncComponent, provide } from 'vue'
import { useAttractions } from './composables/useAttractions'
import { useReviews } from './composables/useReviews'
import { useBookmarks } from './composables/useBookmarks'
import { useComments } from './composables/useComments'
import { useFestivals } from './composables/useFestivals'
import { useMatching } from './composables/useMatching'

// 초기화
const { initializeAttractions } = useAttractions()
const { loadReviews } = useReviews()
const { loadBookmarks } = useBookmarks()
const { loadComments } = useComments()
const { loadFestivals } = useFestivals()
const { loadMatchingPosts } = useMatching()

onMounted(() => {
  initializeAttractions()
  loadReviews()
  loadBookmarks()
  loadComments()
  loadFestivals()
  loadMatchingPosts()
})

// lazy components
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
  <div class="app">
    <nav class="navbar">
      <div class="navbar-brand">
        <h1 @click="go('home')">🌍 서울 관광 커뮤니티</h1>
      </div>

      <div class="navbar-menu">
        <button :class="['nav-btn', { active: currentPage === 'home' }]" @click="go('home')">🏠 홈</button>
        <button :class="['nav-btn', { active: currentPage === 'bookmarks' }]" @click="go('bookmarks')">♥ 찜한 것</button>
        <button :class="['nav-btn', { active: currentPage === 'profile' }]" @click="go('profile')">👤 프로필</button>

        <button :class="['nav-btn', { active: currentPage === 'community' }]" @click="go('community')">💬 커뮤니티</button>
        <button :class="['nav-btn', { active: currentPage === 'matching' }]" @click="go('matching')">🧑‍🤝‍🧑 매칭</button>
        <button :class="['nav-btn', { active: currentPage === 'map' }]" @click="go('map')">🗺️ 지도</button>
        <button :class="['nav-btn', { active: currentPage === 'calendar' }]" @click="go('calendar')">🎉 축제</button>
      </div>
    </nav>

    <main class="main-content">
      <component :is="currentComponent()" />
    </main>
  </div>
</template>

<style>
.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 10px 24px;
  display:flex;
  justify-content:space-between;
  align-items:center;
}
.navbar-brand h1 { cursor:pointer; margin:0; font-size:18px }
.navbar-menu { display:flex; gap:8px; }
.nav-btn {
  padding:8px 12px;
  background: rgba(255,255,255,0.14);
  border-radius:8px;
  color:white;
  border:none;
  cursor:pointer;
  font-weight:600;
}
.nav-btn.active {
  background:white;
  color:#667eea;
}
.main-content { padding:20px; min-height:calc(100vh - 64px) }
</style>