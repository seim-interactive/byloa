<template>
  <div class="admin-panel min-h-screen relative">
    <!-- Animated Background -->
    <div class="fixed inset-0 hero-gradient pointer-events-none z-0"></div>

    <!-- Navigation Bar -->
    <nav class="fixed top-0 left-0 right-0 z-50 border-b border-white/10 backdrop-blur-md bg-black/30">
      <div class="max-w-7xl mx-auto px-8 sm:px-12 lg:px-20 py-6 flex items-center justify-between">
        <img
          src="/public/logotipos_logotipodescriptorv1 negativo.png"
          alt="ByLoa Admin"
          class="h-8 w-auto object-contain"
        />
        <div class="flex items-center gap-4">
          <span  @click="scrollToSection(projectsSection)" class="text-white/70 hover:text-white transition-colors disabled:opacity-50 cursor-pointer">Proyectos</span>
          <span  @click="scrollToSection(brandsSection)" class="text-white/70 hover:text-white transition-colors disabled:opacity-50 
          cursor-pointer">Marcas</span>
        </div>
        <div class="flex items-center gap-4">
          <button
            @click="handleLogout"
            :disabled="isLoading"
            class="text-sm text-white/70 hover:text-white transition-colors disabled:opacity-50"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <div ref="projectsSection"  class="relative z-10 max-w-7xl mx-auto px-8 sm:px-12 lg:px-20 pt-32 sm:pt-40 overflow-hidden"">
      <!-- Header -->
      <div class="mb-16 sm:mb-20">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-8 h-px bg-white/20"></div>
          <span class="section-label text-sm uppercase tracking-widest text-white/50 font-light" style="font-family: 'COOLVETICA', sans-serif;">Gestión</span>
        </div>
        <h2 class="section-title text-start ml-0">
          Proyectos <span class="font-coolvetica">destacados</span>
        </h2>
        <p class="text-lg sm:text-xl text-white/70 font-light leading-relaxed max-w-2xl" style="font-family: 'Cambria', serif;">
          Carga proyectos con imagen o video y asigna un enlace de destino. Estos aparecerán en el carrusel principal de la web.
        </p>
      </div>

      <!-- Projects Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16 sm:mb-20">
        <!-- Add Project Card -->
        <div 
          @click="showAddForm = true"
          class="lg:col-span-1 group cursor-pointer"
        >
          <div class="h-72 sm:h-96 bg-linear-to-br from-white/5 to-white/10 rounded-2xl border border-white/20 hover:border-white/40 transition-all duration-300 flex items-center justify-center overflow-hidden relative">
            <!-- Animated gradient on hover -->
            <div class="absolute inset-0 bg-linear-to-br from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div class="relative z-10 text-center">
              <div class="text-4xl text-white/60 group-hover:text-white transition-colors mb-3">+</div>
              <p class="text-lg text-white/60 group-hover:text-white transition-colors font-light">Nuevo proyecto</p>
            </div>
          </div>
        </div>

        <!-- Existing Projects -->
        <div 
          v-for="(project, idx) in projects" 
          :key="idx"
          class="group relative"
        >
          <div class="h-72 sm:h-96 bg-black rounded-2xl border border-white/20 group-hover:border-white/40 transition-all duration-300 overflow-hidden relative">
            <!-- Media Preview -->
            <img 
              v-if="project.type === 'image'"
              :src="project.media" 
              :alt="project.title"
              class="w-full h-full object-cover"
            />
            <video 
              v-else-if="project.type === 'video'"
              :src="project.media"
              class="w-full h-full object-cover"
              muted
              loop
              autoplay
              playsinline
            />

            <!-- Overlay -->
            <div class="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 md:opacity-0"></div>

            <!-- Actions -->
            <div class="absolute inset-0 flex items-end p-4 sm:p-6 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div class="flex gap-3 w-full">
                <button
                  @click="editProject(idx)"
                  class="flex-1 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-white/90 transition-all"
                >
                  Editar
                </button>
                <button
                  @click="openDeleteModal(idx)"
                  class="flex-1 py-2 bg-white/10 text-white text-sm font-medium rounded-lg hover:bg-white/20 transition-all"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Trusted Brands Section -->
      <div  ref="brandsSection" class="mb-16 sm:mb-20 mt-20 sm:mt-28 pt-20 sm:pt-28 border-t border-white/10">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-8 h-px bg-white/20"></div>
          <span class="section-label text-sm uppercase tracking-widest text-white/50 font-light" style="font-family: 'COOLVETICA', sans-serif;">Marcas</span>
        </div>
        <h2 class="section-title text-start ml-0">
          Marcas <span class="font-coolvetica">confiables</span>
        </h2>
        <p class="text-lg sm:text-xl text-white/70 font-light leading-relaxed max-w-2xl" style="font-family: 'Cambria', serif;">
          Carga los logos de las marcas confiables que se mostrarán en la web. Las imágenes se almacenan en Firebase Storage.
        </p>
      </div>

      <!-- Trusted Brands Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16 sm:mb-20">
        <!-- Add Brand Card -->
        <div 
          @click="showAddBrandForm = true"
          class="lg:col-span-1 group cursor-pointer"
        >
          <div class="h-48 sm:h-56 bg-linear-to-br from-white/5 to-white/10 rounded-2xl border border-white/20 hover:border-white/40 transition-all duration-300 flex items-center justify-center overflow-hidden relative">
            <!-- Animated gradient on hover -->
            <div class="absolute inset-0 bg-linear-to-br from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div class="relative z-10 text-center">
              <div class="text-4xl text-white/60 group-hover:text-white transition-colors mb-3">+</div>
              <p class="text-lg text-white/60 group-hover:text-white transition-colors font-light">Nuevo logo</p>
            </div>
          </div>
        </div>

        <!-- Existing Brands -->
        <div 
          v-for="(brand, idx) in trustedBrands" 
          :key="idx"
          class="group relative"
        >
          <div class="h-48 sm:h-56 bg-black rounded-2xl border border-white/20 group-hover:border-white/40 transition-all duration-300 overflow-hidden relative flex items-center justify-center p-4">
            <!-- Logo Preview -->
            <img 
              :src="brand.logo_url" 
              :alt="brand.name"
              class="max-w-full max-h-full object-contain"
            />

            <!-- Overlay -->
            <div class="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 md:opacity-0"></div>

            <!-- Actions -->
            <div class="absolute inset-0 flex items-end p-4 sm:p-6 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div class="flex gap-3 w-full">
                <button
                  @click="editBrand(idx)"
                  class="flex-1 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-white/90 transition-all"
                >
                  Editar
                </button>
                <button
                  @click="openDeleteBrandModal(idx)"
                  class="flex-1 py-2 bg-white/10 text-white text-sm font-medium rounded-lg hover:bg-white/20 transition-all"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Form Modal -->
    <transition
      @enter="enterForm"
      @leave="leaveForm"
    >
      <div 
        v-if="showAddForm"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <!-- Backdrop -->
        <div 
          class="absolute inset-0 bg-black/60 backdrop-blur-xl"
          @click="closForm"
        ></div>

        <!-- Form -->
        <div class="relative z-10 w-full max-w-lg">
          <div class="bg-linear-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <!-- Header -->
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-2xl sm:text-3xl font-light text-white" style="font-family: 'COOLVETICA', sans-serif; letter-spacing: -0.02em; line-height: 1.1;">
                {{ editingIdx !== null ? 'Editar' : 'Nuevo' }} <span class="font-coolvetica">proyecto</span>
              </h3>
              <button
                @click="closForm"
                class="text-white/60 hover:text-white transition-colors text-2xl"
              >
                ✕
              </button>
            </div>

            <!-- Form Fields -->
            <div class="space-y-4">
              <!-- Title -->
              <div>
                <label class="block text-xs uppercase tracking-widest text-white/50 font-light mb-2" style="font-family: 'COOLVETICA', sans-serif;">Título</label>
                <input
                  v-model="formData.title"
                  type="text"
                  placeholder="Nombre del proyecto"
                  class="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/30 focus:outline-none focus:border-white/40 transition-colors text-sm"
                  style="font-family: 'COOLVETICA', sans-serif;"
                />
              </div>

              <!-- Media Upload -->
              <div>
                <label class="block text-xs uppercase tracking-widest text-white/50 font-light mb-2" style="font-family: 'COOLVETICA', sans-serif;">
                  Imagen o Video
                </label>
                <div class="relative">
                  <input
                    type="file"
                    @change="handleMediaUpload"
                    accept="image/*,video/*"
                    class="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div class="w-full bg-white/5 border-2 border-dashed border-white/20 rounded-lg px-3 py-5 text-center hover:border-white/40 transition-colors cursor-pointer">
                    <p v-if="!formData.media" class="text-sm text-white/60 font-light" style="font-family: 'COOLVETICA', sans-serif;">
                      Arrastra o haz click
                    </p>
                    <p v-else class="text-sm text-white/80 font-light" style="font-family: 'COOLVETICA', sans-serif;">
                      📁 {{ formData.mediaName }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Link -->
              <div>
                <label class="block text-xs uppercase tracking-widest text-white/50 font-light mb-2" style="font-family: 'COOLVETICA', sans-serif;">Enlace de destino</label>
                <input
                  v-model="formData.link"
                  type="url"
                  placeholder="https://ejemplo.com"
                  class="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/30 focus:outline-none focus:border-white/40 transition-colors text-sm"
                  style="font-family: 'COOLVETICA', sans-serif;"
                />
              </div>

              <!-- Media Preview -->
              <div v-if="formData.media" class="rounded-lg overflow-hidden border border-white/20">
                <img 
                  v-if="formData.type === 'image'"
                  :src="formData.media"
                  alt="Preview"
                  class="w-full h-32 object-cover"
                />
                <video 
                  v-else
                  :src="formData.media"
                  class="w-full h-32 object-cover"
                  controls
                  autoplay
                  playsinline
                />
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-3 mt-6">
              <button
                @click="saveProject"
                :disabled="isUploading"
                class="flex-1 py-2 bg-white text-black font-medium rounded-lg hover:bg-white/90 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                style="font-family: 'COOLVETICA', sans-serif;"
              >
                {{ isUploading ? 'Subiendo...' : (editingIdx !== null ? 'Actualizar' : 'Crear') }} proyecto
              </button>
              <button
                @click="closForm"
                class="flex-1 py-2 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-all text-sm"
                style="font-family: 'COOLVETICA', sans-serif;"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Delete Confirmation Modal -->
    <transition>
      <div 
        v-if="showDeleteModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <!-- Backdrop -->
        <div 
          class="absolute inset-0 bg-black/60 backdrop-blur-xl"
          @click="cancelDelete"
        ></div>

        <!-- Modal -->
        <div class="relative z-10 w-full max-w-md">
          <div class="bg-linear-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-8">
            <!-- Icon -->
            <div class="flex justify-center mb-6">
              <div class="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                <span class="text-3xl">⚠️</span>
              </div>
            </div>

            <!-- Title -->
            <h3 class="text-4xl font-light text-white text-center mb-3" style="font-family: 'COOLVETICA', sans-serif; letter-spacing: -0.02em; line-height: 1.1;">
              ¿Eliminar proyecto?
            </h3>

            <!-- Message -->
            <p class="text-white/70 text-center mb-8 font-light text-lg" style="font-family: 'COOLVETICA', sans-serif;">
              Esta acción no se puede deshacer. El proyecto será eliminado permanentemente.
            </p>

            <!-- Actions -->
            <div class="flex gap-4">
              <button
                @click="confirmDelete"
                class="flex-1 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-all text-base"
                style="font-family: 'COOLVETICA', sans-serif;"
              >
                Eliminar
              </button>
              <button
                @click="cancelDelete"
                class="flex-1 py-3 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-all text-base"
                style="font-family: 'COOLVETICA', sans-serif;"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Brand Form Modal -->
    <transition
      @enter="enterForm"
      @leave="leaveForm"
    >
      <div 
        v-if="showAddBrandForm"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <!-- Backdrop -->
        <div 
          class="absolute inset-0 bg-black/60 backdrop-blur-xl"
          @click="closeBrandForm"
        ></div>

        <!-- Form -->
        <div class="relative z-10 w-full max-w-lg">
          <div class="bg-linear-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <!-- Header -->
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-2xl sm:text-3xl font-light text-white" style="font-family: 'COOLVETICA', sans-serif; letter-spacing: -0.02em; line-height: 1.1;">
                {{ editingBrandIdx !== null ? 'Editar' : 'Nuevo' }} <span class="font-coolvetica">logo</span>
              </h3>
              <button
                @click="closeBrandForm"
                class="text-white/60 hover:text-white transition-colors text-2xl"
              >
                ✕
              </button>
            </div>

            <!-- Form Fields -->
            <div class="space-y-4">
              <!-- Name -->
              <div>
                <label class="block text-xs uppercase tracking-widest text-white/50 font-light mb-2" style="font-family: 'COOLVETICA', sans-serif;">Nombre de la marca</label>
                <input
                  v-model="brandFormData.name"
                  type="text"
                  placeholder="Ej: Google, Microsoft, etc."
                  class="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/30 focus:outline-none focus:border-white/40 transition-colors text-sm"
                  style="font-family: 'COOLVETICA', sans-serif;"
                />
              </div>

              <!-- Logo Upload -->
              <div>
                <label class="block text-xs uppercase tracking-widest text-white/50 font-light mb-2" style="font-family: 'COOLVETICA', sans-serif;">
                  Logo
                </label>
                <div class="relative">
                  <input
                    type="file"
                    @change="handleBrandLogoUpload"
                    accept="image/*"
                    class="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div class="w-full bg-white/5 border-2 border-dashed border-white/20 rounded-lg px-3 py-5 text-center hover:border-white/40 transition-colors cursor-pointer">
                    <p v-if="!brandFormData.logo" class="text-sm text-white/60 font-light" style="font-family: 'COOLVETICA', sans-serif;">
                      Arrastra o haz click
                    </p>
                    <p v-else class="text-sm text-white/80 font-light" style="font-family: 'COOLVETICA', sans-serif;">
                      📁 {{ brandFormData.logoName }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Logo Preview -->
              <div v-if="brandFormData.logo" class="rounded-lg overflow-hidden border border-white/20 flex items-center justify-center bg-white/5 p-3" style="height: 100px;">
                <img 
                  :src="brandFormData.logo"
                  alt="Preview"
                  class="max-w-full max-h-full object-contain"
                />
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-3 mt-6">
              <button
                @click="saveBrand"
                :disabled="isUploadingBrand"
                class="flex-1 py-2 bg-white text-black font-medium rounded-lg hover:bg-white/90 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                style="font-family: 'COOLVETICA', sans-serif;"
              >
                {{ isUploadingBrand ? 'Subiendo...' : (editingBrandIdx !== null ? 'Actualizar' : 'Crear') }} logo
              </button>
              <button
                @click="closeBrandForm"
                class="flex-1 py-2 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-all text-sm"
                style="font-family: 'COOLVETICA', sans-serif;"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Delete Brand Confirmation Modal -->
    <transition>
      <div 
        v-if="showDeleteBrandModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <!-- Backdrop -->
        <div 
          class="absolute inset-0 bg-black/60 backdrop-blur-xl"
          @click="cancelDeleteBrand"
        ></div>

        <!-- Modal -->
        <div class="relative z-10 w-full max-w-md">
          <div class="bg-linear-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-8">
            <!-- Icon -->
            <div class="flex justify-center mb-6">
              <div class="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                <span class="text-3xl">⚠️</span>
              </div>
            </div>

            <!-- Title -->
            <h3 class="text-4xl font-light text-white text-center mb-3" style="font-family: 'COOLVETICA', sans-serif; letter-spacing: -0.02em; line-height: 1.1;">
              ¿Eliminar logo?
            </h3>

            <!-- Message -->
            <p class="text-white/70 text-center mb-8 font-light text-lg" style="font-family: 'COOLVETICA', sans-serif;">
              Esta acción no se puede deshacer. El logo será eliminado permanentemente.
            </p>

            <!-- Actions -->
            <div class="flex gap-4">
              <button
                @click="confirmDeleteBrand"
                class="flex-1 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-all text-base"
                style="font-family: 'COOLVETICA', sans-serif;"
              >
                Eliminar
              </button>
              <button
                @click="cancelDeleteBrand"
                class="flex-1 py-3 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-all text-base"
                style="font-family: 'COOLVETICA', sans-serif;"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import gsap from 'gsap'
import { useToast } from 'vue-toastification'
import { useAuth } from '../composables/useAuth'
import { projects, updateProject, deleteProject as deleteFromStore, fetchProjects, isLoading, error } from '../store/projects'
import { apiURL, API_ENDPOINTS } from '../lib/config'
const projectsSection = ref(null)
const brandsSection = ref(null)

const scrollToSection = (section) => {
  section?.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  })
}


const router = useRouter()
const toast = useToast()
const { logout, currentUser, isLoading: authLoading } = useAuth()

const handleLogout = async () => {
  try {
    await logout()
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
  }
}

// Projects
const showAddForm = ref(false)
const editingIdx = ref(null)
const showDeleteModal = ref(false)
const deleteConfirmIdx = ref(null)
const isUploading = ref(false)
const formData = ref({
  title: '',
  type: '',
  media: '',
  mediaName: '',
  link: ''
})

// Trusted Brands
const trustedBrands = ref([])
const showAddBrandForm = ref(false)
const editingBrandIdx = ref(null)
const showDeleteBrandModal = ref(false)
const deleteBrandIdx = ref(null)
const isUploadingBrand = ref(false)
const brandFormData = ref({
  name: '',
  logo: '',
  logoName: ''
})

// Cargar marcas confiables
const fetchTrustedBrands = async () => {
  try {
    const response = await fetch(apiURL(API_ENDPOINTS.TRUSTED_BRANDS))
    const result = await response.json()
    if (result.success) {
      trustedBrands.value = result.data
    }
  } catch (error) {
    console.error('Error fetching trusted brands:', error)
  }
}

const handleMediaUpload = (e) => {
  const file = e.target.files[0]
  if (file) {
    formData.value.mediaName = file.name
    formData.value.type = file.type.startsWith('image') ? 'image' : 'video'
    
    const reader = new FileReader()
    reader.onload = (event) => {
      formData.value.media = event.target.result
      formData.value.isUploading = false
    }
    reader.readAsDataURL(file)
  }
}

const handleBrandLogoUpload = (e) => {
  const file = e.target.files[0]
  if (file) {
    brandFormData.value.logoName = file.name
    
    const reader = new FileReader()
    reader.onload = (event) => {
      brandFormData.value.logo = event.target.result
    }
    reader.readAsDataURL(file)
  }
}

const uploadMediaToFirebase = async (dataUrl, type, fileName) => {
  try {
    isUploading.value = true
    const response = await fetch(apiURL(API_ENDPOINTS.UPLOAD), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataUrl, type, fileName })
    })

    const result = await response.json()
    if (result.success) {
      return result.data.mediaUrl
    } else {
      throw new Error(result.error)
    }
  } catch (error) {
    throw new Error(`Upload error: ${error.message}`)
  } finally {
    isUploading.value = false
  }
}

const uploadBrandLogoToFirebase = async (dataUrl, fileName) => {
  try {
    isUploadingBrand.value = true
    const response = await fetch(apiURL(API_ENDPOINTS.BRAND_UPLOAD), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataUrl, fileName })
    })

    const result = await response.json()
    if (result.success) {
      return result.data.logoUrl
    } else {
      throw new Error(result.error)
    }
  } catch (error) {
    throw new Error(`Upload error: ${error.message}`)
  } finally {
    isUploadingBrand.value = false
  }
}

const saveProject = async () => {
  if (!formData.value.title || !formData.value.media || !formData.value.link) {
    toast.error('Por favor completa todos los campos')
    return
  }

  try {
    // Subir a Firebase Storage si es una nueva imagen (starts with data:)
    let mediaUrl = formData.value.media
    if (formData.value.media.startsWith('data:')) {
      mediaUrl = await uploadMediaToFirebase(
        formData.value.media,
        formData.value.type,
        formData.value.mediaName
      )
    }

    const payload = {
      title: formData.value.title,
      type: formData.value.type,
      media: mediaUrl,
      link: formData.value.link
    }

    if (editingIdx.value !== null) {
      // Actualizar proyecto
      const projectId = projects.value[editingIdx.value].id
      const response = await fetch(apiURL(API_ENDPOINTS.PROJECT(projectId)), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const result = await response.json()
      if (result.success) {
        toast.success('Proyecto actualizado')
        await fetchProjects() // Recargar proyectos
      } else {
        toast.error('Error al actualizar: ' + result.error)
      }
    } else {
      // Crear proyecto
      const response = await fetch(apiURL(API_ENDPOINTS.PROJECTS), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const result = await response.json()
      if (result.success) {
        toast.success('Proyecto creado')
        await fetchProjects() // Recargar proyectos
      } else {
        toast.error('Error al crear: ' + result.error)
      }
    }

    closForm()
  } catch (error) {
    toast.error('Error: ' + error.message)
    console.error(error)
  }
}

const saveBrand = async () => {
  if (!brandFormData.value.name || !brandFormData.value.logo) {
    toast.error('Por favor completa todos los campos')
    return
  }

  try {
    // Subir a Firebase Storage si es una nueva imagen (starts with data:)
    let logoUrl = brandFormData.value.logo
    if (brandFormData.value.logo.startsWith('data:')) {
      logoUrl = await uploadBrandLogoToFirebase(
        brandFormData.value.logo,
        brandFormData.value.logoName
      )
    }

    const payload = {
      name: brandFormData.value.name,
      logo_url: logoUrl
    }

    if (editingBrandIdx.value !== null) {
      // Actualizar marca
      const brandId = trustedBrands.value[editingBrandIdx.value].id
      const response = await fetch(apiURL(API_ENDPOINTS.TRUSTED_BRAND(brandId)), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const result = await response.json()
      if (result.success) {
        toast.success('Logo actualizado')
        await fetchTrustedBrands() // Recargar marcas
      } else {
        toast.error('Error al actualizar: ' + result.error)
      }
    } else {
      // Crear marca
      const response = await fetch(apiURL(API_ENDPOINTS.TRUSTED_BRANDS), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const result = await response.json()
      if (result.success) {
        toast.success('Logo creado')
        await fetchTrustedBrands() // Recargar marcas
      } else {
        toast.error('Error al crear: ' + result.error)
      }
    }

    closeBrandForm()
  } catch (error) {
    toast.error('Error: ' + error.message)
    console.error(error)
  }
}

const editProject = (idx) => {
  editingIdx.value = idx
  formData.value = { ...projects.value[idx] }
  showAddForm.value = true
}

const editBrand = (idx) => {
  editingBrandIdx.value = idx
  brandFormData.value = { 
    name: trustedBrands.value[idx].name,
    logo: trustedBrands.value[idx].logo_url,
    logoName: ''
  }
  showAddBrandForm.value = true
}

const openDeleteModal = (idx) => {
  deleteConfirmIdx.value = idx
  showDeleteModal.value = true
}

const openDeleteBrandModal = (idx) => {
  deleteBrandIdx.value = idx
  showDeleteBrandModal.value = true
}

const confirmDelete = async () => {
  const idx = deleteConfirmIdx.value
  try {
    const projectId = projects.value[idx].id
    const response = await fetch(apiURL(API_ENDPOINTS.PROJECT(projectId)), {
      method: 'DELETE'
    })

    const result = await response.json()
    if (result.success) {
      toast.success('Proyecto eliminado')
      await fetchProjects() // Recargar proyectos
    } else {
      toast.error('Error al eliminar: ' + result.error)
    }
  } catch (error) {
    toast.error('Error: ' + error.message)
    console.error(error)
  } finally {
    showDeleteModal.value = false
    deleteConfirmIdx.value = null
  }
}

const confirmDeleteBrand = async () => {
  const idx = deleteBrandIdx.value
  try {
    const brandId = trustedBrands.value[idx].id
    const response = await fetch(apiURL(API_ENDPOINTS.TRUSTED_BRAND(brandId)), {
      method: 'DELETE'
    })

    const result = await response.json()
    if (result.success) {
      toast.success('Logo eliminado')
      await fetchTrustedBrands() // Recargar marcas
    } else {
      toast.error('Error al eliminar: ' + result.error)
    }
  } catch (error) {
    toast.error('Error: ' + error.message)
    console.error(error)
  } finally {
    showDeleteBrandModal.value = false
    deleteBrandIdx.value = null
  }
}

const cancelDelete = () => {
  showDeleteModal.value = false
  deleteConfirmIdx.value = null
}

const cancelDeleteBrand = () => {
  showDeleteBrandModal.value = false
  deleteBrandIdx.value = null
}

const closForm = () => {
  showAddForm.value = false
  editingIdx.value = null
  formData.value = {
    title: '',
    type: '',
    media: '',
    mediaName: '',
    link: ''
  }
}

const closeBrandForm = () => {
  showAddBrandForm.value = false
  editingBrandIdx.value = null
  brandFormData.value = {
    name: '',
    logo: '',
    logoName: ''
  }
}

// Cargar datos al montar el componente
onMounted(() => {
  fetchProjects()
  fetchTrustedBrands()
})

const enterForm = (el, done) => {
  const tl = gsap.timeline({ onComplete: done })
  
  tl.fromTo(
    el.querySelector('.absolute.inset-0'),
    { opacity: 0 },
    { opacity: 1, duration: 0.4, ease: 'power2.out' },
    0
  )
  
  tl.fromTo(
    el.querySelector('.relative.z-10'),
    { opacity: 0, scale: 0.95, y: 20 },
    { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'back.out' },
    0.1
  )
}

const leaveForm = (el, done) => {
  const tl = gsap.timeline({ onComplete: done })
  
  tl.to(el.querySelector('.relative.z-10'), {
    opacity: 0,
    scale: 0.95,
    y: 20,
    duration: 0.3,
    ease: 'power2.in'
  })

  tl.to(
    el.querySelector('.absolute.inset-0'),
    { opacity: 0, duration: 0.3, ease: 'power2.in' },
    0
  )
}
</script>

<style scoped>
.admin-panel {
  font-family: 'COOLVETICA', 'Cambria', sans-serif;
}

.hero-gradient {
  background: 
    /* Rosa/Rosa principal - ByLoa */
    radial-gradient(ellipse 90% 80% at 70% 15%, rgba(252, 148, 199, 0.12) 0%, transparent 45%),
    radial-gradient(ellipse 70% 60% at 85% 25%, rgba(244, 110, 187, 0.1) 0%, transparent 50%),
    /* Rosa secundario - lado izquierdo */
    radial-gradient(ellipse 80% 70% at 15% 70%, rgba(252, 148, 199, 0.08) 0%, transparent 50%),
    /* Beige sutil - fondo */
    radial-gradient(ellipse 60% 50% at 50% 50%, rgba(245, 242, 237, 0.02) 0%, transparent 60%),
    /* Degradado de fondo - predominante negro */
    linear-gradient(180deg, #000000 0%, #0a0a0a 30%, #1a1a1a 70%, #000000 100%);
}

.section-label {
  display: inline-block;
}

.section-title {
  font-family: 'COOLVETICA', sans-serif;
  font-size: clamp(3rem, 8vw, 5rem);
  font-weight: 400;
  color: #fff;
  letter-spacing: -0.02em;
  line-height: 1.1;
  margin-top: 1rem;
}

/* Smooth scroll para inputs */
input {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

input:focus {
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
}
</style>
