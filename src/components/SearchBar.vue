<template>
  <div class="search-container">
    <!-- 로딩 상태 표시 -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>관광지 데이터 로드 중...</p>
    </div>

    <div v-else>
      <div class="search-box">
        <input
          v-model="query"
          type="text"
          placeholder="관광지, 주소 검색..."
          @input="handleSearch"
          class="search-input"
        />
        <button @click="clearSearch" class="clear-btn" v-if="query">✕</button>
      </div>

      <div class="filter-bar">
        <select v-model="selectedCategory" @change="handleSearch" class="filter-select">
          <option value="">모든 카테고리</option>
          <option value="12">관광지 ({{ countByCategory['12'] || 0 }})</option>
          <option value="38">쇼핑 ({{ countByCategory['38'] || 0 }})</option>
          <option value="28">레포츠 ({{ countByCategory['28'] || 0 }})</option>
          <option value="14">문화시설 ({{ countByCategory['14'] || 0 }})</option>
          <option value="32">숙박 ({{ countByCategory['32'] || 0 }})</option>
          <option value="25">여행코스 ({{ countByCategory['25'] || 0 }})</option>
        </select>

        <select v-model="sortBy" @change="handleSearch" class="filter-select">
          <option value="recent">최신순</option>
          <option value="rating">평점순</option>
          <option value="popular">인기순</option>
        </select>

        <input
          v-model.number="minRating"
          type="range"
          min="0"
          max="5"
          step="0.5"
          @change="handleSearch"
          class="rating-slider"
        />
        <span class="rating-label">★ {{ minRating }}점 이상</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { SearchFilter } from '../types/tourism'
import { useAttractions } from '../composables/useAttractions'

const emit = defineEmits<{
  search: [filter: SearchFilter]
}>()

const { loading, countByCategory } = useAttractions()

const query = ref('')
const selectedCategory = ref('')
const sortBy = ref('recent')
const minRating = ref(0)

const handleSearch = () => {
  emit('search', {
    query: query.value,
    category: selectedCategory.value,
    sortBy: sortBy.value as any,
    minRating: minRating.value
  })
}

const clearSearch = () => {
  query.value = ''
  handleSearch()
}
</script>

<style scoped>
.search-container {
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  margin-bottom: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  min-height: 100px;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  color: white;
  min-height: 80px;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.search-box {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  position: relative;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid white;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  transition: all 0.3s;
}

.search-input:focus {
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.3);
}

.clear-btn {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #666;
}

.filter-bar {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-select {
  padding: 8px 12px;
  border: 2px solid white;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 14px;
}

.rating-slider {
  width: 120px;
  cursor: pointer;
}

.rating-label {
  color: white;
  font-weight: 600;
  font-size: 14px;
}

@media (max-width: 768px) {
  .filter-bar {
    flex-direction: column;
    width: 100%;
  }

  .filter-select,
  .rating-slider {
    width: 100%;
  }
}
</style>