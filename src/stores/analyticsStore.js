// src/stores/analyticsStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import analyticsApi from '../services/analyticsApi'

export const useAnalyticsStore = defineStore('analytics', () => {
  // State
  const dashboard = ref(null)
  const summary = ref(null)
  const trends = ref([])
  const topPages = ref([])
  const devices = ref([])
  const browsers = ref([])
  const os = ref([])
  const referrers = ref([])
  const heatmap = ref([])
  const countries = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Current filter state
  const currentFilter = ref('last30days')
  const customDateRange = ref(null)

  // Computed
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => error.value !== null)
  const errorMessage = computed(() => error.value)

  /**
   * Build query parameters
   */
  const buildParams = () => {
    const params = {
      filter: currentFilter.value,
      startDate: null,
      endDate: null,
    }

    if (customDateRange.value?.from && customDateRange.value?.to) {
      params.startDate = customDateRange.value.from.toISOString().split('T')[0]
      params.endDate = customDateRange.value.to.toISOString().split('T')[0]
    }

    return params
  }

  /**
   * Fetch dashboard data
   */
  const fetchDashboard = async () => {
    try {
      loading.value = true
      error.value = null

      const params = buildParams()
      const response = await analyticsApi.getDashboard(params.filter, params.startDate, params.endDate)

      if (response.success) {
        dashboard.value = response.data
      } else {
        error.value = response.message || 'Failed to fetch dashboard'
      }
    } catch (err) {
      error.value = err.message || 'Error fetching dashboard'
      console.error('Error fetching dashboard:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch all analytics data
   */
  const fetchAllData = async () => {
    try {
      loading.value = true
      error.value = null

      const params = buildParams()

      const [summaryRes, trendsRes, pagesRes, devicesRes, browsersRes, osRes, referrersRes, heatmapRes, countriesRes] = await Promise.all([
        analyticsApi.getSummary(params.filter, params.startDate, params.endDate),
        analyticsApi.getTrends(params.filter, params.startDate, params.endDate),
        analyticsApi.getTopPages(params.filter, 10, params.startDate, params.endDate),
        analyticsApi.getDevices(params.filter, params.startDate, params.endDate),
        analyticsApi.getBrowsers(params.filter, params.startDate, params.endDate),
        analyticsApi.getOS(params.filter, params.startDate, params.endDate),
        analyticsApi.getReferrers(params.filter, params.startDate, params.endDate),
        analyticsApi.getHeatmap(params.filter, params.startDate, params.endDate),
        analyticsApi.getCountries(params.filter, params.startDate, params.endDate),
      ])

      summary.value = summaryRes.data
      trends.value = trendsRes.data
      topPages.value = pagesRes.data
      devices.value = devicesRes.data
      browsers.value = browsersRes.data
      os.value = osRes.data
      referrers.value = referrersRes.data
      heatmap.value = heatmapRes.data
      countries.value = countriesRes.data
    } catch (err) {
      error.value = err.message || 'Error fetching analytics data'
      console.error('Error fetching analytics data:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Set filter
   */
  const setFilter = (filter) => {
    currentFilter.value = filter
    customDateRange.value = null
  }

  /**
   * Set custom date range
   */
  const setCustomDateRange = (from, to) => {
    customDateRange.value = { from, to }
  }

  /**
   * Clear custom date range
   */
  const clearCustomDateRange = () => {
    customDateRange.value = null
  }

  /**
   * Refresh data with current filter
   */
  const refresh = async () => {
    await fetchAllData()
  }

  return {
    // State
    dashboard,
    summary,
    trends,
    topPages,
    devices,
    browsers,
    os,
    referrers,
    heatmap,
    countries,
    loading,
    error,
    currentFilter,
    customDateRange,

    // Computed
    isLoading,
    hasError,
    errorMessage,

    // Methods
    fetchDashboard,
    fetchAllData,
    setFilter,
    setCustomDateRange,
    clearCustomDateRange,
    refresh,
  }
})
