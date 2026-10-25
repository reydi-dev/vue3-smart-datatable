import { computed, onMounted, onScopeDispose, shallowRef } from 'vue'

/** Desktop is the identical server/initial-client layout; observe only after mount. */
export function useResponsiveLayout(breakpoint: () => number | undefined) {
  const width = shallowRef<number | null>(null)
  let stop: (() => void) | undefined
  onMounted(() => {
    const update = () => {
      width.value = Math.max(
        document.documentElement.clientWidth,
        window.innerWidth || 0,
      )
    }
    window.addEventListener('resize', update, { passive: true })
    stop = () => window.removeEventListener('resize', update)
    update()
  })
  onScopeDispose(() => {
    stop?.()
    stop = undefined
  })
  return computed(() => {
    const supplied = breakpoint()
    const threshold =
      typeof supplied === 'number' && Number.isFinite(supplied) && supplied >= 0
        ? supplied
        : 960
    return width.value !== null && width.value < threshold
  })
}
