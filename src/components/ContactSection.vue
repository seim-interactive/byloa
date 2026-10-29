<script setup>
/**
 * Contacto.
 *
 * La card de la derecha ocupa las dos filas de la grilla (`grid-row: 1 / -1`),
 * así su borde inferior cae exactamente sobre el de la card de abajo. Antes
 * era una columna aparte con `min-height: 100%`, que no resuelve contra un
 * padre sin alto: la card terminaba donde terminaba su contenido y quedaba
 * desalineada.
 */
import { ref } from 'vue'
import { gsap, splitMasked } from '@/animations/gsap'
import { useGsap } from '@/composables/useGsap'

const WHATSAPP = 'https://wa.me/5493417797688'

const root = ref(null)

useGsap(root, () => {
  const title = splitMasked('.contact__title')
  gsap
    .timeline({
      scrollTrigger: { trigger: root.value, start: 'top 72%', once: true },
      defaults: { ease: 'expo.out' },
    })
    .set('.contact__head', { opacity: 1 })
    .from('.contact__head .eyebrow', { opacity: 0, y: 18, duration: 1 }, 0)
    .from(title.lines, { yPercent: 115, duration: 1.2, stagger: 0.07 }, 0.1)
    .fromTo('.card', { opacity: 0, y: 48 }, { opacity: 1, y: 0, duration: 1.2, stagger: 0.1 }, 0.3)
})
</script>

<template>
  <section id="contact" ref="root" class="contact">
    <header class="contact__head">
      <p class="eyebrow">Contacto</p>
      <h2 class="section-title contact__title">Contanos el proyecto y <em>armamos el próximo paso</em>.</h2>
    </header>

    <div class="contact__grid">
      <!-- Canales directos -->
      <article class="card card--main glass">
        <div class="card__top">
          <h3 class="card__title">Escribinos</h3>
          <p class="card__note">Respondemos en menos de 24 horas.</p>
        </div>

        <ul class="channels">
          <li>
            <a class="channel" href="mailto:info@byloa.agency">
              <span class="channel__icon"><i class="bi bi-envelope" aria-hidden="true" /></span>
              <span class="channel__value">info@byloa.agency</span>
              <span class="channel__action">Enviar email</span>
            </a>
          </li>
          <li>
            <a class="channel" :href="WHATSAPP" target="_blank" rel="noopener">
              <span class="channel__icon"><i class="bi bi-whatsapp" aria-hidden="true" /></span>
              <span class="channel__value">+54 9 341 779 7688</span>
              <span class="channel__action">Escribir</span>
            </a>
          </li>
          <li>
            <a class="channel" href="https://instagram.com/byloa.agency" target="_blank" rel="noopener">
              <span class="channel__icon"><i class="bi bi-instagram" aria-hidden="true" /></span>
              <span class="channel__value">@byloa.agency</span>
              <span class="channel__action">Seguir</span>
            </a>
          </li>
        </ul>
      </article>

      <!-- Arranque de proyecto -->
      <a class="card card--start glass" :href="WHATSAPP" target="_blank" rel="noopener">
        <div>
          <h3 class="card__title">Empezar un proyecto</h3>
          <p class="card__note">Te proponemos un plan a medida, sin compromiso.</p>
        </div>
        <span class="card__arrow" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </span>
      </a>

      <!-- Disponibilidad: ocupa las dos filas y cierra con la card de abajo -->
      <article class="card card--aside on-media">
        <div class="aside__media" aria-hidden="true" />

        <div class="aside__body">
          <p class="aside__status"><span class="aside__dot" aria-hidden="true" />Disponibles para nuevos proyectos</p>
          <p class="aside__days">Lun<br />a Vie</p>
          <dl class="aside__meta">
            <div><dt>Horario</dt><dd>9 a 18 h</dd></div>
            <div><dt>Base</dt><dd>Rosario, Argentina</dd></div>
            <div><dt>Modalidad</dt><dd>Remoto / Presencial</dd></div>
          </dl>
        </div>

        <footer class="aside__foot">
          <span class="aside__brand">ByLoa</span>
          <a class="aside__cta" :href="WHATSAPP" target="_blank" rel="noopener">
            Agendar
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </a>
        </footer>
      </article>
    </div>
  </section>
</template>

<style scoped>
.contact {
  position: relative;
  z-index: var(--z-content);
  display: grid;
  gap: clamp(2.5rem, 2rem + 3vw, 4rem);
  padding: var(--section-space) var(--gutter);
}

.contact__head {
  width: 100%;
  max-width: 82rem;
  margin-inline: auto;
  display: grid;
  gap: 1.25rem;
  opacity: 0;
}

.contact__title {
  max-width: 20ch;
}

/* Dos filas: la card de la derecha las cruza enteras. */
.contact__grid {
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
  grid-template-rows: minmax(0, 1fr) auto;
  gap: clamp(0.75rem, 0.5rem + 1vw, 1.25rem);
  width: 100%;
  max-width: 82rem;
  margin-inline: auto;
}

.card {
  position: relative;
  border-radius: var(--radius-lg);
  opacity: 0;
}

.card--main {
  grid-column: 1;
  grid-row: 1;
  display: grid;
  align-content: space-between;
  gap: 2.5rem;
  padding: clamp(1.75rem, 1.25rem + 2vw, 2.75rem);
}

.card--start {
  grid-column: 1;
  grid-row: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: clamp(1.5rem, 1.25rem + 1.5vw, 2.25rem) clamp(1.75rem, 1.25rem + 2vw, 2.75rem);
  transition: border-color 0.5s var(--ease-out);
}

.card--start:hover {
  border-color: var(--c-line-strong);
}

.card--aside {
  grid-column: 2;
  grid-row: 1 / -1;
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  overflow: hidden;
  border: 1px solid var(--glass-border);
  /* Safari no recorta con `overflow` + `border-radius` a los hijos con
     filtro o capa propia (más mientras la card se anima al entrar): la foto
     de fondo asomaba como un rectángulo detrás de la card. `clip-path` con
     el mismo radio sí lo respeta, e `isolation` evita que la foto se mezcle
     en una capa aparte. */
  clip-path: inset(0 round var(--radius-lg));
  isolation: isolate;
}

.card__title {
  font-family: var(--font-display);
  font-size: var(--fs-h3);
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.card__note {
  margin-top: 0.5rem;
  color: var(--c-muted);
  font-size: var(--fs-small);
  line-height: 1.5;
}

.card__arrow {
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  width: 3rem;
  height: 3rem;
  border: 1px solid var(--c-line-strong);
  border-radius: 50%;
  color: var(--c-fg);
  transition:
    background-color 0.45s var(--ease-out),
    color 0.45s var(--ease-out);
}

.card__arrow svg {
  width: 1.1rem;
  height: 1.1rem;
  transition: transform 0.45s var(--ease-out);
}

.card--start:hover .card__arrow {
  background: var(--c-fg);
  color: var(--c-on-fg);
}

.card--start:hover .card__arrow svg {
  transform: translateX(3px);
}

/* ---- Canales ---- */

.channels {
  display: grid;
}

.channel {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  border-top: 1px solid var(--c-line);
  color: var(--c-fg);
}

.channels li:last-child .channel {
  border-bottom: 1px solid var(--c-line);
}

.channel__icon {
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  border: 1px solid var(--c-line);
  border-radius: 50%;
  color: var(--c-muted);
  font-size: 0.9rem;
  transition:
    border-color 0.45s var(--ease-out),
    color 0.45s var(--ease-out);
}

.channel__value {
  font-size: var(--fs-body);
}

.channel__action {
  color: var(--c-faint);
  font-size: var(--fs-micro);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  transition:
    color 0.45s var(--ease-out),
    transform 0.45s var(--ease-out);
}

@media (hover: hover) {
  .channel:hover .channel__icon {
    border-color: var(--c-pink);
    color: var(--c-pink);
  }

  .channel:hover .channel__action {
    color: var(--c-fg);
    transform: translateX(-2px);
  }
}

/* ---- Disponibilidad ---- */

.aside__media {
  position: absolute;
  inset: 0;
  background: url('/I_want_a_2k_202601262319.jpeg') center / cover;
  /* La foto queda como textura detrás del vidrio, no como fondo protagonista.
     Sin `filter`: era lo que hacía que Safari no la recortara a las esquinas
     redondeadas. La foto ya es suave; alcanza con bajarle la opacidad. */
  opacity: 0.5;
}

.card--aside::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgb(5 3 8 / 0.35) 0%, rgb(5 3 8 / 0.8) 100%);
}

.aside__body,
.aside__foot {
  position: relative;
  z-index: 1;
}

.aside__body {
  display: grid;
  align-content: start;
  gap: 1.5rem;
  padding: clamp(1.75rem, 1.25rem + 2vw, 2.75rem);
}

.aside__status {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--c-muted);
  font-size: var(--fs-micro);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.aside__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--c-pink);
  animation: contact-pulse 2.4s var(--ease-in-out) infinite;
}

@keyframes contact-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(1.4);
  }
}

.aside__days {
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 1.5rem + 3vw, 4rem);
  font-weight: 400;
  letter-spacing: -0.03em;
  line-height: 0.95;
}

.aside__meta {
  display: grid;
  gap: 0.75rem;
}

.aside__meta > div {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--c-line);
}

.aside__meta dt {
  color: var(--c-faint);
  font-size: var(--fs-micro);
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.aside__meta dd {
  color: var(--c-fg);
  font-size: var(--fs-small);
  text-align: right;
}

.aside__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: clamp(1.25rem, 1rem + 1vw, 1.75rem) clamp(1.75rem, 1.25rem + 2vw, 2.75rem);
  border-top: 1px solid var(--c-line);
}

.aside__brand {
  color: var(--c-faint);
  font-size: var(--fs-micro);
  font-weight: 600;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.aside__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1.2rem;
  border-radius: 999px;
  background: var(--c-fg);
  color: var(--c-on-fg);
  font-size: var(--fs-micro);
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  transition: background-color 0.4s var(--ease-out);
}

.aside__cta svg {
  width: 0.95rem;
  height: 0.95rem;
  transition: transform 0.4s var(--ease-out);
}

.aside__cta:hover svg {
  transform: translateX(3px);
}

@media (max-width: 900px) {
  .contact__grid {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: none;
  }

  .card--main,
  .card--start,
  .card--aside {
    grid-column: 1;
    grid-row: auto;
  }
}
</style>
