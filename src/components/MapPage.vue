<template>
  <div class="map-page">
    <div class="map-header">
      <h1>🗺️ 지도로 한눈에 확인</h1>
      <p>서울의 관광지를 지도에서 확인하세요</p>
    </div>

    <div class="map-controls">
      <div class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="관광지 검색..."
          @input="filterAttractions"
        />
      </div>

      <div class="filter-buttons">
        <button
          v-for="category in categories"
          :key="category.id"
          @click="selectedCategory = category.id"
          :class="['filter-btn', { active: selectedCategory === category.id }]"
        >
          {{ category.label }}
        </button>
      </div>
    </div>

    <div class="map-container-wrapper">
      <!-- 지도 -->
      <div id="map" class="map-container"></div>

      <!-- 관광지 목록 -->
      <div class="attractions-sidebar">
        <h3>검색 결과 ({{ filteredAttractions.length }})</h3>
        <div class="attractions-list">
          <div
            v-for="attraction in filteredAttractions.slice(0, 10)"
            :key="attraction.contentid"
            class="attraction-item"
            @click="selectAttraction(attraction)"
            :class="{ active: selectedAttraction?.contentid === attraction.contentid }"
          >
            <img
              v-if="attraction.firstimage"
              :src="attraction.firstimage"
              :alt="attraction.title"
              class="attraction-thumbnail"
            />
            <div class="attraction-info">
              <h4>{{ attraction.title }}</h4>
              <p>{{ attraction.addr1.slice(0, 30) }}...</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 선택된 관광지 정보 -->
    <div v-if="selectedAttraction" class="attraction-info-panel">
      <button @click="selectedAttraction = null" class="close-btn">✕</button>

      <div class="info-header">
        <img :src="selectedAttraction.firstimage || '/placeholder.png'" :alt="selectedAttraction.title" />
      </div>

      <div class="info-content">
        <h2>{{ selectedAttraction.title }}</h2>
        <p class="address">📍 {{ selectedAttraction.addr1 }}</p>
        <p v-if="selectedAttraction.tel" class="phone">📞 {{ selectedAttraction.tel }}</p>
        <p v-if="selectedAttraction.zipcode" class="zipcode">
          우편번호: {{ selectedAttraction.zipcode }}
        </p>

        <div class="map-coords">
          <span>위도: {{ selectedAttraction.mapy }}</span>
          <span>경도: {{ selectedAttraction.mapx }}</span>
        </div>

        <button @click="copyCoordinates" class="copy-btn">좌표 복사</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAttractions } from '../composables/useAttractions'
import type { Attraction } from '../types/tourism'

const { allAttractions } = useAttractions()

const searchQuery = ref('')
const selectedCategory = ref('')
const selectedAttraction = ref<Attraction | null>(null)
const mapInstance = ref<any>(null)
const markers = ref<any[]>([])

const categories = [
  { id: '', label: '전체' },
  { id: '12', label: '관광지' },
  { id: '38', label: '쇼핑' },
  { id: '28', label: '레포츠' },
  { id: '14', label: '문화시설' },
  { id: '32', label: '숙박' }
]

const filteredAttractions = computed(() => {
  let filtered = allAttractions.value

  if (selectedCategory.value) {
    filtered = filtered.filter(a => a.contenttypeid === selectedCategory.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      a => a.title.toLowerCase().includes(query) || a.addr1.toLowerCase().includes(query)
    )
  }

  return filtered
})

onMounted(() => {
  initMap()
})

const initMap = () => {
  // Kakao Maps API 초기화
  if ((window as any).kakao && (window as any).kakao.maps) {
    const mapContainer = document.getElementById('map')
    if (!mapContainer) return

    const options = {
      center: new (window as any).kakao.maps.LatLng(37.5665, 126.978),
      level: 8
    }

    mapInstance.value = new (window as any).kakao.maps.Map(mapContainer, options)

    // 지도 타입 컨트롤
    const mapTypeControl = new (window as any).kakao.maps.MapTypeControl()
    mapInstance.value.addControl(mapTypeControl, (window as any).kakao.maps.ControlPosition.TOPRIGHT)

    // 줌 컨트롤
    const zoomControl = new (window as any).kakao.maps.ZoomControl()
    mapInstance.value.addControl(zoomControl, (window as any).kakao.maps.ControlPosition.RIGHT)

    // 모든 관광지 마커 표시
    displayMarkers()
  } else {
    console.warn('Kakao Maps API not loaded')
  }
}

const displayMarkers = () => {
  // 기존 마커 제거
  markers.value.forEach(marker => marker.setMap(null))
  markers.value = []

  filteredAttractions.value.forEach(attraction => {
    const markerPosition = new (window as any).kakao.maps.LatLng(
      parseFloat(attraction.mapy),
      parseFloat(attraction.mapx)
    )

    const marker = new (window as any).kakao.maps.Marker({
      position: markerPosition,
      title: attraction.title,
      map: mapInstance.value
    })

    // 마커 클릭 이벤트
    (window as any).kakao.maps.event.addListener(marker, 'click', () => {
      selectAttraction(attraction)
    })

    markers.value.push(marker)
  })
}

const selectAttraction = (attraction: Attraction) => {
  selectedAttraction.value = attraction

  // 지도 중심을 선택된 관광지로 이동
  if (mapInstance.value) {
    const moveLatLng = new (window as any).kakao.maps.LatLng(
      parseFloat(attraction.mapy),
      parseFloat(attraction.mapx)
    )
    mapInstance.value.setCenter(moveLatLng)
    mapInstance.value.setLevel(4)
  }
}

const filterAttractions = () => {
  displayMarkers()
}

const copyCoordinates = () => {
  if (selectedAttraction.value) {
    const text = `위도: ${selectedAttraction.value.mapy}, 경도: ${selectedAttraction.value.mapx}`
    navigator.clipboard.writeText(text)
    alert('좌표가 복사되었습니다!')
  }
}
</script>

<style scoped>
.map-page {
  padding: 30px 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.map-header {
  text-align: center;
  margin-bottom: 20px;
}

.map-header h1 {
  font-size: 32px;
  color: #333;
  margin-bottom: 10px;
}

.map-header p {
  color: #666;
  font-size: 16px;
}

.map-controls {
  margin-bottom: 20px;
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 200px;
}

.search-box input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s;
}

.search-box input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.filter-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 10px 16px;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.filter-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.filter-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.map-container-wrapper {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
  flex: 1;
  min-height: 600px;
}

.map-container {
  background: #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.attractions-sidebar {
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  padding: 16px;
  overflow-y: auto;
}

.attractions-sidebar h3 {
  margin: 0 0 16px;
  color: #333;
  font-size: 16px;
}

.attractions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.attraction-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.attraction-item:hover {
  border-color: #667eea;
  background: #f9f9f9;
}

.attraction-item.active {
  border-color: #667eea;
  background: #f0f8ff;
}

.attraction-thumbnail {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.attraction-info {
  flex: 1;
  overflow: hidden;
}

.attraction-info h4 {
  margin: 0 0 4px;
  font-size: 13px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.attraction-info p {
  margin: 0;
  font-size: 11px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.attraction-info-panel {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  max-width: 400px;
  overflow: hidden;
  z-index: 100;
  animation: slideUp 0.3s;
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  font-size: 18px;
  cursor: pointer;
  z-index: 10;
}

.info-header {
  width: 100%;
  height: 180px;
  overflow: hidden;
}

.info-header img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info-content {
  padding: 20px;
}

.info-content h2 {
  margin: 0 0 12px;
  font-size: 18px;
  color: #333;
}

.address,
.phone,
.zipcode {
  margin: 8px 0;
  font-size: 14px;
  color: #666;
}

.map-coords {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 16px 0;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 4px;
  font-size: 12px;
  color: #999;
}

.copy-btn {
  width: 100%;
  padding: 10px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  margin-top: 12px;
  transition: all 0.3s;
}

.copy-btn:hover {
  background: #764ba2;
}

@media (max-width: 1024px) {
  .map-container-wrapper {
    grid-template-columns: 1fr;
    min-height: 400px;
  }

  .attractions-sidebar {
    max-height: 300px;
  }

  .attraction-info-panel {
    position: static;
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .map-page {
    padding: 20px 15px;
  }

  .map-controls {
    flex-direction: column;
  }

  .search-box {
    min-width: auto;
  }

  .filter-buttons {
    justify-content: space-between;
  }

  .filter-btn {
    flex: 1;
    min-width: 80px;
  }

  .map-container-wrapper {
    grid-template-columns: 1fr;
    min-height: 300px;
  }

  .attractions-sidebar {
    order: -1;
    max-height: 200px;
  }
}
</style>