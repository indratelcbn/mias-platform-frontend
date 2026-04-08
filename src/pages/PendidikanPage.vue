<template>
  <q-page class="pendidikan-page">

    <!-- ─── Hero ──────────────────────────────────────────────────────────── -->
    <section class="pendidikan-hero" :style="{ background: program.gradient }">
      <div class="hero-overlay">
        <div class="hero-content">
          <q-icon :name="program.icon" size="56px" color="white" class="q-mb-md" />
          <div class="text-overline q-mb-xs hero-overline">PENDIDIKAN MASJID IMAM ASY SYAFI'I</div>
          <h1 class="hero-title">{{ program.label }}</h1>
          <p class="hero-tagline">{{ program.tagline }}</p>
        </div>
      </div>
    </section>

    <!-- ─── Body ──────────────────────────────────────────────────────────── -->
    <div class="pendidikan-body q-px-lg q-px-md-xl q-pb-xl" style="max-width: 1100px; margin: 0 auto">

      <!-- Info Cards Row -->
      <div class="info-cards-row q-mt-xl q-mb-xl">
        <!-- Jumlah Penuntut Ilmu -->
        <div class="info-card">
          <div class="info-card-icon-wrap" :style="{ background: program.lightColor }">
            <q-icon name="groups" :style="{ color: program.accentColor }" size="30px" />
          </div>
          <div class="info-card-body">
            <div class="info-card-value">{{ info?.jumlahPenuntutIlmu ?? '–' }}</div>
            <div class="info-card-label">Penuntut Ilmu</div>
          </div>
        </div>

        <!-- Kitab yang Digunakan -->
        <div class="info-card info-card--wide">
          <div class="info-card-icon-wrap" :style="{ background: program.lightColor }">
            <q-icon name="menu_book" :style="{ color: program.accentColor }" size="30px" />
          </div>
          <div class="info-card-body">
            <div class="info-card-label q-mb-xs">Kitab yang Digunakan</div>
            <div v-if="kitabList.length" class="row q-gutter-xs">
              <q-badge
                v-for="(k, i) in kitabList"
                :key="i"
                :label="k"
                :style="{ background: program.accentColor }"
                class="kitab-badge"
              />
            </div>
            <div v-else class="text-grey-5 text-caption">Belum diisi</div>
          </div>
        </div>

        <!-- Pengajar -->
        <div class="info-card info-card--wide">
          <div class="info-card-icon-wrap" :style="{ background: program.lightColor }">
            <q-icon name="school" :style="{ color: program.accentColor }" size="30px" />
          </div>
          <div class="info-card-body">
            <div class="info-card-label q-mb-xs">Pengajar</div>
            <div v-if="pengajarList.length" class="column q-gutter-xs">
              <div
                v-for="(p, i) in pengajarList"
                :key="i"
                class="row items-center q-gutter-xs"
              >
                <q-icon name="person" :style="{ color: program.accentColor }" size="16px" />
                <span class="text-body2 text-weight-medium">{{ p }}</span>
              </div>
            </div>
            <div v-else class="text-grey-5 text-caption">Belum diisi</div>
          </div>
        </div>
      </div>

      <!-- Deskripsi -->
      <div v-if="info?.deskripsi" class="deskripsi-card q-mb-xl">
        <q-icon name="info_outline" :style="{ color: program.accentColor }" size="22px" class="q-mr-sm" />
        <span class="text-body1 text-grey-8">{{ info.deskripsi }}</span>
      </div>

      <!-- ─── Dokumentasi Foto ─────────────────────────────────────────── -->
      <div class="text-h5 text-weight-bold q-mb-lg section-title">
        <span class="title-line" :style="{ background: program.accentColor }"></span>
        Dokumentasi Foto
      </div>

      <!-- Loading -->
      <div v-if="store.loading" class="row q-col-gutter-md">
        <div v-for="n in 6" :key="n" class="col-12 col-sm-6 col-md-4">
          <q-skeleton height="240px" style="border-radius: 16px" />
        </div>
      </div>

      <template v-else-if="fotos.length">
        <!-- Year Tabs -->
        <div v-if="availableYears.length > 1" class="q-mb-lg">
          <q-tabs
            v-model="activeYear"
            dense
            no-caps
            :active-color="program.accentColor"
            indicator-color="transparent"
            align="left"
            class="year-tabs"
          >
            <q-tab
              v-for="yr in availableYears"
              :key="yr"
              :name="yr"
              :label="String(yr)"
              class="year-tab"
              :style="activeYear === yr
                ? { background: program.accentColor, color: '#fff', borderRadius: '8px' }
                : {}"
            />
          </q-tabs>
        </div>

        <q-tab-panels v-model="activeYear" animated>
          <q-tab-panel
            v-for="yr in availableYears"
            :key="yr"
            :name="yr"
            class="q-pa-none"
          >
            <div class="row q-col-gutter-lg">
              <div
                v-for="(item, idx) in fotosForYear(yr)"
                :key="item.id"
                class="col-12 col-sm-6 col-md-4"
                :class="{ 'col-md-6': idx === 0 && fotosForYear(yr).length > 1 }"
              >
                <q-card class="foto-card" flat @click="openLightbox(yr, idx)">
                  <q-img
                    :src="item.foto"
                    :ratio="idx === 0 && fotosForYear(yr).length > 1 ? 16/9 : 4/3"
                    fit="cover"
                    class="foto-img"
                  >
                    <template #loading>
                      <div class="absolute-full flex flex-center bg-grey-2">
                        <q-spinner color="primary" />
                      </div>
                    </template>
                    <template #error>
                      <div class="absolute-full flex flex-center bg-grey-2 text-grey-5">
                        <q-icon name="broken_image" size="48px" />
                      </div>
                    </template>
                    <div class="foto-overlay absolute-full flex flex-center">
                      <q-icon name="zoom_in" color="white" size="32px" />
                    </div>
                  </q-img>
                  <q-card-section class="q-py-sm q-px-md">
                    <div class="text-subtitle2 text-weight-bold ellipsis">{{ item.judul }}</div>
                    <div v-if="item.keterangan" class="text-caption text-grey-6 ellipsis-2-lines q-mt-xs">
                      {{ item.keterangan }}
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </template>

      <!-- Empty -->
      <template v-else>
        <div class="empty-state">
          <div class="empty-icon-wrap" :style="{ background: program.lightColor }">
            <q-icon :name="program.icon" :style="{ color: program.accentColor }" size="48px" />
          </div>
          <div class="text-h6 text-grey-7 q-mt-lg">Dokumentasi Segera Hadir</div>
          <div class="text-body2 text-grey-5 q-mt-sm">
            Foto-foto kegiatan {{ program.label }} akan segera ditambahkan.
          </div>
        </div>
      </template>
    </div>

    <!-- ─── Lightbox ──────────────────────────────────────────────────── -->
    <q-dialog v-model="lightbox" maximized transition-show="fade" transition-hide="fade">
      <div class="lightbox-backdrop" @click="lightbox = false">
        <q-btn flat round icon="close" color="white" class="lightbox-close" @click.stop="lightbox = false" />
        <q-btn
          v-if="lbIdx > 0"
          flat round icon="chevron_left"
          color="white"
          class="lightbox-prev"
          @click.stop="lbIdx--"
        />
        <q-btn
          v-if="lbIdx < lbPhotos.length - 1"
          flat round icon="chevron_right"
          color="white"
          class="lightbox-next"
          @click.stop="lbIdx++"
        />
        <div class="lightbox-img-wrap" @click.stop>
          <q-img
            v-if="lbPhotos[lbIdx]"
            :src="lbPhotos[lbIdx].foto"
            fit="contain"
            class="lightbox-img"
          />
          <div v-if="lbPhotos[lbIdx]?.judul" class="lightbox-caption">
            {{ lbPhotos[lbIdx].judul }}
          </div>
        </div>
      </div>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { usePendidikanStore } from 'src/stores/pendidikan';

const route = useRoute();
const store = usePendidikanStore();

// ── Slug → config map ─────────────────────────────────────────────────────────
const PROGRAM_MAP = {
  'tahsin-ikhwan': {
    key: 'TAHSIN_IKHWAN',
    label: 'Tahsin Ikhwan',
    tagline: 'Memperbaiki bacaan Al-Qur\'an untuk saudara-saudara ikhwan',
    icon: 'auto_stories',
    gradient: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
    accentColor: '#1565C0',
    lightColor: '#E3F2FD',
  },
  'tahsin-akhwat': {
    key: 'TAHSIN_AKHWAT',
    label: 'Tahsin Akhwat',
    tagline: 'Memperbaiki bacaan Al-Qur\'an untuk saudari-saudari akhwat',
    icon: 'auto_stories',
    gradient: 'linear-gradient(135deg, #6A1B9A 0%, #4A148C 100%)',
    accentColor: '#6A1B9A',
    lightColor: '#F3E5F5',
  },
  'bahasa-arab-ikhwan': {
    key: 'BAHASA_ARAB_IKHWAN',
    label: 'Bahasa Arab Ikhwan',
    tagline: 'Belajar Bahasa Arab sebagai kunci memahami Al-Qur\'an dan Sunnah',
    icon: 'translate',
    gradient: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
    accentColor: '#2E7D32',
    lightColor: '#E8F5E9',
  },
  'bahasa-arab-akhwat': {
    key: 'BAHASA_ARAB_AKHWAT',
    label: 'Bahasa Arab Akhwat',
    tagline: 'Belajar Bahasa Arab sebagai kunci memahami Al-Qur\'an dan Sunnah',
    icon: 'translate',
    gradient: 'linear-gradient(135deg, #BF360C 0%, #870000 100%)',
    accentColor: '#BF360C',
    lightColor: '#FBE9E7',
  },
  'tpq': {
    key: 'TPQ',
    label: 'TPQ (Taman Pendidikan Al-Qur\'an)',
    tagline: 'Mendidik generasi Qur\'ani sejak dini',
    icon: 'child_care',
    gradient: 'linear-gradient(135deg, #E65100 0%, #BF360C 100%)',
    accentColor: '#E65100',
    lightColor: '#FFF3E0',
  },
};

const slug = computed(() => route.params.slug);
const program = computed(() => PROGRAM_MAP[slug.value] || PROGRAM_MAP['tahsin-ikhwan']);
const kategori = computed(() => program.value.key);

// ── Data ──────────────────────────────────────────────────────────────────────
const info = computed(() => store.infoByKategori[kategori.value] || null);
const fotos = computed(() => store.fotosByKategori[kategori.value] || []);
const availableYears = computed(() => store.yearsByKategori[kategori.value] || []);

const pengajarList = computed(() => {
  try { return JSON.parse(info.value?.pengajar || '[]'); } catch { return []; }
});
const kitabList = computed(() => {
  try { return JSON.parse(info.value?.kitab || '[]'); } catch { return []; }
});

const activeYear = ref(null);

const fotosForYear = (yr) => fotos.value.filter((f) => f.tahun === yr);

// ── Lightbox ──────────────────────────────────────────────────────────────────
const lightbox = ref(false);
const lbPhotos = ref([]);
const lbIdx = ref(0);

const openLightbox = (yr, idx) => {
  lbPhotos.value = fotosForYear(yr);
  lbIdx.value = idx;
  lightbox.value = true;
};

// ── Lifecycle ─────────────────────────────────────────────────────────────────
const loadData = async () => {
  await store.fetchByKategori(kategori.value);
  if (availableYears.value.length) activeYear.value = availableYears.value[0];
};

onMounted(loadData);
watch(slug, loadData);
</script>

<style scoped>
/* ── Hero ──────────────────────────────────────────────────────────────────── */
.pendidikan-hero {
  position: relative;
  min-height: 280px;
  display: flex;
  align-items: center;
}
.hero-overlay {
  width: 100%;
  padding: 60px 32px;
  background: linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.35));
}
.hero-content {
  max-width: 820px;
  margin: 0 auto;
  text-align: center;
  color: #fff;
}
.hero-overline {
  letter-spacing: 2px;
  opacity: 0.85;
  font-size: 11px;
  color: rgba(255,255,255,0.9);
}
.hero-title {
  font-size: clamp(26px, 5vw, 40px);
  font-weight: 800;
  margin: 8px 0;
}
.hero-tagline {
  opacity: 0.88;
  font-size: 16px;
  margin: 0;
}

/* ── Info Cards ────────────────────────────────────────────────────────────── */
.info-cards-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
.info-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.07);
  padding: 20px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  flex: 1 1 200px;
}
.info-card--wide {
  flex: 2 1 320px;
}
.info-card-icon-wrap {
  border-radius: 12px;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.info-card-value {
  font-size: 32px;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 4px;
}
.info-card-label {
  font-size: 12px;
  color: #757575;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.kitab-badge {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 20px;
}

/* ── Deskripsi ─────────────────────────────────────────────────────────────── */
.deskripsi-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  align-items: flex-start;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

/* ── Section title ─────────────────────────────────────────────────────────── */
.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
}
.title-line {
  display: inline-block;
  width: 4px;
  height: 28px;
  border-radius: 4px;
}

/* ── Year tabs ─────────────────────────────────────────────────────────────── */
.year-tabs {
  background: #f5f5f5;
  border-radius: 10px;
  padding: 4px;
}
.year-tab {
  border-radius: 8px;
  transition: all 0.2s;
}

/* ── Foto card ─────────────────────────────────────────────────────────────── */
.foto-card {
  cursor: pointer;
  border-radius: 16px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}
.foto-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.14);
}
.foto-img {
  border-radius: 0;
}
.foto-overlay {
  background: rgba(0,0,0,0.4);
  opacity: 0;
  transition: opacity 0.2s;
  border-radius: 0;
}
.foto-card:hover .foto-overlay {
  opacity: 1;
}

/* ── Empty state ───────────────────────────────────────────────────────────── */
.empty-state {
  text-align: center;
  padding: 60px 0;
}
.empty-icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: 100px;
  height: 100px;
}

/* ── Lightbox ──────────────────────────────────────────────────────────────── */
.lightbox-backdrop {
  position: relative;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.92);
  display: flex;
  align-items: center;
  justify-content: center;
}
.lightbox-close {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
}
.lightbox-prev {
  position: absolute;
  left: 12px;
  z-index: 10;
}
.lightbox-next {
  position: absolute;
  right: 12px;
  z-index: 10;
}
.lightbox-img-wrap {
  max-width: min(90vw, 900px);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.lightbox-img {
  max-height: 80vh;
  width: 100%;
  border-radius: 8px;
}
.lightbox-caption {
  margin-top: 12px;
  color: rgba(255,255,255,0.85);
  font-size: 14px;
  text-align: center;
}
</style>
