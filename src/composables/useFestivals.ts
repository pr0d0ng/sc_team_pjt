import { ref } from 'vue'
import type { Festival } from '../types/tourism'

const festivals = ref<Festival[]>([])
const storageKey = 'festivals-data'

const loadFestivals = async () => {
  // 캐시 확인
  const cached = localStorage.getItem(storageKey)
  if (cached) {
    festivals.value = JSON.parse(cached)
    return
  }

  try {
    const response = await fetch('/attractions/서울_축제공연행사.json')
    const data = await response.json()
    
    // 축제 데이터 포맷팅
    festivals.value = (data.items || []).map((item: any) => ({
      contentid: item.contentid,
      title: item.title,
      addr1: item.addr1,
      addr2: item.addr2,
      eventStartDate: item.eventStartDate,
      eventEndDate: item.eventEndDate,
      firstimage: item.firstimage,
      tel: item.tel,
      mapx: item.mapx,
      mapy: item.mapy,
      overview: item.overview
    }))

    localStorage.setItem(storageKey, JSON.stringify(festivals.value))
    console.log(`✅ ${festivals.value.length}개의 축제 데이터 로드`)
  } catch (error) {
    console.error('축제 데이터 로드 실패:', error)
  }
}

const getFestivalsByMonth = (year: number, month: number) => {
  return festivals.value.filter(f => {
    const startDate = new Date(f.eventStartDate)
    const endDate = new Date(f.eventEndDate)
    const compareDate = new Date(year, month - 1)

    return (
      (startDate.getFullYear() === year && startDate.getMonth() === month - 1) ||
      (endDate.getFullYear() === year && endDate.getMonth() === month - 1) ||
      (startDate < compareDate && compareDate < endDate)
    )
  })
}

const getFestivalsByDateRange = (startDate: Date, endDate: Date) => {
  return festivals.value.filter(f => {
    const fStart = new Date(f.eventStartDate)
    const fEnd = new Date(f.eventEndDate)

    return (fStart <= endDate && fEnd >= startDate)
  })
}

export const useFestivals = () => ({
  festivals,
  loadFestivals,
  getFestivalsByMonth,
  getFestivalsByDateRange
})