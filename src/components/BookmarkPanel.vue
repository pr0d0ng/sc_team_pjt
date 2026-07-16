<template>
  <div class="bookmark-panel">
    <div class="panel-header">
      <h2>♥ 찜한 목록 ({{ bookmarks.length }})</h2>
      <button v-if="bookmarks.length > 0" @click="clearAllBookmarks" class="clear-btn">
        전체 삭제
      </button>
    </div>

    <div v-if="bookmarks.length === 0" class="empty-state">
      <p>찜한 관광지가 없습니다</p>
      <p class="hint">관광지 목록에서 ♡ 버튼을 클릭하여 찜해보세요!</p>
    </div>

    <div v-else class="bookmarks-grid">
      <div
        v-for="bookmark in bookmarks"
        :key="bookmark.contentid"
        class="bookmark-item"
        @click="selectBookmark(bookmark)"
      >
        <div class="bookmark-image">
          <img v-if="bookmark.attractionData.firstimage" :src="bookmark.attractionData.firstimage" :alt="bookmark.title" />
          <div v-else class="no-image-placeholder">이미지 없음</div>
        </div>
        <div class="bookmark-info">
          <h3>{{ bookmark.title }}</h3>
          <p>{{ bookmark.attractionData.addr1 }}</p>
          <div class="bookmark-actions">
            <button @click.stop="removeBookmark(bookmark.contentid)" class="remove-btn">
              ♥ 제거
            </button>
            <button @click.stop="selectBookmark(bookmark)" class="view-btn">
              상세보기
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBookmarks } from '../composables/useBookmarks'
import type { Bookmark } from '../types/tourism'

const emit = defineEmits<{
  select: [bookmark: Bookmark]
}>()

const { bookmarks, removeBookmark } = useBookmarks()

const clearAllBookmarks = () => {
  if (confirm('모든 찜한 항목을 삭제하시겠습니까?')) {
    bookmarks.value.forEach(b => removeBookmark(b.contentid))
  }
}

const selectBookmark = (bookmark: Bookmark) => {
  emit('select', bookmark)
}
</script>

<style scoped>
.bookmark-panel {
  padding: 30px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  border-bottom: 2px solid #667eea;
  padding-bottom: 15px;
}

.panel-header h2 {
  margin: 0;
  color: #333;
  font-size: 24px;
}

.clear-btn {
  padding: 10px 20px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.clear-btn:hover {
  background: #c0392b;
}

.empty-state {
  text-align: center;
  padding: 80px 40px;
  color: #999;
}

.empty-state p {
  margin: 10px 0;
}

.empty-state .hint {
  font-size: 13px;
  color: #bbb;
}

.bookmarks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.bookmark-item {
  background: white;
  border: 2px solid #f0f0f0;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
  cursor: pointer;
}

.bookmark-item:hover {
  border-color: #667eea;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
  transform: translateY(-3px);
}

.bookmark-image {
  width: 100%;
  height: 180px;
  overflow: hidden;
  background: #f0f0f0;
}

.bookmark-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.bookmark-item:hover .bookmark-image img {
  transform: scale(1.05);
}

.no-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  color: #999;
  font-size: 14px;
}

.bookmark-info {
  padding: 16px;
}

.bookmark-info h3 {
  margin: 0 0 8px;
  font-size: 16px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bookmark-info p {
  margin: 0 0 12px;
  font-size: 13px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bookmark-actions {
  display: flex;
  gap: 8px;
}

.remove-btn,
.view-btn {
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  transition: all 0.3s;
}

.remove-btn {
  background: #ffe0e0;
  color: #e74c3c;
}

.remove-btn:hover {
  background: #e74c3c;
  color: white;
}

.view-btn {
  background: #667eea;
  color: white;
}

.view-btn:hover {
  background: #764ba2;
}

@media (max-width: 768px) {
  .bookmarks-grid {
    grid-template-columns: 1fr;
  }

  .panel-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .clear-btn {
    align-self: flex-end;
  }
}
</style>