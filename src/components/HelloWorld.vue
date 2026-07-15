<script setup lang="ts">
import { ref, inject } from 'vue'

// App.vue에서 주입된 go 함수 받기
const go = inject<(page: string) => void>('go', () => {})

const features = [
  {
    icon: '💬',
    title: '자유 게시판',
    description: '다른 여행객들과 정보를 나누고 대화해보세요',
    color: 'from-blue-400 to-blue-600',
    tab: 'community'
  },
  {
    icon: '☺️',
    title: '마이 페이지',
    description: '내가 작성한 게시물, 찜한 장소, 리뷰를 확인하세요',
    color: 'from-yellow-400 to-orange-500',
    tab: 'profile'
  },
  {
    icon: '♥️',
    title: '찜하기',
    description: '좋아하는 명소들을 저장하고 관리하세요',
    color: 'from-rose-400 to-pink-600',
    tab: 'bookmarks'
  },
  {
    icon: '🧑‍🤝‍🧑',
    title: '여행 매칭',
    description: '같은 취향의 여행자들을 찾아보세요',
    color: 'from-purple-400 to-indigo-600',
    tab: 'matching'
  },
  {
    icon: '🎉',
    title: '축제 & 행사',
    description: '서울에서 진행 중인 축제와 공연 정보를 확인하세요',
    color: 'from-red-400 to-rose-600',
    tab: 'calendar'
  },
  {
    icon: '🗺️',
    title: '지도 보기',
    description: '지도에서 명소들을 한눈에 확인하세요',
    color: 'from-green-400 to-emerald-600',
    tab: 'map'
  }
]

const scrollToFeatures = () => {
  const featuresSection = document.querySelector('#features')
  if (featuresSection) {
    featuresSection.scrollIntoView({ behavior: 'smooth' })
  }
}

const navigateTo = (tab: string) => {
  go(tab)
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
    <!-- Hero Section -->
    <section class="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-4xl text-center">
        <!-- 배경 장식 -->
        <div class="absolute inset-0 -z-10 flex items-center justify-center">
          <div class="h-96 w-96 rounded-full bg-gradient-to-r from-blue-200/30 to-purple-200/30 blur-3xl"></div>
        </div>

        <!-- 메인 콘텐츠 -->
        <div class="mb-8 inline-block">
          <span class="text-6xl">🌍</span>
        </div>

        <h1 class="mb-4 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          서울 관광 커뮤니티
        </h1>

        <p class="mb-8 text-xl text-gray-600 sm:text-2xl">
          서울을 여행하는 모든 여행객들을 위한 공간입니다.<br />
          정보를 나누고, 명소를 발견하고, 새로운 친구를 만나보세요!
        </p>

        <!-- 버튼 그룹 -->
        <div class="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <button
            @click="scrollToFeatures"
            class="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
          >
            기능 살펴보기
          </button>
        </div>

        <!-- 통계 -->
        <div class="mt-16 grid grid-cols-3 gap-8 sm:gap-12">
          <div>
            <div class="text-4xl font-bold text-blue-600">700+</div>
            <p class="mt-2 text-gray-600">명소</p>
          </div>
          <div>
            <div class="text-4xl font-bold text-purple-600">1000+</div>
            <p class="mt-2 text-gray-600">여행객</p>
          </div>
          <div>
            <div class="text-4xl font-bold text-pink-600">500+</div>
            <p class="mt-2 text-gray-600">리뷰</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="bg-white px-4 py-20 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-6xl">
        <div class="mb-16 text-center">
          <h2 class="mb-4 text-4xl font-bold text-gray-900">주요 기능</h2>
          <p class="text-xl text-gray-600">
            서울 관광을 더 재미있고 편하게 즐기는 방법들
          </p>
        </div>

        <!-- 기능 카드 그리드 -->
        <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <button
            v-for="(feature, idx) in features"
            :key="idx"
            @click="navigateTo(feature.tab)"
            class="group cursor-pointer rounded-xl bg-gradient-to-br p-8 text-white shadow-lg transition-all hover:shadow-2xl hover:-translate-y-2 text-left border-none"
            :class="`${feature.color}`"
          >
            <!-- 아이콘 -->
            <div class="mb-4 inline-block rounded-lg bg-white/20 p-4 text-4xl group-hover:scale-110 transition-transform">
              {{ feature.icon }}
            </div>

            <!-- 제목 -->
            <h3 class="mb-2 text-2xl font-bold">{{ feature.title }}</h3>

            <!-- 설명 -->
            <p class="text-white/90 leading-relaxed">
              {{ feature.description }}
            </p>

            <!-- 화살표 -->
            <div class="mt-6 flex items-center gap-2 text-white/80 group-hover:text-white transition-colors">
              <span>이동하기</span>
              <span class="group-hover:translate-x-2 transition-transform">→</span>
            </div>
          </button>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-20 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-2xl text-center text-white">
        <h2 class="mb-4 text-4xl font-bold">지금 바로 시작해보세요!</h2>
        <p class="mb-8 text-xl opacity-90">
          수천 명의 여행객들과 함께 서울의 매력을 나누어보세요.
        </p>
        <button
          @click="navigateTo('community')"
          class="rounded-lg bg-white px-8 py-4 text-lg font-semibold text-purple-600 shadow-lg transition-all hover:shadow-xl hover:scale-105"
        >
          커뮤니티 시작하기
        </button>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 px-4 py-12 text-center text-gray-400 sm:px-6 lg:px-8">
      <p class="mb-4">© 2026 서울 관광 커뮤니티. 모든 권리 보유.</p>
      <div class="flex justify-center gap-8">
        <a href="#" class="transition-colors hover:text-white">개인정보보호</a>
        <a href="#" class="transition-colors hover:text-white">이용약관</a>
        <a href="#" class="transition-colors hover:text-white">고객지원</a>
      </div>
    </footer>
  </div>
</template>

<style scoped>
html {
  scroll-behavior: smooth;
}
</style>