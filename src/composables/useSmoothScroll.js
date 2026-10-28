/**
 * Smooth scroll con Lenis, sincronizado con el ticker de GSAP y ScrollTrigger.
 * Se inicializa una sola vez desde la vista raíz; el resto accede con `getLenis()`.
 */
import Lenis from 'lenis'
import { onBeforeUnmount, onMounted } from 'vue'
import { gsap, ScrollTrigger } from '@/animations/gsap'

let lenis = null

const raf = (time) => lenis?.raf(time * 1000)

export const getLenis = () => lenis

/** Scrollea a un selector respetando la altura del header fijo. */
export function scrollToSection(selector) {
  const target = document.querySelector(selector)
  if (!target) return
  if (lenis) lenis.scrollTo(target, { offset: -80, duration: 1.4 })
  else target.scrollIntoView({ behavior: 'smooth' })
}

/** Bloquea el scroll (menú abierto). Admite llamadas anidadas. */
let locks = 0

export function lockScroll() {
  locks++
  lenis?.stop()
  document.documentElement.style.overflow = 'hidden'
}

export function unlockScroll() {
  locks = Math.max(0, locks - 1)
  if (locks > 0) return
  lenis?.start()
  document.documentElement.style.overflow = ''
}

export function useSmoothScroll() {
  onMounted(() => {
    lenis = new Lenis({ autoRaf: false, lerp: 0.09 })
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
  })

  onBeforeUnmount(() => {
    gsap.ticker.remove(raf)
    lenis?.destroy()
    lenis = null
  })
}
