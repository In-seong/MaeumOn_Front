<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <!-- Header -->
      <AppHeader />

      <!-- Main Content -->
      <main class="px-6 py-3 pb-20 overflow-y-auto" style="height: calc(100vh - 66px - 60px);">
        <!-- Section 1: Notice + Insurance + Quick Menu -->
        <section class="flex flex-col gap-[14px] mb-4">
          <NoticeCard />
          <InsuranceCards />
          <QuickMenu />
        </section>

        <!-- Section 2: Coverage Analysis -->
        <section class="flex flex-col gap-4 mb-6">
          <SectionTitle title="보장 분석" actionText="자세히 보기" actionTo="/coverage-analysis">
            <template #icon><CoverageIcon /></template>
          </SectionTitle>
          <CoverageCard />
        </section>

        <!-- Section 3: Agent -->
        <section class="flex flex-col gap-4 mb-6">
          <SectionTitle title="담당 설계사" actionText="더보기">
            <template #icon><AgentIcon /></template>
          </SectionTitle>
          <AgentCard />
        </section>
      </main>

      <!-- Bottom Navigation -->
      <BottomNav />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '../stores/authStore'
import AppHeader from '@user/components/layout/AppHeader.vue'
import BottomNav from '@user/components/layout/BottomNav.vue'
import NoticeCard from '@user/components/ui/NoticeCard.vue'
import InsuranceCards from '@user/components/ui/InsuranceCards.vue'
import QuickMenu from '@user/components/ui/QuickMenu.vue'
import SectionTitle from '@user/components/ui/SectionTitle.vue'
import CoverageCard from '@user/components/ui/CoverageCard.vue'
import AgentCard from '@user/components/ui/AgentCard.vue'
import CoverageIcon from '@user/components/icons/CoverageIcon.vue'
import AgentIcon from '@user/components/icons/AgentIcon.vue'

const authStore = useAuthStore()

onMounted(async () => {
  await authStore.fetchUser()
})
</script>
