<template>
  <div ref="mapEl" class="leaflet-map" />
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import L from 'leaflet'

const props = defineProps<{ selectedLocation: { lat: number; lng: number } | null }>()
const mapEl = ref<HTMLDivElement | null>(null)
let map: L.Map | null = null
let marker: L.Marker | null = null

onMounted(() => {
  if (!mapEl.value) return
  map = L.map(mapEl.value).setView([37.5665, 126.9780], 12)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map)
})

watch(() => props.selectedLocation, (loc) => {
  if (!map) return
  if (!loc) return
  const latlng = L.latLng(loc.lat, loc.lng)
  if (!marker) {
    marker = L.marker(latlng).addTo(map)
  } else {
    marker.setLatLng(latlng)
  }
  map.flyTo(latlng, 15, { duration: 0.6 })
})
</script>

<style scoped>
.leaflet-map {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 0; /* ensure the map base is at baseline */
}

/* Lower Leaflet panes/containers so header/UI stays above the map */
.leaflet-container {
  position: relative !important;
  z-index: 0 !important;
}

/* Keep map controls just above the map but still below typical header z-index */
.leaflet-control {
  z-index: 1 !important;
}

/* Other panes (markers/popups/overlays) set low so header can overlay */
.leaflet-pane,
.leaflet-overlay-pane,
.leaflet-shadow-pane,
.leaflet-marker-pane,
.leaflet-popup-pane,
.leaflet-tooltip-pane {
  z-index: 0 !important;
}
</style>