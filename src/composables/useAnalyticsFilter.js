// src/composables/useAnalyticsFilter.js
import { ref, computed } from 'vue'

export function useAnalyticsFilter() {
  const filterType = ref('last30days')
  const startDate = ref(null)
  const endDate = ref(null)
  const customDateRange = ref(null)

  const filterOptions = [
    { label: 'Today', value: 'today' },
    { label: 'Last 7 days', value: 'last7days' },
    { label: 'Last 30 days', value: 'last30days' },
    { label: 'This month', value: 'thisMonth' },
    { label: 'This year', value: 'thisYear' },
  ]

  /**
   * Parse date range from filter type
   */
  const getDateRange = (filter) => {
    const now = new Date()
    let start = new Date()

    switch (filter) {
      case 'today':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        return { start, end: now }

      case 'last7days':
        start.setDate(start.getDate() - 6)
        start = new Date(start.getFullYear(), start.getMonth(), start.getDate())
        return { start, end: now }

      case 'last30days':
        start.setDate(start.getDate() - 29)
        start = new Date(start.getFullYear(), start.getMonth(), start.getDate())
        return { start, end: now }

      case 'thisMonth':
        start = new Date(now.getFullYear(), now.getMonth(), 1)
        return { start, end: now }

      case 'thisYear':
        start = new Date(now.getFullYear(), 0, 1)
        return { start, end: now }

      default:
        start.setDate(start.getDate() - 29)
        start = new Date(start.getFullYear(), start.getMonth(), start.getDate())
        return { start, end: now }
    }
  }

  /**
   * Format date to ISO string for API
   */
  const formatDate = (date) => {
    return date ? date.toISOString().split('T')[0] : null
  }

  /**
   * Get current date range
   */
  const currentDateRange = computed(() => {
    if (customDateRange.value?.from && customDateRange.value?.to) {
      return {
        start: customDateRange.value.from,
        end: customDateRange.value.to,
      }
    }

    return getDateRange(filterType.value)
  })

  /**
   * Get API parameters
   */
  const getApiParams = () => {
    if (customDateRange.value?.from && customDateRange.value?.to) {
      return {
        filter: 'custom',
        startDate: formatDate(customDateRange.value.from),
        endDate: formatDate(customDateRange.value.to),
      }
    }

    return {
      filter: filterType.value,
      startDate: null,
      endDate: null,
    }
  }

  /**
   * Set custom date range
   */
  const setCustomRange = (from, to) => {
    customDateRange.value = { from, to }
  }

  /**
   * Clear custom range
   */
  const clearCustomRange = () => {
    customDateRange.value = null
  }

  /**
   * Format date for display
   */
  const formatDateDisplay = (date) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return {
    filterType,
    startDate,
    endDate,
    customDateRange,
    filterOptions,
    currentDateRange,
    getApiParams,
    setCustomRange,
    clearCustomRange,
    formatDate,
    formatDateDisplay,
  }
}
