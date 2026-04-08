<template>
  <q-page class="q-pb-xl">
    <div class="page-hero q-py-xl text-center text-white">
      <q-icon name="apartment" size="48px" class="q-mb-sm" />
      <h1 class="text-h4 text-weight-bold q-mb-sm">Fasilitas Masjid</h1>
      <p class="text-body1 opacity-80">Fasilitas yang tersedia di Masjid Imam Asy Syafi'i</p>
    </div>

    <div class="q-px-md q-py-xl" style="max-width: 1100px; margin: 0 auto">
      <div v-if="store.loading" class="text-center q-py-xl">
        <q-spinner-dots color="primary" size="48px" />
      </div>
      <div v-else-if="!store.list.length" class="text-center q-py-xl text-grey-6">
        <q-icon name="apartment" size="72px" color="grey-4" />
        <div class="q-mt-md">Belum ada data fasilitas.</div>
      </div>
      <div v-else class="column q-gutter-xl">
        <div v-for="f in store.list" :key="f.id">
          <!-- Header -->
          <div class="row items-center q-mb-md">
            <q-icon name="meeting_room" color="primary" size="28px" class="q-mr-sm" />
            <div class="text-h6 text-weight-bold">{{ f.judul }}</div>
          </div>
          <p v-if="f.deskripsi" class="text-body2 text-grey-7 q-mb-md" style="white-space: pre-line">{{ f.deskripsi }}</p>

          <!-- Photo gallery -->
          <div v-if="f.foto && f.foto.length" class="row q-col-gutter-sm">
            <div
              v-for="p in f.foto"
              :key="p.id"
              class="col-6 col-sm-4 col-md-3"
            >
              <q-img
                :src="p.foto"
                :ratio="4/3"
                class="rounded-lg cursor-pointer foto-thumb"
                @click="openGallery(f, p)"
              >
                <div v-if="p.caption" class="absolute-bottom text-caption text-center bg-black-5 q-px-xs q-py-xs">
                  {{ p.caption }}
                </div>
              </q-img>
            </div>
          </div>
          <q-separator class="q-mt-lg" />
        </div>
      </div>
    </div>

    <!-- Lightbox dialog -->
    <q-dialog v-model="lightbox">
      <q-card style="max-width: 90vw; background: #000">
        <q-bar class="bg-grey-10 text-white">
          <span class="text-caption">{{ activeCaption }}</span>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup />
        </q-bar>
        <q-img :src="activeSrc" style="max-height: 80vh" fit="contain" />
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useProfilFasilitasStore } from 'src/stores/profil';

const store = useProfilFasilitasStore();
onMounted(() => store.fetchPublic());

const lightbox    = ref(false);
const activeSrc   = ref('');
const activeCaption = ref('');

function openGallery(f, p) {
  activeSrc.value = p.foto;
  activeCaption.value = p.caption || f.judul;
  lightbox.value = true;
}
</script>

<style scoped>
.page-hero {
  background: linear-gradient(135deg, #37474F 0%, #546E7A 100%);
  padding: 80px 0;
}
.rounded-lg { border-radius: 8px; overflow: hidden; }
.foto-thumb { transition: transform .15s; }
.foto-thumb:hover { transform: scale(1.03); }
</style>
