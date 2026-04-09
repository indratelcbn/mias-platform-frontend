<template>
  <q-page class="q-pb-xl">
    <div class="page-hero q-py-xl text-center text-white">
      <q-icon name="apartment" size="48px" class="q-mb-sm" />
      <h1 class="text-h4 text-weight-bold q-mb-sm">Fasilitas Masjid</h1>
      <p class="text-body1 opacity-80">Fasilitas yang tersedia di Masjid Imam Asy Syafi'i</p>
    </div>

    <div class="q-px-md q-py-xl" style="max-width: 1200px; margin: 0 auto">
      <div v-if="store.loading" class="text-center q-py-xl">
        <q-spinner-dots color="primary" size="48px" />
      </div>
      <div v-else-if="!store.list.length" class="text-center q-py-xl text-grey-6">
        <q-icon name="apartment" size="72px" color="grey-4" />
        <div class="q-mt-md">Belum ada data fasilitas.</div>
      </div>
      <div v-else class="column q-gutter-lg">
        <q-card v-for="f in store.list" :key="f.id" flat bordered class="fasilitas-card">
          <!-- Card Header -->
          <q-card-section class="fasilitas-header row items-center q-py-md q-px-lg">
            <q-icon name="meeting_room" color="primary" size="26px" class="q-mr-sm" />
            <div class="text-subtitle1 text-weight-bold">{{ f.judul }}</div>
          </q-card-section>

          <q-separator v-if="f.deskripsi || (f.foto && f.foto.length)" />

          <!-- Deskripsi -->
          <q-card-section v-if="f.deskripsi" class="q-px-lg q-pt-md q-pb-sm">
            <p class="text-body2 text-grey-8 q-mb-none" style="white-space: pre-line; line-height: 1.7">{{ f.deskripsi }}</p>
          </q-card-section>

          <!-- Photo gallery -->
          <q-card-section v-if="f.foto && f.foto.length" class="q-px-lg q-pt-sm q-pb-lg">
            <div class="row q-col-gutter-sm">
              <div
                v-for="p in f.foto"
                :key="p.id"
                class="col-6 col-sm-4 col-md-2"
              >
                <q-img
                  :src="p.foto"
                  fit="contain"
                  class="rounded-lg cursor-pointer foto-thumb fasilitas-img"
                  @click="openGallery(f, p)"
                >
                  <div v-if="p.caption" class="absolute-bottom text-caption text-center q-px-xs q-py-xs" style="background: rgba(0,0,0,0.55)">
                    {{ p.caption }}
                  </div>
                </q-img>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <AppLightbox />
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue';
import { useProfilFasilitasStore } from 'src/stores/profil';
import AppLightbox from 'components/AppLightbox.vue';
import { useLightbox } from 'src/composables/useLightbox';

const store = useProfilFasilitasStore();
onMounted(() => store.fetchPublic());

const { open } = useLightbox();

function openGallery(f, p) {
  open(p.foto, p.caption || f.judul);
}
</script>

<style scoped>
.page-hero {
  background: linear-gradient(135deg, #37474F 0%, #546E7A 100%);
  padding: 80px 0;
}
.fasilitas-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
  transition: box-shadow .2s;
}
.fasilitas-card:hover {
  box-shadow: 0 4px 18px rgba(0,0,0,0.11);
}
.fasilitas-header {
  background: #f9fafb;
}
.rounded-lg { border-radius: 8px; overflow: hidden; }
.fasilitas-img {
  height: 160px;
  background: #f4f6f8;
}
.foto-thumb { transition: transform .15s; }
.foto-thumb:hover { transform: scale(1.04); }

@media (max-width: 599px) {
  .fasilitas-img {
    height: 130px;
  }
}
</style>
