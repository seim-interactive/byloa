<script setup>
/**
 * Fondo ambiental del sitio: humo en degradé que se mueve solo.
 *
 * Es un shader a pantalla completa. El humo sale de "domain warping": se
 * deforma un campo de ruido fBm con otro campo de ruido, que es lo que da las
 * volutas irregulares. Un degradado radial animado daría manchas redondas.
 *
 * Rendimiento:
 * - El canvas se dibuja a ~la mitad de resolución (tope 1280px de ancho) y lo
 *   estira el compositor. Al ser todo degradados suaves, el reescalado no se
 *   nota y el costo por cuadro baja a la cuarta parte.
 * - El dibujo va colgado del ticker de GSAP, el mismo que mueve Lenis y
 *   ScrollTrigger: un solo rAF para todo el sitio.
 * - Se pausa con la pestaña oculta.
 *
 * Si no hay WebGL, queda el degradado CSS del contenedor como fallback.
 */
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { gsap, isTouchDevice } from '@/animations/gsap'
import { ambient, MOODS } from '@/composables/useAmbient'
import { onThemeSync, theme } from '@/composables/useTheme'

const canvas = ref(null)
const wrapper = ref(null)

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`

const FRAG = `
precision highp float;

uniform vec2  u_res;
uniform float u_time;
uniform float u_scroll;
uniform vec2  u_focus;
uniform float u_intensity;
uniform vec3  u_c0;
uniform vec3  u_c1;
uniform vec3  u_c2;
uniform vec3  u_c3;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float amp = 0.55;
  // Rotar entre octavas evita que se vea la grilla del ruido.
  mat2 rot = mat2(0.80, 0.60, -0.60, 0.80);
  for (int i = 0; i < 4; i++) {
    v += amp * noise(p);
    p = rot * p * 2.03;
    amp *= 0.5;
  }
  return v;
}

void main() {
  // Aspecto corregido con la altura: el humo no se estira en pantallas anchas.
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  float aspect = u_res.x / u_res.y;
  float t = u_time * 0.055;

  // El scroll arrastra el campo de ruido: al bajar, el humo fluye hacia arriba.
  vec2 p = uv * 1.25 + vec2(0.0, u_scroll * 0.75);

  // Domain warping: un campo de ruido desplaza al siguiente.
  vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2, 1.3) - t * 0.85));
  float f = fbm(p + 2.6 * q + vec2(t * 0.4, 0.0));

  // La masa se concentra alrededor del foco que pide la sección activa.
  vec2 screen = vec2(gl_FragCoord.x / u_res.y, gl_FragCoord.y / u_res.y);
  vec2 focus = vec2(u_focus.x * aspect, 1.0 - u_focus.y);
  float falloff = smoothstep(1.25, 0.05, distance(screen, focus));

  float density = clamp(f * 1.7 - 0.32, 0.0, 1.0) * falloff * u_intensity;
  // Las crestas del warp dan los filamentos más brillantes del humo.
  density += pow(length(q), 3.0) * 0.5 * falloff * u_intensity;

  vec3 color = u_c0;
  color = mix(color, u_c1, smoothstep(0.02, 0.42, density));
  color = mix(color, u_c2, smoothstep(0.30, 0.76, density));
  color = mix(color, u_c3, smoothstep(0.66, 1.05, density));

  // Viñeta: los bordes caen siempre al color de base, así una sección entra
  // en la siguiente sin fades propios. Se mezcla hacia u_c0 y no hacia negro:
  // en oscuro es casi lo mismo, y en claro los bordes van al beige en vez de
  // ensuciarse de gris.
  color = mix(u_c0, color, mix(0.40, 1.0, smoothstep(1.45, 0.30, length(uv))));

  // Dither: sin esto, un degradado tan largo se ve en escalones.
  color += (hash(gl_FragCoord.xy + fract(u_time)) - 0.5) / 160.0;

  gl_FragColor = vec4(color, 1.0);
}
`

/** Estado interpolado que se envía al shader (viaja suave entre moods). */
const current = {
  colors: MOODS.hero.colors.map((c) => [...c]),
  focus: [...MOODS.hero.focus],
  intensity: MOODS.hero.intensity,
}

let gl
let uniforms
let time = 0
let scroll = 0
let hidden = false
let resizeObserver

const compile = (type, source) => {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn('[ambient] shader:', gl.getShaderInfoLog(shader))
    return null
  }
  return shader
}

const setup = () => {
  const vert = compile(gl.VERTEX_SHADER, VERT)
  const frag = compile(gl.FRAGMENT_SHADER, FRAG)
  if (!vert || !frag) return false

  const program = gl.createProgram()
  gl.attachShader(program, vert)
  gl.attachShader(program, frag)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return false
  gl.useProgram(program)

  // Un solo triángulo que tapa la pantalla (más barato que dos).
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const loc = gl.getAttribLocation(program, 'a_pos')
  gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

  const u = (name) => gl.getUniformLocation(program, name)
  uniforms = {
    res: u('u_res'),
    time: u('u_time'),
    scroll: u('u_scroll'),
    focus: u('u_focus'),
    intensity: u('u_intensity'),
    colors: [u('u_c0'), u('u_c1'), u('u_c2'), u('u_c3')],
  }
  return true
}

/**
 * Ajusta la resolución del canvas al tamaño del contenedor.
 *
 * Reasignar `width`/`height` a un canvas lo borra entero: hasta el próximo
 * dibujo se ve vacío. En mobile eso era un flash por cada movimiento de la
 * barra de direcciones (que cambia el alto del viewport mientras se
 * scrollea). Por eso: el contenedor mide `100lvh` (no cambia con la barra),
 * no se toca el canvas si el tamaño es el mismo, y cuando sí cambia se
 * vuelve a dibujar en el acto.
 */
const resize = () => {
  if (!gl || !canvas.value || !wrapper.value) return
  // Mitad de resolución, con tope: el costo del shader no crece con el monitor.
  const scale = Math.min(window.devicePixelRatio || 1, 2) * 0.5
  const box = wrapper.value.getBoundingClientRect()
  const width = Math.max(1, Math.min(Math.round(box.width * scale), 1280))
  const height = Math.max(1, Math.round((width * box.height) / Math.max(box.width, 1)))
  if (canvas.value.width === width && canvas.value.height === height) return
  // En táctiles, un cambio sólo de alto es la barra del navegador y no se
  // toca el canvas: CSS lo estira esos pocos píxeles y nadie lo nota. Se
  // redimensiona sólo si cambia el ancho (rotar el teléfono).
  if (isTouchDevice() && canvas.value.width === width) return
  canvas.value.width = width
  canvas.value.height = height
  gl.viewport(0, 0, width, height)
  gl.uniform2f(uniforms.res, width, height)
  draw()
}

const draw = () => {
  if (!gl) return
  gl.uniform1f(uniforms.time, time)
  gl.uniform1f(uniforms.scroll, scroll)
  gl.uniform2f(uniforms.focus, current.focus[0], current.focus[1])
  gl.uniform1f(uniforms.intensity, current.intensity)
  current.colors.forEach((c, i) => gl.uniform3f(uniforms.colors[i], c[0], c[1], c[2]))
  gl.drawArrays(gl.TRIANGLES, 0, 3)
}

/** Viaje suave hacia el mood de la sección activa (exponencial, sin rebote). */
/** Paleta del mood en el tema actual. */
const paletteOf = (mood) => (theme.value === 'light' ? mood.light : mood.colors)

const blend = (dt) => {
  const target = MOODS[ambient.mood] ?? MOODS.hero
  const k = 1 - Math.exp(-dt * 1.6)
  const lerp = (a, b) => a + (b - a) * k

  paletteOf(target).forEach((c, i) => {
    for (let n = 0; n < 3; n++) current.colors[i][n] = lerp(current.colors[i][n], c[n])
  })
  current.focus[0] = lerp(current.focus[0], target.focus[0] + ambient.offset[0])
  current.focus[1] = lerp(current.focus[1], target.focus[1] + ambient.offset[1])
  current.intensity = lerp(current.intensity, target.intensity)
}

const tick = (_t, deltaMs) => {
  if (hidden) return
  const dt = Math.min(deltaMs, 50) / 1000
  time += dt
  const max = document.documentElement.scrollHeight - window.innerHeight
  scroll = max > 0 ? window.scrollY / max : 0
  blend(dt)
  draw()
}

const onVisibility = () => (hidden = document.hidden)

/**
 * Al cambiar de tema la paleta salta de una vez, sin el viaje suave. El cambio
 * se revela con un círculo que muestra el estado nuevo *ya dibujado*: si el
 * fondo tardara un segundo en llegar al claro, adentro del círculo se vería
 * todavía el humo oscuro.
 */
const snapToTheme = () => {
  const target = MOODS[ambient.mood] ?? MOODS.hero
  paletteOf(target).forEach((c, i) => (current.colors[i] = [...c]))
  draw()
}

let stopThemeSync

onMounted(() => {
  const options = { alpha: false, antialias: false, depth: false, powerPreference: 'low-power' }
  gl = canvas.value?.getContext('webgl', options) || canvas.value?.getContext('experimental-webgl', options)
  if (!gl || !setup()) {
    gl = null
    return // queda el degradado CSS de fallback
  }

  resize()
  // ResizeObserver sobre el contenedor fijo: en mobile la barra de direcciones
  // mueve el alto del viewport y esto lo sigue sin escuchar cada 'resize'.
  resizeObserver = new ResizeObserver(resize)
  // El contenedor es `fixed inset-0`: cambia con el viewport y nada más.
  resizeObserver.observe(wrapper.value)

  // Si la página arranca en claro, el primer cuadro ya tiene que ser claro.
  snapToTheme()
  stopThemeSync = onThemeSync(snapToTheme)

  document.addEventListener('visibilitychange', onVisibility)
  gsap.ticker.add(tick)
})

onBeforeUnmount(() => {
  gsap.ticker.remove(tick)
  stopThemeSync?.()
  document.removeEventListener('visibilitychange', onVisibility)
  resizeObserver?.disconnect()
  gl?.getExtension('WEBGL_lose_context')?.loseContext()
  gl = null
})
</script>

<template>
  <div ref="wrapper" class="ambient" aria-hidden="true">
    <canvas ref="canvas" class="ambient__canvas" />
  </div>
</template>

<style scoped>
.ambient {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  /* Alto grande del viewport: no cambia cuando la barra del navegador mobile
     aparece o se esconde, así el canvas no se redimensiona (ni se borra)
     durante el scroll. `vh` queda como respaldo. */
  height: 100vh;
  height: 100lvh;
  z-index: var(--z-ambient);
  pointer-events: none;
  /* Fallback sin WebGL */
  background:
    radial-gradient(ellipse 90% 80% at 82% 86%, #9a5080 0%, transparent 55%),
    radial-gradient(ellipse 120% 100% at 60% 100%, #2d2045 0%, transparent 65%),
    #050308;
}

:root[data-theme='light'] .ambient {
  background:
    radial-gradient(ellipse 90% 80% at 82% 86%, #eca6c9 0%, transparent 55%),
    radial-gradient(ellipse 120% 100% at 60% 100%, #d9cbea 0%, transparent 65%),
    #f5f2ed;
}

.ambient__canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
