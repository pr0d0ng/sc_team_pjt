// netlify/functions/chat.mjs
export async function handler(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    console.error('OPENAI_API_KEY not set')
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'OPENAI_API_KEY is not configured.' }) }
  }

  let payload = {}
  try { payload = JSON.parse(event.body || '{}') } catch (e) {
    console.error('Invalid JSON body', e)
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON body.' }) }
  }

  const userMessages = Array.isArray(payload.messages) ? payload.messages : []
  const defaultModel = process.env.OPENAI_MODEL || 'gpt-5-mini'
  const model = payload.model || defaultModel

  // SITE-SPECIFIC SYSTEM PROMPT (KOREAN) — 필요하면 수정/확장하세요
  const systemPrompt = `
당신은 "서울 관광 커뮤니티" 웹사이트 전용 AI 어시스턴트입니다.
역할: 방문자에게 서울 관광지 정보, 사이트 기능(찜, 리뷰, 커뮤니티, 매칭, 축제 캘린더, 지도 링크) 사용 방법을 안내하고,
사이트 내부 데이터(관광지, 축제, 게시판 구조, 오픈톡 링크 등)에 기반해 구체적·친절하게 답변하세요.

규칙:
- 한국어로 답변하세요(사용자가 영어로 묻는 경우 영어로 응답 가능).
- 가능한 경우 사이트 기능을 활용하는 방법(예: "찜하기 버튼을 눌러 저장하세요", "게시판에서 새 글 작성" 등)으로 안내하세요.
- 위치/위도·경도 요청시 카카오맵 링크 형식으로 제공하세요: https://map.kakao.com/link/map/{이름},{lat},{lng}
- 게시물/매칭/찜/리뷰 등의 실제 데이터는 서버에 없으면 "실제 데이터는 사이트에서 확인하세요"라고 안내하고, 로컬 저장소에 있는 데이터는 클라이언트에서 확인하도록 유도하세요.
- 개인정보/결제 관련 질문은 처리 불가하므로 안전하게 안내하세요.
- 응답은 1-3단락으로 간결히 제공하세요.

Context (optional): ${payload.context ? JSON.stringify(payload.context) : 'none'}
  `.trim()

  // Prepend system message to conversation
  const finalMessages = [{ role: 'system', content: systemPrompt }, ...userMessages]

  try {
    // validate messages
    if (!finalMessages.every(m => m && typeof m.role === 'string' && typeof m.content === 'string')) {
      console.warn('Invalid messages format', finalMessages)
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid messages format.' }) }
    }

    // Prepare body payload: omit unsupported params for gpt-5-mini
    const bodyPayload = { model, messages: finalMessages }
    if (!model.startsWith('gpt-5-mini')) {
      bodyPayload.temperature = 0.7
    } else {
      console.log('Omitting temperature for model:', model)
    }

    const controller = new AbortController()
    const timeout = 30000
    const id = setTimeout(() => controller.abort(), timeout)

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(bodyPayload),
      signal: controller.signal
    }).catch(err => { clearTimeout(id); throw err })

    clearTimeout(id)

    const raw = await response.text().catch(() => '')
    console.log('OpenAI raw response length:', raw ? raw.length : 0)

    let data = null
    try { data = raw ? JSON.parse(raw) : null } catch (e) { data = null }

    if (!response.ok) {
      console.error('OpenAI API error body:', raw)
      const errMsg = (data && (data.error?.message || data.error)) || raw || `OpenAI responded ${response.status}`
      return { statusCode: 502, headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ error: errMsg }) }
    }

    const reply = data?.choices?.[0]?.message?.content || data?.reply || raw || ''
    return { statusCode: 200, headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ reply, model }) }
  } catch (error) {
    console.error('Chat handler exception:', error && (error.message || error.name || error))
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return { statusCode: 500, headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ error: msg }) }
  }
}