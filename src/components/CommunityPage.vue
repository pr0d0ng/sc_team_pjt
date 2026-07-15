<template>
  <div class="community-page">
    <div class="community-header">
      <h1>🗨️ 서울 여행 커뮤니티</h1>
      <p>서로 정보를 공유하고 경험을 나눠요!</p>
    </div>

    <div class="board-tabs">
      <button
        v-for="tab in boardTabs"
        :key="tab.id"
        @click="selectedBoard = tab.id"
        :class="['tab-btn', { active: selectedBoard === tab.id }]"
      >
        {{ tab.label }}
      </button>
      <button @click="showPostForm = true" class="write-btn">
        ✍️ 새 글 작성
      </button>
    </div>

    <!-- 게시물 목록 -->
    <PostList
      v-if="!showPostForm && !selectedPost"
      :posts="currentBoardPosts"
      :board-type="selectedBoard"
      @select="selectPost"
      @delete="deletePost"
    />

    <!-- 게시물 상세 -->
    <PostDetail
      v-if="selectedPost && !showPostForm"
      :post="selectedPost"
      @back="selectedPost = null"
      @delete="deletePost"
    />

    <!-- 게시물 작성 폼 -->
    <PostForm
      v-if="showPostForm"
      :board-type="selectedBoard"
      @submit="submitPost"
      @cancel="showPostForm = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePosts } from '../composables/usePosts'
import type { Post } from '../types/tourism'
import PostList from './PostList.vue'
import PostDetail from './PostDetail.vue'
import PostForm from './PostForm.vue'

const { posts, loadPosts, createPost, deletePost: deletePostFn } = usePosts()

const selectedBoard = ref<'free' | 'attraction'>('free')
const showPostForm = ref(false)
const selectedPost = ref<Post | null>(null)

const boardTabs = [
  { id: 'free' as const, label: '💬 자유 게시판' },
  { id: 'attraction' as const, label: '🗺️ 명소 추천' }
]

const currentBoardPosts = computed(() => {
  return posts.value.filter(p => p.boardType === selectedBoard.value)
})

onMounted(() => {
  loadPosts()
})

const selectPost = (post: Post) => {
  selectedPost.value = post
}

const submitPost = (data: {
  title: string
  content: string
  author: string
  password: string
  location?: string
}) => {
  createPost(
    selectedBoard.value,
    data.title,
    data.content,
    data.author,
    data.password,
    data.location
  )
  showPostForm.value = false
}

const deletePost = (postId: string, password: string) => {
  if (deletePostFn(postId, password)) {
    selectedPost.value = null
  }
}
</script>

<style scoped>
.community-page {
  padding: 30px 20px;
}

.community-header {
  text-align: center;
  margin-bottom: 40px;
}

.community-header h1 {
  font-size: 32px;
  color: #333;
  margin-bottom: 10px;
}

.community-header p {
  color: #666;
  font-size: 16px;
}

.board-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 15px;
}

.tab-btn {
  padding: 10px 20px;
  background: none;
  border: none;
  color: #666;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  border-bottom: 3px solid transparent;
  margin-bottom: -15px;
}

.tab-btn.active {
  color: #667eea;
  border-bottom-color: #667eea;
}

.tab-btn:hover {
  color: #667eea;
}

.write-btn {
  margin-left: auto;
  padding: 10px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.write-btn:hover {
  background: #764ba2;
}

@media (max-width: 768px) {
  .community-page {
    padding: 20px 15px;
  }

  .board-tabs {
    flex-wrap: wrap;
  }

  .write-btn {
    width: 100%;
    margin-left: 0;
  }
}
</style>