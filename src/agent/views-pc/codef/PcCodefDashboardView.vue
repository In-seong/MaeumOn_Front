<template>
  <div class="p-6">
    <div class="flex items-center gap-3 mb-6">
      <button class="text-[#999] hover:text-[#FF7B22] transition-colors" @click="router.push({ name: 'codef' })">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
      </button>
      <h1 class="text-[20px] font-bold text-[#333]">{{ customerName }} — 보험·건강 조회</h1>
    </div>

    <!-- 탭 -->
    <div class="flex gap-1 bg-[#F0F0F0] rounded-[12px] p-1 mb-6 max-w-[500px]">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="[
          'flex-1 py-2 rounded-[8px] text-[13px] font-medium transition-colors',
          activeTab === tab.key ? 'bg-white text-[#FF7B22] shadow-sm' : 'text-[#888] hover:text-[#555]'
        ]"
        @click="switchTab(tab.key)"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- 로딩 -->
    <div v-if="store.tabLoading" class="text-center py-16">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF7B22] mx-auto" />
    </div>

    <!-- 보험 계약 탭 -->
    <div v-else-if="activeTab === 'insurance'">
      <div class="flex justify-end mb-4">
        <button
          class="px-4 py-2 bg-[#FF7B22] text-white text-[13px] font-medium rounded-[10px] hover:bg-[#E56D1E] transition-colors"
          @click="showCreditModal = true"
        >
          보험 조회
        </button>
      </div>
      <div v-if="store.insuranceList.length === 0" class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] p-16 text-center">
        <p class="text-[14px] text-[#999]">조회된 보험 계약이 없습니다</p>
        <p class="text-[13px] text-[#BBB] mt-1">내보험다보여 ID/PW로 조회해보세요</p>
      </div>
      <div v-else class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] overflow-x-auto">
        <table class="min-w-full divide-y divide-[#E8E8E8]">
          <thead class="bg-[#FAFAFA]">
            <tr>
              <th class="px-5 py-3 text-left text-[12px] font-medium text-[#999]">보험사</th>
              <th class="px-5 py-3 text-left text-[12px] font-medium text-[#999]">상품명</th>
              <th class="px-5 py-3 text-right text-[12px] font-medium text-[#999]">보험료</th>
              <th class="px-5 py-3 text-center text-[12px] font-medium text-[#999]">상태</th>
              <th class="px-5 py-3 text-center text-[12px] font-medium text-[#999]">계약일</th>
              <th class="px-5 py-3 text-center text-[12px] font-medium text-[#999]">만기일</th>
              <th class="px-5 py-3 text-center text-[12px] font-medium text-[#999]">보장내역</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#F0F0F0]">
            <tr
              v-for="ins in store.insuranceList"
              :key="ins.insurance_id"
              class="hover:bg-[#FAFAFA] transition-colors"
            >
              <td class="px-5 py-3.5 text-[13px] text-[#666]">{{ ins.insurance_company?.company_name || '-' }}</td>
              <td class="px-5 py-3.5 text-[13px] font-medium text-[#333]">{{ ins.product_name || '-' }}</td>
              <td class="px-5 py-3.5 text-[13px] text-[#333] text-right font-variant-numeric tabular-nums">{{ formatCurrency(ins.premium_amount) }}</td>
              <td class="px-5 py-3.5 text-center">
                <span
                  :class="ins.contract_status === '정상' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-[#999]'"
                  class="px-2 py-0.5 rounded-full text-[11px] font-medium"
                >{{ ins.contract_status || '-' }}</span>
              </td>
              <td class="px-5 py-3.5 text-[13px] text-[#999] text-center">{{ formatDate(ins.subscription_date) }}</td>
              <td class="px-5 py-3.5 text-[13px] text-[#999] text-center">{{ formatDate(ins.expiration_date || ins.end_date) }}</td>
              <td class="px-5 py-3.5 text-[13px] text-[#999] text-center">{{ ins.coverages?.length || 0 }}건</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 진료 내역 탭 -->
    <div v-else-if="activeTab === 'medical'">
      <div class="flex items-center justify-between mb-4">
        <!-- 병원/약국 서브탭 -->
        <div class="flex bg-[#F0F0F0] rounded-[10px] p-1">
          <button
            :class="[
              'px-4 py-1.5 rounded-[8px] text-[13px] font-medium transition-colors',
              medicalSubTab === 'hospital' ? 'bg-white text-[#FF7B22] shadow-sm' : 'text-[#888] hover:text-[#555]'
            ]"
            @click="medicalSubTab = 'hospital'"
          >
            병원
          </button>
          <button
            :class="[
              'px-4 py-1.5 rounded-[8px] text-[13px] font-medium transition-colors',
              medicalSubTab === 'pharmacy' ? 'bg-white text-[#FF7B22] shadow-sm' : 'text-[#888] hover:text-[#555]'
            ]"
            @click="medicalSubTab = 'pharmacy'"
          >
            약국
          </button>
        </div>
        <button class="px-4 py-2 bg-[#FF7B22] text-white text-[13px] font-medium rounded-[10px] hover:bg-[#E56D1E] transition-colors" @click="startSimpleAuth('medical')">진료 조회</button>
      </div>
      <div v-if="filteredMedicalRecords.length === 0" class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] p-16 text-center">
        <p class="text-[14px] text-[#999]">{{ medicalSubTab === 'hospital' ? '조회된 병원 진료 내역이 없습니다' : '조회된 약국 내역이 없습니다' }}</p>
      </div>
      <div v-else class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] overflow-x-auto">
        <table class="min-w-full divide-y divide-[#E8E8E8]">
          <thead class="bg-[#FAFAFA]">
            <tr>
              <th class="px-5 py-3 text-left text-[12px] font-medium text-[#999]">진료일</th>
              <th class="px-5 py-3 text-left text-[12px] font-medium text-[#999]">{{ medicalSubTab === 'hospital' ? '병원' : '약국' }}</th>
              <th class="px-5 py-3 text-left text-[12px] font-medium text-[#999]">진료과</th>
              <th class="px-5 py-3 text-left text-[12px] font-medium text-[#999]">진단명</th>
              <th class="px-5 py-3 text-right text-[12px] font-medium text-[#999]">진료비</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#F0F0F0]">
            <tr v-for="rec in filteredMedicalRecords" :key="rec.record_id" class="hover:bg-[#FAFAFA] transition-colors">
              <td class="px-5 py-3.5 text-[13px] text-[#999]">{{ formatDate(rec.treatment_date) }}</td>
              <td class="px-5 py-3.5 text-[13px] font-medium text-[#333]">{{ rec.hospital_name || '-' }}</td>
              <td class="px-5 py-3.5 text-[13px] text-[#666]">{{ rec.department || '-' }}</td>
              <td class="px-5 py-3.5 text-[13px] text-[#666]">{{ rec.diagnosis_name || '-' }}</td>
              <td class="px-5 py-3.5 text-[13px] text-[#333] text-right font-variant-numeric tabular-nums">{{ formatCurrency(rec.total_amount) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 건강검진 탭 -->
    <div v-else-if="activeTab === 'checkup'">
      <div class="flex justify-end mb-4">
        <button class="px-4 py-2 bg-[#FF7B22] text-white text-[13px] font-medium rounded-[10px] hover:bg-[#E56D1E] transition-colors" @click="startSimpleAuth('checkup')">검진 조회</button>
      </div>
      <div v-if="store.checkups.length === 0" class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] p-16 text-center">
        <p class="text-[14px] text-[#999]">조회된 검진 결과가 없습니다</p>
      </div>
      <div v-else class="space-y-4">
        <div
          v-for="chk in store.checkups"
          :key="chk.checkup_id"
          class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] p-6"
        >
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-[15px] font-semibold text-[#333]">{{ formatDate(chk.checkup_date) }} 검진</h3>
              <p v-if="chk.checkup_place" class="text-[13px] text-[#999] mt-0.5">{{ chk.checkup_place }}</p>
            </div>
            <span
              :class="chk.judgment_result === '정상' ? 'bg-green-50 text-green-600' : chk.judgment_result ? 'bg-yellow-50 text-yellow-700' : 'bg-gray-100 text-[#999]'"
              class="px-3 py-1 rounded-full text-[12px] font-medium"
            >{{ chk.judgment_result || '결과 없음' }}</span>
          </div>
          <div class="grid grid-cols-4 gap-4">
            <div v-if="chk.height" class="bg-[#F8F8F8] rounded-[10px] p-3 text-center">
              <p class="text-[11px] text-[#999] mb-1">키</p>
              <p class="text-[15px] font-semibold text-[#333]">{{ chk.height }}<span class="text-[11px] text-[#999]">cm</span></p>
            </div>
            <div v-if="chk.weight" class="bg-[#F8F8F8] rounded-[10px] p-3 text-center">
              <p class="text-[11px] text-[#999] mb-1">체중</p>
              <p class="text-[15px] font-semibold text-[#333]">{{ chk.weight }}<span class="text-[11px] text-[#999]">kg</span></p>
            </div>
            <div v-if="chk.bmi" class="bg-[#F8F8F8] rounded-[10px] p-3 text-center">
              <p class="text-[11px] text-[#999] mb-1">BMI</p>
              <p class="text-[15px] font-semibold text-[#333]">{{ chk.bmi }}</p>
            </div>
            <div v-if="chk.blood_pressure_high" class="bg-[#F8F8F8] rounded-[10px] p-3 text-center">
              <p class="text-[11px] text-[#999] mb-1">혈압</p>
              <p class="text-[15px] font-semibold text-[#333]">{{ chk.blood_pressure_high }}/{{ chk.blood_pressure_low }}</p>
            </div>
            <div v-if="chk.fasting_blood_sugar" class="bg-[#F8F8F8] rounded-[10px] p-3 text-center">
              <p class="text-[11px] text-[#999] mb-1">공복혈당</p>
              <p class="text-[15px] font-semibold text-[#333]">{{ chk.fasting_blood_sugar }}</p>
            </div>
            <div v-if="chk.total_cholesterol" class="bg-[#F8F8F8] rounded-[10px] p-3 text-center">
              <p class="text-[11px] text-[#999] mb-1">콜레스테롤</p>
              <p class="text-[15px] font-semibold text-[#333]">{{ chk.total_cholesterol }}</p>
            </div>
            <div v-if="chk.hemoglobin" class="bg-[#F8F8F8] rounded-[10px] p-3 text-center">
              <p class="text-[11px] text-[#999] mb-1">혈색소</p>
              <p class="text-[15px] font-semibold text-[#333]">{{ chk.hemoglobin }}</p>
            </div>
            <div v-if="chk.gfr" class="bg-[#F8F8F8] rounded-[10px] p-3 text-center">
              <p class="text-[11px] text-[#999] mb-1">신사구체여과율</p>
              <p class="text-[15px] font-semibold text-[#333]">{{ chk.gfr }}</p>
            </div>
          </div>
          <p v-if="chk.overall_opinion" class="mt-4 pt-3 border-t border-[#F0F0F0] text-[13px] text-[#666]">{{ chk.overall_opinion }}</p>
        </div>
      </div>
    </div>

    <!-- 건강나이 탭 -->
    <div v-else-if="activeTab === 'healthAge'">
      <div class="flex justify-end mb-4">
        <button class="px-4 py-2 bg-[#FF7B22] text-white text-[13px] font-medium rounded-[10px] hover:bg-[#E56D1E] transition-colors" @click="startSimpleAuth('healthAge')">건강나이 조회</button>
      </div>
      <div v-if="!store.healthAge" class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] p-16 text-center">
        <p class="text-[14px] text-[#999]">조회된 건강나이 정보가 없습니다</p>
      </div>
      <div v-else class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] p-8 max-w-[480px]">
        <div class="text-center mb-6">
          <p class="text-[14px] text-[#999] mb-2">건강나이</p>
          <p class="text-[48px] font-bold text-[#FF7B22]">{{ store.healthAge.health_age ?? '-' }}<span class="text-[18px] font-normal text-[#999]">세</span></p>
          <p v-if="store.healthAge.actual_age" class="text-[14px] text-[#999] mt-2">실제 나이 {{ store.healthAge.actual_age }}세</p>
        </div>
        <div v-if="store.healthAge.risk_level" class="text-center mb-4">
          <span
            :class="store.healthAge.risk_level === '양호' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-700'"
            class="px-4 py-1.5 rounded-full text-[14px] font-medium"
          >{{ store.healthAge.risk_level }}</span>
        </div>
        <p class="text-[12px] text-[#BBB] text-center">{{ formatDate(store.healthAge.created_at) }} 기준</p>
      </div>
    </div>

    <!-- 내보험다보여 인증 모달 -->
    <div v-if="showCreditModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="showCreditModal = false">
      <div class="bg-white rounded-[16px] w-[420px] p-6">
        <h3 class="text-[17px] font-bold text-[#222] mb-5">내보험다보여 로그인</h3>
        <div class="space-y-3">
          <input v-model="creditId" type="text" placeholder="아이디" class="w-full px-4 py-3 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] text-[14px] outline-none focus:border-[#FF7B22]" />
          <input v-model="creditPw" type="password" placeholder="비밀번호" class="w-full px-4 py-3 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] text-[14px] outline-none focus:border-[#FF7B22]" />
        </div>
        <div class="flex gap-3 mt-6">
          <button class="flex-1 py-3 bg-[#F0F0F0] text-[#666] text-[14px] font-medium rounded-[12px] hover:bg-[#E8E8E8] transition-colors" @click="showCreditModal = false">취소</button>
          <button class="flex-1 py-3 bg-[#FF7B22] text-white text-[14px] font-medium rounded-[12px] hover:bg-[#E56D1E] transition-colors disabled:opacity-50" :disabled="!creditId || !creditPw || fetchLoading" @click="doFetchInsurance">
            {{ fetchLoading ? '조회 중...' : '조회' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 간편인증 모달 -->
    <div v-if="showAuthModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="showAuthModal = false">
      <div class="bg-white rounded-[16px] w-[420px] p-6">
        <h3 class="text-[17px] font-bold text-[#222] mb-5">간편인증 ({{ authTargetLabel }})</h3>
        <div v-if="twoWayPending">
          <p class="text-[14px] text-[#555] text-center py-8">고객 휴대폰에서 간편인증을 완료해주세요</p>
          <p class="text-[13px] text-[#999] text-center mb-5">카카오톡 또는 PASS 앱 확인</p>
          <div class="flex gap-3">
            <button class="flex-1 py-3 bg-[#F0F0F0] text-[#666] text-[14px] font-medium rounded-[12px] hover:bg-[#E8E8E8] transition-colors" @click="showAuthModal = false">취소</button>
            <button class="flex-1 py-3 bg-[#FF7B22] text-white text-[14px] font-medium rounded-[12px] hover:bg-[#E56D1E] transition-colors disabled:opacity-50" :disabled="fetchLoading" @click="doConfirmAuth">
              {{ fetchLoading ? '확인 중...' : '인증 완료' }}
            </button>
          </div>
        </div>
        <div v-else>
          <div class="space-y-3 mb-3">
            <div>
              <label class="text-[12px] text-[#999] mb-1 block">통신사</label>
              <AppSelect
                v-model="authTelecom"
                placeholder="통신사 선택"
                :options="telecomOptions"
              />
            </div>
            <div>
              <label class="text-[12px] text-[#999] mb-1 block">인증 방법</label>
              <AppSelect
                v-model="authLevel"
                :options="authLevelOptions"
              />
            </div>
          </div>
          <p class="text-[12px] text-[#BBB] mb-5">고객 본인의 이름·주민번호·전화번호를 기반으로 인증합니다</p>
          <div class="flex gap-3">
            <button class="flex-1 py-3 bg-[#F0F0F0] text-[#666] text-[14px] font-medium rounded-[12px] hover:bg-[#E8E8E8] transition-colors" @click="showAuthModal = false">취소</button>
            <button class="flex-1 py-3 bg-[#FF7B22] text-white text-[14px] font-medium rounded-[12px] hover:bg-[#E56D1E] transition-colors disabled:opacity-50" :disabled="!authTelecom || fetchLoading" @click="doFetchAuth">
              {{ fetchLoading ? '요청 중...' : '인증 요청' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 2-Way 모달 (내보험다보여 SMS) -->
    <div v-if="showCreditTwoWay" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="showCreditTwoWay = false">
      <div class="bg-white rounded-[16px] w-[420px] p-6">
        <h3 class="text-[17px] font-bold text-[#222] mb-5">추가 인증</h3>
        <p class="text-[13px] text-[#666] mb-3">SMS 인증번호를 입력해주세요</p>
        <input v-model="creditSmsCode" type="text" placeholder="인증번호" class="w-full px-4 py-3 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] text-[14px] outline-none focus:border-[#FF7B22] mb-5" />
        <div class="flex gap-3">
          <button class="flex-1 py-3 bg-[#F0F0F0] text-[#666] text-[14px] font-medium rounded-[12px] hover:bg-[#E8E8E8] transition-colors" @click="showCreditTwoWay = false">취소</button>
          <button class="flex-1 py-3 bg-[#FF7B22] text-white text-[14px] font-medium rounded-[12px] hover:bg-[#E56D1E] transition-colors disabled:opacity-50" :disabled="!creditSmsCode || fetchLoading" @click="doConfirmInsurance">
            {{ fetchLoading ? '확인 중...' : '확인' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppSelect from '../../components/ui/AppSelect.vue'
import { useCodefStore } from '../../stores/codefStore'
import { useToast } from '../../composables/useToast'
import * as api from '../../services/agentApi'
import type { MedicalRecordFull } from '../../types'

const route = useRoute()
const router = useRouter()
const store = useCodefStore()
const toast = useToast()

const customerId = computed(() => route.params.customerId as string)
const customerName = ref('고객')

const tabs = [
  { key: 'insurance', label: '보험 계약' },
  { key: 'medical', label: '진료 내역' },
  { key: 'checkup', label: '건강검진' },
  { key: 'healthAge', label: '건강나이' },
] as const

type TabKey = typeof tabs[number]['key']
const activeTab = ref<TabKey>('insurance')

const showCreditModal = ref(false)
const creditId = ref('')
const creditPw = ref('')
const showCreditTwoWay = ref(false)
const creditSmsCode = ref('')

const showAuthModal = ref(false)
const authTarget = ref<'medical' | 'checkup' | 'healthAge'>('medical')
const authTelecom = ref('')
const authLevel = ref('1')

const telecomOptions = [
  { value: '0', label: 'SKT' },
  { value: '1', label: 'KT' },
  { value: '2', label: 'LG U+' },
  { value: '3', label: 'SKT 알뜰폰' },
  { value: '4', label: 'KT 알뜰폰' },
  { value: '5', label: 'LG U+ 알뜰폰' },
]
const authLevelOptions = [
  { value: '1', label: '카카오톡' },
  { value: '5', label: '통신사(PASS)' },
  { value: '3', label: '삼성패스' },
  { value: '4', label: 'KB모바일' },
  { value: '6', label: '네이버' },
  { value: '8', label: '토스' },
]
const medicalSubTab = ref<'hospital' | 'pharmacy'>('hospital')
const twoWayPending = ref(false)

const fetchLoading = ref(false)

const filteredMedicalRecords = computed(() => {
  const isPharmacy = (rec: MedicalRecordFull) =>
    rec.hospital_name?.includes('약국') || rec.treatment_type === '약국'
  if (medicalSubTab.value === 'pharmacy') return store.medicalRecords.filter(isPharmacy)
  return store.medicalRecords.filter(r => !isPharmacy(r))
})

const authTargetLabel = computed(() => {
  const m: Record<string, string> = { medical: '진료내역', checkup: '건강검진', healthAge: '건강나이' }
  return m[authTarget.value] || ''
})

onMounted(() => {
  store.resetDetail()
  loadTabData()
  loadCustomerName()
})

watch(customerId, () => {
  store.resetDetail()
  loadTabData()
  loadCustomerName()
})

function switchTab(tab: TabKey) {
  activeTab.value = tab
  loadTabData()
}

function loadTabData() {
  const id = customerId.value
  if (!id) return
  if (activeTab.value === 'insurance') store.loadInsurance(id)
  else if (activeTab.value === 'medical') store.loadMedical(id)
  else if (activeTab.value === 'checkup') store.loadCheckups(id)
  else if (activeTab.value === 'healthAge') store.loadHealthAge(id)
}

async function loadCustomerName() {
  const c = store.customers.find(x => x.customer_id === customerId.value)
  if (c) { customerName.value = c.name; return }
  try {
    const res = await api.fetchCodefCustomers({ search: customerId.value })
    const found = (res.data.data as Array<{ customer_id: string; name: string }>).find(
      x => x.customer_id === customerId.value
    )
    if (found) customerName.value = found.name
  } catch { /* ignore */ }
}

async function doFetchInsurance() {
  fetchLoading.value = true
  try {
    const res = await api.fetchInsurance(customerId.value, { id: creditId.value, password: creditPw.value })
    const data = res.data as { success: boolean; two_way?: { two_way_pending: boolean }; message?: string }
    if (data.two_way?.two_way_pending) {
      showCreditModal.value = false
      showCreditTwoWay.value = true
      toast.showToast('추가 인증이 필요합니다', 'success')
    } else if (data.success) {
      showCreditModal.value = false
      toast.showToast('보험 계약 조회 완료', 'success')
      store.loadInsurance(customerId.value)
    } else {
      toast.showToast(data.message || '조회에 실패했습니다', 'error')
    }
  } catch {
    toast.showToast('보험 조회 중 오류가 발생했습니다', 'error')
  } finally {
    fetchLoading.value = false
  }
}

async function doConfirmInsurance() {
  fetchLoading.value = true
  try {
    const res = await api.confirmInsurance(customerId.value, { smsAuthNo: creditSmsCode.value })
    const data = res.data as { success: boolean; message?: string }
    if (data.success) {
      showCreditTwoWay.value = false
      creditSmsCode.value = ''
      toast.showToast('보험 계약 조회 완료', 'success')
      store.loadInsurance(customerId.value)
    } else {
      toast.showToast(data.message || '인증에 실패했습니다', 'error')
    }
  } catch {
    toast.showToast('인증 확인 중 오류가 발생했습니다', 'error')
  } finally {
    fetchLoading.value = false
  }
}

function startSimpleAuth(target: 'medical' | 'checkup' | 'healthAge') {
  authTarget.value = target
  twoWayPending.value = false
  showAuthModal.value = true
}

async function doFetchAuth() {
  fetchLoading.value = true
  try {
    const fetchFn = authTarget.value === 'medical' ? api.fetchMedical
      : authTarget.value === 'checkup' ? api.fetchCheckup
      : api.fetchHealthAgeApi
    const res = await fetchFn(customerId.value, { loginTypeLevel: authLevel.value, telecom: authTelecom.value })
    const data = res.data as { success: boolean; two_way?: boolean; message?: string }
    if (data.two_way) {
      twoWayPending.value = true
      toast.showToast('고객 휴대폰에서 인증을 완료해주세요', 'success')
    } else if (data.success) {
      showAuthModal.value = false
      toast.showToast('조회 완료', 'success')
      loadTabData()
    } else {
      toast.showToast(data.message || '조회에 실패했습니다', 'error')
    }
  } catch (err: any) {
    const msg = err?.response?.data?.message || '조회 요청 중 오류가 발생했습니다'
    toast.showToast(msg, 'error')
  } finally {
    fetchLoading.value = false
  }
}

async function doConfirmAuth() {
  fetchLoading.value = true
  try {
    const confirmFn = authTarget.value === 'medical' ? api.confirmMedical
      : authTarget.value === 'checkup' ? api.confirmCheckup
      : api.confirmHealthAge
    const res = await confirmFn(customerId.value, { is_confirm: '1' })
    const data = res.data as { success: boolean; message?: string }
    if (data.success) {
      showAuthModal.value = false
      twoWayPending.value = false
      toast.showToast('조회 완료', 'success')
      loadTabData()
    } else {
      toast.showToast(data.message || '인증 확인에 실패했습니다', 'error')
    }
  } catch {
    toast.showToast('인증 확인 중 오류가 발생했습니다', 'error')
  } finally {
    fetchLoading.value = false
  }
}

function formatDate(d?: string | null): string {
  if (!d) return '-'
  const date = new Date(d)
  if (isNaN(date.getTime())) return d
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
}

function formatCurrency(amount?: number | string | null): string {
  if (amount == null) return '-'
  const n = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(n)) return '-'
  return n.toLocaleString('ko-KR') + '원'
}
</script>
