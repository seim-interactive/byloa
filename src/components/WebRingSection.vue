<script setup>
/**
 * Anillo de webs hechas entre ByLoa y Seim.
 *
 * El bloque se llama `webring` y no `ring` a propósito: `ring` es además una
 * utilidad de Tailwind y le dibujaba a la sección un `box-shadow` de 1px del
 * color del texto, que se veía como una línea cruzando la pantalla arriba y
 * abajo de la sección.
 *
 * Las cards forman un cilindro en 3D: cada una se gira sobre el eje Y según su
 * lugar en el círculo y se empuja hacia afuera `translateZ(radio)`. El radio
 * sale del ancho real de la card, así el anillo se arma bien en cualquier
 * pantalla sin números mágicos.
 *
 * El orden de las transformaciones importa: tiene que ser `rotateY()` y
 * después `translateZ()`. Al revés se mueve la card sin girar el eje y el
 * círculo no cierra. Por eso se escribe el `transform` a mano y no con
 * `gsap.set({ rotationY, z })`, que siempre traslada antes de rotar.
 *
 * Las cards son tangentes al círculo, como en un anillo real. El problema de
 * un anillo real es la mitad de atrás: se vería espejada y con el texto al
 * revés. Por eso cada card tiene dos caras iguales, cada una ocultando su
 * reverso: se la mire del lado que se la mire, muestra la portada derecha y
 * con su luz normal.
 *
 * El anillo gira solo y se puede arrastrar: mantener apretado y mover hacia
 * los costados lo hace girar, y al soltar sigue con la inercia del gesto hasta
 * frenar y volver a su giro lento. No sigue al cursor.
 */
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { gsap, splitMasked } from '@/animations/gsap'
import { useGsap } from '@/composables/useGsap'
import { useAmbientMood } from '@/composables/useAmbient'

const sites = [
  { name: 'Nacho Scoppa', domain: 'nachoscoppa.com', url: 'https://nachoscoppa.com/', shot: '/web/nachoscoppa.jpg' },
  { name: 'Service Taller Móvil', domain: 'servicetallermovil.com', url: 'https://servicetallermovil.com/', shot: '/web/servicetallermovil.jpg' },
  { name: 'WECC', domain: 'wecc.io', url: 'https://wecc.io/', shot: '/web/wecc.jpg' },
  { name: 'Pura Vida', domain: 'wearepuravida.com', url: 'https://wearepuravida.com/', shot: '/web/wearepuravida.jpg' },
  { name: 'BACS Broker', domain: 'bacsbroker.com', url: 'https://bacsbroker.com/', shot: '/web/bacsbroker.jpg' },
  { name: 'Aplick', domain: 'aplick.vercel.app', url: 'https://aplick.vercel.app/', shot: '/web/aplick.jpg' },
]

/** Grados por segundo del giro automático. */
const SPIN = 7
/** Grados de giro por píxel arrastrado. */
const DRAG = 0.35
/** Qué tan rápido frena la inercia al soltar (más alto, frena antes). */
const FRICTION = 2.6
/** Distancia mínima para que un toque cuente como arrastre y no como click. */
const DRAG_THRESHOLD = 6
/** Tope de la inercia (grados por segundo): un tirón fuerte gira como una
 *  ruleta, pero no da tres vueltas seguidas. */
const MAX_VELOCITY = 420
/** Inclinación de base. Es lo que convierte la pared de cards en un anillo:
 *  el círculo se ve como elipse y las de atrás quedan más chicas y arriba.
 *  En pantallas angostas el anillo es chico y, con el mismo ángulo, se ve como
 *  una caja abierta en vez de un anillo: ahí va bastante menos. */
const baseTilt = () => (window.innerWidth < 700 ? -7 : -14)

const root = ref(null)
const stage = ref(null)
const cylinder = ref(null)
const cards = []

useAmbientMood(root, 'web')

const step = 360 / sites.length

/** Estado del giro, todo en grados. */
let spin = 0
let drag = 0
/** Velocidad que deja el arrastre al soltar, en grados por segundo. */
let velocity = 0

/** Cuánto se separa el anillo respecto del radio mínimo. En el radio exacto
 *  las cards quedan borde con borde, como las caras de un prisma. En desktop
 *  hay lugar para abrirlo bastante más: las cards respiran y se ve el círculo
 *  entre ellas. En mobile el ancho no da y se queda casi cerrado. */
const spread = () => (window.innerWidth < 700 ? 1.22 : 1.75)

/**
 * Cuánto ocupa el anillo a cada lado, en píxeles de pantalla, para un radio
 * dado. No alcanza con el radio: la perspectiva agranda las cards que quedan
 * cerca del observador, así que la de adelante se proyecta bastante más ancha
 * de lo que mide. Se recorre el círculo y se mide la proyección real de cada
 * posición.
 */
const projectedHalfWidth = (r, cardWidth, perspective) => {
  let max = 0
  for (let deg = 0; deg < 360; deg += 5) {
    const t = (deg * Math.PI) / 180
    const z = r * Math.cos(t)
    if (z >= perspective) return Infinity
    const scale = perspective / (perspective - z)
    const edge = Math.abs(r * Math.sin(t)) + (cardWidth / 2) * Math.abs(Math.cos(t))
    max = Math.max(max, edge * scale)
  }
  return max
}

const radius = () => {
  const card = cards[0]?.offsetWidth ?? 0
  const ideal = (card / 2 / Math.tan(Math.PI / sites.length)) * spread()
  const stageWidth = stage.value?.clientWidth ?? 0
  if (!stageWidth || !card) return ideal

  const perspective = parseFloat(getComputedStyle(stage.value).perspective) || 1300
  const limit = (stageWidth / 2) * 0.97

  // El ancho proyectado crece casi lineal con el radio, así que un par de
  // correcciones alcanzan para encontrar el radio más grande que entra.
  let r = ideal
  for (let i = 0; i < 4; i++) {
    const half = projectedHalfWidth(r, card, perspective)
    if (half <= limit) break
    r *= limit / half
  }
  return r
}

/** El radio vigente. Se recalcula al montar y en cada resize. */
let ringRadius = 0

const layout = () => {
  ringRadius = radius()
  apply()
}

const apply = () => {
  if (!cylinder.value) return
  // El cilindro sólo se inclina; el giro lo lleva cada card, porque necesita
  // conocer su propio ángulo para enderezarse.
  cylinder.value.style.transform = `rotateX(${baseTilt()}deg)`

  const y = spin + drag
  cards.forEach((card, i) => {
    if (!card) return
    // Tangente al círculo: la card queda pegada al anillo, no mirando al frente.
    card.style.transform = `rotateY(${y + i * step}deg) translateZ(${ringRadius}px)`
  })
}

const tick = (_t, deltaMs) => {
  const dt = Math.min(deltaMs, 50) / 1000
  if (!dragging) {
    spin -= SPIN * dt
    // Inercia del último arrastre, que se apaga de forma exponencial.
    if (velocity) {
      drag += velocity * dt
      velocity *= Math.exp(-FRICTION * dt)
      if (Math.abs(velocity) < 1) velocity = 0
    }
  }
  apply()
}

/* ------------------------------------------------------------- puntero */

let pressed = false
let dragging = false
let lastX = 0
let lastT = 0
let travelled = 0

const onDown = (event) => {
  if (event.pointerType === 'mouse' && event.button !== 0) return
  pressed = true
  dragging = false
  lastX = event.clientX
  lastT = performance.now()
  travelled = 0
  velocity = 0
}

const onMove = (event) => {
  if (!pressed) return
  const dx = event.clientX - lastX
  lastX = event.clientX
  travelled += Math.abs(dx)

  // Recién pasado el umbral es un arrastre: se captura el puntero para seguir
  // girando aunque salga del escenario. Capturarlo antes rompería el click
  // de las cards (el click iría al escenario y no al link).
  if (!dragging) {
    if (travelled < DRAG_THRESHOLD) return
    dragging = true
    stage.value?.setPointerCapture?.(event.pointerId)
  }

  const now = performance.now()
  const delta = dx * DRAG
  drag += delta
  const dt = Math.max(now - lastT, 1) / 1000
  // Velocidad suavizada: un último movimiento brusco no la dispara.
  velocity = velocity * 0.6 + (delta / dt) * 0.4
  lastT = now
}

const onUp = (event) => {
  pressed = false
  if (!dragging) return
  dragging = false
  // Si el puntero quedó quieto antes de soltar, no hay inercia.
  if (performance.now() - lastT > 90) velocity = 0
  velocity = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, velocity))
  stage.value?.releasePointerCapture?.(event.pointerId)
}

/** Si el gesto fue un arrastre, no cuenta como click en la card. */
const onCardClick = (event) => {
  if (travelled > 8) {
    event.preventDefault()
    travelled = 0
  }
}

/* -------------------------------------------------------------- setup */

let resizeObserver

onMounted(() => {
  layout()
  gsap.ticker.add(tick)
  resizeObserver = new ResizeObserver(layout)
  if (stage.value) resizeObserver.observe(stage.value)
})

onBeforeUnmount(() => {
  gsap.ticker.remove(tick)
  resizeObserver?.disconnect()
})

useGsap(root, () => {
  const title = splitMasked('.webring__title')
  gsap
    .timeline({
      scrollTrigger: { trigger: root.value, start: 'top 75%', once: true },
      defaults: { ease: 'expo.out' },
    })
    .set('.webring__head', { opacity: 1 })
    .from('.webring__head .eyebrow', { opacity: 0, y: 18, duration: 1 }, 0)
    .from(title.lines, { yPercent: 115, duration: 1.2, stagger: 0.07 }, 0.1)
    .from('.webring__lead', { opacity: 0, y: 22, duration: 1 }, 0.3)
    .fromTo('.webring__stage', { opacity: 0, scale: 0.86 }, { opacity: 1, scale: 1, duration: 1.6 }, 0.25)
})
</script>

<template>
  <section id="webring" ref="root" class="webring">
    <header class="webring__head">
      <p class="eyebrow">ByLoa × Seim</p>
      <h2 class="section-title webring__title">Webs que construimos juntos</h2>
      <p class="webring__lead">
        Sitios y plataformas donde la estrategia de marca y el desarrollo salieron del mismo equipo.
        Arrastrá el anillo hacia los costados para girarlo.
      </p>
    </header>

    <div
      ref="stage"
      class="webring__stage"
      @pointermove="onMove"
      @pointerdown="onDown"
      @pointerup="onUp"
      @pointercancel="onUp"
    >
      <div ref="cylinder" class="webring__cylinder">
        <a
          v-for="(site, i) in sites"
          :key="site.domain"
          :ref="(el) => (cards[i] = el)"
          class="webring__card"
          :href="site.url"
          target="_blank"
          rel="noopener"
          draggable="false"
          @dragstart.prevent
          @click="onCardClick"
        >
          <span class="webring__face webring__face--front">
            <img :src="site.shot" :alt="`Sitio de ${site.name}`" loading="lazy" draggable="false" />
            <span class="webring__label on-media">
              <span class="webring__name">{{ site.name }}</span>
              <span class="webring__domain">{{ site.domain }}</span>
            </span>
          </span>
          <span class="webring__face webring__face--back" aria-hidden="true">
            <img :src="site.shot" alt="" loading="lazy" draggable="false" />
            <span class="webring__label on-media">
              <span class="webring__name">{{ site.name }}</span>
              <span class="webring__domain">{{ site.domain }}</span>
            </span>
          </span>
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.webring {
  position: relative;
  z-index: var(--z-content);
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: clamp(2rem, 1.5rem + 2vw, 3.5rem);
  padding-block: var(--section-space);
}

.webring__head {
  display: grid;
  gap: 1.25rem;
  padding-inline: var(--gutter);
  opacity: 0;
}

.webring__lead {
  max-width: 48ch;
  color: var(--c-muted);
  font-size: var(--fs-body);
  line-height: 1.6;
}

/* ---- Escenario 3D ---- */

.webring__stage {
  position: relative;
  display: grid;
  place-items: center;
  /* Alto generoso: el anillo abierto necesita aire arriba y abajo. */
  height: clamp(20rem, 34vw, 32rem);
  perspective: 1500px;
  opacity: 0;
  touch-action: pan-y;
  cursor: grab;
}

.webring__stage:active {
  cursor: grabbing;
}

/* Resplandor que apoya el anillo sobre el fondo en vez de dejarlo flotando. */
.webring__stage::after {
  content: '';
  position: absolute;
  bottom: 8%;
  left: 50%;
  width: min(70%, 44rem);
  height: 40%;
  translate: -50% 0;
  background: radial-gradient(ellipse at center, rgb(120 90 220 / 0.22), transparent 68%);
  pointer-events: none;
}

.webring__cylinder {
  position: relative;
  z-index: 1;
  width: clamp(8rem, 17vw, 17.5rem);
  aspect-ratio: 16 / 10;
  transform-style: preserve-3d;
  will-change: transform;
}

.webring__card {
  position: absolute;
  inset: 0;
  /* El transform lo escribe el script: rotateY y después translateZ. */
  transform-style: preserve-3d;
}

/* Las dos caras de la card. Cada una oculta su reverso, así desde adelante se
   ve el sitio y desde atrás el dorso, nunca el sitio espejado. */
.webring__face {
  position: absolute;
  inset: 0;
  overflow: hidden;
  /* Sin borde: de canto, un borde de 1px se ve como una raya suelta flotando
     en el aire. El recorte de la card ya la define sola. */
  border-radius: 12px;
  backface-visibility: hidden;
  box-shadow: 0 24px 50px -24px rgb(0 0 0 / 0.75);
}

.webring__face--front,
.webring__face--back {
  background: #0a0a12;
}

/* El dorso es la misma portada: rotada 180° respecto de la card, así que
   cuando la card queda de espaldas este lado mira al frente y se lee derecho. */
.webring__face--back {
  transform: rotateY(180deg);
}

.webring__card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
  user-select: none;
  -webkit-user-drag: none;
}

.webring__label {
  position: absolute;
  inset: auto 0 0;
  z-index: 1;
  display: grid;
  gap: 0.15rem;
  padding: 1.75rem 0.7rem 0.55rem;
  background: linear-gradient(to top, rgb(5 3 8 / 0.92), transparent);
  pointer-events: none;
}

.webring__name {
  color: var(--c-fg);
  font-size: var(--fs-micro);
  line-height: 1.2;
}

.webring__domain {
  color: var(--c-faint);
  font-size: 0.5625rem;
  letter-spacing: 0.06em;
}

@media (max-width: 700px) {
  .webring__stage {
    height: clamp(14rem, 52vw, 19rem);
    /* Perspectiva más corta en pantallas chicas: el anillo es más angosto y
       necesita más profundidad para seguir leyéndose. */
    perspective: 780px;
  }

  .webring__cylinder {
    /* El anillo ocupa casi todo el ancho: con cards más grandes el sitio de
       adelante se lee, y las de los costados quedan de canto igual que en
       desktop. A 44vw quedaban borde con borde y el anillo se veía cerrado. */
    width: 38vw;
  }

  .webring__label {
    padding: 1.4rem 0.6rem 0.45rem;
  }
}
</style>
