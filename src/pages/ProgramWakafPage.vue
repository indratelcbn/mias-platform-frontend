<template>
  <q-page class="q-pb-xl">
    <!-- Hero -->
    <div class="page-hero q-py-xl text-center text-white">
      <div class="q-px-md">
        <q-icon name="mosque" size="56px" class="q-mb-md" />
        <h1 class="text-h4 text-weight-bold q-mb-sm">Program Wakaf</h1>
        <p class="text-body1 opacity-85">
          "Jika anak Adam meninggal, terputuslah amalnya kecuali tiga: sedekah jariyah, ilmu yang bermanfaat, dan anak sholeh yang mendoakannya" – HR. Muslim
        </p>
      </div>
    </div>

    <div class="q-px-md q-py-xl" style="max-width: 900px; margin: 0 auto">
      <div v-if="donasiStore.loading" class="text-center q-py-xl">
        <q-spinner-dots color="primary" size="48px" />
      </div>
      <div v-else-if="!donasiStore.wakafList.length" class="text-center q-py-xl text-grey-6">
        <q-icon name="info" size="72px" color="grey-4" />
        <div class="q-mt-md">Belum ada program wakaf.</div>
      </div>

      <q-card v-else flat bordered class="rounded-xl">
        <q-table
          :rows="donasiStore.wakafList"
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
  donasiStore.fetchActiveWakaf();
});

const columns = [
  { name: 'kode', label: 'Kode', field: 'kode', align: 'left' },
  { name: 'kegiatan', label: 'Kegiatan', field: 'kegiatan', align: 'left', sortable: true },
  { name: 'deskripsi', label: 'Deskripsi', field: 'deskripsi', align: 'left' },
  { name: 'target', label: 'Target', field: 'target', align: 'left' },
  { name: 'terkumpul', label: 'Terkumpul', field: 'terkumpul', align: 'left' },
];

const formatCurrency = (val) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
</script>

<style scoped>
.page-hero {
  background: linear-gradient(135deg, #1565C0 0%, #1976D2 100%);
  padding: 80px 0;
}
</style>
