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
              class="hover:bg-[#FAFAFA] transition-colors cursor-pointer"
              @click="selectedInsurance = ins"
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

      <!-- 고지의무 분류 -->
      <div v-if="store.disclosureCheck?.disclosure_classification" class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] p-6 mb-5">
        <div class="flex items-center gap-3 mb-4">
          <span class="w-7 h-7 rounded-full bg-[#FFF3ED] flex items-center justify-center text-[14px]">&#x26A0;&#xFE0F;</span>
          <div>
            <p class="text-[15px] font-semibold text-[#222]">고지의무 분류</p>
            <p class="text-[12px] text-[#999]">진료 데이터 기반 자동 분류</p>
          </div>
        </div>

        <template v-for="(item, idx) in classificationItems" :key="item.key">
          <p v-if="item.period" class="text-[11px] font-bold text-[#999] uppercase tracking-wider mb-1.5" :class="idx > 0 ? 'mt-3 pt-3 border-t border-[#F0F0F0]' : ''">
            {{ item.period }}
          </p>
          <div @click="item.found ? toggleClassification(item.key) : undefined"
               class="flex items-center gap-3 px-3 py-2.5 rounded-[10px] mb-1 transition-colors"
               :class="item.found ? 'bg-[#FFF8F3] cursor-pointer hover:bg-[#FFEFE0]' : ''">
            <span class="text-[13px] flex-1 font-medium" :class="item.found ? 'text-[#333]' : 'text-[#BBB]'">
              {{ item.label }}
            </span>
            <span class="w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0"
              :class="item.found ? 'bg-[#FF7B22] text-white' : 'bg-[#E8E8E8] text-[#CCC]'">
              {{ item.found ? 'O' : 'X' }}
            </span>
            <template v-if="item.found">
              <span class="text-[12px] text-[#FF7B22] font-medium min-w-[32px] text-right">{{ item.count }}건</span>
              <svg class="w-3.5 h-3.5 text-[#999] shrink-0 transition-transform" :class="expandedClassification === item.key ? 'rotate-90' : ''"
                   viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>
            </template>
          </div>

          <div v-if="expandedClassification === item.key && item.found" class="px-3 pb-2 mt-1">
            <template v-if="item.type === 'simple'">
              <div v-for="rec in getClassificationRecords(item.key)" :key="rec.record_id"
                   class="flex items-center gap-2 py-2 border-b border-[#F5F5F5] last:border-0 text-[12px]">
                <span class="text-[#999] w-[80px] shrink-0">{{ rec.treatment_date }}</span>
                <span class="text-[#333] flex-1 truncate">{{ rec.hospital_name }}</span>
                <span class="text-[#888] truncate max-w-[120px]">{{ rec.diagnosis_name }}</span>
              </div>
            </template>

            <template v-else-if="item.type === 'grouped'">
              <div v-for="group in getClassificationGroups(item.key)" :key="group.diagnosis_code" class="mb-3 last:mb-0">
                <div class="flex items-center gap-2 py-2 bg-[#FFF3ED] rounded-[8px] px-3">
                  <span class="px-2 py-0.5 bg-[#FF7B22] text-white rounded text-[11px] font-medium shrink-0">{{ group.diagnosis_code }}</span>
                  <span class="text-[13px] text-[#333] font-medium flex-1 truncate">{{ group.diagnosis_name }}</span>
                  <span class="text-[13px] text-[#FF7B22] font-bold shrink-0">{{ group.displayValue }}</span>
                </div>
                <div v-for="rec in group.records.slice(0, 5)" :key="rec.record_id"
                     class="flex items-center gap-2 py-1.5 pl-4 text-[11px] text-[#999]">
                  <span class="w-[80px] shrink-0">{{ rec.treatment_date }}</span>
                  <span class="flex-1 truncate">{{ rec.hospital_name }}</span>
                </div>
                <p v-if="group.records.length > 5" class="text-[11px] text-[#BBB] pl-4 py-0.5">
                  외 {{ group.records.length - 5 }}건 더
                </p>
              </div>
            </template>

            <template v-else-if="item.type === 'critical'">
              <div v-for="(recs, dKey) in getCriticalClassificationRecords()" :key="dKey" class="mb-3 last:mb-0">
                <p class="text-[12px] font-semibold text-[#E91E63] py-1.5 px-1">{{ criticalDiseaseLabel(dKey as string) }}</p>
                <div v-for="rec in recs.slice(0, 5)" :key="rec.record_id"
                     class="flex items-center gap-2 py-1.5 pl-4 text-[11px] text-[#999]">
                  <span class="w-[80px] shrink-0">{{ rec.treatment_date }}</span>
                  <span class="flex-1 truncate">{{ rec.hospital_name }}</span>
                  <span class="truncate max-w-[100px]">{{ rec.diagnosis_name }}</span>
                </div>
                <p v-if="recs.length > 5" class="text-[11px] text-[#BBB] pl-4 py-0.5">
                  외 {{ recs.length - 5 }}건 더
                </p>
              </div>
            </template>
          </div>
        </template>
      </div>

      <!-- 알릴의무 체크 테이블 -->
      <div v-if="store.disclosureCheck" class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] p-6 mb-5">
        <div class="flex items-center gap-3 mb-4">
          <span class="text-[20px]">&#x1F4CB;</span>
          <div>
            <p class="text-[15px] font-semibold text-[#222]">입원/수술 보장 기간</p>
            <p class="text-[12px] text-[#999]">보장 기간을 한눈에 확인하세요.</p>
          </div>
          <div class="ml-auto flex items-center gap-1.5 text-[12px] text-[#999]">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="2"/><path d="M12 16v-4M12 8h.01" stroke-width="2" stroke-linecap="round"/></svg>
            <span>기간별 보장 내용을 확인할 수 있습니다.</span>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-[12px] border-collapse">
            <thead>
              <tr>
                <th rowspan="2" class="border border-[#E8E8E8] bg-[#FFF3ED] text-[#FF7B22] px-3 py-2 text-center font-semibold whitespace-nowrap align-middle">
                  3개월<br/>이내<span class="text-red-500">*</span>
                </th>
                <th colspan="11" class="border border-[#E8E8E8] bg-[#FFF3ED] text-[#FF7B22] px-3 py-1.5 text-center font-semibold">
                  N년이내 입원/수술
                </th>
                <th rowspan="2" class="border border-[#E8E8E8] bg-[#FFE4EC] text-[#E91E63] px-3 py-2 text-center font-semibold whitespace-nowrap align-middle">
                  N년이내<br/>중대질환
                </th>
              </tr>
              <tr>
                <th v-for="n in 11" :key="n" class="border border-[#E8E8E8] bg-[#FFF8F3] text-[#999] px-2 py-1.5 text-center font-medium min-w-[32px]">
                  {{ n - 1 }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="border border-[#E8E8E8] px-3 py-2.5 text-center font-bold text-[14px]"
                  :class="store.disclosureCheck.hospital_visit_3months ? 'text-[#FF7B22] bg-[#FFF8F3]' : 'text-[#CCC]'">
                  {{ store.disclosureCheck.hospital_visit_3months ? 'O' : 'X' }}
                </td>
                <td v-for="n in 11" :key="n" class="border border-[#E8E8E8] px-2 py-2.5 text-center text-[13px]"
                  :class="getHospSurgeryTotal(n - 1) > 0 ? 'text-[#333] font-semibold bg-[#FFF8F3]' : 'text-[#CCC]'">
                  {{ getHospSurgeryTotal(n - 1) || '' }}
                </td>
                <td class="border border-[#E8E8E8] px-3 py-2.5 text-center font-bold text-[13px]"
                  :class="criticalDiseaseYearLabel ? 'text-[#E91E63] bg-[#FFF0F3]' : 'text-[#CCC]'">
                  {{ criticalDiseaseYearLabel || 'X' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-[11px] text-red-400 mt-3">* '3개월 이내'는 입원/수술일 기준으로 산정됩니다.</p>
        <p class="text-[11px] text-[#BBB] mt-0.5">※ 상세 보장 내용은 약관을 참고해 주세요.</p>

        <!-- 중대질환 상세 -->
        <div v-if="hasCriticalDisease" class="mt-4 pt-4 border-t border-[#F0F0F0]">
          <p class="text-[13px] font-semibold text-[#E91E63] mb-2">중대질환 해당 항목</p>
          <div class="flex flex-wrap gap-2">
            <span v-for="(info, key) in store.disclosureCheck.critical_diseases" :key="key"
              :class="info.found ? 'bg-red-50 text-red-600 border-red-200' : 'bg-gray-50 text-[#CCC] border-[#E8E8E8]'"
              class="px-3 py-1.5 text-[12px] rounded-full border font-medium">
              {{ criticalDiseaseLabel(key as string) }}
              <template v-if="info.found && info.year !== null">({{ info.year + 1 }}년)</template>
            </span>
          </div>
        </div>
      </div>
      <div v-else-if="store.disclosureCheckLoading" class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] p-8 mb-5 text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7B22] mx-auto" />
        <p class="text-[13px] text-[#999] mt-2">알릴의무 체크 로딩 중...</p>
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
            <tr v-for="rec in filteredMedicalRecords" :key="rec.record_id" class="hover:bg-[#FAFAFA] transition-colors cursor-pointer" @click="selectedMedical = rec">
              <td class="px-5 py-3.5 text-[13px] text-[#999]">{{ formatDate(rec.treatment_date) }}</td>
              <td class="px-5 py-3.5 text-[13px] font-medium text-[#333]">{{ rec.hospital_name || '-' }}</td>
              <td class="px-5 py-3.5 text-[13px] text-[#666]">{{ rec.department || '-' }}</td>
              <td class="px-5 py-3.5 text-[13px] text-[#666]">
                <div class="flex items-center gap-1.5">
                  <span>{{ rec.diagnosis_name || '-' }}</span>
                  <span v-if="hasSurgery(rec)" class="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 bg-red-50 text-red-500 border border-red-200 rounded">수술</span>
                </div>
              </td>
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
          class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] p-6 cursor-pointer hover:shadow-[0_0_15px_rgba(0,0,0,0.1)] transition-shadow"
          @click="selectedCheckup = chk"
        >
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-[15px] font-semibold text-[#333]">{{ formatDate(chk.checkup_date) }} 검진</h3>
              <p v-if="chk.hospital_name" class="text-[13px] text-[#999] mt-0.5">{{ chk.hospital_name }}</p>
            </div>
            <span
              :class="chk.judgement === '정상' ? 'bg-green-50 text-green-600' : chk.judgement ? 'bg-yellow-50 text-yellow-700' : 'bg-gray-100 text-[#999]'"
              class="px-3 py-1 rounded-full text-[12px] font-medium"
            >{{ chk.judgement || '결과 없음' }}</span>
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
            <div v-if="chk.blood_pressure" class="bg-[#F8F8F8] rounded-[10px] p-3 text-center">
              <p class="text-[11px] text-[#999] mb-1">혈압</p>
              <p class="text-[15px] font-semibold text-[#333]">{{ chk.blood_pressure }}</p>
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
          <p v-if="chk.opinion" class="mt-4 pt-3 border-t border-[#F0F0F0] text-[13px] text-[#666]">{{ chk.opinion }}</p>
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
      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-[800px]">
        <div class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] p-6">
          <div class="flex items-center gap-4 mb-5">
            <div class="w-[72px] h-[72px] rounded-full flex items-center justify-center"
              :class="(store.healthAge.health_age ?? 0) <= (store.healthAge.chronological_age ?? 0) ? 'bg-green-50' : 'bg-orange-50'">
              <span class="text-[28px] font-bold"
                :class="(store.healthAge.health_age ?? 0) <= (store.healthAge.chronological_age ?? 0) ? 'text-green-600' : 'text-[#FF7B22]'">
                {{ store.healthAge.health_age ?? '-' }}
              </span>
            </div>
            <div>
              <p class="text-[18px] font-bold text-[#222]">건강나이 {{ store.healthAge.health_age ?? '-' }}세</p>
              <p class="text-[14px] text-[#999] mt-0.5">당시 나이 {{ store.healthAge.chronological_age ?? '-' }}세</p>
            </div>
          </div>

          <div v-if="(store.healthAge.health_age ?? 0) !== (store.healthAge.chronological_age ?? 0)"
            class="rounded-[12px] p-4 text-[14px] text-center font-medium mb-4"
            :class="(store.healthAge.health_age ?? 0) <= (store.healthAge.chronological_age ?? 0) ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'">
            건강검진 당시 나이보다 <strong>{{ Math.abs((store.healthAge.health_age ?? 0) - (store.healthAge.chronological_age ?? 0)) }}세</strong>
            {{ (store.healthAge.health_age ?? 0) <= (store.healthAge.chronological_age ?? 0) ? '젊습니다' : '많습니다' }}
          </div>

          <div class="flex items-center justify-between mb-3">
            <span v-if="store.healthAge.risk_grade_label && store.healthAge.risk_grade_label !== '미평가'"
              :class="{
                'bg-green-50 text-green-600': store.healthAge.risk_grade_label === '잘하고있어요' || store.healthAge.risk_grade_label === '양호',
                'bg-yellow-50 text-yellow-700': store.healthAge.risk_grade_label === '주의' || store.healthAge.risk_grade_label === '경계',
                'bg-red-50 text-red-600': store.healthAge.risk_grade_label === '관리필요',
              }"
              class="px-3 py-1 rounded-full text-[12px] font-medium"
            >{{ store.healthAge.risk_grade_label }}</span>
            <span class="text-[12px] text-[#BBB]">{{ formatDate(store.healthAge.checkup_date) }} 건강검진 기준</span>
          </div>
        </div>

        <div v-if="store.healthAge.detail_list && store.healthAge.detail_list.length > 0"
          class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] p-6">
          <p class="text-[15px] font-bold text-[#222] mb-4">위험요인 분석</p>
          <div class="space-y-3">
            <div v-for="(item, idx) in store.healthAge.detail_list" :key="idx"
              class="bg-[#F8F8F8] rounded-[12px] px-4 py-3">
              <div class="flex items-center justify-between mb-1">
                <span class="text-[14px] font-medium text-[#333]">{{ item.resRiskFactor }}</span>
                <span class="text-[14px] font-semibold text-[#FF7B22]">{{ item.resState }}</span>
              </div>
              <p v-if="item.resType" class="text-[12px] text-[#999]">{{ item.resType }}</p>
              <p v-if="item.resRecommendValue" class="text-[12px] text-[#BBB] mt-0.5">권장: {{ item.resRecommendValue }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 내보험다보여 인증 모달 -->
    <div v-if="showCreditModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="showCreditModal = false">
      <div class="bg-white rounded-[16px] w-[420px] p-6">
        <h3 class="text-[17px] font-bold text-[#222] mb-5">내보험다보여 로그인</h3>
        <div class="space-y-3">
          <input v-model="creditId" type="text" placeholder="아이디" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" class="w-full px-4 py-3 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] text-[14px] outline-none focus:border-[#FF7B22]" @input="creditError = ''" />
          <div class="relative">
            <input v-model="creditPw" :type="creditPwVisible ? 'text' : 'password'" placeholder="비밀번호" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" class="w-full px-4 py-3 pr-11 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] text-[14px] outline-none focus:border-[#FF7B22]" @input="creditError = ''" />
            <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#999] hover:text-[#666]" @click="creditPwVisible = !creditPwVisible">
              <svg v-if="creditPwVisible" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" stroke-width="1.5"/><circle cx="12" cy="12" r="3" stroke-width="1.5"/></svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><line x1="1" y1="1" x2="23" y2="23" stroke-width="1.5" stroke-linecap="round"/></svg>
            </button>
          </div>
        </div>
        <p v-if="creditError" class="text-[13px] text-red-500 mt-2 px-1">{{ creditError }}</p>
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
          <p v-if="authError" class="text-[13px] text-red-500 text-center mb-3 px-1">{{ authError }}</p>
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
              <label class="text-[12px] text-[#999] mb-1 block">이름</label>
              <input v-model="authUserName" type="text" class="w-full px-4 py-3 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] text-[14px] text-[#333] outline-none focus:border-[#FF7B22]" />
            </div>
            <div>
              <label class="text-[12px] text-[#999] mb-1 block">전화번호</label>
              <input v-model="authPhoneNo" type="tel" class="w-full px-4 py-3 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] text-[14px] text-[#333] outline-none focus:border-[#FF7B22]" />
            </div>
            <div>
              <label class="text-[12px] text-[#999] mb-1 block">주민등록번호</label>
              <input :value="authIdentity" @input="onIdentityInput" type="text" maxlength="14" class="w-full px-4 py-3 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] text-[14px] text-[#333] outline-none focus:border-[#FF7B22]" placeholder="000000-0000000" />
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
          <p v-if="authError" class="text-[13px] text-red-500 mt-2 px-1">{{ authError }}</p>
          <div class="flex gap-3 mt-3">
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

    <!-- 진료 상세 모달 -->
    <div v-if="selectedMedical" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="selectedMedical = null">
      <div class="bg-white rounded-[16px] w-full max-w-[640px] max-h-[80vh] flex flex-col shadow-xl">
        <div class="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#F0F0F0] shrink-0">
          <h3 class="text-[17px] font-bold text-[#222]">진료 상세</h3>
          <button class="text-[#999] p-1 hover:text-[#666]" @click="selectedMedical = null">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke-width="2" stroke-linecap="round" /></svg>
          </button>
        </div>
        <div class="overflow-y-auto px-6 py-5 space-y-5">
          <div>
            <div class="flex items-start justify-between mb-4">
              <div>
                <p class="text-[16px] font-semibold text-[#222]">{{ selectedMedical.hospital_name || '병원명 없음' }}</p>
                <p v-if="selectedMedical.department" class="text-[13px] text-[#999] mt-0.5">{{ selectedMedical.department }}</p>
              </div>
              <span class="text-[13px] text-[#999]">{{ formatDate(selectedMedical.treatment_date) }}</span>
            </div>
            <div class="grid grid-cols-2 gap-x-8 gap-y-2 text-[13px]">
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
            <div class="flex items-center gap-2 mb-3">
              <p class="text-[14px] font-semibold text-[#222]">세부진료내역 ({{ parsedDetailTreatList.length }}건)</p>
              <span v-if="selectedHasSurgery" class="text-[13px] font-semibold text-red-500">수술 예상</span>
            </div>
            <table class="min-w-full divide-y divide-[#E8E8E8]">
              <thead class="bg-[#FAFAFA]">
                <tr>
                  <th class="px-4 py-2.5 text-left text-[12px] font-medium text-[#999]">항목분류</th>
                  <th class="px-4 py-2.5 text-left text-[12px] font-medium text-[#999]">항목명</th>
                  <th class="px-4 py-2.5 text-right text-[12px] font-medium text-[#999]">횟수</th>
                  <th class="px-4 py-2.5 text-right text-[12px] font-medium text-[#999]">일수</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#F0F0F0]">
                <tr v-for="(item, idx) in parsedDetailTreatList" :key="idx" :class="item.resTreatType?.includes('수술') ? 'bg-red-50' : ''">
                  <td class="px-4 py-2.5 text-[12px]" :class="item.resTreatType?.includes('수술') ? 'text-red-500 font-medium' : 'text-[#999]'">{{ item.resTreatType || '-' }}</td>
                  <td class="px-4 py-2.5 text-[12px]" :class="item.resTreatType?.includes('수술') ? 'text-red-600 font-medium' : 'text-[#333]'">{{ item.resCodeName || '-' }}</td>
                  <td class="px-4 py-2.5 text-[12px] text-[#666] text-right">{{ item.resOneDose || '-' }}</td>
                  <td class="px-4 py-2.5 text-[12px] text-[#666] text-right">{{ item.resTotalDosingdays || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="parsedPrescribeDrugList.length > 0">
            <p class="text-[14px] font-semibold text-[#222] mb-3">처방약 ({{ parsedPrescribeDrugList.length }}건)</p>
            <table class="min-w-full divide-y divide-[#E8E8E8]">
              <thead class="bg-[#FAFAFA]">
                <tr>
                  <th class="px-4 py-2.5 text-left text-[12px] font-medium text-[#999]">약품명</th>
                  <th class="px-4 py-2.5 text-left text-[12px] font-medium text-[#999]">성분</th>
                  <th class="px-4 py-2.5 text-right text-[12px] font-medium text-[#999]">1회용량</th>
                  <th class="px-4 py-2.5 text-right text-[12px] font-medium text-[#999]">1일횟수</th>
                  <th class="px-4 py-2.5 text-right text-[12px] font-medium text-[#999]">투약일수</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#F0F0F0]">
                <tr v-for="(drug, idx) in parsedPrescribeDrugList" :key="idx">
                  <td class="px-4 py-2.5 text-[12px] text-[#333]">{{ drug.resDrugName || '-' }}</td>
                  <td class="px-4 py-2.5 text-[12px] text-[#999]">{{ drug.resIngredients || '-' }}</td>
                  <td class="px-4 py-2.5 text-[12px] text-[#666] text-right">{{ drug.resOneDose || '-' }}</td>
                  <td class="px-4 py-2.5 text-[12px] text-[#666] text-right">{{ drug.resDailyDosesNumber || '-' }}</td>
                  <td class="px-4 py-2.5 text-[12px] text-[#666] text-right">{{ drug.resTotalDosingdays || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="parsedDetailTreatList.length === 0 && parsedPrescribeDrugList.length === 0" class="text-center py-6">
            <p class="text-[13px] text-[#999]">세부내역이 없습니다</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 검진 상세 모달 -->
    <div v-if="selectedCheckup" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="selectedCheckup = null">
      <div class="bg-white rounded-[20px] w-full max-w-[640px] max-h-[85vh] flex flex-col shadow-xl">
        <div class="flex items-center justify-between px-6 pt-5 pb-3 border-b border-[#F0F0F0] shrink-0">
          <h3 class="text-[17px] font-bold text-[#222]">검진 상세</h3>
          <button class="text-[#999] p-1 hover:text-[#333]" @click="selectedCheckup = null">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke-width="2" stroke-linecap="round" /></svg>
          </button>
        </div>
        <div class="overflow-y-auto px-6 py-5 space-y-5">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-[16px] font-semibold text-[#222]">{{ formatDate(selectedCheckup.checkup_date) }} 검진</p>
              <p v-if="selectedCheckup.checkup_type" class="text-[13px] text-[#999] mt-0.5">{{ selectedCheckup.checkup_type }}</p>
              <p v-if="selectedCheckup.hospital_name" class="text-[13px] text-[#999] mt-0.5">{{ selectedCheckup.hospital_name }}</p>
            </div>
            <span
              :class="selectedCheckup.judgement === '정상' ? 'bg-green-50 text-green-600' : selectedCheckup.judgement ? 'bg-yellow-50 text-yellow-700' : 'bg-gray-100 text-[#999]'"
              class="px-3 py-1 rounded-full text-[12px] font-medium"
            >{{ selectedCheckup.judgement || '-' }}</span>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-[13px] font-semibold text-[#222] mb-2">신체계측</p>
              <div class="bg-[#F8F8F8] rounded-[12px] p-4 space-y-2 text-[13px]">
                <div v-if="selectedCheckup.height" class="flex justify-between"><span class="text-[#999]">키</span><span class="text-[#333]">{{ selectedCheckup.height }}cm</span></div>
                <div v-if="selectedCheckup.weight" class="flex justify-between"><span class="text-[#999]">체중</span><span class="text-[#333]">{{ selectedCheckup.weight }}kg</span></div>
                <div v-if="selectedCheckup.waist" class="flex justify-between"><span class="text-[#999]">허리둘레</span><span class="text-[#333]">{{ selectedCheckup.waist }}cm</span></div>
                <div v-if="selectedCheckup.bmi" class="flex justify-between"><span class="text-[#999]">BMI</span><span class="text-[#333]">{{ selectedCheckup.bmi }}</span></div>
              </div>
            </div>
            <div>
              <p class="text-[13px] font-semibold text-[#222] mb-2">혈액·혈압</p>
              <div class="bg-[#F8F8F8] rounded-[12px] p-4 space-y-2 text-[13px]">
                <div v-if="selectedCheckup.blood_pressure" class="flex justify-between"><span class="text-[#999]">혈압</span><span class="text-[#333]">{{ selectedCheckup.blood_pressure }}</span></div>
                <div v-if="selectedCheckup.hemoglobin" class="flex justify-between"><span class="text-[#999]">혈색소</span><span class="text-[#333]">{{ selectedCheckup.hemoglobin }} g/dL</span></div>
                <div v-if="selectedCheckup.fasting_blood_sugar" class="flex justify-between"><span class="text-[#999]">공복혈당</span><span class="text-[#333]">{{ selectedCheckup.fasting_blood_sugar }} mg/dL</span></div>
              </div>
            </div>
            <div>
              <p class="text-[13px] font-semibold text-[#222] mb-2">지질검사</p>
              <div class="bg-[#F8F8F8] rounded-[12px] p-4 space-y-2 text-[13px]">
                <div v-if="selectedCheckup.total_cholesterol" class="flex justify-between"><span class="text-[#999]">총콜레스테롤</span><span class="text-[#333]">{{ selectedCheckup.total_cholesterol }}</span></div>
                <div v-if="selectedCheckup.hdl_cholesterol" class="flex justify-between"><span class="text-[#999]">HDL</span><span class="text-[#333]">{{ selectedCheckup.hdl_cholesterol }}</span></div>
                <div v-if="selectedCheckup.ldl_cholesterol" class="flex justify-between"><span class="text-[#999]">LDL</span><span class="text-[#333]">{{ selectedCheckup.ldl_cholesterol }}</span></div>
                <div v-if="selectedCheckup.triglyceride" class="flex justify-between"><span class="text-[#999]">중성지방</span><span class="text-[#333]">{{ selectedCheckup.triglyceride }}</span></div>
              </div>
            </div>
            <div>
              <p class="text-[13px] font-semibold text-[#222] mb-2">간·신장 기능</p>
              <div class="bg-[#F8F8F8] rounded-[12px] p-4 space-y-2 text-[13px]">
                <div v-if="selectedCheckup.ast" class="flex justify-between"><span class="text-[#999]">AST (SGOT)</span><span class="text-[#333]">{{ selectedCheckup.ast }}</span></div>
                <div v-if="selectedCheckup.alt" class="flex justify-between"><span class="text-[#999]">ALT (SGPT)</span><span class="text-[#333]">{{ selectedCheckup.alt }}</span></div>
                <div v-if="selectedCheckup.y_gtp" class="flex justify-between"><span class="text-[#999]">γ-GTP</span><span class="text-[#333]">{{ selectedCheckup.y_gtp }}</span></div>
                <div v-if="selectedCheckup.serum_creatinine" class="flex justify-between"><span class="text-[#999]">혈청크레아티닌</span><span class="text-[#333]">{{ selectedCheckup.serum_creatinine }}</span></div>
                <div v-if="selectedCheckup.gfr" class="flex justify-between"><span class="text-[#999]">신사구체여과율</span><span class="text-[#333]">{{ selectedCheckup.gfr }}</span></div>
              </div>
            </div>
          </div>

          <div v-if="selectedCheckup.opinion">
            <p class="text-[13px] font-semibold text-[#222] mb-2">종합소견</p>
            <div class="bg-[#F8F8F8] rounded-[12px] p-4 text-[13px] text-[#333] leading-relaxed whitespace-pre-line">{{ selectedCheckup.opinion }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 보험 상세 모달 -->
    <div v-if="selectedInsurance" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="selectedInsurance = null">
      <div class="bg-white rounded-[16px] w-[640px] max-h-[80vh] flex flex-col">
        <div class="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#F0F0F0] shrink-0">
          <h3 class="text-[17px] font-bold text-[#222]">보험 상세</h3>
          <button class="text-[#999] hover:text-[#555] p-1 transition-colors" @click="selectedInsurance = null">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke-width="2" stroke-linecap="round" /></svg>
          </button>
        </div>
        <div class="overflow-y-auto px-6 py-5 space-y-5">
          <!-- 기본 정보 -->
          <div>
            <div class="flex items-start justify-between mb-4">
              <div>
                <p class="text-[16px] font-semibold text-[#222]">{{ selectedInsurance.product_name || '보험상품' }}</p>
                <p class="text-[13px] text-[#999] mt-1">{{ selectedInsurance.insurance_company?.company_name || '-' }}</p>
              </div>
              <span
                :class="selectedInsurance.contract_status === '정상' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-[#999]'"
                class="px-3 py-1 rounded-full text-[12px] font-medium"
              >{{ selectedInsurance.contract_status || '-' }}</span>
            </div>
            <div class="grid grid-cols-2 gap-x-8 gap-y-2.5 bg-[#F8F8F8] rounded-[12px] p-5 text-[13px]">
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
            <p class="text-[14px] font-semibold text-[#222] mb-3">보장내역 ({{ selectedInsurance.coverages.length }}건)</p>
            <div class="bg-[#F8F8F8] rounded-[12px] overflow-hidden">
              <table class="min-w-full">
                <thead>
                  <tr class="border-b border-[#E8E8E8]">
                    <th class="px-4 py-2.5 text-left text-[12px] font-medium text-[#999]">보장명</th>
                    <th class="px-4 py-2.5 text-left text-[12px] font-medium text-[#999]">피보험자</th>
                    <th class="px-4 py-2.5 text-right text-[12px] font-medium text-[#999]">보장금액</th>
                    <th class="px-4 py-2.5 text-center text-[12px] font-medium text-[#999]">상태</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#ECECEC]">
                  <tr v-for="cov in selectedInsurance.coverages" :key="cov.coverage_id">
                    <td class="px-4 py-2.5 text-[13px] text-[#333]">{{ cov.coverage_name }}</td>
                    <td class="px-4 py-2.5 text-[13px] text-[#666]">{{ cov.insured_person || '-' }}</td>
                    <td class="px-4 py-2.5 text-[13px] text-[#333] text-right font-medium font-variant-numeric tabular-nums">{{ formatCurrency(cov.coverage_amount) }}</td>
                    <td class="px-4 py-2.5 text-center">
                      <span
                        :class="cov.coverage_status === '정상' ? 'text-green-600' : 'text-[#999]'"
                        class="text-[12px]"
                      >{{ cov.coverage_status || '-' }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
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
import type { MedicalRecordFull, HealthCheckupRecord } from '../../types'
import type { InsuranceContract } from '@shared/types'

const route = useRoute()
const router = useRouter()
const store = useCodefStore()
const toast = useToast()

const customerId = computed(() => route.params.customerId as string)
const customerName = ref('고객')

const tabs = [
  { key: 'medical', label: '진료 내역' },
  { key: 'checkup', label: '건강검진' },
  { key: 'healthAge', label: '건강나이' },
  { key: 'insurance', label: '보험 계약' },
] as const

type TabKey = typeof tabs[number]['key']
const activeTab = ref<TabKey>('medical')

const selectedInsurance = ref<InsuranceContract | null>(null)
const showCreditModal = ref(false)
const creditId = ref('')
const creditPw = ref('')
const showCreditTwoWay = ref(false)
const creditSmsCode = ref('')
const creditPwVisible = ref(false)
const creditError = ref('')
const authError = ref('')

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

function getHospSurgeryTotal(n: number): number {
  const data = store.disclosureCheck?.hospitalization_surgery?.[n]
  if (!data) return 0
  return data.hospitalization + data.surgery
}

const criticalDiseaseYearLabel = computed(() => {
  const diseases = store.disclosureCheck?.critical_diseases
  if (!diseases) return ''
  let minYear: number | null = null
  for (const info of Object.values(diseases)) {
    if (info.found && info.year !== null) {
      if (minYear === null || info.year < minYear) minYear = info.year
    }
  }
  if (minYear === null) return ''
  return `${minYear + 1}년`
})

const hasCriticalDisease = computed(() => {
  const diseases = store.disclosureCheck?.critical_diseases
  if (!diseases) return false
  return Object.values(diseases).some(d => d.found)
})

function criticalDiseaseLabel(key: string): string {
  const labels: Record<string, string> = {
    cancer: '암',
    stroke: '뇌졸중',
    angina: '협심증',
    myocardial_infarction: '심근경색',
    heart_valve: '심장판막증',
    liver_cirrhosis: '간경화',
    chronic_kidney: '투석중인 만성신장질환',
  }
  return labels[key] ?? key
}

const expandedClassification = ref<string | null>(null)

const classificationItems = computed(() => {
  const dc = store.disclosureCheck?.disclosure_classification
  if (!dc) return []
  return [
    { key: 'treatment_3months', period: '3개월 이내', label: '치료력', found: dc.treatment_3months.found, count: dc.treatment_3months.count, type: 'simple' },
    { key: 'hospitalization_5years', period: '5년 이내', label: '입원', found: dc.hospitalization_5years.found, count: dc.hospitalization_5years.count, type: 'simple' },
    { key: 'surgery_5years', period: null as string | null, label: '수술', found: dc.surgery_5years.found, count: dc.surgery_5years.count, type: 'simple' },
    { key: 'frequent_visits', period: null as string | null, label: '7일 이상 통원', found: dc.frequent_visits.found, count: dc.frequent_visits.groups.length, type: 'grouped' },
    { key: 'long_prescriptions', period: null as string | null, label: '30일 이상 처방', found: dc.long_prescriptions.found, count: dc.long_prescriptions.groups.length, type: 'grouped' },
    { key: 'critical_disease_5years', period: null as string | null, label: '중대질환', found: dc.critical_disease_5years.found, count: Object.keys(dc.critical_disease_5years.diseases).length, type: 'critical' },
  ]
})

function toggleClassification(key: string) {
  expandedClassification.value = expandedClassification.value === key ? null : key
}

function getClassificationRecords(key: string) {
  const dc = store.disclosureCheck?.disclosure_classification
  if (!dc) return []
  const map: Record<string, typeof dc.treatment_3months.records> = {
    treatment_3months: dc.treatment_3months.records,
    hospitalization_5years: dc.hospitalization_5years.records,
    surgery_5years: dc.surgery_5years.records,
  }
  return map[key] ?? []
}

function getClassificationGroups(key: string) {
  const dc = store.disclosureCheck?.disclosure_classification
  if (!dc) return []
  if (key === 'frequent_visits') {
    return dc.frequent_visits.groups.map(g => ({
      diagnosis_code: g.diagnosis_code,
      diagnosis_name: g.diagnosis_name,
      displayValue: g.count + '회',
      records: g.records,
    }))
  }
  if (key === 'long_prescriptions') {
    return dc.long_prescriptions.groups.map(g => ({
      diagnosis_code: g.diagnosis_code,
      diagnosis_name: g.diagnosis_name,
      displayValue: g.total_days + '일',
      records: g.records,
    }))
  }
  return []
}

function getCriticalClassificationRecords() {
  return store.disclosureCheck?.disclosure_classification?.critical_disease_5years?.diseases ?? {}
}

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

function hasSurgery(rec: any): boolean {
  const details = safeParseJson(rec?.detail_treat_list_json)
  return details.some((d: any) => d.resTreatType?.includes('수술'))
}

const selectedHasSurgery = computed(() => hasSurgery(selectedMedical.value))

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
  else if (activeTab.value === 'medical') {
    store.loadMedical(id)
    store.loadDisclosureCheck(id)
  }
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
  creditError.value = ''
  try {
    const res = await api.fetchInsurance(customerId.value, { id: creditId.value, password: creditPw.value })
    const data = res.data as { success: boolean; two_way?: boolean; message?: string }
    if (data.two_way) {
      showCreditModal.value = false
      showCreditTwoWay.value = true
      toast.showToast('추가 인증이 필요합니다', 'success')
    } else if (data.success) {
      showCreditModal.value = false
      toast.showToast('보험 계약 조회 완료', 'success')
      store.loadInsurance(customerId.value)
    } else {
      creditError.value = data.message || '조회에 실패했습니다'
      toast.showToast(creditError.value, 'error')
    }
  } catch (err: any) {
    creditError.value = err?.response?.data?.message || '보험 조회 중 오류가 발생했습니다'
    toast.showToast(creditError.value, 'error')
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
  authError.value = ''
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
      authError.value = data.message || '조회에 실패했습니다'
      toast.showToast(authError.value, 'error')
    }
  } catch (err: any) {
    const status = err?.response?.status || 'NET'
    const code = err?.response?.data?.code || ''
    const msg = err?.response?.data?.message || err?.message || '조회 요청 중 오류가 발생했습니다'
    authError.value = `[${status}${code ? ' ' + code : ''}] ${msg}`
    toast.showToast(authError.value, 'error')
  } finally {
    fetchLoading.value = false
  }
}

async function doConfirmAuth() {
  fetchLoading.value = true
  authError.value = ''
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
      authError.value = data.message || '인증 확인에 실패했습니다'
      toast.showToast(authError.value, 'error')
    }
  } catch (err: any) {
    const status = err?.response?.status || 'NET'
    const code = err?.response?.data?.code || ''
    const msg = err?.response?.data?.message || err?.message || '인증 확인 중 오류가 발생했습니다'
    authError.value = `[${status}${code ? ' ' + code : ''}] ${msg}`
    toast.showToast(authError.value, 'error')
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
