<script setup>
/**
 * Portada. No lleva fondo propio: se apoya en el humo animado global
 * (AmbientBackground) y sólo declara su mood.
 *
 * La entrada es una sola línea de tiempo: el titular revela palabra por
 * palabra desde abajo con las líneas enmascaradas, y detrás entran bajada,
 * botones y métricas. Al scrollear, el bloque sube y se desvanece antes de
 * que llegue Servicios.
 */
import { ref } from 'vue'
import { gsap, ScrollTrigger, splitMasked } from '@/animations/gsap'
import { useGsap } from '@/composables/useGsap'
import { useAmbientMood } from '@/composables/useAmbient'
import { scrollToSection } from '@/composables/useSmoothScroll'
import { vMagnetic } from '@/directives/magnetic'

const stats = [
  { value: 100, prefix: '+', suffix: '', label: 'Proyectos\na medida' },
  { value: 40, prefix: '+', suffix: '', label: 'Marcas\nacompañadas' },
  { value: 100, prefix: '', suffix: '%', label: 'Clientes\nsatisfechos' },
]

const root = ref(null)
useAmbientMood(root, 'hero')

useGsap(root, () => {
  const title = splitMasked('.hero__title', 'lines,words')
  const lead = splitMasked('.hero__lead')

  gsap
    .timeline({
      delay: 0.15,
      defaults: { ease: 'expo.out' },
    })
    .set('.hero__reveal', { opacity: 1 })
    .from('.eyebrow', { opacity: 0, y: 18, duration: 1 }, 0)
    .from(title.words, { yPercent: 118, duration: 1.5, stagger: 0.035 }, 0.1)
    .from(lead.lines, { yPercent: 110, duration: 1.2, stagger: 0.08 }, 0.6)
    .from('.hero__actions > *', { y: 26, opacity: 0, duration: 1, stagger: 0.08 }, 0.75)
    .from('.stat', { y: 26, opacity: 0, duration: 1, stagger: 0.08 }, 0.9)
    .from('.hero__cue', { opacity: 0, duration: 1 }, 1.1)

  // Los números suben hasta su valor mientras entran las métricas.
  gsap.utils.toArray('.stat__value').forEach((el) => {
    const target = Number(el.dataset.value)
    const counter = { n: 0 }
    gsap.to(counter, {
      n: target,
      duration: 1.6,
      delay: 1,
      ease: 'power2.out',
      onUpdate: () => (el.querySelector('.stat__num').textContent = Math.round(counter.n)),
    })
  })

  // Señal de scroll: late suave hasta que el usuario baja.
  gsap.to('.hero__cue-line', { scaleY: 0.35, transformOrigin: 'top', duration: 1.6, repeat: -1, yoyo: true, ease: 'sine.inOut' })

  // Al salir, la portada se va hacia arriba en vez de cortarse de golpe.
  gsap.to('.hero__main', {
    yPercent: -14,
    opacity: 0,
    ease: 'none',
    scrollTrigger: { trigger: root.value, start: 'top top', end: 'bottom top', scrub: true },
  })
})
</script>

<template>
  <section id="home" ref="root" class="hero">
    <div class="hero__main">
      <p class="eyebrow hero__reveal">Agencia de comunicación</p>

      <h1 class="hero__title hero__reveal">
        Hacemos crecer tu marca con <em>contenido</em> y campañas.
      </h1>

      <p class="hero__lead hero__reveal">
        Estrategia, contenido y publicidad digital. Un plan claro para cada canal,
        medible y sostenido en el tiempo.
      </p>

      <div class="hero__actions hero__reveal">
        <button v-magnetic type="button" class="btn btn--solid" @click="scrollToSection('#services')">
          Ver servicios
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <button v-magnetic type="button" class="btn btn--ghost" @click="scrollToSection('#contact')">
          Hablemos
        </button>
      </div>
    </div>

    <div class="hero__bar">
      <ul class="stats hero__reveal">
        <li v-for="stat in stats" :key="stat.label" class="stat">
          <p class="stat__value" :data-value="stat.value">
            <span>{{ stat.prefix }}</span><span class="stat__num">{{ stat.value }}</span><span>{{ stat.suffix }}</span>
          </p>
          <p class="stat__label">{{ stat.label }}</p>
        </li>
      </ul>

      <button type="button" class="hero__cue" aria-label="Ir a servicios" @click="scrollToSection('#services')">
        <span>Scroll</span>
        <span class="hero__cue-line" aria-hidden="true" />
      </button>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  z-index: var(--z-content);
  display: grid;
  grid-template-rows: 1fr auto;
  gap: 3rem;
  min-height: 100svh;
  padding: calc(var(--header-h) + 3rem) var(--gutter) clamp(1.5rem, 1rem + 2vw, 2.5rem);
}

/* El texto se lee sobre el humo sin necesidad de una capa oscura encima. */
.hero__main {
  display: grid;
  align-content: center;
  justify-items: start;
  gap: clamp(1.25rem, 1rem + 1vw, 2rem);
  max-width: min(100%, 55rem);
}

/* Las piezas arrancan ocultas y las enciende la línea de tiempo: así no
   se ve un flash del layout terminado antes de animar. */
.hero__reveal {
  opacity: 0;
}

.hero__title {
  font-family: var(--font-display);
  /* Tope por alto además de por ancho: el titular nunca empuja las métricas
     ni el botón fuera de la pantalla. */
  font-size: min(var(--fs-display), 10.5svh);
  font-weight: 400;
  letter-spacing: -0.035em;
  line-height: 0.92;
}

.hero__title em {
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 400;
}

.hero__lead {
  max-width: 44ch;
  color: var(--c-muted);
  font-size: var(--fs-lead);
  line-height: 1.45;
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.6em;
  padding: 1em 1.6em;
  border: 1px solid var(--c-fg);
  border-radius: 999px;
  font-size: var(--fs-small);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition:
    background-color 0.4s var(--ease-out),
    color 0.4s var(--ease-out),
    border-color 0.4s var(--ease-out);
}

.btn svg {
  width: 1.15em;
  height: 1.15em;
  transition: transform 0.4s var(--ease-out);
}

.btn--solid {
  background: var(--c-fg);
  color: var(--c-on-fg);
}

.btn--ghost {
  border-color: var(--c-line-strong);
  color: var(--c-fg);
}

@media (hover: hover) {
  .btn--solid:hover {
    background: transparent;
    color: var(--c-fg);
  }

  .btn--solid:hover svg {
    transform: translateX(4px);
  }

  .btn--ghost:hover {
    border-color: var(--c-fg);
    background: var(--c-tint-strong);
  }
}

/* ---- Barra inferior: métricas + señal de scroll ---- */

.hero__bar {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 2rem;
  padding-top: clamp(1.25rem, 1rem + 1vw, 2rem);
  border-top: 1px solid var(--c-line);
}

.stats {
  display: flex;
  flex-wrap: wrap;
  gap: clamp(1.5rem, 1rem + 3vw, 4rem);
}

.stat {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
}

.stat__value {
  font-family: var(--font-display);
  font-size: clamp(1.75rem, 1.2rem + 2vw, 3rem);
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 1;
  /* Ancho estable mientras el número cuenta hacia arriba. */
  font-variant-numeric: tabular-nums;
}

.stat__label {
  color: var(--c-faint);
  font-size: var(--fs-micro);
  line-height: 1.35;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  white-space: pre-line;
}

.hero__cue {
  display: grid;
  justify-items: center;
  gap: 0.75rem;
  color: var(--c-faint);
  font-size: var(--fs-micro);
  letter-spacing: 0.28em;
  text-transform: uppercase;
  transition: color 0.4s var(--ease-out);
}

.hero__cue:hover {
  color: var(--c-fg);
}

.hero__cue-line {
  width: 1px;
  height: 3rem;
  background: linear-gradient(to bottom, var(--c-line-strong), transparent);
}

@media (max-width: 900px) {
  .hero__main {
    max-width: 100%;
  }

  .hero__cue {
    display: none;
  }

  /* Las tres métricas entran en una fila: en flex, la tercera se iba abajo
     y quedaba fuera de la pantalla. */
  .stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
    width: 100%;
  }

  .stat {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.35rem;
  }

  .stat__label {
    letter-spacing: 0.08em;
  }
}
</style>
