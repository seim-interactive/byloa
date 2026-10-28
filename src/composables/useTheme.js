/**
 * Tema claro / oscuro.
 *
 * La fuente de verdad es el atributo `data-theme` de <html>. Lo pone un script
 * en index.html antes de pintar (leyendo la elección guardada), y desde acá
 * se cambia y se recuerda. Los colores salen de los tokens, así que cambiar el
 * atributo alcanza para repintar todo; el fondo WebGL escucha `theme`.
 *
 * El cambio es una cortina circular que nace en el botón (ver `setTheme`).
 */
import { ref } from 'vue'

const KEY = 'byloa-theme'
const META_COLOR = { dark: '#050308', light: '#f5f2ed' }

const root = document.documentElement

export const theme = ref(root.dataset.theme === 'light' ? 'light' : 'dark')

/** Callbacks a correr *dentro* del cambio, antes de la captura del estado nuevo. */
const syncHooks = new Set()

/**
 * Registra algo que tiene que quedar actualizado en el mismo cuadro del cambio
 * de tema (el canvas WebGL: si viajara suave hacia la paleta nueva, al
 * destaparse la cortina se vería todavía el humo del tema viejo).
 */
export function onThemeSync(fn) {
  syncHooks.add(fn)
  return () => syncHooks.delete(fn)
}

const apply = (next) => {
  root.dataset.theme = next
  theme.value = next
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', META_COLOR[next])
  syncHooks.forEach((fn) => fn(next))
}

const remember = (next) => {
  try {
    localStorage.setItem(KEY, next)
  } catch {
    // Navegación privada o almacenamiento bloqueado: el tema dura la sesión.
  }
}

/**
 * Colores de la ola, del frente hacia atrás: dos bandas de marca y, al final,
 * el fondo del tema nuevo, que es el que termina tapando la pantalla.
 */
const WAVE = {
  dark: ['#f46ebb', '#3a2552', '#050308'],
  light: ['#fcb9d9', '#c9b2ec', '#f5f2ed'],
}

/** Tiempos de la cortina, en ms. */
const GROW = 640 // lo que tarda cada disco en cubrir la pantalla
const STAGGER = 80 // retraso entre discos: el ancho de cada banda de color
const MARK_IN = 380 // cuándo empieza a entrar el asterisco
const MARK_DURATION = 560
const EXIT = 460 // salida: el asterisco "atraviesa" y la cortina se desvanece

/** El asterisco se precarga: en el momento del cambio tiene que estar listo. */
const MARK_SRC = '/brand-asterisk.png'
new Image().src = MARK_SRC

/** Una cortina a la vez: un doble click no arranca otra encima. */
let switching = false

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve))
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Cambia el tema con una cortina en tres tiempos:
 *
 * 1. Ola: tres discos salen escalonados desde el botón —rosa, violeta y el
 *    fondo del tema nuevo—. El borde que avanza deja bandas de color.
 * 2. Marca: con la pantalla casi cubierta, el asterisco de ByLoa entra girando
 *    en el centro. Debajo de la cortina ya tapada se cambia el tema.
 * 3. Salida: el asterisco se agranda y gira hacia el espectador mientras la
 *    cortina se desvanece y deja ver la página ya repintada.
 *
 * Todo es `transform` y `opacity`, que el navegador anima en el hilo del
 * compositor: el trabajo de la página (el humo WebGL, el anillo) no puede
 * trabar la animación. Por eso no se usan View Transitions: aquella versión
 * revelaba una vista en vivo de la página que el navegador recomponía en cada
 * cuadro, y en GPUs reales se trababa a mitad de camino.
 *
 * `origin` es el punto (en px de viewport) desde donde sale la ola.
 */
export async function setTheme(next, origin) {
  if (next === theme.value || switching) return
  switching = true
  remember(next)

  const width = window.innerWidth
  const height = window.innerHeight
  const x = origin?.x ?? width / 2
  const y = origin?.y ?? 0
  // Radio hasta la esquina más lejana (+2px de margen): termina cubriendo todo.
  const radius = Math.hypot(Math.max(x, width - x), Math.max(y, height - y)) + 2

  const curtain = document.createElement('div')
  curtain.className = 'theme-curtain'
  curtain.dataset.to = next
  curtain.setAttribute('aria-hidden', 'true')

  const discs = WAVE[next].map((color) => {
    const disc = document.createElement('div')
    disc.className = 'theme-curtain__disc'
    Object.assign(disc.style, {
      left: `${x - radius}px`,
      top: `${y - radius}px`,
      width: `${radius * 2}px`,
      height: `${radius * 2}px`,
      background: color,
    })
    curtain.appendChild(disc)
    return disc
  })

  const mark = document.createElement('img')
  mark.className = 'theme-curtain__mark'
  mark.src = MARK_SRC
  mark.alt = ''
  curtain.appendChild(mark)
  document.body.appendChild(curtain)

  try {
    // 1. Ola. Desde casi cero (un scale(0) puede caer fuera del compositor).
    const grow = discs.map((disc, i) =>
      disc.animate([{ transform: 'scale(0.001)' }, { transform: 'scale(1)' }], {
        duration: GROW,
        delay: i * STAGGER,
        easing: 'cubic-bezier(0.7, 0, 0.25, 1)',
        fill: 'both',
      }).finished,
    )

    // 2. Marca: entra girando mientras la ola termina de cubrir.
    const markIn = mark.animate(
      [
        { opacity: 0, transform: 'translate(-50%, -50%) scale(0.35) rotate(-140deg)' },
        { opacity: 1, transform: 'translate(-50%, -50%) scale(1) rotate(0deg)' },
      ],
      { duration: MARK_DURATION, delay: MARK_IN, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'both' },
    ).finished

    await Promise.all(grow)

    // Con la pantalla cubierta, el cambio no se ve: sin transiciones CSS para
    // que todo quede en su color final de una vez, y dos cuadros para que el
    // tema nuevo ya esté pintado debajo antes de destapar.
    root.classList.add('theme-switching')
    apply(next)
    await nextFrame()
    await nextFrame()
    root.classList.remove('theme-switching')

    await markIn
    await wait(60)

    // 3. Salida: la marca se acerca y la cortina se desvanece.
    await Promise.all([
      mark.animate(
        [
          { transform: 'translate(-50%, -50%) scale(1) rotate(0deg)' },
          { transform: 'translate(-50%, -50%) scale(2.6) rotate(55deg)' },
        ],
        { duration: EXIT, easing: 'cubic-bezier(0.55, 0, 0.2, 1)', fill: 'forwards' },
      ).finished,
      curtain.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: EXIT,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        fill: 'forwards',
      }).finished,
    ])
  } finally {
    // Pase lo que pase, el tema queda aplicado y la cortina se va.
    if (theme.value !== next) apply(next)
    curtain.remove()
    switching = false
  }
}

export function toggleTheme(origin) {
  setTheme(theme.value === 'dark' ? 'light' : 'dark', origin)
}

/** Para rutas que sólo existen en oscuro (login, panel): fuerza sin guardar. */
export function forceThemeFor(next) {
  if (root.dataset.theme !== next) apply(next)
}

/** El tema elegido por la persona, para volver a él al salir de esas rutas. */
export function savedTheme() {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    // sin almacenamiento
  }
  return 'dark'
}
