<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <BackHeader title="메시지 발송" />

      <main class="px-6 py-3 overflow-y-auto pb-20" style="height: calc(100vh - 56px - 60px);">
        <!-- Send Type Tabs -->
        <div class="flex gap-2 mb-5">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            class="flex-1 py-2.5 rounded-[12px] text-[13px] font-semibold transition-all"
            :class="
              messageStore.sendType === tab.value
                ? 'bg-[#FF7B22] text-white'
                : 'bg-white border border-[#E0E0E0] text-[#555]'
            "
            @click="messageStore.sendType = tab.value"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- SMS Tab -->
        <section v-if="messageStore.sendType === 'sms'" class="flex flex-col gap-4">
          <CardSection>
            <FormSelect
              v-model="smsForm.recipient"
              label="수신자"
              :options="customerOptions"
            />
            <div class="mt-4">
              <FormTextarea
                v-model="smsForm.content"
                label="내용"
                placeholder="문자 내용을 입력하세요"
                :rows="5"
              />
            </div>
            <div class="mt-4">
              <label class="text-[13px] font-medium text-[#555] mb-1.5 block">이미지 첨부</label>
              <div
                class="border-2 border-dashed border-[#E0E0E0] rounded-[12px] p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#FF7B22] transition-colors"
                @click="triggerFileInput"
              >
                <template v-if="smsForm.imagePreview">
                  <img
                    :src="smsForm.imagePreview"
                    alt="첨부 이미지"
                    class="w-full max-h-[160px] object-contain rounded-[8px]"
                  />
                  <button
                    class="text-[12px] text-[#FF0000] mt-1"
                    @click.stop="removeImage"
                  >
                    이미지 삭제
                  </button>
                </template>
                <template v-else>
                  <div class="w-10 h-10 rounded-full bg-[#FFF0E5] flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M21 15V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V15" stroke="#FF7B22" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M17 8L12 3L7 8" stroke="#FF7B22" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M12 3V15" stroke="#FF7B22" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <p class="text-[13px] font-medium text-[#555]">이미지 첨부</p>
                  <p class="text-[11px] text-[#999]">클릭하여 이미지를 선택하세요</p>
                </template>
              </div>
              <input
                ref="fileInputRef"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleImageSelect"
              />
            </div>
            <ActionButton full large class="mt-5" @click="handleSmsSend">
              문자 발송
            </ActionButton>
          </CardSection>
        </section>

        <!-- Kakao Tab -->
        <section v-if="messageStore.sendType === 'kakao'" class="flex flex-col gap-4">
          <CardSection>
            <FormSelect
              v-model="kakaoForm.templateId"
              label="템플릿 선택"
              :options="templateOptions"
            />
            <div class="mt-4">
              <FormSelect
                v-model="kakaoForm.recipient"
                label="수신자"
                :options="customerOptions"
              />
            </div>

            <!-- Template Preview -->
            <div v-if="selectedTemplate" class="mt-4">
              <label class="text-[13px] font-medium text-[#555] mb-1.5 block">템플릿 미리보기</label>
              <div class="bg-[#FEE500] rounded-[12px] p-4">
                <div class="bg-white rounded-[10px] p-4">
                  <p class="text-[13px] text-[#333] whitespace-pre-line leading-relaxed">
                    {{ selectedTemplate.content }}
                  </p>
                </div>
              </div>
            </div>

            <ActionButton full large class="mt-5" @click="handleKakaoSend">
              알림톡 발송
            </ActionButton>
          </CardSection>
        </section>

        <!-- Push Tab -->
        <section v-if="messageStore.sendType === 'push'" class="flex flex-col gap-4">
          <CardSection>
            <FormSelect
              v-model="pushForm.recipient"
              label="수신자"
              :options="customerOptions"
            />
            <div class="mt-4">
              <FormInput
                v-model="pushForm.title"
                label="제목"
                placeholder="알림 제목을 입력하세요"
              />
            </div>
            <div class="mt-4">
              <FormTextarea
                v-model="pushForm.content"
                label="내용"
                placeholder="알림 내용을 입력하세요"
                :rows="5"
              />
            </div>
            <ActionButton full large class="mt-5" @click="handlePushSend">
              PUSH 발송
            </ActionButton>
          </CardSection>
        </section>

        <!-- Send History -->
        <section class="mt-6">
          <h3 class="text-[15px] font-semibold text-[#333] mb-3">발송 이력</h3>
          <div class="flex flex-col gap-2">
            <div
              v-for="msg in messageStore.messageHistory"
              :key="msg.message_id"
              class="bg-white rounded-[12px] shadow-[0_0_10px_rgba(0,0,0,0.1)] p-4"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="text-[13px] font-semibold text-[#333]">{{ msg.customer_name }}</span>
                <StatusBadge
                  :label="statusLabel(msg.status)"
                  :variant="statusVariant(msg.status)"
                />
              </div>
              <p class="text-[12px] text-[#666] line-clamp-2 mb-2">{{ msg.content }}</p>
              <div class="flex items-center justify-between">
                <StatusBadge
                  :label="typeLabel(msg.send_type)"
                  :variant="typeVariant(msg.send_type)"
                />
                <span class="text-[11px] text-[#999]">{{ msg.sent_at }}</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <AgentBottomNav />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import BackHeader from '@user/components/layout/BackHeader.vue'
import AgentBottomNav from '../../components/layout/AgentBottomNav.vue'
import CardSection from '@user/components/ui/CardSection.vue'
import ActionButton from '@user/components/ui/ActionButton.vue'
import StatusBadge from '@user/components/ui/StatusBadge.vue'
import FormInput from '@user/components/form/FormInput.vue'
import FormSelect from '@user/components/form/FormSelect.vue'
import FormTextarea from '@user/components/form/FormTextarea.vue'
import { useMessageStore } from '../../stores/messageStore'
import type { Message } from '../../types'

const messageStore = useMessageStore()
messageStore.fetchHistory()

const fileInputRef = ref<HTMLInputElement | null>(null)

const tabs: { label: string; value: 'sms' | 'kakao' | 'push' }[] = [
  { label: '문자(SMS)', value: 'sms' },
  { label: '카카오 알림톡', value: 'kakao' },
  { label: 'PUSH', value: 'push' },
]

const mockCustomers = [
  { name: '김영수', id: 101 },
  { name: '박미정', id: 102 },
  { name: '이정훈', id: 103 },
  { name: '최수연', id: 104 },
  { name: '정민호', id: 105 },
]

const customerOptions = ['선택하세요', ...mockCustomers.map((c) => `${c.id}:${c.name}`)]

function parseCustomerOption(option: string): { id: number | undefined; name: string } {
  const sep = option.indexOf(':')
  if (sep === -1) return { id: undefined, name: option }
  return { id: Number(option.slice(0, sep)), name: option.slice(sep + 1) }
}

const templateOptions = computed(() => [
  '선택하세요',
  ...messageStore.kakaoTemplates.map((t) => t.template_name),
])

const selectedTemplate = computed(() =>
  messageStore.kakaoTemplates.find((t) => t.template_name === kakaoForm.value.templateId),
)

// Form states
const smsForm = ref({
  recipient: '선택하세요',
  content: '',
  imageFile: null as File | null,
  imagePreview: '',
})

const kakaoForm = ref({
  templateId: '선택하세요',
  recipient: '선택하세요',
})

const pushForm = ref({
  recipient: '선택하세요',
  title: '',
  content: '',
})

function triggerFileInput(): void {
  fileInputRef.value?.click()
}

function handleImageSelect(event: Event): void {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  smsForm.value.imageFile = file
  const reader = new FileReader()
  reader.onload = (e) => {
    smsForm.value.imagePreview = (e.target?.result as string) || ''
  }
  reader.readAsDataURL(file)
}

function removeImage(): void {
  smsForm.value.imageFile = null
  smsForm.value.imagePreview = ''
  if (fileInputRef.value) fileInputRef.value.value = ''
}

function handleSmsSend(): void {
  if (smsForm.value.recipient === '선택하세요' || !smsForm.value.content) return
  const customer = parseCustomerOption(smsForm.value.recipient)
  messageStore.sendMessage({
    sendType: 'sms',
    customerName: customer.name,
    customerId: customer.id,
    content: smsForm.value.content,
  })
  smsForm.value.content = ''
  smsForm.value.recipient = '선택하세요'
  removeImage()
}

function handleKakaoSend(): void {
  if (kakaoForm.value.recipient === '선택하세요' || kakaoForm.value.templateId === '선택하세요') return
  const template = selectedTemplate.value
  if (!template) return
  const customer = parseCustomerOption(kakaoForm.value.recipient)
  messageStore.sendMessage({
    sendType: 'kakao',
    customerName: customer.name,
    customerId: customer.id,
    content: template.content,
    templateId: template.template_id,
  })
  kakaoForm.value.recipient = '선택하세요'
  kakaoForm.value.templateId = '선택하세요'
}

function handlePushSend(): void {
  if (pushForm.value.recipient === '선택하세요' || !pushForm.value.content) return
  const customer = parseCustomerOption(pushForm.value.recipient)
  messageStore.sendMessage({
    sendType: 'push',
    customerName: customer.name,
    customerId: customer.id,
    content: `[${pushForm.value.title}] ${pushForm.value.content}`,
  })
  pushForm.value.title = ''
  pushForm.value.content = ''
  pushForm.value.recipient = '선택하세요'
}

function statusLabel(status: Message['status']): string {
  const map: Record<Message['status'], string> = {
    sent: '발송완료',
    failed: '발송실패',
    pending: '대기중',
  }
  return map[status]
}

function statusVariant(status: Message['status']): 'success' | 'danger' | 'warning' {
  const map: Record<Message['status'], 'success' | 'danger' | 'warning'> = {
    sent: 'success',
    failed: 'danger',
    pending: 'warning',
  }
  return map[status]
}

function typeLabel(type: Message['send_type']): string {
  const map: Record<Message['send_type'], string> = {
    sms: 'SMS',
    kakao: '카카오',
    push: 'PUSH',
  }
  return map[type]
}

function typeVariant(type: Message['send_type']): 'primary' | 'info' | 'default' {
  const map: Record<Message['send_type'], 'primary' | 'info' | 'default'> = {
    sms: 'primary',
    kakao: 'info',
    push: 'default',
  }
  return map[type]
}
</script>
