import 'leaflet/dist/leaflet.css'
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import L from 'leaflet'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
})

const KAKAO_KEY = (import.meta.env.VITE_KAKAO_KEY as string) || ''

function loadKakao(): Promise<void> {
  return new Promise((resolve) => {
    if (!KAKAO_KEY) {
      console.warn('VITE_KAKAO_KEY not set — Kakao Maps will not be loaded.')
      return resolve()
    }

    if ((window as any).kakao && (window as any).kakao.maps) {
      return resolve()
    }

    const existing = document.querySelector(`script[data-kakao]`)
    if (existing) {
      existing.addEventListener('load', () => {
        if ((window as any).kakao && (window as any).kakao.maps) {
          (window as any).kakao.maps.load(resolve)
        } else {
          resolve()
        }
      })
      return
    }

    const s = document.createElement('script')
    s.setAttribute('data-kakao', '1')
    s.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(
      KAKAO_KEY
    )}&libraries=services,clusterer&autoload=false`
    s.onload = () => {
      if ((window as any).kakao && (window as any).kakao.maps) {
        (window as any).kakao.maps.load(resolve)
      } else {
        resolve()
      }
    }
    s.onerror = (e) => {
      console.warn('Failed to load Kakao Maps SDK', e)
      resolve()
    }
    document.head.appendChild(s)
  })
}

async function bootstrap() {
  try {
    await loadKakao()
  } catch (e) {
    console.warn('Kakao load error', e)
  }
  createApp(App).mount('#app')
}

bootstrap()