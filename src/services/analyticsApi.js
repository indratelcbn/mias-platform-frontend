// src/services/analyticsApi.js
import { api } from 'src/boot/axios'

class AnalyticsApi {
  /**
   * Track visitor data
   */
  async trackVisitor(visitorData) {
    try {
      const response = await api.post('/analytics/track', visitorData)
      return response.data
    } catch (error) {
      console.error('Error tracking visitor:', error)
      throw error
    }
  }

  /**
   * Get dashboard data
   */
  async getDashboard(filter = 'last30days', startDate = null, endDate = null) {
    try {
      const params = { filter }
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate

      const response = await api.get('/analytics/dashboard', { params })
      return response.data
    } catch (error) {
      console.error('Error fetching dashboard:', error)
      throw error
    }
  }

  /**
   * Get summary statistics
   */
  async getSummary(filter = 'last30days', startDate = null, endDate = null) {
    try {
      const params = { filter }
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate

      const response = await api.get('/analytics/summary', { params })
      return response.data
    } catch (error) {
      console.error('Error fetching summary:', error)
      throw error
    }
  }

  /**
   * Get trends
   */
  async getTrends(filter = 'last30days', startDate = null, endDate = null) {
    try {
      const params = { filter }
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate

      const response = await api.get('/analytics/trends', { params })
      return response.data
    } catch (error) {
      console.error('Error fetching trends:', error)
      throw error
    }
  }

  /**
   * Get top pages
   */
  async getTopPages(filter = 'last30days', limit = 10, startDate = null, endDate = null) {
    try {
      const params = { filter, limit }
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate

      const response = await api.get('/analytics/pages', { params })
      return response.data
    } catch (error) {
      console.error('Error fetching top pages:', error)
      throw error
    }
  }

  /**
   * Get device statistics
   */
  async getDevices(filter = 'last30days', startDate = null, endDate = null) {
    try {
      const params = { filter }
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate

      const response = await api.get('/analytics/devices', { params })
      return response.data
    } catch (error) {
      console.error('Error fetching devices:', error)
      throw error
    }
  }

  /**
   * Get browser statistics
   */
  async getBrowsers(filter = 'last30days', startDate = null, endDate = null) {
    try {
      const params = { filter }
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate

      const response = await api.get('/analytics/browsers', { params })
      return response.data
    } catch (error) {
      console.error('Error fetching browsers:', error)
      throw error
    }
  }

  /**
   * Get operating system statistics
   */
  async getOS(filter = 'last30days', startDate = null, endDate = null) {
    try {
      const params = { filter }
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate

      const response = await api.get('/analytics/os', { params })
      return response.data
    } catch (error) {
      console.error('Error fetching OS:', error)
      throw error
    }
  }

  /**
   * Get referrer statistics
   */
  async getReferrers(filter = 'last30days', startDate = null, endDate = null) {
    try {
      const params = { filter }
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate

      const response = await api.get('/analytics/referrers', { params })
      return response.data
    } catch (error) {
      console.error('Error fetching referrers:', error)
      throw error
    }
  }

  /**
   * Get heatmap data
   */
  async getHeatmap(filter = 'last30days', startDate = null, endDate = null) {
    try {
      const params = { filter }
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate

      const response = await api.get('/analytics/heatmap', { params })
      return response.data
    } catch (error) {
      console.error('Error fetching heatmap:', error)
      throw error
    }
  }

  /**
   * Get country statistics
   */
  async getCountries(filter = 'last30days', startDate = null, endDate = null) {
    try {
      const params = { filter }
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate

      const response = await api.get('/analytics/countries', { params })
      return response.data
    } catch (error) {
      console.error('Error fetching country statistics:', error)
      throw error
    }
  }
}

export default new AnalyticsApi()
