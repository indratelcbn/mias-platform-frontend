<template>
  <q-page class="q-pb-xl">
    <div class="page-hero q-py-xl text-center text-white">
      <q-icon name="account_tree" size="48px" class="q-mb-sm" />
      <h1 class="text-h4 text-weight-bold q-mb-sm">Struktur Organisasi</h1>
      <p class="text-body1 opacity-80">Susunan kepengurusan Masjid Imam Asy Syafi'i</p>
    </div>

    <div class="q-px-md q-py-xl" style="max-width: 1000px; margin: 0 auto">
      <div v-if="store.loading" class="text-center q-py-xl">
        <q-spinner-dots color="primary" size="48px" />
      </div>
      <template v-else-if="store.data">
        <q-img
          v-if="store.data.foto"
          :src="store.data.foto"
          class="rounded-xl"
          fit="contain"
          style="max-height: 700px"
        />
        <div v-else class="text-center q-py-xl text-grey-6">
          <q-icon name="account_tree" size="72px" color="grey-4" />
          <div class="q-mt-md">Struktur organisasi belum tersedia.</div>
        </div>
        <p v-if="store.data.keterangan" class="text-body2 text-grey-7 q-mt-lg" style="white-space: pre-line">
          {{ store.data.keterangan }}
        </p>
      </template>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue';
import { useProfilStrukturStore } from 'src/stores/profil';

const store = useProfilStrukturStore();
onMounted(() => store.fetch());
</script>

<style scoped>
.page-hero {
  background: linear-gradient(135deg, #4A148C 0%, #6A1B9A 100%);
  padding: 80px 0;
}
.rounded-xl { border-radius: 12px; overflow: hidden; }
</style>
