<script setup>
/**
 * Home.
 *
 * Todo el sitio comparte un único fondo animado (AmbientBackground) que queda
 * fijo detrás del contenido; las secciones son transparentes y cada una le
 * pide al fondo su "mood". Por eso ya no hay degradados por sección ni fades a
 * negro entre bloques: el paso de una a otra lo hace el fondo.
 */
import AmbientBackground from '@/components/AmbientBackground.vue'
import AmbientZone from '@/components/AmbientZone.vue'
import NavLinks from '@/components/NavLinks.vue'
import HeaderHome from '@/components/HeaderHome.vue'
import ServicesSection from '@/components/ServicesSection.vue'
import MaterialCarouselSection from '@/components/MaterialCarouselSection.vue'
import TrustedBrandsSection from '@/components/TrustedBrandsSection.vue'
import LogosMeetSection from '@/components/LogosMeetSection.vue'
import WebRingSection from '@/components/WebRingSection.vue'
import HowWeWorkTimeline from '@/components/HowWeWorkTimeline.vue'
import WhyByLoaSection from '@/components/WhyByLoaSection.vue'
import ContactSection from '@/components/ContactSection.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import { useScrollSetup } from '@/composables/useScrollSetup'

useScrollSetup()
</script>

<template>
  <div class="site">
    <AmbientBackground />
    <NavLinks />

    <main class="site__main">
      <HeaderHome />
      <ServicesSection />

      <AmbientZone mood="quiet">
        <MaterialCarouselSection />
      </AmbientZone>

      <LogosMeetSection />
      <WebRingSection />
      <HowWeWorkTimeline />

      <AmbientZone mood="quiet">
        <TrustedBrandsSection />
      </AmbientZone>

      <WhyByLoaSection />

      <AmbientZone mood="quiet">
        <ContactSection />
        <SiteFooter />
      </AmbientZone>
    </main>
  </div>
</template>

<style scoped>
.site {
  position: relative;
  min-height: 100svh;
}

/* `clip` recorta los desbordes decorativos sin crear un contenedor de scroll,
   así no rompe el `position: sticky` ni los pines de ScrollTrigger. */
.site__main {
  position: relative;
  z-index: var(--z-content);
  overflow-x: clip;
}
</style>
