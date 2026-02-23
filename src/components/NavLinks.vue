<template>
  <nav 
    :class="[
      'fixed top-0 left-0 right-0 flex items-center justify-between px-8 sm:px-12 lg:px-20 py-6 transition-all duration-500 ease-out',
      isScrolled 
        ? 'bg-black/40 backdrop-blur-md border-b border-white/10' 
        : 'bg-transparent'
    ]"
    style="z-index: 999999 !important"
  >
    <!-- Left: Logo -->
    <div class="text-2xl font-coolvetica font-bold text-white">
      <img src="/logotipos_logotipodescriptorv2 negativo.png" alt="ByLoa Agency" class="h-10 w-auto opacity-90">
    </div>

    <!-- Center: Navigation Links - Desktop Only -->
    <div class="hidden lg:flex items-center gap-25 text-sm">
      <a 
        href="#home" 
        @click.prevent="scrollToSection('#home')"
        class="flex items-center gap-2 transition-colors"
        :class="activeSection === 'home' ? 'text-white' : 'text-gray-400 hover:text-gray-300'"
      >
        <span v-if="activeSection === 'home'" class="text-white">•</span>
        <span>Home</span>
      </a>
      <a 
        href="#about" 
        @click.prevent="scrollToSection('#about')"
        class="flex items-center gap-2 transition-colors"
        :class="activeSection === 'about' ? 'text-white' : 'text-gray-400 hover:text-gray-300'"
      >
        <span v-if="activeSection === 'about'" class="text-white">•</span>
        <span>Nosotros</span>
      </a>
      <a 
        href="#services" 
        @click.prevent="scrollToSection('#services')"
        class="flex items-center gap-2 transition-colors"
        :class="activeSection === 'services' ? 'text-white' : 'text-gray-400 hover:text-gray-300'"
      >
        <span v-if="activeSection === 'services'" class="text-white">•</span>
        <span>Servicios</span>
      </a>
      <a 
        href="#process" 
        @click.prevent="scrollToSection('#process')"
        class="flex items-center gap-2 transition-colors"
        :class="activeSection === 'process' ? 'text-white' : 'text-gray-400 hover:text-gray-300'"
      >
        <span v-if="activeSection === 'process'" class="text-white">•</span>
        <span>Proceso</span>
      </a>
    </div>

    <!-- Right Side Navigation - Desktop Only -->
    <div class="hidden lg:flex items-center gap-8 text-sm">
      <a 
        href="#contact" 
        @click.prevent="scrollToSection('#contact')"
        class="px-6 py-2 bg-white text-gray-900 font-medium rounded-full hover:bg-gray-100 transition"
      >
        Contactar
      </a>
    </div>

    <!-- Mobile Menu Button -->
    <button 
      @click="toggleMobileMenu"
      class="lg:hidden flex flex-col gap-1.5 focus:outline-none relative w-6 h-6 items-center justify-center"
      aria-label="Toggle menu"
    >
      <!-- Hamburger Lines (hidden when menu is open) -->
      <div 
        :class="['w-6 h-0.5 bg-[#F2F0E3] transition-all duration-500 absolute', {
          'opacity-0': isMenuOpen
        }]"
        style="top: 2px"
      ></div>
      <div 
        :class="['w-6 h-0.5 bg-[#F2F0E3] transition-all duration-500 absolute', {
          'opacity-0': isMenuOpen
        }]"
        style="top: 50%; transform: translateY(-50%)"
      ></div>
      <div 
        :class="['w-6 h-0.5 bg-[#F2F0E3] transition-all duration-500 absolute', {
          'opacity-0': isMenuOpen
        }]"
        style="bottom: 2px"
      ></div>

      <!-- Logo (shown when menu is open) -->
      <img 
        src="/logotipos_reduccionv2 negativo.png"
        alt="Close menu"
        :class="['w-12 h-auto absolute transition-all duration-500', {
          'opacity-100 rotate-0': isMenuOpen,
          'opacity-0 -rotate-90': !isMenuOpen
        }]"
      />
    </button>
  </nav>

  <!-- Mobile Menu Overlay -->
  <transition
    @enter="enterMenu"
    @leave="leaveMenu"
  >
    <div 
      v-if="isMenuOpen"
      class="fixed inset-0 lg:hidden"
      style="z-index: 999998 !important"
      @click.self="closeMobileMenu"
    >
      <!-- Glassmorphism Background -->
      <div class="absolute inset-0 bg-black/60 backdrop-blur-xl"></div>

      <!-- Menu Content -->
      <div class="relative w-full h-full flex flex-col pt-24 px-8 sm:px-12 overflow-y-auto">
        <!-- Menu Links Container -->
        <div class="flex flex-col gap-8 mb-16">
          <a 
            href="#home" 
            @click.prevent="handleMenuClick('#home')"
            class="text-3xl sm:text-4xl md:text-5xl font-light text-[#F2F0E3] transition-all duration-300 hover:text-white/80 leading-tight"
          >
            Home
          </a>
          <a 
            href="#about" 
            @click.prevent="handleMenuClick('#about')"
            class="text-3xl sm:text-4xl md:text-5xl font-light text-[#F2F0E3] transition-all duration-300 hover:text-white/80 leading-tight"
          >
            Nosotros
          </a>
          <a 
            href="#services" 
            @click.prevent="handleMenuClick('#services')"
            class="text-3xl sm:text-4xl md:text-5xl font-light text-[#F2F0E3] transition-all duration-300 hover:text-white/80 leading-tight"
          >
            Servicios
          </a>
          <a 
            href="#process" 
            @click.prevent="handleMenuClick('#process')"
            class="text-3xl sm:text-4xl md:text-5xl font-light text-[#F2F0E3] transition-all duration-300 hover:text-white/80 leading-tight"
          >
            Proceso
          </a>
        </div>

        <!-- Contact Button -->
        <button 
          @click="handleContactClick"
          class="w-full py-4 sm:py-5 bg-[#F2F0E3] text-black font-medium rounded-lg transition-all duration-300 hover:bg-white/90 text-base sm:text-lg"
        >
          Contactar
        </button>

        <!-- Divider at bottom -->
        <div class="flex-1 flex items-end pb-8 sm:pb-12">
          <div class="w-full h-px bg-white/20"></div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import gsap from 'gsap'

const isScrolled = ref(false)
const isMenuOpen = ref(false)
const activeSection = ref('home')
let bodyScrollLocked = false

const handleScroll = () => {
  const scrollPosition = window.scrollY
  isScrolled.value = scrollPosition > 50
  
  // Detectar sección activa al hacer scroll
  const sections = ['home', 'about', 'services', 'process', 'contact']
  for (const section of sections) {
    const element = document.getElementById(section)
    if (element) {
      const rect = element.getBoundingClientRect()
      if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
        activeSection.value = section
        break
      }
    }
  }
}

const toggleMobileMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMobileMenu = () => {
  isMenuOpen.value = false
}

const scrollToSection = (selector) => {
  const sectionName = selector.replace('#', '')
  activeSection.value = sectionName
  const element = document.querySelector(selector)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const handleMenuClick = (selector) => {
  closeMobileMenu()
  // Scroll suave al elemento
  const sectionName = selector.replace('#', '')
  activeSection.value = sectionName
  const element = document.querySelector(selector)
  if (element) {
    setTimeout(() => {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 300)
  }
}

const handleContactClick = () => {
  closeMobileMenu()
  // Scroll a ContactSection
  const contactSection = document.getElementById('contact')
  if (contactSection) {
    setTimeout(() => {
      contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 300)
  }
}

// Control de scroll en el body cuando el menú está abierto
const updateBodyScroll = () => {
  if (isMenuOpen.value && !bodyScrollLocked) {
    document.body.style.overflow = 'hidden'
    bodyScrollLocked = true
  } else if (!isMenuOpen.value && bodyScrollLocked) {
    document.body.style.overflow = ''
    bodyScrollLocked = false
  }
}

// Watchers para el menu
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
  if (bodyScrollLocked) {
    document.body.style.overflow = ''
  }
})

// Watch para el menú
import { watch } from 'vue'
watch(isMenuOpen, () => {
  updateBodyScroll()
})

// Animaciones GSAP para el menú
const enterMenu = (el, done) => {
  const tl = gsap.timeline({
    onComplete: done
  })

  // Fade in el fondo
  tl.fromTo(
    el.querySelector('.absolute.inset-0'),
    {
      opacity: 0
    },
    {
      opacity: 1,
      duration: 0.4,
      ease: 'power2.out'
    },
    0
  )

  // Fade + slide in del contenido
  tl.fromTo(
    el.querySelector('.relative.w-full.h-full'),
    {
      opacity: 0,
      y: -30
    },
    {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: 'power2.out'
    },
    0.1
  )

  // Stagger los links
  tl.fromTo(
    el.querySelectorAll('.flex.flex-col.gap-8 a'),
    {
      opacity: 0,
      x: -30
    },
    {
      opacity: 1,
      x: 0,
      duration: 0.4,
      stagger: 0.12,
      ease: 'power2.out'
    },
    0.2
  )

  // Botón de contacto
  tl.fromTo(
    el.querySelector('button:not([aria-label])'),
    {
      opacity: 0,
      scale: 0.95
    },
    {
      opacity: 1,
      scale: 1,
      duration: 0.4,
      ease: 'back.out'
    },
    0.5
  )
}

const leaveMenu = (el, done) => {
  const tl = gsap.timeline({
    onComplete: done
  })

  tl.to(el.querySelector('.relative.w-full.h-full'), {
    opacity: 0,
    y: -30,
    duration: 0.3,
    ease: 'power2.in'
  })

  tl.to(
    el.querySelector('.absolute.inset-0'),
    {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in'
    },
    0
  )
}
</script>

<style scoped>
nav {
  z-index: 999999 !important;
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  isolation: isolate !important;
}

/* Botón del menú hamburguesa */
button[aria-label="Toggle menu"] {
  cursor: pointer;
  padding: 0.5rem;
  margin: -0.5rem;
}

/* SVG Asterisco */
button[aria-label="Toggle menu"] svg {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
