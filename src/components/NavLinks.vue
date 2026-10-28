<script setup>
/**
 * Barra de navegación.
 *
 * Tres decisiones para que deje de estorbar:
 * - Se esconde al bajar y vuelve al subir. Mientras el usuario lee no hay nada
 *   encima del contenido, y aparece apenas hace el gesto de volver.
 * - Los links viven en una cápsula de vidrio con un indicador que se desliza
 *   hasta el activo, en vez de un puntito que aparece y desaparece.
 * - Arriba de todo es transparente; recién se vuelve vidrio cuando hay
 *   contenido detrás.
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { gsap } from '@/animations/gsap'
import { lockScroll, scrollToSection, unlockScroll } from '@/composables/useSmoothScroll'
import { theme, toggleTheme } from '@/composables/useTheme'

const links = [
  { id: 'home', label: 'Home' },
  { id: 'services', label: 'Servicios' },
  { id: 'projects', label: 'Proyectos' },
  { id: 'process', label: 'Proceso' },
  { id: 'agency', label: 'Agencia' },
]

const isScrolled = ref(false)
const isHidden = ref(false)
const isMenuOpen = ref(false)
const activeSection = ref('home')

const capsule = ref(null)
const linkEls = []
const overlay = ref(null)

/** Posición y ancho del indicador, en píxeles dentro de la cápsula. */
const indicator = ref({ left: 0, width: 0 })
const indicatorStyle = computed(() => ({
  transform: `translateX(${indicator.value.left}px)`,
  width: `${indicator.value.width}px`,
  opacity: indicator.value.width ? 1 : 0,
}))

const moveIndicator = () => {
  const el = linkEls[links.findIndex((link) => link.id === activeSection.value)]
  if (!el) return
  indicator.value = { left: el.offsetLeft, width: el.offsetWidth }
}

watch(activeSection, () => nextTick(moveIndicator))

/* ------------------------------------------------------------------ scroll */

let lastY = 0

const onScroll = () => {
  const y = window.scrollY
  isScrolled.value = y > 40
  // Sólo se esconde una vez pasada la portada, y nunca con el menú abierto.
  isHidden.value = !isMenuOpen.value && y > window.innerHeight * 0.6 && y > lastY
  lastY = y

  // Sección activa: la que cruza la mitad de la pantalla.
  const middle = window.innerHeight / 2
  for (const { id } of [...links, { id: 'contact' }]) {
    const rect = document.getElementById(id)?.getBoundingClientRect()
    if (rect && rect.top <= middle && rect.bottom >= middle) {
      activeSection.value = id
      break
    }
  }
}

/* ---------------------------------------------------------------- tema */

/** El círculo del cambio de tema se abre desde el centro del botón. */
const onThemeClick = (event) => {
  const rect = event.currentTarget.getBoundingClientRect()
  toggleTheme({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
}

/* -------------------------------------------------------------- menú mobile */

const go = async (id) => {
  activeSection.value = id
  const wasOpen = isMenuOpen.value
  isMenuOpen.value = false
  // Con el menú abierto el scroll está bloqueado (Lenis detenido). Hay que
  // esperar a que el watcher lo libere: si no, el salto se pierde y la página
  // se queda donde estaba.
  if (wasOpen) await nextTick()
  scrollToSection(`#${id}`)
}

watch(isMenuOpen, async (open) => {
  if (open) {
    lockScroll()
    await nextTick()
    if (!overlay.value) return
    gsap
      .timeline({ defaults: { ease: 'expo.out' } })
      .from(overlay.value, { opacity: 0, duration: 0.4 }, 0)
      .from(overlay.value.querySelectorAll('[data-menu-item]'), {
        yPercent: 110,
        opacity: 0,
        duration: 0.9,
        stagger: 0.06,
      }, 0.1)
  } else {
    unlockScroll()
  }
})

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', moveIndicator)
  onScroll()
  nextTick(moveIndicator)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', moveIndicator)
  if (isMenuOpen.value) unlockScroll()
})
</script>

<template>
  <header class="nav" :class="{ 'is-scrolled': isScrolled, 'is-hidden': isHidden, 'is-open': isMenuOpen }">
    <a class="nav__logo" href="#home" aria-label="ByLoa — inicio" @click.prevent="go('home')">
      <img class="logo-adapt" src="/logotipos_logotipodescriptorv2 negativo.png" alt="ByLoa Agency" width="1833" height="861" fetchpriority="high" />
    </a>

    <nav class="nav__capsule" ref="capsule" aria-label="Secciones">
      <span class="nav__indicator" :style="indicatorStyle" aria-hidden="true" />
      <a
        v-for="(link, i) in links"
        :key="link.id"
        :ref="(el) => (linkEls[i] = el)"
        class="nav__link"
        :class="{ 'is-active': activeSection === link.id }"
        :href="`#${link.id}`"
        :aria-current="activeSection === link.id ? 'page' : undefined"
        @click.prevent="go(link.id)"
      >
        {{ link.label }}
      </a>
    </nav>

    <div class="nav__actions">
      <!-- Tema: el ícono muestra el modo actual (luna en oscuro, sol en claro)
           y se transforma de uno al otro. -->
      <button
        type="button"
        class="theme-toggle"
        :aria-label="theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
        :aria-pressed="theme === 'light'"
        @click="onThemeClick"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <mask id="theme-toggle-mask">
            <rect width="24" height="24" fill="white" />
            <circle class="theme-toggle__cut" cx="17" cy="7" r="7" fill="black" />
          </mask>
          <circle class="theme-toggle__core" cx="12" cy="12" r="8" fill="currentColor" mask="url(#theme-toggle-mask)" />
          <g class="theme-toggle__rays" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">
            <line x1="12" y1="1.5" x2="12" y2="3.2" />
            <line x1="12" y1="20.8" x2="12" y2="22.5" />
            <line x1="1.5" y1="12" x2="3.2" y2="12" />
            <line x1="20.8" y1="12" x2="22.5" y2="12" />
            <line x1="4.6" y1="4.6" x2="5.8" y2="5.8" />
            <line x1="18.2" y1="18.2" x2="19.4" y2="19.4" />
            <line x1="4.6" y1="19.4" x2="5.8" y2="18.2" />
            <line x1="18.2" y1="5.8" x2="19.4" y2="4.6" />
          </g>
        </svg>
      </button>

      <a class="nav__cta" href="#contact" @click.prevent="go('contact')">Contactar</a>

      <button
      class="nav__toggle"
      type="button"
      :aria-expanded="isMenuOpen"
      aria-controls="nav-menu"
      :aria-label="isMenuOpen ? 'Cerrar menú' : 'Abrir menú'"
      @click="isMenuOpen = !isMenuOpen"
    >
      <span aria-hidden="true" />
      <span aria-hidden="true" />
      </button>
    </div>
  </header>

  <Transition name="menu">
    <div v-if="isMenuOpen" id="nav-menu" ref="overlay" class="menu">
      <nav class="menu__links" aria-label="Menú">
        <a
          v-for="link in links"
          :key="link.id"
          class="menu__link"
          :href="`#${link.id}`"
          @click.prevent="go(link.id)"
        >
          <span data-menu-item>{{ link.label }}</span>
        </a>
      </nav>

      <div class="menu__foot">
        <a class="menu__cta" href="#contact" @click.prevent="go('contact')">
          <span data-menu-item>Contactar</span>
        </a>
        <p class="menu__meta" data-menu-item>Rosario, Argentina · Remoto / Presencial</p>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.nav {
  position: fixed;
  inset: 0 0 auto;
  z-index: var(--z-header);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  height: var(--header-h);
  padding-inline: var(--gutter);
  /* `backdrop-filter` no va en la transición ni se apaga al esconder la
     barra: prenderlo y apagarlo durante el scroll hace parpadear Safari. */
  transition:
    transform 0.6s var(--ease-out),
    background-color 0.5s var(--ease-out),
    border-color 0.5s var(--ease-out);
}

/* Transparente arriba; vidrio recién cuando hay contenido detrás. */
.nav.is-scrolled {
  border-bottom: 1px solid var(--c-line);
  background: var(--c-header-bg);
  backdrop-filter: blur(16px) saturate(1.3);
  -webkit-backdrop-filter: blur(16px) saturate(1.3);
}

/* Se va al bajar y vuelve al subir.
   Al esconderse hay que apagarle también el vidrio y el borde: `translateY(-100%)`
   deja el borde inferior apoyado justo en el borde de arriba del viewport, y se
   ve una raya de 1px cruzando la pantalla con la barra ya fuera de cuadro. */
.nav.is-hidden {
  transform: translateY(-100%);
  border-color: transparent;
  background: transparent;
  pointer-events: none;
}

.nav.is-open {
  background: transparent;
  border-color: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

.nav__logo img {
  display: block;
  height: 2.25rem;
  width: auto;
  opacity: 0.92;
  transition: opacity 0.4s var(--ease-out);
}

.nav__logo:hover img {
  opacity: 1;
}

/* ---- Cápsula de links ---- */

.nav__capsule {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.3rem;
  border: 1px solid var(--c-line);
  border-radius: 999px;
  background: var(--c-tint);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* El indicador se desliza hasta el link activo en vez de encenderse ahí. */
.nav__indicator {
  position: absolute;
  top: 0.3rem;
  left: 0;
  height: calc(100% - 0.6rem);
  border-radius: 999px;
  background: var(--c-tint-strong);
  transition:
    transform 0.55s var(--ease-out),
    width 0.55s var(--ease-out),
    opacity 0.4s var(--ease-out);
  pointer-events: none;
}

.nav__link {
  position: relative;
  padding: 0.55rem 1.1rem;
  border-radius: 999px;
  color: var(--c-muted);
  font-size: var(--fs-small);
  line-height: 1;
  white-space: nowrap;
  transition: color 0.4s var(--ease-out);
}

.nav__link:hover,
.nav__link.is-active {
  color: var(--c-fg);
}

/* ---- Acciones: tema, contacto y menú ---- */

.nav__actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.theme-toggle {
  display: grid;
  place-items: center;
  width: 2.6rem;
  height: 2.6rem;
  border: 1px solid var(--c-line);
  border-radius: 50%;
  background: var(--c-tint);
  color: var(--c-fg);
  transition:
    border-color 0.4s var(--ease-out),
    background-color 0.4s var(--ease-out);
}

.theme-toggle:hover {
  border-color: var(--c-line-strong);
  background: var(--c-tint-strong);
}

.theme-toggle svg {
  width: 1.15rem;
  height: 1.15rem;
  overflow: visible;
  /* La luna gira un poco al volverse sol: el gesto acompaña al círculo. */
  transition: transform 0.7s var(--ease-out);
}

/* Las tres piezas se animan con transform (no con r/cx), que anda igual en
   todos los navegadores. Estado de base: luna. */
.theme-toggle__core,
.theme-toggle__cut,
.theme-toggle__rays {
  transform-box: fill-box;
  transform-origin: center;
  transition:
    transform 0.6s var(--ease-out),
    opacity 0.4s var(--ease-out);
}

.theme-toggle__rays {
  opacity: 0;
  transform: scale(0.4) rotate(-45deg);
}

/* Sol: el núcleo se achica, el corte que dibujaba la luna sale de cuadro y
   aparecen los rayos. */
:root[data-theme='light'] .theme-toggle svg {
  transform: rotate(90deg);
}

:root[data-theme='light'] .theme-toggle__core {
  transform: scale(0.6);
}

:root[data-theme='light'] .theme-toggle__cut {
  transform: translate(9px, -9px);
}

:root[data-theme='light'] .theme-toggle__rays {
  opacity: 1;
  transform: scale(1) rotate(0deg);
}

/* ---- CTA ---- */

.nav__cta {
  padding: 0.75rem 1.4rem;
  border: 1px solid var(--c-fg);
  border-radius: 999px;
  background: var(--c-fg);
  color: var(--c-on-fg);
  font-size: var(--fs-small);
  font-weight: 600;
  letter-spacing: 0.06em;
  line-height: 1;
  white-space: nowrap;
  transition:
    background-color 0.4s var(--ease-out),
    color 0.4s var(--ease-out);
}

.nav__cta:hover {
  background: transparent;
  color: var(--c-fg);
}

/* ---- Botón de menú ---- */

.nav__toggle {
  display: none;
  position: relative;
  width: 2.5rem;
  height: 2.5rem;
}

.nav__toggle span {
  position: absolute;
  left: 50%;
  width: 1.4rem;
  height: 1px;
  margin-left: -0.7rem;
  background: var(--c-fg);
  transition: transform 0.5s var(--ease-out);
}

.nav__toggle span:first-child {
  transform: translateY(-4px);
}

.nav__toggle span:last-child {
  transform: translateY(4px);
}

.nav.is-open .nav__toggle span:first-child {
  transform: rotate(45deg);
}

.nav.is-open .nav__toggle span:last-child {
  transform: rotate(-45deg);
}

@media (max-width: 1023px) {
  .nav__capsule,
  .nav__cta {
    display: none;
  }

  .nav__toggle {
    display: block;
  }
}

/* ---- Menú a pantalla completa ---- */

.menu {
  position: fixed;
  inset: 0;
  z-index: calc(var(--z-header) - 1);
  display: grid;
  grid-template-rows: 1fr auto;
  gap: 2rem;
  padding: calc(var(--header-h) + 2rem) var(--gutter) 3rem;
  background: var(--c-overlay-bg);
  backdrop-filter: blur(32px) saturate(1.2);
  -webkit-backdrop-filter: blur(28px) saturate(1.2);
}

.menu__links {
  display: grid;
  align-content: center;
  gap: 0.5rem;
}

/* Cada link recorta su propio texto: así entra desde abajo sin asomarse. */
.menu__link {
  overflow: hidden;
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 1.5rem + 8vw, 4.5rem);
  font-weight: 400;
  letter-spacing: -0.03em;
  line-height: 1.12;
}

.menu__link span {
  display: block;
}

.menu__foot {
  display: grid;
  gap: 1.25rem;
  padding-top: 2rem;
  border-top: 1px solid var(--c-line);
}

.menu__cta {
  overflow: hidden;
  padding: 1.1rem;
  border-radius: 999px;
  background: var(--c-fg);
  color: var(--c-on-fg);
  font-size: var(--fs-small);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-align: center;
  text-transform: uppercase;
}

.menu__meta {
  color: var(--c-faint);
  font-size: var(--fs-micro);
  letter-spacing: 0.16em;
  text-align: center;
  text-transform: uppercase;
}

.menu-leave-active {
  transition: opacity 0.35s var(--ease-out);
}

.menu-leave-to {
  opacity: 0;
}
</style>
