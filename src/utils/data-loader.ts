import type { Attraction } from '../types/tourism'

// 모든 카테고리 파일 목록
const ATTRACTION_FILES = [
  '/attractions/서울_관광지.json',
  '/attractions/서울_레포츠.json',
  '/attractions/서울_문화시설.json',
  '/attractions/서울_쇼핑.json',
  '/attractions/서울_숙박.json',
  '/attractions/서울_여행코스.json'
]

// 캐시 저장
let cachedAttractions: Attraction[] | null = null

// 모든 JSON 파일에서 관광지 데이터 로드
export const loadAllAttractions = async (): Promise<Attraction[]> => {
  // 캐시가 있으면 반환
  if (cachedAttractions && cachedAttractions.length > 0) {
    return cachedAttractions
  }

  const allAttractions: Attraction[] = []

  // 모든 파일 병렬 로드
  const loadPromises = ATTRACTION_FILES.map(async (filePath) => {
    try {
      const response = await fetch(filePath)
      if (!response.ok) {
        console.warn(`Failed to load ${filePath}: ${response.status}`)
        return []
      }
      const data = await response.json()
      return data.items || []
    } catch (error) {
      console.warn(`Error loading ${filePath}:`, error)
      return []
    }
  })

  try {
    const results = await Promise.all(loadPromises)
    results.forEach((items) => {
      allAttractions.push(...items)
    })
    
    // 캐시에 저장
    cachedAttractions = allAttractions
    
    console.log(`총 ${allAttractions.length}개의 관광지 데이터 로드 완료`)
    return allAttractions
  } catch (error) {
    console.error('Failed to load attractions:', error)
    return []
  }
}

// 단일 파일 로드 (필요시)
export const loadAttractionsByCategory = async (
  categoryId: string
): Promise<Attraction[]> => {
  const categoryMap: Record<string, string> = {
    '12': '/attractions/서울_관광지.json',
    '28': '/attractions/서울_레포츠.json',
    '14': '/attractions/서울_문화시설.json',
    '38': '/attractions/서울_쇼핑.json',
    '32': '/attractions/서울_숙박.json',
    '25': '/attractions/서울_여행코스.json'
  }

  const filePath = categoryMap[categoryId]
  if (!filePath) return []

  try {
    const response = await fetch(filePath)
    if (!response.ok) return []
    const data = await response.json()
    return data.items || []
  } catch (error) {
    console.error(`Error loading category ${categoryId}:`, error)
    return []
  }
}

// 기본 더미 데이터 (파일 로드 실패 시 사용)
export const getDefaultAttractions = (): Attraction[] => {
  return [
    {
      contentid: '1059877',
      contenttypeid: '12',
      title: '양화한강공원',
      addr1: '서울특별시 영등포구 노들로 221',
      addr2: '',
      tel: '',
      firstimage: 'https://tong.visitkorea.or.kr/cms/resource_photo/46/3551346_image2_1.jpg',
      firstimage2: 'https://tong.visitkorea.or.kr/cms/resource_photo/46/3551346_image3_1.jpg',
      mapx: '126.9023658810',
      mapy: '37.5382819489',
      zipcode: '07231'
    }
  ]
}