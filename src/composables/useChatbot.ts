import { createChatCompletion } from '../utils/openai'

const serverEndpoint = (import.meta.env.VITE_CHAT_API_URL as string | undefined) || ''

async function loadJson(path: string) {
  const tryFetch = async (url: string) => {
    try {
      const res = await fetch(url)
      if (!res.ok) return null
      return await res.json()
    } catch {
      return null
    }
  }

  // Try raw path, encoded path, origin-prefixed, and /public prefixed.
  const candidates: string[] = [path]
  try { candidates.push(encodeURI(path)) } catch {}
  try { candidates.push((typeof location !== 'undefined' ? location.origin : '') + path) } catch {}
  try { candidates.push((typeof location !== 'undefined' ? location.origin : '') + encodeURI(path)) } catch {}
  try { candidates.push('/public' + path) } catch {}

  for (const c of candidates) {
    if (!c) continue
    const result = await tryFetch(c)
    if (result) return result
  }
  return null
}

function summarizeItems(items: any[], max = 5) {
  if (!Array.isArray(items)) return ''
  return items.slice(0, max).map((it: any, i: number) => `- ${i + 1}. ${it.title || it.name} (${it.addr1 || ''})`).join('\n')
}

function detectIntent(text: string) {
  const t = text.toLowerCase()
  if (t.includes('축제') || t.includes('행사')) return 'festival'
  if (t.includes('추천') || t.includes('관광지') || t.includes('볼만')) return 'attraction'
  if (t.includes('맛집') || t.includes('음식') || t.includes('식당')) return 'food'
  if (t.includes('게시글') || t.includes('커뮤니티') || t.includes('글') || t.includes('포스트')) return 'community'
  return 'general'
}

export async function getAssistantReply(messages: { role: string; content: string }[], model = 'gpt-5-mini') {
  const last = messages.slice().reverse().find(m => m.role === 'user')
  const query = last?.content || ''
  const intent = detectIntent(query)

  let contextText = ''

  if (intent === 'festival') {
    const festivals = await loadJson('/attractions/서울_축제공연행사.json')
    const matches = (festivals?.items || []).filter((it: any) => {
      const s = `${it.title} ${it.eventplace} ${it.program} ${it.addr1}`.toLowerCase()
      return query.toLowerCase().split(/\s+/).some(w => w && s.includes(w))
    })
    contextText = matches.length ? `지역 데이터(축제):\n${summarizeItems(matches, 6)}` : `지역 데이터(축제):\n${summarizeItems(festivals?.items || [], 6)}`
  } else if (intent === 'attraction' || intent === 'food') {
    const attractions = await loadJson('/attractions/서울_관광지.json')
    const matches = (attractions?.items || []).filter((it: any) => {
      const s = `${it.title} ${it.addr1} ${it.overview || ''}`.toLowerCase()
      return query.toLowerCase().split(/\s+/).some(w => w && s.includes(w))
    })
    contextText = matches.length ? `지역 데이터(관광지):\n${summarizeItems(matches, 6)}` : `지역 데이터(관광지):\n${summarizeItems(attractions?.items || [], 6)}`
  } else {
    // general: provide a brief sample of various datasets
    const a = await loadJson('/attractions/서울_관광지.json')
    const f = await loadJson('/attractions/서울_축제공연행사.json')
    contextText = `지역 데이터(요약):\n관광지: ${summarizeItems(a?.items || [], 3)}\n축제: ${summarizeItems(f?.items || [], 3)}`
  }

  if (intent === 'community') {
    try {
      const raw = window.localStorage.getItem('community-posts')
      const posts = raw ? JSON.parse(raw) : []
      const matches = (posts || []).filter((p: any) => {
        const s = `${p.title} ${p.content} ${p.author} ${p.location || ''}`.toLowerCase()
        return query.toLowerCase().split(/\s+/).some(w => w && s.includes(w))
      })
      contextText = matches.length ? `커뮤니티 게시물 매칭:\n${summarizeItems(matches, 6)}` : `커뮤니티 게시물 예시:\n${summarizeItems(posts || [], 6)}`
    } catch {
      contextText = '커뮤니티 게시물 데이터에 접근할 수 없습니다.'
    }
  }

  // Build intent-specific system prompt to encourage friendly, helpful replies
  let systemContent = `안녕하세요! 저는 친절한 서울 여행 도우미예요. 사용자의 질문을 공감 어린 어조로 이해하고, 제공된 지역 데이터(context)를 우선 참고해 실용적이고 행동 가능한 추천을 드립니다.\n\n응답 권장 형식:\n1) 간단한 요약(한두 문장)\n2) 추천 목록(번호, 장소명 — 주소 — 핵심정보(예: 행사 날짜/전화번호))\n3) 추가 팁 또는 다음 행동(예약, 이동 팁, 검색 키워드 등)\n\n톤: 따뜻하고 도움을 주는 말투를 사용하세요(예: "좋아요!", "도와드릴게요"). 불확실한 정보는 솔직하게 밝히고 확인 방법을 안내하세요.`

  // If intent-specific guidance is helpful, add clarifying instruction
  if (intent === 'festival') {
    systemContent += "\n\n추가: 축제/행사 요청일 경우, 이벤트 시작일과 종료일(eventstartdate/eventenddate)을 우선으로 보여주고, 날짜가 없으면 '날짜 정보 없음'이라고 표기하세요."
  } else if (intent === 'food') {
    systemContent += "\n\n추가: 맛집 요청일 경우, 가능한 경우 전화번호(tel)와 영업시간 정보를 포함하세요."
  } else if (intent === 'community') {
    systemContent += "\n\n추가: 커뮤니티 게시물 검색일 경우, 매칭된 게시물의 제목과 간단한 요약(첫 120자 이내)만 반환하세요. 원문을 그대로 복사하지 마세요."
  }

  // Append tone examples and length constraints to reduce mechanical replies
  systemContent += `
\n응답 톤 예시(시작): "좋아요! 도와드릴게요.", "바로 확인해볼게요."
\n응답 마무리 예시: "더 궁금하시면 말씀해주세요.", "원하시면 상세 링크도 찾아드릴게요."
\n길이 제약: 요약 최대 30자, 각 추천 항목은 한 줄로 간결히, 전체 응답은 4문단 이내로 유지하세요.`

  const system = { role: 'system', content: systemContent }
  const contextMsg = { role: 'system', content: `지역 데이터(문맥):\n${contextText}` }

  const apiMessages = [system, contextMsg, ...messages.map(m => ({ role: m.role, content: m.content }))]

  // If a server endpoint (Netlify function) is configured, call it and let the server
  // load dataset JSON files from disk (more secure and reliable).
  if (serverEndpoint) {
    const datasets: string[] = []
    if (intent === 'festival') datasets.push('서울_축제공연행사.json')
    if (intent === 'attraction' || intent === 'food') datasets.push('서울_관광지.json')
    if (intent === 'general') { datasets.push('서울_관광지.json', '서울_축제공연행사.json') }

    // For community intent, include client-side posts in the context since server cannot access browser localStorage
    let extraContext = undefined
    if (intent === 'community') {
      try {
        const raw = window.localStorage.getItem('community-posts')
        if (raw) extraContext = `community_posts:\n${raw}`
      } catch {}
    }

    try {
      // extract district (구) from user query to help server filtering
      const guList = ['강남','강동','강서','강북','종로','중구','서초','영등포','성동','은평','노원','동작','용산','마포','송파','관악','광진','중랑','성북','양천','구로','금천','도봉','서대문']
      let district = ''
      try {
        const lastUser = messages.slice().reverse().find(m => m.role === 'user')?.content || ''
        const t = lastUser.toLowerCase()
        for (const g of guList) {
          const re = new RegExp(`\\b${g}(구)?\\b`, 'i')
          if (re.test(t)) { district = g; break }
        }
      } catch {}

      const payloadBody = { messages: apiMessages, model, datasets, context: extraContext, district }
      const res = await fetch(serverEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadBody)
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        const err = data?.error || `HTTP ${res.status}`
        throw new Error(err)
      }
      return data?.reply || ''
    } catch (e) {
      console.error('Server chat endpoint failed:', e && (e.message || e))
      // Do NOT fallback to client-side OpenAI in production — return an informative message
      return `서버와의 통신에 문제가 발생했습니다: ${e instanceof Error ? e.message : '알 수 없는 오류'}`
    }
  }

  // If no server endpoint configured, fall back to client-side OpenAI (development only)
  if (!serverEndpoint) {
    const reply = await createChatCompletion(apiMessages, model)
    return reply
  }

  return '서버가 구성되어 있지 않습니다. 관리자에게 문의하세요.'
}
