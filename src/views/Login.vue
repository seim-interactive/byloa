<template>
  <div class="login-container min-h-screen overflow-hidden relative flex items-center justify-center">
    <!-- Animated Background -->
    <div class="fixed inset-0 login-gradient pointer-events-none z-0"></div>

    <!-- Login Form -->
    <div class="relative z-10 w-full max-w-md px-4 sm:px-6">
      <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 sm:p-12 shadow-2xl">
        <!-- Header -->
        <div class="text-center mb-12">
          <img
            src="/logotipos_logotipodescriptorv1 negativo.png"
            alt="ByLoa"
            class="h-12 w-auto object-contain mx-auto mb-8"
          />
          <p class="text-white/60 text-base font-light" style="font-family: 'Cambria', sans-serif;">
            Administra tus proyectos
          </p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Email Input -->
          <div>
            <input
              v-model="email"
              type="email"
              placeholder="Correo electrónico"
              required
              :disabled="isLoading"
              class="w-full bg-white/15 backdrop-blur-md border border-white/30 rounded-full px-6 py-4 text-white placeholder-white/50 focus:outline-none focus:border-white/60 transition-all duration-300 text-base"
              style="font-family: 'COOLVETICA', sans-serif;"
            />
          </div>

          <!-- Password Input -->
          <div>
            <input
              v-model="password"
              type="password"
              placeholder="Contraseña"
              required
              :disabled="isLoading"
              class="w-full bg-white/15 backdrop-blur-md border border-white/30 rounded-full px-6 py-4 text-white placeholder-white/50 focus:outline-none focus:border-white/60 transition-all duration-300 text-base"
              style="font-family: 'COOLVETICA', sans-serif;"
            />
          </div>

          <!-- Sign In Button -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full py-4 bg-[#F0C9C7] text-white font-medium rounded-full hover:shadow-lg hover:shadow-[#F0C9C7]/30 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed text-base"
            style="font-family: 'COOLVETICA', sans-serif;"
          >
            {{ isLoading ? 'Cargando...' : 'Sign in' }}
          </button>
        </form>

        <!-- Footer Link -->
        <div class="text-center mt-8 pt-8 border-t border-white/10">
          <router-link
            to="/"
            class="text-[#F0C9C7] hover:text-white transition-colors text-sm font-light"
            style="font-family: 'cambria', sans-serif;"
          >
            ← Volver a inicio
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { login, isLoading } = useAuth()

const email = ref('')
const password = ref('')

const handleLogin = async () => {
  try {
    await login(email.value, password.value)
    // Redirect to admin after successful login
    router.push('/admin')
  } catch (error) {
    console.error('Login error:', error)
  }
}
</script>

<style scoped>
.login-container {
  font-family: 'COOLVETICA', 'Cambria', sans-serif;
}

.login-gradient {
  background:
    /* Gradiente principal - Rose */
    radial-gradient(
      ellipse 100% 90% at 50% 10%,
      rgba(240, 201, 199, 0.20) 0%,
      transparent 40%
    ),

    /* Rose secundario - izquierda */
    radial-gradient(
      ellipse 80% 70% at 10% 60%,
      rgba(240, 201, 199, 0.14) 0%,
      transparent 50%
    ),

    /* Rose sutil - derecha */
    radial-gradient(
      ellipse 70% 60% at 90% 70%,
      rgba(240, 201, 199, 0.08) 0%,
      transparent 50%
    ),

    /* Fondo oscuro */
    linear-gradient(
      180deg,
      #1A1A1A 0%,
      #000000 50%,
      #1A1A1A 100%
    );
}



/* Input focus animation */
input:focus {
  box-shadow: 0 0 0 2px rgba(240, 201, 199, 0.4);
}

/* Button hover effect */
button:hover:not(:disabled) {
  transform: translateY(-2px);
}
</style>
