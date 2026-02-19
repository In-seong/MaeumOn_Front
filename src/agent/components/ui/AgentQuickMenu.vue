<template>
  <div class="grid grid-cols-4 gap-3">
    <button
      v-for="item in menuItems"
      :key="item.label"
      class="flex flex-col items-center gap-1.5 py-3 rounded-[12px] bg-white shadow-[0_0_8px_rgba(0,0,0,0.06)] active:scale-[0.96] transition-transform"
      @click="router.push(item.path)"
    >
      <div class="w-9 h-9 rounded-full flex items-center justify-center" :class="item.bgColor">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          :stroke="item.iconColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          v-html="item.svgPath"
        />
      </div>
      <span class="text-[11px] font-medium text-[#555]">{{ item.label }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const menuItems = [
  {
    label: '고객관리',
    path: '/customers',
    bgColor: 'bg-[#FFF0E5]',
    iconColor: '#FF7B22',
    svgPath: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  },
  {
    label: '상담요청',
    path: '/consultations',
    bgColor: 'bg-[#E8F0FE]',
    iconColor: '#4285F4',
    svgPath: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
  },
  {
    label: '청구관리',
    path: '/claims',
    bgColor: 'bg-[#E8F9EE]',
    iconColor: '#1FBD53',
    svgPath: '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>',
  },
  {
    label: '메시지',
    path: '/messages/send',
    bgColor: 'bg-[#FFF4E5]',
    iconColor: '#F3940E',
    svgPath: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
  },
  {
    label: 'DB배분',
    path: '/db-distribution',
    bgColor: 'bg-[#F3E8FF]',
    iconColor: '#8B5CF6',
    svgPath: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>',
  },
  {
    label: '알릴의무',
    path: '/alert-duty',
    bgColor: 'bg-[#FFE5E5]',
    iconColor: '#FF3B30',
    svgPath: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  },
  {
    label: '만족도',
    path: '/satisfaction',
    bgColor: 'bg-[#FFFCE5]',
    iconColor: '#F5A623',
    svgPath: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  },
  {
    label: '일정관리',
    path: '/schedule',
    bgColor: 'bg-[#E5F6FF]',
    iconColor: '#0EA5E9',
    svgPath: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  },
]
</script>
