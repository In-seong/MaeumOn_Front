<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] min-h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <BackHeader title="보험 청구서 작성" />
      <main class="px-5 py-4 pb-24 overflow-y-auto" style="height: calc(100vh - 56px);">
        <!-- Step 1: 보험사 선택 -->
        <div class="mb-5">
          <p class="text-[15px] font-semibold text-[#222] mb-2">1. 보험사 선택</p>

          <div v-if="claimStore.loadingCompanies" class="flex items-center justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7B22]"></div>
          </div>

          <div v-else class="grid grid-cols-2 gap-3">
            <button
              v-for="company in claimStore.insuranceCompanies"
              :key="company.id"
              @click="selectedCompanyId = company.id"
              class="rounded-[12px] p-4 text-left transition-all active:scale-[0.98]"
              :class="
                selectedCompanyId === company.id
                  ? 'bg-[#FFF0E5] border-2 border-[#FF7B22]'
                  : 'bg-white border-2 border-[#E8E8E8]'
              "
            >
              <p class="text-[14px] font-semibold text-[#222]">{{ company.name }}</p>
              <p class="text-[12px] text-[#999] mt-0.5">{{ company.code }}</p>
              <p v-if="company.claim_form_templates_count" class="text-[11px] text-[#FF7B22] mt-1">
                양식 {{ company.claim_form_templates_count }}개
              </p>
            </button>
          </div>

          <div v-if="claimStore.insuranceCompanies.length === 0 && !claimStore.loadingCompanies" class="text-center py-8">
            <p class="text-[13px] text-[#999]">등록된 보험사가 없습니다.</p>
          </div>
        </div>

        <!-- Step 2: 양식 선택 -->
        <div v-if="selectedCompanyId" class="mb-5">
          <p class="text-[15px] font-semibold text-[#222] mb-2">2. 청구서 양식 선택</p>

          <div v-if="claimStore.loadingTemplates" class="flex items-center justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7B22]"></div>
          </div>

          <div v-else class="flex flex-col gap-3">
            <button
              v-for="template in claimStore.templates"
              :key="template.id"
              @click="selectTemplate(template.id)"
              class="block w-full text-left active:scale-[0.98] transition-transform"
            >
              <CardSection>
                <div v-if="template.template_image_url" class="mb-3 aspect-[4/3] bg-[#F8F8F8] rounded-[8px] overflow-hidden">
                  <img
                    :src="template.template_image_url"
                    :alt="template.name"
                    class="w-full h-full object-cover"
                  />
                </div>
                <p class="text-[15px] font-semibold text-[#222]">{{ template.name }}</p>
                <p v-if="template.description" class="text-[12px] text-[#999] mt-1">
                  {{ template.description }}
                </p>
                <p v-if="template.template_fields_count" class="text-[11px] text-[#FF7B22] mt-2">
                  입력 필드 {{ template.template_fields_count }}개
                </p>
              </CardSection>
            </button>
          </div>

          <div v-if="claimStore.templates.length === 0 && !claimStore.loadingTemplates" class="text-center py-8">
            <p class="text-[13px] text-[#999]">이 보험사에 등록된 양식이 없습니다.</p>
          </div>
        </div>

        <!-- 에러 메시지 -->
        <div v-if="claimStore.error" class="p-3 bg-[#FFE5E5] rounded-[8px] text-[13px] text-[#FF0000]">
          {{ claimStore.error }}
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useClaimStore } from '../../stores/claimStore'
import BackHeader from '@user/components/layout/BackHeader.vue'
import CardSection from '@user/components/ui/CardSection.vue'

const router = useRouter()
const claimStore = useClaimStore()

const selectedCompanyId = ref<number | null>(null)

onMounted(async () => {
  await claimStore.fetchInsuranceCompanies()
})

watch(selectedCompanyId, async (newId) => {
  if (newId) {
    await claimStore.fetchTemplates(newId)
  } else {
    claimStore.templates = []
  }
})

function selectTemplate(templateId: number) {
  router.push(`/claims/new/${templateId}`)
}
</script>
