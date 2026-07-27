<template>
  <div class="p-4 lg:p-6">
    <h1 class="text-[22px] font-bold text-[#333] mb-2">사이트 설정</h1>
    <p class="text-[14px] text-[#888] mb-6">시스템 운영에 필요한 설정값을 관리합니다.</p>

    <div v-if="loading" class="text-center py-10">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF7B22] mx-auto"></div>
    </div>

    <div v-else class="max-w-[640px]">
      <!-- 과금 설정 -->
      <div class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] p-6 mb-6">
        <h2 class="text-[16px] font-semibold text-[#333] mb-1">과금 설정</h2>
        <p class="text-[13px] text-[#999] mb-5">CODEF API 사용료 관련 설정</p>

        <div class="flex items-center gap-3">
          <label class="text-[14px] text-[#555] font-medium whitespace-nowrap">건당 단가</label>
          <div class="relative flex-1 max-w-[200px]">
            <input
              v-model="form.codef_unit_price"
              type="number"
              min="0"
              step="100"
              class="w-full px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333] text-right pr-10"
            />
            <span class="absolute right-4 top-1/2 -translate-y-1/2 text-[14px] text-[#999]">원</span>
          </div>
        </div>
      </div>

      <!-- 저장 버튼 -->
      <div class="flex justify-end">
        <button
          :disabled="saving"
          class="px-6 py-2.5 bg-[#FF7B22] text-white text-[14px] font-medium rounded-[12px] hover:bg-[#E56D1E] transition-colors disabled:opacity-50"
          @click="save"
        >
          {{ saving ? '저장 중...' : '설정 저장' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@shared/api'

interface SettingItem {
  key: string
  value: string
  label?: string
  type?: string
}

const loading = ref(true)
const saving = ref(false)

const form = ref({
  codef_unit_price: '600',
})

async function fetchSettings() {
  loading.value = true
  try {
    const res = await api.get('/admin/settings')
    const data: Record<string, SettingItem> = res.data.data
    if (data.codef_unit_price) {
      form.value.codef_unit_price = data.codef_unit_price.value
    }
  } catch {
    // 설정이 없으면 기본값 유지
  } finally {
    loading.value = false
  }
}

async function save() {
  saving.value = true
  try {
    await api.put('/admin/settings', {
      settings: [
        { key: 'codef_unit_price', value: form.value.codef_unit_price },
      ],
    })
    alert('설정이 저장되었습니다.')
  } catch {
    alert('설정 저장에 실패했습니다.')
  } finally {
    saving.value = false
  }
}

onMounted(fetchSettings)
</script>
