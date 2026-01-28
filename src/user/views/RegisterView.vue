<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const name = ref('')
const email = ref('')
const phone = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const error = ref('')

const handleRegister = async () => {
  error.value = ''

  if (password.value !== passwordConfirmation.value) {
    error.value = '비밀번호가 일치하지 않습니다.'
    return
  }

  if (password.value.length < 8) {
    error.value = '비밀번호는 8자 이상이어야 합니다.'
    return
  }

  const success = await authStore.register({
    name: name.value,
    email: email.value,
    phone: phone.value || undefined,
    password: password.value,
    password_confirmation: passwordConfirmation.value,
  })

  if (success) {
    router.push('/')
  } else {
    error.value = authStore.error || '회원가입에 실패했습니다.'
  }
}

function formatPhone(event: Event) {
  const target = event.target as HTMLInputElement
  let value = target.value.replace(/[^0-9]/g, '')

  if (value.length > 3 && value.length <= 7) {
    value = value.slice(0, 3) + '-' + value.slice(3)
  } else if (value.length > 7) {
    value = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7, 11)
  }

  phone.value = value
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-purple-700">
    <div class="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md mx-4">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-purple-600 mb-2">회원가입</h1>
        <p class="text-gray-500 dark:text-gray-400">보험ON에 가입하세요</p>
      </div>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            이름 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="name"
            type="text"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="이름을 입력하세요"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            이메일 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="이메일을 입력하세요"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            전화번호
          </label>
          <input
            :value="phone"
            @input="formatPhone"
            type="tel"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="010-1234-5678"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            비밀번호 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="password"
            type="password"
            required
            minlength="8"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="비밀번호를 입력하세요 (8자 이상)"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            비밀번호 확인 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="passwordConfirmation"
            type="password"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="비밀번호를 다시 입력하세요"
          />
        </div>

        <div v-if="error" class="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="authStore.loading"
          class="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white py-3 px-4 rounded-lg font-medium transition-colors"
        >
          {{ authStore.loading ? '가입 중...' : '회원가입' }}
        </button>
      </form>

      <div class="mt-6 text-center">
        <p class="text-gray-600 dark:text-gray-400">
          이미 계정이 있으신가요?
          <router-link to="/login" class="text-purple-600 hover:text-purple-700 font-medium">
            로그인
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>
