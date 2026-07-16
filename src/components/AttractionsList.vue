<template>
  <div class="attractions-list">
    <div class="list-header">
      <h2>{{ attractions.length }}개 결과</h2>
      <span class="total-info" v-if="attractions.length === 0">
        전체 데이터 로드 중이거나 검색 결과가 없습니다
      </span>
    </div>

    <div v-if="attractions.length === 0" class="empty-state">
      <p>검색 결과가 없습니다</p>
    </div>

    <div v-else class="attractions-grid">
      <div
        v-for="attraction in attractions"
        :key="attraction.contentid"
        class="attraction-card"
        @click="selectAttraction(attraction)"
      >
        <div class="card-image">
          <img v-if="attraction.firstimage" :src="attraction.firstimage" :alt="attraction.title" />
          <div v-else class="no-image-placeholder">이미지 없음</div>
          <button
            @click.stop="toggleBookmark(attraction)"
            :class="['bookmark-btn', { bookmarked: isBookmarked(attraction.contentid) }]"
          >
            ♡
          </button>
          <span class="rating-badge">★ {{ getAverageRating(attraction.contentid) }}</span>
        </div>

        <div class="card-content">
          <h3>{{ attraction.title }}</h3>
          <p class="address">📍 {{ attraction.addr1 }}</p>
          <p class="reviews-count">{{ getReviewCount(attraction.contentid) }}개 리뷰</p>
          <button class="view-btn" @click.stop="handleReviewClick(attraction)">리뷰보기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Attraction } from '../types/tourism'
import { useReviews } from '../composables/useReviews'
import { useBookmarks } from '../composables/useBookmarks'

const props = defineProps<{
  attractions: Attraction[]
}>()

const emit = defineEmits<{
  select: [attraction: Attraction, coords?: { lat: number; lng: number }]
  'open-reviews': [attraction: Attraction]
}>()

const { getReviewsByAttraction, getAverageRating } = useReviews()
const { isBookmarked, toggleBookmark } = useBookmarks()

const selectAttraction = (attraction: Attraction) => {
  const lat = parseFloat(String(attraction.mapy || '')) || 0
  const lng = parseFloat(String(attraction.mapx || '')) || 0
  emit('select', attraction, { lat, lng })
}

const handleReviewClick = (attraction: Attraction) => {
  selectAttraction(attraction)
  emit('open-reviews', attraction)
}

const getReviewCount = (contentid: string) => {
  return getReviewsByAttraction(contentid).length
}
</script>

<style scoped>
.attractions-list {
  padding: 20px;
}

.list-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.list-header h2 {
  color: #333;
  font-size: 24px;
}

.total-info {
  color: #999;
  font-size: 14px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.attractions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.attraction-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  border: 2px solid transparent;
}

.attraction-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border-color: var(--primary-color);
}

.card-image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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

.bookmark-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 22px;
  cursor: pointer;
  transition: all 0.3s;
}

.bookmark-btn:hover {
  background: white;
  transform: scale(1.1);
}

.bookmark-btn.bookmarked {
  color: #e74c3c;
}

.rating-badge {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
}

.card-content {
  padding: 16px;
}

.card-content h3 {
  margin: 0 0 10px;
  font-size: 16px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.address {
  font-size: 13px;
  color: #666;
  margin: 8px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.reviews-count {
  font-size: 12px;
  color: #999;
  margin: 8px 0;
}

.view-btn {
  width: 100%;
  padding: 10px;
  background: var(--primary-color);
  color: #ffffff;
  position: relative;
  z-index: 20;
  font-size: 13px;
  white-space: nowrap;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  margin-top: 10px;
}

.view-btn:hover {
  background: var(--secondary-color);
}

@media (max-width: 768px) {
  .attractions-grid {
    grid-template-columns: 1fr;
  }
}
</style>