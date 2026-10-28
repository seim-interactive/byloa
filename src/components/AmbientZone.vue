<script setup>
/**
 * Envuelve una sección que todavía no declara su propio mood y le asigna uno
 * mientras está en pantalla. Sirve para los bloques de respiro (carrusel,
 * marcas, contacto), que sólo necesitan que el fondo baje la intensidad.
 */
import { ref } from 'vue'
import { useAmbientMood } from '@/composables/useAmbient'

const props = defineProps({
  mood: { type: String, required: true },
})

const root = ref(null)
useAmbientMood(root, props.mood)
</script>

<template>
  <div ref="root" class="ambient-zone">
    <slot />
  </div>
</template>

<style scoped>
.ambient-zone {
  position: relative;
  z-index: var(--z-content);
}
</style>
