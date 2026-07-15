<template>
  <div>
    <div class="controls">
      <input
        v-model="query"
        @input="scheduleSearch"
        class="search-input"
        placeholder="장소 검색어를 입력하세요"
      />

      <div class="categories">
        <button
          v-for="cat in categories"
          :key="cat.id"
          :class="['cat-btn', { active: selectedCategory === cat.id }]"
          @click="selectCategory(cat.id)"
          type="button"
        >
          {{ cat.label }}
        </button>
      </div>
    </div>

    <div class="page-wrap">
      <div class="map-area">
        <LeafletMap :selectedLocation="selectedLocation" />
      </div>
      <div class="list-area">
        <AttractionsList :attractions="items" @select="onSelect" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import LeafletMap from './LeafletMap.vue'
import AttractionsList from './AttractionsList.vue'
import { useAttractions } from '../composables/useAttractions'
import type { Attraction } from '../types/tourism'

const { filteredAttractions, initializeAttractions, searchAttractions } = useAttractions()
const items = filteredAttractions
const selectedLocation = ref<{ lat: number; lng: number } | null>(null)
const query = ref('')
const selectedCategory = ref('')

// 고정 6개 카테고리 (id는 contenttypeid 값 — 필요하면 변경 가능)
const categories = [
  { label: '전체', id: '' },
  { label: '관광지', id: '12' },
  { label: '쇼핑', id: '38' },
  { label: '레포츠', id: '28' },
  { label: '문화시설', id: '14' },
  { label: '숙박', id: '32' }
]

let searchTimeout: ReturnType<typeof setTimeout> | null = null

function scheduleSearch() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => applyFilter(), 300)
}

function applyFilter() {
  searchAttractions({
    query: query.value || '',
    category: selectedCategory.value || '',
    sortBy: 'recent',
    minRating: 0
  })
}

function selectCategory(cat: string) {
  selectedCategory.value = cat
  applyFilter()
}

onMounted(() => {
  initializeAttractions()
})

function onSelect(attraction: Attraction, coords?: { lat: number; lng: number }) {
  if (coords && coords.lat && coords.lng) {
    selectedLocation.value = coords
    return
  }

  const lat = parseFloat(String(attraction.mapy || '')) || 0
  const lng = parseFloat(String(attraction.mapx || '')) || 0
  if (lat && lng) selectedLocation.value = { lat, lng }
  else selectedLocation.value = null
}
</script>

<style scoped>
/* Controls (search + category) — sticky so they stay above map/list while scrolling */
.controls {
  position: sticky;
  top: 0;
  z-index: 1100; /* high so it stays above map controls */
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
  background: #fff;
}

/* input and category styles */
.search-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
}
.categories {
  display: flex;
  gap: 8px;
}
.cat-btn {
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background: #f7f7fb;
  cursor: pointer;
}
.cat-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

/* Layout: map 3/4 / list 1/4 */
.page-wrap {
  display: flex;
  height: calc(100vh - 64px); /* adjust if header/control heights differ */
}

/* Map area: ensure it's positioned beneath top UI (low z-index) */
.map-area {
  flex: 3; /* 3/4 */
  min-width: 0;
  position: relative;
  z-index: 0;
}

/* List area: sits above map controls as needed */
.list-area {
  flex: 1; /* 1/4 */
  overflow-y: auto;
  border-left: 1px solid #e5e7eb;
  position: relative;
  z-index: 5;
}

/* Optional small responsive tweak */
@media (max-width: 768px) {
  .page-wrap {
    flex-direction: column;
    height: auto;
  }
  .map-area {
    height: 50vh;
  }
  .list-area {
    height: auto;
  }
}
</style>