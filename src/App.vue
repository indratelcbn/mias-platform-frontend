<template>
  <router-view />
  <SitePopup />
</template>

<script setup>
import SitePopup from 'src/components/SitePopup.vue'
import { useVisitorTracking } from 'src/composables/useVisitorTracking'

// Instantiate tracking composable (triggers auto-tracking on mount)
useVisitorTracking()
</script>

