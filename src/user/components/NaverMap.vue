<template>
  <div ref="mapContainer" class="w-full rounded-[16px] overflow-hidden" :style="{ height: height + 'px' }"></div>
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
}

const props = withDefaults(defineProps<Props>(), {
  height: 300,
  markers: () => [],
  centerLat: 37.5665,
  centerLng: 126.978,
  zoom: 14,
})

const emit = defineEmits<{
  markerClick: [id: number]
}>()

const mapContainer = ref<HTMLDivElement>()
let map: any = null
let markerInstances: any[] = []

onMounted(() => {
  initMap()
})

function initMap() {
  if (!mapContainer.value || typeof naver === 'undefined') return

  const center = new naver.maps.LatLng(props.centerLat, props.centerLng)
  map = new naver.maps.Map(mapContainer.value, {
    center,
    zoom: props.zoom,
    zoomControl: true,
    zoomControlOptions: {
      position: naver.maps.Position.TOP_RIGHT,
      style: naver.maps.ZoomControlStyle.SMALL,
    },
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

    const marker = new naver.maps.Marker({
      position: new naver.maps.LatLng(item.latitude, item.longitude),
      map,
      title: item.name,
    })

    const infoWindow = new naver.maps.InfoWindow({
      content: `<div style="padding:8px 12px;font-size:13px;font-weight:600;">${item.name}</div>`,
      borderWidth: 1,
      borderColor: '#E0E0E0',
      backgroundColor: '#fff',
    })

    naver.maps.Event.addListener(marker, 'click', () => {
      if (infoWindow.getMap()) {
        infoWindow.close()
      } else {
        infoWindow.open(map, marker)
      }
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
  map.setCenter(new naver.maps.LatLng(lat, lng))
  map.setZoom(16)
}

defineExpose({ moveToLocation })
</script>
