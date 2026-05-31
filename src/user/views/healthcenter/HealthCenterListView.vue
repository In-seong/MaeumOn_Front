<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] min-h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <BackHeader title="건강검진 센터 예약" />

      <main class="overflow-y-auto pb-24" style="height: calc(100vh - 56px);">
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
              class="w-full bg-[#F8F8F8] rounded-[12px] pl-10 pr-4 py-3 text-[15px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333]"
              @input="debouncedSearch"
            />
          </div>
        </div>

        <!-- 지도 -->
        <div class="px-5 mb-4">
          <NaverMap
            ref="mapRef"
            :height="250"
            :markers="mapMarkers"
            @marker-click="scrollToCenter"
          />
        </div>

        <!-- 로딩 -->
        <div v-if="loading" class="px-5 py-8 text-center">
          <p class="text-[14px] text-[#999]">센터 목록을 불러오는 중...</p>
        </div>

        <!-- 센터 목록 -->
        <div v-else class="px-5 space-y-3">
          <p class="text-[13px] text-[#888]">건강검진 센터 {{ centers.length }}곳</p>
          <HospitalCard
            v-for="center in centers"
            :key="center.center_id"
            :ref="(el: any) => { if (el) centerRefs[center.center_id] = el }"
            :name="center.center_name"
            :address="center.address"
            :phone="center.contact_phone"
            @click="goToDetail(center.center_id)"
          />
          <p v-if="centers.length === 0" class="text-center text-[14px] text-[#999] py-8">
            검색 결과가 없습니다
          </p>
        </div>
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
const centerRefs: Record<number, any> = {}

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

function scrollToCenter(id: number) {
  const el = centerRefs[id]?.$el
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

function goToDetail(id: number) {
  router.push(`/health-centers/${id}`)
}
</script>
