import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import ToastService from 'primevue/toastservice'
import DialogService from 'primevue/dialogservice'
import 'primeicons/primeicons.css'
import Tooltip from 'primevue/tooltip'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.directive('tooltip', Tooltip)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: false,
    },
  },
})
app.use(ToastService)
app.use(DialogService)

app.mount('#app')
