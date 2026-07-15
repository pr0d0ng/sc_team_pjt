<template>
  <div class="festival-calendar">
    <div class="calendar-header">
      <h1>🎉 축제 캘린더</h1>
      <p>서울의 축제와 행사를 한눈에 확인하세요</p>
    </div>

    <div class="calendar-controls">
      <button @click="previousMonth" class="nav-btn">◀ 이전</button>
      <h2>{{ currentYear }}년 {{ currentMonth }}월</h2>
      <button @click="nextMonth" class="nav-btn">다음 ▶</button>
      <button @click="goToToday" class="today-btn">오늘</button>
    </div>

    <div class="calendar-wrapper">
      <div class="calendar">
        <!-- 요일 헤더 -->
        <div class="weekdays">
          <div v-for="day in weekdayNames" :key="day" class="weekday">
            {{ day }}
          </div>
        </div>

        <!-- 날짜 셀 -->
        <div class="dates">
          <div
            v-for="cell in calendarDates"
            :key="cell.date"
            :class="['date-cell', { 'other-month': !cell.isCurrentMonth, today: cell.isToday }]"
            @click="selectDate(cell)"
          >
            <div class="date-number">{{ cell.day }}</div>
            <div class="festivals-indicator">
              <span v-if="getFestivalsByDate(cell.date)" class="festival-dot">●</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 축제 목록 -->
      <div class="festivals-sidebar">
        <h3>{{ selectedDateFormatted }} 축제</h3>

        <div v-if="selectedDateFestivals.length === 0" class="no-festivals">
          <p>등록된 축제가 없습니다</p>
        </div>

        <div v-else class="festivals-list">
          <div
            v-for="festival in selectedDateFestivals"
            :key="festival.contentid"
            class="festival-card"
            @click="selectFestival(festival)"
            :class="{ active: selectedFestival?.contentid === festival.contentid }"
          >
            <img
              v-if="festival.firstimage"
              :src="festival.firstimage"
              :alt="festival.title"
              class="festival-image"
            />
            <div class="festival-info">
              <h4>{{ festival.title }}</h4>
              <p class="location">{{ festival.addr1.slice(0, 25) }}...</p>
              <p class="date-range">
                {{ formatFestivalDate(festival.eventStartDate) }} ~
                {{ formatFestivalDate(festival.eventEndDate) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 축제 상세 모달 -->
    <div v-if="selectedFestival" class="festival-modal-overlay" @click="selectedFestival = null">
      <div class="festival-modal" @click.stop>
        <button @click="selectedFestival = null" class="close-btn">✕</button>

        <img v-if="selectedFestival.firstimage" :src="selectedFestival.firstimage" :alt="selectedFestival.title" />

        <div class="modal-content">
          <h2>{{ selectedFestival.title }}</h2>

          <div class="modal-info">
            <div class="info-row">
              <span class="label">📍 장소</span>
              <span class="value">{{ selectedFestival.addr1 }}</span>
            </div>

            <div class="info-row">
              <span class="label">📅 기간</span>
              <span class="value">
                {{ formatFestivalDate(selectedFestival.eventStartDate) }} ~
                {{ formatFestivalDate(selectedFestival.eventEndDate) }}
              </span>
            </div>

            <div class="info-row">
              <span class="label">📞 연락처</span>
              <span class="value">{{ selectedFestival.tel || '정보 없음' }}</span>
            </div>
          </div>

          <div class="modal-footer">
            <button @click="copyFestivalInfo" class="btn-copy">📋 정보 복사</button>
            <a v-if="selectedFestival.mapx" :href="`https://map.kakao.com/link/map/${selectedFestival.title},${selectedFestival.mapy},${selectedFestival.mapx}`" target="_blank" class="btn-map">
              🗺️ 지도에서 보기
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useFestivals } from '../composables/useFestivals'
import type { Festival } from '../types/tourism'

const { festivals, loadFestivals, getFestivalsByMonth } = useFestivals()

const currentDate = ref(new Date())
const selectedDate = ref(new Date())
const selectedFestival = ref<Festival | null>(null)

const weekdayNames = ['일', '월', '화', '수', '목', '금', '토']

const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth() + 1)

const selectedDateFormatted = computed(() => {
  return selectedDate.value.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const calendarDates = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value

  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)

  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())

  const dates = []
  let date = new Date(startDate)

  while (date <= lastDay || date.getDay() !== 0) {
    dates.push({
      date: new Date(date),
      day: date.getDate(),
      isCurrentMonth: date.getMonth() === month - 1,
      isToday:
        date.toDateString() === new Date().toDateString()
    })
    date.setDate(date.getDate() + 1)
  }

  return dates
})

const selectedDateFestivals = computed(() => {
  return festivals.value.filter(f => {
    const startDate = new Date(f.eventStartDate.slice(0, 4) + '-' + f.eventStartDate.slice(4, 6) + '-' + f.eventStartDate.slice(6, 8))
    const endDate = new Date(f.eventEndDate.slice(0, 4) + '-' + f.eventEndDate.slice(4, 6) + '-' + f.eventEndDate.slice(6, 8))

    return selectedDate.value >= startDate && selectedDate.value <= endDate
  })
})

onMounted(() => {
  loadFestivals()
})

const previousMonth = () => {
  currentDate.value.setMonth(currentDate.value.getMonth() - 1)
  currentDate.value = new Date(currentDate.value)
}

const nextMonth = () => {
  currentDate.value.setMonth(currentDate.value.getMonth() + 1)
  currentDate.value = new Date(currentDate.value)
}

const goToToday = () => {
  currentDate.value = new Date()
}

const selectDate = (cell: any) => {
  selectedDate.value = new Date(cell.date)
}

const selectFestival = (festival: Festival) => {
  selectedFestival.value = festival
}

const getFestivalsByDate = (date: Date) => {
  return festivals.value.some(f => {
    const startDate = new Date(f.eventStartDate.slice(0, 4) + '-' + f.eventStartDate.slice(4, 6) + '-' + f.eventStartDate.slice(6, 8))
    const endDate = new Date(f.eventEndDate.slice(0, 4) + '-' + f.eventEndDate.slice(4, 6) + '-' + f.eventEndDate.slice(6, 8))

    return date >= startDate && date <= endDate
  })
}

const formatFestivalDate = (dateStr: string) => {
  if (!dateStr || dateStr.length < 8) return ''
  const year = dateStr.slice(0, 4)
  const month = dateStr.slice(4, 6)
  const day = dateStr.slice(6, 8)
  return `${year}.${month}.${day}`
}

const copyFestivalInfo = () => {
  if (selectedFestival.value) {
    const info = `
${selectedFestival.value.title}
장소: ${selectedFestival.value.addr1}
기간: ${formatFestivalDate(selectedFestival.value.eventStartDate)} ~ ${formatFestivalDate(selectedFestival.value.eventEndDate)}
연락처: ${selectedFestival.value.tel}
    `.trim()
    navigator.clipboard.writeText(info)
    alert('축제 정보가 복사되었습니다!')
  }
}
</script>

<style scoped>
.festival-calendar {
  padding: 30px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.calendar-header {
  text-align: center;
  margin-bottom: 30px;
}

.calendar-header h1 {
  font-size: 32px;
  color: #333;
  margin-bottom: 10px;
}

.calendar-header p {
  color: #666;
  font-size: 16px;
}

.calendar-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 30px;
}

.calendar-controls h2 {
  margin: 0;
  font-size: 24px;
  color: #333;
  min-width: 200px;
  text-align: center;
}

.nav-btn,
.today-btn {
  padding: 8px 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.nav-btn:hover,
.today-btn:hover {
  background: #764ba2;
}

.calendar-wrapper {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 30px;
}

.calendar {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
  margin-bottom: 15px;
}

.weekday {
  text-align: center;
  font-weight: 600;
  color: #667eea;
  padding: 10px;
}

.dates {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
}

.date-cell {
  aspect-ratio: 1;
  background: #f9f9f9;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.date-cell:hover {
  border-color: #667eea;
  background: #f0f8ff;
}

.date-cell.today {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.date-cell.other-month {
  color: #ccc;
  background: #fafafa;
}

.date-number {
  font-weight: 600;
}

.festivals-indicator {
  position: absolute;
  bottom: 4px;
  font-size: 8px;
  color: #e74c3c;
}

.festivals-sidebar {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 500px;
  overflow-y: auto;
}

.festivals-sidebar h3 {
  margin: 0 0 20px;
  color: #333;
  font-size: 18px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
}

.no-festivals {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.festivals-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.festival-card {
  display: flex;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.festival-card:hover {
  border-color: #667eea;
  background: #f9f9f9;
}

.festival-card.active {
  border-color: #667eea;
  background: #f0f8ff;
}

.festival-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.festival-info {
  flex: 1;
  overflow: hidden;
}

.festival-info h4 {
  margin: 0 0 4px;
  font-size: 13px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.location {
  margin: 0 0 4px;
  font-size: 11px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.date-range {
  margin: 0;
  font-size: 11px;
  color: #667eea;
  font-weight: 600;
}

/* 모달 */
.festival-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.festival-modal {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.festival-modal img {
  width: 100%;
  height: 300px;
  object-fit: cover;
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 24px;
  cursor: pointer;
  z-index: 10;
}

.modal-content {
  padding: 30px;
}

.modal-content h2 {
  margin: 0 0 20px;
  font-size: 24px;
  color: #333;
}

.modal-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 20px 0;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
}

.info-row {
  display: flex;
  gap: 16px;
}

.label {
  font-weight: 600;
  color: #667eea;
  min-width: 80px;
}

.value {
  color: #666;
  word-break: break-word;
}

.modal-footer {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn-copy,
.btn-map {
  flex: 1;
  padding: 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  text-align: center;
  text-decoration: none;
  transition: all 0.3s;
}

.btn-copy:hover,
.btn-map:hover {
  background: #764ba2;
}

@media (max-width: 1024px) {
  .calendar-wrapper {
    grid-template-columns: 1fr;
  }

  .festivals-sidebar {
    max-height: 300px;
  }
}

@media (max-width: 768px) {
  .festival-calendar {
    padding: 20px 15px;
  }

  .calendar-controls {
    flex-wrap: wrap;
    gap: 10px;
  }

  .calendar-controls h2 {
    min-width: auto;
  }

  .festival-modal {
    width: 95%;
    max-height: 95vh;
  }
}
</style>