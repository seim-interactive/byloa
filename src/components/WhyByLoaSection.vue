<script setup>
/**
 * Manifiesto: por qué ByLoa.
 *
 * Antes: un título, una bajada y cuatro tarjetas de vidrio iguales, todas
 * entrando con el mismo fade. Ahora la sección tiene una jerarquía real.
 *
 * - El titular se enciende palabra por palabra atado al scroll (scrub), así el
 *   lector avanza por la frase en vez de verla aparecer entera.
 * - Las razones son una lista que se abre: sólo la activa muestra su texto, y
 *   la apertura la resuelve CSS con `grid-template-rows: 0fr → 1fr`, que anima
 *   alturas automáticas sin medir nada en JS.
 */
import { ref } from 'vue'
import { gsap, SplitText, splitMasked } from '@/animations/gsap'
import { useGsap } from '@/composables/useGsap'
import { useAmbientMood } from '@/composables/useAmbient'

const reasons = [
  {
    title: 'Diagnóstico primero',
    description:
      'Miramos tu marca, tu audiencia y el negocio antes de producir una sola pieza. Sin eso, el contenido es adivinar.',
  },
  {
    title: 'Un plan, no ocurrencias',
    description:
      'Cada publicación y cada pauta responde a un objetivo. Sabés qué se hace, para qué y cuándo se revisa.',
  },
  {
    title: 'Contenido que trabaja',
    description:
      'Piezas pensadas para posicionar, generar consultas y vender. La estética importa; el resultado, más.',
  },
  {
    title: 'Equipo del otro lado',
    description:
      'No entregamos un drive y desaparecemos. Seguimos, medimos y ajustamos con vos mes a mes.',
  },
]

const root = ref(null)
const active = ref(0)
const canHover = typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches

const toggle = (i) => (active.value = active.value === i ? -1 : i)
const onHover = (i) => canHover && (active.value = i)

useAmbientMood(root, 'why')

useGsap(root, () => {
  // El titular se enciende palabra por palabra a medida que entra.
  const title = SplitText.create('.why__title', { type: 'words' })
  gsap.fromTo(
    title.words,
    { opacity: 0.14 },
    {
      opacity: 1,
      ease: 'none',
      stagger: 0.4,
      scrollTrigger: { trigger: '.why__title', start: 'top 82%', end: 'bottom 52%', scrub: 0.5 },
    },
  )

  const lead = splitMasked('.why__lead')
  gsap
    .timeline({
      scrollTrigger: { trigger: '.why__intro', start: 'top 70%', once: true },
      defaults: { ease: 'expo.out' },
    })
    .set('.why__reveal', { opacity: 1 })
    .from('.why__intro .eyebrow', { opacity: 0, y: 18, duration: 1 }, 0)
    .from(lead.lines, { yPercent: 110, duration: 1.1, stagger: 0.07 }, 0.15)

  gsap.from('.reason', {
    opacity: 0,
    y: 34,
    duration: 1.1,
    stagger: 0.09,
    ease: 'expo.out',
    scrollTrigger: { trigger: '.why__list', start: 'top 78%', once: true },
  })

})
</script>

<template>
  <section id="agency" ref="root" class="why">
    <div class="why__intro">
      <p class="eyebrow why__reveal">Por qué ByLoa</p>

      <h2 class="why__title">
        Una agencia para marcas que quieren <em>vender mejor</em>.
      </h2>

      <p class="why__lead why__reveal">
        Acompañamos a marcas y negocios a decidir qué decir, dónde publicarlo y cómo medir
        si está funcionando. Menos ruido. Más dirección.
      </p>
    </div>

    <ul class="why__list">
      <li
        v-for="(reason, i) in reasons"
        :key="reason.title"
        class="reason"
        :class="{ 'is-active': i === active }"
        @pointerenter="onHover(i)"
      >
        <button
          type="button"
          class="reason__head"
          :aria-expanded="i === active"
          :aria-controls="`reason-${i}`"
          @click="toggle(i)"
        >
          <span class="reason__index">{{ String(i + 1).padStart(2, '0') }}</span>
          <span class="reason__title">{{ reason.title }}</span>
          <span class="reason__mark" aria-hidden="true" />
        </button>

        <div :id="`reason-${i}`" class="reason__panel">
          <p>{{ reason.description }}</p>
        </div>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.why {
  position: relative;
  z-index: var(--z-content);
  display: grid;
  justify-items: center;
  gap: clamp(3rem, 2rem + 4vw, 6rem);
  padding: var(--section-space) var(--gutter);
}

/* ---- Intro ---- */

.why__intro {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
  align-items: end;
  gap: 1.5rem clamp(2rem, 1rem + 4vw, 6rem);
  width: 100%;
  max-width: 82rem;
}

.why__intro .eyebrow {
  grid-column: 1 / -1;
}

.why__title {
  font-family: var(--font-display);
  font-size: var(--fs-h2);
  font-weight: 400;
  letter-spacing: -0.03em;
  line-height: 0.98;
}

.why__title em {
  font-family: var(--font-serif);
  font-style: italic;
}

.why__lead {
  max-width: 38ch;
  color: var(--c-muted);
  font-size: var(--fs-lead);
  line-height: 1.5;
}

.why__reveal {
  opacity: 0;
}

/* ---- Razones ---- */

.why__list {
  width: 100%;
  max-width: 82rem;
}

.reason {
  position: relative;
  border-top: 1px solid var(--c-line);
  transition: border-color 0.6s var(--ease-out);
}

.reason:last-child {
  border-bottom: 1px solid var(--c-line);
}

.reason.is-active {
  border-top-color: var(--c-line-strong);
}

/* Halo que acompaña a la razón abierta */
.reason::before {
  content: '';
  position: absolute;
  inset: -1px 0 auto;
  height: 1px;
  background: linear-gradient(90deg, var(--c-magenta), var(--c-pink), transparent);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.7s var(--ease-out);
}

.reason.is-active::before {
  transform: scaleX(1);
}

.reason__head {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: clamp(1rem, 0.5rem + 2vw, 2.5rem);
  width: 100%;
  padding: clamp(1.25rem, 1rem + 1vw, 2rem) 0;
  text-align: left;
}

.reason__index {
  color: var(--c-faint);
  font-size: var(--fs-micro);
  letter-spacing: 0.18em;
  font-variant-numeric: tabular-nums;
  transition: color 0.5s var(--ease-out);
}

.reason.is-active .reason__index {
  color: var(--c-pink);
}

.reason__title {
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 1rem + 2vw, 2.75rem);
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 1.05;
  color: var(--c-muted);
  /* El título activo se adelanta apenas: movimiento, no salto. */
  transition:
    color 0.5s var(--ease-out),
    transform 0.6s var(--ease-out);
  transform-origin: left center;
}

.reason.is-active .reason__title {
  color: var(--c-fg);
  transform: translateX(0.5rem);
}

/* Marca "+" que gira a "×" al abrir, dibujada con dos barras */
.reason__mark {
  position: relative;
  width: 1rem;
  height: 1rem;
  transition: transform 0.6s var(--ease-out);
}

.reason__mark::before,
.reason__mark::after {
  content: '';
  position: absolute;
  inset: 50% 0 auto;
  height: 1px;
  background: var(--c-muted);
  transition: background-color 0.5s var(--ease-out);
}

.reason__mark::after {
  transform: rotate(90deg);
}

.reason.is-active .reason__mark {
  transform: rotate(135deg);
}

.reason.is-active .reason__mark::before,
.reason.is-active .reason__mark::after {
  background: var(--c-pink);
}

/* Apertura sin medir alturas en JS: 0fr → 1fr */
.reason__panel {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.7s var(--ease-out);
}

.reason.is-active .reason__panel {
  grid-template-rows: 1fr;
}

.reason__panel > p {
  overflow: hidden;
  max-width: 54ch;
  /* El padding vive acá adentro para que no sume alto cuando está cerrado. */
  padding-left: clamp(2.5rem, 1.5rem + 4vw, 6rem);
  color: var(--c-muted);
  font-size: var(--fs-body);
  line-height: 1.65;
  opacity: 0;
  transition: opacity 0.5s var(--ease-out);
}

.reason.is-active .reason__panel > p {
  padding-bottom: clamp(1.25rem, 1rem + 1vw, 2rem);
  opacity: 1;
}

@media (max-width: 900px) {
  .why__intro {
    grid-template-columns: minmax(0, 1fr);
  }

  .reason__head {
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: start;
  }

  .reason__panel > p {
    padding-left: 2.5rem;
  }
}
</style>
