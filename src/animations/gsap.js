/**
 * Punto único de configuración de GSAP.
 * Registrar acá todos los plugins y defaults, e importar `gsap` desde este
 * módulo (no directo desde 'gsap') para asegurar que estén registrados.
 */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText)

gsap.defaults({
  duration: 0.9,
  ease: 'power3.out',
})

export const isTouchDevice = () => window.matchMedia('(pointer: coarse)').matches

/** Aire extra abajo de cada máscara, para que entren las colas de la letra. */
const DESCENDER_ROOM = '0.28em'

/**
 * Parte un texto en líneas enmascaradas, para revelarlo deslizándolo desde
 * abajo.
 *
 * El envoltorio que arma SplitText mide exactamente la caja de la línea, y
 * `overflow: clip` recorta ahí. Como las colas de la tipografía (la "y", la
 * "j", la "g", la "p") sobresalen de esa caja, quedan comidas todo el tiempo
 * que dura la animación y aparecen recién al final: el título se ve mocho y
 * después "se arregla".
 *
 * La solución es darle aire abajo al envoltorio —el recorte pasa por el borde
 * del padding, no del contenido— y compensarlo con margen negativo, así el
 * layout queda idéntico. Con esto la cola nunca se corta, ni siquiera en el
 * primer cuadro, y no hay que tocar nada cuando la animación termina.
 *
 * `type` admite 'lines' o 'lines,words' según se quiera escalonar por línea o
 * por palabra. Siempre se enmascara por línea: enmascarar por caracter obliga
 * a que cada letra sea su propia caja y se pierde el kerning.
 */
export function splitMasked(target, type = 'lines') {
  const split = SplitText.create(target, { type, mask: 'lines' })
  const wrappers = split.lines.map((line) => line.parentNode).filter(Boolean)
  gsap.set(wrappers, { paddingBottom: DESCENDER_ROOM, marginBottom: `-${DESCENDER_ROOM}` })
  return split
}

export { gsap, ScrollTrigger, SplitText }
