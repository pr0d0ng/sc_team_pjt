<script setup lang="ts">
import { onMounted, ref, computed, inject } from 'vue'
import { useBookmarks } from '../composables/useBookmarks'
import { useReviews } from '../composables/useReviews'
import { usePosts } from '../composables/usePosts'
import { useUserProfile } from '../composables/useUserProfile'

const { bookmarks, loadBookmarks } = useBookmarks()
const { reviews, loadReviews, updateReview, deleteReview } = useReviews()
const { posts, loadPosts } = usePosts()
const { currentUser, loadUserProfile } = useUserProfile()

const viewPost = inject<(postId: string) => void>('viewPost', () => {})

const userName = ref('익명 유저')
const isEditingName = ref(false)
const newUserName = ref('')
const userNameStorageKey = 'user-profile-name'
const activeTab = ref<'posts' | 'bookmarks' | 'reviews'>('posts')

const myPosts = computed(() => {
  return posts.value.filter(p => p.boardType === 'free').map(p => ({
    ...p,
    password: '***'
  }))
})

const myReviews = computed(() => reviews.value.slice().reverse())

const myBookmarks = computed(() => bookmarks.value.slice().reverse())

const stats = computed(() => ({
  posts: myPosts.value.length,
  bookmarks: myBookmarks.value.length,
  reviews: myReviews.value.length
}))

const loadUserName = () => {
  const saved = localStorage.getItem(userNameStorageKey)
  if (saved) {
    userName.value = saved
  }
}

const saveUserName = () => {
  localStorage.setItem(userNameStorageKey, userName.value)
}

const startEditName = () => {
  newUserName.value = userName.value
  isEditingName.value = true
}

const cancelEditName = () => {
  isEditingName.value = false
  newUserName.value = ''
}

const saveName = () => {
  if (newUserName.value.trim()) {
    userName.value = newUserName.value.trim()
    saveUserName()
    isEditingName.value = false
    newUserName.value = ''
  }
}

const getCategoryLabel = (contenttypeid?: string) => {
  const map: Record<string, string> = {
    '12': '관광지',
    '14': '문화시설',
    '28': '레포츠',
    '32': '숙박',
    '38': '쇼핑',
    '25': '여행코스'
  }
  return map[contenttypeid || ''] || '미분류'
}

const getBookmarkAddress = (bookmark: any) => {
  return bookmark?.attractionData?.addr1 || bookmark?.attractionData?.addr2 || '주소 정보 없음'
}

const currentUserId = ref('')
const loadCurrentUserId = () => {
  const saved = localStorage.getItem('review-user-id')
  if (saved) {
    currentUserId.value = saved
  } else {
    const generated = `review-user-${Date.now()}`
    currentUserId.value = generated
    localStorage.setItem('review-user-id', generated)
  }
}

const isMyReview = (review: any) => {
  const myId = currentUser.value?.id || currentUserId.value
  return review.userId === myId
}

const editingReviewId = ref<string | null>(null)
const editingReviewTitle = ref('')
const editingReviewContent = ref('')
const editingReviewRating = ref(5)

const showReviewDeleteConfirm = ref(false)
const reviewDeleteTargetId = ref<string | null>(null)

const startEditReview = (review: any) => {
  editingReviewId.value = review.id
  editingReviewTitle.value = review.title
  editingReviewContent.value = review.content
  editingReviewRating.value = review.rating
}

const cancelEditReview = () => {
  editingReviewId.value = null
  editingReviewTitle.value = ''
  editingReviewContent.value = ''
  editingReviewRating.value = 5
}

const saveReviewEdit = (id: string) => {
  if (!editingReviewTitle.value.trim() || !editingReviewContent.value.trim()) {
    alert('제목과 내용을 입력하세요.')
    return
  }
  updateReview(id, {
    title: editingReviewTitle.value.trim(),
    content: editingReviewContent.value.trim(),
    rating: editingReviewRating.value
  })
  cancelEditReview()
}

const confirmDeleteReview = (id: string) => {
  reviewDeleteTargetId.value = id
  showReviewDeleteConfirm.value = true
}

const cancelDeleteReview = () => {
  showReviewDeleteConfirm.value = false
  reviewDeleteTargetId.value = null
}

const deleteSelectedReview = () => {
  if (!reviewDeleteTargetId.value) return
  deleteReview(reviewDeleteTargetId.value)
  cancelDeleteReview()
}

onMounted(() => {
  loadUserName()
  loadCurrentUserId()
  loadUserProfile()
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

      <div class="rounded-lg bg-white p-6 shadow-md">
        <div v-show="activeTab === 'posts'">
          <div v-if="myPosts.length > 0" class="space-y-4">
            <button
              v-for="post in myPosts"
              :key="post.id"
              @click="viewPost(post.id)"
              class="w-full cursor-pointer text-left rounded-lg border border-gray-200 p-4 transition-all hover:bg-gray-50 hover:shadow-md"
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
              <p class="line-clamp-2 text-gray-700">{{ post.content }}</p>
              <div class="mt-3 flex gap-4 text-xs text-gray-500">
                <span>👁️ {{ post.views }}</span>
                <span>❤️ {{ post.likes }}</span>
                <span>{{ formatDate(post.createdAt) }}</span>
              </div>
            </button>
          </div>
          <div v-else class="py-8 text-center">
            <p class="text-lg text-gray-500">아직 작성한 게시물이 없습니다.</p>
          </div>
        </div>

        <div v-show="activeTab === 'bookmarks'">
          <div v-if="myBookmarks.length > 0" class="space-y-4">
            <div
              v-for="bookmark in myBookmarks"
              :key="bookmark.contentid"
              class="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
            >
              <div class="mb-2 flex items-start justify-between">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">{{ bookmark.title }}</h3>
                  <p class="mt-1 text-sm text-gray-600">{{ getBookmarkAddress(bookmark) }}</p>
                </div>
                <span class="text-2xl">♥️</span>
              </div>
              <p class="text-sm text-gray-700">카테고리: {{ getCategoryLabel(bookmark.attractionData?.contenttypeid) }}</p>
              <div class="mt-3 text-xs text-gray-500">
                <span>{{ formatDate(bookmark.bookmarkedAt) }}에 찜함</span>
              </div>
            </div>
          </div>
          <div v-else class="py-8 text-center">
            <p class="text-lg text-gray-500">아직 찜한 장소가 없습니다.</p>
          </div>
        </div>

        <div v-show="activeTab === 'reviews'">
          <div v-if="myReviews.length > 0" class="space-y-4">
            <div
              v-for="review in myReviews"
              :key="review.id"
              class="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
            >
              <div class="mb-2 flex items-start justify-between gap-2">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">{{ review.title }}</h3>
                  <p class="mt-1 text-sm text-gray-600">
                    {{ review.attractionTitle || '장소 정보 없음' }}
                  </p>
                  <p class="mt-1 text-xs text-gray-500">
                    {{ review.attractionAddress || '주소 정보 없음' }}
                  </p>
                </div>
                <div class="flex gap-1">
                  <span v-for="i in 5" :key="i" class="text-lg">
                    {{ i <= review.rating ? '⭐' : '☆' }}
                  </span>
                </div>
              </div>

              <div v-if="editingReviewId === review.id" class="mt-3 rounded-lg bg-gray-50 p-3">
                <input v-model="editingReviewTitle" class="mb-2 w-full rounded border border-gray-300 px-3 py-2" placeholder="제목" />
                <div class="mb-2 flex gap-1">
                  <button
                    v-for="i in 5"
                    :key="i"
                    type="button"
                    :class="['text-xl', i <= editingReviewRating ? 'text-amber-500' : 'text-gray-300']"
                    @click="editingReviewRating = i"
                  >★</button>
                </div>
                <textarea v-model="editingReviewContent" class="mb-2 w-full rounded border border-gray-300 px-3 py-2" rows="3" placeholder="리뷰 내용"></textarea>
                <div class="flex gap-2">
                  <button @click="saveReviewEdit(review.id)" class="rounded bg-blue-600 px-3 py-2 text-sm font-semibold text-white">저장</button>
                  <button @click="cancelEditReview" class="rounded bg-gray-300 px-3 py-2 text-sm font-semibold text-gray-800">취소</button>
                </div>
              </div>

              <div v-else>
                <p class="line-clamp-2 text-gray-700">{{ review.content }}</p>
                <div class="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
                  <span>👍 {{ review.likes }}</span>
                  <span>{{ formatDate(review.createdAt) }}</span>
                  <span v-if="isMyReview(review)">
                    <button class="font-semibold text-blue-600" @click="startEditReview(review)">수정</button>
                    <button class="ml-2 font-semibold text-rose-600" @click="confirmDeleteReview(review.id)">삭제</button>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="py-8 text-center">
            <p class="text-lg text-gray-500">아직 작성한 리뷰가 없습니다.</p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showReviewDeleteConfirm" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" @click.self="cancelDeleteReview">
      <div class="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl" @click.stop>
        <h3 class="mb-2 text-xl font-bold text-gray-900">리뷰 삭제</h3>
        <p class="mb-4 text-gray-600">이 리뷰를 정말 삭제하시겠습니까?</p>
        <div class="flex gap-2">
          <button @click="deleteSelectedReview" class="flex-1 rounded bg-rose-600 px-4 py-2 font-semibold text-white">삭제</button>
          <button @click="cancelDeleteReview" class="flex-1 rounded bg-gray-300 px-4 py-2 font-semibold text-gray-800">취소</button>
        </div>
      </div>
    </div>
  </div>
</template>