<script setup lang="ts">
</script>

<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        MaeumOn - 관리자
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mb-8">
        관리자 대시보드입니다.
      </p>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">사용자 관리</h3>
          <p class="text-gray-600 dark:text-gray-400">전체 사용자: 0명</p>
        </div>
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">설계사 관리</h3>
          <p class="text-gray-600 dark:text-gray-400">전체 설계사: 0명</p>
        </div>
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">시스템 현황</h3>
          <p class="text-gray-600 dark:text-gray-400">정상 운영 중</p>
        </div>
      </div>
    </div>
  </div>
</template>
