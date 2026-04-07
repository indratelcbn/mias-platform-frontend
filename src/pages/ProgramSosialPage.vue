<template>
  <q-page class="sosial-page">

    <!-- ─── Hero Section ─────────────────────────────────────────────────── -->
    <section class="sosial-hero" :style="{ background: program.gradient }">
      <div class="hero-overlay">
        <div class="hero-content">
          <q-icon :name="program.icon" size="56px" color="white" class="q-mb-md hero-icon" />
          <div class="text-overline q-mb-xs hero-overline">PROGRAM SOSIAL MIAS</div>
          <h1 class="hero-title">{{ program.judul }}</h1>
          <p class="hero-tagline">{{ program.tagline }}</p>
        </div>
      </div>
    </section>

    <!-- ─── Body ─────────────────────────────────────────────────────────── -->
    <div class="sosial-body q-px-lg q-px-md-xl q-pb-xl" style="max-width: 1100px; margin: 0 auto">

      <!-- About Card -->
      <div class="about-card q-mb-xl">
        <div class="about-card-inner">
          <div class="about-icon-wrap" :style="{ background: program.lightColor }">
            <q-icon :name="program.icon" :style="{ color: program.accentColor }" size="36px" />
          </div>
          <div class="about-text">
            <div class="text-h6 text-weight-bold q-mb-sm">Tentang Program</div>
            <p class="text-body1 text-grey-8 about-desc">{{ program.deskripsi }}</p>
          </div>
        </div>

        <!-- Stats / Highlights -->
        <div v-if="program.highlights" class="highlights-row q-mt-lg">
          <div
            v-for="(h, i) in program.highlights"
            :key="i"
            class="highlight-item"
          >
            <q-icon :name="h.icon" :style="{ color: program.accentColor }" size="28px" />
            <div class="text-caption text-weight-bold q-mt-xs">{{ h.label }}</div>
          </div>
        </div>
      </div>

      <!-- ─── Dokumentasi Foto ────────────────────────────────────────── -->
      <div class="text-h5 text-weight-bold q-mb-lg section-title">
        <span class="title-line" :style="{ background: program.accentColor }"></span>
        Dokumentasi Kegiatan
      </div>

      <!-- Loading Skeleton -->
      <div v-if="sosialStore.loading" class="row q-col-gutter-md">
        <div v-for="n in 6" :key="n" class="col-12 col-sm-6 col-md-4">
          <q-skeleton height="240px" style="border-radius: 16px" />
        </div>
      </div>

      <template v-else-if="fotos.length">
        <!-- Year Tabs (only shown if more than one year) -->
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
              :style="activeYear === yr ? { background: program.accentColor, color: '#fff', borderRadius: '8px' } : {}"
            />
          </q-tabs>
        </div>

        <!-- Grid Foto for active year -->
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
                    <div v-if="item.deskripsi" class="text-caption text-grey-6 ellipsis-2-lines q-mt-xs">
                      {{ item.deskripsi }}
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </template>

      <!-- Empty State -->
      <template v-else>
        <div class="empty-state">
          <div class="empty-icon-wrap" :style="{ background: program.lightColor }">
            <q-icon :name="program.icon" :style="{ color: program.accentColor }" size="48px" />
          </div>
          <div class="text-h6 text-grey-7 q-mt-lg">Dokumentasi Segera Hadir</div>
          <div class="text-body2 text-grey-5 q-mt-sm">
            Foto-foto kegiatan {{ program.judul }} akan segera ditambahkan.
          </div>
        </div>
      </template>

    </div>

    <!-- ─── Lightbox ───────────────────────────────────────────────────── -->
    <q-dialog v-model="lightbox" maximized transition-show="fade" transition-hide="fade">
      <div class="lightbox-backdrop" @click="lightbox = false">
        <!-- Close -->
        <q-btn flat round icon="close" color="white" class="lightbox-close" @click.stop="lightbox = false" />
        <!-- Prev -->
        <q-btn
          v-if="lightboxIdx > 0"
          flat round icon="chevron_left" color="white"
          class="lightbox-prev"
          @click.stop="lightboxIdx--"
        />
        <!-- Next -->
        <q-btn
          v-if="lightboxIdx < lightboxFotos.length - 1"
          flat round icon="chevron_right" color="white"
          class="lightbox-next"
          @click.stop="lightboxIdx++"
        />
        <!-- Image -->
        <div class="lightbox-img-wrap" @click.stop>
          <q-img
            v-if="lightboxFotos[lightboxIdx]"
            :src="lightboxFotos[lightboxIdx].foto"
            fit="contain"
            style="max-height: 85vh; max-width: 88vw; border-radius: 12px"
          />
          <div class="lightbox-caption text-white text-center q-mt-sm">
            <span class="text-subtitle2 text-weight-bold">{{ lightboxFotos[lightboxIdx]?.judul }}</span>
            <div v-if="lightboxFotos[lightboxIdx]?.deskripsi" class="text-caption text-grey-4 q-mt-xs">
              {{ lightboxFotos[lightboxIdx].deskripsi }}
            </div>
            <div class="text-caption text-grey-6 q-mt-xs">{{ lightboxIdx + 1 }} / {{ lightboxFotos.length }}</div>
          </div>
        </div>
      </div>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useSosialStore } from 'src/stores/sosial';

const route = useRoute();
const sosialStore = useSosialStore();

const lightbox = ref(false);
const lightboxIdx = ref(0);
const lightboxFotos = ref([]);
const activeYear = ref(null);

// ─── Program Config ───────────────────────────────────────────────────────────
const PROGRAMS = {
  'santunan-anak-yatim': {
    kategori: 'SANTUNAN_ANAK_YATIM',
    judul: 'Santunan Anak Yatim',
    tagline: 'Memuliakan Anak Yatim, Meraih Keberkahan Allah',
    icon: 'child_care',
    gradient: 'linear-gradient(135deg, #1a237e 0%, #283593 50%, #3949ab 100%)',
    accentColor: '#3949ab',
    lightColor: '#e8eaf6',
    deskripsi: 'Program Santunan Anak Yatim adalah wujud kepedulian Masjid Imam Asy Syafi\'i terhadap anak-anak yatim di sekitar wilayah Depok. Program ini memberikan bantuan berupa uang santunan, kebutuhan sekolah, dan perhatian penuh agar mereka dapat tumbuh dengan layak dan penuh cinta.',
    highlights: [
      { icon: 'favorite', label: 'Santunan Rutin' },
      { icon: 'school', label: 'Kebutuhan Sekolah' },
      { icon: 'groups', label: 'Pembinaan Karakter' },
    ],
  },
  'air-galon-gratis': {
    kategori: 'AIR_GALON_GRATIS',
    judul: 'Air Galon Gratis',
    tagline: 'Air Bersih Untuk Semua, Berkah Untuk Kita',
    icon: 'water_drop',
    gradient: 'linear-gradient(135deg, #006064 0%, #00838f 50%, #00acc1 100%)',
    accentColor: '#00838f',
    lightColor: '#e0f7fa',
    deskripsi: 'Program Air Galon Gratis hadir untuk memastikan jamaah dan warga sekitar masjid mendapatkan akses air minum bersih secara cuma-cuma. Air galon tersedia setiap hari di area masjid, menjadi bentuk nyata kepedulian masjid terhadap kebutuhan dasar masyarakat.',
    highlights: [
      { icon: 'water_drop', label: 'Setiap Hari Tersedia' },
      { icon: 'people_alt', label: 'Untuk Semua Jamaah' },
      { icon: 'verified', label: 'Air Bersih & Sehat' },
    ],
  },
  'layanan-kesehatan': {
    kategori: 'LAYANAN_KESEHATAN_IBU_ANAK',
    judul: 'Layanan Kesehatan Ibu dan Anak',
    tagline: 'Sehat Bersama, Tumbuh Bersama',
    icon: 'health_and_safety',
    gradient: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #43a047 100%)',
    accentColor: '#2e7d32',
    lightColor: '#e8f5e9',
    deskripsi: 'Layanan Kesehatan Ibu dan Anak merupakan program sosial masjid yang memberikan akses pemeriksaan kesehatan gratis bagi ibu hamil, ibu menyusui, serta anak-anak. Program ini dilaksanakan bekerja sama dengan tenaga medis sukarela untuk memastikan generasi penerus tumbuh sehat.',
    highlights: [
      { icon: 'pregnant_woman', label: 'Ibu Hamil & Menyusui' },
      { icon: 'child_care', label: 'Kesehatan Anak' },
      { icon: 'local_hospital', label: 'Tenaga Medis Profesional' },
    ],
  },
  'armalah-miskin': {
    kategori: 'ARMALAH_AL_MISKIN',
    judul: 'Armalah dan Al Miskin',
    tagline: 'Meringankan Beban, Menebar Kasih Sayang',
    icon: 'handshake',
    gradient: 'linear-gradient(135deg, #4a148c 0%, #6a1b9a 50%, #8e24aa 100%)',
    accentColor: '#6a1b9a',
    lightColor: '#f3e5f5',
    deskripsi: 'Program bantuan untuk para janda (armalah) dan kaum dhuafa (al miskin) di sekitar masjid. Bantuan diberikan dalam bentuk sembako, uang tunai, dan kebutuhan rumah tangga secara berkala, sebagai bentuk tanggung jawab sosial komunitas masjid.',
    highlights: [
      { icon: 'woman', label: 'Janda yang Membutuhkan' },
      { icon: 'volunteer_activism', label: 'Bantuan Rutin' },
      { icon: 'home', label: 'Kebutuhan Rumah Tangga' },
    ],
  },
  'bantuan-pengobatan': {
    kategori: 'BANTUAN_PENGOBATAN',
    judul: 'Bantuan Pengobatan',
    tagline: 'Bersama Peduli, Bersama Sembuh',
    icon: 'medication',
    gradient: 'linear-gradient(135deg, #b71c1c 0%, #c62828 50%, #e53935 100%)',
    accentColor: '#c62828',
    lightColor: '#ffebee',
    deskripsi: 'Program Bantuan Pengobatan memberikan dukungan biaya pengobatan bagi warga yang tidak mampu dan membutuhkan perawatan medis. Masjid hadir sebagai simpul kepedulian masyarakat untuk memastikan tidak ada yang menderita hanya karena keterbatasan ekonomi.',
    highlights: [
      { icon: 'local_pharmacy', label: 'Biaya Obat' },
      { icon: 'medical_services', label: 'Biaya Perawatan' },
      { icon: 'emergency', label: 'Bantuan Darurat' },
    ],
  },
  'zakat-maal': {
    kategori: 'ZAKAT_MAAL',
    judul: 'Zakat Maal',
    tagline: 'Bersihkan Harta, Berkah Merata',
    icon: 'paid',
    gradient: 'linear-gradient(135deg, #e65100 0%, #ef6c00 50%, #fb8c00 100%)',
    accentColor: '#ef6c00',
    lightColor: '#fff3e0',
    deskripsi: 'Zakat Maal adalah kewajiban setiap Muslim yang hartanya telah mencapai nisab. Masjid Imam Asy Syafi\'i hadir sebagai amil zakat terpercaya yang menyalurkan zakat kepada 8 asnaf yang berhak secara transparan, tepat sasaran, dan amanah.',
    highlights: [
      { icon: 'calculate', label: 'Konsultasi Nisab' },
      { icon: 'account_balance_wallet', label: 'Penyaluran Tepat Sasaran' },
      { icon: 'receipt_long', label: 'Laporan Transparan' },
    ],
  },
};

const program = computed(() => {
  const slug = route.params.slug;
  return PROGRAMS[slug] || PROGRAMS['santunan-anak-yatim'];
});

const fotos = computed(() => {
  const kat = program.value.kategori;
  return sosialStore.fotoByKategori[kat] || [];
});

const availableYears = computed(() => {
  const kat = program.value.kategori;
  return sosialStore.yearsByKategori[kat] || [];
});

const fotosForYear = (yr) => fotos.value.filter(f => f.tahun === yr);

const openLightbox = (yr, idx) => {
  lightboxFotos.value = fotosForYear(yr);
  lightboxIdx.value = idx;
  lightbox.value = true;
};

const loadFotos = async () => {
  if (program.value?.kategori) {
    await sosialStore.fetchByKategori(program.value.kategori);
    const yrs = availableYears.value;
    activeYear.value = yrs.length ? yrs[0] : null;
  }
};

onMounted(loadFotos);
watch(() => route.params.slug, loadFotos);
</script>

<style scoped>
/* ── Hero ── */
.sosial-hero {
  position: relative;
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.hero-overlay {
  position: relative;
  z-index: 1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  background: rgba(0, 0, 0, 0.25);
}
.hero-content {
  text-align: center;
  color: white;
}
.hero-icon {
  opacity: 0.9;
}
.hero-overline {
  font-size: 11px;
  letter-spacing: 4px;
  opacity: 0.75;
}
.hero-title {
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  font-weight: 800;
  margin: 8px 0 12px;
  line-height: 1.15;
}
.hero-tagline {
  font-size: clamp(1rem, 2vw, 1.15rem);
  opacity: 0.9;
  margin: 0;
  max-width: 540px;
}

/* ── About Card ── */
.about-card {
  background: #fff;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.07);
  margin-top: -32px;
  position: relative;
  z-index: 2;
}
.body--dark .about-card {
  background: #1d1d1d;
}
.about-card-inner {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}
.about-icon-wrap {
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.about-text { flex: 1; }
.about-desc {
  line-height: 1.75;
  color: #555;
  margin: 0;
}

/* ── Highlights ── */
.highlights-row {
  display: flex;
  gap: 0;
  border-top: 1px solid #f0f0f0;
  padding-top: 20px;
}
.highlight-item {
  flex: 1;
  text-align: center;
  padding: 8px;
}

/* ── Section Title ── */
.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
}
.title-line {
  display: inline-block;
  width: 5px;
  height: 28px;
  border-radius: 4px;
}

/* ── Foto Card ── */
.foto-card {
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.foto-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.14);
}
.foto-overlay {
  opacity: 0;
  background: rgba(0, 0, 0, 0.35);
  transition: opacity 0.2s;
}
.foto-card:hover .foto-overlay {
  opacity: 1;
}

/* ── Empty State ── */
.empty-state {
  text-align: center;
  padding: 64px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.empty-icon-wrap {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── Lightbox ── */
.lightbox-backdrop {
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
}
.lightbox-img-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: default;
}
.lightbox-close {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
}
.lightbox-prev {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  background: rgba(255,255,255,0.1);
  border-radius: 50%;
}
.lightbox-next {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  background: rgba(255,255,255,0.1);
  border-radius: 50%;
}

/* ── Year Tabs ── */
.year-tabs {
  background: #f5f5f5;
  border-radius: 10px;
  padding: 4px;
}
.body--dark .year-tabs {
  background: #2a2a2a;
}
.year-tab {
  border-radius: 8px;
  min-width: 70px;
  font-weight: 600;
  transition: background 0.2s, color 0.2s;
}

/* ── Responsive ── */
@media (max-width: 600px) {
  .about-card-inner { flex-direction: column; align-items: center; text-align: center; }
  .highlights-row { flex-wrap: wrap; }
  .highlight-item { min-width: 50%; }
  .about-card { margin-top: -20px; padding: 20px; }
}
</style>
