<template>
  <div ref="mapContainer" class="w-full overflow-hidden" :class="rounded ? 'rounded-[16px]' : ''" :style="{ height: height + 'px' }"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

declare const naver: any

interface MapMarker {
  id: number
  name: string
  latitude: number
  longitude: number
}

interface Props {
  height?: number
  markers?: MapMarker[]
  centerLat?: number
  centerLng?: number
  zoom?: number
  rounded?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  height: 300,
  markers: () => [],
  centerLat: 37.5665,
  centerLng: 126.978,
  zoom: 14,
  rounded: true,
})

const emit = defineEmits<{
  markerClick: [id: number]
}>()

const mapContainer = ref<HTMLDivElement>()
let map: any = null
let markerInstances: any[] = []
let myLocationMarker: any = null

onMounted(() => {
  initMap()
})

function initMap() {
  if (!mapContainer.value || typeof naver === 'undefined') return

  const center = new naver.maps.LatLng(props.centerLat, props.centerLng)
  map = new naver.maps.Map(mapContainer.value, {
    center,
    zoom: props.zoom,
    zoomControl: false,
    scaleControl: false,
  })

  updateMarkers()
}

function updateMarkers() {
  if (!map) return

  // 기존 마커 제거
  markerInstances.forEach(m => m.setMap(null))
  markerInstances = []

  props.markers.forEach(item => {
    if (!item.latitude || !item.longitude) return

    const escapedName = item.name.replace(/</g, '&lt;').replace(/>/g, '&gt;')

    const marker = new naver.maps.Marker({
      position: new naver.maps.LatLng(item.latitude, item.longitude),
      map,
      icon: {
        content: `<div style="display:flex;flex-direction:column;align-items:center;">
          <svg width="32" height="40" viewBox="0 0 32 40">
            <path d="M16 0C7.2 0 0 7.2 0 16c0 10 16 24 16 24s16-14 16-24C32 7.2 24.8 0 16 0z" fill="#2D7FF9"/>
            <rect x="8" y="8" width="16" height="16" rx="3" fill="white"/>
            <path d="M16 12v8M12 16h8" stroke="#2D7FF9" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
          <div style="font-size:11px;font-weight:600;color:#222;white-space:nowrap;margin-top:2px;padding:1px 6px;background:rgba(255,255,255,0.9);border-radius:4px;box-shadow:0 1px 3px rgba(0,0,0,0.15);">${escapedName}</div>
        </div>`,
        anchor: new naver.maps.Point(16, 40),
      },
      title: item.name,
    })

    naver.maps.Event.addListener(marker, 'click', () => {
      emit('markerClick', item.id)
    })

    markerInstances.push(marker)
  })

  // 마커가 있으면 bounds 맞춤
  if (markerInstances.length > 0) {
    const bounds = new naver.maps.LatLngBounds(
      new naver.maps.LatLng(
        Math.min(...props.markers.filter(m => m.latitude).map(m => m.latitude)),
        Math.min(...props.markers.filter(m => m.longitude).map(m => m.longitude))
      ),
      new naver.maps.LatLng(
        Math.max(...props.markers.filter(m => m.latitude).map(m => m.latitude)),
        Math.max(...props.markers.filter(m => m.longitude).map(m => m.longitude))
      )
    )
    map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 })
  }
}

watch(() => props.markers, updateMarkers, { deep: true })

function moveToLocation(lat: number, lng: number) {
  if (!map) return
  const pos = new naver.maps.LatLng(lat, lng)
  map.setCenter(pos)
  map.setZoom(16)

  // 기존 내 위치 마커 제거
  if (myLocationMarker) {
    myLocationMarker.setMap(null)
  }

  myLocationMarker = new naver.maps.Marker({
    position: pos,
    map,
    icon: {
      content: `<div style="width:18px;height:18px;background:#4285F4;border:3px solid white;border-radius:50%;box-shadow:0 0 6px rgba(66,133,244,0.5);"></div>`,
      anchor: new naver.maps.Point(9, 9),
    },
    title: '내 위치',
  })
}

defineExpose({ moveToLocation })
</script>
