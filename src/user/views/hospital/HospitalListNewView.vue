<template>
  <div class="fixed inset-0 bg-white flex justify-center overflow-hidden overscroll-none">
    <div class="w-full max-w-[402px] relative bg-white flex flex-col h-full">
      <div @touchmove.prevent>
        <BackHeader title="병원 예약" />
      </div>

      <main class="relative flex-1 overflow-hidden">
        <!-- 지도 모드 -->
        <template v-if="viewMode === 'map'">
          <!-- 검색바 (지도 위 오버레이) -->
          <div class="absolute top-0 left-0 right-0 z-10 px-4 pt-3" @touchmove.prevent>
            <div class="relative">
              <svg class="absolute left-2.5 top-1/2 -translate-y-1/2" width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="#999" stroke-width="2"/>
                <path d="M21 21L16.65 16.65" stroke="#999" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="병원명, 진료과목 검색"
                class="w-full bg-white/95 backdrop-blur-sm rounded-[14px] pl-8 pr-4 py-3.5 text-[16px] border border-[#E0E0E0] outline-none focus:border-[#03C75A] transition-colors text-[#333] shadow-lg"
                @input="debouncedSearch"
              />
            </div>
          </div>

          <!-- 내 위치 버튼 -->
          <button
            class="absolute right-4 z-20 w-11 h-11 bg-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-all"
            :style="{ bottom: selectedHospital ? '240px' : '90px' }"
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

          <!-- 선택된 병원 카드 (하단 오버레이) -->
          <div v-if="selectedHospital" class="absolute bottom-[87px] left-4 right-4 z-10">
            <div class="relative">
              <button
                class="absolute -top-2 -right-2 z-10 w-7 h-7 bg-white border border-[#E0E0E0] rounded-full flex items-center justify-center shadow-sm"
                @click.stop="selectedHospital = null"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="#999" stroke-width="2.5" stroke-linecap="round"/>
                </svg>
              </button>
              <HospitalCard
                :name="selectedHospital.hospital_name"
                :address="selectedHospital.address"
                :specialties="selectedHospital.specialties"
                :phone="selectedHospital.contact_phone"
                :image-url="getHospitalImageUrl(selectedHospital)"
                @click="goToDetail(selectedHospital!.hospital_id)"
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
                  placeholder="병원명, 진료과목 검색"
                  class="w-full bg-[#F8F8F8] rounded-[14px] pl-10 pr-4 py-3.5 text-[16px] border border-[#E8E8E8] outline-none focus:border-[#03C75A] transition-colors text-[#333]"
                  @input="debouncedSearch"
                />
              </div>
            </div>

            <!-- 로딩 -->
            <div v-if="loading" class="px-5 py-8 text-center">
              <p class="text-[15px] text-[#999]">병원 목록을 불러오는 중...</p>
            </div>

            <!-- 병원 목록 -->
            <div v-else class="px-5 space-y-3">
              <p class="text-[14px] text-[#888] font-medium">협약 병원 {{ hospitals.length }}곳</p>
              <HospitalCard
                v-for="hospital in hospitals"
                :key="hospital.hospital_id"
                :name="hospital.hospital_name"
                :address="hospital.address"
                :specialties="hospital.specialties"
                :phone="hospital.contact_phone"
                :image-url="getHospitalImageUrl(hospital)"
                @click="goToDetail(hospital.hospital_id)"
              />
              <p v-if="hospitals.length === 0" class="text-center text-[15px] text-[#999] py-8">
                검색 결과가 없습니다
              </p>
            </div>
          </div>
        </template>

        <!-- 보기 전환 버튼 -->
        <button
          v-show="!(selectedHospital && viewMode === 'map')"
          class="absolute z-20 left-1/2 -translate-x-1/2 flex items-center gap-2 px-5 py-3 rounded-full shadow-lg text-[15px] font-semibold transition-all active:scale-95"
          :class="viewMode === 'map' ? 'bg-white text-[#333] bottom-[87px]' : 'bg-[#03C75A] text-white bottom-[60px]'"
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
          {{ viewMode === 'map' ? '목록 보기' : '지도 보기' }}
        </button>
      </main>

      <div v-if="viewMode === 'list'" class="flex-shrink-0 h-[50px]" style="padding-bottom: env(safe-area-inset-bottom, 0px);"></div>
      <SeniorBottomNav />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDialog } from '@user/composables/useDialog'
import BackHeader from '@user/components/layout/BackHeader.vue'
import NaverMap from '@user/components/NaverMap.vue'
import HospitalCard from '@user/components/HospitalCard.vue'
import SeniorBottomNav from '@user/components/SeniorBottomNav.vue'
import { fetchHospitals } from '@user/services/publicApi'
import type { PartnerHospital } from '@user/services/publicApi'

const router = useRouter()
const dialog = useDialog()
const hospitals = ref<PartnerHospital[]>([])
const loading = ref(false)
const searchQuery = ref('')
const viewMode = ref<'map' | 'list'>('map')
const selectedHospital = ref<PartnerHospital | null>(null)
const mapRef = ref<InstanceType<typeof NaverMap> | null>(null)

const viewportHeight = ref(window.innerHeight)
const mapHeight = computed(() => viewportHeight.value - 56 - 72)

function onResize() { viewportHeight.value = window.innerHeight }

let searchTimeout: ReturnType<typeof setTimeout> | null = null

const mapMarkers = computed(() =>
  hospitals.value
    .filter(h => h.latitude && h.longitude)
    .map(h => ({
      id: h.hospital_id,
      name: h.hospital_name,
      latitude: h.latitude!,
      longitude: h.longitude!,
    }))
)

onMounted(() => {
  window.addEventListener('resize', onResize)
  loadHospitals()
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
})

async function loadHospitals() {
  loading.value = true
  try {
    const params: Record<string, unknown> = {}
    if (searchQuery.value) {
      params.search = searchQuery.value
    }
    const res = await fetchHospitals(params)
    hospitals.value = res.data.data
  } catch {
    hospitals.value = []
  } finally {
    loading.value = false
  }
}

function debouncedSearch() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadHospitals()
  }, 300)
}

function onMarkerClick(id: number) {
  const found = hospitals.value.find(h => h.hospital_id === id)
  selectedHospital.value = found ?? null
}

function toggleView() {
  selectedHospital.value = null
  viewMode.value = viewMode.value === 'map' ? 'list' : 'map'
}

function goToMyLocation() {
  if (!navigator.geolocation) return
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      mapRef.value?.moveToLocation(pos.coords.latitude, pos.coords.longitude)
    },
    () => {
      dialog.error('위치 정보를 가져올 수 없습니다.')
    },
    { enableHighAccuracy: true, timeout: 5000 }
  )
}

function getHospitalImageUrl(h: PartnerHospital): string | undefined {
  if (h.thumbnail_url) return h.thumbnail_url
  if (h.image_url) return h.image_url
  const firstImg = h.images?.[0]
  return firstImg?.image_url ?? undefined
}

function goToDetail(id: number) {
  router.push(`/hospitals/${id}`)
}
</script>
