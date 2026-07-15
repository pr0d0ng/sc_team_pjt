<script setup lang="ts">
import { ref, computed, onMounted, inject } from 'vue'
import { useFestivals } from '../composables/useFestivals'

const { festivals, loadFestivals } = useFestivals()

const focusAttraction = inject<(contentid: string) => void>('focusAttraction', () => {})

const today = new Date()
const year = ref<number>(today.getFullYear())
const month = ref<number>(today.getMonth() + 1)

onMounted(async () => {
  await loadFestivals()
})

const firstWeekday = computed(() => new Date(year.value, month.value - 1, 1).getDay())
const daysInMonth = computed(() => new Date(year.value, month.value, 0).getDate())

function prevMonth() {
  if (month.value === 1) { month.value = 12; year.value -= 1 }
  else month.value -= 1
}
function nextMonth() {
  if (month.value === 12) { month.value = 1; year.value += 1 }
  else month.value += 1
}

const weekdays = ['일','월','화','수','목','금','토']

function festivalsOn(day: number) {
  const start = new Date(year.value, month.value - 1, day, 0, 0, 0)
  const end = new Date(year.value, month.value - 1, day, 23, 59, 59)
  return festivals.value.filter(f => {
    if (!f.eventStartDate || !f.eventEndDate) return false
    const fStart = new Date(f.eventStartDate)
    const fEnd = new Date(f.eventEndDate)
    return fStart <= end && fEnd >= start
  })
}

const calendarCells = computed(() => {
  const cells: { day: number | null; eventsCount: number }[] = []
  const offset = firstWeekday.value
  for (let i = 0; i < offset; i++) cells.push({ day: null, eventsCount: 0 })
  for (let d = 1; d <= daysInMonth.value; d++) {
    const count = festivalsOn(d).length
    cells.push({ day: d, eventsCount: count })
  }
  while (cells.length % 7 !== 0) cells.push({ day: null, eventsCount: 0 })
  return cells
})

const selectedDay = ref<number | null>(null)
const selectedFestivals = computed(() => selectedDay.value == null ? [] : festivalsOn(selectedDay.value))
function selectDay(d: number | null) { selectedDay.value = d }

const showProgramModal = ref(false)
const modalFestival = ref<any>(null)
function openProgramModal(f: any) {
  modalFestival.value = f
  showProgramModal.value = true
}
function closeProgramModal() {
  modalFestival.value = null
  showProgramModal.value = false
}
</script>

<template>
  <div class="max-w-6xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold">🎉 축제 & 행사 캘린더</h2>
        <p class="text-sm text-gray-600">월별로 축제를 확인하고 상세 정보를 보세요.</p>
      </div>

      <div class="flex items-center gap-2">
        <button @click="prevMonth" class="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200">‹</button>
        <div class="px-4 py-2 rounded text-center">
          <div class="text-sm text-gray-500">{{ year }}년</div>
          <div class="text-lg font-semibold">{{ month }}월</div>
        </div>
        <button @click="nextMonth" class="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200">›</button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="col-span-1 lg:col-span-2 bg-white rounded-lg shadow p-4">
        <div class="grid grid-cols-7 gap-2 text-center mb-2">
          <div v-for="w in weekdays" :key="w" class="text-sm font-medium text-gray-600">{{ w }}</div>
        </div>

        <div class="grid grid-cols-7 gap-2">
          <template v-for="(cell, idx) in calendarCells" :key="idx">
            <button
              @click="selectDay(cell.day)"
              :class="[
                'min-h-[72px] p-2 text-left rounded border',
                cell.day ? 'hover:bg-gray-50' : 'bg-transparent',
                selectedDay === cell.day ? 'border-blue-400 bg-blue-50' : 'border-transparent'
              ]"
              :disabled="!cell.day"
            >
              <div class="flex justify-between items-start">
                <div class="text-sm font-medium" v-if="cell.day">{{ cell.day }}</div>
                <div v-else class="text-sm text-gray-300">&nbsp;</div>
                <div v-if="cell.eventsCount > 0" class="ml-2">
                  <span class="inline-block bg-red-500 text-white rounded-full text-xs px-2 py-0.5">{{ cell.eventsCount }}</span>
                </div>
              </div>

              <div class="mt-2 text-xs text-gray-600">
                <ul>
                  <li v-for="f in festivalsOn(cell.day || 0).slice(0,2)" :key="f.contentid" class="truncate">
                    {{ f.title }}
                  </li>
                </ul>
              </div>
            </button>
          </template>
        </div>
      </div>

      <aside class="bg-white rounded-lg shadow p-4">
        <div v-if="selectedDay">
          <h3 class="text-lg font-semibold mb-2">{{ year }}-{{ String(month).padStart(2,'0') }}-{{ String(selectedDay).padStart(2,'0') }} 일정</h3>

          <div v-if="selectedFestivals.length > 0" class="space-y-4">
            <div v-for="f in selectedFestivals" :key="f.contentid" class="border rounded p-3">
              <div class="flex justify-between items-start gap-3">
                <div>
                  <h4 class="font-semibold">{{ f.title }}</h4>
                  <p class="text-sm text-gray-500">{{ f.addr1 }}</p>
                </div>
                <div class="text-xs text-gray-500 text-right">
                  <div>{{ f.eventStartDate }} ~</div>
                  <div>{{ f.eventEndDate }}</div>
                </div>
              </div>

              <div class="mt-3 flex gap-2 flex-wrap">
                <button @click="openProgramModal(f)" class="action-btn">상세보기</button>
                <button @click="focusAttraction && focusAttraction(f.contentid)" class="action-btn">지도에서 보기</button>
                <a :href="f.firstimage || '#'" target="_blank" v-if="f.firstimage" class="action-btn link-btn">사진 보기</a>
              </div>
            </div>
          </div>

          <div v-else class="text-gray-500">선택한 날짜에 예정된 축제가 없습니다.</div>
        </div>

        <div v-else class="text-gray-500">
          날짜를 선택하면 해당 날짜의 축제 목록을 확인할 수 있습니다.
        </div>
      </aside>
    </div>

    <!-- modal -->
    <div v-if="showProgramModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/50" @click="closeProgramModal"></div>
      <div class="relative max-w-2xl w-full bg-white rounded-lg shadow-lg p-6 z-10">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-xl font-semibold">{{ modalFestival?.title }}</h3>
            <div class="text-sm text-gray-500">{{ modalFestival?.addr1 }}</div>
            <div class="text-xs text-gray-400 mt-1">{{ modalFestival?.eventStartDate }} ~ {{ modalFestival?.eventEndDate }}</div>
          </div>
          <button @click="closeProgramModal" class="text-gray-500 hover:text-gray-800">✕</button>
        </div>

        <div class="prose max-w-full text-sm whitespace-pre-wrap text-gray-800">
          <div v-if="modalFestival?.overview">{{ modalFestival.overview }}</div>
          <div v-else-if="modalFestival?.program">{{ modalFestival.program }}</div>
          <div v-else>상세 정보가 없습니다.</div>
        </div>

        <div class="mt-4 flex justify-end gap-2">
          <button @click="closeProgramModal" class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">닫기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.action-btn {
  white-space: nowrap;
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 6px;
  background: #3b82f6; /* blue */
  color: white;
  border: none;
}
.action-btn:hover { opacity: 0.95; }
.action-btn + .action-btn { margin-left: 6px; }

.link-btn {
  background: #e5e7eb;
  color: #111827;
}

@media (max-width: 640px) {
  .action-btn { font-size: 11px; padding: 6px 8px; }
}
</style>