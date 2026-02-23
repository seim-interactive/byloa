import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from '../lib/firebase'
import { apiURL, API_ENDPOINTS } from '../lib/config'

const auth = getAuth()

// Global auth state (singleton)
let currentUser = ref(null)
let isAuthenticated = computed(() => !!currentUser.value)
let isLoading = ref(true)
let authInitialized = false

// Get admin emails from environment or backend
const getAdminEmails = async () => {
  try {
    const response = await fetch(apiURL(API_ENDPOINTS.ADMIN_EMAIL), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    
    if (!response.ok) {
      console.warn('Backend no disponible, no se pudieron obtener los emails admin')
      return []
    }
    
    const data = await response.json()
    if (data.success && data.adminEmails && Array.isArray(data.adminEmails)) {
      console.log('✅ Admin emails loaded:', data.adminEmails)
      return data.adminEmails
    }
    return []
  } catch (error) {
    console.error('❌ Error fetching admin emails:', error.message)
    return []
  }
}

// Validate if email is admin
const isAdminEmail = async (email) => {
  const adminEmails = await getAdminEmails()
  
  if (!adminEmails || adminEmails.length === 0) {
    console.warn('⚠️ No admin emails configured')
    return false
  }
  
  const normalizedInputEmail = email.toLowerCase().trim()
  console.log('Checking email:', normalizedInputEmail, 'against:', adminEmails)
  
  const isAdmin = adminEmails.some(adminEmail => 
    adminEmail.toLowerCase().trim() === normalizedInputEmail
  )
  
  console.log(`Email ${normalizedInputEmail} is admin:`, isAdmin)
  return isAdmin
}

// Initialize auth state on app load (only once)
export const initAuth = () => {
  return new Promise((resolve) => {
    if (authInitialized) {
      resolve(currentUser.value)
      return
    }

    onAuthStateChanged(auth, (user) => {
      currentUser.value = user
      isLoading.value = false
      authInitialized = true
      resolve(user)
    })
  })
}

export const useAuth = () => {
  const toast = useToast()
  const localLoading = ref(false)

  const login = async (email, password) => {
    try {
      localLoading.value = true
      
      // Validate if email is admin email
      const isAdmin = await isAdminEmail(email)
      if (!isAdmin) {
        toast.error('No tienes permisos para acceder a esta sección')
        throw new Error('Unauthorized email')
      }
      
      const result = await signInWithEmailAndPassword(auth, email, password)
      currentUser.value = result.user
      toast.success('¡Bienvenido!')
      return result.user
    } catch (error) {
      let message = 'Error al iniciar sesión'
      
      if (error.message === 'Unauthorized email') {
        message = 'No tienes permisos para acceder'
      } else if (error.code === 'auth/user-not-found') {
        message = 'Usuario no encontrado'
      } else if (error.code === 'auth/wrong-password') {
        message = 'Contraseña incorrecta'
      } else if (error.code === 'auth/invalid-email') {
        message = 'Email inválido'
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Demasiados intentos. Intenta más tarde'
      }
      
      if (message !== 'No tienes permisos para acceder') {
        toast.error(message)
      }
      throw error
    } finally {
      localLoading.value = false
    }
  }

  const logout = async () => {
    try {
      localLoading.value = true
      await signOut(auth)
      currentUser.value = null
      toast.success('Sesión cerrada')
    } catch (error) {
      toast.error('Error al cerrar sesión')
      throw error
    } finally {
      localLoading.value = false
    }
  }

  return {
    login,
    logout,
    currentUser,
    isAuthenticated,
    isLoading: localLoading
  }
}
