<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { getAssistantReply } from '../composables/useChatbot'

type MessageRole = 'user' | 'assistant'
type Message = { role: MessageRole; content: string }

const storageKey = 'floating-chat-history'
const initialMessages: Message[] = [
  { role: 'assistant', content: '안녕하세요! 무엇을 도와드릴까요? 저는 OpenAI 기반 AI 챗봇입니다.' }
]

const messages = ref<Message[]>([])
const draft = ref('')
const loading = ref(false)
const isOpen = ref(false)
const isMobile = ref(false)
const chatBody = ref<HTMLElement | null>(null)

const defaultModel = (import.meta.env.VITE_CHAT_MODEL as string | undefined) || (import.meta.env.VITE_OPENAI_MODEL as string | undefined) || 'gpt-5-mini'

function loadMessages(): Message[] {
  if (typeof window === 'undefined') return initialMessages
  try {
    const saved = window.localStorage.getItem(storageKey)
    if (!saved) return initialMessages
    const parsed = JSON.parse(saved) as Message[]
    if (Array.isArray(parsed) && parsed.length > 0) return parsed
  } catch {}
  return initialMessages
}

function saveMessages() {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(storageKey, JSON.stringify(messages.value))
}

function handleResize() {
  isMobile.value = window.innerWidth < 768
}
function scrollToBottom() {
  nextTick(() => {
    if (chatBody.value) chatBody.value.scrollTop = chatBody.value.scrollHeight
  })
}

function toggleChat() {
  isOpen.value = !isOpen.value
  if (isOpen.value) scrollToBottom()
}

function clearHistory() {
  messages.value = initialMessages
  saveMessages()
  scrollToBottom()
}

async function sendMessage() {
  const text = draft.value.trim()
  if (!text || loading.value) return

  const userMessage: Message = { role: 'user', content: text }
  const nextMessages = [...messages.value, userMessage]

  messages.value = nextMessages
  draft.value = ''
  loading.value = true
  saveMessages()
  scrollToBottom()

  try {
    const reply = await getAssistantReply(nextMessages, defaultModel)
    messages.value = [...nextMessages, { role: 'assistant', content: reply }]
  } catch (error) {
    messages.value = [
      ...nextMessages,
      { role: 'assistant', content: `오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}` }
    ]
  } finally {
    loading.value = false
    saveMessages()
    scrollToBottom()
  }
}

watch(messages, saveMessages, { deep: true })

onMounted(() => {
  messages.value = loadMessages()
  handleResize()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="chat-widget">
    <button class="chat-toggle" type="button" @click="toggleChat">
      <span v-if="!isOpen">💬</span><span v-else>✕</span>
      <span>{{ isOpen ? '닫기' : '챗봇 열기' }}</span>
    </button>

    <section v-if="isOpen" class="chat-panel" :class="{ 'is-mobile': isMobile }">
      <header class="chat-header">
        <div><p class="eyebrow">Netlify Functions</p><h3>AI 상담 챗봇</h3></div>
        <div style="display:flex;gap:8px;align-items:center">
          <button class="ghost-button" type="button" @click="clearHistory">초기화</button>
          <button class="ghost-button" type="button" @click="toggleChat">닫기</button>
        </div>
      </header>

      <div ref="chatBody" class="chat-body">
        <div v-for="(message, index) in messages" :key="`${message.role}-${index}`" class="bubble" :class="message.role">
          <p>{{ message.content }}</p>
        </div>
        <div v-if="loading" class="bubble assistant"><p>답변을 생성하고 있습니다…</p></div>
      </div>

      <form class="chat-form" @submit.prevent="sendMessage">
        <textarea v-model="draft" rows="2" placeholder="메시지를 입력하세요" @keydown.enter.prevent="sendMessage" />
        <button type="submit" :disabled="loading">전송</button>
      </form>
    </section>
  </div>
</template>

<style scoped>
/* 기존 스타일 유지 (생략 가능) */
.chat-widget { position: fixed; right: 20px; bottom: 20px; z-index: 50; }
.chat-toggle { border:0; border-radius:999px; background:linear-gradient(135deg,#4f46e5,#7c3aed); color:#fff; padding:12px 16px; display:flex; gap:8px; font-weight:700; cursor:pointer; box-shadow:0 12px 30px rgba(79,70,229,0.28); }
.chat-panel { width:min(420px,calc(100vw - 32px)); margin-top:12px; border-radius:20px; background:#fff; box-shadow:0 20px 50px rgba(15,23,42,0.18); overflow:hidden; border:1px solid #e2e8f0; }
.chat-header { display:flex; justify-content:space-between; align-items:center; padding:14px 16px; background:#eef2ff; }
.chat-body { padding:14px; display:flex; flex-direction:column; gap:10px; max-height:360px; overflow-y:auto; background:linear-gradient(180deg,#f8fafc 0%,#fff 100%); }
.bubble { max-width:85%; padding:10px 12px; border-radius:14px; line-height:1.5; font-size:0.95rem; white-space:pre-wrap; }
.bubble.user { margin-left:auto; background:#4f46e5; color:#fff; }
.bubble.assistant { background:#f3f4f6; color:#111827; }
.chat-form { display:flex; gap:8px; padding:12px; border-top:1px solid #e5e7eb; }
textarea { flex:1; border:1px solid #d1d5db; border-radius:12px; padding:10px 12px; resize:none; font:inherit; }
button[type='submit'] { border:0; border-radius:12px; background:#111827; color:#fff; padding:0 14px; cursor:pointer; font-weight:600; }
button[type='submit']:disabled { opacity:0.6; cursor:wait; }
@media (max-width:768px) { .chat-widget { right:12px; bottom:12px; left:12px } .chat-panel { width:100%; margin-top:10px } .chat-body { max-height:60vh } }
</style>



