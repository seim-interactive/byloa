/**
 * Crea animaciones GSAP dentro de un `gsap.context` limitado al elemento `scope`.
 * - Los selectores ('.foo') solo matchean dentro del scope.
 * - Al desmontar el componente se revierten todas las animaciones y
 *   ScrollTriggers creados en el setup (evita leaks entre vistas).
 * - Espera a que las fuentes estén listas: SplitText parte el texto en líneas
 *   midiendo el DOM, y si Coolvetica llega después, los cortes
 *   quedan en el lugar equivocado.
 *
 * El `ScrollTrigger.refresh()` NO va acá: remedir una vez por componente, y
 * encima de forma asincrónica, hace saltar las secciones ancladas. Lo dispara
 * una sola vez la vista raíz (ver `useScrollSetup`).
 */
import { onBeforeUnmount, onMounted } from 'vue'
import { gsap } from '@/animations/gsap'

export function useGsap(scope, setup) {
  let ctx
  let cancelled = false

  onMounted(async () => {
    try {
      await document.fonts?.ready
    } catch {
      // Sin Font Loading API se anima igual, con la métrica que haya.
    }
    if (cancelled) return
    ctx = gsap.context(setup, scope.value ?? undefined)
  })

  onBeforeUnmount(() => {
    cancelled = true
    ctx?.revert()
  })

  return { getContext: () => ctx }
}
