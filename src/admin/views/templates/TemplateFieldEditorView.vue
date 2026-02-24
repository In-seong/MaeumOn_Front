<template>
  <div class="h-screen flex flex-col bg-[#F8F8F8]">
    <!-- 헤더 -->
    <div class="bg-white shadow-[0_0_10px_rgba(0,0,0,0.06)] px-4 py-3 flex justify-between items-center">
      <div class="flex items-center">
        <router-link to="/templates" class="text-[#999] hover:text-[#FF7B22] mr-4 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </router-link>
        <h1 class="text-[18px] font-bold text-[#333]">
          {{ store.currentTemplate?.form_name || '필드 편집기' }}
        </h1>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="handleAddConsentMarker"
          :disabled="!store.currentPage"
          class="px-4 py-2 bg-white border border-green-300 text-green-600 rounded-[12px] hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-[14px] font-medium"
        >
          동의 체크 추가
        </button>
        <button
          @click="handleAddField"
          :disabled="!store.currentPage"
          class="px-4 py-2 bg-white border border-[#E0E0E0] text-[#555] rounded-[12px] hover:bg-[#FAFAFA] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-[14px] font-medium"
        >
          필드 추가
        </button>
        <button
          @click="handleSave"
          :disabled="saving"
          class="px-4 py-2 bg-[#FF7B22] text-white rounded-[12px] hover:bg-[#E56D1E] disabled:opacity-50 transition-colors text-[14px] font-medium"
        >
          {{ saving ? '저장 중...' : '저장' }}
        </button>
      </div>
    </div>

    <!-- 페이지 탭 바 -->
    <div class="bg-white border-b border-[#E8E8E8] px-4 py-2">
      <div class="flex items-center gap-2 overflow-x-auto">
        <span class="text-[13px] text-[#999] mr-2">페이지:</span>

        <!-- 페이지 탭들 -->
        <button
          v-for="page in store.sortedPages"
          :key="page.form_page_id"
          @click="selectPage(page)"
          class="px-4 py-2 text-[13px] rounded-[8px] transition-colors whitespace-nowrap flex items-center gap-2"
          :class="store.currentPage?.form_page_id === page.form_page_id
            ? 'bg-[#FF7B22] text-white'
            : 'bg-[#F8F8F8] text-[#555] hover:bg-[#FFF3ED] hover:text-[#FF7B22]'"
        >
          <span>{{ page.page_number }}페이지</span>
          <span v-if="!page.page_image_url" class="text-xs opacity-70">(이미지 없음)</span>
          <!-- 페이지 삭제 버튼 -->
          <button
            v-if="store.sortedPages.length > 1"
            @click.stop="handleDeletePage(page.form_page_id)"
            class="ml-1 w-4 h-4 rounded-full hover:bg-red-500 hover:text-white text-xs flex items-center justify-center"
          >
            ×
          </button>
        </button>

        <!-- 페이지 추가 버튼 -->
        <button
          @click="handleAddPage"
          class="px-3 py-2 text-[13px] bg-[#FFF3ED] text-[#FF7B22] rounded-[8px] hover:bg-[#FFE8D6] flex items-center gap-1 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          페이지 추가
        </button>
      </div>
    </div>

    <div v-if="store.loading" class="flex-1 flex items-center justify-center">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF7B22]"></div>
    </div>

    <!-- 페이지가 없는 경우 -->
    <div v-else-if="store.sortedPages.length === 0" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <p class="text-[#999] text-[14px] mb-4">페이지가 없습니다.</p>
        <button
          @click="handleAddPage"
          class="px-4 py-2.5 bg-[#FF7B22] text-white rounded-[12px] hover:bg-[#E56D1E] transition-colors text-[14px] font-medium"
        >
          첫 페이지 추가하기
        </button>
      </div>
    </div>

    <!-- 현재 페이지에 이미지가 없는 경우 -->
    <div v-else-if="store.currentPage && !store.currentPage.page_image_url" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <p class="text-[#999] text-[14px] mb-4">{{ store.currentPage.page_number }}페이지에 이미지가 없습니다.</p>
        <label class="px-4 py-2.5 bg-[#FF7B22] text-white rounded-[12px] hover:bg-[#E56D1E] cursor-pointer inline-block transition-colors text-[14px] font-medium">
          이미지 업로드
          <input
            type="file"
            accept="image/*"
            class="hidden"
            @change="handlePageImageUpload"
          />
        </label>
      </div>
    </div>

    <div v-else-if="store.currentPage" class="flex-1 flex overflow-hidden">
      <!-- 캔버스 영역 -->
      <div class="flex-1 overflow-auto p-4">
        <div
          ref="canvasRef"
          class="relative bg-white shadow-[0_0_10px_rgba(0,0,0,0.06)] mx-auto"
          :class="{ 'cursor-crosshair': placingChoiceIndex !== null }"
          :style="{
            width: (store.currentPage.image_width || 800) + 'px',
            height: (store.currentPage.image_height || 1000) + 'px',
          }"
          @click="handleCanvasClick"
        >
          <!-- 배경 이미지 -->
          <img
            :src="store.currentPage.page_image_url"
            :alt="`${store.currentTemplate?.form_name} - ${store.currentPage.page_number}페이지`"
            class="absolute inset-0 w-full h-full object-contain pointer-events-none"
          />

          <!-- 드래그 가능한 필드들 (현재 페이지 필드만 표시) -->
          <div
            v-for="field in store.currentPageFields"
            :key="field.form_field_id"
            class="absolute cursor-move border-2 rounded transition-colors"
            :class="[
              store.selectedField?.form_field_id === field.form_field_id
                ? 'border-[#FF7B22] bg-[#FF7B22]/20'
                : 'border-[#FFB88C] bg-[#FF7B22]/10 hover:border-[#FF7B22]'
            ]"
            :style="{
              left: field.x_position + 'px',
              top: field.y_position + 'px',
              width: field.width + 'px',
              height: field.height + 'px',
              fontSize: field.font_size + 'px',
              color: field.font_color,
            }"
            @mousedown="startDrag($event, field)"
            @click.stop="selectField(field)"
          >
            <div class="px-1 truncate">{{ field.field_label }}</div>

            <!-- 리사이즈 핸들 -->
            <div
              v-if="store.selectedField?.form_field_id === field.form_field_id"
              class="absolute bottom-0 right-0 w-3 h-3 bg-[#FF7B22] cursor-se-resize"
              @mousedown.stop="startResize($event, field)"
            ></div>

            <!-- 삭제 버튼 -->
            <button
              v-if="store.selectedField?.form_field_id === field.form_field_id"
              class="absolute -top-3 -right-3 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
              @click.stop="handleDeleteField(field.form_field_id)"
            >
              ✕
            </button>
          </div>

          <!-- 배치 모드 안내 -->
          <div
            v-if="placingChoiceIndex !== null"
            class="absolute top-0 left-0 right-0 bg-green-500 text-white text-center py-2 text-[13px] z-20"
          >
            캔버스를 클릭하여 '{{ editForm.field_options?.choices?.[placingChoiceIndex]?.label || '선택지' }}' 위치를 지정하세요
            <button @click="cancelPlacing" class="ml-3 underline">취소</button>
          </div>

          <!-- 선택지 위치 마커 -->
          <div
            v-if="store.selectedField && ['checkbox', 'radio', 'consent'].includes(editForm.field_type) && editForm.field_options?.choices"
            v-for="(choice, idx) in editForm.field_options.choices"
            :key="'choice-' + idx"
            class="absolute z-10 cursor-move"
            :style="{
              left: choice.x + 'px',
              top: choice.y + 'px',
            }"
            @mousedown.stop="startChoiceDrag($event, idx)"
          >
            <div class="border-2 border-dashed border-green-500 bg-green-500/20 px-2 py-0.5 rounded text-[11px] text-green-700 font-bold whitespace-nowrap select-none">
              V {{ choice.label }}
            </div>
          </div>
        </div>
      </div>

      <!-- 속성 패널 -->
      <div class="w-80 bg-white border-l border-[#E8E8E8] overflow-y-auto">
        <div class="p-4">
          <!-- 페이지 정보 -->
          <div class="mb-4 pb-4 border-b border-[#F0F0F0]">
            <h3 class="text-[13px] font-medium text-[#555] mb-2">
              현재 페이지: {{ store.currentPage.page_number }} / {{ store.sortedPages.length }}
            </h3>
            <label class="block">
              <span class="text-[12px] text-[#999]">페이지 이미지 변경</span>
              <input
                type="file"
                accept="image/*"
                class="mt-1 block w-full text-[12px] text-[#999] file:mr-2 file:py-1 file:px-2 file:rounded-[6px] file:border-0 file:text-[12px] file:bg-[#FFF3ED] file:text-[#FF7B22] hover:file:bg-[#FFE8D6]"
                @change="handlePageImageUpload"
              />
            </label>
          </div>

          <h2 class="text-[16px] font-semibold text-[#333] mb-4">
            {{ store.selectedField ? '필드 속성' : '필드를 선택하세요' }}
          </h2>

          <div v-if="store.selectedField" class="space-y-4">
            <!-- consent 필드 안내 배지 -->
            <div v-if="editForm.field_type === 'consent'" class="p-3 bg-green-50 border border-green-200 rounded-[8px]">
              <p class="text-[12px] text-green-700 font-medium">동의 체크 표기 필드</p>
              <p class="text-[11px] text-green-600 mt-0.5">앱에서 동의 시 아래 좌표에 V 체크가 렌더링됩니다.</p>
            </div>

            <div v-if="editForm.field_type !== 'consent'">
              <label class="block text-[13px] font-medium text-[#555] mb-1">필드명</label>
              <input
                v-model="editForm.field_name"
                type="text"
                class="w-full px-3 py-2 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[8px] focus:outline-none focus:border-[#FF7B22] text-[13px] text-[#333]"
              />
            </div>

            <div v-if="editForm.field_type !== 'consent'">
              <label class="block text-[13px] font-medium text-[#555] mb-1">라벨</label>
              <input
                v-model="editForm.field_label"
                type="text"
                class="w-full px-3 py-2 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[8px] focus:outline-none focus:border-[#FF7B22] text-[13px] text-[#333]"
              />
            </div>

            <div v-if="editForm.field_type !== 'consent'">
              <label class="block text-[13px] font-medium text-[#555] mb-1">타입</label>
              <select
                v-model="editForm.field_type"
                class="w-full px-3 py-2 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[8px] focus:outline-none focus:border-[#FF7B22] text-[13px] text-[#333]"
              >
                <option v-for="opt in fieldTypeOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>

            <!-- consent 필드는 위치/크기/글꼴 숨김 (체크 좌표만 관리) -->
            <template v-if="editForm.field_type !== 'consent'">
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-[13px] font-medium text-[#555] mb-1">X</label>
                  <input
                    v-model.number="editForm.x_position"
                    type="number"
                    class="w-full px-3 py-2 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[8px] focus:outline-none focus:border-[#FF7B22] text-[13px] text-[#333]"
                  />
                </div>
                <div>
                  <label class="block text-[13px] font-medium text-[#555] mb-1">Y</label>
                  <input
                    v-model.number="editForm.y_position"
                    type="number"
                    class="w-full px-3 py-2 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[8px] focus:outline-none focus:border-[#FF7B22] text-[13px] text-[#333]"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-[13px] font-medium text-[#555] mb-1">너비</label>
                  <input
                    v-model.number="editForm.width"
                    type="number"
                    class="w-full px-3 py-2 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[8px] focus:outline-none focus:border-[#FF7B22] text-[13px] text-[#333]"
                  />
                </div>
                <div>
                  <label class="block text-[13px] font-medium text-[#555] mb-1">높이</label>
                  <input
                    v-model.number="editForm.height"
                    type="number"
                    class="w-full px-3 py-2 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[8px] focus:outline-none focus:border-[#FF7B22] text-[13px] text-[#333]"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-[13px] font-medium text-[#555] mb-1">글꼴 크기</label>
                  <input
                    v-model.number="editForm.font_size"
                    type="number"
                    min="8"
                    max="72"
                    class="w-full px-3 py-2 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[8px] focus:outline-none focus:border-[#FF7B22] text-[13px] text-[#333]"
                  />
                </div>
                <div>
                  <label class="block text-[13px] font-medium text-[#555] mb-1">색상</label>
                  <input
                    v-model="editForm.font_color"
                    type="color"
                    class="w-full h-10 border border-[#E8E8E8] rounded-[8px] cursor-pointer"
                  />
                </div>
              </div>
            </template>

            <!-- 위저드 스텝 지정 (consent 제외) -->
            <div v-if="editForm.field_type !== 'consent'">
              <label class="block text-[13px] font-medium text-[#555] mb-1">위저드 스텝</label>
              <select
                v-model.number="editWizardStep"
                class="w-full px-3 py-2 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[8px] focus:outline-none focus:border-[#FF7B22] text-[13px] text-[#333]"
              >
                <option v-for="opt in WIZARD_STEP_OPTIONS" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
              <p class="text-[11px] text-[#999] mt-1">앱에서 이 필드가 표시될 페이지를 선택합니다.</p>
            </div>

            <div v-if="!['checkbox','radio','consent','signature'].includes(editForm.field_type)">
              <label class="block text-[13px] font-medium text-[#555] mb-1">플레이스홀더</label>
              <input
                v-model="editForm.placeholder"
                type="text"
                class="w-full px-3 py-2 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[8px] focus:outline-none focus:border-[#FF7B22] text-[13px] text-[#333]"
              />
            </div>

            <!-- consent용 라벨 편집 (간소화) -->
            <div v-if="editForm.field_type === 'consent'">
              <label class="block text-[13px] font-medium text-[#555] mb-1">표시명</label>
              <input
                v-model="editForm.field_label"
                type="text"
                class="w-full px-3 py-2 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[8px] focus:outline-none focus:border-[#FF7B22] text-[13px] text-[#333]"
                placeholder="예: 개인정보 동의 체크"
              />
            </div>

            <!-- 선택지 설정 (checkbox/radio/consent) -->
            <div v-if="['checkbox', 'radio', 'consent'].includes(editForm.field_type) && editForm.field_options" class="space-y-3">
              <div class="border-t border-[#F0F0F0] pt-3">
                <h4 class="text-[12px] font-medium text-[#888] mb-2">선택지 설정</h4>

                <div class="mb-2">
                  <label class="block text-[12px] text-[#888] mb-1">체크 글꼴 크기</label>
                  <input
                    v-model.number="editForm.field_options.check_font_size"
                    type="number"
                    min="8"
                    max="72"
                    class="w-20 px-2 py-1 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[6px] text-[12px] text-[#333]"
                  />
                </div>

                <div v-for="(choice, idx) in editForm.field_options.choices" :key="idx" class="p-2 bg-[#FAFAFA] rounded-[8px] mb-2">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-[11px] text-[#888]">선택지 {{ idx + 1 }}</span>
                    <button
                      v-if="editForm.field_type !== 'consent'"
                      @click="removeChoice(idx)"
                      class="text-red-400 hover:text-red-600 text-[11px]"
                    >삭제</button>
                  </div>
                  <div class="grid grid-cols-2 gap-1 mb-1">
                    <input
                      v-model="choice.label"
                      type="text"
                      placeholder="라벨"
                      class="px-2 py-1 bg-white border border-[#E8E8E8] rounded-[6px] text-[12px]"
                    />
                    <input
                      v-model="choice.value"
                      type="text"
                      placeholder="값"
                      :disabled="editForm.field_type === 'consent'"
                      class="px-2 py-1 bg-white border border-[#E8E8E8] rounded-[6px] text-[12px] disabled:bg-[#F0F0F0]"
                    />
                  </div>
                  <div class="grid grid-cols-3 gap-1">
                    <input
                      v-model.number="choice.x"
                      type="number"
                      placeholder="X"
                      class="px-2 py-1 bg-white border border-[#E8E8E8] rounded-[6px] text-[11px]"
                    />
                    <input
                      v-model.number="choice.y"
                      type="number"
                      placeholder="Y"
                      class="px-2 py-1 bg-white border border-[#E8E8E8] rounded-[6px] text-[11px]"
                    />
                    <button
                      @click="startPlacingChoice(idx)"
                      class="px-1 py-1 bg-green-50 text-green-600 border border-green-200 rounded-[6px] text-[11px] hover:bg-green-100"
                    >위치 지정</button>
                  </div>
                </div>

                <button
                  v-if="editForm.field_type !== 'consent'"
                  @click="addChoice"
                  class="w-full py-1.5 border border-dashed border-[#DDD] rounded-[8px] text-[12px] text-[#999] hover:bg-[#FAFAFA]"
                >+ 선택지 추가</button>
              </div>

              <!-- 동의 텍스트 안내 (consent만) -->
              <div v-if="editForm.field_type === 'consent'" class="border-t border-[#F0F0F0] pt-3">
                <p class="text-[11px] text-[#999]">동의서 내용은 앱에서 자체 제공됩니다. 여기서는 동의/미동의 체크 표기 좌표만 지정하세요.</p>
              </div>
            </div>

            <div v-if="editForm.field_type !== 'consent'">
              <label class="flex items-center">
                <input
                  v-model="editForm.is_required"
                  type="checkbox"
                  class="w-4 h-4 text-[#FF7B22] border-[#E8E8E8] rounded focus:ring-[#FF7B22]"
                />
                <span class="ml-2 text-[13px] text-[#555]">필수 입력</span>
              </label>
            </div>

            <button
              @click="applyFieldChanges"
              class="w-full px-4 py-2.5 bg-[#FF7B22] text-white rounded-[12px] hover:bg-[#E56D1E] transition-colors text-[14px] font-medium"
            >
              속성 적용
            </button>
          </div>

          <!-- 필드 목록 -->
          <div class="mt-6 pt-6 border-t border-[#F0F0F0]">
            <h3 class="text-[13px] font-medium text-[#555] mb-2">
              현재 페이지 필드 ({{ store.currentPageFields.length }}개)
            </h3>
            <ul class="space-y-1">
              <li
                v-for="field in store.currentPageFields"
                :key="field.form_field_id"
                class="px-2 py-1 text-[13px] rounded-[6px] cursor-pointer transition-colors"
                :class="store.selectedField?.form_field_id === field.form_field_id ? 'bg-[#FFF3ED] text-[#FF7B22]' : 'hover:bg-[#FAFAFA] text-[#333]'"
                @click="selectField(field)"
              >
                <span v-if="field.field_type === 'consent' && field.field_name.startsWith('consent_privacy')" class="inline-block px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] rounded mr-1">개인정보</span>
                <span v-else-if="field.field_type === 'consent' && field.field_name.startsWith('consent_sensitive')" class="inline-block px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded mr-1">민감정보</span>
                <span v-else-if="field.field_type === 'consent'" class="inline-block px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] rounded mr-1">동의</span>
                <span class="font-medium">{{ field.field_label }}</span>
                <span v-if="field.field_type !== 'consent'" class="text-[#999] text-[11px] ml-2">({{ field.field_name }})</span>
                <span v-if="field.field_type !== 'consent' && field.field_options?.wizard_step" class="inline-block px-1 py-0.5 bg-orange-100 text-orange-600 text-[10px] rounded ml-1">S{{ field.field_options.wizard_step }}</span>
                <span v-if="field.is_required && field.field_type !== 'consent'" class="text-red-500 text-[11px] ml-1">*</span>
              </li>
              <li v-if="store.currentPageFields.length === 0" class="text-[#999] text-[13px]">
                이 페이지에 필드가 없습니다.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- 필드 추가 모달 -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-[16px] shadow-[0_0_20px_rgba(0,0,0,0.1)] w-96 p-6">
        <h3 class="text-[16px] font-semibold text-[#333] mb-4">새 필드 추가</h3>

        <div class="space-y-4">
          <div>
            <label class="block text-[13px] font-medium text-[#555] mb-1">필드명 *</label>
            <input
              v-model="newField.field_name"
              type="text"
              class="w-full px-3 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333] placeholder-[#999]"
              placeholder="예: patient_name"
            />
          </div>

          <div>
            <label class="block text-[13px] font-medium text-[#555] mb-1">라벨 *</label>
            <input
              v-model="newField.field_label"
              type="text"
              class="w-full px-3 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333] placeholder-[#999]"
              placeholder="예: 환자명"
            />
          </div>

          <div>
            <label class="block text-[13px] font-medium text-[#555] mb-1">타입</label>
            <select
              v-model="newField.field_type"
              class="w-full px-3 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333]"
            >
              <option v-for="opt in fieldTypeOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-[13px] font-medium text-[#555] mb-1">위저드 스텝</label>
            <select
              v-model.number="newFieldWizardStep"
              class="w-full px-3 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333]"
            >
              <option v-for="opt in WIZARD_STEP_OPTIONS" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
            <p class="text-[11px] text-[#999] mt-1">앱에서 이 필드가 표시될 페이지</p>
          </div>

          <div>
            <label class="flex items-center">
              <input
                v-model="newField.is_required"
                type="checkbox"
                class="w-4 h-4 text-[#FF7B22] border-[#E8E8E8] rounded focus:ring-[#FF7B22]"
              />
              <span class="ml-2 text-[14px] text-[#555]">필수 입력</span>
            </label>
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <button
            @click="showAddModal = false"
            class="px-4 py-2.5 border border-[#E0E0E0] text-[#555] rounded-[12px] hover:bg-[#FAFAFA] transition-colors text-[14px]"
          >
            취소
          </button>
          <button
            @click="submitNewField"
            class="px-4 py-2.5 bg-[#FF7B22] text-white rounded-[12px] hover:bg-[#E56D1E] transition-colors text-[14px] font-medium"
          >
            추가
          </button>
        </div>
      </div>
    </div>

    <!-- 동의 체크 카테고리 선택 모달 -->
    <div v-if="showConsentCategoryModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-[16px] shadow-[0_0_20px_rgba(0,0,0,0.1)] w-80 p-6">
        <h3 class="text-[16px] font-semibold text-[#333] mb-2">동의 체크 추가</h3>
        <p class="text-[13px] text-[#888] mb-4">체크 표기할 동의 카테고리를 선택하세요.</p>

        <div class="space-y-2">
          <button
            v-for="cat in CONSENT_CATEGORIES"
            :key="cat.key"
            @click="createConsentMarker(cat.key)"
            class="w-full text-left p-3 border border-green-200 rounded-[12px] hover:bg-green-50 transition-colors"
          >
            <span class="text-[14px] font-medium text-green-700">{{ cat.label }}</span>
            <p class="text-[11px] text-[#999] mt-0.5">{{ cat.description }}</p>
          </button>
        </div>

        <button
          @click="showConsentCategoryModal = false"
          class="w-full mt-4 py-2 border border-[#E0E0E0] text-[#555] rounded-[12px] hover:bg-[#FAFAFA] transition-colors text-[14px]"
        >
          취소
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTemplateStore } from '../../stores/templateStore'
import { FIELD_TYPE_OPTIONS } from '@shared/types'
import type { FormField, FormPage, FieldOptions } from '@shared/types'

const route = useRoute()
const store = useTemplateStore()

const canvasRef = ref<HTMLElement | null>(null)
const saving = ref(false)
const showAddModal = ref(false)

const fieldTypeOptions = FIELD_TYPE_OPTIONS.filter(o => o.value !== 'consent')

const WIZARD_STEP_OPTIONS = [
  { value: 2, label: 'Step 2 — 청구 내용' },
  { value: 3, label: 'Step 3 — 계약자 정보' },
  { value: 4, label: 'Step 4 — 피보험자/수익자' },
  { value: 5, label: 'Step 5 — 계좌 정보' },
]

// 배치 모드 상태
const placingChoiceIndex = ref<number | null>(null)
const isDraggingChoice = ref(false)
const dragChoiceIndex = ref<number | null>(null)
const dragChoiceOffset = { x: 0, y: 0 }
const justFinishedDrag = ref(false)

// 드래그 상태
const isDragging = ref(false)
const isResizing = ref(false)
const dragTarget = ref<FormField | null>(null)
const dragOffset = { x: 0, y: 0 }
const resizeStart = { width: 0, height: 0, x: 0, y: 0 }

// 위저드 스텝 상태
const editWizardStep = ref(2)
const newFieldWizardStep = ref(2)

// 새 필드 폼
const newField = reactive({
  field_name: '',
  field_label: '',
  field_type: 'text' as FormField['field_type'],
  is_required: false,
})

// 편집 폼
const editForm = reactive({
  field_name: '',
  field_label: '',
  field_type: 'text' as FormField['field_type'],
  x_position: 0,
  y_position: 0,
  width: 200,
  height: 30,
  font_size: 12,
  font_color: '#000000',
  placeholder: '',
  is_required: false,
  field_options: null as FieldOptions | null,
})

// 선택된 필드 변경 감지
watch(() => store.selectedField, (field) => {
  if (field) {
    editForm.field_name = field.field_name
    editForm.field_label = field.field_label
    editForm.field_type = field.field_type
    editForm.x_position = field.x_position
    editForm.y_position = field.y_position
    editForm.width = field.width
    editForm.height = field.height
    editForm.font_size = field.font_size
    editForm.font_color = field.font_color
    editForm.placeholder = field.placeholder || ''
    editForm.is_required = field.is_required
    editForm.field_options = field.field_options
      ? JSON.parse(JSON.stringify(field.field_options))
      : null
    editWizardStep.value = field.field_options?.wizard_step || 2
  }
}, { immediate: true })

// field_type 변경 시 field_options 자동 초기화
watch(() => editForm.field_type, (newType) => {
  switch (newType) {
    case 'checkbox':
    case 'radio':
      editForm.field_options = { choices: [], check_font_size: 14 }
      break
    case 'consent':
      editForm.field_options = {
        choices: [
          { label: '동의함', value: 'agree', x: 0, y: 0 },
          { label: '동의안함', value: 'disagree', x: 0, y: 0 },
        ],
        consent_text: '',
        check_font_size: 14,
      }
      break
    case 'signature':
    default:
      editForm.field_options = null
      break
  }
})

function selectField(field: FormField) {
  store.selectField(field)
}

function selectPage(page: FormPage) {
  store.selectPage(page)
}

// 선택지 관리 헬퍼 함수
function addChoice() {
  if (!editForm.field_options) return
  if (!editForm.field_options.choices) editForm.field_options.choices = []
  editForm.field_options.choices.push({ label: '', value: '', x: 0, y: 0 })
}

function removeChoice(index: number) {
  if (!editForm.field_options?.choices) return
  editForm.field_options.choices.splice(index, 1)
}

function startPlacingChoice(index: number) {
  placingChoiceIndex.value = index
}

function cancelPlacing() {
  placingChoiceIndex.value = null
}

function handleCanvasClick(event: MouseEvent) {
  // 드래그 직후 click 이벤트 무시 (드래그 후 필드 선택 해제 방지)
  if (justFinishedDrag.value) {
    justFinishedDrag.value = false
    return
  }
  if (placingChoiceIndex.value !== null && canvasRef.value && editForm.field_options?.choices) {
    const rect = canvasRef.value.getBoundingClientRect()
    const x = Math.round(event.clientX - rect.left)
    const y = Math.round(event.clientY - rect.top)
    const choice = editForm.field_options.choices[placingChoiceIndex.value]
    if (choice) {
      choice.x = x
      choice.y = y
    }
    placingChoiceIndex.value = null
    return
  }
  store.selectField(null)
}

// 동의 체크 카테고리 선택 모달
const showConsentCategoryModal = ref(false)

const CONSENT_CATEGORIES = [
  { key: 'privacy', label: '개인정보 동의', description: '개인(신용)정보 처리 동의 체크 위치' },
  { key: 'sensitive', label: '민감정보 동의', description: '민감정보 및 고유식별정보 처리 동의 체크 위치' },
] as const

function handleAddConsentMarker() {
  if (!store.currentPage) {
    alert('페이지를 먼저 선택해주세요.')
    return
  }
  showConsentCategoryModal.value = true
}

async function createConsentMarker(category: 'privacy' | 'sensitive') {
  if (!store.currentPage) return

  // 전체 페이지에서 해당 카테고리 기존 개수로 번호 부여 (field_name 유니크 보장)
  const prefix = `consent_${category}`
  const allFields = store.sortedPages.flatMap(p => p.form_fields || [])
  const existingCount = allFields.filter(
    f => f.field_type === 'consent' && f.field_name.startsWith(prefix)
  ).length

  const num = existingCount + 1
  const categoryLabel = category === 'privacy' ? '개인정보' : '민감정보'

  try {
    await store.createField(Number(route.params.id), {
      field_name: `${prefix}_${num}`,
      field_label: `${categoryLabel} 동의 체크 ${num}`,
      field_type: 'consent',
      is_required: true,
      form_page_id: store.currentPage.form_page_id,
      x_position: 50,
      y_position: 50,
      width: 100,
      height: 30,
      font_size: 14,
      font_color: '#000000',
      field_options: {
        choices: [
          { label: '동의함', value: 'agree', x: 0, y: 0 },
          { label: '동의안함', value: 'disagree', x: 0, y: 0 },
        ],
        check_font_size: 14,
      },
    })
    showConsentCategoryModal.value = false
  } catch (e: any) {
    alert(e.response?.data?.message || '동의 체크 추가에 실패했습니다.')
  }
}

function handleAddField() {
  newField.field_name = ''
  newField.field_label = ''
  newField.field_type = 'text'
  newField.is_required = false
  newFieldWizardStep.value = 2
  showAddModal.value = true
}

async function submitNewField() {
  if (!newField.field_name || !newField.field_label) {
    alert('필드명과 라벨은 필수입니다.')
    return
  }

  if (!store.currentPage) {
    alert('페이지를 먼저 선택해주세요.')
    return
  }

  // 타입별 기본 field_options 설정
  let fieldOptions: FieldOptions | null = null
  switch (newField.field_type) {
    case 'checkbox':
    case 'radio':
      fieldOptions = { choices: [], check_font_size: 14, wizard_step: newFieldWizardStep.value }
      break
    case 'consent':
      fieldOptions = {
        choices: [
          { label: '동의함', value: 'agree', x: 0, y: 0 },
          { label: '동의안함', value: 'disagree', x: 0, y: 0 },
        ],
        consent_text: '',
        check_font_size: 14,
      }
      break
    default:
      fieldOptions = { wizard_step: newFieldWizardStep.value }
      break
  }

  try {
    await store.createField(Number(route.params.id), {
      ...newField,
      form_page_id: store.currentPage.form_page_id,
      x_position: 50,
      y_position: 50,
      width: 200,
      height: 30,
      font_size: 12,
      font_color: '#000000',
      field_options: fieldOptions,
    })
    showAddModal.value = false
  } catch (e: any) {
    alert(e.response?.data?.message || '필드 추가에 실패했습니다.')
  }
}

async function handleDeleteField(id: number) {
  if (!confirm('이 필드를 삭제하시겠습니까?')) return

  try {
    await store.deleteField(id)
  } catch (e: any) {
    alert(e.response?.data?.message || '필드 삭제에 실패했습니다.')
  }
}

async function applyFieldChanges() {
  if (!store.selectedField) return

  // 선택지의 빈 value를 label에서 자동 생성
  if (editForm.field_options?.choices) {
    for (const choice of editForm.field_options.choices) {
      if (!choice.value && choice.label) {
        choice.value = choice.label
      }
    }
  }

  // wizard_step을 field_options에 병합
  const mergedOptions: FieldOptions = {
    ...(editForm.field_options || {}),
  }
  if (editForm.field_type !== 'consent') {
    mergedOptions.wizard_step = editWizardStep.value
  }

  try {
    await store.updateField(store.selectedField.form_field_id, {
      ...editForm,
      field_options: mergedOptions,
    })
  } catch (e: any) {
    alert(e.response?.data?.message || '속성 적용에 실패했습니다.')
  }
}

async function handleSave() {
  saving.value = true
  try {
    await store.saveFieldPositions(Number(route.params.id))
    alert('저장되었습니다.')
  } catch (e: any) {
    alert(e.response?.data?.message || '저장에 실패했습니다.')
  } finally {
    saving.value = false
  }
}

// 페이지 관련 함수
async function handleAddPage() {
  try {
    const newPage = await store.createPage(Number(route.params.id))
    store.selectPage(newPage)
  } catch (e: any) {
    alert(e.response?.data?.message || '페이지 추가에 실패했습니다.')
  }
}

async function handleDeletePage(pageId: number) {
  if (!confirm('이 페이지와 모든 필드를 삭제하시겠습니까?')) return

  try {
    await store.deletePage(Number(route.params.id), pageId)
  } catch (e: any) {
    alert(e.response?.data?.message || '페이지 삭제에 실패했습니다.')
  }
}

async function handlePageImageUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file || !store.currentPage) return

  try {
    await store.uploadPageImage(Number(route.params.id), store.currentPage.form_page_id, file)
  } catch (e: any) {
    alert(e.response?.data?.message || '이미지 업로드에 실패했습니다.')
  }

  // input 초기화
  input.value = ''
}

// choice 마커 드래그 시작
function startChoiceDrag(event: MouseEvent, index: number) {
  if (!canvasRef.value || !editForm.field_options?.choices) return
  isDraggingChoice.value = true
  dragChoiceIndex.value = index
  const rect = canvasRef.value.getBoundingClientRect()
  const choice = editForm.field_options.choices[index]
  if (!choice) return
  dragChoiceOffset.x = event.clientX - rect.left - choice.x
  dragChoiceOffset.y = event.clientY - rect.top - choice.y
  event.preventDefault()
  event.stopPropagation()
}

// 드래그 시작
function startDrag(event: MouseEvent, field: FormField) {
  if (!canvasRef.value) return

  isDragging.value = true
  dragTarget.value = field

  const rect = canvasRef.value.getBoundingClientRect()
  dragOffset.x = event.clientX - rect.left - field.x_position
  dragOffset.y = event.clientY - rect.top - field.y_position

  store.selectField(field)
  event.preventDefault()
}

// 리사이즈 시작
function startResize(event: MouseEvent, field: FormField) {
  isResizing.value = true
  dragTarget.value = field
  resizeStart.width = field.width
  resizeStart.height = field.height
  resizeStart.x = event.clientX
  resizeStart.y = event.clientY
}

// 마우스 이동
function handleMouseMove(event: MouseEvent) {
  // choice 드래그 우선 처리
  if (isDraggingChoice.value && dragChoiceIndex.value !== null && canvasRef.value && editForm.field_options?.choices) {
    const rect = canvasRef.value.getBoundingClientRect()
    const x = event.clientX - rect.left - dragChoiceOffset.x
    const y = event.clientY - rect.top - dragChoiceOffset.y
    const dragChoice = editForm.field_options.choices[dragChoiceIndex.value]
    if (dragChoice) {
      dragChoice.x = Math.max(0, Math.round(x))
      dragChoice.y = Math.max(0, Math.round(y))
    }
    return
  }

  if (!dragTarget.value) return

  if (isDragging.value && canvasRef.value) {
    const rect = canvasRef.value.getBoundingClientRect()
    const x = event.clientX - rect.left - dragOffset.x
    const y = event.clientY - rect.top - dragOffset.y

    // 경계 체크
    const maxX = (store.currentPage?.image_width || 0) - dragTarget.value.width
    const maxY = (store.currentPage?.image_height || 0) - dragTarget.value.height

    const newX = Math.max(0, Math.min(maxX, x))
    const newY = Math.max(0, Math.min(maxY, y))

    store.updateFieldPosition(dragTarget.value.form_field_id, newX, newY)

    // 편집 폼도 업데이트
    if (store.selectedField?.form_field_id === dragTarget.value.form_field_id) {
      editForm.x_position = Math.round(newX)
      editForm.y_position = Math.round(newY)
    }
  }

  if (isResizing.value) {
    const deltaX = event.clientX - resizeStart.x
    const deltaY = event.clientY - resizeStart.y

    store.updateFieldSize(
      dragTarget.value.form_field_id,
      resizeStart.width + deltaX,
      resizeStart.height + deltaY
    )

    // 편집 폼도 업데이트
    if (store.selectedField?.form_field_id === dragTarget.value.form_field_id) {
      editForm.width = dragTarget.value.width
      editForm.height = dragTarget.value.height
    }
  }
}

// 마우스 릴리스
function handleMouseUp() {
  if (isDraggingChoice.value) {
    isDraggingChoice.value = false
    dragChoiceIndex.value = null
    justFinishedDrag.value = true
    return
  }
  if (isDragging.value || isResizing.value) {
    justFinishedDrag.value = true
  }
  isDragging.value = false
  isResizing.value = false
  dragTarget.value = null
}

onMounted(async () => {
  const templateId = Number(route.params.id)
  await store.fetchTemplate(templateId)
  await store.fetchPages(templateId)

  // 전역 마우스 이벤트 리스너
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
  store.selectField(null)
  store.selectPage(null)
})
</script>
