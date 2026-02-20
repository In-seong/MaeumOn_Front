<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] min-h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <BackHeader title="보험 청구서 작성" />
      <main class="px-5 py-4 pb-24 overflow-y-auto" style="height: calc(100vh - 56px);">
        <!-- 보험사 선택 -->
        <CardSection class="mb-4">
          <p class="text-[13px] font-medium text-[#888] mb-2">보험사</p>

          <div v-if="claimStore.loadingCompanies" class="flex items-center justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7B22]"></div>
          </div>

          <div v-else class="grid grid-cols-2 gap-2">
            <button
              v-for="company in claimStore.insuranceCompanies"
              :key="company.company_id"
              @click="selectedCompanyId = company.company_id"
              class="rounded-[10px] px-3 py-2.5 text-left transition-all active:scale-[0.98]"
              :class="
                selectedCompanyId === company.company_id
                  ? 'bg-[#FFF0E5] border-[1.5px] border-[#FF7B22]'
                  : 'bg-[#F8F8F8] border-[1.5px] border-transparent'
              "
            >
              <p class="text-[13px] font-semibold text-[#222]">{{ company.company_name }}</p>
            </button>
          </div>

          <div v-if="claimStore.insuranceCompanies.length === 0 && !claimStore.loadingCompanies" class="text-center py-6">
            <p class="text-[13px] text-[#999]">등록된 보험사가 없습니다.</p>
          </div>
        </CardSection>

        <!-- 양식 선택 -->
        <div v-if="selectedCompanyId" class="mb-5">

          <div v-if="claimStore.loadingClaimForms" class="flex items-center justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7B22]"></div>
          </div>

          <div v-else class="flex flex-col gap-3">
            <button
              v-for="template in claimStore.claimForms"
              :key="template.claim_form_id"
              @click="selectTemplate(template.claim_form_id)"
              class="block w-full text-left active:scale-[0.98] transition-transform"
            >
              <CardSection>
                <div v-if="template.template_image_url" class="mb-3 aspect-[4/3] bg-[#F8F8F8] rounded-[8px] overflow-hidden">
                  <img
                    :src="template.template_image_url"
                    :alt="template.form_name"
                    class="w-full h-full object-cover"
                  />
                </div>
                <p class="text-[15px] font-semibold text-[#222]">{{ template.form_name }}</p>
                <p v-if="template.form_description" class="text-[12px] text-[#999] mt-1">
                  {{ template.form_description }}
                </p>
                <p v-if="template.form_fields_count" class="text-[11px] text-[#FF7B22] mt-2">
                  입력 필드 {{ template.form_fields_count }}개
                </p>
              </CardSection>
            </button>
          </div>

          <div v-if="claimStore.claimForms.length === 0 && !claimStore.loadingClaimForms" class="text-center py-8">
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
    await claimStore.fetchClaimForms(newId)
  } else {
    claimStore.claimForms = []
  }
})

function selectTemplate(templateId: number) {
  router.push(`/claims/new/${templateId}`)
}
</script>
