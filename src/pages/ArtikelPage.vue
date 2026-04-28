<template>
  <q-page class="q-pb-xl">
    <!-- Hero -->
    <div class="page-hero text-white q-py-xl text-center">
      <div class="q-px-md">
        <q-icon name="article" size="48px" class="q-mb-md" />
        <h1 class="text-h4 text-weight-bold q-mb-sm">Artikel & Berita</h1>
        <p class="text-body1 opacity-80">Informasi terkini seputar kegiatan masjid dan keilmuan Islam</p>
      </div>
    </div>

    <div class="q-px-md q-py-xl" style="max-width: 1200px; margin: 0 auto">
      <!-- Filter bar -->
      <div class="row items-center justify-between q-mb-lg q-col-gutter-sm">
        <div class="col-12 col-sm">
          <q-input
            v-model="search"
            dense outlined rounded
            placeholder="Cari artikel…"
            debounce="400"
            @update:model-value="reload"
          >
            <template #prepend><q-icon name="search" /></template>
          </q-input>
        </div>
        <div class="col-auto">
          <q-btn-toggle
            v-model="kategori"
            no-caps unelevated
            toggle-color="primary"
            color="white" text-color="grey-8"
            :options="kategoriOptions"
            @update:model-value="reload"
          />
        </div>
      </div>

      <!-- Highlight (top headline) -->
      <div v-if="!artikelStore.loading && headline" class="q-mb-xl">
        <router-link :to="`/artikel/${headline.slug}`" class="no-underline">
          <q-card flat bordered class="rounded-xl headline-card">
            <div class="row no-wrap">
              <div class="col-12 col-md-6 headline-img-wrap">
                <q-img v-if="headline.thumbnail" :src="headline.thumbnail" height="320px" fit="cover" />
                <div v-else class="headline-placeholder flex items-center justify-center">
                  <q-icon name="article" size="64px" color="white" />
                </div>
                <q-badge color="orange" class="headline-badge">
                  <q-icon name="bolt" size="xs" class="q-mr-xs" /> Headline
                </q-badge>
              </div>
              <div class="col-12 col-md-6 q-pa-lg flex column justify-center">
                <q-chip v-if="headline.kategori" dense color="primary" text-color="white" :label="headline.kategori" class="q-mb-sm self-start" />
                <h2 class="text-h5 text-weight-bold q-mt-none q-mb-sm">{{ headline.judul }}</h2>
                <div class="text-caption text-grey-7 q-mb-sm">
                  <q-icon name="event" size="xs" />
                  {{ formatDate(headline.tanggalPublish || headline.createdAt) }}
                </div>
                <p v-if="headline.ringkasan" class="text-body2 text-grey-8 ellipsis-3-lines">{{ headline.ringkasan }}</p>
                <q-btn unelevated no-caps color="primary" label="Baca Selengkapnya" icon-right="arrow_forward" class="self-start q-mt-md" />
              </div>
            </div>
          </q-card>
        </router-link>
      </div>

      <!-- Loading -->
      <div v-if="artikelStore.loading" class="row q-col-gutter-md">
        <div v-for="i in 6" :key="i" class="col-12 col-sm-6 col-md-4">
          <q-skeleton type="rect" height="600px" class="rounded-xl" />
        </div>
      </div>

      <template v-else>
        <div v-if="otherArticles.length" class="row q-col-gutter-md">
          <div
            v-for="artikel in otherArticles"
            :key="artikel.id"
            class="col-12 col-sm-6 col-md-4"
          >
            <ArtikelCard :artikel="artikel" />
          </div>
        </div>

        <div v-else-if="!headline" class="text-center q-py-xl">
          <q-icon name="article" size="64px" color="grey-5" />
          <p class="text-grey-6 q-mt-md">Belum ada artikel</p>
        </div>

        <!-- Pagination -->
        <div v-if="artikelStore.meta.totalPages > 1" class="flex justify-center q-mt-xl">
          <q-pagination
            v-model="currentPage"
            :max="artikelStore.meta.totalPages"
            direction-links
            color="primary"
            @update:model-value="onPageChange"
          />
        </div>
      </template>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useArtikelStore } from 'src/stores/artikel';
import ArtikelCard from 'src/components/ArtikelCard.vue';

const artikelStore = useArtikelStore();
const currentPage = ref(1);
const search = ref('');
const kategori = ref('');

const kategoriOptions = [
  { label: 'Semua', value: '' },
  { label: 'Berita', value: 'Berita' },
  { label: 'Kajian', value: 'Kajian' },
  { label: 'Pengumuman', value: 'Pengumuman' },
  { label: 'Kegiatan', value: 'Kegiatan' },
];

const headline = computed(() => {
  if (currentPage.value !== 1) return null;
  return artikelStore.list.find((a) => a.isHighlight) || null;
});
const otherArticles = computed(() => {
  if (!headline.value) return artikelStore.list;
  return artikelStore.list.filter((a) => a.id !== headline.value.id);
});

const formatDate = (d) =>
  new Date(d).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

const reload = () => {
  currentPage.value = 1;
  artikelStore.fetchAll({
    page: 1, limit: 9,
    search: search.value || undefined,
    kategori: kategori.value || undefined,
  });
};

const onPageChange = (page) => {
  currentPage.value = page;
  artikelStore.fetchAll({
    page, limit: 9,
    search: search.value || undefined,
    kategori: kategori.value || undefined,
  });
};

onMounted(() => reload());
</script>

<style scoped>
.page-hero {
  background: linear-gradient(135deg, #1B7A4A 0%, #26A65B 100%);
}
.headline-card { overflow: hidden; transition: all 0.25s ease; }
.headline-card:hover { transform: translateY(-3px); box-shadow: 0 14px 28px rgba(0,0,0,0.10) !important; }
.headline-img-wrap { position: relative; }
.headline-placeholder {
  height: 320px; background: linear-gradient(135deg, #26A65B, #1B7A4A);
}
.headline-badge {
  position: absolute; top: 14px; left: 14px;
  padding: 6px 10px; font-weight: 600;
}
.ellipsis-3-lines {
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
}
</style>
