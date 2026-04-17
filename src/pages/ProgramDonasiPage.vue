<template>
  <q-page class="q-pb-xl">
    <!-- Hero -->
    <div class="page-hero q-py-xl text-center text-white">
      <div class="q-px-md">
        <q-icon name="volunteer_activism" size="56px" class="q-mb-md" />
        <h1 class="text-h4 text-weight-bold q-mb-sm">Program Infaq</h1>
        <p class="text-body1 opacity-85">
          "Orang yang menginfakkan hartanya di jalan Allah seperti biji yang menumbuhkan tujuh tangkai" – QS. Al-Baqarah: 261
        </p>
      </div>
    </div>

    <div class="q-px-md q-py-xl" style="max-width: 900px; margin: 0 auto">
      <div v-if="donasiStore.loading" class="text-center q-py-xl">
        <q-spinner-dots color="primary" size="48px" />
      </div>
      <div v-else-if="!donasiStore.programList.length" class="text-center q-py-xl text-grey-6">
        <q-icon name="info" size="72px" color="grey-4" />
        <div class="q-mt-md">Belum ada program infaq.</div>
      </div>

      <q-card v-else flat bordered class="rounded-xl">
        <q-table
          :rows="donasiStore.programList"
          :columns="columns"
          row-key="id"
          flat
          hide-pagination
          :rows-per-page-options="[0]"
          :pagination="{ rowsPerPage: 0 }"
        >
          <template #body-cell-target="props">
            <q-td>{{ formatCurrency(props.value) }}</q-td>
          </template>
          <template #body-cell-terkumpul="props">
            <q-td>
              <div>{{ formatCurrency(props.value) }}</div>
              <q-linear-progress rounded size="6px"
                :value="props.row.target > 0 ? Math.min(Number(props.row.terkumpul) / Number(props.row.target), 1) : 0"
                color="primary" track-color="grey-3" class="q-mt-xs" style="max-width: 120px" />
            </q-td>
          </template>
        </q-table>
      </q-card>

      <!-- Link ke halaman infaq / konfirmasi transfer -->
      <div class="text-center q-mt-xl">
        <q-btn
          unelevated
          color="primary"
          no-caps
          icon="volunteer_activism"
          label="Konfirmasi Infaq"
          to="/donasi"
          size="lg"
          style="border-radius: 12px"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue';
import { useDonasiStore } from 'src/stores/donasi';

const donasiStore = useDonasiStore();

onMounted(() => {
  donasiStore.fetchActiveProgram();
});

const columns = [
  { name: 'kode', label: 'Kode', field: 'kode', align: 'left' },
  { name: 'judul', label: 'Kegiatan', field: 'judul', align: 'left', sortable: true },
  { name: 'target', label: 'Target', field: 'target', align: 'right' },
  { name: 'terkumpul', label: 'Terkumpul', field: 'terkumpul', align: 'left' },
];

const formatCurrency = (val) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
</script>

<style scoped>
.page-hero {
  background: linear-gradient(135deg, #1B7A4A 0%, #2E7D32 100%);
  padding: 80px 0;
}
</style>
