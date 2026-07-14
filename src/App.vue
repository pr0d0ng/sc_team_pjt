<!-- src/App.vue -->
<script setup lang="ts">
import ChatWidget from './components/ChatWidget.vue'
</script>

<template>
  <main class="app-shell">
    <section class="hero-card">
      <p class="eyebrow">Vue 3 + Netlify Functions</p>
      <h1>OpenAI 기반 챗봇 데모</h1>
      <p class="description">
        이 앱은 Netlify Functions에서 OpenAI API를 직접 호출하고, 플로팅 채팅 UI로 대화 히스토리를 유지합니다.
      </p>
    </section>

    <ChatWidget />
  </main>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
  background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%);
}

.hero-card {
  width: min(760px, 100%);
  padding: 36px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.12);
  border: 1px solid #e5e7eb;
}

.eyebrow {
  margin: 0 0 8px;
  font-size: 0.78rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #4f46e5;
  font-weight: 700;
}

h1 {
  margin: 0 0 12px;
  font-size: clamp(1.8rem, 3vw, 2.7rem);
  color: #0f172a;
}

.description {
  margin: 0;
  color: #475569;
  line-height: 1.7;
  font-size: 1rem;
}

@media (max-width: 768px) {
  .app-shell {
    padding: 16px;
    align-items: flex-start;
  }

  .hero-card {
    padding: 24px;
  }
}
</style>