import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import '@shared/styles/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

// 앱(Android/iOS)에서 FCM 딥링크 처리
// AndroidBridge에서 evaluateJavascript("window.__handleDeepLink('/customers/C0000001')") 형태로 호출
function handleDeepLink(path: string): void {
  if (path) {
    router.push(path)
  }
}

;(window as unknown as Record<string, unknown>).__handleDeepLink = handleDeepLink
