<template>
  <div>
    <div class="flex gap-2 mb-2">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="주소 또는 장소명 검색"
        class="flex-1 px-3 py-2 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] text-[13px] focus:outline-none focus:border-[#FF7B22]"
        @keyup.enter="searchAddress"
      />
      <button type="button" @click="searchAddress" class="px-3 py-2 bg-[#FF7B22] text-white rounded-[10px] text-[13px] hover:bg-[#E66A1A]">검색</button>
    </div>
    <div ref="mapContainer" class="w-full rounded-[10px] overflow-hidden border border-[#E8E8E8]" :style="{ height: height + 'px' }"></div>
    <p class="text-[11px] text-[#999] mt-1">지도를 클릭하여 위치를 지정하세요</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

declare const naver: any

interface Props {
  latitude?: number | string
  longitude?: number | string
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  latitude: 37.5665,
  longitude: 126.978,
  height: 250,
})

const emit = defineEmits<{
  'update:latitude': [value: number]
  'update:longitude': [value: number]
  'update:address': [value: string]
}>()

const mapContainer = ref<HTMLDivElement>()
const searchQuery = ref('')
let map: any = null
let marker: any = null

onMounted(() => {
  initMap()
})

function initMap() {
  if (!mapContainer.value || typeof naver === 'undefined') return

  const lat = Number(props.latitude) || 37.5665
  const lng = Number(props.longitude) || 126.978
  const center = new naver.maps.LatLng(lat, lng)

  map = new naver.maps.Map(mapContainer.value, {
    center,
    zoom: lat !== 37.5665 ? 16 : 12,
    zoomControl: true,
    zoomControlOptions: {
      position: naver.maps.Position.TOP_RIGHT,
      style: naver.maps.ZoomControlStyle.SMALL,
    },
  })

  if (Number(props.latitude) && Number(props.longitude)) {
    placeMarker(center)
  }

  naver.maps.Event.addListener(map, 'click', (e: any) => {
    const latlng = e.coord
    placeMarker(latlng)
    emit('update:latitude', latlng.lat())
    emit('update:longitude', latlng.lng())
    reverseGeocode(latlng)
  })
}

function placeMarker(latlng: any) {
  if (marker) {
    marker.setPosition(latlng)
  } else {
    marker = new naver.maps.Marker({
      position: latlng,
      map,
      icon: {
        content: `<div style="display:flex;flex-direction:column;align-items:center;">
          <div style="width:14px;height:14px;background:#FF7B22;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>
          <div style="width:2px;height:8px;background:#FF7B22;margin-top:-1px;"></div>
        </div>`,
        anchor: new naver.maps.Point(10, 25),
      },
    })
  }
}

function waitForService(): Promise<void> {
  return new Promise((resolve) => {
    if (naver.maps.Service) { resolve(); return }
    const check = setInterval(() => {
      if (naver.maps.Service) { clearInterval(check); resolve() }
    }, 100)
    setTimeout(() => { clearInterval(check); resolve() }, 5000)
  })
}

async function reverseGeocode(latlng: any) {
  await waitForService()
  if (!naver.maps.Service) return
  naver.maps.Service.reverseGeocode({
    coords: latlng,
    orders: 'roadaddr,addr',
  }, (status: any, response: any) => {
    if (status !== naver.maps.Service.Status.OK) return
    const items = response.v2?.results
    if (!items || items.length === 0) return
    const first = items[0]
    const region = first.region
    const land = first.land
    let addr = ''
    if (region) {
      addr = [region.area1?.name, region.area2?.name, region.area3?.name, region.area4?.name].filter(Boolean).join(' ')
    }
    if (land) {
      const num = [land.number1, land.number2].filter(Boolean).join('-')
      if (land.name) addr += ` ${land.name} ${num}`
      else if (num) addr += ` ${num}`
    }
    if (addr.trim()) {
      emit('update:address', addr.trim())
    }
  })
}

async function searchAddress() {
  if (!searchQuery.value.trim()) return
  await waitForService()
  if (!naver.maps.Service) { alert('지도 서비스 로딩 중입니다. 잠시 후 다시 시도해주세요.'); return }
  naver.maps.Service.geocode({
    query: searchQuery.value,
  }, (status: any, response: any) => {
    if (status !== naver.maps.Service.Status.OK) return
    const items = response.v2?.addresses
    if (!items || items.length === 0) {
      alert('검색 결과가 없습니다.')
      return
    }
    const first = items[0]
    const latlng = new naver.maps.LatLng(Number(first.y), Number(first.x))
    map.setCenter(latlng)
    map.setZoom(16)
    placeMarker(latlng)
    emit('update:latitude', Number(first.y))
    emit('update:longitude', Number(first.x))
    if (first.roadAddress || first.jibunAddress) {
      emit('update:address', first.roadAddress || first.jibunAddress)
    }
  })
}

watch([() => props.latitude, () => props.longitude], ([lat, lng]) => {
  const numLat = Number(lat)
  const numLng = Number(lng)
  if (!map || !numLat || !numLng) return
  const latlng = new naver.maps.LatLng(numLat, numLng)
  map.setCenter(latlng)
  placeMarker(latlng)
})
</script>
