import Fuse from 'fuse.js'

export type Doc = { id: string; title: string; content: string; addr?: string; meta?: any }

let docs: Doc[] = []
let fuse: Fuse<Doc> | null = null

const FILES = [
  '/attractions/서울_관광지.json',
  '/attractions/서울_레포츠.json',
  '/attractions/서울_문화시설.json',
  '/attractions/서울_쇼핑.json',
  '/attractions/서울_숙박.json',
  '/attractions/서울_여행코스.json',
  '/attractions/서울_축제공연행사.json'
]

export async function loadAttractionDocs() {
  if (docs.length) return docs
  const all: Doc[] = []
  for (const path of FILES) {
    try {
      const res = await fetch(path)
      if (!res.ok) continue
      const arr = await res.json()
      for (const item of arr) {
        const text = [item.title, item.overview || item.content || '', item.addr1 || item.addr2 || '']
          .filter(Boolean)
          .join('\n')
        all.push({ id: item.contentid || item.id || `${path}:${all.length}`, title: item.title || '', content: text, addr: item.addr1 || item.addr2 || '', meta: { path, raw: item } })
      }
    } catch (e) {
      // ignore per-file errors
      // console.warn('loadAttractionDocs error', path, e)
    }
  }
  docs = all
  fuse = new Fuse(docs, {
    keys: ['title', 'content'],
    includeScore: true,
    threshold: 0.45,
    ignoreLocation: true
  })
  return docs
}

export function searchDocs(query: string, topK = 5) {
  if (!fuse) return []
  const results = fuse.search(query, { limit: topK })
  return results.map(r => r.item)
}

// --- Festival-specific helpers ---
let festivalDocs: Doc[] = []
export async function loadFestivalDocs() {
  if (festivalDocs.length) return festivalDocs
  try {
    const res = await fetch('/attractions/서울_축제공연행사.json')
    if (!res.ok) return []
    const arr = await res.json()
    festivalDocs = arr.map((item: any, idx: number) => ({
      id: item.contentid || `festival-${idx}`,
      title: item.title || '',
      content: [item.title, item.eventstartdate, item.eventenddate, item.place, item.overview || ''].filter(Boolean).join('\n'),
      meta: { raw: item }
    }))
  } catch (e) {
    // ignore
  }
  return festivalDocs
}

// dateString: either 'YYYY-MM-DD' or 'MM-DD' or 'M월 D일' or '8월 5일' etc.
export async function searchFestivalsByDate(dateString: string) {
  await loadFestivalDocs()
  if (!festivalDocs.length) return []
  // normalize dateString to YYYYMMDD or MMDD
  const tryParse = (s: string) => {
    // try YYYY-MM-DD or YYYYMMDD
    let m = s.match(/(\d{4})[-/.]?(\d{1,2})[-/.]?(\d{1,2})/)
    if (m) return `${m[1].padStart(4,'0')}${m[2].padStart(2,'0')}${m[3].padStart(2,'0')}`
    m = s.match(/(\d{1,2})[-/.](\d{1,2})/) // MM-DD
    if (m) return `${m[1].padStart(2,'0')}${m[2].padStart(2,'0')}`
    m = s.match(/(\d{1,2})월\s*(\d{1,2})일/) // Korean
    if (m) return `${m[1].padStart(2,'0')}${m[2].padStart(2,'0')}`
    return null
  }

  const q = tryParse(dateString)
  if (!q) return []

  const matches: Doc[] = []
  for (const f of festivalDocs) {
    const raw = f.meta?.raw
    const start = raw?.eventstartdate ? String(raw.eventstartdate) : null
    const end = raw?.eventenddate ? String(raw.eventenddate) : null
    // if start/end exist as YYYYMMDD, compare
    if (start && end) {
      // if q has YYYYMMDD length 8, compare directly; if length 4 (MMDD), compare month/day
      if (q.length === 8) {
        if (start <= q && q <= end) matches.push(f)
      } else if (q.length === 4) {
        const smmdd = start.slice(4)
        const emmdd = end.slice(4)
        // handle ranges that may wrap year (simple approach: check if q between smmdd and emmdd or equal)
        if (smmdd <= emmdd) {
          if (smmdd <= q && q <= emmdd) matches.push(f)
        } else {
          // wraps year end
          if (q >= smmdd || q <= emmdd) matches.push(f)
        }
      }
    } else {
      // fallback: simple text match against content/title
      if (f.content.includes(dateString) || f.title.includes(dateString)) matches.push(f)
    }
  }
  return matches
}
