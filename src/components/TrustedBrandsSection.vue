<template>
  <section class="py-20 sm:py-28 relative z-0 overflow-hidden bg-black">
    <!-- HEADER SECTION -->
    <div class="container-lg mx-auto px-4 sm:px-6 relative z-0 mb-16 sm:mb-20 md:mb-24">


      <!-- Título principal - Tipografía premium -->
      <div class="mb-6 sm:mb-8 text-center">
        <h2 class="section-title font-light text-white tracking-tight leading-tight">
          Marcas que<br class="hidden sm:block" />
          <span class="font-medium font-coolvetica"> acompañamos</span>
        </h2>
      </div>

      <!-- Subtítulo - Más refinado y legible -->
      <div class="text-center max-w-3xl mx-auto mb-0">
        <p class="text-sm sm:text-base md:text-lg text-white/70 font-light leading-relaxed tracking-wide">
          Acompañamos emprendimientos y proyectos que apuestan a la <br class="hidden sm:inline" />
          <span class="text-white/70">comunicación estratégica y coherente</span>
        </p>
      </div>
    </div>

    <!-- ===== CARROUSELES ===== -->
    <div
      class="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden z-0"
      style="--space-mobile: 0.2rem; --space-desktop: 1.25rem; --space: var(--space-mobile)"
    >

     <!-- DEGRADADO LATERAL IZQUIERDO -->
     <div class="pointer-events-none absolute inset-y-0 left-0 w-32 sm:w-48 lg:w-64 
                bg-gradient-to-r from-black to-transparent z-5"></div>

    <!-- DEGRADADO LATERAL DERECHO -->
    <div class="pointer-events-none absolute inset-y-0 right-0 w-32 sm:w-48 lg:w-64 
                bg-gradient-to-l from-black to-transparent z-5"></div>

      <!-- MARQUEE 1 -->
      <Marquee :repeat="8" class="[--gap:var(--space)] [--duration:50s]">
        <div
          v-for="brand in brands"
          :key="`row1-${brand.id}`"
          class="flex items-center justify-center shrink-0"
        >
          <div class="w-auto sm:w-auto md:w-52 lg:w-auto px-1.5 sm:px-3 md:px-4 py-2 sm:py-2.5 flex items-center justify-center group">
            <img
              :src="brand.logo_url"
              :alt="brand.name"
              class="h-5 sm:h-7 md:h-8 lg:h-10 w-auto max-w-[80px] sm:max-w-[110px] md:max-w-[150px] lg:max-w-[200px] object-contain opacity-50 hover:opacity-100 transition-opacity duration-500 ease-out"
            />
          </div>
        </div>
      </Marquee>

      <!-- Espaciador mínimo -->
      <div style="margin-top: var(--space)"></div>

      <!-- MARQUEE 2 -->
      <Marquee :repeat="8" :reverse="true" class="[--gap:var(--space)] [--duration:50s]">
        <div
          v-for="brand in brands"
          :key="`row2-${brand.id}`"
          class="flex items-center justify-center shrink-0"
        >
          <div class="w-auto sm:w-auto md:w-52 lg:w-auto px-1.5 sm:px-3 md:px-4 py-2 sm:py-2.5 flex items-center justify-center group">
            <img
              :src="brand.logo_url"
              :alt="brand.name"
              class="h-5 sm:h-7 md:h-8 lg:h-10 w-auto max-w-[80px] sm:max-w-[110px] md:max-w-[150px] lg:max-w-[200px] object-contain opacity-50 hover:opacity-100 transition-opacity duration-500 ease-out"
            />
          </div>
        </div>
      </Marquee>

    </div>

    <!-- FOOTER LABEL -->
    <div class="mt-16 sm:mt-20 md:mt-24 text-center">
      <span class="text-xs sm:text-sm tracking-widest text-white/30 font-light">
        Y muchas marcas más
      </span>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Marquee } from '@/components/ui/marquee'
import { apiURL, API_ENDPOINTS } from '@/lib/config'

const brands = ref([])

const fetchTrustedBrands = async () => {
  try {
    const response = await fetch(apiURL(API_ENDPOINTS.TRUSTED_BRANDS))
    const result = await response.json()
    if (result.success) {
      brands.value = result.data.map(brand => ({
        logo_url: brand.logo_url,
        name: brand.name,
        id: brand.id
      }))
    }
  } catch (error) {
    console.error('Error fetching trusted brands:', error)
  }
}

onMounted(() => {
  fetchTrustedBrands()
})
</script>

<style scoped>
@media (min-width: 768px) {
  div[style*="--space-mobile"] {
    --space: var(--space-desktop);
  }
}

.section-title {
  /* font-family: 'COOLVETICA', sans-serif; */
  font-size: clamp(3rem, 8vw, 5rem);
  font-weight: 100;
  color: #fff;
  letter-spacing: -0.02em;
  line-height: 1.1;
  margin-top: 1rem;
}

.section-title .font-medium {
  font-weight: 400;
  font-family: 'COOLVETICA', sans-serif;
}
</style>
