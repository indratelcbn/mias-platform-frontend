<template>
  <q-page class="q-pb-xl">
    <div class="page-hero q-py-xl text-center text-white">
      <q-icon name="mdi-calendar-clock" size="48px" class="q-mb-sm" />
      <h1 class="text-h4 text-weight-bold q-mb-sm">Jadwal Pendidikan</h1>
      <p class="text-body1 opacity-80">Jadwal kelas pendidikan di Masjid Imam Asy Syafi'i</p>
    </div>

    <div class="q-px-md q-py-xl" style="max-width: 1400px; margin: 0 auto">
      <!-- Loading -->
      <div v-if="store.loading" class="q-pa-md">
        <template v-if="isMobile">
          <q-skeleton type="rect" height="56px" class="rounded-borders q-mb-sm" v-for="i in 4" :key="i" />
        </template>
        <div v-else class="text-center q-py-xl">
          <q-spinner-dots color="primary" size="48px" />
        </div>
      </div>

      <!-- Empty -->
      <div v-else-if="!groups.length" class="text-center q-py-xl text-grey-6">
        <q-icon name="event_busy" size="72px" color="grey-4" />
        <div class="q-mt-md">Belum ada jadwal pendidikan yang tersedia.</div>
      </div>

      <template v-else>
        <!-- ═══ DESKTOP ════════════════════════════════════════════ -->
        <div v-if="!isMobile" class="q-gutter-y-lg">
          <q-card
            v-for="group in groups"
            :key="group.key"
            flat
            bordered
            class="kelas-card"
          >
            <div class="group-header" :style="{ background: group.gradient }">
              <q-icon :name="group.icon" size="22px" class="q-mr-sm" />
              <span class="text-weight-bold">{{ group.label }}</span>
            </div>
            <q-table
              :rows="group.rows"
              :columns="columns"
              row-key="id"
              flat
              hide-pagination
              :rows-per-page-options="[0]"
              :pagination="{ rowsPerPage: 0 }"
              class="kelas-table"
            >
              <template #body-cell-no="props">
                <q-td class="text-center text-weight-medium text-grey-8">{{ props.rowIndex + 1 }}</q-td>
              </template>
              <template #body-cell-namaKelas="props">
                <q-td>
                  <q-badge :style="{ background: group.accent }" class="text-white kelas-badge">{{ props.value }}</q-badge>
                </q-td>
              </template>
              <template #body-cell-keterangan="props">
                <q-td style="white-space: pre-line; max-width: 220px">{{ props.value || '-' }}</q-td>
              </template>
            </q-table>
          </q-card>
        </div>

        <!-- ═══ MOBILE ═════════════════════════════════════════════ -->
        <div v-else class="q-gutter-y-sm">
          <q-expansion-item
            v-for="(group, gi) in groups"
            :key="group.key"
            :label="group.label"
            :default-opened="gi === 0"
            expand-icon-class="text-white"
            header-class="kelas-header"
            :header-style="{ background: group.gradient }"
            class="kelas-expansion rounded-borders overflow-hidden"
            bordered
          >
            <q-list separator>
              <q-item v-for="(row, index) in group.rows" :key="row.id" class="q-py-sm items-start">
                <q-item-section avatar style="min-width:36px">
                  <q-avatar size="30px" :style="{ background: group.accent }" text-color="white" font-size="12px">
                    {{ index + 1 }}
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold text-grey-9" style="font-size:14px">
                    {{ row.namaKelas }}
                  </q-item-label>
                  <q-item-label caption class="row items-center q-gutter-x-xs q-mt-xs">
                    <q-icon name="event" size="13px" color="indigo-7" />
                    <span>{{ row.hari || '-' }}</span>
                    <span class="text-grey-4">&nbsp;·&nbsp;</span>
                    <q-icon name="schedule" size="13px" color="indigo-7" />
                    <span>{{ row.jam || '-' }}</span>
                  </q-item-label>
                  <q-item-label v-if="row.pengajar" caption class="row items-center q-gutter-x-xs q-mt-xs">
                    <q-icon name="person" size="13px" color="green-7" />
                    <span>{{ row.pengajar }}</span>
                  </q-item-label>
                  <q-item-label v-if="row.tempat" caption class="row items-center q-gutter-x-xs q-mt-xs">
                    <q-icon name="place" size="13px" color="red-7" />
                    <span>{{ row.tempat }}</span>
                  </q-item-label>
                  <q-item-label v-if="row.kitab" caption class="row items-center q-gutter-x-xs q-mt-xs">
                    <q-icon name="menu_book" size="13px" color="deep-orange" />
                    <span>{{ row.kitab }}</span>
                  </q-item-label>
                  <q-item-label v-if="row.keterangan" caption class="q-mt-xs text-grey-7" style="white-space: pre-line">
                    {{ row.keterangan }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-expansion-item>
        </div>
      </template>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { usePendidikanStore } from 'src/stores/pendidikan';

const $q = useQuasar();
const store = usePendidikanStore();
const isMobile = computed(() => $q.screen.lt.md);

const KATEGORI_META = {
  TAHSIN_IKHWAN: {
    label: 'Tahsin Ikhwan', icon: 'auto_stories', accent: '#1565C0',
    gradient: 'linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)',
  },
  TAHSIN_AKHWAT: {
    label: 'Tahsin Akhwat', icon: 'auto_stories', accent: '#6A1B9A',
    gradient: 'linear-gradient(135deg, #8E24AA 0%, #4A148C 100%)',
  },
  BAHASA_ARAB_IKHWAN: {
    label: 'Bahasa Arab Ikhwan', icon: 'mdi-abjad-arabic', accent: '#2E7D32',
    gradient: 'linear-gradient(135deg, #388E3C 0%, #1B5E20 100%)',
  },
  BAHASA_ARAB_AKHWAT: {
    label: 'Bahasa Arab Akhwat', icon: 'mdi-abjad-arabic', accent: '#BF360C',
    gradient: 'linear-gradient(135deg, #D84315 0%, #870000 100%)',
  },
  TPQ: {
    label: 'Taman Pendidikan Qur\'an', icon: 'menu_book', accent: '#E65100',
    gradient: 'linear-gradient(135deg, #F57C00 0%, #BF360C 100%)',
  },
};

const KATEGORI_ORDER = ['TAHSIN_IKHWAN', 'TAHSIN_AKHWAT', 'BAHASA_ARAB_IKHWAN', 'BAHASA_ARAB_AKHWAT', 'TPQ'];

const columns = [
  { name: 'no', label: 'No', field: 'no', align: 'center', style: 'width: 56px' },
  { name: 'namaKelas', label: 'Kelas', field: 'namaKelas', align: 'left' },
  { name: 'hari', label: 'Hari', field: 'hari', align: 'left', format: v => v || '-' },
  { name: 'jam', label: 'Waktu', field: 'jam', align: 'left', format: v => v || '-' },
  { name: 'pengajar', label: 'Pengajar', field: 'pengajar', align: 'left', format: v => v || '-' },
  { name: 'tempat', label: 'Tempat', field: 'tempat', align: 'left', format: v => v || '-' },
  { name: 'kitab', label: 'Kitab / Materi', field: 'kitab', align: 'left', format: v => v || '-' },
  { name: 'keterangan', label: 'Keterangan', field: 'keterangan', align: 'left' },
];

const groups = computed(() => {
  const map = new Map();
  for (const row of store.jadwalAll) {
    if (!map.has(row.kategori)) map.set(row.kategori, []);
    map.get(row.kategori).push(row);
  }
  return KATEGORI_ORDER
    .filter(k => map.has(k))
    .map(k => ({
      key: k,
      label: KATEGORI_META[k]?.label ?? k,
      icon: KATEGORI_META[k]?.icon ?? 'school',
      gradient: KATEGORI_META[k]?.gradient ?? 'linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)',
      accent: KATEGORI_META[k]?.accent ?? '#1565C0',
      rows: map.get(k),
    }));
});

onMounted(() => store.fetchJadwalPublic());
</script>

<style scoped>
.page-hero {
  background: linear-gradient(135deg, #283593 0%, #1A237E 100%);
  padding: 80px 0;
}
.kelas-card {
  border-radius: 12px;
  overflow: hidden;
}
.group-header {
  font-size: 16px;
  color: #ffffff;
  letter-spacing: 0.3px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
}
.kelas-badge {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 8px;
}
.kelas-table :deep(thead th) {
  background: #E8EAF6;
  color: #1A237E;
  font-weight: 600;
}
.kelas-table :deep(tbody tr:hover) {
  background: #F5F6FF;
}
.kelas-expansion {
  border-radius: 12px !important;
  overflow: hidden;
}
.kelas-expansion :deep(.kelas-header) {
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;
  min-height: 48px;
}
.kelas-expansion :deep(.kelas-header .q-item__label) {
  color: #ffffff;
}
@media (max-width: 599px) {
  .page-hero { padding: 56px 0; }
}
</style>
