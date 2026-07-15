export async function handler(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  try {
    const { action, contentid, filter } = JSON.parse(event.body || '{}')

    switch (action) {
      case 'search':
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: '검색 결과',
            results: []
          })
        }

      case 'getDetail':
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: '상세 정보 조회 성공'
          })
        }

      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Unknown action' })
        }
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    }
  }
}