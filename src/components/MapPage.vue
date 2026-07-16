<template>
  <div>
    <ReviewsModal
      v-if="showReviews"
      :contentid="currentContentIdForReviews"
      :title="currentAttractionTitle"
      @close="showReviews=false"
    />
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
        <AttractionsList :attractions="items" @select="onSelect" @open-reviews="openReviews" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject, watch, type Ref, nextTick } from 'vue'
import LeafletMap from './LeafletMap.vue'
import AttractionsList from './AttractionsList.vue'
import { useAttractions } from '../composables/useAttractions'
import type { Attraction } from '../types/tourism'
import ReviewsModal from './ReviewsModal.vue'
import { useFestivals } from '../composables/useFestivals'

const { filteredAttractions, allAttractions, initializeAttractions, searchAttractions } = useAttractions()
const items = filteredAttractions
const selectedLocation = ref<{ lat: number; lng: number } | null>(null)
const query = ref('')
const selectedCategory = ref('')
const { festivals } = useFestivals()

// focus from App.vue (provided ref)
const mapFocusContentId = inject('mapFocusContentId') as Ref<string | null> | undefined

const showReviews = ref(false)
const currentContentIdForReviews = ref<string | null>(null)
const currentAttractionTitle = ref<string>('')

function openReviews(attraction: Attraction) {
  currentContentIdForReviews.value = attraction.contentid
  currentAttractionTitle.value = attraction.title || ''
  showReviews.value = true
}

// 고정 6개 카테고리 (id는 contenttypeid 값)
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
  console.log('[MapPage] mounted — awaiting data. allAttractions:', allAttractions.value.length, 'festivals:', festivals.value.length)
})

// When user selects an attraction from list (or programmatically), set marker
function onSelect(attraction: Attraction, coords?: { lat: number; lng: number }) {
  if (coords && coords.lat && coords.lng) {
    selectedLocation.value = coords
    console.log('[MapPage] onSelect with coords -> selectedLocation', selectedLocation.value)
    return
  }

  const lat = parseFloat(String(attraction.mapy || '')) || 0
  const lng = parseFloat(String(attraction.mapx || '')) || 0
  if (lat && lng) {
    selectedLocation.value = { lat, lng }
    console.log('[MapPage] onSelect -> selectedLocation', selectedLocation.value)
  } else {
    selectedLocation.value = null
    console.log('[MapPage] onSelect -> no coords')
  }
}

// Robust focus handling: try attractions first, then festivals.
// If data isn't loaded yet, keep a pendingFocus and retry when lists change.
const pendingFocus = ref<string | null>(null)

function tryFocusById(val: string | null) {
  console.log('[MapPage] tryFocusById called with', val, 'allAttractions:', allAttractions.value.length, 'festivals:', festivals.value.length)
  if (!val) return false

  // 1) attractions에서 찾기 (타입 일치 위해 문자열로 비교)
  const a = allAttractions.value.find(at => String(at.contentid) === String(val))
  if (a) {
    const lat = parseFloat(String(a.mapy || '')) || 0
    const lng = parseFloat(String(a.mapx || '')) || 0
    console.log('[MapPage] found attraction', a.title, 'coords', lat, lng)
    if (lat && lng) {
      selectedLocation.value = { lat, lng }
      console.log('[MapPage] focused on attraction -> selectedLocation', selectedLocation.value)
      return true
    } else {
      console.warn('[MapPage] attraction found but missing coords', a)
    }
  } else {
    console.log('[MapPage] attraction not found for id', val)
  }

  // 2) festivals에서 찾기
  const f = festivals.value.find(ff => String(ff.contentid) === String(val))
  if (f) {
    const lat = parseFloat(String(f.mapy || '')) || 0
    const lng = parseFloat(String(f.mapx || '')) || 0
    console.log('[MapPage] found festival', f.title, 'coords', lat, lng)
    if (lat && lng) {
      selectedLocation.value = { lat, lng }
      console.log('[MapPage] focused on festival -> selectedLocation', selectedLocation.value)
      return true
    } else {
      console.warn('[MapPage] festival found but missing coords', f)
    }
  } else {
    console.log('[MapPage] festival not found for id', val)
  }

  return false
}

if (mapFocusContentId) {
  watch(
    mapFocusContentId,
    (val) => {
      console.log('[MapPage] mapFocusContentId changed ->', val)
      if (!val) return
      const ok = tryFocusById(val)
      if (ok) {
        try { mapFocusContentId.value = null } catch {}
        pendingFocus.value = null
        return
      }
      // 못 찾으면 대기 상태로 남겨두고 데이터 로드 시 재시도
      pendingFocus.value = val
      console.log('[MapPage] pendingFocus set ->', pendingFocus.value)
    },
    { immediate: true }
  )
}

// 재시도: festivals 또는 attractions가 변할 때 pendingFocus가 있으면 다시 시도
watch(
  [() => festivals.value.length, () => allAttractions.value.length],
  async () => {
    if (!pendingFocus.value) return
    console.log('[MapPage] data length changed, retrying pendingFocus ->', pendingFocus.value)
    await nextTick()
    const ok = tryFocusById(pendingFocus.value)
    if (ok) {
      try { mapFocusContentId!.value = null } catch {}
      pendingFocus.value = null
      console.log('[MapPage] pendingFocus resolved and cleared')
    } else {
      console.log('[MapPage] pendingFocus still unresolved')
    }
  }
)
</script>

<style scoped>
/* (기존 스타일 유지) */
.controls {
  position: sticky;
  top: 0;
  z-index: 150;
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
  background: #fff;
}
.search-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
}
.categories { display: flex; gap: 8px; }
.cat-btn { padding: 6px 10px; border-radius: 8px; border: 1px solid #ddd; background: #f7f7fb; cursor: pointer; }
.cat-btn.active { background: var(--primary-color); color: white; border-color: var(--primary-color); }

.page-wrap { display: flex; height: calc(100vh - 64px); }
.map-area { flex: 3; min-width: 0; position: relative; z-index: 0; }
.list-area { flex: 1; overflow-y: auto; border-left: 1px solid #e5e7eb; position: relative; z-index: 5; }

@media (max-width: 768px) {
  .page-wrap { flex-direction: column; height: auto; }
  .map-area { height: 50vh; }
  .list-area { height: auto; }
}
</style>