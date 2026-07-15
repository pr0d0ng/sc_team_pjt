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

function setMarkerAndFly(loc: { lat: number; lng: number }) {
  if (!map) return
  const latlng = L.latLng(loc.lat, loc.lng)
  if (!marker) {
    marker = L.marker(latlng).addTo(map)
  } else {
    marker.setLatLng(latlng)
  }
  map.flyTo(latlng, 15, { duration: 0.6 })
}

onMounted(() => {
  if (!mapEl.value) return
  map = L.map(mapEl.value).setView([37.5665, 126.9780], 12)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map)

  // If location was already set before the map mounted, create marker now
  if (props.selectedLocation && props.selectedLocation.lat && props.selectedLocation.lng) {
    setMarkerAndFly(props.selectedLocation)
  }
})

// watch selectedLocation and handle changes
watch(
  () => props.selectedLocation,
  (loc) => {
    if (!loc) return
    setMarkerAndFly(loc)
  },
  { immediate: true }
)
</script>

<style scoped>
.leaflet-map {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 0;
}

.leaflet-container {
  position: relative !important;
  z-index: 0 !important;
}

.leaflet-control {
  z-index: 1 !important;
}

.leaflet-pane,
.leaflet-overlay-pane,
.leaflet-shadow-pane,
.leaflet-marker-pane,
.leaflet-popup-pane,
.leaflet-tooltip-pane {
  z-index: 0 !important;
}
</style>