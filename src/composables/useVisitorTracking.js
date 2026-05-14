// src/composables/useVisitorTracking.js
import { onMounted, ref } from 'vue'
import analyticsApi from '../services/analyticsApi'

export function useVisitorTracking() {
  const isTracked = ref(false)
  const sessionId = ref(null)

  /**
   * Parse user agent to get browser and OS info
   */
  const parseUserAgent = () => {
    const ua = navigator.userAgent

    // Browser detection
    let browser = 'Unknown'
    let browserVersion = 'Unknown'

    if (ua.indexOf('Firefox') > -1) {
      browser = 'Firefox'
      browserVersion = ua.match(/Firefox\/(\d+)/)?.[1] || 'Unknown'
    } else if (ua.indexOf('Edg') > -1) {
      browser = 'Edge'
      browserVersion = ua.match(/Edg\/(\d+)/)?.[1] || 'Unknown'
    } else if (ua.indexOf('Chrome') > -1 && ua.indexOf('Chromium') === -1) {
      browser = 'Chrome'
      browserVersion = ua.match(/Chrome\/(\d+)/)?.[1] || 'Unknown'
    } else if (ua.indexOf('Safari') > -1) {
      browser = 'Safari'
      browserVersion = ua.match(/Version\/(\d+)/)?.[1] || 'Unknown'
    } else if (ua.indexOf('Opera') > -1) {
      browser = 'Opera'
      browserVersion = ua.match(/Opera\/(\d+)/)?.[1] || 'Unknown'
    }

    // OS detection
    let os = 'Unknown'
    let osVersion = 'Unknown'

    if (ua.indexOf('Win') > -1) {
      os = 'Windows'
      if (ua.indexOf('Windows NT 10.0') > -1) osVersion = '10'
      else if (ua.indexOf('Windows NT 6.3') > -1) osVersion = '8.1'
      else if (ua.indexOf('Windows NT 6.2') > -1) osVersion = '8'
      else if (ua.indexOf('Windows NT 6.1') > -1) osVersion = '7'
    } else if (ua.indexOf('Mac') > -1) {
      os = 'macOS'
      const match = ua.match(/Mac OS X (\d+)_(\d+)/)
      if (match) osVersion = `${match[1]}.${match[2]}`
    } else if (ua.indexOf('Linux') > -1) {
      os = 'Linux'
    } else if (ua.indexOf('Android') > -1) {
      os = 'Android'
      const match = ua.match(/Android (\d+)/)
      if (match) osVersion = match[1]
    } else if (ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) {
      os = 'iOS'
      const match = ua.match(/OS (\d+)_(\d+)/)
      if (match) osVersion = `${match[1]}.${match[2]}`
    }

    // Device type detection
    let deviceType = 'Desktop'
    if (ua.indexOf('Mobile') > -1 || ua.indexOf('Android') > -1) {
      deviceType = 'Mobile'
    } else if (ua.indexOf('Tablet') > -1 || ua.indexOf('iPad') > -1) {
      deviceType = 'Tablet'
    }

    return {
      browser,
      browserVersion,
      operatingSystem: os,
      osVersion,
      deviceType,
      deviceName: ua.substring(0, 100),
    }
  }

  /**
   * Get screen resolution
   */
  const getScreenResolution = () => {
    return {
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
    }
  }

  /**
   * Generate or get session ID
   */
  const getOrCreateSessionId = () => {
    let sid = sessionStorage.getItem('mias_session_id')
    if (!sid) {
      sid = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      sessionStorage.setItem('mias_session_id', sid)
    }
    return sid
  }

  /**
   * Track visitor - call once per page load
   */
  const trackVisitor = async () => {
    try {
      const sid = getOrCreateSessionId()
      sessionId.value = sid

      const userAgentData = parseUserAgent()
      const screenData = getScreenResolution()

      const visitorData = {
        pagePath: window.location.pathname,
        pageTitle: document.title,
        fullUrl: window.location.href,
        referrer: document.referrer || null,
        userAgent: navigator.userAgent,
        language: navigator.language,
        sessionId: sid,
        ...userAgentData,
        ...screenData,
      }

      await analyticsApi.trackVisitor(visitorData)
    } catch (error) {
      console.error('Error tracking visitor:', error)
    }
  }

  /**
   * Auto-track on mount if not admin page
   */
  const setupAutoTracking = () => {
    // Don't track admin pages
    const adminPaths = ['/admin', '/dashboard', '/login']
    const isAdminPage = adminPaths.some((path) => window.location.pathname.includes(path))

    if (!isAdminPage) {
      trackVisitor()
    }
  }

  onMounted(() => {
    setupAutoTracking()
  })

  return {
    isTracked,
    sessionId,
    trackVisitor,
    setupAutoTracking,
  }
}
