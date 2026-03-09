<template>
  <div class="p-4 lg:p-6">
    <h1 class="text-[22px] font-bold text-[#333] mb-2">동의서 관리</h1>
    <p class="text-[14px] text-[#888] mb-6">모든 청구서에 공통으로 적용되는 동의서를 관리합니다.</p>

    <!-- 로딩 -->
    <div v-if="loading" class="text-center py-10">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF7B22] mx-auto"></div>
    </div>

    <!-- 동의서 카드 목록 -->
    <div v-else class="flex flex-col gap-6">
      <div
        v-for="template in templates"
        :key="template.consent_template_id"
        class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] p-6"
      >
        <!-- 헤더 -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <span
              class="px-3 py-1 text-[12px] font-medium rounded-full"
              :class="getTypeBadgeClass(template.consent_type)"
            >
              {{ getTypeLabel(template.consent_type) }}
            </span>
            <h2
              v-if="editingId !== template.consent_template_id"
              class="text-[16px] font-semibold text-[#333]"
            >
              {{ template.title }}
            </h2>
          </div>
          <button
            v-if="editingId !== template.consent_template_id"
            class="text-[13px] text-[#FF7B22] font-medium hover:text-[#E56D1E]"
            @click="startEdit(template)"
          >
            수정
          </button>
        </div>

        <!-- 보기 모드 -->
        <div v-if="editingId !== template.consent_template_id">
          <pre class="text-[13px] text-[#555] leading-relaxed whitespace-pre-wrap font-sans bg-[#F8F8F8] rounded-[12px] p-4 max-h-[300px] overflow-y-auto">{{ template.content }}</pre>
        </div>

        <!-- 편집 모드 -->
        <div v-else class="space-y-4">
          <div>
            <label class="block text-[13px] font-medium text-[#555] mb-1.5">제목</label>
            <input
              v-model="editForm.title"
              type="text"
              class="w-full px-4 py-3 bg-[#F8F8F8] rounded-[12px] text-[14px] text-[#333] outline-none border border-[#E8E8E8] focus:border-[#FF7B22] transition-colors"
            />
          </div>
          <div>
            <label class="block text-[13px] font-medium text-[#555] mb-1.5">내용</label>
            <textarea
              v-model="editForm.content"
              rows="12"
              class="w-full px-4 py-3 bg-[#F8F8F8] rounded-[12px] text-[13px] text-[#333] outline-none border border-[#E8E8E8] focus:border-[#FF7B22] transition-colors resize-y leading-relaxed"
            ></textarea>
          </div>
          <div class="flex gap-3 justify-end">
            <button
              class="px-5 py-2.5 border border-[#E0E0E0] text-[#555] rounded-[12px] text-[13px] font-medium"
              @click="cancelEdit"
            >
              취소
            </button>
            <button
              :disabled="saving"
              class="px-5 py-2.5 bg-[#FF7B22] text-white rounded-[12px] text-[13px] font-medium disabled:opacity-50"
              @click="saveEdit(template.consent_template_id)"
            >
              {{ saving ? '저장 중...' : '저장' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { consentApi } from '@shared/services/insuranceApi'
import type { ConsentTemplate } from '@shared/services/insuranceApi'

const templates = ref<ConsentTemplate[]>([])
const loading = ref(false)
const saving = ref(false)
const editingId = ref<number | null>(null)
const editForm = ref({ title: '', content: '' })

async function fetchData() {
  loading.value = true
  try {
    const res = await consentApi.getAll()
    templates.value = res.data.data
  } finally {
    loading.value = false
  }
}

function getTypeLabel(type: string): string {
  switch (type) {
    case 'unique_id': return '고유식별정보'
    case 'sensitive': return '민감정보'
    case 'credit': return '개인(신용)정보'
    default: return type
  }
}

function getTypeBadgeClass(type: string): string {
  switch (type) {
    case 'unique_id': return 'bg-blue-100 text-blue-700'
    case 'sensitive': return 'bg-purple-100 text-purple-700'
    case 'credit': return 'bg-green-100 text-green-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

function startEdit(template: ConsentTemplate) {
  editingId.value = template.consent_template_id
  editForm.value = { title: template.title, content: template.content }
}

function cancelEdit() {
  editingId.value = null
}

async function saveEdit(id: number) {
  saving.value = true
  try {
    await consentApi.update(id, editForm.value)
    const target = templates.value.find(t => t.consent_template_id === id)
    if (target) {
      target.title = editForm.value.title
      target.content = editForm.value.content
    }
    editingId.value = null
  } catch (e: any) {
    alert(e.response?.data?.message || '저장에 실패했습니다.')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>
