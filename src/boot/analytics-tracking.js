import { boot } from 'quasar/wrappers'
import { useVisitorTracking } from '@/composables/useVisitorTracking'

export default boot(() => {
  // Initialize tracking on app start - track current page view
  if (typeof window !== 'undefined') {
    const { setupAutoTracking } = useVisitorTracking()
    setupAutoTracking()
  }
})
