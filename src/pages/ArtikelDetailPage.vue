<template>
  <q-page class="q-pb-xl">
    <div v-if="artikelStore.loading" class="flex justify-center items-center" style="min-height: 60vh">
      <q-spinner-dots color="primary" size="64px" />
    </div>

    <template v-else-if="artikelStore.current">
      <!-- Hero Image -->
      <div class="artikel-hero" :style="heroStyle">
        <div class="hero-overlay q-px-md q-pb-xl" style="max-width: 800px; margin: 0 auto">
          <q-btn flat dense icon="arrow_back" label="Artikel" no-caps @click="$router.push('/artikel')" class="q-mb-md text-white opacity-80" />
          <h1 class="text-h4 text-white text-weight-bold">{{ artikelStore.current.judul }}</h1>
          <div class="row items-center q-gutter-sm q-mt-md text-white opacity-80">
            <q-icon name="person" size="sm" />
            <span>{{ artikelStore.current.creator?.nama || 'Admin' }}</span>
            <span class="q-mx-xs">·</span>
            <q-icon name="calendar_today" size="sm" />
            <span>{{ formatDate(artikelStore.current.createdAt) }}</span>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="q-px-md" style="max-width: 800px; margin: 0 auto; margin-top: -32px; position: relative; z-index: 1">
        <q-card flat bordered class="rounded-xl">
          <q-card-section class="q-pa-xl">
            <div class="artikel-content" v-html="artikelStore.current.konten" />
          </q-card-section>
        </q-card>
      </div>
    </template>

    <div v-else class="flex column items-center justify-center q-py-xl">
      <q-icon name="article" size="80px" color="grey-4" />
      <p class="text-grey-6 q-mt-md">Artikel tidak ditemukan</p>
      <q-btn unelevated color="primary" label="Kembali" @click="$router.push('/artikel')" class="q-mt-md" />
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useArtikelStore } from 'src/stores/artikel';

const route = useRoute();
const artikelStore = useArtikelStore();

const heroStyle = computed(() => {
  if (artikelStore.current?.thumbnail) {
    return {
      backgroundImage: `linear-gradient(rgba(0,0,0,0.50), rgba(0,0,0,0.50)), url(${artikelStore.current.thumbnail})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }
  return { background: 'linear-gradient(135deg, #1B7A4A 0%, #26A65B 100%)' };
});

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
};

onMounted(() => {
  artikelStore.fetchBySlug(route.params.slug);
});
</script>

<style scoped>
.artikel-hero {
  min-height: 350px;
  display: flex;
  align-items: flex-end;
  padding-top: 80px;
}
.hero-overlay {
  width: 100%;
}
</style>

<style>
.artikel-content p {
  margin-bottom: 1.2em;
  line-height: 1.8;
  font-size: 16px;
}
.artikel-content h2,
.artikel-content h3 {
  color: #1B7A4A;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}
</style>
