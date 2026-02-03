<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] min-h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <BackHeader title="건강검진 결과" />

      <main class="px-5 py-4 pb-24 overflow-y-auto" style="height: calc(100vh - 56px - 60px);">
        <!-- Summary Card -->
        <CardSection class="mb-4">
          <div class="flex items-center gap-4">
            <div class="w-[48px] h-[48px] rounded-full bg-[#FFF0E5] flex items-center justify-center flex-shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z" stroke="#FF7B22" stroke-width="1.5"/>
                <path d="M12 8v4M12 16h.01" stroke="#FF7B22" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <div>
              <p class="text-[12px] text-[#999]">최근 검진일</p>
              <p class="text-[18px] font-bold text-[#222]">2023.10.15</p>
              <p class="text-[12px] text-[#888]">국민건강보험공단</p>
            </div>
          </div>
        </CardSection>

        <!-- Overall Result -->
        <div class="bg-[#FFF7F0] border border-[#FFE0C5] rounded-[16px] p-4 mb-4">
          <div class="flex items-center gap-2 mb-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#F3940E" stroke-width="2"/>
              <line x1="12" y1="9" x2="12" y2="13" stroke="#F3940E" stroke-width="2" stroke-linecap="round"/>
              <line x1="12" y1="17" x2="12.01" y2="17" stroke="#F3940E" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span class="text-[14px] font-semibold text-[#F3940E]">일반질환 의심</span>
          </div>
          <p class="text-[12px] text-[#888]">일부 항목 주의가 필요합니다</p>
        </div>

        <!-- Checkup Items -->
        <CardSection class="mb-4">
          <p class="text-[14px] font-semibold text-[#222] mb-3">검진 항목</p>
          <div class="flex flex-col gap-3">
            <div v-for="item in checkupItems" :key="item.name" class="flex items-center justify-between py-2.5 border-b border-[#F5F5F5] last:border-b-0">
              <div>
                <p class="text-[14px] font-medium text-[#333]">{{ item.name }}</p>
                <p class="text-[12px] text-[#999]">{{ item.detail }}</p>
              </div>
              <StatusBadge :label="item.status" :variant="item.variant" />
            </div>
          </div>
        </CardSection>

        <!-- Health Guide -->
        <CardSection class="mb-5">
          <p class="text-[14px] font-semibold text-[#222] mb-3">건강 개선 가이드</p>
          <div class="flex flex-col gap-3">
            <div v-for="guide in guideItems" :key="guide.title" class="flex items-start gap-3 py-2 border-b border-[#F5F5F5] last:border-b-0">
              <div class="w-8 h-8 rounded-full bg-[#FFF0E5] flex items-center justify-center flex-shrink-0 mt-0.5">
                <span class="text-[14px]">{{ guide.icon }}</span>
              </div>
              <div>
                <p class="text-[14px] font-medium text-[#333]">{{ guide.title }}</p>
                <p class="text-[12px] text-[#888] mt-0.5 leading-relaxed">{{ guide.description }}</p>
              </div>
            </div>
          </div>
        </CardSection>

        <!-- Hospital Button -->
        <button
          class="w-full bg-[#FF7B22] text-white rounded-[12px] py-3.5 text-[15px] font-semibold active:scale-[0.98] transition-transform"
          @click="router.push('/hospital')"
        >
          주변 병원 찾기
        </button>
      </main>

      <BottomNav />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import BackHeader from '@user/components/layout/BackHeader.vue'
import BottomNav from '@user/components/layout/BottomNav.vue'
import CardSection from '@user/components/ui/CardSection.vue'
import StatusBadge from '@user/components/ui/StatusBadge.vue'

const router = useRouter()

const checkupItems: { name: string; detail: string; status: string; variant: 'success' | 'warning' | 'danger' }[] = [
  { name: '혈압', detail: '120/80 mmHg', status: '정상', variant: 'success' },
  { name: '혈당', detail: '공복혈당 112 mg/dL', status: '주의', variant: 'warning' },
  { name: '콜레스테롤', detail: '총 콜레스테롤 245 mg/dL', status: '이상', variant: 'danger' },
  { name: '간기능', detail: 'AST 25, ALT 22', status: '정상', variant: 'success' },
  { name: '신장기능', detail: '크레아티닌 0.9 mg/dL', status: '정상', variant: 'success' },
]

const guideItems = [
  { icon: '🥗', title: '식이요법', description: '콜레스테롤 수치 관리를 위해 포화지방 섭취를 줄이고, 식이섬유가 풍부한 식품을 섭취하세요.' },
  { icon: '🏃', title: '운동', description: '주 3회 이상 30분 유산소 운동을 권장합니다. 걷기, 조깅, 수영 등이 좋습니다.' },
  { icon: '🏥', title: '추가 검사', description: '콜레스테롤 수치가 높으므로 3개월 후 재검사를 권장합니다.' },
]
</script>
