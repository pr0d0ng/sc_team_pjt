<script setup lang="ts">
import { onMounted, ref, inject } from 'vue'
import { usePosts } from '../composables/usePosts'

const { posts, loadPosts, incrementViews, addComment, deleteComment } = usePosts()
const selectedPostId = inject<{ value: string | null }>('selectedPostId')
const backToCommunity = inject<() => void>('backToCommunity', () => {})

const currentPost = ref<any>(null)

// 댓글 입력 상태
const commentAuthor = ref(localStorage.getItem('user-profile-name') || '익명')
const commentPassword = ref('')
const commentContent = ref('')

onMounted(() => {
  loadPosts()
  refresh()
})

function refresh() {
  if (selectedPostId?.value) {
    currentPost.value = posts.value.find((p:any) => p.id === selectedPostId.value) || null
    if (currentPost.value) {
      incrementViews(currentPost.value.id)
      // refresh reference after increment
      currentPost.value = posts.value.find((p:any) => p.id === selectedPostId.value) || null
    }
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function onAddComment() {
  if (!commentContent.value.trim()) {
    alert('댓글 내용을 입력하세요.')
    return
  }
  const author = commentAuthor.value.trim() || '익명'
  const res = addComment(currentPost.value.id, author, commentPassword.value || ' ', commentContent.value.trim())
  if (res) {
    // 저장된 이름을 로컬에 유지
    localStorage.setItem('user-profile-name', author)
    commentContent.value = ''
    commentPassword.value = ''
    refresh()
  } else {
    alert('댓글 추가 실패')
  }
}

function onDeleteComment(commentId: string) {
  const pw = prompt('댓글 삭제를 위해 비밀번호를 입력하세요:')
  if (!pw) return
  const ok = deleteComment(currentPost.value.id, commentId, pw)
  if (ok) refresh()
  else alert('비밀번호가 다르거나 삭제 실패')
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
    <div class="mx-auto max-w-2xl">
      <button
        @click="backToCommunity"
        class="mb-6 rounded-lg bg-white px-4 py-2 font-semibold text-gray-700 shadow-md transition-all hover:bg-gray-100"
      >
        ← 돌아가기
      </button>

      <div v-if="currentPost" class="overflow-hidden rounded-xl bg-white shadow-lg">
        <div class="border-b border-gray-200 p-6">
          <div class="mb-4 flex items-start justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">{{ currentPost.title }}</h1>
              <div class="mt-3 flex items-center gap-4 text-sm text-gray-600">
                <span>{{ currentPost.author }}</span>
                <span>•</span>
                <span>{{ formatDate(currentPost.createdAt) }}</span>
              </div>
            </div>
            <span class="inline-block rounded-lg bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-600">
              {{ currentPost.boardType === 'free' ? '자유 게시판' : '명소 추천' }}
            </span>
          </div>
        </div>

        <div class="p-6">
          <div class="whitespace-pre-wrap text-lg leading-relaxed text-gray-800">
            {{ currentPost.content }}
          </div>
        </div>

        <div class="border-t border-gray-200 bg-gray-50 p-6">
          <div class="flex gap-6 text-sm text-gray-600 mb-4">
            <div class="flex items-center gap-2">
              <span>👁️</span>
              <span>조회 {{ currentPost.views }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span>❤️</span>
              <span>좋아요 {{ currentPost.likes }}</span>
            </div>
          </div>

          <!-- 댓글 리스트 -->
          <div class="mb-6">
            <h3 class="mb-3 text-lg font-semibold">댓글 ({{ currentPost.comments?.length || 0 }})</h3>
            <div v-if="currentPost.comments && currentPost.comments.length > 0" class="space-y-3">
              <div v-for="c in currentPost.comments" :key="c.id" class="rounded-lg border p-3">
                <div class="flex justify-between items-start">
                  <div>
                    <div class="font-semibold text-gray-800">{{ c.author }}</div>
                    <div class="text-sm text-gray-600">{{ c.content }}</div>
                    <div class="mt-2 text-xs text-gray-500">{{ formatDate(c.createdAt) }}</div>
                  </div>
                  <div class="text-right">
                    <button @click="onDeleteComment(c.id)" class="text-sm text-red-500 hover:underline">삭제</button>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-gray-500">아직 댓글이 없습니다.</div>
          </div>

          <!-- 댓글 입력 -->
          <div class="space-y-3">
            <input v-model="commentAuthor" placeholder="이름" class="w-full rounded border px-3 py-2" />
            <input v-model="commentPassword" placeholder="비밀번호 (삭제용)" type="password" class="w-full rounded border px-3 py-2" />
            <textarea v-model="commentContent" rows="4" placeholder="댓글을 입력하세요" class="w-full rounded border px-3 py-2"></textarea>
            <div class="flex justify-end">
              <button @click="onAddComment" class="rounded bg-blue-600 text-white px-4 py-2">댓글 작성</button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="rounded-xl bg-white p-12 text-center shadow-lg">
        <p class="mb-4 text-lg text-gray-600">게시물을 찾을 수 없습니다.</p>
        <button
          @click="backToCommunity"
          class="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition-all hover:bg-blue-700"
        >
          목록으로 돌아가기
        </button>
      </div>
    </div>
  </div>
</template>