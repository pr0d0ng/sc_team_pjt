export async function createChatCompletion(messages: { role: string; content: string }[], model = 'gpt-5-mini') {
  const key = import.meta.env.VITE_OPENAI_KEY as string | undefined
  if (!key) throw new Error('VITE_OPENAI_KEY is not set')

  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`
    },
    body: JSON.stringify({ model, messages })
  })

  const text = await resp.text()
  let data: any = null
  try { data = text ? JSON.parse(text) : null } catch { data = null }

  if (!resp.ok) {
    const err = data?.error?.message || data?.message || text || `HTTP ${resp.status}`
    throw new Error(err)
  }

  const reply = (data && (data.choices?.[0]?.message?.content || data.reply)) || text
  return String(reply)
}
