<template>
  <q-page class="q-pb-xl">
    <!-- Hero -->
    <div class="page-hero bg-primary text-white q-py-xl text-center">
      <div class="q-px-md">
        <q-icon name="menu_book" size="48px" class="q-mb-md" />
        <h1 class="text-h4 text-weight-bold q-mb-sm">Kajian Islam</h1>
        <p class="text-body1 opacity-80">Jadwal kajian & pengajian di Masjid Imam Asy Syafi'i</p>
      </div>
    </div>

    <div class="q-px-md q-py-lg" style="max-width: 1200px; margin: 0 auto">
      <!-- ─── Filter ──────────────────────────────────────────────────── -->
      <q-card flat bordered class="q-mb-lg rounded-xl">
        <q-card-section>
          <div class="text-subtitle2 text-weight-bold q-mb-sm">
            <q-icon name="filter_alt" color="primary" class="q-mr-xs" />Filter Kajian
          </div>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-4">
              <q-input
                v-model="filters.ustadz"
                outlined
                dense
                label="Nama Ustadz"
                placeholder="Cari berdasarkan ustadz..."
                clearable
              >
                <template #prepend><q-icon name="person" /></template>
              </q-input>
            </div>
            <div class="col-12 col-sm-4">
              <q-input
                v-model="filters.tanggalDari"
                outlined
                dense
                label="Tanggal Dari"
                type="date"
              >
                <template #prepend><q-icon name="event" /></template>
              </q-input>
            </div>
            <div class="col-12 col-sm-4">
              <q-input
                v-model="filters.tanggalSampai"
                outlined
                dense
                label="Tanggal Sampai"
                type="date"
              >
                <template #prepend><q-icon name="event" /></template>
              </q-input>
            </div>
            <div class="col-12 row q-gutter-sm justify-end">
              <q-btn unelevated color="primary" label="Cari" icon="search" no-caps @click="applyFilter" />
              <q-btn flat label="Reset" no-caps @click="resetFilter" />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- ─── List Kajian ─────────────────────────────────────────────── -->
      <div v-if="kajianStore.loading" class="row q-col-gutter-md">
        <div v-for="i in 6" :key="i" class="col-12 col-sm-6 col-md-4">
          <q-skeleton type="rect" height="200px" class="rounded-xl" />
        </div>
      </div>

      <template v-else>
        <div v-if="kajianStore.list.length" class="row q-col-gutter-md">
          <div
            v-for="kajian in kajianStore.list"
            :key="kajian.id"
            class="col-12 col-sm-6 col-md-4"
          >
            <KajianCard :kajian="kajian" />
          </div>
        </div>

        <div v-else class="text-center q-py-xl">
          <q-icon name="search_off" size="64px" color="grey-5" />
          <p class="text-grey-6 q-mt-md">Tidak ada kajian yang ditemukan</p>
        </div>

        <!-- Pagination -->
        <div v-if="kajianStore.meta.totalPages > 1" class="flex justify-center q-mt-xl">
          <q-pagination
            v-model="currentPage"
            :max="kajianStore.meta.totalPages"
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
import { ref, reactive, onMounted } from 'vue';
import { useKajianStore } from 'src/stores/kajian';
import KajianCard from 'src/components/KajianCard.vue';

const kajianStore = useKajianStore();
const currentPage = ref(1);

const filters = reactive({
  ustadz: '',
  tanggalDari: '',
  tanggalSampai: '',
});

onMounted(() => {
  kajianStore.fetchAll({ page: 1, limit: 9 });
});

const applyFilter = () => {
  currentPage.value = 1;
  Object.assign(kajianStore.filters, filters);
  kajianStore.fetchAll({ page: 1, limit: 9, ...filters });
};

const resetFilter = () => {
  filters.ustadz = '';
  filters.tanggalDari = '';
  filters.tanggalSampai = '';
  kajianStore.resetFilters();
  kajianStore.fetchAll({ page: 1, limit: 9 });
};

const onPageChange = (page) => {
  kajianStore.fetchAll({ page, limit: 9, ...filters });
};
</script>

<style scoped>
.page-hero {
  background: linear-gradient(135deg, #1B7A4A 0%, #26A65B 100%);
}
</style>
