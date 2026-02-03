<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] min-h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <BackHeader title="보험 상세" />
      <main class="px-5 py-4 pb-24 overflow-y-auto" style="height: calc(100vh - 56px);">
        <!-- Policy Header -->
        <CardSection class="mb-4">
          <div class="flex items-start justify-between mb-3">
            <div>
              <span class="text-[13px] text-[#888]">삼성화재</span>
              <p class="text-[18px] font-bold text-[#222] mt-0.5">건강보험</p>
            </div>
            <StatusBadge label="유지중" variant="success" />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[20px] font-bold text-[#FF7B22]">월 85,000원</span>
            <span class="text-[12px] text-[#B0B0B0]">종신</span>
          </div>
        </CardSection>

        <!-- Payment Info -->
        <div class="mb-4">
          <p class="text-[15px] font-semibold text-[#222] mb-2">납입 정보</p>
          <CardSection>
            <InfoRow label="납입방법" value="월납" />
            <InfoRow label="납입기간" value="20년납 (2025.01 ~ 2045.01)" />
            <InfoRow label="다음 납입일" value="2025년 2월 15일" />
            <InfoRow label="총 납입액" value="1,020,000원" />
          </CardSection>
        </div>

        <!-- Contract Info -->
        <div class="mb-4">
          <p class="text-[15px] font-semibold text-[#222] mb-2">계약 정보</p>
          <CardSection>
            <InfoRow label="증권번호" value="S-2024-00012345" />
            <InfoRow label="계약일" value="2024년 1월 15일" />
            <InfoRow label="피보험자" value="홍길동" />
            <InfoRow label="수익자" value="법정상속인" />
          </CardSection>
        </div>

        <!-- Coverage Items -->
        <div class="mb-4">
          <p class="text-[15px] font-semibold text-[#222] mb-2">보장 내역</p>
          <CardSection>
            <div v-for="(item, idx) in coverageItems" :key="idx" class="flex items-center justify-between py-2.5 border-b border-[#F5F5F5] last:border-b-0">
              <div>
                <p class="text-[13px] font-medium text-[#333]">{{ item.name }}</p>
                <p class="text-[11px] text-[#999]">{{ item.condition }}</p>
              </div>
              <span class="text-[14px] font-bold text-[#222]">{{ item.amount }}</span>
            </div>
          </CardSection>
        </div>

        <!-- Warning Card -->
        <CardSection class="mb-5 !bg-[#FFF9F0]">
          <div class="flex items-start gap-2">
            <svg class="flex-shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#F3940E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <div>
              <p class="text-[13px] font-semibold text-[#F3940E] mb-0.5">알릴의무 안내</p>
              <p class="text-[12px] text-[#888] leading-relaxed">직업, 건강상태 등 변경사항이 있으면 7일 이내 보험사에 알려주세요. 미이행 시 보험금 지급이 제한될 수 있습니다.</p>
            </div>
          </div>
        </CardSection>

        <!-- Action Buttons -->
        <div class="flex gap-3 mb-6">
          <button class="flex-1 bg-[#FF7B22] text-white rounded-[12px] py-3.5 text-[15px] font-semibold active:scale-[0.98] transition-transform" @click="router.push('/claims/new')">
            보험금 청구
          </button>
          <button class="flex-1 bg-white border border-[#E0E0E0] text-[#555] rounded-[12px] py-3.5 text-[15px] font-semibold active:scale-[0.98] transition-transform" @click="router.push('/consultation')">
            상담 요청
          </button>
        </div>
      </main>
      <BottomNav />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import BackHeader from '@user/components/layout/BackHeader.vue'
import CardSection from '@user/components/ui/CardSection.vue'
import InfoRow from '@user/components/ui/InfoRow.vue'
import StatusBadge from '@user/components/ui/StatusBadge.vue'
import BottomNav from '@user/components/layout/BottomNav.vue'

const router = useRouter()

interface CoverageItem {
  name: string
  condition: string
  amount: string
}

const coverageItems: CoverageItem[] = [
  { name: '일반사망', condition: '질병/재해', amount: '1억원' },
  { name: '암 진단비', condition: '일반암', amount: '3,000만원' },
  { name: '뇌출혈 진단비', condition: '뇌출혈', amount: '2,000만원' },
  { name: '급성심근경색 진단비', condition: '급성심근경색', amount: '2,000만원' },
  { name: '입원일당', condition: '질병/재해 (1일 이상)', amount: '5만원' },
]
</script>
