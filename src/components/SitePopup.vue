<template>
  <q-dialog v-model="visible" class="site-popup-dialog" @hide="markSeen">
    <q-card class="site-popup-card" flat>
      <q-btn
        round
        dense
        unelevated
        icon="close"
        color="white"
        text-color="dark"
        class="site-popup-close"
        @click.stop="closePopup"
      >
        <q-tooltip>Tutup</q-tooltip>
      </q-btn>

      <button type="button" class="site-popup-media" @click="openPopupLink">
        <q-img
          :src="imageSrc"
          fit="contain"
          class="site-popup-img"
          spinner-color="primary"
        />
      </button>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useSettingStore } from 'src/stores/setting';

const route = useRoute();
const setting = useSettingStore();
const visible = ref(false);


const imageSrc = computed(() => setting.data.popupImage ? `/uploads/popup/${setting.data.popupImage}` : '');

function canShowPopup() {
  return !route.path.startsWith('/admin') &&
    setting.data.popupIsActive &&
    !!setting.data.popupImage;
}

function showWhenReady() {
  visible.value = canShowPopup();
}

function markSeen() {
  // Tidak perlu set localStorage, agar selalu muncul
}

function closePopup() {
  markSeen();
  visible.value = false;
}

function openPopupLink() {
  markSeen();
  visible.value = false;
  if (setting.data.popupUrl) {
    window.open(setting.data.popupUrl, '_blank', 'noopener,noreferrer');
  }
}

watch(() => route.path, () => {
  if (route.path.startsWith('/admin')) visible.value = false;
});

onMounted(async () => {
  if (!setting.data.popupImage) await setting.fetch();
  showWhenReady();
});
</script>

<style scoped>
.site-popup-card {
  position: relative;
  width: min(92vw, 560px);
  max-height: 88vh;
  border-radius: 8px;
  overflow: visible;
  background: transparent;
  box-shadow: none;
}
.site-popup-close {
  position: absolute;
  top: -14px;
  right: -14px;
  z-index: 2;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18);
}
.site-popup-media {
  display: block;
  width: 100%;
  padding: 0;
  border: 0;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  overflow: hidden;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.28);
}
.site-popup-img {
  width: 100%;
  max-height: 86vh;
}
</style>