<template>
  <div class="p-4 lg:p-6">
    <h1 class="text-[22px] font-bold text-[#333] mb-6">배정 통계</h1>

    <div class="mb-4 flex flex-wrap gap-3">
      <div class="flex bg-[#F8F8F8] rounded-[12px] border border-[#E8E8E8] overflow-hidden">
        <button
          v-for="opt in periodOptions" :key="opt.value"
          class="px-4 py-2.5 text-[14px] transition-colors"
          :class="store.period === opt.value ? 'bg-[#FF7B22] text-white font-medium' : 'text-[#666] hover:bg-[#F0F0F0]'"
          @click="store.setPeriod(opt.value)"
        >{{ opt.label }}</button>
      </div>

      <select
        :value="store.selectedHospitalId ?? ''"
        class="px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333]"
        @change="onHospitalChange"
      >
        <option value="">전체 병원</option>
        <option v-for="h in store.hospitals" :key="h.hospital_id" :value="h.hospital_id">{{ h.hospital_name }}</option>
      </select>
    </div>

    <div class="mb-4 flex flex-wrap gap-3">
      <div class="bg-white rounded-[12px] shadow-[0_0_10px_rgba(0,0,0,0.06)] px-5 py-4 min-w-[140px]">
        <div class="text-[12px] text-[#999] mb-1">전체</div>
        <div class="text-[24px] font-bold text-[#333]">{{ store.summary.total }}</div>
      </div>
      <div class="bg-white rounded-[12px] shadow-[0_0_10px_rgba(0,0,0,0.06)] px-5 py-4 min-w-[140px]">
        <div class="text-[12px] text-[#999] mb-1">상주 DB</div>
        <div class="text-[24px] font-bold text-[#2196F3]">{{ store.summary.total_resident }}</div>
      </div>
      <div class="bg-white rounded-[12px] shadow-[0_0_10px_rgba(0,0,0,0.06)] px-5 py-4 min-w-[140px]">
        <div class="text-[12px] text-[#999] mb-1">배분 DB</div>
        <div class="text-[24px] font-bold text-[#FF7B22]">{{ store.summary.total_distribution }}</div>
      </div>
      <div class="bg-[#F8F8F8] rounded-[12px] px-5 py-4 flex items-center">
        <span class="text-[13px] text-[#999]">기간: {{ store.startDate }} ~</span>
      </div>
    </div>

    <div v-if="store.loading" class="text-center py-10">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF7B22] mx-auto"></div>
    </div>

    <div v-else-if="store.agents.length === 0" class="text-center py-10 text-[#999] text-[14px]">
      해당 기간에 배정 데이터가 없습니다.
    </div>

    <div v-else class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] overflow-x-auto">
      <table class="min-w-full divide-y divide-[#E8E8E8]">
        <thead class="bg-[#FAFAFA]">
          <tr>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase">No.</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase">설계사</th>
            <th class="px-4 lg:px-6 py-3 text-center text-[12px] font-medium text-[#999] uppercase">상주 DB</th>
            <th class="px-4 lg:px-6 py-3 text-center text-[12px] font-medium text-[#999] uppercase">배분 DB</th>
            <th class="px-4 lg:px-6 py-3 text-center text-[12px] font-medium text-[#999] uppercase">합계</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#F0F0F0]">
          <tr v-for="(row, index) in store.agents" :key="row.agent_id" class="hover:bg-[#FAFAFA] transition-colors">
            <td class="px-4 lg:px-6 py-4 text-[14px] text-[#999]">{{ index + 1 }}</td>
            <td class="px-4 lg:px-6 py-4 text-[14px] font-medium text-[#333]">{{ row.agent_name }}</td>
            <td class="px-4 lg:px-6 py-4 text-[14px] text-center text-[#2196F3] font-medium">{{ row.resident }}</td>
            <td class="px-4 lg:px-6 py-4 text-[14px] text-center text-[#FF7B22] font-medium">{{ row.distribution }}</td>
            <td class="px-4 lg:px-6 py-4 text-[14px] text-center font-bold text-[#333]">{{ row.total }}</td>
          </tr>
        </tbody>
        <tfoot class="bg-[#FAFAFA]">
          <tr>
            <td class="px-4 lg:px-6 py-3"></td>
            <td class="px-4 lg:px-6 py-3 text-[13px] font-bold text-[#333]">합계</td>
            <td class="px-4 lg:px-6 py-3 text-[13px] text-center font-bold text-[#2196F3]">{{ store.summary.total_resident }}</td>
            <td class="px-4 lg:px-6 py-3 text-[13px] text-center font-bold text-[#FF7B22]">{{ store.summary.total_distribution }}</td>
            <td class="px-4 lg:px-6 py-3 text-[13px] text-center font-bold text-[#333]">{{ store.summary.total }}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useClaimRequestStatStore } from '../../stores/claimRequestStatStore'

const store = useClaimRequestStatStore()

const periodOptions = [
  { value: 'day' as const, label: '오늘' },
  { value: 'week' as const, label: '이번 주' },
  { value: 'month' as const, label: '이번 달' },
]

function onHospitalChange(e: Event) {
  const target = e.target as HTMLSelectElement
  const val = target.value
  store.setHospital(val ? Number(val) : null)
}

onMounted(() => {
  store.loadStatistics()
})
</script>
