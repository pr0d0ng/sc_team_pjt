import { ref } from 'vue'
import type { Festival } from '../types/tourism'

const festivals = ref<Festival[]>([])
const storageKey = 'festivals-data'

function normalizeDateStr(raw?: any): string {
  if (!raw && raw !== 0) return ''
  const s = String(raw).trim()
  if (/^\d{8}$/.test(s)) {
    return `${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6,8)}`
  }
  return s
}

function normalizeFestival(item: any): Festival {
  return {
    contentid: item.contentid,
    title: item.title,
    addr1: item.addr1 || item.eventplace || '',
    addr2: item.addr2 || '',
    eventStartDate: normalizeDateStr(item.eventStartDate ?? item.eventstartdate ?? item.eventStartDate),
    eventEndDate: normalizeDateStr(item.eventEndDate ?? item.eventenddate ?? item.eventEndDate),
    firstimage: item.firstimage,
    tel: item.tel,
    mapx: item.mapx,
    mapy: item.mapy,
    overview: item.overview || item.program || ''
  }
}

const loadFestivals = async () => {
  const cached = localStorage.getItem(storageKey)
  if (cached) {
    try {
      const raw = JSON.parse(cached)
      // re-normalize cached entries in case format changed
      festivals.value = (raw || []).map((it: any) => normalizeFestival(it))
      console.log(`✅ 로컬 캐시에서 ${festivals.value.length}개의 축제 로드`)
      return
    } catch (e) {
      console.warn('festivals cache parse failed, refetching', e)
      localStorage.removeItem(storageKey)
    }
  }

  try {
    const response = await fetch('/attractions/서울_축제공연행사.json')
    const data = await response.json()
    festivals.value = (data.items || []).map((item: any) => normalizeFestival(item))
    localStorage.setItem(storageKey, JSON.stringify(festivals.value))
    console.log(`✅ ${festivals.value.length}개의 축제 데이터 로드`)
  } catch (error) {
    console.error('축제 데이터 로드 실패:', error)
  }
}

const getFestivalsByMonth = (year: number, month: number) => {
  return festivals.value.filter(f => {
    if (!f.eventStartDate || !f.eventEndDate) return false
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
    if (!f.eventStartDate || !f.eventEndDate) return false
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