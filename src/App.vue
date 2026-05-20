
<template>
  <router-view />
  <SitePopup />
</template>


<script setup>
import { onMounted } from 'vue';
import SitePopup from 'src/components/SitePopup.vue';
import { useVisitorTracking } from 'src/composables/useVisitorTracking';

// Pencegahan download gambar global
onMounted(() => {
  // 1. Disable klik kanan pada semua gambar
  document.addEventListener('contextmenu', (e) => {
    if (e.target.tagName === 'IMG') e.preventDefault();
  });
  // 2. Disable drag pada semua gambar
  document.addEventListener('dragstart', (e) => {
    if (e.target.tagName === 'IMG') e.preventDefault();
  });
  // 3. Tambahkan overlay transparan di atas semua gambar (CSS di bawah)
  // 4. Tambahkan atribut oncontextmenu dan draggable pada semua img
  const observer = new MutationObserver(() => {
    document.querySelectorAll('img').forEach(img => {
      img.setAttribute('oncontextmenu', 'return false');
      img.setAttribute('draggable', 'false');
      if (!img.classList.contains('img-no-download')) {
        img.classList.add('img-no-download');
      }
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
});

// Tracking
useVisitorTracking();
</script>
<style>
/* 3. Overlay transparan di atas semua gambar */
img.img-no-download {
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
  -webkit-touch-callout: none;
  position: relative;
}
</style>

