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

  const allMessages = Array.isArray(payload.messages) ? payload.messages : []
  // extract only user-role messages from payload (client may send system+user)
  const userMessages = allMessages.filter(m => m && String(m.role || '').toLowerCase() === 'user')
  const userText = userMessages.map(m => String(m.content || '')).join(' ').toLowerCase()
  const defaultModel = process.env.OPENAI_MODEL || 'gpt-5-mini'
  const model = payload.model || defaultModel

  // SITE-SPECIFIC SYSTEM PROMPT (KOREAN) — 필요하면 수정/확장하세요
  const systemPrompt = `
당신은 친절하고 도움이 되는 한국어 여행 도우미입니다. 사용자가 궁금해하는 내용을 공감 어린 어조로 이해하고, 명확하고 실용적인 답변을 제공하세요.

역할 요약:
- 방문자가 서울 관광지·축제·맛집·커뮤니티 관련 정보를 물으면, 제공된 내부 데이터(데이터셋)를 우선 참고하여 실제적이고 실행 가능한 추천을 제시합니다.
- 사용자가 방법을 묻는 경우(예: 찜하기, 리뷰 확인, 지도 보기)에는 단계별로 쉽게 따라할 수 있게 설명합니다.

톤과 스타일:
- 따뜻하고 친근한 말투(예: "좋아요!", "도와드릴게요")를 사용하되 전문성을 유지하세요.
- 추천 시 이유를 간단히 덧붙이고, 대안이나 팁(예: 혼잡 시간, 예약 권장 여부)을 함께 제시하세요.
- 불확실한 정보는 투명하게 밝히고, 확인 방법(사이트/전화번호 등)을 안내하세요.

사용자 응답 형식(가능하면 따르기):
1) 짧은 요약 1문장
2) 추천 목록(번호, 장소명 — 주소 — 핵심정보(예: 행사 날짜/전화번호))
3) 한두 문장의 추가 팁 또는 다음 행동 제안

추가 규칙:
- 사용자가 질문을 너무 일반적이거나 핵심 정보(예: 지역/종류/예산)가 빠져 있으면, 단 하나의 짧은 확인 질문으로 정보를 요청하세요(예: "어떤 지역을 원하세요?", "예산은 어느 정도인가요?"). 사용자가 답하면 구체적 추천을 제공합니다.
- 예외: 사용자가 명시적으로 장소(예: '강남', '홍대', '여의도', 또는 '○○역' 형태)를 포함한 요청을 한 경우에는, 추가 확인 없이 바로 추천을 제공합니다.

예시 응답:
"좋아요! 강남역 근처라면 저는 A, B, C를 추천드려요.\n1) A — 주소 — 추천 이유\n2) B — 주소 — 추천 이유\n(팁) 점심 시간은 혼잡하니 예약을 권해요."

응답 톤 가이드(구체적 예시):
- 시작 문구(선택): "좋아요! 도와드릴게요.", "멋진 선택이에요—도와드릴게요.", "좋습니다! 바로 추천해드릴게요."
- 마무리 문구(선택): "더 궁금한 점 있으세요?", "원하시면 바로 상세 링크도 찾아드릴게요."

길이/형식 제약:
- 요약은 최대 30자 내외로 간결하게.
- 각 추천 항목은 한 줄로 제한(장소명 — 주소 — 핵심정보).
- 전체 응답은 4문단(요약/추천 목록/팁/마무리) 이내로 유지.

Context (optional): ${payload.context ? JSON.stringify(payload.context) : 'none'}
  `.trim()

  // Prepend system message to conversation
  // If caller requested dataset files, attempt to load them from disk (public/attractions)
  let datasetContext = ''
  const matchedSummaries = []
  try {
    if (Array.isArray(payload.datasets) && payload.datasets.length > 0) {
      const fs = await import('fs')
      const path = await import('path')
      // detect district (구) if user specified one to prioritize/filter results
      const guList = ['강남','강동','강서','강북','종로','중구','서초','영등포','성동','은평','노원','동작','용산','마포','송파','관악','광진','중랑','성북','양천','구로','금천','도봉','서대문']
      let district = ''
      // Prefer explicit district provided by client
      if (payload.district) district = String(payload.district).replace(/구$/i, '')
      else {
        for (const g of guList) {
          const re = new RegExp(`\\b${g}(구)?\\b`, 'i')
          if (re.test(userText)) { district = g; break }
        }
      }
      // derive a search text (prefer payload.district if provided)
      const lastUser = (userMessages.length ? String(userMessages[userMessages.length-1].content) : '') || ''
      const searchText = (payload.district ? String(payload.district) : lastUser).toLowerCase()

      for (const name of payload.datasets) {
        try {
          const p = path.resolve(process.cwd(), 'public', 'attractions', String(name))
          if (fs.existsSync(p)) {
            const raw = fs.readFileSync(p, 'utf8')
            const json = JSON.parse(raw)
                  try {
                    // Prefer explicit district or last user message for keyword extraction
                    const lastUser = (userMessages.length ? String(userMessages[userMessages.length-1].content) : '') || ''
                    const searchText = (payload.district ? String(payload.district) : lastUser).toLowerCase()
                    const kws = searchText.split(/\s+/).filter(Boolean).map(s => s.replace(/[^\p{L}\d]/gu, ''))
              const items = Array.isArray(json.items) ? json.items : []
              const matches = items.filter(it => {
                const s = `${it.title || ''} ${it.addr1 || ''} ${it.overview || ''} ${it.eventplace || ''}`.toLowerCase()
                const kwMatch = kws.some(k => k && s.includes(k))
                if (district) {
                  // require district to appear in address if user asked for a specific 구
                  return kwMatch && (s.includes(district) || s.includes(district + '구'))
                }
                return kwMatch
              }).slice(0, 12)
              if (matches.length > 0) {
                const lines = matches.map((it, i) => ({ title: (it.title || it.name || '').trim(), addr: (it.addr1 || '').trim(), extra: (it.eventstartdate || it.tel || '').trim() }))
                datasetContext += `\n\nDataset: ${name} (matched ${matches.length})\n${lines.map((l,idx)=>`- ${idx+1}. ${l.title}`).join('\n')}`
                matchedSummaries.push({ name, lines })
              } else {
                // fallback: include top 8 items summary
                const top = items.slice(0, 8).map((it, i) => ({ title: (it.title || it.name || '').trim(), addr: (it.addr1 || '').trim(), extra: (it.eventstartdate || it.tel || '').trim() }))
                datasetContext += `\n\nDataset: ${name} (top samples)\n${top.map((l,idx)=>`- ${idx+1}. ${l.title}`).join('\n')}`
                matchedSummaries.push({ name, lines: top })
              }
            } catch (e) {
              datasetContext += `\n\nDataset: ${name} (failed to summarise)`
            }
          } else {
            // If the requested file isn't found (possible encoding issues),
            // fall back to scanning all JSON files in the attractions folder
            try {
              const dir = path.resolve(process.cwd(), 'public', 'attractions')
              const allFiles = fs.readdirSync(dir).filter(f => f.endsWith('.json'))
              let aggregated = []
              for (const f of allFiles) {
                try {
                  const raw2 = fs.readFileSync(path.join(dir, f), 'utf8')
                  const j = JSON.parse(raw2)
                  if (Array.isArray(j.items)) aggregated = aggregated.concat(j.items)
                } catch {}
              }
              const items = aggregated
              const kws = searchText.split(/\s+/).filter(Boolean).map(s => s.replace(/[^\p{L}\d]/gu, ''))
              const matches = items.filter(it => {
                const s = `${it.title || ''} ${it.addr1 || ''} ${it.overview || ''} ${it.eventplace || ''}`.toLowerCase()
                const kwMatch = kws.some(k => k && s.includes(k))
                if (district) return kwMatch && (s.includes(district) || s.includes(district + '구'))
                return kwMatch
              }).slice(0, 12)
              if (matches.length > 0) {
                const lines = matches.map((it, i) => ({ title: (it.title || it.name || '').trim(), addr: (it.addr1 || '').trim(), extra: (it.eventstartdate || it.tel || '').trim() }))
                datasetContext += `\n\nDataset: aggregated (matched ${matches.length})\n${lines.map((l,idx)=>`- ${idx+1}. ${l.title}`).join('\n')}`
                matchedSummaries.push({ name: 'aggregated', lines })
              }
            } catch (e) {
              console.warn('Failed fallback scan of attractions folder', e && (e.message || e))
            }
          }
        } catch (e) {
          console.warn('Failed to read dataset', name, e && (e.message || e))
        }
      }
    }
  } catch (e) {
    console.warn('Dataset load failed', e && (e.message || e))
  }

  // Debug logs for matching
  try { console.log('Detected userText:', userText.slice(0,200)) } catch {}
  try { console.log('Matched summaries count:', matchedSummaries.length) } catch {}
  try { console.log('DatasetContext length:', (datasetContext || '').length) } catch {}

  const finalMessages = [{ role: 'system', content: systemPrompt + (datasetContext ? '\n\n' + datasetContext : '') }, ...userMessages]

  // If user message appears to include a location keyword, add a short system hint
  try {
    const userText = userMessages.map(m => String(m.content || '')).join('\n')
    const locationPattern = /\b(역|강남|홍대|여의도|종로|명동|이태원|광화문|용산)\b/i
    if (locationPattern.test(userText)) {
      finalMessages.unshift({ role: 'system', content: 'Note: user mentioned a specific location — do NOT ask clarifying questions about location; provide direct recommendations based on available data.' })
    }
  } catch (e) { /* ignore */ }

  try {
    // validate messages
    if (!finalMessages.every(m => m && typeof m.role === 'string' && typeof m.content === 'string')) {
      console.warn('Invalid messages format', finalMessages)
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid messages format.' }) }
    }

    // Prepare body payload: omit unsupported params for gpt-5-mini
    // Allow caller to request a larger max completion token; default to 1024 if not specified
    const bodyPayload = { model, messages: finalMessages }
    bodyPayload.max_completion_tokens = (payload.max_completion_tokens && Number(payload.max_completion_tokens)) || 1024
    // set a conservative temperature unless caller overrides
    if (payload.temperature !== undefined) bodyPayload.temperature = payload.temperature
    else if (!model.startsWith('gpt-5-mini')) {
      bodyPayload.temperature = 0.7
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

    const reply = data?.choices?.[0]?.message?.content || data?.reply || ''
      // If OpenAI returned empty content, synthesize a friendly reply from matchedSummaries
      let finalReply = reply
      if ((!finalReply || finalReply.trim().length === 0) && (matchedSummaries.length > 0 || (datasetContext && datasetContext.length > 0))) {
        const parts = []
        // If district detected earlier, try to use it in header
        const districtRe = /\b(강남|강동|강서|강북|종로|중구|서초|영등포|성동|은평|노원|동작|용산|마포|송파|관악|광진|중랑|성북|양천|구로|금천|도봉|서대문)(구)?\b/i
        let header = '좋아요! 도와드릴게요.'
        const m = userText.match(districtRe)
        if (m && m[1]) header = `${m[1]}구 근처로 추천드릴게요.`
        parts.push(header)

        // Build human-readable list of titles only
        const humanLines = []
        matchedSummaries.forEach(ms => {
          ms.lines.slice(0, 6).forEach(item => {
            if (item && item.title) humanLines.push(item.title)
          })
        })

        if (humanLines.length > 0) {
          parts.push('\n추천 목록:')
          humanLines.slice(0, 8).forEach((title, i) => parts.push(`${i + 1}. ${title}`))
        } else {
          // fallback to datasetContext lines (best effort)
          const ctxLines = datasetContext.split('\n').filter(Boolean).slice(0, 8)
          if (ctxLines.length > 0) {
            parts.push('\n추천 목록:')
            ctxLines.forEach((ln, i) => parts.push(`${i + 1}. ${ln}`))
          } else {
            parts.push('\n관련 항목을 찾지 못했어요. 범위를 좁히거나 다른 키워드로 다시 시도해 주세요.')
          }
        }
        parts.push('\n(팁) 주소·상세정보는 지도나 축제 캘린더에서 확인해 주세요. 원하시면 제가 위치 링크를 찾아드릴게요.')
        finalReply = parts.join('\n')
      }

      return { statusCode: 200, headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ reply: finalReply, model }) }
  } catch (error) {
    console.error('Chat handler exception:', error && (error.message || error.name || error))
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return { statusCode: 500, headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ error: msg }) }
  }
}