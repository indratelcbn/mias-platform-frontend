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
        <!-- ── KAJIAN RUTIN: tabel statis ─────────────────────────── -->
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
              <div class="group-header text-weight-bold">
                {{ group.label }}
              </div>
              <q-table
                v-if="!isMobile"
                :rows="group.rows"
                :columns="rutinColumns"
                row-key="rowKey"
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
                <template #body-cell-waktu="props">
                  <q-td class="text-center">{{ props.value || '-' }}</q-td>
                </template>
                <template #body-cell-hari="props">
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
                <template #body-cell-kitabFile="props">
                  <q-td class="text-center">
                    <a v-if="props.value" :href="props.value" target="_blank" rel="noopener noreferrer" download>
                      <q-btn flat dense round color="red-7" icon="picture_as_pdf" size="sm">
                        <q-tooltip>Unduh PDF Kitab</q-tooltip>
                      </q-btn>
                    </a>
                    <span v-else class="text-grey-5">-</span>
                  </q-td>
                </template>
              </q-table>
              <div v-else class="mobile-list q-pa-sm">
                <q-card
                  v-for="(row, index) in group.rows"
                  :key="row.rowKey"
                  flat
                  bordered
                  class="mobile-item"
                >
                  <div class="mobile-item__header row items-start no-wrap q-col-gutter-sm">
                    <div class="mobile-item__number">{{ index + 1 }}</div>
                    <div class="col min-width-0">
                      <div class="text-subtitle2 text-weight-bold">{{ row.nama }}</div>
                      <div class="mobile-meta q-mt-xs">
                        <div><strong>Hari:</strong> {{ row.hariDisplay || '-' }}</div>
                        <div><strong>Waktu:</strong> {{ row.jam || '-' }}</div>
                      </div>
                    </div>
                  </div>
                  <div class="mobile-item__body q-mt-sm">
                    <div v-if="row.kitab" class="q-mb-sm">
                      <div class="mobile-section-title">Kitab / Materi</div>
                      <div v-for="k in kitabList(row.kitab)" :key="k" class="row items-start q-gutter-xs no-wrap text-caption q-mb-xs">
                        <q-icon name="menu_book" size="14px" color="primary" class="q-mt-xs" />
                        <span>{{ k }}</span>
                      </div>
                    </div>
                    <div v-if="row.keterangan" class="q-mb-sm">
                      <div class="mobile-section-title">Keterangan</div>
                      <div class="text-caption text-grey-8 mobile-preline">{{ row.keterangan }}</div>
                    </div>
                    <div v-if="row.youtube || row.kitabFile" class="row q-gutter-sm q-mt-sm">
                      <a v-if="row.youtube" :href="row.youtube" target="_blank" rel="noopener noreferrer" class="mobile-action-link">
                        <q-btn outline no-caps color="red-7" icon="fab fa-youtube" label="YouTube" size="sm" />
                      </a>
                      <a v-if="row.kitabFile" :href="row.kitabFile" target="_blank" rel="noopener noreferrer" download class="mobile-action-link">
                        <q-btn outline no-caps color="primary" icon="picture_as_pdf" label="Download Kitab" size="sm" />
                      </a>
                    </div>
                  </div>
                </q-card>
              </div>
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
              v-if="!isMobile"
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
              <template #body-cell-kitabFile="props">
                <q-td class="text-center">
                  <a v-if="props.value" :href="props.value" target="_blank" rel="noopener noreferrer" download>
                    <q-btn flat dense round color="red-7" icon="picture_as_pdf" size="sm">
                      <q-tooltip>Unduh PDF Kitab</q-tooltip>
                    </q-btn>
                  </a>
                  <span v-else class="text-grey-5">-</span>
                </q-td>
              </template>
            </q-table>
            <div v-else class="mobile-list q-pa-sm">
              <q-card
                v-for="(row, index) in tematikRows"
                :key="row.id"
                flat
                bordered
                class="mobile-item"
              >
                <div class="mobile-item__header row items-start no-wrap q-col-gutter-sm">
                  <div class="mobile-item__number">{{ index + 1 }}</div>
                  <div class="col min-width-0">
                    <div class="text-subtitle2 text-weight-bold">{{ row.nama }}</div>
                  </div>
                </div>
                <div class="mobile-item__body q-mt-sm">
                  <div v-if="row.kitab" class="q-mb-sm">
                    <div class="mobile-section-title">Kitab / Materi</div>
                    <div v-for="k in kitabList(row.kitab)" :key="k" class="row items-start q-gutter-xs no-wrap text-caption q-mb-xs">
                      <q-icon name="menu_book" size="14px" color="deep-orange" class="q-mt-xs" />
                      <span>{{ k }}</span>
                    </div>
                  </div>
                  <div v-if="row.keterangan" class="q-mb-sm">
                    <div class="mobile-section-title">Keterangan</div>
                    <div class="text-caption text-grey-8 mobile-preline">{{ row.keterangan }}</div>
                  </div>
                  <div v-if="row.youtube || row.kitabFile" class="row q-gutter-sm q-mt-sm">
                    <a v-if="row.youtube" :href="row.youtube" target="_blank" rel="noopener noreferrer" class="mobile-action-link">
                      <q-btn outline no-caps color="red-7" icon="fab fa-youtube" label="YouTube" size="sm" />
                    </a>
                    <a v-if="row.kitabFile" :href="row.kitabFile" target="_blank" rel="noopener noreferrer" download class="mobile-action-link">
                      <q-btn outline no-caps color="primary" icon="picture_as_pdf" label="Download Kitab" size="sm" />
                    </a>
                  </div>
                </div>
              </q-card>
            </div>
          </q-card>
        </q-tab-panel>
      </q-tab-panels>
    </div>

  </q-page>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useProfilPemateriStore } from 'src/stores/profil';

const $q = useQuasar();
const store = useProfilPemateriStore();
onMounted(() => store.fetchPublic());

const tab = ref('RUTIN');
const isMobile = computed(() => $q.screen.lt.md);

const HARI_ORDER = ['Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Sabtu', 'Ahad'];

const pekanOrder = { 'Pekan 1': 1, 'Pekan 2': 2, 'Pekan 3': 3, 'Pekan 4': 4, 'Pekan 5': 5 };
const jamOrder = {
  "Ba'da Shubuh - Selesai": 1,
  '08.30 - 11.00 WIB': 2,
  '09.00 - 11.00 WIB': 3,
  '09.00 - 12.00 WIB': 4,
  "Ba'da Maghrib - Selesai": 5,
};

function splitCommaValues(value) {
  return value ? String(value).split(',').map((item) => item.trim()).filter(Boolean) : [];
}

function normalizePekan(value) {
  if (!value) return null;
  const cleaned = String(value).trim();
  if (!cleaned) return null;

  const pekanMatch = cleaned.match(/^Pekan\s*(\d+)$/i);
  if (pekanMatch) return `Pekan ${pekanMatch[1]}`;

  const numericMatch = cleaned.match(/^(\d+)$/);
  if (numericMatch) return `Pekan ${numericMatch[1]}`;

  return cleaned;
}

function splitPekanValues(value) {
  const pekanList = splitCommaValues(value)
    .map(normalizePekan)
    .filter(Boolean);

  return pekanList.length ? pekanList : [normalizePekan(value) || '-'];
}

function pekanRank(pekan) {
  return pekanOrder[pekan] ?? 99;
}

function hariRank(hari) {
  const firstHari = splitCommaValues(hari)[0];
  if (!firstHari) return 99;
  const index = HARI_ORDER.indexOf(firstHari);
  return index === -1 ? 99 : index;
}

const rutinRows = computed(() =>
  [...store.list]
    .filter((pemateri) => pemateri.jenis === 'RUTIN')
    .flatMap((pemateri) => {
      const rows = splitPekanValues(pemateri.waktu);

      return rows.map((pekan, index) => ({
        ...pemateri,
        rowKey: `${pemateri.id}-${index}-${pekan}`,
        pekan,
        hariDisplay: splitCommaValues(pemateri.hari).join(', ') || '-',
      }));
    })
    .sort((a, b) => {
      const pA = pekanRank(a.pekan);
      const pB = pekanRank(b.pekan);
      if (pA !== pB) return pA - pB;

      const hA = hariRank(a.hari);
      const hB = hariRank(b.hari);
      if (hA !== hB) return hA - hB;

      const jA = jamOrder[a.jam] ?? 99;
      const jB = jamOrder[b.jam] ?? 99;
      if (jA !== jB) return jA - jB;

      return (a.urutan ?? 0) - (b.urutan ?? 0) || a.nama.localeCompare(b.nama);
    })
);

const rutinGroups = computed(() => {
  const grouped = new Map();

  for (const row of rutinRows.value) {
    const key = row.pekan || '-';
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(row);
  }

  return [...grouped.entries()]
    .sort((a, b) => pekanRank(a[0]) - pekanRank(b[0]))
    .map(([pekan, rows]) => ({
      key: pekan,
      label: pekan,
      rows,
    }));
});

const tematikRows = computed(() =>
  [...store.list]
    .filter(p => p.jenis === 'TEMATIK')
    .sort((a, b) => (a.urutan ?? 0) - (b.urutan ?? 0) || a.nama.localeCompare(b.nama))
);

const rutinColumns = [
  { name: 'no',         label: 'No',               field: 'no',         align: 'center', style: 'width: 56px' },
  { name: 'hari',       label: 'Hari',             field: 'hariDisplay', align: 'center' },
  { name: 'waktu',      label: 'Waktu',            field: 'jam',        align: 'center', sortable: true },
  { name: 'nama',       label: 'Nama Ustadz',      field: 'nama',       align: 'left',   sortable: true },
  { name: 'kitab',      label: 'Kitab / Materi',   field: 'kitab',      align: 'left' },
  { name: 'kitabFile',  label: 'PDF',              field: 'kitabFile',  align: 'center' },
  { name: 'keterangan', label: 'Keterangan',       field: 'keterangan', align: 'left' },
  { name: 'youtube',    label: 'Playlist YouTube', field: 'youtube',    align: 'center' },
];

const tematikColumns = [
  { name: 'no',         label: 'No',               field: 'no',         align: 'center', style: 'width: 56px' },
  { name: 'nama',       label: 'Nama',             field: 'nama',       align: 'left',   sortable: true },
  { name: 'kitab',      label: 'Kitab / Materi',   field: 'kitab',      align: 'left' },
  { name: 'kitabFile',  label: 'PDF',              field: 'kitabFile',  align: 'center' },
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
.group-header {
  font-size: 16px;
  color: #ffffff;
  background: linear-gradient(135deg, #1976D2 0%, #1565C0 100%);
  letter-spacing: 0.3px;
  padding: 12px 16px;
}
.mobile-list {
  display: grid;
  gap: 12px;
}
.mobile-item {
  border-radius: 12px;
  padding: 14px;
}
.mobile-item__number {
  min-width: 28px;
  height: 28px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #E3F2FD;
  color: #0D47A1;
  font-weight: 700;
  font-size: 13px;
}
.mobile-meta {
  display: grid;
  gap: 4px;
  font-size: 12px;
  color: #546E7A;
}
.mobile-item__body {
  padding-left: 0;
}
.mobile-section-title {
  font-size: 12px;
  font-weight: 700;
  color: #0D47A1;
  margin-bottom: 6px;
}
.mobile-preline {
  white-space: pre-line;
}
.mobile-action-link {
  text-decoration: none;
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
@media (max-width: 599px) {
  .page-hero {
    padding: 56px 0;
  }
  .group-header {
    padding: 10px 14px;
    font-size: 15px;
  }
  .mobile-item {
    padding: 12px;
  }
}
</style>
