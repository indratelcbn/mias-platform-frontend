<template>
  <q-page class="q-pb-xl">
    <div class="page-hero q-py-xl text-center text-white">
      <q-icon name="auto_stories" size="48px" class="q-mb-sm" />
      <h1 class="text-h4 text-weight-bold q-mb-sm">Pemateri Kajian Islam Ilmiyyah</h1>
      <p class="text-body1 opacity-80">Para ustadz pengajar di Masjid Imam Asy Syafi'i</p>
    </div>

    <div class="q-px-md q-py-xl" style="max-width: 1100px; margin: 0 auto">
      <!-- Filter tabs -->
      <div class="row justify-center q-mb-xl">
        <q-tabs v-model="tab" dense indicator-color="primary" active-color="primary">
          <q-tab name="all"    label="Semua" />
          <q-tab name="RUTIN"  label="Kajian Rutin" />
          <q-tab name="TEMATIK" label="Kajian Tematik" />
        </q-tabs>
      </div>

      <div v-if="store.loading" class="text-center q-py-xl">
        <q-spinner-dots color="primary" size="48px" />
      </div>
      <div v-else-if="!filtered.length" class="text-center q-py-xl text-grey-6">
        <q-icon name="person_off" size="72px" color="grey-4" />
        <div class="q-mt-md">Belum ada data pemateri.</div>
      </div>
      <div v-else class="row q-col-gutter-lg">
        <div v-for="p in filtered" :key="p.id" class="col-12 col-sm-6 col-md-4">
          <q-card flat bordered class="pemateri-card">
            <div class="row no-wrap q-pa-md q-gutter-md items-start">
              <!-- Foto / Avatar -->
              <q-avatar size="72px" class="flex-none">
                <img v-if="p.foto" :src="p.foto" />
                <q-icon v-else name="person" size="40px" color="grey-5" />
              </q-avatar>
              <div class="column col">
                <div class="text-subtitle1 text-weight-bold">{{ p.nama }}</div>
                <q-badge
                  :color="p.jenis === 'RUTIN' ? 'primary' : 'deep-orange'"
                  class="q-mt-xs q-mb-sm"
                  style="width: fit-content"
                >{{ p.jenis === 'RUTIN' ? 'Kajian Rutin' : 'Kajian Tematik' }}</q-badge>

                <!-- Daftar Kitab -->
                <div v-if="p.kitab" class="column q-gutter-xs">
                  <div
                    v-for="k in kitabList(p.kitab)"
                    :key="k"
                    class="row items-start q-gutter-xs"
                  >
                    <q-icon name="menu_book" size="14px" color="primary" class="q-mt-xs" />
                    <span class="text-caption text-grey-8">{{ k }}</span>
                  </div>
                </div>

                <p v-if="p.keterangan" class="text-caption text-grey-6 q-mt-xs">{{ p.keterangan }}</p>
              </div>
            </div>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useProfilPemateriStore } from 'src/stores/profil';

const store = useProfilPemateriStore();
onMounted(() => store.fetchPublic());

const tab = ref('all');

const filtered = computed(() =>
  tab.value === 'all' ? store.list : store.list.filter(p => p.jenis === tab.value)
);

function kitabList(kitab) {
  return kitab ? kitab.split('\n').map(k => k.trim()).filter(Boolean) : [];
}
</script>

<style scoped>
.page-hero {
  background: linear-gradient(135deg, #BF360C 0%, #E64A19 100%);
  padding: 80px 0;
}
.pemateri-card { border-radius: 12px; transition: box-shadow .15s; }
.pemateri-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.1); }
</style>
