import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import { vMagnetic } from './directives/magnetic'

const app = createApp(App)

// Register Vue Toastification
app.use(Toast, {
  position: 'top-right',
  timeout: 1500,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false,
  zIndex:99999,
  containerClassName: 'fixed top-4 right-4'
})

// Register ClientOnly component globally
app.component('ClientOnly', {
  setup(_, { slots }) {
    return () => slots.default?.()
  }
})

app.directive('magnetic', vMagnetic)
app.use(router)

// Wait for router to be ready before mounting
router.isReady().then(() => {
  app.mount('#app')
})
