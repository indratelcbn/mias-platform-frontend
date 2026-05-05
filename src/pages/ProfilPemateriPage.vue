<template>
  <q-page class="q-pb-xl">
    <div class="page-hero q-py-xl text-center text-white">
      <q-icon name="auto_stories" size="48px" class="q-mb-sm" />
      <h1 class="text-h4 text-weight-bold q-mb-sm">Pemateri Kajian Islam Ilmiyyah</h1>
      <p class="text-body1 opacity-80">Para ustadz pengajar di Masjid Imam Asy Syafi'i</p>
    </div>

    <div class="q-px-md q-py-xl" style="max-width: 1600px; margin: 0 auto">
      <!-- Tabs Jenis Kajian -->
      <div class="row justify-center q-mb-xl">
        <q-tabs v-model="tab" dense indicator-color="primary" active-color="primary">
          <q-tab name="RUTIN"   icon="menu_book"     label="Kajian Rutin" />
          <q-tab name="TEMATIK" icon="auto_awesome"  label="Kajian Tematik" />
        </q-tabs>
      </div>

      <div v-if="store.loading" class="text-center q-py-xl">
        <q-spinner-dots color="primary" size="48px" />
      </div>

      <q-tab-panels v-else v-model="tab" animated class="bg-transparent">
        <!-- ── KAJIAN RUTIN: per Hari ─────────────────────────────── -->
        <q-tab-panel name="RUTIN" class="q-pa-none">
          <div v-if="!rutinGroups.length" class="text-center q-py-xl text-grey-6">
            <q-icon name="person_off" size="72px" color="grey-4" />
            <div class="q-mt-md">Belum ada data pemateri kajian rutin.</div>
          </div>
          <div v-else class="q-gutter-y-md">
            <q-card
              v-for="group in rutinGroups"
              :key="group.key"
              flat
              bordered
              class="day-card"
            >
              <q-expansion-item
                :label="group.label"
                :icon="group.icon"
                :default-opened="group.defaultOpen"
                header-class="day-header text-weight-bold"
                expand-icon-class="text-primary"
              >
                <q-separator />
                <q-table
                  :rows="group.rows"
                  :columns="rutinColumns"
                  row-key="id"
                  flat
                  hide-pagination
                  :rows-per-page-options="[0]"
                  :pagination="{ rowsPerPage: 0 }"
                  class="day-table"
                >
                  <template #body-cell-no="props">
                    <q-td class="text-center text-weight-medium text-grey-8">
                      {{ props.rowIndex + 1 }}
                    </q-td>
                  </template>
                  <template #body-cell-foto="props">
                    <q-td class="text-center">
                      <q-avatar
                        size="48px"
                        :class="props.value ? 'cursor-pointer' : ''"
                        @click="props.value && open(props.value, props.row.nama)"
                      >
                        <img v-if="props.value" :src="props.value" />
                        <q-icon v-else name="person" size="28px" color="grey-5" />
                      </q-avatar>
                    </q-td>
                  </template>
                  <template #body-cell-waktu="props">
                    <q-td class="text-center">{{ props.value || '-' }}</q-td>
                  </template>
                  <template #body-cell-jam="props">
                    <q-td class="text-center">{{ props.value || '-' }}</q-td>
                  </template>
                  <template #body-cell-kitab="props">
                    <q-td>
                      <div v-if="props.value" class="column q-gutter-xs">
                        <div v-for="k in kitabList(props.value)" :key="k" class="row items-center q-gutter-xs no-wrap">
                          <q-icon name="menu_book" size="14px" color="primary" />
                          <span class="text-caption">{{ k }}</span>
                        </div>
                      </div>
                      <span v-else class="text-grey-5">-</span>
                    </q-td>
                  </template>
                  <template #body-cell-keterangan="props">
                    <q-td style="white-space: pre-line; max-width: 180px">
                      {{ props.value || '-' }}
                    </q-td>
                  </template>
                  <template #body-cell-youtube="props">
                    <q-td class="text-center">
                      <a v-if="props.value" :href="props.value" target="_blank" rel="noopener noreferrer" class="youtube-link">
                        <q-icon name="fab fa-youtube" color="red" size="20px" />
                        <q-tooltip>Buka YouTube</q-tooltip>
                      </a>
                      <span v-else class="text-grey-5">-</span>
                    </q-td>
                  </template>
                </q-table>
              </q-expansion-item>
            </q-card>
          </div>
        </q-tab-panel>

        <!-- ── KAJIAN TEMATIK: tabel polos tanpa hari ─────────────── -->
        <q-tab-panel name="TEMATIK" class="q-pa-none">
          <div v-if="!tematikRows.length" class="text-center q-py-xl text-grey-6">
            <q-icon name="person_off" size="72px" color="grey-4" />
            <div class="q-mt-md">Belum ada data pemateri kajian tematik.</div>
          </div>
          <q-card v-else flat bordered class="day-card">
            <q-table
              :rows="tematikRows"
              :columns="tematikColumns"
              row-key="id"
              flat
              hide-pagination
              :rows-per-page-options="[0]"
              :pagination="{ rowsPerPage: 0 }"
              class="day-table"
            >
              <template #body-cell-no="props">
                <q-td class="text-center text-weight-medium text-grey-8">
                  {{ props.rowIndex + 1 }}
                </q-td>
              </template>
              <template #body-cell-foto="props">
                <q-td class="text-center">
                  <q-avatar
                    size="48px"
                    :class="props.value ? 'cursor-pointer' : ''"
                    @click="props.value && open(props.value, props.row.nama)"
                  >
                    <img v-if="props.value" :src="props.value" />
                    <q-icon v-else name="person" size="28px" color="grey-5" />
                  </q-avatar>
                </q-td>
              </template>
              <template #body-cell-kitab="props">
                <q-td>
                  <div v-if="props.value" class="column q-gutter-xs">
                    <div v-for="k in kitabList(props.value)" :key="k" class="row items-center q-gutter-xs no-wrap">
                      <q-icon name="menu_book" size="14px" color="deep-orange" />
                      <span class="text-caption">{{ k }}</span>
                    </div>
                  </div>
                  <span v-else class="text-grey-5">-</span>
                </q-td>
              </template>
              <template #body-cell-keterangan="props">
                <q-td style="white-space: pre-line; max-width: 220px">
                  {{ props.value || '-' }}
                </q-td>
              </template>
              <template #body-cell-youtube="props">
                <q-td class="text-center">
                  <a v-if="props.value" :href="props.value" target="_blank" rel="noopener noreferrer" class="youtube-link">
                    <q-icon name="fab fa-youtube" color="red" size="20px" />
                    <q-tooltip>Buka YouTube</q-tooltip>
                  </a>
                  <span v-else class="text-grey-5">-</span>
                </q-td>
              </template>
            </q-table>
          </q-card>
        </q-tab-panel>
      </q-tab-panels>
    </div>

    <AppLightbox />
  </q-page>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useProfilPemateriStore } from 'src/stores/profil';
import AppLightbox from 'components/AppLightbox.vue';
import { useLightbox } from 'src/composables/useLightbox';

const store = useProfilPemateriStore();
onMounted(() => store.fetchPublic());

const { open } = useLightbox();

const tab = ref('RUTIN');

const HARI_ORDER = ['Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Sabtu', 'Ahad'];

const waktuOrder = { 'Pekan 1': 1, 'Pekan 2': 2, 'Pekan 3': 3, 'Pekan 4': 4, 'Pekan 5': 5 };
const jamOrder = { "Ba'da Shubuh - Selesai": 1, "08.30 - 11.00 WIB": 2, '09.00 - 12.00 WIB': 3, "Ba'da Maghrib - Selesai": 4 };

function firstWaktuRank(waktu) {
  if (!waktu) return 99;
  return waktuOrder[waktu.split(',')[0].trim()] ?? 99;
}

function sortRows(rows) {
  return [...rows].sort((a, b) => {
    const wA = firstWaktuRank(a.waktu);
    const wB = firstWaktuRank(b.waktu);
    if (wA !== wB) return wA - wB;
    const jA = jamOrder[a.jam] ?? 99;
    const jB = jamOrder[b.jam] ?? 99;
    if (jA !== jB) return jA - jB;
    return (a.urutan ?? 0) - (b.urutan ?? 0);
  });
}

function splitHari(hari) {
  return hari ? hari.split(',').map(h => h.trim()).filter(Boolean) : [];
}

const rutinGroups = computed(() => {
  const buckets = new Map();
  HARI_ORDER.forEach(h => buckets.set(h, []));
  const tanpaHari = [];

  for (const p of store.list) {
    if (p.jenis !== 'RUTIN') continue;
    const hariList = splitHari(p.hari);
    if (hariList.length) {
      hariList.forEach(h => {
        if (buckets.has(h)) buckets.get(h).push(p);
        else tanpaHari.push(p);
      });
    } else {
      tanpaHari.push(p);
    }
  }

  const result = HARI_ORDER
    .filter(h => buckets.get(h).length)
    .map(h => ({
      key: h,
      label: h,
      icon: 'event',
      defaultOpen: false,
      rows: sortRows(buckets.get(h)),
    }));

  if (tanpaHari.length) {
    result.push({
      key: 'tanpa-hari',
      label: 'Tanpa Hari',
      icon: 'help_outline',
      defaultOpen: false,
      rows: sortRows(tanpaHari),
    });
  }

  if (result.length) result[0].defaultOpen = true;
  return result;
});

const tematikRows = computed(() =>
  [...store.list]
    .filter(p => p.jenis === 'TEMATIK')
    .sort((a, b) => (a.urutan ?? 0) - (b.urutan ?? 0) || a.nama.localeCompare(b.nama))
);

const rutinColumns = [
  { name: 'no',         label: 'No',               field: 'no',         align: 'center', style: 'width: 56px' },
  { name: 'nama',       label: 'Nama',             field: 'nama',       align: 'left',   sortable: true },
  { name: 'waktu',      label: 'Waktu',            field: 'waktu',      align: 'center', sortable: true },
  { name: 'jam',        label: 'Jam',              field: 'jam',        align: 'center', sortable: true },
  { name: 'kitab',      label: 'Kitab / Materi',   field: 'kitab',      align: 'left' },
  { name: 'keterangan', label: 'Keterangan',       field: 'keterangan', align: 'left' },
  { name: 'youtube',    label: 'Playlist YouTube', field: 'youtube',    align: 'center' },
];

const tematikColumns = [
  { name: 'no',         label: 'No',               field: 'no',         align: 'center', style: 'width: 56px' },
  { name: 'nama',       label: 'Nama',             field: 'nama',       align: 'left',   sortable: true },
  { name: 'kitab',      label: 'Kitab / Materi',   field: 'kitab',      align: 'left' },
  { name: 'keterangan', label: 'Keterangan',       field: 'keterangan', align: 'left' },
  { name: 'youtube',    label: 'Playlist YouTube', field: 'youtube',    align: 'center' },
];

function kitabList(kitab) {
  return kitab ? kitab.split('\n').map(k => k.trim()).filter(Boolean) : [];
}
</script>

<style scoped>
.page-hero {
  background: linear-gradient(135deg, #BF360C 0%, #E64A19 100%);
  padding: 80px 0;
}
.day-card {
  border-radius: 12px;
  overflow: hidden;
}
.day-header {
  font-size: 16px;
  color: #ffffff;
  background: linear-gradient(135deg, #1976D2 0%, #1565C0 100%);
  letter-spacing: 0.3px;
  padding: 8px 16px;
}
.day-header :deep(.q-icon) {
  color: #ffffff !important;
}
.day-table :deep(thead th) {
  background: #E3F2FD;
  color: #0D47A1;
  font-weight: 600;
}
.day-table :deep(tbody tr:hover) {
  background: #F5FAFF;
}
.youtube-link {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
}
</style>
