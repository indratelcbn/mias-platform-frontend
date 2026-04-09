<template>
  <q-page class="q-pb-xl">
    <div class="page-hero q-py-xl text-center text-white">
      <q-icon name="history_edu" size="48px" class="q-mb-sm" />
      <h1 class="text-h4 text-weight-bold q-mb-sm">Sejarah Masjid</h1>
      <p class="text-body1 opacity-80">Perjalanan berdirinya Masjid Imam Asy Syafi'i Depok</p>
    </div>

    <div class="q-px-md q-py-xl" style="max-width: 900px; margin: 0 auto">
      <div v-if="store.loading" class="text-center q-py-xl">
        <q-spinner-dots color="primary" size="48px" />
      </div>
      <template v-else-if="store.data">
        <q-img
          v-if="store.data.foto"
          :src="store.data.foto"
          class="rounded-xl q-mb-xl cursor-pointer foto-lightbox"
          style="max-height: 420px; object-fit: cover"
          @click="open(store.data.foto, 'Foto Masjid')"
        />
        <div
          v-if="store.data.konten"
          class="text-body1"
          style="line-height: 1.9; white-space: pre-line"
        >{{ store.data.konten }}</div>
        <div v-else class="text-grey-6 text-center q-py-xl">Konten belum tersedia.</div>
      </template>
    </div>

    <AppLightbox />
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue';
import { useProfilSejarahStore } from 'src/stores/profil';
import AppLightbox from 'components/AppLightbox.vue';
import { useLightbox } from 'src/composables/useLightbox';

const store = useProfilSejarahStore();
onMounted(() => store.fetch());

const { open } = useLightbox();
</script>

<style scoped>
.page-hero {
  background: linear-gradient(135deg, #1B7A4A 0%, #26A65B 100%);
  padding: 80px 0;
}
.rounded-xl { border-radius: 12px; overflow: hidden; }
.foto-lightbox { transition: transform .15s; }
.foto-lightbox:hover { transform: scale(1.01); }
</style>
