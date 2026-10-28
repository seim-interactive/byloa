/**
 * Puesta a punto del scroll de la página, una sola vez desde la vista raíz.
 *
 * ScrollTrigger mide posiciones al crear cada trigger. Si el layout cambia
 * después (fuentes que terminan de cargar, imágenes sin alto reservado), hay
 * que remedir; pero si se remide con el usuario ya scrolleado dentro de una
 * sección anclada, la página pega un salto. Por eso acá se remide una sola
 * vez, temprano, y no una vez por componente.
 */
import { onBeforeUnmount, onMounted } from 'vue'
import { ScrollTrigger } from '@/animations/gsap'
import { useSmoothScroll } from '@/composables/useSmoothScroll'

export function useScrollSetup() {
  useSmoothScroll()

  let raf = 0

  onMounted(async () => {
    // En mobile, la barra del navegador que aparece y desaparece cuenta como
    // resize y dispararía refrescos (y saltos) durante el scroll normal.
    ScrollTrigger.config({ ignoreMobileResize: true })

    try {
      await document.fonts?.ready
    } catch {
      // Sin Font Loading API se sigue igual.
    }
    // Dos cuadros para que los componentes ya hayan creado sus triggers.
    raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => ScrollTrigger.refresh())
    })
  })

  onBeforeUnmount(() => cancelAnimationFrame(raf))
}
