<template>
  <q-page class="q-pb-xl">
    <div class="page-hero q-py-xl text-center text-white">
      <q-icon name="verified" size="48px" class="q-mb-sm" />
      <h1 class="text-h4 text-weight-bold q-mb-sm">Visi &amp; Misi</h1>
      <p class="text-body1 opacity-80">Landasan arah dan tujuan Masjid Imam Asy Syafi'i</p>
    </div>

    <div class="q-px-md q-py-xl" style="max-width: 900px; margin: 0 auto">
      <div v-if="store.loading" class="text-center q-py-xl">
        <q-spinner-dots color="primary" size="48px" />
      </div>
      <template v-else-if="store.data">
        <div class="row q-col-gutter-xl">
          <!-- Visi -->
          <div class="col-12 col-md-6">
            <q-card flat bordered class="vm-card">
              <q-card-section class="bg-primary text-white q-pa-lg">
                <div class="row items-center q-gutter-sm">
                  <q-icon name="visibility" size="28px" />
                  <span class="text-h6 text-weight-bold">Visi</span>
                </div>
              </q-card-section>
              <q-card-section class="q-pa-lg">
                <p class="text-body1" style="line-height: 1.9; white-space: pre-line">
                  {{ store.data.visi || 'Belum diisi.' }}
                </p>
              </q-card-section>
            </q-card>
          </div>
          <!-- Misi -->
          <div class="col-12 col-md-6">
            <q-card flat bordered class="vm-card">
              <q-card-section class="bg-positive text-white q-pa-lg">
                <div class="row items-center q-gutter-sm">
                  <q-icon name="flag" size="28px" />
                  <span class="text-h6 text-weight-bold">Misi</span>
                </div>
              </q-card-section>
              <q-card-section class="q-pa-lg">
                <p class="text-body1" style="line-height: 1.9; white-space: pre-line">
                  {{ store.data.misi || 'Belum diisi.' }}
                </p>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </template>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue';
import { useProfilVisiMisiStore } from 'src/stores/profil';

const store = useProfilVisiMisiStore();
onMounted(() => store.fetch());
</script>

<style scoped>
.page-hero {
  background: linear-gradient(135deg, #1565C0 0%, #0D47A1 100%);
  padding: 80px 0;
}
.vm-card { border-radius: 12px; overflow: hidden; }
</style>
