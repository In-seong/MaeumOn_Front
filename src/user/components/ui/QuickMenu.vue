<template>
  <div class="w-full bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.1)] p-5 flex items-center justify-between" style="height: 102px;">
    <button
      v-for="item in menuItems"
      :key="item.label"
      class="flex-1 flex flex-col items-center justify-center gap-2"
      @click="item.to && router.push(item.to)"
    >
      <component :is="item.icon" v-bind="item.props || {}" />
      <span class="text-[11px] font-normal text-black">{{ item.label }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { markRaw, type Component } from 'vue'
import { useRouter } from 'vue-router'
import HospitalIcon from '@user/components/icons/HospitalIcon.vue'
import AccidentIcon from '@user/components/icons/AccidentIcon.vue'
import ClipboardIcon from '@user/components/icons/ClipboardIcon.vue'
import PlusIcon from '@user/components/icons/PlusIcon.vue'

const router = useRouter()

interface MenuItem {
  icon: Component
  label: string
  props?: Record<string, unknown>
  to?: string
}

const menuItems: MenuItem[] = [
  { icon: markRaw(HospitalIcon), label: '병원찾기', props: { active: true }, to: '/hospital' },
  { icon: markRaw(AccidentIcon), label: '사고접수' },
  { icon: markRaw(ClipboardIcon), label: '민원접수', to: '/consultation' },
  { icon: markRaw(PlusIcon), label: '부가서비스', to: '/insurance' }
]
</script>
