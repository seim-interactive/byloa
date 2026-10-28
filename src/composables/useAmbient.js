/**
 * Estado del fondo ambiental.
 *
 * El sitio tiene un único fondo animado a pantalla completa (AmbientBackground).
 * Cada sección no dibuja su propio degradado: declara un "mood" y el fondo
 * viaja hacia esa paleta mientras la sección está en pantalla. Así las
 * secciones se encadenan con una transición continua, sin los fades a negro
 * que cortaban el sitio en bloques sueltos.
 */
import { onBeforeUnmount, onMounted, reactive } from 'vue'
import { ScrollTrigger } from '@/animations/gsap'

/** #rrggbb -> [r, g, b] en 0..1, que es lo que espera el shader. */
const rgb = (hex) => [
  parseInt(hex.slice(1, 3), 16) / 255,
  parseInt(hex.slice(3, 5), 16) / 255,
  parseInt(hex.slice(5, 7), 16) / 255,
]

/**
 * Cada mood son cuatro paradas de color (de la sombra al brillo), el punto de
 * la pantalla donde se concentra la masa de humo (0..1, origen arriba a la
 * izquierda) y cuánta presencia tiene.
 *
 * `light` es la paleta del tema claro. No es la oscura invertida: la base es
 * el beige de marca y el humo son nubes rosa y lavanda, que es como se ve la
 * misma idea sobre papel.
 */
export const MOODS = {
  /* Portada: la masa quema abajo a la derecha, como el degradado original. */
  hero: {
    colors: [rgb('#050308'), rgb('#2d2045'), rgb('#9a5080'), rgb('#fcb9d9')],
    light: [rgb('#f5f2ed'), rgb('#f1d9e4'), rgb('#eca6c9'), rgb('#b48bd8')],
    focus: [0.82, 0.86],
    intensity: 1,
  },
  /* Servicios: más frío y más alto, deja aire para el panel de vidrio. */
  services: {
    colors: [rgb('#040409'), rgb('#241a3d'), rgb('#7d4a9c'), rgb('#fc94c7')],
    light: [rgb('#f3f1ee'), rgb('#e6def0'), rgb('#c7b3ea'), rgb('#ee9cc6')],
    focus: [0.74, 0.42],
    intensity: 0.85,
  },
  /* Alianza: casi todo negro con un núcleo rosa donde se juntan los logos. */
  alliance: {
    colors: [rgb('#030305'), rgb('#1a1030'), rgb('#8e3d77'), rgb('#f5f2ed')],
    light: [rgb('#f5f2ed'), rgb('#efe1e8'), rgb('#f0b3d0'), rgb('#dc7ab0')],
    focus: [0.5, 0.48],
    intensity: 0.55,
  },
  /* Anillo de webs: más frío y centrado, para separarlo de la alianza. */
  web: {
    colors: [rgb('#03040a'), rgb('#161a3a'), rgb('#5a4a9e'), rgb('#c9a8f0')],
    light: [rgb('#f2f1f2'), rgb('#dedbf0'), rgb('#b9b1e8'), rgb('#e8c3ef')],
    focus: [0.5, 0.6],
    intensity: 0.62,
  },
  /* Proceso: el humo acompaña el recorrido desde la derecha. */
  process: {
    colors: [rgb('#040406'), rgb('#1e1636'), rgb('#8a4a86'), rgb('#f46ebb')],
    light: [rgb('#f4f1ee'), rgb('#ebdaea'), rgb('#d9a8d6'), rgb('#f08fc1')],
    focus: [0.86, 0.34],
    intensity: 0.7,
  },
  /* Manifiesto: vuelve a subir, ahora desde abajo a la izquierda. */
  why: {
    colors: [rgb('#050308'), rgb('#2a1c44'), rgb('#a4568c'), rgb('#fcd0e4')],
    light: [rgb('#f5f2ed'), rgb('#f2dce7'), rgb('#eaadcf'), rgb('#c49be0')],
    focus: [0.28, 0.92],
    intensity: 0.95,
  },
  /* Bloques de respiro (carrusel, marcas, contacto): casi negro. */
  quiet: {
    colors: [rgb('#030303'), rgb('#120d1c'), rgb('#3d2a4a'), rgb('#6b4a72')],
    light: [rgb('#f5f2ed'), rgb('#f2ede9'), rgb('#ece2e6'), rgb('#e4d6e0')],
    focus: [0.5, 1.1],
    intensity: 0.4,
  },
}

export const ambient = reactive({
  mood: 'hero',
  /** Desplazamiento extra del foco, en pantallas (lo usa Servicios por ítem). */
  offset: [0, 0],
})

export function setMood(name) {
  if (!MOODS[name] || ambient.mood === name) return
  ambient.mood = name
  // El offset pertenece a la sección que lo puso: al cambiar de mood se limpia.
  ambient.offset = [0, 0]
}

export function setFocusOffset(x, y) {
  ambient.offset = [x, y]
}

/**
 * Declara el mood de una sección: se activa mientras la sección cruza el
 * viewport, en cualquiera de las dos direcciones de scroll.
 */
export function useAmbientMood(sectionRef, mood) {
  let trigger

  onMounted(() => {
    if (!sectionRef.value) return
    trigger = ScrollTrigger.create({
      trigger: sectionRef.value,
      start: 'top 65%',
      end: 'bottom 35%',
      onToggle: (self) => self.isActive && setMood(mood),
    })
  })

  onBeforeUnmount(() => trigger?.kill())
}
