<template>
  <q-page class="galeri-page">
    <!-- ─── Hero ──────────────────────────────────────────────────────────── -->
    <div class="galeri-hero q-pa-xl text-center text-white">
      <div class="text-overline q-mb-xs" style="letter-spacing: 3px; opacity: .7">DOKUMENTASI</div>
      <div class="text-h3 text-weight-bold q-mb-sm">Kegiatan Ramadhan</div>
      <div class="text-subtitle1" style="opacity: .85">
        Dokumentasi foto kegiatan Ramadhan Masjid Imam Asy Syafi'i
      </div>
    </div>

    <div class="q-pa-lg q-pa-md-xl" style="max-width: 1200px; margin: 0 auto">
      <div v-if="availableYears.length" class="q-mb-lg">
        <q-tabs v-model="activeYear" align="left" active-color="primary" indicator-color="primary" no-caps>
          <q-tab v-for="year in availableYears" :key="year" :name="year" :label="`Tahun ${year}`" />
        </q-tabs>
      </div>

      <!-- Loading -->
      <div v-if="galeriStore.loading" class="row q-col-gutter-md">
        <div v-for="n in 6" :key="n" class="col-12 col-sm-6 col-md-4">
          <q-skeleton height="220px" style="border-radius: 12px" />
        </div>
      </div>

      <!-- Grid Foto -->
      <template v-else-if="filteredPhotos.length">
        <div class="row q-col-gutter-md">
          <div
            v-for="item in filteredPhotos"
            :key="item.id"
            class="col-12 col-sm-6 col-md-4"
          >
            <q-card flat class="foto-card" @click="openLightbox(item)">
              <q-img
                :src="imgUrl(item.foto)"
                :ratio="4/3"
                class="foto-img"
                fit="cover"
              >
                <template #error>
                  <div class="absolute-full flex flex-center bg-grey-2 text-grey-5">
                    <q-icon name="broken_image" size="48px" />
                  </div>
                </template>
              </q-img>
              <q-card-section class="q-py-sm">
                <div class="text-subtitle2 text-weight-bold ellipsis">{{ item.judul }}</div>
                <div v-if="item.keterangan" class="text-caption text-grey-6 ellipsis-2-lines">
                  {{ item.keterangan }}
                </div>
                <div class="row items-center q-gutter-xs q-mt-xs">
                  <q-badge outline color="purple" :label="`Tahun ${item.tahun}`" />
                  <span class="text-caption text-grey-5">{{ formatDate(item.createdAt) }}</span>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </template>

      <!-- Empty -->
      <template v-else>
        <div class="text-center q-py-xl">
          <q-icon name="photo_library" size="72px" color="grey-4" />
          <div class="text-h6 text-grey-6 q-mt-md">Belum Ada Foto</div>
          <div class="text-body2 text-grey-5 q-mt-sm">
            Dokumentasi kegiatan Ramadhan akan segera tersedia.
          </div>
        </div>
      </template>

    </div>

    <!-- Lightbox Dialog -->
    <q-dialog v-model="lightbox" maximized>
      <q-card class="lightbox-card bg-black" @click="lightbox = false">
        <q-btn
          flat
          round
          icon="close"
          color="white"
          class="absolute-top-right q-ma-sm"
          style="z-index: 1"
          @click.stop="lightbox = false"
        />
        <div class="fit flex flex-center">
          <q-img
            :src="selectedFoto ? imgUrl(selectedFoto.foto) : ''"
            fit="contain"
            style="max-height: 90vh; max-width: 90vw"
            @click.stop
          />
        </div>
        <div v-if="selectedFoto" class="text-center q-pb-md text-white" @click.stop>
          <div class="text-subtitle1 text-weight-bold">{{ selectedFoto.judul }}</div>
          <div v-if="selectedFoto.keterangan" class="text-caption text-grey-4">
            {{ selectedFoto.keterangan }}
          </div>
        </div>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue';
import { useGaleriStore } from 'src/stores/galeri';

const galeriStore = useGaleriStore();
const lightbox = ref(false);
const selectedFoto = ref(null);
const activeYear = ref(null);

onMounted(() => {
  galeriStore.fetchByKategori('RAMADHAN');
});

const availableYears = computed(() => [...new Set(galeriStore.ramadhan.map((item) => item.tahun).filter(Boolean))].sort((a, b) => b - a));
const filteredPhotos = computed(() => {
  if (!activeYear.value) return galeriStore.ramadhan;
  return galeriStore.ramadhan.filter((item) => item.tahun === activeYear.value);
});

watch(availableYears, (years) => {
  if (!years.length) {
    activeYear.value = null;
    return;
  }
  if (!years.includes(activeYear.value)) {
    activeYear.value = years[0];
  }
}, { immediate: true });

const imgUrl = (path) => path;

const openLightbox = (item) => {
  selectedFoto.value = item;
  lightbox.value = true;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};
</script>

<style scoped>
.galeri-hero {
  background: linear-gradient(135deg, #4a148c 0%, #7b1fa2 50%, #9c27b0 100%);
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.foto-card {
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.foto-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}
.lightbox-card {
  border-radius: 0;
  cursor: pointer;
}
</style>
