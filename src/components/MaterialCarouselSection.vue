<script setup>
/**
 * Proyectos: una cinta que avanza sola, sin fin.
 *
 * Antes era un Swiper con flechas y `overflow: hidden` en el contenedor, que
 * cortaba en seco las sombras de las cards y dejaba una línea visible abajo.
 * Acá la lista se duplica exacta y se desplaza el ancho de una copia en bucle:
 * al volver a cero la imagen es idéntica, así que la costura no se ve. Los
 * bordes se desvanecen con una máscara en vez de recortarse.
 *
 * La velocidad es constante en px/s, no una duración fija: con más proyectos
 * la cinta no se acelera.
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { gsap, splitMasked } from '@/animations/gsap'
import { useGsap } from '@/composables/useGsap'
import { projects, fetchProjects } from '@/store/projects'

/** Píxeles por segundo que recorre la cinta. */
const SPEED = 42
/** Mínimo de cards por copia para que la cinta llene pantallas anchas. */
const MIN_CARDS = 8

const root = ref(null)
const track = ref(null)

/** La lista repetida hasta el mínimo, y esa tira duplicada para el bucle. */
const loop = computed(() => {
  const base = projects.value
  if (!base.length) return []
  const strip = []
  while (strip.length < MIN_CARDS) strip.push(...base)
  return [...strip, ...strip]
})

/** Ancho de una copia de la tira: el desplazamiento se envuelve ahí. */
let distance = 0
/** Lo que mide una card con su separación, o sea el paso de las flechas. */
let step = 0
/** Desplazamiento automático acumulado. */
let offset = 0
/** Desplazamiento de las flechas, animado aparte para que no corte la marcha. */
const shift = { value: 0 }
/** Velocidad actual en px/s: baja a cero con el mouse encima. */
const speed = { value: 0 }
let running = false

const apply = () => {
  if (!track.value || !distance) return
  gsap.set(track.value, { x: gsap.utils.wrap(-distance, 0, offset + shift.value) })
}

const tick = (_t, deltaMs) => {
  // Tope al delta: si la pestaña estuvo en segundo plano, un salto enorme
  // haría pegar un tirón a la cinta al volver.
  offset -= (speed.value * Math.min(deltaMs, 50)) / 1000
  if (offset <= -distance) offset += distance
  apply()
}

const measure = () => {
  if (!track.value || !loop.value.length) return
  distance = track.value.scrollWidth / 2
  const card = track.value.querySelector('.project')
  const gap = parseFloat(getComputedStyle(track.value).columnGap) || 0
  step = card ? card.offsetWidth + gap : 0
}

const build = () => {
  measure()
  if (!distance) return
  speed.value = SPEED
  if (!running) {
    gsap.ticker.add(tick)
    running = true
  }
  apply()
}

const hover = (isOver) => {
  // Frenada suave en vez de un corte seco.
  gsap.to(speed, { value: isOver ? 0 : SPEED, duration: 0.5, ease: 'power2.out' })
}

/** Flechas: mueven una card. La cinta sigue avanzando por debajo. */
const nudge = (dir) => {
  if (!step) return
  gsap.to(shift, {
    value: shift.value - dir * step,
    duration: 0.9,
    ease: 'power3.out',
    onUpdate: apply,
  })
}

let resizeObserver

onMounted(async () => {
  await fetchProjects()
})

// Las cards recién existen cuando llegan los proyectos.
watch(loop, async () => {
  await new Promise((resolve) => requestAnimationFrame(resolve))
  build()
})

onMounted(() => {
  resizeObserver = new ResizeObserver(() => build())
  if (root.value) resizeObserver.observe(root.value)
})

onBeforeUnmount(() => {
  if (running) gsap.ticker.remove(tick)
  gsap.killTweensOf([speed, shift])
  resizeObserver?.disconnect()
})

useGsap(root, () => {
  const title = splitMasked('.projects__title')
  gsap
    .timeline({
      scrollTrigger: { trigger: root.value, start: 'top 78%', once: true },
      defaults: { ease: 'expo.out' },
    })
    .set('.projects__head', { opacity: 1 })
    .from('.projects__arrow', { opacity: 0, y: 18, duration: 0.9, stagger: 0.07 }, 0.5)
    .from('.projects__head .eyebrow', { opacity: 0, y: 18, duration: 1 }, 0)
    .from(title.lines, { yPercent: 115, duration: 1.2, stagger: 0.07 }, 0.1)
    .from('.projects__lead', { opacity: 0, y: 22, duration: 1 }, 0.35)
    .fromTo('.projects__rail', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1.4 }, 0.3)
})
</script>

<template>
  <section id="projects" ref="root" class="projects">
    <header class="projects__head">
      <p class="eyebrow">Trabajo destacado</p>
      <h2 class="section-title projects__title">Proyectos</h2>
      <p class="projects__lead">
        Campañas, contenido y piezas que ya están en el mercado. Así se ve el trabajo
        cuando deja de ser un concepto.
      </p>
    </header>

    <div class="projects__rail" @pointerenter="hover(true)" @pointerleave="hover(false)">
      <div ref="track" class="projects__track">
        <a
          v-for="(project, i) in loop"
          :key="`${project.id}-${i}`"
          class="project"
          :href="project.link || undefined"
          :target="project.link ? '_blank' : undefined"
          rel="noopener"
          :aria-hidden="i >= loop.length / 2 ? 'true' : undefined"
          :tabindex="i >= loop.length / 2 ? -1 : undefined"
        >
          <video
            v-if="project.type !== 'image'"
            :src="project.media"
            muted
            loop
            autoplay
            playsinline
            preload="metadata"
          />
          <img v-else :src="project.media" :alt="project.title || ''" loading="lazy" />
          <span v-if="project.title" class="project__title on-media">{{ project.title }}</span>
        </a>
      </div>
    </div>

    <div class="projects__controls">
      <button type="button" class="projects__arrow" aria-label="Proyectos anteriores" @click="nudge(-1)">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M19 12H5M11 6l-6 6 6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
      <button type="button" class="projects__arrow" aria-label="Proyectos siguientes" @click="nudge(1)">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>
  </section>
</template>

<style scoped>
.projects {
  position: relative;
  z-index: var(--z-content);
  display: grid;
  /* `minmax(0, 1fr)` y no `auto`: la cinta mide `max-content` (mucho más que
     la pantalla) y sin esto estiraba la columna de la grilla, así que las
     flechas se "centraban" respecto de ese ancho gigante y quedaban fuera de
     cuadro. El recorte visual lo sigue haciendo la máscara del carril. */
  grid-template-columns: minmax(0, 1fr);
  gap: clamp(3rem, 2rem + 4vw, 5rem);
  /* Abajo, menos que el espacio de sección: lo que sigue es la alianza, que
     ya arranca con su propio aire. */
  padding-block: var(--section-space) clamp(3rem, 2rem + 3vw, 5rem);
}

.projects__head {
  display: grid;
  gap: 1.25rem;
  padding-inline: var(--gutter);
  opacity: 0;
}

.projects__controls {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  padding-inline: var(--gutter);
}

.projects__arrow {
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

.projects__arrow svg {
  width: 1.1rem;
  height: 1.1rem;
}

.projects__arrow:hover {
  background: var(--c-fg);
  color: var(--c-on-fg);
}

.projects__lead {
  max-width: 46ch;
  color: var(--c-muted);
  font-size: var(--fs-body);
  line-height: 1.6;
}

/* Los bordes se desvanecen con una máscara: sin `overflow: hidden` no hay
   recorte duro ni sombras cortadas al ras. */
.projects__rail {
  opacity: 0;
  mask-image: linear-gradient(90deg, transparent, #000 7%, #000 93%, transparent);
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 7%, #000 93%, transparent);
}

.projects__track {
  display: flex;
  width: max-content;
  gap: clamp(0.75rem, 0.5rem + 1vw, 1.5rem);
  padding-inline: clamp(0.75rem, 0.5rem + 1vw, 1.5rem);
  will-change: transform;
}

.project {
  position: relative;
  flex: 0 0 auto;
  width: clamp(11rem, 20vw, 17rem);
  /* La proporción se reserva antes de que carguen las imágenes: así el alto de
     la página no cambia a mitad de scroll. */
  aspect-ratio: 3 / 4;
  overflow: hidden;
  border: 1px solid var(--c-line);
  border-radius: var(--radius);
  background: var(--c-tint);
  transition:
    transform 0.6s var(--ease-out),
    border-color 0.6s var(--ease-out);
}

.project img,
.project video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* Apagadas por defecto: la que se mira gana color y contraste. */
  filter: var(--media-rest);
  transition: filter 0.6s var(--ease-out), transform 0.8s var(--ease-out);
}

.project__title {
  position: absolute;
  inset: auto 0 0;
  padding: 2.5rem 1rem 1rem;
  background: linear-gradient(to top, rgb(5 3 8 / 0.85), transparent);
  color: var(--c-fg);
  font-size: var(--fs-small);
  line-height: 1.3;
  opacity: 0;
  translate: 0 0.5rem;
  transition:
    opacity 0.5s var(--ease-out),
    translate 0.5s var(--ease-out);
}

@media (hover: hover) {
  .project:hover {
    transform: scale(1.03);
    border-color: var(--c-line-strong);
  }

  .project:hover img,
  .project:hover video {
    filter: brightness(1) saturate(1);
    transform: scale(1.04);
  }

  .project:hover .project__title {
    opacity: 1;
    translate: 0 0;
  }
}
</style>
