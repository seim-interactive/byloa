<script setup>
/**
 * Alianza ByLoa × Seim.
 *
 * El panel se queda quieto con `position: sticky` mientras la sección pasa por
 * el viewport, y el scroll dentro de ese tramo conduce el encuentro.
 *
 * Por qué sticky y no el `pin` de ScrollTrigger: el pin saca el panel del flujo
 * y lo pone `fixed`. Como el panel es transparente (el fondo es el humo
 * global), quedaba flotando encima de la sección vecina, y cada vez que
 * ScrollTrigger remedía el pin la página pegaba un salto hacia atrás. Sticky se
 * queda dentro de los límites de su sección: no se superpone con nada y no hay
 * nada que remedir.
 *
 *   0.00 → 0.42   los logos entran desde los bordes, girados y chicos
 *   0.42 → 0.68   la trenza se dibuja desde cada logo hacia el centro
 *   0.66 → 1.00   el texto se revela línea por línea
 */
import { ref } from 'vue'
import { gsap, SplitText } from '@/animations/gsap'
import { useGsap } from '@/composables/useGsap'
import { useAmbientMood } from '@/composables/useAmbient'

const capabilities = [
  'Estrategia y contenido',
  'Publicidad digital',
  'Web y aplicaciones',
  'Un equipo de punta a punta',
]

/**
 * La trenza que une los logos: dos hebras senoidales en fase opuesta, con una
 * envolvente que las cierra en cada punta (salen de un solo punto pegado a
 * cada logo y se abren en el medio). Se cruzan en x = 60, 120 y 180: ahí van
 * los nodos, el del centro es el encuentro.
 */
const W = 240
const H = 80
const AMP = 24
const strand = (sign, reverse, amp = AMP, phase = 0) => {
  const points = []
  for (let i = 0; i <= 96; i++) {
    const x = (i / 96) * W
    const envelope = Math.sin((Math.PI * x) / W)
    const y = H / 2 + sign * amp * envelope * Math.sin((4 * Math.PI * x) / W + phase)
    points.push(`${x.toFixed(2)} ${y.toFixed(2)}`)
  }
  if (reverse) points.reverse()
  return `M${points.join(' L')}`
}
// La hebra de ByLoa se dibuja desde la izquierda; la de Seim, desde la derecha.
const strandByloa = strand(1, false)
const strandSeim = strand(-1, true)
// Fibras finas que acompañan a cada hebra, más bajas y desfasadas: le dan
// cuerpo a la trenza sin sumar cruces que compitan con los nodos.
const fibers = [
  strand(1, false, AMP * 0.55, Math.PI / 2),
  strand(-1, true, AMP * 0.55, Math.PI / 2),
]
const nodes = [60, 180]
/** Tramo del scroll en que se dibuja la trenza (fracción de la sección). */
/** Los logos llegan en 0.42; recién ahí empieza a dibujarse la trenza. */
const LAND = 0.42
const DRAW_AT = 0.42
const DRAW = 0.26
const NODE_R = 2.6
const CORE_R = 4.2

const root = ref(null)
useAmbientMood(root, 'alliance')

useGsap(root, () => {
  const offscreen = (dir) => () => dir * (window.innerWidth * 0.5 + 220)

  // Las líneas se parten sin máscara: una máscara recorta las colas de la
  // tipografía (la "g", la "y") cuando la animación está atada al scroll y no
  // puede revertirse al terminar.
  // Largo real de cada trazo. No se usa pathLength="1": GSAP redondea los
  // valores en px a enteros y un trazo de largo 1 saltaba de oculto a
  // completo, sin dibujarse.
  root.value.querySelectorAll('.braid__strand, .braid__fiber').forEach((path) => {
    const length = Math.ceil(path.getTotalLength())
    path.dataset.length = length
    path.style.strokeDasharray = length
    path.style.strokeDashoffset = length
  })

  const title = SplitText.create('.alliance__title', { type: 'lines' })
  const lead = SplitText.create('.alliance__lead', { type: 'lines' })

  gsap
    .timeline({
      // Arranca cuando la sección todavía está entrando (no recién cuando
      // toca arriba): los logos ya vienen viajando y no hay un tramo de
      // pantalla vacía antes del encuentro.
      scrollTrigger: { trigger: root.value, start: 'top 70%', end: 'bottom bottom', scrub: 0.7 },
    })
    .fromTo(
      '.alliance__logo--byloa',
      { x: offscreen(-1), rotate: -9, scale: 0.78, opacity: 0 },
      { x: 0, rotate: 0, scale: 1, opacity: 1, duration: LAND, ease: 'power2.inOut' },
      0,
    )
    .fromTo(
      '.alliance__logo--seim',
      { x: offscreen(1), rotate: 9, scale: 0.78, opacity: 0 },
      { x: 0, rotate: 0, scale: 1, opacity: 1, duration: 0.55, ease: 'power2.inOut' },
      0,
    )
    // Las hebras salen cada una de su logo y se encuentran en el medio. Se
    // dibujan juntas y a la misma velocidad: la de ByLoa pasa por el centro
    // en el mismo instante que la de Seim, y ahí se enciende el nodo central.
    .fromTo('.braid__strand', { strokeDashoffset: (_, el) => el.dataset.length }, { strokeDashoffset: 0, duration: DRAW, ease: 'none' }, DRAW_AT)
    .fromTo('.braid__fiber', { strokeDashoffset: (_, el) => el.dataset.length }, { strokeDashoffset: 0, duration: DRAW, ease: 'none' }, DRAW_AT + 0.05)
    // El centro se enciende cuando las dos hebras llegan a la mitad; los
    // cruces de afuera, cuando cada hebra terminó de atravesarlos (al 75%).
    // Se anima el radio y no la escala: escalar un círculo SVG desde 0 hace
    // que GSAP calcule mal su centro y lo deje corrido, fuera del cruce.
    .fromTo(
      '.braid__core',
      { attr: { r: 0 }, opacity: 0 },
      { attr: { r: CORE_R }, opacity: 1, duration: 0.07, ease: 'back.out(3)' },
      DRAW_AT + DRAW * 0.5,
    )
    .fromTo(
      '.braid__node',
      { attr: { r: 0 }, opacity: 0 },
      { attr: { r: NODE_R }, opacity: 1, duration: 0.06, ease: 'back.out(3)' },
      DRAW_AT + DRAW * 0.75,
    )
    // Conectadas: el flujo empieza a recorrer las hebras.
    .fromTo('.braid__flow, .braid__pulse', { opacity: 0 }, { opacity: 1, duration: 0.08 }, DRAW_AT + DRAW)
    // Los logos acusan el encuentro con un leve latido.
    .to('.alliance__logo', { scale: 1.04, duration: 0.04, ease: 'power2.out' }, DRAW_AT + DRAW * 0.5)
    .to('.alliance__logo', { scale: 1, duration: 0.07, ease: 'power2.inOut' }, DRAW_AT + DRAW * 0.5 + 0.04)
    .fromTo(title.lines, { y: 36, opacity: 0 }, { y: 0, opacity: 1, duration: 0.18, stagger: 0.05, ease: 'expo.out' }, 0.66)
    .fromTo(lead.lines, { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.16, stagger: 0.03, ease: 'expo.out' }, 0.77)
    .fromTo('.alliance__cap', { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 0.15, stagger: 0.04, ease: 'expo.out' }, 0.87)
})
</script>

<template>
  <section ref="root" class="alliance">
    <div class="alliance__stage">
      <div class="alliance__lockup">
        <img
          class="alliance__logo alliance__logo--byloa logo-adapt"
          src="/logotipos_logotipodescriptorv2 negativo.png"
          alt="ByLoa"
          width="1833"
          height="861"
          loading="lazy"
        />
        <!-- Trenza: estrategia y tecnología entrelazadas -->
        <svg class="braid" :viewBox="`0 0 ${W} ${H}`" aria-hidden="true">
          <defs>
            <linearGradient id="braid-gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" class="braid__stop--byloa" />
              <stop offset="0.5" class="braid__stop--mid" />
              <stop offset="1" class="braid__stop--seim" />
            </linearGradient>
          </defs>
          <path v-for="(d, i) in fibers" :key="i" class="braid__fiber" :d="d" />
          <path class="braid__strand" :d="strandByloa" />
          <path class="braid__strand" :d="strandSeim" />
          <!-- Flujo: un brillo corto que recorre cada hebra, en sentidos opuestos -->
          <path class="braid__flow" :d="strandByloa" pathLength="1" />
          <path class="braid__flow braid__flow--seim" :d="strandSeim" pathLength="1" />
          <circle v-for="x in nodes" :key="x" class="braid__node" :cx="x" :cy="H / 2" :r="NODE_R" />
          <circle class="braid__pulse" :cx="W / 2" :cy="H / 2" r="5" />
          <circle class="braid__core" :cx="W / 2" :cy="H / 2" :r="CORE_R" />
        </svg>
        <img class="alliance__logo alliance__logo--seim logo-adapt" src="/LogoSeimBeige.png" alt="Seim Interactive" width="1645" height="853" loading="lazy" />
      </div>

      <div class="alliance__copy">
        <h2 class="alliance__title">
          Estrategia de marca y tecnología<br />
          <em>en el mismo equipo</em>.
        </h2>

        <p class="alliance__lead">
          Cuando un proyecto necesita web, software o desarrollo a medida, ByLoa trabaja con
          <a href="https://web.seiminteractive.io" target="_blank" rel="noopener">Seim Interactive</a>.
          El mensaje, el diseño y el producto digital salen alineados desde el primer día.
        </p>

        <ul class="alliance__caps">
          <li v-for="capability in capabilities" :key="capability" class="alliance__cap">
            {{ capability }}
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* El alto de la sección es el recorrido: 1 pantalla quieta + 1,6 de scroll. */
.alliance {
  position: relative;
  z-index: var(--z-content);
  /* Una pantalla quieta + el recorrido. Antes 260svh: se sentía mucho scroll
     hasta llegar al encuentro. */
  height: 200svh;
}

.alliance__stage {
  position: sticky;
  top: 0;
  display: grid;
  align-content: center;
  justify-items: center;
  gap: clamp(2rem, 1rem + 3vw, 3.5rem);
  height: 100svh;
  padding: calc(var(--header-h) + 1.5rem) var(--gutter) 3rem;
  overflow: hidden;
}

/* ---- Encuentro ---- */

.alliance__lockup {
  position: relative;
  display: flex;
  align-items: center;
  gap: clamp(0.5rem, 0.25rem + 1.2vw, 1.5rem);
}

.alliance__logo {
  /* Los logos son el protagonista de la sección: van bastante más grandes
     que el texto de abajo. */
  height: clamp(3.75rem, 2rem + 6.5vw, 8.5rem);
  width: auto;
  object-fit: contain;
  opacity: 0;
  will-change: transform, opacity;
}

/* Trenza entre los dos logos. Los colores van por variables para que el
   tema claro use sus versiones más oscuras. */
.braid {
  width: clamp(7rem, 2rem + 17vw, 22rem);
  height: auto;
  overflow: visible;
}

.braid__stop--byloa {
  stop-color: var(--c-magenta);
}

.braid__stop--mid {
  stop-color: var(--c-pink);
}

.braid__stop--seim {
  stop-color: var(--c-lavender);
}

.braid__fiber {
  fill: none;
  stroke: url(#braid-gradient);
  stroke-width: 0.8;
  stroke-linecap: round;
  /* Oculto hasta que el script mida el largo real del trazo. */
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  opacity: 0.4;
}

.braid__strand {
  fill: none;
  stroke: url(#braid-gradient);
  stroke-width: 1.6;
  stroke-linecap: round;
  /* Se dibuja animando el offset del largo del trazo a 0 (lo mide el script). */
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
}

/* Brillo que recorre cada hebra: un tramo corto del trazo, en loop. */
.braid__flow {
  fill: none;
  stroke: var(--c-fg);
  stroke-width: 2.2;
  stroke-linecap: round;
  stroke-dasharray: 0.07 0.93;
  opacity: 0;
  filter: drop-shadow(0 0 3px var(--c-pink));
  animation: braid-flow 2.6s linear infinite;
}

.braid__flow--seim {
  filter: drop-shadow(0 0 3px var(--c-lavender));
  animation-delay: -1.3s;
}

/* En claro el brillo no puede ser del color del texto (se lee como una raya
   oscura): va en magenta. */
:root[data-theme='light'] .braid__flow {
  stroke: var(--c-magenta);
  filter: none;
}

@keyframes braid-flow {
  from {
    stroke-dashoffset: 1;
  }
  to {
    stroke-dashoffset: 0;
  }
}

.braid__node {
  fill: var(--c-fg);
  opacity: 0;
}

/* El cruce del centro: el punto donde las dos se encuentran. */
.braid__core {
  fill: var(--c-pink);
  opacity: 0;
  filter: drop-shadow(0 0 6px var(--c-pink));
}

.braid__pulse {
  fill: none;
  stroke: var(--c-pink);
  stroke-width: 1;
  opacity: 0;
  transform-box: fill-box;
  transform-origin: center;
  animation: braid-pulse 2.2s cubic-bezier(0.16, 1, 0.3, 1) infinite;
}

@keyframes braid-pulse {
  from {
    transform: scale(1);
    stroke-opacity: 0.9;
  }
  to {
    transform: scale(4.2);
    stroke-opacity: 0;
  }
}

/* ---- Texto ---- */

.alliance__copy {
  display: grid;
  justify-items: center;
  gap: clamp(1rem, 0.75rem + 1vw, 1.75rem);
  width: 100%;
  max-width: 50rem;
  text-align: center;
}

.alliance__title {
  font-family: var(--font-display);
  font-size: clamp(1.6rem, 1.1rem + 2vw, 2.75rem);
  font-weight: 400;
  letter-spacing: -0.025em;
  line-height: 1.08;
}

.alliance__title em {
  font-family: var(--font-serif);
  font-style: italic;
  color: var(--c-muted);
}

.alliance__lead {
  max-width: 46ch;
  color: var(--c-muted);
  font-size: var(--fs-body);
  line-height: 1.6;
}

.alliance__lead a {
  color: var(--c-fg);
  text-decoration: underline;
  text-decoration-color: var(--c-magenta);
  text-underline-offset: 0.3em;
}

.alliance__lead a:hover {
  color: var(--c-pink);
}

/* Una sola línea de capacidades separadas por filetes. Antes eran píldoras
   con borde redondeado: mucho ornamento para lo que dicen. */
.alliance__caps {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 0.5rem;
}

.alliance__cap {
  padding-inline: clamp(0.75rem, 0.5rem + 1vw, 1.5rem);
  color: var(--c-muted);
  font-size: var(--fs-small);
  line-height: 1.4;
  opacity: 0;
}

.alliance__cap + .alliance__cap {
  border-left: 1px solid var(--c-line);
}

@media (max-width: 900px) {
  .alliance {
    height: 185svh;
  }

  .alliance__stage {
    gap: 2rem;
  }

  .alliance__cap {
    padding-inline: 0.6rem;
    font-size: var(--fs-micro);
  }

  /* En mobile los logos siguen siendo protagonistas, pero los tres elementos
     tienen que entrar en el ancho sin tocar los bordes. */
  .alliance__logo {
    height: clamp(2.6rem, 1rem + 7vw, 3.6rem);
  }

  .braid {
    width: clamp(5rem, 22vw, 8rem);
  }

  /* En mobile, 2×2 con el filete sólo entre columnas: en una fila libre
     el corte quedaba 3 + 1 y los filetes sueltos. */
  .alliance__caps {
    display: grid;
    grid-template-columns: repeat(2, auto);
    justify-content: center;
    row-gap: 0.6rem;
  }

  .alliance__cap + .alliance__cap {
    border-left: 0;
  }

  .alliance__cap:nth-child(even) {
    border-left: 1px solid var(--c-line);
  }
}
</style>
