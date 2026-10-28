<template>
  <section class="py-20 sm:py-28 relative z-0 overflow-hidden">
    <!-- HEADER SECTION -->
    <header class="brands__head">
      <p class="eyebrow">Clientes</p>
      <h2 class="section-title brands__title">Marcas que acompañamos</h2>
      <p class="brands__lead">
        Acompañamos marcas y negocios que necesitan una comunicación con rumbo:
        contenido, pauta y un equipo que ejecuta.
      </p>
    </header>

    <!-- ===== CARROUSELES ===== -->
    <div
      class="brands__marquee w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden z-0"
      style="--space-mobile: 0.2rem; --space-desktop: 1.25rem; --space: var(--space-mobile)"
    >

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
    <p class="brands__note">Y muchas marcas más</p>
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

.brands__head {
  display: grid;
  justify-items: center;
  gap: 1.25rem;
  max-width: 48rem;
  margin-inline: auto;
  margin-bottom: clamp(3rem, 2rem + 4vw, 6rem);
  padding-inline: var(--gutter);
  text-align: center;
}

.brands__title {
  max-width: 14ch;
}

.brands__lead {
  max-width: 52ch;
  color: var(--c-muted);
  font-size: var(--fs-body);
  line-height: 1.6;
}

/* Los bordes se desvanecen con máscara en vez de taparse con un degradado
   negro: el fondo del sitio ya no es negro sólido. */
.brands__marquee {
  mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent);
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent);
}

/* Los logos de clientes son blancos, pensados para fondo oscuro. En claro se
   invierten (y se pasan a gris para que ninguno quede con un color raro). */
:root[data-theme='light'] .brands__marquee img {
  filter: invert(1) grayscale(1);
}

.brands__note {
  margin-top: clamp(3rem, 2rem + 4vw, 6rem);
  color: var(--c-faint);
  font-size: var(--fs-micro);
  letter-spacing: 0.28em;
  text-align: center;
  text-transform: uppercase;
}
</style>
