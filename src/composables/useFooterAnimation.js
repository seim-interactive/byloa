import { onMounted, onBeforeUnmount } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useFooterAnimation(containerRef, elements) {
  let timeline = null

  const createAnimation = () => {
    if (!containerRef?.value) {
      gsap.set([
        elements.brand?.value,
        elements.nav?.value,
        elements.social?.value,
        elements.bottom?.value
      ].filter(Boolean), { opacity: 1, y: 0 })
      return
    }

    timeline = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.value,
        start: 'top center+=100',
        end: 'top center',
        toggleActions: 'play none none reverse'
      }
    })

    // Brand fade in
    timeline.fromTo(
      elements.brand.value,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
      0
    )

    // Navigation fade in
    timeline.fromTo(
      elements.nav.value,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
      0.1
    )

    // Social fade in
    timeline.fromTo(
      elements.social.value,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
      0.2
    )

    // Bottom bar fade in
    timeline.fromTo(
      elements.bottom.value,
      { opacity: 0 },
      { opacity: 1, duration: 0.6, ease: 'power2.out' },
      0.3
    )
  }

  onMounted(() => {
    createAnimation()
  })

  onBeforeUnmount(() => {
    if (timeline) {
      timeline.kill()
      timeline = null
    }
    ScrollTrigger.getAll().forEach(trigger => trigger.kill())
  })

  return { timeline }
}
