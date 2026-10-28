<script setup>
/**
 * Proceso: el recorrido se atraviesa. El panel queda quieto con
 * `position: sticky` y el scroll vertical desplaza el tren de pasos hacia la
 * izquierda.
 *
 * Sticky y no `pin` por lo mismo que en la sección de la alianza: el pin pone
 * el panel en `fixed` y, al ser transparente, se superponía con la sección
 * anterior; además cada remedición del pin hacía saltar la página. Con sticky
 * el panel no sale nunca de los límites de su sección.
 *
 * El alto de la sección es "una pantalla + una pausa + lo que tiene que viajar
 * el tren" (`--hold` + `--travel`), medido en el DOM y recalculado en cada
 * refresh. La pausa inicial existe para que el paso 01 quede quieto y completo
 * en pantalla antes de que el tren arranque: si no, el recorrido empieza en el
 * mismo instante en que la sección toca el borde de arriba y el primer paso se
 * pasa sin que se llegue a leer.
 *
 * `containerAnimation` es lo que hace que cada paso se encienda al entrar al
 * centro: mide la posición del paso dentro del desplazamiento horizontal, no
 * dentro de la página.
 */
import { ref } from 'vue'
import { gsap, splitMasked } from '@/animations/gsap'
import { useGsap } from '@/composables/useGsap'
import { useAmbientMood } from '@/composables/useAmbient'

const steps = [
  {
    title: 'Diagnóstico',
    description:
      'Vemos dónde está tu marca hoy: canales, mensaje, competencia y qué está frenando el crecimiento.',
  },
  {
    title: 'Estrategia',
    description:
      'Definimos qué decir, en qué canales, con qué frecuencia y cómo vamos a medir el avance.',
  },
  {
    title: 'Producción',
    description:
      'Creamos el contenido, las campañas y las piezas alineadas a esa estrategia. Nada se publica porque sí.',
  },
  {
    title: 'Salimos al aire',
    description: 'Publicamos, pautamos y respondemos. Vos tenés visibilidad de lo que está pasando.',
  },
  {
    title: 'Medimos y ajustamos',
    description:
      'Miramos números, cortamos lo que no rinde y repetimos lo que convierte. El plan se mueve con los datos.',
  },
]

/** Cuánta pantalla queda quieta antes de que arranque el tren. */
const HOLD_RATIO = 0.5

const root = ref(null)
const stage = ref(null)
const track = ref(null)
const activeStep = ref(0)
const pad = (n) => String(n + 1).padStart(2, '0')

useAmbientMood(root, 'process')

useGsap(root, () => {
  // El encabezado entra igual en todos los layouts.
  const title = splitMasked('.process__title')
  gsap
    .timeline({
      scrollTrigger: { trigger: root.value, start: 'top 75%', once: true },
    })
    .set('.process__head', { opacity: 1 })
    .from('.process__head .eyebrow', { opacity: 0, y: 18, duration: 1, ease: 'expo.out' }, 0)
    .from(title.lines, { yPercent: 115, duration: 1.2, stagger: 0.07, ease: 'expo.out' }, 0.1)

  const mm = gsap.matchMedia()

  mm.add('(min-width: 900px)', () => {
    const hold = () => Math.round(window.innerHeight * HOLD_RATIO)

    /** Cuánto tiene que viajar el tren, y por lo tanto cuánto mide la sección. */
    const measure = () => {
      const travel = Math.max(0, track.value.scrollWidth - stage.value.clientWidth)
      root.value.style.setProperty('--travel', `${travel}px`)
      root.value.style.setProperty('--hold', `${hold()}px`)
      return travel
    }
    measure()

    const scrollTween = gsap.to(track.value, {
      x: () => -measure(),
      ease: 'none',
      scrollTrigger: {
        trigger: root.value,
        // El recorrido arranca recién después de la pausa, con el panel ya
        // fijo y el paso 01 entero a la vista.
        start: () => `top top-=${hold()}`,
        end: 'bottom bottom',
        scrub: 0.8,
        invalidateOnRefresh: true,
        // El alto de la sección se recalcula antes de que ScrollTrigger mida.
        onRefreshInit: measure,
        onUpdate: (self) => {
          gsap.set('.process__progress', { scaleX: self.progress })
          activeStep.value = Math.min(steps.length - 1, Math.floor(self.progress * steps.length))
        },
      },
    })

    gsap.utils.toArray('.step').forEach((panel) => {
      const container = { containerAnimation: scrollTween, trigger: panel }

      gsap.fromTo(
        panel.querySelector('.step__body'),
        { opacity: 0.12, y: 44 },
        {
          opacity: 1,
          y: 0,
          ease: 'power2.out',
          scrollTrigger: { ...container, start: 'left 80%', end: 'left 40%', scrub: true },
        },
      )

      // El número de fondo se mueve más lento: da profundidad al recorrido.
      gsap.fromTo(
        panel.querySelector('.step__ghost'),
        { xPercent: -14 },
        {
          xPercent: 14,
          ease: 'none',
          scrollTrigger: { ...container, start: 'left right', end: 'right left', scrub: true },
        },
      )
    })

    return () => {
      root.value?.style.removeProperty('--travel')
      root.value?.style.removeProperty('--hold')
    }
  })

  mm.add('(max-width: 899px)', () => {
    gsap.fromTo(
      '.process__guide-fill',
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: { trigger: '.process__track', start: 'top 70%', end: 'bottom 70%', scrub: true },
      },
    )

    gsap.utils.toArray('.step').forEach((panel, i) => {
      gsap.from(panel.querySelector('.step__body'), {
        opacity: 0,
        y: 40,
        duration: 1,
        ease: 'expo.out',
        scrollTrigger: { trigger: panel, start: 'top 82%', once: true, onEnter: () => (activeStep.value = i) },
      })
    })
  })
})
</script>

<template>
  <section id="process" ref="root" class="process">
    <div ref="stage" class="process__stage">
      <header class="process__head">
        <p class="eyebrow">Proceso</p>
        <h2 class="section-title process__title">Cómo trabajamos</h2>
      </header>

      <div ref="track" class="process__track">
        <!-- Guía de avance de mobile: corre al costado del tren en vertical -->
        <span class="process__guide" aria-hidden="true"><span class="process__guide-fill" /></span>
        <article v-for="(step, i) in steps" :key="step.title" class="step" :class="{ 'is-active': i === activeStep }">
          <span class="step__ghost" aria-hidden="true">{{ pad(i) }}</span>
          <div class="step__body">
            <span class="step__index">Paso {{ pad(i) }}</span>
            <h3 class="step__title">{{ step.title }}</h3>
            <p class="step__text">{{ step.description }}</p>
          </div>
        </article>
      </div>

      <footer class="process__footer">
        <div class="process__rail">
          <span class="process__progress" aria-hidden="true" />
        </div>
        <p class="process__counter">
          <span>{{ pad(activeStep) }}</span> / {{ pad(steps.length - 1) }}
        </p>
      </footer>
    </div>
  </section>
</template>

<style scoped>
/* Una pantalla quieta + la pausa inicial + lo que viaja el tren.
   `--hold` y `--travel` los mide el script. */
.process {
  position: relative;
  z-index: var(--z-content);
  height: calc(100svh + var(--hold, 0px) + var(--travel, 0px));
}

.process__stage {
  position: sticky;
  top: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  gap: clamp(1.5rem, 1rem + 2vw, 3rem);
  height: 100svh;
  padding: calc(var(--header-h) + 2rem) 0 2.5rem;
  overflow: hidden;
}

.process__head {
  display: grid;
  gap: 1rem;
  padding-inline: var(--gutter);
  opacity: 0;
}

/* ---- Tren de pasos ---- */

.process__track {
  display: flex;
  align-items: center;
  gap: clamp(2rem, 1rem + 4vw, 6rem);
  /* El primer paso arranca alineado con el título; el último deja aire al
     final, pero no tanto como para terminar el recorrido con media pantalla
     vacía. */
  padding-inline: var(--gutter) 24vw;
  will-change: transform;
}

.step {
  position: relative;
  display: grid;
  gap: 0.75rem;
  flex: 0 0 auto;
  width: clamp(18rem, 28vw, 24rem);
}

/* Número gigante: se apoya encima del paso, sin cruzarle el texto. */
.step__ghost {
  margin-left: -0.06em;
  /* El interlineado del número deja mucho aire abajo: se recupera acá. */
  margin-bottom: -0.18em;
  font-family: var(--font-display);
  font-size: clamp(6rem, 11vw, 9.5rem);
  font-weight: 400;
  line-height: 0.78;
  color: transparent;
  -webkit-text-stroke: 1px var(--step-ghost, color-mix(in srgb, var(--c-fg) 9%, transparent));
  pointer-events: none;
  user-select: none;
  transition: -webkit-text-stroke-color 0.7s var(--ease-out);
}

:root[data-theme='light'] .step__ghost {
  /* Sobre beige, el 9% del texto casi no se ve: el contorno necesita más. */
  --step-ghost: color-mix(in srgb, var(--c-fg) 16%, transparent);
}

.step.is-active .step__ghost {
  -webkit-text-stroke-color: color-mix(in srgb, var(--c-pink) 34%, transparent);
}

.step__body {
  position: relative;
  display: grid;
  gap: 0.85rem;
}

.step__index {
  color: var(--c-faint);
  font-size: var(--fs-micro);
  font-weight: 600;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  transition: color 0.6s var(--ease-out);
}

.step.is-active .step__index {
  color: var(--c-pink);
}

.step__title {
  font-family: var(--font-display);
  font-size: clamp(1.75rem, 1.1rem + 1.9vw, 2.75rem);
  font-weight: 400;
  letter-spacing: -0.025em;
  line-height: 1.05;
}

.step__text {
  max-width: 34ch;
  color: var(--c-muted);
  font-size: var(--fs-body);
  line-height: 1.6;
}

/* Guía vertical: sólo mobile (en desktop el avance lo marca el rail de abajo) */
.process__guide {
  display: none;
  position: absolute;
  top: 0;
  bottom: 0;
  left: var(--gutter);
  width: 1px;
  background: var(--c-line);
}

.process__guide-fill {
  display: block;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, var(--c-magenta), var(--c-pink));
  transform: scaleY(0);
  transform-origin: top;
}

/* ---- Guía de avance ---- */

.process__footer {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding-inline: var(--gutter);
}

.process__rail {
  flex: 1;
  height: 1px;
  overflow: hidden;
  background: var(--c-line);
}

.process__progress {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, var(--c-magenta), var(--c-pink));
  transform: scaleX(0);
  transform-origin: left;
}

.process__counter {
  color: var(--c-faint);
  font-size: var(--fs-small);
  letter-spacing: 0.12em;
  font-variant-numeric: tabular-nums;
}

.process__counter span {
  color: var(--c-fg);
}

/* ---- Mobile: el mismo recorrido, en vertical ---- */

@media (max-width: 899px) {
  .process {
    height: auto;
  }

  .process__stage {
    position: static;
    height: auto;
    padding-block: var(--section-space) 4rem;
    overflow: visible;
  }

  .process__track {
    position: relative;
    flex-direction: column;
    align-items: stretch;
    gap: 3.5rem;
    padding-inline: var(--gutter);
    padding-left: calc(var(--gutter) + 2.5rem);
  }

  .step {
    width: auto;
  }

  .step__ghost {
    font-size: 6rem;
    /* A este cuerpo el número ya no necesita meterse sobre el texto. */
    margin-bottom: 0;
  }

  .process__footer {
    display: none;
  }

  .process__guide {
    display: block;
  }
}
</style>
