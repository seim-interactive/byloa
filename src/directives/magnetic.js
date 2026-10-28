/**
 * v-magnetic: el elemento se acerca al cursor cuando pasa cerca y vuelve a su
 * lugar al salir. Sólo con mouse: en touch no hay hover.
 */
import { gsap, isTouchDevice } from '@/animations/gsap'

/** Cuánto se deja arrastrar el elemento, como fracción de su tamaño. */
const PULL = 0.35

export const vMagnetic = {
  mounted(el) {
    if (isTouchDevice()) return

    const move = (event) => {
      const rect = el.getBoundingClientRect()
      gsap.to(el, {
        x: (event.clientX - (rect.left + rect.width / 2)) * PULL,
        y: (event.clientY - (rect.top + rect.height / 2)) * PULL,
        duration: 0.6,
        ease: 'power3.out',
      })
    }

    const leave = () => gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' })

    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    el._magnetic = () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
      gsap.killTweensOf(el)
    }
  },

  unmounted(el) {
    el._magnetic?.()
  },
}
