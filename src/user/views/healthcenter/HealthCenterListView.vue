<template>
  <div class="min-h-screen bg-white flex justify-center">
    <div class="w-full max-w-[402px] min-h-screen relative bg-white">
      <BackHeader title="건강검진 센터 예약" />

      <main class="relative" style="height: calc(100vh - 56px - 72px);">
        <!-- 지도 모드 -->
        <template v-if="viewMode === 'map'">
          <!-- 검색바 (지도 위 오버레이) -->
          <div class="absolute top-0 left-0 right-0 z-10 px-4 pt-3">
            <div class="relative">
              <svg class="absolute left-3.5 top-1/2 -translate-y-1/2" width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="#999" stroke-width="2"/>
                <path d="M21 21L16.65 16.65" stroke="#999" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="센터명, 주소 검색"
                class="w-full bg-white/95 backdrop-blur-sm rounded-[14px] pl-10 pr-4 py-3.5 text-[16px] border border-[#E0E0E0] outline-none focus:border-[#03C75A] transition-colors text-[#333] shadow-lg"
                @input="debouncedSearch"
              />
            </div>
          </div>

          <!-- 내 위치 버튼 -->
          <button
            class="absolute bottom-4 right-4 z-10 w-11 h-11 bg-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-all"
            :style="selectedCenter ? 'bottom: 140px' : ''"
            @click="goToMyLocation"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" fill="#03C75A"/>
              <circle cx="12" cy="12" r="8" stroke="#03C75A" stroke-width="2" fill="none"/>
              <line x1="12" y1="2" x2="12" y2="5" stroke="#03C75A" stroke-width="2" stroke-linecap="round"/>
              <line x1="12" y1="19" x2="12" y2="22" stroke="#03C75A" stroke-width="2" stroke-linecap="round"/>
              <line x1="2" y1="12" x2="5" y2="12" stroke="#03C75A" stroke-width="2" stroke-linecap="round"/>
              <line x1="19" y1="12" x2="22" y2="12" stroke="#03C75A" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>

          <!-- 전체화면 지도 -->
          <NaverMap
            ref="mapRef"
            :height="mapHeight"
            :markers="mapMarkers"
            :rounded="false"
            @marker-click="onMarkerClick"
          />

          <!-- 선택된 센터 카드 (하단 오버레이) -->
          <div v-if="selectedCenter" class="absolute bottom-4 left-4 right-4 z-10">
            <div class="relative">
              <button
                class="absolute -top-2 -right-2 z-10 w-7 h-7 bg-white border border-[#E0E0E0] rounded-full flex items-center justify-center shadow-sm"
                @click.stop="selectedCenter = null"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="#999" stroke-width="2.5" stroke-linecap="round"/>
                </svg>
              </button>
              <HospitalCard
                :name="selectedCenter.center_name"
                :address="selectedCenter.address"
                :phone="selectedCenter.contact_phone"
                @click="goToDetail(selectedCenter!.center_id)"
              />
            </div>
          </div>
        </template>

        <!-- 리스트 모드 -->
        <template v-else>
          <div class="h-full overflow-y-auto pb-4">
            <!-- 검색바 -->
            <div class="px-5 py-3">
              <div class="relative">
                <svg class="absolute left-3.5 top-1/2 -translate-y-1/2" width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="8" stroke="#999" stroke-width="2"/>
                  <path d="M21 21L16.65 16.65" stroke="#999" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="센터명, 주소 검색"
                  class="w-full bg-[#F8F8F8] rounded-[14px] pl-10 pr-4 py-3.5 text-[16px] border border-[#E8E8E8] outline-none focus:border-[#03C75A] transition-colors text-[#333]"
                  @input="debouncedSearch"
                />
              </div>
            </div>

            <!-- 로딩 -->
            <div v-if="loading" class="px-5 py-8 text-center">
              <p class="text-[15px] text-[#999]">센터 목록을 불러오는 중...</p>
            </div>

            <!-- 센터 목록 -->
            <div v-else class="px-5 space-y-3">
              <p class="text-[14px] text-[#888] font-medium">건강검진 센터 {{ centers.length }}곳</p>
              <HospitalCard
                v-for="center in centers"
                :key="center.center_id"
                :name="center.center_name"
                :address="center.address"
                :phone="center.contact_phone"
                @click="goToDetail(center.center_id)"
              />
              <p v-if="centers.length === 0" class="text-center text-[15px] text-[#999] py-8">
                검색 결과가 없습니다
              </p>
            </div>
          </div>
        </template>

        <!-- 보기 전환 버튼 -->
        <button
          class="absolute z-20 left-1/2 -translate-x-1/2 flex items-center gap-2 px-5 py-3 rounded-full shadow-lg text-[15px] font-semibold transition-all active:scale-95"
          :class="viewMode === 'map' ? 'bg-white text-[#333] bottom-4' : 'bg-[#03C75A] text-white bottom-4'"
          :style="selectedCenter && viewMode === 'map' ? 'bottom: 130px' : ''"
          @click="toggleView"
        >
          <svg v-if="viewMode === 'map'" width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" stroke="currentColor" stroke-width="2" stroke-linejoin="round" fill="none"/>
            <line x1="8" y1="2" x2="8" y2="18" stroke="currentColor" stroke-width="2"/>
            <line x1="16" y1="6" x2="16" y2="22" stroke="currentColor" stroke-width="2"/>
          </svg>
          {{ viewMode === 'map' ? '리스트 보기' : '지도 보기' }}
        </button>
      </main>

      <SeniorBottomNav />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BackHeader from '@user/components/layout/BackHeader.vue'
import NaverMap from '@user/components/NaverMap.vue'
import HospitalCard from '@user/components/HospitalCard.vue'
import SeniorBottomNav from '@user/components/SeniorBottomNav.vue'
import { fetchHealthCenters } from '@user/services/publicApi'
import type { HealthCenterItem } from '@user/services/publicApi'

const router = useRouter()
const centers = ref<HealthCenterItem[]>([])
const loading = ref(false)
const searchQuery = ref('')
const viewMode = ref<'map' | 'list'>('map')
const selectedCenter = ref<HealthCenterItem | null>(null)
const mapRef = ref<InstanceType<typeof NaverMap> | null>(null)

const mapHeight = computed(() => window.innerHeight - 56 - 72)

let searchTimeout: ReturnType<typeof setTimeout> | null = null

const mapMarkers = computed(() =>
  centers.value
    .filter(c => c.latitude && c.longitude)
    .map(c => ({
      id: c.center_id,
      name: c.center_name,
      latitude: c.latitude!,
      longitude: c.longitude!,
    }))
)

onMounted(() => {
  loadCenters()
})

async function loadCenters() {
  loading.value = true
  try {
    const params: Record<string, unknown> = {}
    if (searchQuery.value) {
      params.search = searchQuery.value
    }
    const res = await fetchHealthCenters(params)
    centers.value = res.data.data
  } catch {
    centers.value = []
  } finally {
    loading.value = false
  }
}

function debouncedSearch() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadCenters()
  }, 300)
}

function onMarkerClick(id: number) {
  const found = centers.value.find(c => c.center_id === id)
  selectedCenter.value = found ?? null
}

function toggleView() {
  selectedCenter.value = null
  viewMode.value = viewMode.value === 'map' ? 'list' : 'map'
}

function goToMyLocation() {
  if (!navigator.geolocation) return
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      mapRef.value?.moveToLocation(pos.coords.latitude, pos.coords.longitude)
    },
    () => {
      alert('위치 정보를 가져올 수 없습니다.')
    },
    { enableHighAccuracy: true, timeout: 5000 }
  )
}

function goToDetail(id: number) {
  router.push(`/health-centers/${id}`)
}
</script>
