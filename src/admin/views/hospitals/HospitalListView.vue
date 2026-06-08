<template>
  <div class="p-4 lg:p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-[22px] font-bold text-[#333]">병원 관리</h1>
      <button @click="openForm()" class="px-4 py-2.5 bg-[#FF7B22] text-white rounded-[12px] text-[14px] font-medium hover:bg-[#E66A1A] transition-colors">
        + 병원 등록
      </button>
    </div>

    <!-- 검색 -->
    <div class="mb-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="병원명 또는 주소로 검색"
        class="px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333] placeholder-[#999]"
        @input="debouncedSearch"
      />
    </div>

    <div v-if="loading" class="text-center py-10">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF7B22] mx-auto"></div>
    </div>

    <div v-else class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] overflow-x-auto">
      <table class="min-w-full divide-y divide-[#E8E8E8]">
        <thead class="bg-[#FAFAFA]">
          <tr>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase">ID</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase">병원명</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase hidden md:table-cell">주소</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase hidden sm:table-cell">전화번호</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase hidden lg:table-cell">진료과목</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase">상태</th>
            <th class="px-4 lg:px-6 py-3 text-right text-[12px] font-medium text-[#999] uppercase">관리</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#F0F0F0]">
          <tr v-for="h in hospitals" :key="h.hospital_id" class="hover:bg-[#FAFAFA] transition-colors">
            <td class="px-4 lg:px-6 py-4 text-[14px] font-medium text-[#FF7B22]">{{ h.hospital_id }}</td>
            <td class="px-4 lg:px-6 py-4 text-[14px] font-medium text-[#333]">{{ h.hospital_name }}</td>
            <td class="px-4 lg:px-6 py-4 text-[14px] text-[#555] hidden md:table-cell max-w-[200px] truncate">{{ h.address }}</td>
            <td class="px-4 lg:px-6 py-4 text-[14px] text-[#555] hidden sm:table-cell">{{ h.contact_phone || '-' }}</td>
            <td class="px-4 lg:px-6 py-4 text-[14px] text-[#555] hidden lg:table-cell max-w-[150px] truncate">{{ h.specialties || '-' }}</td>
            <td class="px-4 lg:px-6 py-4">
              <span :class="h.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'" class="px-2 py-1 text-[12px] font-medium rounded-full">
                {{ h.is_active ? '활성' : '비활성' }}
              </span>
            </td>
            <td class="px-4 lg:px-6 py-4 text-right space-x-2">
              <button @click="openForm(h)" class="px-3 py-1.5 bg-[#FF7B22] text-white rounded-[8px] text-[13px] font-medium hover:bg-[#E66A1A]">수정</button>
              <button v-if="h.is_active" @click="deactivate(h.hospital_id)" class="px-3 py-1.5 bg-red-500 text-white rounded-[8px] text-[13px] font-medium hover:bg-red-600">비활성</button>
            </td>
          </tr>
          <tr v-if="hospitals.length === 0">
            <td colspan="7" class="px-4 lg:px-6 py-10 text-center text-[#999]">등록된 병원이 없습니다.</td>
          </tr>
        </tbody>
      </table>

      <div v-if="pagination && pagination.last_page > 1" class="px-6 py-4 border-t border-[#F0F0F0]">
        <div class="flex justify-center gap-2">
          <button v-for="page in pagination.last_page" :key="page" @click="fetchData(page)"
            :class="['px-3 py-1 rounded-[8px] text-[14px]', page === pagination.current_page ? 'bg-[#FF7B22] text-white' : 'bg-[#F8F8F8] text-[#555] hover:bg-[#FFF3ED]']">
            {{ page }}
          </button>
        </div>
      </div>
    </div>

    <!-- 등록/수정 모달 -->
    <div v-if="formOpen" class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" @click.self="formOpen = false">
      <div class="bg-white rounded-[16px] w-full max-w-[600px] max-h-[90vh] overflow-y-auto shadow-xl">
        <div class="px-6 py-4 border-b border-[#F0F0F0] flex items-center justify-between">
          <h2 class="text-[18px] font-bold text-[#222]">{{ editingId ? '병원 수정' : '병원 등록' }}</h2>
          <button @click="formOpen = false" class="text-[#888] hover:text-[#333] text-[22px]">&times;</button>
        </div>
        <div class="px-6 py-5 space-y-4">
          <div>
            <label class="text-[13px] font-medium text-[#555] mb-1 block">병원명 *</label>
            <input v-model="formData.hospital_name" class="w-full px-3 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] text-[14px] focus:outline-none focus:border-[#FF7B22]" />
          </div>
          <div>
            <label class="text-[13px] font-medium text-[#555] mb-1 block">주소 *</label>
            <input v-model="formData.address" class="w-full px-3 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] text-[14px] focus:outline-none focus:border-[#FF7B22]" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-[13px] font-medium text-[#555] mb-1 block">전화번호</label>
              <input v-model="formData.contact_phone" class="w-full px-3 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] text-[14px] focus:outline-none focus:border-[#FF7B22]" />
            </div>
            <div>
              <label class="text-[13px] font-medium text-[#555] mb-1 block">진료과목</label>
              <input v-model="formData.specialties" class="w-full px-3 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] text-[14px] focus:outline-none focus:border-[#FF7B22]" />
            </div>
          </div>
          <div>
            <label class="text-[13px] font-medium text-[#555] mb-2 block">위치 선택</label>
            <MapLocationPicker
              :latitude="formData.latitude"
              :longitude="formData.longitude"
              @update:latitude="formData.latitude = $event"
              @update:longitude="formData.longitude = $event"
              @update:address="formData.address = $event"
            />
            <div class="grid grid-cols-2 gap-4 mt-2">
              <div>
                <label class="text-[11px] text-[#999] mb-0.5 block">위도</label>
                <input v-model="formData.latitude" type="number" step="any" class="w-full px-2.5 py-1.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[8px] text-[12px] text-[#888] focus:outline-none focus:border-[#FF7B22]" />
              </div>
              <div>
                <label class="text-[11px] text-[#999] mb-0.5 block">경도</label>
                <input v-model="formData.longitude" type="number" step="any" class="w-full px-2.5 py-1.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[8px] text-[12px] text-[#888] focus:outline-none focus:border-[#FF7B22]" />
              </div>
            </div>
          </div>
          <div>
            <label class="text-[13px] font-medium text-[#555] mb-1 block">영업시간</label>
            <input v-model="formData.business_hours" class="w-full px-3 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] text-[14px] focus:outline-none focus:border-[#FF7B22]" placeholder="예: 평일 09:00-18:00" />
          </div>
          <div>
            <label class="text-[13px] font-medium text-[#555] mb-1 block">소개</label>
            <textarea v-model="formData.introduction" rows="3" class="w-full px-3 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] text-[14px] focus:outline-none focus:border-[#FF7B22] resize-none"></textarea>
          </div>
          <!-- 병원 이미지 (다중) -->
          <div>
            <label class="text-[13px] font-medium text-[#555] mb-2 block">병원 이미지 <span class="text-[11px] text-[#999] font-normal">여러 장 가능, 720x400 비율 크롭</span></label>
            <!-- 기존 이미지 목록 -->
            <div v-if="hospitalImages.length > 0" class="flex gap-2 flex-wrap mb-3">
              <div v-for="img in hospitalImages" :key="img.image_id" class="relative group">
                <img :src="img.image_url || ''" class="w-[120px] h-[67px] object-cover rounded-lg border border-[#E8E8E8]" />
                <button
                  type="button"
                  class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-[11px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  @click="removeImage(img.image_id)"
                >&times;</button>
              </div>
            </div>
            <!-- 신규 등록 시 미리보기 -->
            <div v-if="!editingId && imagePreviewUrl" class="mb-3">
              <img :src="imagePreviewUrl" class="w-[120px] h-[67px] object-cover rounded-lg border border-[#E8E8E8]" />
            </div>
            <label class="inline-flex items-center gap-1.5 px-3 py-2 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] text-[13px] text-[#555] cursor-pointer hover:bg-[#F0F0F0]">
              <span>{{ imageUploading ? '업로드 중...' : '+ 이미지 추가' }}</span>
              <input type="file" accept="image/*" class="hidden" :disabled="imageUploading" @change="onImageChange" />
            </label>
          </div>
          <!-- 예약 시간 설정 -->
          <div class="border-t border-[#F0F0F0] pt-4">
            <button type="button" @click="scheduleOpen = !scheduleOpen" class="flex items-center gap-2 text-[13px] font-medium text-[#555] mb-2 hover:text-[#FF7B22]">
              <span>{{ scheduleOpen ? '▼' : '▶' }}</span>
              <span>예약 시간 설정</span>
            </button>
            <ScheduleConfigEditor v-if="scheduleOpen" v-model="formData.schedule_config" />
          </div>
          <div class="border-t border-[#F0F0F0] pt-4">
            <p class="text-[13px] font-medium text-[#555] mb-2">포털 계정 {{ editingId && existingAccount ? '(수정)' : '(선택)' }}</p>
            <div v-if="editingId && existingAccount" class="mb-2 px-3 py-2 bg-[#F0F7FF] rounded-[8px] text-[12px] text-[#555]">
              현재 계정: <span class="font-semibold text-[#333]">{{ existingAccount }}</span>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-[12px] text-[#888] mb-1 block">아이디</label>
                <input v-model="formData.portal_username" class="w-full px-3 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] text-[14px] focus:outline-none focus:border-[#FF7B22]" :placeholder="editingId && existingAccount ? '변경 시 입력' : ''" />
              </div>
              <div>
                <label class="text-[12px] text-[#888] mb-1 block">{{ editingId && existingAccount ? '새 비밀번호' : '비밀번호' }}</label>
                <input v-model="formData.portal_password" type="password" class="w-full px-3 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] text-[14px] focus:outline-none focus:border-[#FF7B22]" :placeholder="editingId && existingAccount ? '변경 시 입력' : ''" />
              </div>
            </div>
          </div>
        </div>
        <div class="px-6 py-4 border-t border-[#F0F0F0] flex justify-end gap-3">
          <button @click="formOpen = false" class="px-4 py-2 text-[#555] hover:text-[#333] text-[14px]">취소</button>
          <button @click="submitForm" :disabled="submitting" class="px-5 py-2 bg-[#FF7B22] text-white rounded-[10px] text-[14px] font-medium disabled:opacity-50 hover:bg-[#E66A1A]">
            {{ submitting ? '처리 중...' : (editingId ? '수정' : '등록') }}
          </button>
        </div>
      </div>
    </div>
    <!-- 크롭 모달 -->
    <div v-if="showCropper" class="fixed inset-0 bg-black/70 flex items-center justify-center z-[60]">
      <div class="bg-white rounded-2xl w-full max-w-2xl mx-4 p-5">
        <h3 class="text-base font-bold mb-2">이미지 크롭</h3>
        <p class="text-xs text-gray-400 mb-3">원하는 영역을 선택하세요 (720x400 비율 고정)</p>
        <div class="bg-gray-100 rounded-lg overflow-hidden" style="max-height:400px;">
          <img ref="cropImgRef" :src="rawImageUrl" class="block max-w-full" />
        </div>
        <div class="flex justify-end gap-2 mt-4">
          <button class="px-4 py-2 text-sm text-gray-500" @click="closeCropper">취소</button>
          <button class="px-4 py-2 bg-[#FF7B22] text-white rounded-lg text-sm font-medium" @click="applyCrop">크롭 적용</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'
import { fetchAdminHospitals, createAdminHospital, updateAdminHospital, deleteAdminHospital, uploadHospitalImage, addHospitalImage, deleteHospitalImage } from '../../services/adminApi'
import type { AdminHospital, LaravelPagination, ScheduleConfig } from '../../types'
import ScheduleConfigEditor from '../../components/ScheduleConfigEditor.vue'
import MapLocationPicker from '../../components/MapLocationPicker.vue'

const hospitals = ref<AdminHospital[]>([])
const pagination = ref<Omit<LaravelPagination<AdminHospital>, 'data'> | null>(null)
const loading = ref(false)
const searchQuery = ref('')
let searchTimeout: ReturnType<typeof setTimeout>

const formOpen = ref(false)
const editingId = ref<number | null>(null)
const submitting = ref(false)
const scheduleOpen = ref(false)
const existingAccount = ref('')
const imageFile = ref<File | null>(null)
const imagePreviewUrl = ref<string | null>(null)
const showCropper = ref(false)
const cropImgRef = ref<HTMLImageElement>()
const rawImageUrl = ref('')
let cropperInstance: Cropper | null = null

interface HospitalImageItem {
  image_id: number
  image_url: string | null
  sort_order: number
}
const hospitalImages = ref<HospitalImageItem[]>([])
const imageUploading = ref(false)
const formData = reactive({
  hospital_name: '',
  address: '',
  contact_phone: '',
  specialties: '',
  latitude: '' as string | number,
  longitude: '' as string | number,
  business_hours: '',
  introduction: '',
  schedule_config: null as ScheduleConfig | null,
  portal_username: '',
  portal_password: '',
  image_url: '' as string | null,
})

function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => fetchData(), 300)
}

async function fetchData(page = 1) {
  loading.value = true
  try {
    const res = await fetchAdminHospitals({ search: searchQuery.value || undefined, page })
    const { data, ...pag } = res.data.data
    hospitals.value = data
    pagination.value = pag
  } finally {
    loading.value = false
  }
}

function openForm(hospital?: AdminHospital) {
  if (hospital) {
    editingId.value = hospital.hospital_id
    Object.assign(formData, {
      hospital_name: hospital.hospital_name,
      address: hospital.address,
      contact_phone: hospital.contact_phone || '',
      specialties: hospital.specialties || '',
      latitude: hospital.latitude || '',
      longitude: hospital.longitude || '',
      business_hours: hospital.business_hours || '',
      introduction: hospital.introduction || '',
      schedule_config: hospital.schedule_config ? JSON.parse(JSON.stringify(hospital.schedule_config)) : null,
      portal_username: hospital.accounts?.[0]?.username || '',
      portal_password: '',
      image_url: (hospital as unknown as { image_url?: string | null }).image_url ?? null,
    })
    existingAccount.value = hospital.accounts?.[0]?.username || ''
    hospitalImages.value = ((hospital as unknown as { images?: HospitalImageItem[] }).images ?? [])
  } else {
    editingId.value = null
    Object.assign(formData, { hospital_name: '', address: '', contact_phone: '', specialties: '', latitude: '', longitude: '', business_hours: '', introduction: '', schedule_config: null, portal_username: '', portal_password: '', image_url: null })
    hospitalImages.value = []
    existingAccount.value = ''
  }
  imageFile.value = null
  imagePreviewUrl.value = null
  scheduleOpen.value = false
  formOpen.value = true
}

function onImageChange(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  rawImageUrl.value = URL.createObjectURL(file)
  showCropper.value = true
  nextTick(() => {
    if (cropperInstance) { cropperInstance.destroy(); cropperInstance = null }
    if (cropImgRef.value) {
      cropperInstance = new Cropper(cropImgRef.value, {
        aspectRatio: 720 / 400,
        viewMode: 1,
        dragMode: 'move',
        autoCropArea: 1,
      })
    }
  })
}

function applyCrop() {
  if (!cropperInstance) return
  const canvas = cropperInstance.getCroppedCanvas({ width: 720, height: 400, imageSmoothingQuality: 'high' })
  canvas.toBlob(async (blob: Blob | null) => {
    if (!blob) return
    const file = new File([blob], 'hospital.jpg', { type: 'image/jpeg' })

    // 편집 중이면 바로 업로드
    if (editingId.value) {
      imageUploading.value = true
      try {
        const fd = new FormData()
        fd.append('image', file)
        await addHospitalImage(editingId.value, fd)
        // 목록 새로고침
        const res = await fetchAdminHospitals({ search: undefined, page: 1, per_page: 100 })
        const found = (res.data.data as unknown as { data: Array<unknown> }).data.find(
          (h: unknown) => (h as { hospital_id: number }).hospital_id === editingId.value
        ) as unknown as { images?: HospitalImageItem[] } | undefined
        hospitalImages.value = found?.images ?? []
      } catch {
        alert('이미지 업로드에 실패했습니다.')
      } finally {
        imageUploading.value = false
      }
    } else {
      // 신규 등록 시 파일만 저장
      imageFile.value = file
      imagePreviewUrl.value = canvas.toDataURL('image/jpeg', 0.9)
    }
    closeCropper()
  }, 'image/jpeg', 0.9)
}

async function removeImage(imageId: number) {
  if (!editingId.value || !confirm('이 이미지를 삭제하시겠습니까?')) return
  try {
    await deleteHospitalImage(editingId.value, imageId)
    hospitalImages.value = hospitalImages.value.filter(i => i.image_id !== imageId)
  } catch {
    alert('삭제에 실패했습니다.')
  }
}

function closeCropper() {
  if (cropperInstance) { cropperInstance.destroy(); cropperInstance = null }
  showCropper.value = false
  if (rawImageUrl.value) { URL.revokeObjectURL(rawImageUrl.value); rawImageUrl.value = '' }
}

async function submitForm() {
  if (!formData.hospital_name || !formData.address) { alert('병원명과 주소는 필수입니다.'); return }
  submitting.value = true
  try {
    const { image_url: _iu, ...rest } = formData
    const payload: Record<string, unknown> = { ...rest }
    let hospitalId: number
    if (editingId.value) {
      await updateAdminHospital(editingId.value, payload)
      hospitalId = editingId.value
    } else {
      const res = await createAdminHospital(payload)
      hospitalId = (res.data.data as unknown as { hospital_id: number }).hospital_id
    }
    if (imageFile.value) {
      const fd = new FormData()
      fd.append('image', imageFile.value)
      await addHospitalImage(hospitalId, fd)
    }
    alert(editingId.value ? '병원 정보가 수정되었습니다.' : '병원이 등록되었습니다.')
    formOpen.value = false
    fetchData()
  } catch (e: unknown) {
    const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
    alert(msg || '처리에 실패했습니다.')
  } finally {
    submitting.value = false
  }
}

async function deactivate(id: number) {
  if (!confirm('이 병원을 비활성화하시겠습니까?')) return
  try {
    await deleteAdminHospital(id)
    fetchData(pagination.value?.current_page ?? 1)
  } catch {
    alert('비활성화에 실패했습니다.')
  }
}

onMounted(() => fetchData())
</script>
