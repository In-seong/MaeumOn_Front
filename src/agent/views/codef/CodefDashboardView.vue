<template>
  <div class="min-h-screen bg-[#F8F8F8]">
    <BackHeader :title="customerName" />

    <div class="px-4 pt-3 pb-28">
      <!-- 탭 -->
      <div class="flex bg-white rounded-[14px] border border-[#E8E8E8] p-1 mb-4">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          :class="[
            'flex-1 py-2.5 rounded-[10px] text-[13px] font-medium transition-colors',
            activeTab === tab.key ? 'bg-[#FF7B22] text-white' : 'text-[#888]'
          ]"
          @click="switchTab(tab.key)"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- 로딩 -->
      <div v-if="store.tabLoading" class="text-center py-16">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7B22] mx-auto" />
      </div>

      <!-- 보험 계약 탭 -->
      <div v-else-if="activeTab === 'insurance'">
        <div class="flex justify-end mb-3">
          <button
            class="px-3 py-1.5 bg-[#FF7B22] text-white text-[12px] font-medium rounded-[8px] active:scale-95 transition-transform"
            @click="showCreditModal = true"
          >
            보험 조회
          </button>
        </div>
        <div v-if="store.insuranceList.length === 0" class="text-center py-12">
          <p class="text-[14px] text-[#999]">조회된 보험 계약이 없습니다</p>
          <p class="text-[12px] text-[#BBB] mt-1">내보험다보여 ID/PW로 조회해보세요</p>
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="ins in store.insuranceList"
            :key="ins.insurance_id"
            class="bg-white rounded-[14px] border border-[#E8E8E8] p-4"
          >
            <div class="flex items-start justify-between mb-2">
              <div>
                <p class="text-[14px] font-semibold text-[#222]">{{ ins.product_name || '보험상품' }}</p>
                <p class="text-[12px] text-[#999] mt-0.5">{{ ins.insurance_company?.company_name || '-' }}</p>
              </div>
              <span
                :class="ins.contract_status === '정상' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-[#999]'"
                class="px-2 py-0.5 rounded-full text-[11px] font-medium"
              >{{ ins.contract_status || '-' }}</span>
            </div>
            <div class="grid grid-cols-2 gap-2 text-[12px]">
              <div><span class="text-[#999]">보험료</span> <span class="text-[#333] ml-1">{{ formatCurrency(ins.premium_amount) }}</span></div>
              <div><span class="text-[#999]">계약일</span> <span class="text-[#333] ml-1">{{ formatDate(ins.subscription_date) }}</span></div>
              <div><span class="text-[#999]">만기일</span> <span class="text-[#333] ml-1">{{ formatDate(ins.expiration_date || ins.end_date) }}</span></div>
              <div><span class="text-[#999]">납입주기</span> <span class="text-[#333] ml-1">{{ ins.payment_cycle || '-' }}</span></div>
            </div>
            <div v-if="ins.coverages && ins.coverages.length > 0" class="mt-3 pt-3 border-t border-[#F0F0F0]">
              <p class="text-[11px] text-[#999] mb-1.5">보장내역 ({{ ins.coverages.length }}건)</p>
              <div v-for="cov in ins.coverages.slice(0, 3)" :key="cov.coverage_id" class="flex justify-between text-[12px] py-0.5">
                <span class="text-[#555] truncate flex-1">{{ cov.coverage_name }}</span>
                <span class="text-[#333] font-medium ml-2">{{ formatCurrency(cov.coverage_amount) }}</span>
              </div>
              <p v-if="ins.coverages.length > 3" class="text-[11px] text-[#BBB] mt-1">외 {{ ins.coverages.length - 3 }}건</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 진료 내역 탭 -->
      <div v-else-if="activeTab === 'medical'">
        <div class="flex items-center justify-between mb-3">
          <!-- 병원/약국 서브탭 -->
          <div class="flex bg-white rounded-[10px] border border-[#E8E8E8] p-0.5">
            <button
              :class="[
                'px-3 py-1.5 rounded-[8px] text-[12px] font-medium transition-colors',
                medicalSubTab === 'hospital' ? 'bg-[#FF7B22] text-white' : 'text-[#888]'
              ]"
              @click="medicalSubTab = 'hospital'"
            >
              병원
            </button>
            <button
              :class="[
                'px-3 py-1.5 rounded-[8px] text-[12px] font-medium transition-colors',
                medicalSubTab === 'pharmacy' ? 'bg-[#FF7B22] text-white' : 'text-[#888]'
              ]"
              @click="medicalSubTab = 'pharmacy'"
            >
              약국
            </button>
          </div>
          <button
            class="px-3 py-1.5 bg-[#FF7B22] text-white text-[12px] font-medium rounded-[8px] active:scale-95 transition-transform"
            @click="startSimpleAuth('medical')"
          >
            진료 조회
          </button>
        </div>
        <div v-if="filteredMedicalRecords.length === 0" class="text-center py-12">
          <p class="text-[14px] text-[#999]">{{ medicalSubTab === 'hospital' ? '조회된 병원 진료 내역이 없습니다' : '조회된 약국 내역이 없습니다' }}</p>
          <p class="text-[12px] text-[#BBB] mt-1">간편인증 후 조회할 수 있습니다</p>
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="rec in filteredMedicalRecords"
            :key="rec.record_id"
            class="bg-white rounded-[14px] border border-[#E8E8E8] p-4"
          >
            <div class="flex items-start justify-between mb-1.5">
              <p class="text-[14px] font-semibold text-[#222]">{{ rec.hospital_name || '병원명 없음' }}</p>
              <span class="text-[12px] text-[#999]">{{ formatDate(rec.treatment_date) }}</span>
            </div>
            <p v-if="rec.diagnosis_name" class="text-[13px] text-[#555]">{{ rec.diagnosis_name }}</p>
            <div class="flex gap-4 mt-2 text-[12px]">
              <span v-if="rec.department" class="text-[#999]">{{ rec.department }}</span>
              <span v-if="rec.total_amount" class="text-[#333]">{{ formatCurrency(rec.total_amount) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 건강검진 탭 -->
      <div v-else-if="activeTab === 'checkup'">
        <div class="flex justify-end mb-3">
          <button
            class="px-3 py-1.5 bg-[#FF7B22] text-white text-[12px] font-medium rounded-[8px] active:scale-95 transition-transform"
            @click="startSimpleAuth('checkup')"
          >
            검진 조회
          </button>
        </div>
        <div v-if="store.checkups.length === 0" class="text-center py-12">
          <p class="text-[14px] text-[#999]">조회된 검진 결과가 없습니다</p>
          <p class="text-[12px] text-[#BBB] mt-1">간편인증 후 조회할 수 있습니다</p>
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="chk in store.checkups"
            :key="chk.checkup_id"
            class="bg-white rounded-[14px] border border-[#E8E8E8] p-4"
          >
            <div class="flex items-start justify-between mb-2">
              <p class="text-[14px] font-semibold text-[#222]">{{ formatDate(chk.checkup_date) }} 검진</p>
              <span
                :class="chk.judgment_result === '정상' ? 'bg-green-50 text-green-600' : chk.judgment_result ? 'bg-yellow-50 text-yellow-700' : 'bg-gray-100 text-[#999]'"
                class="px-2 py-0.5 rounded-full text-[11px] font-medium"
              >{{ chk.judgment_result || '-' }}</span>
            </div>
            <p v-if="chk.checkup_place" class="text-[12px] text-[#999] mb-2">{{ chk.checkup_place }}</p>
            <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-[12px]">
              <div v-if="chk.height"><span class="text-[#999]">키</span> <span class="text-[#333] ml-1">{{ chk.height }}cm</span></div>
              <div v-if="chk.weight"><span class="text-[#999]">체중</span> <span class="text-[#333] ml-1">{{ chk.weight }}kg</span></div>
              <div v-if="chk.bmi"><span class="text-[#999]">BMI</span> <span class="text-[#333] ml-1">{{ chk.bmi }}</span></div>
              <div v-if="chk.blood_pressure_high"><span class="text-[#999]">혈압</span> <span class="text-[#333] ml-1">{{ chk.blood_pressure_high }}/{{ chk.blood_pressure_low }}</span></div>
              <div v-if="chk.fasting_blood_sugar"><span class="text-[#999]">공복혈당</span> <span class="text-[#333] ml-1">{{ chk.fasting_blood_sugar }}</span></div>
              <div v-if="chk.total_cholesterol"><span class="text-[#999]">콜레스테롤</span> <span class="text-[#333] ml-1">{{ chk.total_cholesterol }}</span></div>
            </div>
            <p v-if="chk.overall_opinion" class="mt-2 pt-2 border-t border-[#F0F0F0] text-[12px] text-[#666]">{{ chk.overall_opinion }}</p>
          </div>
        </div>
      </div>

      <!-- 건강나이 탭 -->
      <div v-else-if="activeTab === 'healthAge'">
        <div class="flex justify-end mb-3">
          <button
            class="px-3 py-1.5 bg-[#FF7B22] text-white text-[12px] font-medium rounded-[8px] active:scale-95 transition-transform"
            @click="startSimpleAuth('healthAge')"
          >
            건강나이 조회
          </button>
        </div>
        <div v-if="!store.healthAge" class="text-center py-12">
          <p class="text-[14px] text-[#999]">조회된 건강나이 정보가 없습니다</p>
          <p class="text-[12px] text-[#BBB] mt-1">간편인증 후 조회할 수 있습니다</p>
        </div>
        <div v-else class="bg-white rounded-[14px] border border-[#E8E8E8] p-5">
          <div class="text-center mb-4">
            <p class="text-[13px] text-[#999] mb-1">건강나이</p>
            <p class="text-[36px] font-bold text-[#FF7B22]">{{ store.healthAge.health_age ?? '-' }}<span class="text-[16px] font-normal text-[#999]">세</span></p>
            <p v-if="store.healthAge.actual_age" class="text-[13px] text-[#999] mt-1">실제 나이 {{ store.healthAge.actual_age }}세</p>
          </div>
          <div v-if="store.healthAge.risk_level" class="text-center">
            <span
              :class="store.healthAge.risk_level === '양호' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-700'"
              class="px-3 py-1 rounded-full text-[13px] font-medium"
            >{{ store.healthAge.risk_level }}</span>
          </div>
          <p class="text-[11px] text-[#BBB] text-center mt-3">{{ formatDate(store.healthAge.created_at) }} 기준</p>
        </div>
      </div>
    </div>

    <!-- 내보험다보여 인증 모달 -->
    <div v-if="showCreditModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="showCreditModal = false">
      <div class="bg-white rounded-[16px] w-[90%] max-w-[360px] p-5">
        <h3 class="text-[16px] font-bold text-[#222] mb-4">내보험다보여 로그인</h3>
        <div class="space-y-3">
          <input
            v-model="creditId"
            type="text"
            placeholder="아이디"
            class="w-full px-4 py-3 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] text-[14px] outline-none focus:border-[#FF7B22]"
          />
          <input
            v-model="creditPw"
            type="password"
            placeholder="비밀번호"
            class="w-full px-4 py-3 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] text-[14px] outline-none focus:border-[#FF7B22]"
          />
        </div>
        <div class="flex gap-2 mt-5">
          <button class="flex-1 py-3 bg-[#F0F0F0] text-[#666] text-[14px] font-medium rounded-[12px]" @click="showCreditModal = false">취소</button>
          <button
            class="flex-1 py-3 bg-[#FF7B22] text-white text-[14px] font-medium rounded-[12px] disabled:opacity-50"
            :disabled="!creditId || !creditPw || fetchLoading"
            @click="doFetchInsurance"
          >
            {{ fetchLoading ? '조회 중...' : '조회' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 간편인증 모달 -->
    <div v-if="showAuthModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="showAuthModal = false">
      <div class="bg-white rounded-[16px] w-[90%] max-w-[360px] p-5">
        <h3 class="text-[16px] font-bold text-[#222] mb-4">간편인증 ({{ authTargetLabel }})</h3>

        <!-- 2-Way 대기 상태 -->
        <div v-if="twoWayPending">
          <p class="text-[14px] text-[#555] text-center py-6">
            고객 휴대폰에서<br/>간편인증을 완료해주세요
          </p>
          <p class="text-[12px] text-[#999] text-center mb-4">카카오톡 또는 PASS 앱 확인</p>
          <div class="flex gap-2">
            <button class="flex-1 py-3 bg-[#F0F0F0] text-[#666] text-[14px] font-medium rounded-[12px]" @click="showAuthModal = false">취소</button>
            <button
              class="flex-1 py-3 bg-[#FF7B22] text-white text-[14px] font-medium rounded-[12px] disabled:opacity-50"
              :disabled="fetchLoading"
              @click="doConfirmAuth"
            >
              {{ fetchLoading ? '확인 중...' : '인증 완료' }}
            </button>
          </div>
        </div>

        <!-- 인증 요청 전 -->
        <div v-else>
          <div class="space-y-3 mb-2">
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
          <p class="text-[11px] text-[#BBB] mb-4">고객 본인의 이름·주민번호·전화번호를 기반으로 인증합니다</p>
          <div class="flex gap-2">
            <button class="flex-1 py-3 bg-[#F0F0F0] text-[#666] text-[14px] font-medium rounded-[12px]" @click="showAuthModal = false">취소</button>
            <button
              class="flex-1 py-3 bg-[#FF7B22] text-white text-[14px] font-medium rounded-[12px] disabled:opacity-50"
              :disabled="!authTelecom || fetchLoading"
              @click="doFetchAuth"
            >
              {{ fetchLoading ? '요청 중...' : '인증 요청' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 2-Way 모달 (내보험다보여 SMS) -->
    <div v-if="showCreditTwoWay" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="showCreditTwoWay = false">
      <div class="bg-white rounded-[16px] w-[90%] max-w-[360px] p-5">
        <h3 class="text-[16px] font-bold text-[#222] mb-4">추가 인증</h3>
        <p class="text-[13px] text-[#666] mb-3">SMS 인증번호를 입력해주세요</p>
        <input
          v-model="creditSmsCode"
          type="text"
          placeholder="인증번호"
          class="w-full px-4 py-3 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] text-[14px] outline-none focus:border-[#FF7B22] mb-4"
        />
        <div class="flex gap-2">
          <button class="flex-1 py-3 bg-[#F0F0F0] text-[#666] text-[14px] font-medium rounded-[12px]" @click="showCreditTwoWay = false">취소</button>
          <button
            class="flex-1 py-3 bg-[#FF7B22] text-white text-[14px] font-medium rounded-[12px] disabled:opacity-50"
            :disabled="!creditSmsCode || fetchLoading"
            @click="doConfirmInsurance"
          >
            {{ fetchLoading ? '확인 중...' : '확인' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import BackHeader from '@user/components/layout/BackHeader.vue'
import AppSelect from '../../components/ui/AppSelect.vue'
import { useCodefStore } from '../../stores/codefStore'
import { useToast } from '../../composables/useToast'
import * as api from '../../services/agentApi'
import type { MedicalRecordFull } from '../../types'

const route = useRoute()
const store = useCodefStore()
const toast = useToast()

const customerId = computed(() => route.params.customerId as string)
const customerName = ref('고객 조회')

const tabs = [
  { key: 'insurance', label: '보험' },
  { key: 'medical', label: '진료' },
  { key: 'checkup', label: '검진' },
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
