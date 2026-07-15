<script setup lang="ts">
import { onMounted, ref, computed, inject } from 'vue'
import { useBookmarks } from '../composables/useBookmarks'
import { useReviews } from '../composables/useReviews'
import { usePosts } from '../composables/usePosts'

// Composables 로드
const { bookmarks, loadBookmarks } = useBookmarks()
const { reviews, loadReviews } = useReviews()
const { posts, loadPosts } = usePosts()

// App.vue에서 주입된 viewPost 함수
const viewPost = inject<(postId: string) => void>('viewPost', () => {})

// 사용자 이름 관리
const userName = ref('익명 유저')
const isEditingName = ref(false)
const newUserName = ref('')
const userNameStorageKey = 'user-profile-name'

// 현재 활성 탭
const activeTab = ref<'posts' | 'bookmarks' | 'reviews'>('posts')

// 내가 작성한 게시물 (평문 비밀번호는 보이지 않도록)
const myPosts = computed(() => {
  return posts.value.filter(p => p.boardType === 'free').map(p => ({
    ...p,
    password: '***' // 비밀번호 숨김
  }))
})

// 나의 리뷰
const myReviews = computed(() => {
  return reviews.value
})

// 찜한 장소
const myBookmarks = computed(() => {
  return bookmarks.value
})

// 통계
const stats = computed(() => ({
  posts: myPosts.value.length,
  bookmarks: myBookmarks.value.length,
  reviews: myReviews.value.length
}))

// 사용자 이름 로드
const loadUserName = () => {
  const saved = localStorage.getItem(userNameStorageKey)
  if (saved) {
    userName.value = saved
  }
}

// 사용자 이름 저장
const saveUserName = () => {
  localStorage.setItem(userNameStorageKey, userName.value)
}

// 이름 수정 시작
const startEditName = () => {
  newUserName.value = userName.value
  isEditingName.value = true
}

// 이름 수정 취소
const cancelEditName = () => {
  isEditingName.value = false
  newUserName.value = ''
}

// 이름 수정 완료
const saveName = () => {
  if (newUserName.value.trim()) {
    userName.value = newUserName.value.trim()
    saveUserName()
    isEditingName.value = false
    newUserName.value = ''
  }
}

onMounted(() => {
  loadUserName()
  loadPosts()
  loadBookmarks()
  loadReviews()
})

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
    <div class="mx-auto max-w-4xl">
      <!-- 프로필 헤더 -->
      <div class="mb-8 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white shadow-lg">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="text-6xl">👤</div>
            <div>
              <h1 class="text-3xl font-bold">{{ userName }}</h1>
              <p class="mt-2 opacity-90">서울 관광 커뮤니티 활동 내역</p>
            </div>
          </div>
          <button
            @click="startEditName"
            class="rounded-lg bg-white/20 px-4 py-2 font-semibold text-white transition-all hover:bg-white/30"
          >
            ✏️ 이름 수정
          </button>
        </div>
      </div>

      <!-- 이름 수정 모달 -->
      <div
        v-if="isEditingName"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      >
        <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
          <h2 class="mb-4 text-2xl font-bold text-gray-900">프로필 이름 수정</h2>
          <input
            v-model="newUserName"
            type="text"
            placeholder="새로운 이름을 입력하세요"
            class="mb-6 w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            @keyup.enter="saveName"
          />
          <div class="flex gap-3">
            <button
              @click="cancelEditName"
              class="flex-1 rounded-lg bg-gray-300 px-4 py-2 font-semibold text-gray-900 transition-all hover:bg-gray-400"
            >
              취소
            </button>
            <button
              @click="saveName"
              class="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-all hover:bg-blue-700"
            >
              저장
            </button>
          </div>
        </div>
      </div>

      <!-- 통계 카드 -->
      <div class="mb-8 grid grid-cols-3 gap-4">
        <div class="rounded-lg bg-white p-6 shadow-md">
          <div class="text-center">
            <div class="text-3xl font-bold text-blue-600">{{ stats.posts }}</div>
            <p class="mt-2 text-gray-600">작성한 게시물</p>
          </div>
        </div>
        <div class="rounded-lg bg-white p-6 shadow-md">
          <div class="text-center">
            <div class="text-3xl font-bold text-rose-600">{{ stats.bookmarks }}</div>
            <p class="mt-2 text-gray-600">찜한 장소</p>
          </div>
        </div>
        <div class="rounded-lg bg-white p-6 shadow-md">
          <div class="text-center">
            <div class="text-3xl font-bold text-amber-600">{{ stats.reviews }}</div>
            <p class="mt-2 text-gray-600">작성한 리뷰</p>
          </div>
        </div>
      </div>

      <!-- 탭 네비게이션 -->
      <div class="mb-6 flex gap-4 border-b border-gray-200">
        <button
          @click="activeTab = 'posts'"
          :class="[
            'pb-3 px-4 font-semibold transition-colors',
            activeTab === 'posts'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          ]"
        >
          📝 작성한 게시물 ({{ stats.posts }})
        </button>
        <button
          @click="activeTab = 'bookmarks'"
          :class="[
            'pb-3 px-4 font-semibold transition-colors',
            activeTab === 'bookmarks'
              ? 'border-b-2 border-rose-600 text-rose-600'
              : 'text-gray-600 hover:text-gray-900'
          ]"
        >
          ♥ 찜한 장소 ({{ stats.bookmarks }})
        </button>
        <button
          @click="activeTab = 'reviews'"
          :class="[
            'pb-3 px-4 font-semibold transition-colors',
            activeTab === 'reviews'
              ? 'border-b-2 border-amber-600 text-amber-600'
              : 'text-gray-600 hover:text-gray-900'
          ]"
        >
          ⭐ 작성한 리뷰 ({{ stats.reviews }})
        </button>
      </div>

      <!-- 콘텐츠 영역 -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <!-- 작성한 게시물 탭 -->
        <div v-show="activeTab === 'posts'">
          <div v-if="myPosts.length > 0" class="space-y-4">
            <button
              v-for="post in myPosts"
              :key="post.id"
              @click="viewPost(post.id)"
              class="w-full text-left rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all hover:bg-gray-50 cursor-pointer"
            >
              <div class="mb-2 flex items-start justify-between">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">{{ post.title }}</h3>
                  <p class="mt-1 text-sm text-gray-600">{{ post.author }}</p>
                </div>
                <span class="inline-block rounded bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-600">
                  {{ post.boardType === 'free' ? '자유' : '추천' }}
                </span>
              </div>
              <p class="text-gray-700 line-clamp-2">{{ post.content }}</p>
              <div class="mt-3 flex gap-4 text-xs text-gray-500">
                <span>👁️ {{ post.views }}</span>
                <span>❤️ {{ post.likes }}</span>
                <span>{{ formatDate(post.createdAt) }}</span>
              </div>
            </button>
          </div>
          <div v-else class="text-center py-8">
            <p class="text-gray-500 text-lg">아직 작성한 게시물이 없습니다.</p>
          </div>
        </div>


        <!-- 찜한 장소 탭 -->
        <div v-show="activeTab === 'bookmarks'">
          <div v-if="myBookmarks.length > 0" class="space-y-4">
            <div
              v-for="bookmark in myBookmarks"
              :key="bookmark.contentid"
              class="rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div class="mb-2 flex items-start justify-between">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">{{ bookmark.title }}</h3>
                  <p class="mt-1 text-sm text-gray-600">
                    {{ bookmark.attractionData?.address || '주소 정보 없음' }}
                  </p>
                </div>
                <span class="text-2xl">♥️</span>
              </div>
              <p class="text-gray-700 text-sm">
                카테고리: {{ bookmark.attractionData?.category || '미분류' }}
              </p>
              <div class="mt-3 text-xs text-gray-500">
                <span>{{ formatDate(bookmark.bookmarkedAt) }}에 찜함</span>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8">
            <p class="text-gray-500 text-lg">아직 찜한 장소가 없습니다.</p>
          </div>
        </div>

        <!-- 작성한 리뷰 탭 -->
        <div v-show="activeTab === 'reviews'">
          <div v-if="myReviews.length > 0" class="space-y-4">
            <div
              v-for="review in myReviews"
              :key="review.id"
              class="rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div class="mb-2 flex items-start justify-between">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">{{ review.title }}</h3>
                  <p class="mt-1 text-sm text-gray-600">{{ review.userName }}</p>
                </div>
                <div class="flex gap-1">
                  <span v-for="i in 5" :key="i" class="text-lg">
                    {{ i <= review.rating ? '⭐' : '☆' }}
                  </span>
                </div>
              </div>
              <p class="text-gray-700 line-clamp-2">{{ review.content }}</p>
              <div class="mt-3 flex gap-4 text-xs text-gray-500">
                <span>👍 {{ review.likes }}</span>
                <span>{{ formatDate(review.createdAt) }}</span>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8">
            <p class="text-gray-500 text-lg">아직 작성한 리뷰가 없습니다.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 