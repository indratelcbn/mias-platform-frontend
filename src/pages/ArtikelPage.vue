<template>
  <q-page class="q-pb-xl">
    <!-- Hero -->
    <div class="page-hero bg-primary text-white q-py-xl text-center">
      <div class="q-px-md">
        <q-icon name="article" size="48px" class="q-mb-md" />
        <h1 class="text-h4 text-weight-bold q-mb-sm">Artikel & Berita</h1>
        <p class="text-body1 opacity-80">Informasi terkini seputar kegiatan masjid dan keilmuan Islam</p>
      </div>
    </div>

    <div class="q-px-md q-py-xl" style="max-width: 1200px; margin: 0 auto">
      <!-- Loading -->
      <div v-if="artikelStore.loading" class="row q-col-gutter-md">
        <div v-for="i in 6" :key="i" class="col-12 col-sm-6 col-md-4">
          <q-skeleton type="rect" height="280px" class="rounded-xl" />
        </div>
      </div>

      <template v-else>
        <div v-if="artikelStore.list.length" class="row q-col-gutter-md">
          <div
            v-for="artikel in artikelStore.list"
            :key="artikel.id"
            class="col-12 col-sm-6 col-md-4"
          >
            <ArtikelCard :artikel="artikel" />
          </div>
        </div>

        <div v-else class="text-center q-py-xl">
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
import { ref, onMounted } from 'vue';
import { useArtikelStore } from 'src/stores/artikel';
import ArtikelCard from 'src/components/ArtikelCard.vue';

const artikelStore = useArtikelStore();
const currentPage = ref(1);

onMounted(() => {
  artikelStore.fetchAll({ page: 1, limit: 9 });
});

const onPageChange = (page) => {
  currentPage.value = page;
  artikelStore.fetchAll({ page, limit: 9 });
};
</script>

<style scoped>
.page-hero {
  background: linear-gradient(135deg, #1B7A4A 0%, #26A65B 100%);
}
</style>
