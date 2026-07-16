<template>
  <div v-if="attraction" class="detail-container">
    <button @click="goBack" class="back-btn">← 뒤로가기</button>

    <div class="detail-header">
        <div class="header-image">
        <img v-if="attraction.firstimage" :src="attraction.firstimage" :alt="attraction.title" />
        <div v-else class="no-image-placeholder">이미지 없음</div>
      </div>

      <div class="header-info">
        <h1>{{ attraction.title }}</h1>
        
        <div class="rating-section">
          <span class="average-rating">⭐ {{ averageRating }}</span>
          <span class="review-count">({{ reviews.length }}개 리뷰)</span>
        </div>

        <div class="action-buttons">
          <button
            @click="toggleBookmark"
            :class="['btn', 'bookmark-btn', { active: isBookmarked }]"
          >
            {{ isBookmarked ? '♥ 찜한 것' : '♡ 찜하기' }}
          </button>
          <button class="btn share-btn" @click="shareLocation">📤 공유</button>
        </div>

        <div class="info-grid">
          <div class="info-item" v-if="attraction.addr1">
            <strong>주소</strong>
            <p>{{ attraction.addr1 }}</p>
          </div>
          <div class="info-item" v-if="attraction.tel">
            <strong>전화</strong>
            <p>{{ attraction.tel }}</p>
          </div>
          <div class="info-item" v-if="attraction.zipcode">
            <strong>우편번호</strong>
            <p>{{ attraction.zipcode }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 지도 섹션 -->
    <div class="map-section">
      <h2>위치</h2>
      <div id="map" class="map-container"></div>
      <p class="map-coords">좌표: {{ attraction.mapy }}, {{ attraction.mapx }}</p>
    </div>

    <!-- 이미지 갤러리 -->
    <div class="gallery-section" v-if="attraction.firstimage2">
      <h2>추가 이미지</h2>
      <img :src="attraction.firstimage2" :alt="attraction.title + ' 2'" class="gallery-image" />
    </div>

    <!-- 리뷰 섹션 -->
    <div class="reviews-section">
      <ReviewPanel :contentid="attraction.contentid" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Attraction } from '../types/tourism'
import { useReviews } from '../composables/useReviews'
import { useBookmarks } from '../composables/useBookmarks'
import ReviewPanel from './ReviewPanel.vue'

const props = defineProps<{
  attraction: Attraction | null
}>()

const emit = defineEmits<{
  back: []
}>()

const { getReviewsByAttraction, getAverageRating } = useReviews()
const { isBookmarked: checkBookmarked, toggleBookmark: toggleBookmarkAction } = useBookmarks()

const reviews = computed(() => {
  if (!props.attraction) return []
  return getReviewsByAttraction(props.attraction.contentid)
})

const averageRating = computed(() => {
  if (!props.attraction) return 0
  return getAverageRating(props.attraction.contentid)
})

const isBookmarked = computed(() => {
  if (!props.attraction) return false
  return checkBookmarked(props.attraction.contentid)
})

const goBack = () => {
  emit('back')
}

const toggleBookmark = () => {
  if (props.attraction) {
    toggleBookmarkAction(props.attraction)
  }
}

const shareLocation = () => {
  if (props.attraction) {
    const text = `${props.attraction.title} - ${props.attraction.addr1}`
    navigator.clipboard.writeText(text)
    alert('주소가 복사되었습니다!')
  }
}

</script>

<style scoped>
.detail-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.back-btn {
  padding: 10px 20px;
  background: #f5f5f5;
  border: none;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.back-btn:hover {
  background: #e0e0e0;
}

.detail-header {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  padding: 30px;
  align-items: start;
}

.header-image {
  border-radius: 12px;
  overflow: hidden;
  height: 400px;
}

.header-image img {
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

.header-info h1 {
  font-size: 28px;
  margin: 0 0 20px;
  color: #333;
}

.rating-section {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  font-size: 18px;
}

.average-rating {
  font-size: 24px;
  font-weight: bold;
  color: #ffc107;
}

.review-count {
  color: #666;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.btn {
  padding: 12px 20px;
  border: 2px solid var(--primary-color);
  background: white;
  color: var(--primary-color);
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.btn:hover {
  background: var(--primary-color);
  color: white;
}

.btn.active {
  background: #e74c3c;
  border-color: #e74c3c;
  color: white;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.info-item {
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.info-item strong {
  display: block;
  color: var(--primary-color);
  margin-bottom: 5px;
}

.info-item p {
  margin: 0;
  color: #666;
  word-break: break-word;
}

.map-section {
  padding: 30px;
  border-top: 1px solid #eee;
}

.map-section h2 {
  margin: 0 0 20px;
  color: #333;
}

.map-container {
  width: 100%;
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
  background: #f0f0f0;
  margin-bottom: 10px;
}

.map-coords {
  font-size: 12px;
  color: #999;
  margin: 0;
}

.gallery-section {
  padding: 30px;
  border-top: 1px solid #eee;
}

.gallery-section h2 {
  margin: 0 0 20px;
  color: #333;
}

.gallery-image {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 8px;
}

.reviews-section {
  padding: 30px;
  border-top: 1px solid #eee;
}

@media (max-width: 768px) {
  .detail-header {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .header-image {
    height: 250px;
  }

  .detail-header {
    padding: 20px;
  }

  .map-container {
    height: 250px;
  }
}
</style>