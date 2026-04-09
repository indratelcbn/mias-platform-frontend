<template>
  <q-page class="q-pb-xl qurban-page">
    <section class="qurban-hero text-center text-white">
      <div class="hero-overlay q-px-md q-py-xl">
        <div class="text-overline hero-overline q-mb-sm">DOKUMENTASI DAKWAH</div>
        <h1 class="hero-title q-mb-sm">Kegiatan Pemotongan Hewan Qurban</h1>
        <p class="hero-subtitle">Dokumentasi penyembelihan, distribusi, dan kebersamaan jamaah dalam kegiatan qurban MIAS.</p>
      </div>
    </section>

    <div class="q-px-md q-py-xl" style="max-width: 1180px; margin: 0 auto">
      <div v-if="qurbanStore.loading" class="row q-col-gutter-md">
        <div v-for="n in 6" :key="n" class="col-12 col-sm-6 col-md-4">
          <q-skeleton height="220px" style="border-radius: 16px" />
        </div>
      </div>

      <template v-else-if="availableYears.length">
        <div class="row items-center justify-between q-mb-lg q-gutter-md">
          <div>
            <div class="text-h5 text-weight-bold">Dokumentasi per Tahun</div>
            <div class="text-body2 text-grey-6 q-mt-xs">Pilih tahun untuk melihat dokumentasi kegiatan qurban.</div>
          </div>
        </div>

        <q-tabs v-model="activeYear" no-caps dense indicator-color="transparent" class="year-tabs q-mb-lg" align="left">
          <q-tab
            v-for="year in availableYears"
            :key="year"
            :name="year"
            :label="`Tahun ${year}`"
            class="year-tab"
            :class="{ 'year-tab-active': activeYear === year }"
          />
        </q-tabs>

        <q-tab-panels v-model="activeYear" animated class="bg-transparent">
          <q-tab-panel v-for="year in availableYears" :key="year" :name="year" class="q-pa-none">
            <div class="row q-col-gutter-lg">
              <div v-for="(item, idx) in photosByYear(year)" :key="item.id" class="col-12 col-sm-6 col-md-4">
                <q-card flat bordered class="foto-card" @click="openLightbox(year, idx)">
                  <q-img :src="item.foto" :ratio="4/3" fit="cover" class="foto-img">
                    <div class="foto-overlay absolute-full flex flex-center">
                      <q-icon name="zoom_in" color="white" size="30px" />
                    </div>
                  </q-img>
                  <q-card-section>
                    <div class="text-subtitle2 text-weight-bold ellipsis">{{ item.judul }}</div>
                    <div v-if="item.keterangan" class="text-caption text-grey-6 ellipsis-2-lines q-mt-xs">{{ item.keterangan }}</div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </template>

      <template v-else>
        <div class="text-center q-py-xl">
          <q-icon name="pets" size="72px" color="grey-4" />
          <div class="text-h6 text-grey-6 q-mt-md">Dokumentasi Qurban Belum Tersedia</div>
          <div class="text-body2 text-grey-5 q-mt-sm">Foto kegiatan pemotongan hewan qurban akan segera ditambahkan.</div>
        </div>
      </template>
    </div>

    <q-dialog v-model="lightbox" maximized transition-show="fade" transition-hide="fade">
      <div class="lightbox-backdrop" @click="lightbox = false">
        <q-btn flat round icon="close" color="white" class="lightbox-close" @click.stop="lightbox = false" />
        <q-btn v-if="lightboxIdx > 0" flat round icon="chevron_left" color="white" class="lightbox-prev" @click.stop="lightboxIdx--" />
        <q-btn v-if="lightboxIdx < lightboxFotos.length - 1" flat round icon="chevron_right" color="white" class="lightbox-next" @click.stop="lightboxIdx++" />

        <div class="lightbox-img-wrap" @click.stop>
          <q-img v-if="lightboxFotos[lightboxIdx]" :src="lightboxFotos[lightboxIdx].foto" fit="contain" style="max-height: 86vh; max-width: 90vw; border-radius: 14px" />
          <div v-if="lightboxFotos[lightboxIdx]" class="text-white text-center q-mt-md q-px-md">
            <div class="text-subtitle1 text-weight-bold">{{ lightboxFotos[lightboxIdx].judul }}</div>
            <div v-if="lightboxFotos[lightboxIdx].keterangan" class="text-caption text-grey-4 q-mt-xs">{{ lightboxFotos[lightboxIdx].keterangan }}</div>
            <div class="text-caption text-grey-5 q-mt-xs">{{ lightboxIdx + 1 }} / {{ lightboxFotos.length }}</div>
          </div>
        </div>
      </div>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useQurbanStore } from 'src/stores/qurban';

const qurbanStore = useQurbanStore();
const activeYear = ref(null);
const lightbox = ref(false);
const lightboxIdx = ref(0);
const lightboxFotos = ref([]);

const availableYears = computed(() => [...new Set(qurbanStore.list.map((item) => item.tahun))].sort((a, b) => b - a));

const photosByYear = (year) => qurbanStore.list.filter((item) => item.tahun === year);

function openLightbox(year, index) {
  lightboxFotos.value = photosByYear(year);
  lightboxIdx.value = index;
  lightbox.value = true;
}

watch(availableYears, (years) => {
  if (years.length && !years.includes(activeYear.value)) {
    activeYear.value = years[0];
  }
}, { immediate: true });

onMounted(() => {
  qurbanStore.fetchPublic();
});
</script>

<style scoped>
.qurban-hero {
  background: linear-gradient(135deg, #6d4c41 0%, #8d6e63 45%, #a1887f 100%);
}
.hero-overlay {
  background: linear-gradient(180deg, rgba(0,0,0,.16), rgba(0,0,0,.28));
}
.hero-overline {
  letter-spacing: 3px;
  opacity: .75;
}
.hero-title {
  font-size: clamp(30px, 5vw, 46px);
  font-weight: 800;
  margin: 0;
}
.hero-subtitle {
  max-width: 760px;
  margin: 0 auto;
  opacity: .88;
}
.year-tabs {
  gap: 8px;
}
.year-tab {
  border: 1px solid #d7ccc8;
  border-radius: 999px;
  margin-right: 10px;
  color: #6d4c41;
}
.year-tab-active {
  background: #6d4c41;
  color: #fff;
}
.foto-card {
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: transform .2s, box-shadow .2s;
}
.foto-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 28px rgba(0,0,0,.12);
}
.foto-img {
  background: #f4ede9;
}
.foto-overlay {
  background: rgba(0,0,0,.16);
  opacity: 0;
  transition: opacity .2s;
}
.foto-card:hover .foto-overlay {
  opacity: 1;
}
.lightbox-backdrop {
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,.94);
  position: relative;
}
.lightbox-close,
.lightbox-prev,
.lightbox-next {
  position: absolute;
  z-index: 2;
}
.lightbox-close { top: 12px; right: 12px; }
.lightbox-prev { top: 50%; left: 14px; transform: translateY(-50%); }
.lightbox-next { top: 50%; right: 14px; transform: translateY(-50%); }
.lightbox-img-wrap {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>