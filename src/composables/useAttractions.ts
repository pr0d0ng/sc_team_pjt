import { ref, computed } from 'vue'
import type { Attraction, SearchFilter } from '../types/tourism'
import { loadAllAttractions, getDefaultAttractions } from '../utils/data-loader'

const allAttractions = ref<Attraction[]>([])
const filteredAttractions = ref<Attraction[]>([])
const selectedAttraction = ref<Attraction | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const initializeAttractions = async () => {
  loading.value = true
  error.value = null

  try {
    console.log('관광지 데이터 로드 중...')
    const attractions = await loadAllAttractions()

    if (attractions.length > 0) {
      allAttractions.value = attractions
      filteredAttractions.value = attractions
      console.log(`✅ ${attractions.length}개의 관광지 로드 완료`)
    } else {
      throw new Error('데이터를 로드할 수 없습니다')
    }
  } catch (err) {
    console.error('관광지 데이터 로드 실패:', err)
    error.value = err instanceof Error ? err.message : '데이터 로드 실패'
    
    // 폴백: 기본 데이터 사용
    const defaultData = getDefaultAttractions()
    allAttractions.value = defaultData
    filteredAttractions.value = defaultData
  } finally {
    loading.value = false
  }
}

// 검색 및 필터링
const searchAttractions = (filter: SearchFilter) => {
  let result = allAttractions.value

  // 검색어 필터링
  if (filter.query) {
    const query = filter.query.toLowerCase()
    result = result.filter(a =>
      a.title.toLowerCase().includes(query) ||
      a.addr1.toLowerCase().includes(query) ||
      a.addr2.toLowerCase().includes(query)
    )
  }

  // 카테고리 필터링
  if (filter.category) {
    result = result.filter(a => a.contenttypeid === filter.category)
  }

  filteredAttractions.value = result
}

// 단일 관광지 조회
const getAttractionDetail = (contentid: string) => {
  selectedAttraction.value = allAttractions.value.find(
    a => a.contentid === contentid
  ) || null
}

// 추천 관광지 (상위 10개)
const recommendedAttractions = computed(() => {
  return allAttractions.value.slice(0, 10)
})

// 총 개수
const totalCount = computed(() => allAttractions.value.length)

// 카테고리별 개수
const countByCategory = computed(() => {
  const counts: Record<string, number> = {}
  allAttractions.value.forEach(a => {
    counts[a.contenttypeid] = (counts[a.contenttypeid] || 0) + 1
  })
  return counts
})

export const useAttractions = () => ({
  allAttractions,
  filteredAttractions,
  selectedAttraction,
  loading,
  error,
  initializeAttractions,
  searchAttractions,
  getAttractionDetail,
  recommendedAttractions,
  totalCount,
  countByCategory
})