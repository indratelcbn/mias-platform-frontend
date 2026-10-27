<template>
  <q-page class="q-pb-xl">
    <!-- Hero -->
    <div class="page-hero bg-primary text-white q-py-xl text-center">
      <div class="q-px-md">
        <q-icon name="auto_stories" size="48px" class="q-mb-md" />
        <h1 class="text-h4 text-weight-bold q-mb-sm">Muroja'ah Kajian</h1>
        <p class="text-body1 opacity-80">Ulangi materi kajian dan uji pemahaman Anda — Masjid Imam Asy-Syafi'i Depok</p>
      </div>
    </div>

    <div class="q-px-md q-py-lg" style="max-width: 1000px; margin: 0 auto">
      <!-- Filter / Pencarian -->
      <q-card flat bordered class="q-mb-lg rounded-xl">
        <q-card-section class="row q-col-gutter-md items-center">
          <div class="col-12 col-md-5">
            <q-input
              v-model="search" outlined dense clearable debounce="250"
              placeholder="Cari ustadz, kitab, judul, atau tanggal…" @update:model-value="resetPage"
            >
              <template #prepend><q-icon name="search" /></template>
            </q-input>
          </div>
          <div class="col-6 col-md-3">
            <q-select
              v-model="fUstadz" outlined dense clearable emit-value map-options
              :options="ustadzOptions" label="Ustadz" @update:model-value="resetPage"
            >
              <template #prepend><q-icon name="person" /></template>
            </q-select>
          </div>
          <div class="col-6 col-md-3">
            <q-select
              v-model="fKitab" outlined dense clearable emit-value map-options
              :options="kitabOptions" label="Kitab / Tematik" @update:model-value="resetPage"
            >
              <template #prepend><q-icon name="menu_book" /></template>
            </q-select>
          </div>
          <div class="col-12 col-md-1 text-center text-caption text-grey-7">
            {{ filtered.length }} hasil
          </div>
        </q-card-section>
      </q-card>

      <q-inner-loading :showing="loading"><q-spinner-dots size="40px" color="primary" /></q-inner-loading>

      <div v-if="!loading && !allItems.length" class="text-center text-grey-6 q-py-xl">
        <q-icon name="auto_stories" size="56px" class="q-mb-sm" />
        <div>Belum ada Muroja'ah yang dipublikasikan.</div>
      </div>
      <div v-else-if="!loading && !filtered.length" class="text-center text-grey-6 q-py-xl">
        <q-icon name="search_off" size="56px" class="q-mb-sm" />
        <div>Tidak ada Muroja'ah yang cocok dengan pencarian.</div>
        <q-btn flat no-caps color="primary" label="Reset pencarian" class="q-mt-sm" @click="resetFilters" />
      </div>

      <div class="row q-col-gutter-lg">
        <div v-for="k in pagedItems" :key="k.id" class="col-12 col-sm-6">
          <q-card flat bordered class="rounded-xl full-height cursor-pointer murojaah-card" @click="goDetail(k.slug)">
            <div class="thumb-wrap">
              <q-img v-if="cardImage(k)" :src="cardImage(k)" :ratio="16/9" fit="cover" class="rounded-top" />
              <div v-else class="thumb-placeholder flex flex-center column rounded-top">
                <q-icon name="auto_stories" size="44px" color="white" />
                <div class="text-white text-weight-medium q-mt-xs">Muroja'ah</div>
              </div>
              <div class="absolute-bottom-right q-pa-sm">
                <q-chip dense color="primary" text-color="white" icon="layers" :label="`${k.jumlahSesi} sesi`" />
              </div>
            </div>
            <q-card-section>
              <div class="text-h6 text-weight-bold ellipsis-2-lines">{{ k.judul }}</div>
              <div class="text-caption text-grey-7 q-mt-xs">
                <q-icon name="person" size="16px" /> {{ k.ustadz }}
                <template v-if="k.kitab"><br><q-icon name="menu_book" size="16px" /> {{ k.kitab }}</template>
                <template v-else><br><q-icon name="label" size="16px" /> Kajian Tematik</template>
                <template v-if="k.tanggal"><br><q-icon name="event" size="16px" /> {{ formatDate(k.tanggal) }}</template>
              </div>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn flat no-caps color="primary" label="Buka Muroja'ah" icon-right="arrow_forward" />
            </q-card-actions>
          </q-card>
        </div>
      </div>

      <div v-if="totalPages > 1" class="row justify-center q-mt-lg">
        <q-pagination v-model="page" :max="totalPages" direction-links />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useMurojaahStore } from 'src/stores/murojaah';

const router = useRouter();
const store = useMurojaahStore();

const TEMATIK = '__TEMATIK__';
const allItems = ref([]);
const loading = ref(false);

const search = ref('');
const fUstadz = ref(null);
const fKitab = ref(null);
const page = ref(1);
const pageSize = 12;

const formatDate = (d) => new Date(d).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
// Gambar kartu: utamakan thumbnail Muroja'ah/kajian yang sudah diupload, lalu thumbnail YouTube.
const cardImage = (k) => k.thumbnail || (k.youtubeId ? `https://img.youtube.com/vi/${k.youtubeId}/hqdefault.jpg` : null);

// Opsi filter diturunkan dari data yang ada
const ustadzOptions = computed(() => {
  const set = new Set();
  allItems.value.forEach((k) => { if (k.ustadz) set.add(k.ustadz); });
  return [...set].sort((a, b) => a.localeCompare(b, 'id')).map((u) => ({ label: u, value: u }));
});
const kitabOptions = computed(() => {
  const set = new Set();
  let adaTematik = false;
  allItems.value.forEach((k) => {
    if (k.kitab && k.kitab.trim()) set.add(k.kitab);
    else adaTematik = true;
  });
  const opts = [...set].sort((a, b) => a.localeCompare(b, 'id')).map((kt) => ({ label: kt, value: kt }));
  if (adaTematik) opts.push({ label: 'Tematik (tanpa kitab)', value: TEMATIK });
  return opts;
});

// Teks pencarian menggabungkan ustadz, kitab/tematik, judul, dan tanggal (nama hari/bulan)
const haystack = (k) => [
  k.judul, k.ustadz, k.kitab || 'tematik',
  k.tanggal ? formatDate(k.tanggal) : '',
].join(' ').toLowerCase();

const filtered = computed(() => {
  const q = (search.value || '').trim().toLowerCase();
  return allItems.value.filter((k) => {
    if (fUstadz.value && k.ustadz !== fUstadz.value) return false;
    if (fKitab.value) {
      if (fKitab.value === TEMATIK) { if (k.kitab && k.kitab.trim()) return false; }
      else if (k.kitab !== fKitab.value) return false;
    }
    if (q && !haystack(k).includes(q)) return false;
    return true;
  });
});

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)));
const pagedItems = computed(() => {
  const start = (page.value - 1) * pageSize;
  return filtered.value.slice(start, start + pageSize);
});

const resetPage = () => { page.value = 1; };
const resetFilters = () => { search.value = ''; fUstadz.value = null; fKitab.value = null; page.value = 1; };

const goDetail = (slug) => router.push({ name: 'murojaah-detail', params: { slug } });

const load = async () => {
  loading.value = true;
  const res = await store.publicList({ page: 1, limit: 500 });
  if (res) allItems.value = res.data;
  loading.value = false;
};

onMounted(load);
</script>

<style scoped>
.murojaah-card { transition: box-shadow .2s, transform .2s; }
.murojaah-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,.12); transform: translateY(-2px); }
.ellipsis-2-lines { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.thumb-wrap { position: relative; }
.thumb-placeholder { aspect-ratio: 16 / 9; width: 100%; background: linear-gradient(135deg, #1B7A4A, #26A65B); }
</style>
