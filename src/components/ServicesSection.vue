<script setup>
/**
 * Servicios. Antes esto era una foto de stock a pantalla completa con el texto
 * encima; ahora se apoya en el humo global y el contenido vive en una lámina
 * de vidrio.
 *
 * Detalle que une la sección con el fondo: al cambiar de servicio, el foco del
 * humo se corre (`setFocusOffset`), así el fondo acompaña la navegación en vez
 * de ser un telón quieto.
 *
 * El avance automático se pausa con hover, fuera de pantalla y con la pestaña
 * oculta.
 */
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { gsap, ScrollTrigger, splitMasked } from '@/animations/gsap'
import { useGsap } from '@/composables/useGsap'
import { setFocusOffset, useAmbientMood } from '@/composables/useAmbient'

/** Segundos que queda cada servicio en pantalla. */
const DURATION = 6

const services = [
  {
    title: 'Gestión de redes sociales',
    description:
      'Plan mensual, piezas y community management. Tu marca aparece todos los días con un mensaje que no se desarma.',
    note: 'Calendario, publicación y respuesta. Presencia constante, no rachas de contenido.',
  },
  {
    title: 'Creación de contenido',
    description:
      'Reels, fotos y piezas con dirección creativa. Contenido para que te elijan, no solo para llenar el feed.',
    note: 'Producción alineada a tu identidad, pensada para conectar y convertir.',
  },
  {
    title: 'Publicidad digital',
    description:
      'Campañas en Meta Ads y Google Ads con objetivo, audiencia y presupuesto claros.',
    note: 'Medimos, ajustamos y hacemos que cada peso de pauta rinda más.',
  },
  {
    title: 'Branding & comunicación',
    description:
      'Definimos qué dice tu marca, con qué tono y con qué identidad visual.',
    note: 'Para que te reconozcan en redes, web y campañas, no un look distinto en cada canal.',
  },
  {
    title: 'Web & landings',
    description:
      'Sitios y landings pensados para generar consultas, no solo para verse bien.',
    note: 'Estructura, texto y diseño orientados a conversión.',
  },
]

const root = ref(null)
const activeIndex = ref(0)
const current = computed(() => services[activeIndex.value])
const pad = (n) => String(n + 1).padStart(2, '0')

useAmbientMood(root, 'services')

/* ------------------------------------------------------------ reproducción */

const fills = []
let timeline

const hovering = ref(false)
const offscreen = ref(false)
const tabHidden = ref(false)
const paused = computed(() => hovering.value || offscreen.value || tabHidden.value)

const play = () => {
  timeline?.kill()
  fills.forEach((fill) => fill && gsap.set(fill, { scaleX: 0 }))

  timeline = gsap.timeline({ onComplete: () => go(1) }).fromTo(
    fills[activeIndex.value],
    { scaleX: 0 },
    { scaleX: 1, duration: DURATION, ease: 'none' },
  )
  if (paused.value) timeline.pause()
}

const go = (delta, target) => {
  const count = services.length
  activeIndex.value = target ?? (activeIndex.value + delta + count) % count
  play()
}

watch(paused, (isPaused) => (isPaused ? timeline?.pause() : timeline?.resume()))

// El foco del humo se corre con el servicio activo: de izquierda a derecha y
// alternando un poco en vertical, para que el fondo no repita el mismo gesto.
watch(activeIndex, (i) => {
  const t = services.length > 1 ? i / (services.length - 1) - 0.5 : 0
  setFocusOffset(t * 0.24, (i % 2 ? 1 : -1) * 0.07)
}, { immediate: true })

const onVisibility = () => (tabHidden.value = document.hidden)
document.addEventListener('visibilitychange', onVisibility)

onBeforeUnmount(() => {
  timeline?.kill()
  document.removeEventListener('visibilitychange', onVisibility)
})

/* --------------------------------------------- transición entre servicios */

const onLeave = (el, done) => {
  gsap.to(el, { yPercent: -8, opacity: 0, duration: 0.35, ease: 'power2.in', onComplete: done })
}

const onEnter = (el, done) => {
  // Se oculta antes de partir el texto: si no, hay un cuadro en el que se ve
  // el título sin partir y, al partirse, "salta".
  gsap.set(el, { visibility: 'hidden' })

  const title = splitMasked(el.querySelector('.service__title'), 'lines,words')
  const body = splitMasked(el.querySelectorAll('.service__body'))

  gsap
    .timeline({ onComplete: done })
    .set(el, { visibility: 'visible' }, 0)
    .from(title.words, { yPercent: 115, duration: 0.9, stagger: 0.03, ease: 'expo.out' }, 0)
    .from(body.lines, { yPercent: 110, duration: 0.8, stagger: 0.05, ease: 'expo.out' }, 0.15)
}

/* ----------------------------------------------------------------- entrada */

useGsap(root, () => {
  ScrollTrigger.create({
    trigger: root.value,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => (offscreen.value = !self.isActive),
  })
  play()

  gsap
    .timeline({ scrollTrigger: { trigger: root.value, start: 'top 70%', once: true }, defaults: { ease: 'expo.out' } })
    .from('.services__panel', { opacity: 0, y: 60, duration: 1.4 }, 0)
    .from('.services__item', { opacity: 0, x: -24, duration: 1, stagger: 0.07 }, 0.25)
    .from('.services__ghost', { opacity: 0, duration: 1.6 }, 0.3)
})
</script>

<template>
  <section
    id="services"
    ref="root"
    class="services"
    @pointerenter="hovering = true"
    @pointerleave="hovering = false"
  >
    <div class="services__panel glass">
      <!-- Número gigante del servicio activo, detrás de todo -->
      <span class="services__ghost" aria-hidden="true">{{ pad(activeIndex) }}</span>

      <!-- Índice de servicios -->
      <nav class="services__nav" aria-label="Servicios">
        <p class="eyebrow">Servicios</p>
        <ul class="services__list">
          <li v-for="(service, i) in services" :key="service.title" class="services__item">
            <button
              type="button"
              class="services__link"
              :class="{ 'is-active': i === activeIndex }"
              :aria-current="i === activeIndex ? 'true' : undefined"
              @click="go(0, i)"
            >
              <span class="services__index">{{ pad(i) }}</span>
              <span class="services__name">{{ service.title }}</span>
              <!-- Rail de avance automático del servicio activo -->
              <span class="services__rail" aria-hidden="true">
                <span :ref="(el) => (fills[i] = el)" class="services__fill" />
              </span>
            </button>
          </li>
        </ul>
      </nav>

      <!-- Detalle del servicio -->
      <div class="services__stage">
        <Transition :css="false" mode="out-in" @leave="onLeave" @enter="onEnter">
          <article :key="activeIndex" class="service">
            <h2 class="service__title">{{ current.title }}</h2>
            <p class="service__body service__description">{{ current.description }}</p>
            <p class="service__body service__note">{{ current.note }}</p>
          </article>
        </Transition>

        <div class="services__controls">
          <button type="button" class="services__arrow" aria-label="Servicio anterior" @click="go(-1)">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M19 12H5M11 6l-6 6 6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
          <p class="services__counter">
            <span>{{ pad(activeIndex) }}</span> / {{ pad(services.length - 1) }}
          </p>
          <button type="button" class="services__arrow" aria-label="Servicio siguiente" @click="go(1)">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.services {
  position: relative;
  z-index: var(--z-content);
  display: grid;
  align-items: center;
  min-height: 100svh;
  /* Alto de pantalla, no `--section-space`: si no, el panel queda fuera de vista. */
  padding: calc(var(--header-h) + 2.5rem) var(--gutter) 4rem;
}

.services__panel {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 20rem) minmax(0, 1fr);
  gap: clamp(2rem, 1rem + 4vw, 5rem);
  width: 100%;
  max-width: 82rem;
  margin-inline: auto;
  padding: clamp(2rem, 1.5rem + 3vw, 4.5rem);
  overflow: hidden;
  border-radius: var(--radius-lg);
}

/* Número enorme del servicio activo: da escala sin agregar una foto. */
.services__ghost {
  position: absolute;
  right: -0.08em;
  bottom: -0.34em;
  font-family: var(--font-display);
  font-size: clamp(14rem, 34vw, 30rem);
  font-weight: 400;
  line-height: 1;
  color: var(--c-ghost);
  pointer-events: none;
  user-select: none;
}

/* ---- Índice ---- */

.services__nav {
  display: grid;
  align-content: start;
  gap: 2rem;
}

.services__list {
  display: grid;
  gap: 0.25rem;
}

.services__link {
  position: relative;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: baseline;
  gap: 0.9rem;
  width: 100%;
  padding: 0.85rem 0;
  border-top: 1px solid var(--c-line);
  text-align: left;
  color: var(--c-muted);
  transition: color 0.45s var(--ease-out);
}

.services__item:last-child .services__link {
  border-bottom: 1px solid var(--c-line);
}

.services__index {
  font-size: var(--fs-micro);
  letter-spacing: 0.12em;
  color: var(--c-faint);
  font-variant-numeric: tabular-nums;
  transition: color 0.45s var(--ease-out);
}

.services__name {
  font-size: var(--fs-body);
  line-height: 1.25;
  /* El activo pesa más sin mover el resto de la lista. */
  transition: transform 0.55s var(--ease-out);
  transform-origin: left center;
}

.services__link.is-active {
  color: var(--c-fg);
}

.services__link.is-active .services__index {
  color: var(--c-pink);
}

.services__link.is-active .services__name {
  transform: translateX(0.35rem);
}

@media (hover: hover) {
  .services__link:hover {
    color: var(--c-fg);
  }

  .services__link:hover .services__name {
    transform: translateX(0.35rem);
  }
}

/* Avance automático: la línea de arriba del ítem activo se va llenando. */
.services__rail {
  position: absolute;
  inset: -1px 0 auto 0;
  height: 1px;
  overflow: hidden;
}

.services__fill {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, var(--c-pink), var(--c-magenta));
  transform: scaleX(0);
  transform-origin: left;
}

/* ---- Detalle ---- */

.services__stage {
  position: relative;
  display: grid;
  /* Alto fijo: el detalle arriba, los controles abajo. Antes el panel se
     encogía o crecía según el largo del servicio y la card "saltaba" en cada
     cambio. Ahora se reserva el alto del servicio más largo y listo. */
  grid-template-rows: minmax(0, 1fr) auto;
  gap: 2rem;
  min-height: 26rem;
}

.services__stage > * {
  align-self: start;
}

.service {
  display: grid;
  gap: 1.25rem;
  max-width: 34rem;
}

.service__title {
  font-family: var(--font-display);
  font-size: clamp(2.25rem, 1.4rem + 3.2vw, 4.25rem);
  font-weight: 400;
  letter-spacing: -0.025em;
  line-height: 0.98;
  text-transform: uppercase;
}

.service__description {
  color: color-mix(in srgb, var(--c-fg) 78%, transparent);
  font-size: var(--fs-lead);
  line-height: 1.5;
}

.service__note {
  color: var(--c-faint);
  font-family: var(--font-serif);
  font-size: var(--fs-body);
  font-style: italic;
  line-height: 1.6;
}

.services__controls {
  display: flex;
  align-self: end;
  align-items: center;
  gap: 1rem;
}

.services__arrow {
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border: 1px solid var(--c-line-strong);
  border-radius: 50%;
  color: var(--c-fg);
  transition:
    background-color 0.4s var(--ease-out),
    color 0.4s var(--ease-out);
}

.services__arrow svg {
  width: 1.1rem;
  height: 1.1rem;
}

.services__arrow:hover {
  background: var(--c-fg);
  color: var(--c-on-fg);
}

.services__counter {
  color: var(--c-faint);
  font-size: var(--fs-small);
  letter-spacing: 0.12em;
  font-variant-numeric: tabular-nums;
}

.services__counter span {
  color: var(--c-fg);
}

/* ---- Mobile ---- */

@media (max-width: 900px) {
  .services__panel {
    grid-template-columns: minmax(0, 1fr);
    gap: 2.5rem;
  }

  .services__stage {
    min-height: 22rem;
    gap: 1.75rem;
  }

  .services__ghost {
    font-size: 16rem;
    bottom: -0.3em;
  }
}
</style>
