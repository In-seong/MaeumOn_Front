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
            class="bg-white rounded-[14px] border border-[#E8E8E8] p-4 active:bg-[#FAFAFA] transition-colors cursor-pointer"
            @click="selectedInsurance = ins"
          >
            <div class="flex items-start gap-2 mb-2">
              <div class="min-w-0 flex-1">
                <p class="text-[14px] font-semibold text-[#222]">{{ ins.product_name || '보험상품' }}</p>
                <p class="text-[12px] text-[#999] mt-0.5">{{ ins.insurance_company?.company_name || '-' }}</p>
              </div>
              <span
                :class="ins.contract_status === '정상' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-[#999]'"
                class="px-2 py-0.5 rounded-full text-[11px] font-medium shrink-0 whitespace-nowrap"
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
            class="bg-white rounded-[14px] border border-[#E8E8E8] p-4 active:bg-[#FAFAFA] transition-colors cursor-pointer"
            @click="selectedMedical = rec"
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
            class="bg-white rounded-[14px] border border-[#E8E8E8] p-4 cursor-pointer active:scale-[0.98] transition-transform"
            @click="selectedCheckup = chk"
          >
            <div class="flex items-start justify-between mb-2">
              <p class="text-[14px] font-semibold text-[#222]">{{ formatDate(chk.checkup_date) }} 검진</p>
              <span
                :class="chk.judgement === '정상' ? 'bg-green-50 text-green-600' : chk.judgement ? 'bg-yellow-50 text-yellow-700' : 'bg-gray-100 text-[#999]'"
                class="px-2 py-0.5 rounded-full text-[11px] font-medium"
              >{{ chk.judgement || '-' }}</span>
            </div>
            <p v-if="chk.hospital_name" class="text-[12px] text-[#999] mb-2">{{ chk.hospital_name }}</p>
            <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-[12px]">
              <div v-if="chk.height"><span class="text-[#999]">키</span> <span class="text-[#333] ml-1">{{ chk.height }}cm</span></div>
              <div v-if="chk.weight"><span class="text-[#999]">체중</span> <span class="text-[#333] ml-1">{{ chk.weight }}kg</span></div>
              <div v-if="chk.bmi"><span class="text-[#999]">BMI</span> <span class="text-[#333] ml-1">{{ chk.bmi }}</span></div>
              <div v-if="chk.blood_pressure"><span class="text-[#999]">혈압</span> <span class="text-[#333] ml-1">{{ chk.blood_pressure }}</span></div>
              <div v-if="chk.fasting_blood_sugar"><span class="text-[#999]">공복혈당</span> <span class="text-[#333] ml-1">{{ chk.fasting_blood_sugar }}</span></div>
              <div v-if="chk.total_cholesterol"><span class="text-[#999]">콜레스테롤</span> <span class="text-[#333] ml-1">{{ chk.total_cholesterol }}</span></div>
            </div>
            <p v-if="chk.opinion" class="mt-2 pt-2 border-t border-[#F0F0F0] text-[12px] text-[#666]">{{ chk.opinion }}</p>
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
        <div v-else class="space-y-3">
          <div class="bg-white rounded-[14px] border border-[#E8E8E8] p-5">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="w-[56px] h-[56px] rounded-full flex items-center justify-center"
                  :class="(store.healthAge.health_age ?? 0) <= (store.healthAge.chronological_age ?? 0) ? 'bg-green-50' : 'bg-orange-50'">
                  <span class="text-[22px] font-bold"
                    :class="(store.healthAge.health_age ?? 0) <= (store.healthAge.chronological_age ?? 0) ? 'text-green-600' : 'text-[#FF7B22]'">
                    {{ store.healthAge.health_age ?? '-' }}
                  </span>
                </div>
                <div>
                  <p class="text-[15px] font-bold text-[#222]">건강나이 {{ store.healthAge.health_age ?? '-' }}세</p>
                  <p class="text-[13px] text-[#999]">당시 나이 {{ store.healthAge.chronological_age ?? '-' }}세</p>
                </div>
              </div>
              <span v-if="store.healthAge.risk_grade_label && store.healthAge.risk_grade_label !== '미평가'"
                :class="{
                  'bg-green-50 text-green-600': store.healthAge.risk_grade_label === '잘하고있어요' || store.healthAge.risk_grade_label === '양호',
                  'bg-yellow-50 text-yellow-700': store.healthAge.risk_grade_label === '주의' || store.healthAge.risk_grade_label === '경계',
                  'bg-red-50 text-red-600': store.healthAge.risk_grade_label === '관리필요',
                }"
                class="px-2 py-0.5 rounded-full text-[11px] font-medium shrink-0"
              >{{ store.healthAge.risk_grade_label }}</span>
            </div>

            <div v-if="(store.healthAge.health_age ?? 0) !== (store.healthAge.chronological_age ?? 0)"
              class="rounded-[10px] p-3 text-[13px] text-center font-medium"
              :class="(store.healthAge.health_age ?? 0) <= (store.healthAge.chronological_age ?? 0) ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'">
              건강검진 당시 나이보다 <strong>{{ Math.abs((store.healthAge.health_age ?? 0) - (store.healthAge.chronological_age ?? 0)) }}세</strong>
              {{ (store.healthAge.health_age ?? 0) <= (store.healthAge.chronological_age ?? 0) ? '젊습니다' : '많습니다' }}
            </div>

            <p class="text-[11px] text-[#BBB] mt-3">{{ formatDate(store.healthAge.checkup_date) }} 건강검진 기준</p>
          </div>

          <div v-if="store.healthAge.detail_list && store.healthAge.detail_list.length > 0"
            class="bg-white rounded-[14px] border border-[#E8E8E8] p-4">
            <p class="text-[14px] font-bold text-[#222] mb-3">위험요인 분석</p>
            <div class="space-y-2">
              <div v-for="(item, idx) in store.healthAge.detail_list" :key="idx"
                class="bg-[#F8F8F8] rounded-[10px] px-3.5 py-3">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-[13px] font-medium text-[#333]">{{ item.resRiskFactor }}</span>
                  <span class="text-[13px] font-semibold text-[#FF7B22]">{{ item.resState }}</span>
                </div>
                <p v-if="item.resType" class="text-[11px] text-[#999]">{{ item.resType }}</p>
                <p v-if="item.resRecommendValue" class="text-[11px] text-[#BBB] mt-0.5">권장: {{ item.resRecommendValue }}</p>
              </div>
            </div>
          </div>
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
          <div class="space-y-3 mb-3">
            <div>
              <label class="text-[12px] text-[#999] mb-1 block">이름</label>
              <input v-model="authUserName" type="text" class="w-full px-3 py-2.5 bg-[#F8F8F8] rounded-[10px] text-[14px] text-[#333] outline-none border border-[#E8E8E8] focus:border-[#FF7B22]" />
            </div>
            <div>
              <label class="text-[12px] text-[#999] mb-1 block">전화번호</label>
              <input v-model="authPhoneNo" type="tel" class="w-full px-3 py-2.5 bg-[#F8F8F8] rounded-[10px] text-[14px] text-[#333] outline-none border border-[#E8E8E8] focus:border-[#FF7B22]" />
            </div>
            <div>
              <label class="text-[12px] text-[#999] mb-1 block">주민등록번호</label>
              <input :value="authIdentity" @input="onIdentityInput" type="text" maxlength="14" class="w-full px-3 py-2.5 bg-[#F8F8F8] rounded-[10px] text-[14px] text-[#333] outline-none border border-[#E8E8E8] focus:border-[#FF7B22]" placeholder="000000-0000000" />
            </div>
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

    <!-- 진료 상세 모달 -->
    <Transition name="sheet">
    <div v-if="selectedMedical" class="fixed inset-0 z-50 flex items-end justify-center" @click.self="selectedMedical = null">
      <div class="fixed inset-0 bg-black/40" @click="selectedMedical = null" />
      <div class="relative bg-white rounded-t-[20px] w-full max-h-[85vh] flex flex-col">
        <div class="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[#F0F0F0] shrink-0">
          <h3 class="text-[16px] font-bold text-[#222]">진료 상세</h3>
          <button class="text-[#999] p-1" @click="selectedMedical = null">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke-width="2" stroke-linecap="round" /></svg>
          </button>
        </div>
        <div class="overflow-y-auto px-5 py-4 space-y-4">
          <div>
            <div class="flex items-start justify-between mb-3">
              <div>
                <p class="text-[15px] font-semibold text-[#222]">{{ selectedMedical.hospital_name || '병원명 없음' }}</p>
                <p v-if="selectedMedical.department" class="text-[13px] text-[#999] mt-0.5">{{ selectedMedical.department }}</p>
              </div>
              <span class="text-[13px] text-[#999]">{{ formatDate(selectedMedical.treatment_date) }}</span>
            </div>
            <div class="bg-[#F8F8F8] rounded-[12px] p-3.5 space-y-2 text-[13px]">
              <div v-if="selectedMedical.treatment_type" class="flex justify-between"><span class="text-[#999]">진료유형</span><span class="text-[#333]">{{ selectedMedical.treatment_type }}</span></div>
              <div v-if="selectedMedical.diagnosis_name" class="flex justify-between"><span class="text-[#999]">진단명</span><span class="text-[#333]">{{ selectedMedical.diagnosis_name }}</span></div>
              <div v-if="selectedMedical.diagnosis_code" class="flex justify-between"><span class="text-[#999]">질병코드</span><span class="text-[#333]">{{ selectedMedical.diagnosis_code }}</span></div>
              <div v-if="selectedMedical.visit_days" class="flex justify-between"><span class="text-[#999]">내원일수</span><span class="text-[#333]">{{ selectedMedical.visit_days }}일</span></div>
              <div v-if="selectedMedical.total_amount" class="flex justify-between"><span class="text-[#999]">총진료비</span><span class="text-[#333] font-medium">{{ formatCurrency(selectedMedical.total_amount) }}</span></div>
              <div v-if="selectedMedical.public_charge" class="flex justify-between"><span class="text-[#999]">공단부담</span><span class="text-[#333]">{{ formatCurrency(selectedMedical.public_charge) }}</span></div>
              <div v-if="selectedMedical.deductible_amt" class="flex justify-between"><span class="text-[#999]">본인부담</span><span class="text-[#333] font-medium">{{ formatCurrency(selectedMedical.deductible_amt) }}</span></div>
            </div>
          </div>

          <div v-if="parsedDetailTreatList.length > 0">
            <p class="text-[13px] font-semibold text-[#222] mb-2">세부진료내역 ({{ parsedDetailTreatList.length }}건)</p>
            <div class="space-y-1.5">
              <div v-for="(item, idx) in parsedDetailTreatList" :key="idx" class="bg-[#F8F8F8] rounded-[10px] px-3.5 py-2.5">
                <p class="text-[13px] text-[#333]">{{ item.resCodeName || item.resTreatType || '-' }}</p>
                <div class="flex gap-3 mt-0.5 text-[11px] text-[#999]">
                  <span v-if="item.resTreatType && item.resCodeName">{{ item.resTreatType }}</span>
                  <span v-if="item.resOneDose">{{ item.resOneDose }}회</span>
                  <span v-if="item.resTotalDosingdays">{{ item.resTotalDosingdays }}일</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="parsedPrescribeDrugList.length > 0">
            <p class="text-[13px] font-semibold text-[#222] mb-2">처방약 ({{ parsedPrescribeDrugList.length }}건)</p>
            <div class="space-y-1.5">
              <div v-for="(drug, idx) in parsedPrescribeDrugList" :key="idx" class="bg-[#F8F8F8] rounded-[10px] px-3.5 py-2.5">
                <p class="text-[13px] text-[#333]">{{ drug.resDrugName || '-' }}</p>
                <div class="flex gap-3 mt-0.5 text-[11px] text-[#999]">
                  <span v-if="drug.resIngredients">{{ drug.resIngredients }}</span>
                </div>
                <div class="flex gap-3 mt-0.5 text-[11px] text-[#999]">
                  <span v-if="drug.resOneDose">1회 {{ drug.resOneDose }}</span>
                  <span v-if="drug.resDailyDosesNumber">1일 {{ drug.resDailyDosesNumber }}회</span>
                  <span v-if="drug.resTotalDosingdays">{{ drug.resTotalDosingdays }}일분</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="parsedDetailTreatList.length === 0 && parsedPrescribeDrugList.length === 0" class="text-center py-4">
            <p class="text-[13px] text-[#999]">세부내역이 없습니다</p>
          </div>
        </div>
      </div>
    </div>
    </Transition>

    <!-- 검진 상세 모달 -->
    <Transition name="sheet">
    <div v-if="selectedCheckup" class="fixed inset-0 z-50 flex items-end justify-center" @click.self="selectedCheckup = null">
      <div class="fixed inset-0 bg-black/40" @click="selectedCheckup = null" />
      <div class="relative bg-white rounded-t-[20px] w-full max-h-[85vh] flex flex-col">
        <div class="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[#F0F0F0] shrink-0">
          <h3 class="text-[16px] font-bold text-[#222]">검진 상세</h3>
          <button class="text-[#999] p-1" @click="selectedCheckup = null">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke-width="2" stroke-linecap="round" /></svg>
          </button>
        </div>
        <div class="overflow-y-auto px-5 py-4 space-y-4">
          <div>
            <div class="flex items-start justify-between mb-3">
              <div>
                <p class="text-[15px] font-semibold text-[#222]">{{ formatDate(selectedCheckup.checkup_date) }} 검진</p>
                <p v-if="selectedCheckup.checkup_type" class="text-[13px] text-[#999] mt-0.5">{{ selectedCheckup.checkup_type }}</p>
              </div>
              <span
                :class="selectedCheckup.judgement === '정상' ? 'bg-green-50 text-green-600' : selectedCheckup.judgement ? 'bg-yellow-50 text-yellow-700' : 'bg-gray-100 text-[#999]'"
                class="px-2 py-0.5 rounded-full text-[11px] font-medium"
              >{{ selectedCheckup.judgement || '-' }}</span>
            </div>
            <p v-if="selectedCheckup.hospital_name" class="text-[12px] text-[#999] mb-3">{{ selectedCheckup.hospital_name }}</p>
          </div>

          <div>
            <p class="text-[13px] font-semibold text-[#222] mb-2">신체계측</p>
            <div class="bg-[#F8F8F8] rounded-[12px] p-3.5 space-y-2 text-[13px]">
              <div v-if="selectedCheckup.height" class="flex justify-between"><span class="text-[#999]">키</span><span class="text-[#333]">{{ selectedCheckup.height }}cm</span></div>
              <div v-if="selectedCheckup.weight" class="flex justify-between"><span class="text-[#999]">체중</span><span class="text-[#333]">{{ selectedCheckup.weight }}kg</span></div>
              <div v-if="selectedCheckup.waist" class="flex justify-between"><span class="text-[#999]">허리둘레</span><span class="text-[#333]">{{ selectedCheckup.waist }}cm</span></div>
              <div v-if="selectedCheckup.bmi" class="flex justify-between"><span class="text-[#999]">BMI</span><span class="text-[#333]">{{ selectedCheckup.bmi }}</span></div>
            </div>
          </div>

          <div>
            <p class="text-[13px] font-semibold text-[#222] mb-2">혈액·혈압</p>
            <div class="bg-[#F8F8F8] rounded-[12px] p-3.5 space-y-2 text-[13px]">
              <div v-if="selectedCheckup.blood_pressure" class="flex justify-between"><span class="text-[#999]">혈압</span><span class="text-[#333]">{{ selectedCheckup.blood_pressure }}</span></div>
              <div v-if="selectedCheckup.hemoglobin" class="flex justify-between"><span class="text-[#999]">혈색소</span><span class="text-[#333]">{{ selectedCheckup.hemoglobin }} g/dL</span></div>
              <div v-if="selectedCheckup.fasting_blood_sugar" class="flex justify-between"><span class="text-[#999]">공복혈당</span><span class="text-[#333]">{{ selectedCheckup.fasting_blood_sugar }} mg/dL</span></div>
            </div>
          </div>

          <div>
            <p class="text-[13px] font-semibold text-[#222] mb-2">지질검사</p>
            <div class="bg-[#F8F8F8] rounded-[12px] p-3.5 space-y-2 text-[13px]">
              <div v-if="selectedCheckup.total_cholesterol" class="flex justify-between"><span class="text-[#999]">총콜레스테롤</span><span class="text-[#333]">{{ selectedCheckup.total_cholesterol }}</span></div>
              <div v-if="selectedCheckup.hdl_cholesterol" class="flex justify-between"><span class="text-[#999]">HDL</span><span class="text-[#333]">{{ selectedCheckup.hdl_cholesterol }}</span></div>
              <div v-if="selectedCheckup.ldl_cholesterol" class="flex justify-between"><span class="text-[#999]">LDL</span><span class="text-[#333]">{{ selectedCheckup.ldl_cholesterol }}</span></div>
              <div v-if="selectedCheckup.triglyceride" class="flex justify-between"><span class="text-[#999]">중성지방</span><span class="text-[#333]">{{ selectedCheckup.triglyceride }}</span></div>
            </div>
          </div>

          <div>
            <p class="text-[13px] font-semibold text-[#222] mb-2">간·신장 기능</p>
            <div class="bg-[#F8F8F8] rounded-[12px] p-3.5 space-y-2 text-[13px]">
              <div v-if="selectedCheckup.ast" class="flex justify-between"><span class="text-[#999]">AST (SGOT)</span><span class="text-[#333]">{{ selectedCheckup.ast }}</span></div>
              <div v-if="selectedCheckup.alt" class="flex justify-between"><span class="text-[#999]">ALT (SGPT)</span><span class="text-[#333]">{{ selectedCheckup.alt }}</span></div>
              <div v-if="selectedCheckup.y_gtp" class="flex justify-between"><span class="text-[#999]">γ-GTP</span><span class="text-[#333]">{{ selectedCheckup.y_gtp }}</span></div>
              <div v-if="selectedCheckup.serum_creatinine" class="flex justify-between"><span class="text-[#999]">혈청크레아티닌</span><span class="text-[#333]">{{ selectedCheckup.serum_creatinine }}</span></div>
              <div v-if="selectedCheckup.gfr" class="flex justify-between"><span class="text-[#999]">신사구체여과율 (GFR)</span><span class="text-[#333]">{{ selectedCheckup.gfr }}</span></div>
            </div>
          </div>

          <div v-if="selectedCheckup.opinion">
            <p class="text-[13px] font-semibold text-[#222] mb-2">종합소견</p>
            <div class="bg-[#F8F8F8] rounded-[12px] p-3.5 text-[13px] text-[#333] leading-relaxed whitespace-pre-line">{{ selectedCheckup.opinion }}</div>
          </div>
        </div>
      </div>
    </div>
    </Transition>

    <!-- 보험 상세 모달 -->
    <Transition name="sheet">
    <div v-if="selectedInsurance" class="fixed inset-0 z-50 flex items-end justify-center" @click.self="selectedInsurance = null">
      <div class="fixed inset-0 bg-black/40" @click="selectedInsurance = null" />
      <div class="relative bg-white rounded-t-[20px] w-full max-h-[85vh] flex flex-col">
        <div class="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[#F0F0F0] shrink-0">
          <h3 class="text-[16px] font-bold text-[#222]">보험 상세</h3>
          <button class="text-[#999] p-1" @click="selectedInsurance = null">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke-width="2" stroke-linecap="round" /></svg>
          </button>
        </div>
        <div class="overflow-y-auto px-5 py-4 space-y-4">
          <!-- 기본 정보 -->
          <div>
            <div class="flex items-start justify-between mb-3">
              <div>
                <p class="text-[15px] font-semibold text-[#222]">{{ selectedInsurance.product_name || '보험상품' }}</p>
                <p class="text-[13px] text-[#999] mt-0.5">{{ selectedInsurance.insurance_company?.company_name || '-' }}</p>
              </div>
              <span
                :class="selectedInsurance.contract_status === '정상' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-[#999]'"
                class="px-2 py-0.5 rounded-full text-[11px] font-medium"
              >{{ selectedInsurance.contract_status || '-' }}</span>
            </div>
            <div class="bg-[#F8F8F8] rounded-[12px] p-3.5 space-y-2 text-[13px]">
              <div class="flex justify-between"><span class="text-[#999]">보험유형</span><span class="text-[#333]">{{ selectedInsurance.insurance_type || '-' }}</span></div>
              <div class="flex justify-between"><span class="text-[#999]">증권번호</span><span class="text-[#333]">{{ selectedInsurance.policy_number || '-' }}</span></div>
              <div class="flex justify-between"><span class="text-[#999]">계약자</span><span class="text-[#333]">{{ selectedInsurance.contractor_name || '-' }}</span></div>
              <div class="flex justify-between"><span class="text-[#999]">피보험자</span><span class="text-[#333]">{{ selectedInsurance.insured_person || '-' }}</span></div>
              <div class="flex justify-between"><span class="text-[#999]">보험료</span><span class="text-[#333] font-medium">{{ formatCurrency(selectedInsurance.premium_amount) }}</span></div>
              <div class="flex justify-between"><span class="text-[#999]">납입주기</span><span class="text-[#333]">{{ selectedInsurance.payment_cycle || '-' }}</span></div>
              <div class="flex justify-between"><span class="text-[#999]">계약일</span><span class="text-[#333]">{{ formatDate(selectedInsurance.subscription_date) }}</span></div>
              <div class="flex justify-between"><span class="text-[#999]">만기일</span><span class="text-[#333]">{{ formatDate(selectedInsurance.expiration_date || selectedInsurance.end_date) }}</span></div>
              <div v-if="selectedInsurance.car_name" class="flex justify-between"><span class="text-[#999]">차량</span><span class="text-[#333]">{{ selectedInsurance.car_name }}</span></div>
              <div v-if="selectedInsurance.car_number" class="flex justify-between"><span class="text-[#999]">차량번호</span><span class="text-[#333]">{{ selectedInsurance.car_number }}</span></div>
              <div v-if="selectedInsurance.company_phone" class="flex justify-between"><span class="text-[#999]">고객센터</span><span class="text-[#333]">{{ selectedInsurance.company_phone }}</span></div>
              <div v-if="selectedInsurance.company_homepage" class="flex justify-between"><span class="text-[#999]">홈페이지</span><span class="text-[#333]">{{ selectedInsurance.company_homepage }}</span></div>
            </div>
          </div>

          <!-- 보장내역 -->
          <div v-if="selectedInsurance.coverages && selectedInsurance.coverages.length > 0">
            <p class="text-[13px] font-semibold text-[#222] mb-2">보장내역 ({{ selectedInsurance.coverages.length }}건)</p>
            <div class="space-y-1.5">
              <div
                v-for="cov in selectedInsurance.coverages"
                :key="cov.coverage_id"
                class="bg-[#F8F8F8] rounded-[10px] px-3.5 py-2.5"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1 min-w-0 mr-2">
                    <p class="text-[13px] text-[#333]">{{ cov.coverage_name }}</p>
                    <div class="flex gap-2 mt-0.5 text-[11px] text-[#999]">
                      <span v-if="cov.insured_person">{{ cov.insured_person }}</span>
                      <span v-if="cov.coverage_type">{{ cov.coverage_type }}</span>
                    </div>
                  </div>
                  <div class="text-right shrink-0">
                    <p class="text-[13px] font-medium text-[#333]">{{ formatCurrency(cov.coverage_amount) }}</p>
                    <span
                      v-if="cov.coverage_status"
                      :class="cov.coverage_status === '정상' ? 'text-green-600' : 'text-[#999]'"
                      class="text-[11px]"
                    >{{ cov.coverage_status }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </Transition>
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
import type { MedicalRecordFull, HealthCheckupRecord } from '../../types'
import type { InsuranceContract } from '@shared/types'

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

const selectedInsurance = ref<InsuranceContract | null>(null)
const showCreditModal = ref(false)
const creditId = ref('')
const creditPw = ref('')
const showCreditTwoWay = ref(false)
const creditSmsCode = ref('')

const showAuthModal = ref(false)
const authTarget = ref<'medical' | 'checkup' | 'healthAge'>('medical')
const authTelecom = ref('')
const authLevel = ref('1')
const authUserName = ref('')
const authPhoneNo = ref('')
const authIdentity = ref('')

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
const selectedMedical = ref<MedicalRecordFull | null>(null)
const selectedCheckup = ref<HealthCheckupRecord | null>(null)
const twoWayPending = ref(false)

const fetchLoading = ref(false)

const filteredMedicalRecords = computed(() => {
  const isPharmacy = (rec: MedicalRecordFull) =>
    rec.hospital_name?.includes('약국') || rec.treatment_type === '약국'
  if (medicalSubTab.value === 'pharmacy') return store.medicalRecords.filter(isPharmacy)
  return store.medicalRecords.filter(r => !isPharmacy(r))
})

function formatIdentity(val: string): string {
  const digits = val.replace(/\D/g, '').slice(0, 13)
  if (digits.length > 6) return digits.slice(0, 6) + '-' + digits.slice(6)
  return digits
}

function onIdentityInput(e: Event) {
  const input = e.target as HTMLInputElement
  authIdentity.value = formatIdentity(input.value)
  input.value = authIdentity.value
}

function safeParseJson(json?: string): any[] {
  if (!json) return []
  try { return JSON.parse(json) } catch { return [] }
}

const parsedDetailTreatList = computed(() => safeParseJson(selectedMedical.value?.detail_treat_list_json))
const parsedPrescribeDrugList = computed(() => safeParseJson(selectedMedical.value?.prescribe_drug_list_json))

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

async function startSimpleAuth(target: 'medical' | 'checkup' | 'healthAge') {
  authTarget.value = target
  twoWayPending.value = false
  try {
    const res = await api.fetchCustomer(customerId.value)
    const c = res.data.data
    authUserName.value = c.name || ''
    authPhoneNo.value = c.phone || ''
    authIdentity.value = formatIdentity(c.resident_number_masked || '')
    authTelecom.value = c.telecom || ''
    if (c.resident_number_masked) {
      const unmasked = await api.unmaskResidentNumber(customerId.value)
      authIdentity.value = formatIdentity(unmasked.data.data.resident_number || '')
    }
  } catch { /* 실패해도 모달은 열림 */ }
  showAuthModal.value = true
}

async function doFetchAuth() {
  fetchLoading.value = true
  try {
    const fetchFn = authTarget.value === 'medical' ? api.fetchMedical
      : authTarget.value === 'checkup' ? api.fetchCheckup
      : api.fetchHealthAgeApi
    const res = await fetchFn(customerId.value, {
      loginTypeLevel: authLevel.value,
      telecom: authTelecom.value,
      userName: authUserName.value || undefined,
      phoneNo: authPhoneNo.value || undefined,
      identity: authIdentity.value ? authIdentity.value.replace(/-/g, '') : undefined,
    } as any)
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

<style scoped>
.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.4s ease;
}
.sheet-enter-active > div:last-child,
.sheet-leave-active > div:last-child {
  transition: transform 0.45s cubic-bezier(0.32, 0.72, 0, 1);
}
.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}
.sheet-enter-from > div:last-child {
  transform: translateY(100%);
}
.sheet-leave-to > div:last-child {
  transform: translateY(100%);
}
</style>
