<template>
  <div class="post-list">
    <div v-if="posts.length === 0" class="empty-state">
      <p>아직 게시물이 없습니다</p>
      <p class="hint">첫 번째 글을 작성해보세요!</p>
    </div>

    <div v-else class="posts-container">
      <div
        v-for="post in sortedPosts"
        :key="post.id"
        class="post-card"
        @click="selectPost(post)"
      >
        <div class="post-header">
          <h3>{{ post.title }}</h3>
          <span class="post-date">{{ formatDate(post.createdAt) }}</span>
        </div>

        <p class="post-excerpt">{{ truncateContent(post.content, 100) }}</p>

        <div v-if="post.location" class="location-tag">
          📍 {{ post.location }}
        </div>

        <div class="post-meta">
          <span class="author">{{ post.author }}</span>
          <span class="stats">👁 {{ post.views }} · ❤️ {{ post.likes }} · 💬 {{ post.comments.length }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Post } from '../types/tourism'

const props = defineProps<{
  posts: Post[]
  boardType: 'free' | 'attraction'
}>()

const emit = defineEmits<{
  select: [post: Post]
  delete: [postId: string, password: string]
}>()

const sortedPosts = computed(() => {
  return [...props.posts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
})

const selectPost = (post: Post) => {
  emit('select', post)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const truncateContent = (content: string, length: number) => {
  return content.length > length ? content.slice(0, length) + '...' : content
}
</script>

<style scoped>
.post-list {
  max-width: 800px;
  margin: 0 auto;
}

.empty-state {
  text-align: center;
  padding: 80px 40px;
  color: #999;
}

.empty-state p {
  margin: 10px 0;
}

.hint {
  font-size: 13px;
  color: #bbb;
}

.posts-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.post-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.post-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
  transform: translateY(-2px);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.post-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
  flex: 1;
  word-break: break-word;
}

.post-date {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
  margin-left: 10px;
}

.post-excerpt {
  color: #666;
  margin: 12px 0;
  line-height: 1.5;
  font-size: 14px;
}

.location-tag {
  display: inline-block;
  background: #f0f8ff;
  color: #667eea;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  margin: 10px 0;
  font-weight: 600;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.author {
  color: #667eea;
  font-weight: 600;
  font-size: 14px;
}

.stats {
  color: #999;
  font-size: 12px;
}

@media (max-width: 768px) {
  .post-card {
    padding: 15px;
  }

  .post-header h3 {
    font-size: 16px;
  }

  .post-meta {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
}
</style>