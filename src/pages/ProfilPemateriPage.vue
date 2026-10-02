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

      <!-- Loading skeleton mobile-aware -->
      <div v-if="store.loading" class="q-pa-md">
        <template v-if="isMobile">
          <q-skeleton type="rect" height="56px" class="rounded-borders q-mb-sm" v-for="i in 4" :key="i" />
        </template>
        <div v-else class="text-center q-py-xl">
          <q-spinner-dots color="primary" size="48px" />
        </div>
      </div>

      <q-tab-panels v-else v-model="tab" animated class="bg-transparent">
        <!-- ── KAJIAN RUTIN ─────────────────────────────────────────── -->
        <q-tab-panel name="RUTIN" class="q-pa-none">

          <!-- Empty -->
          <div v-if="!rutinGroups.length" class="text-center q-py-xl text-grey-6">
            <q-icon name="person_off" size="72px" color="grey-4" />
            <div class="q-mt-md">Belum ada data pemateri kajian rutin.</div>
          </div>

          <!-- ═══ DESKTOP table ════════════════════════════════════ -->
          <div v-else-if="!isMobile" class="q-gutter-y-md">
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
                <template #body-cell-pekan="props">
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
                <template #body-cell-kitabArabFile="props">
                  <q-td class="text-center">
                    <a v-if="props.value" :href="props.value" target="_blank" rel="noopener noreferrer" download>
                      <q-btn flat dense round color="red-7" icon="picture_as_pdf" size="sm">
                        <q-tooltip>Unduh Kitab Arab</q-tooltip>
                      </q-btn>
                    </a>
                    <span v-else class="text-grey-5">-</span>
                  </q-td>
                </template>
                <template #body-cell-kitabTerjemahFile="props">
                  <q-td class="text-center">
                    <a v-if="props.value" :href="props.value" target="_blank" rel="noopener noreferrer" download>
                      <q-btn flat dense round color="deep-orange" icon="picture_as_pdf" size="sm">
                        <q-tooltip>Unduh Kitab Terjemah</q-tooltip>
                      </q-btn>
                    </a>
                    <span v-else class="text-grey-5">-</span>
                  </q-td>
                </template>
              </q-table>
            </q-card>
          </div>

          <!-- ═══ MOBILE — QExpansionItem per hari ════════════════ -->
          <div v-else class="q-gutter-y-sm">
            <q-expansion-item
              v-for="(group, gi) in rutinGroups"
              :key="group.key"
              :label="group.label"
              :default-opened="gi === 0"
              expand-icon-class="text-white"
              header-class="rutin-hari-header"
              class="rutin-expansion rounded-borders overflow-hidden"
              bordered
            >
              <q-list separator>
                <q-item
                  v-for="(row, index) in group.rows"
                  :key="row.rowKey"
                  class="q-py-sm items-start"
                >
                  <!-- Nomor -->
                  <q-item-section avatar style="min-width:36px">
                    <q-avatar size="30px" color="primary" text-color="white" font-size="12px">
                      {{ index + 1 }}
                    </q-avatar>
                  </q-item-section>

                  <!-- Konten -->
                  <q-item-section>
                    <!-- Nama ustadz -->
                    <q-item-label class="text-weight-bold text-grey-9" style="font-size:14px">
                      {{ row.nama }}
                    </q-item-label>

                    <!-- Pekan & jam -->
                    <q-item-label caption class="row items-center q-gutter-x-xs q-mt-xs no-wrap">
                      <q-icon name="date_range" size="13px" color="blue-7" />
                      <span>{{ row.pekanDisplay || '-' }}</span>
                      <span class="text-grey-4">&nbsp;·&nbsp;</span>
                      <q-icon name="schedule" size="13px" color="blue-7" />
                      <span>{{ row.jam || '-' }}</span>
                    </q-item-label>

                    <!-- Kitab -->
                    <div v-if="row.kitab" class="q-mt-xs">
                      <div
                        v-for="k in kitabList(row.kitab)"
                        :key="k"
                        class="row items-start no-wrap q-gutter-x-xs"
                      >
                        <q-icon name="menu_book" size="13px" color="deep-orange" class="q-mt-xs" style="flex-shrink:0" />
                        <q-item-label caption style="word-break:break-word;line-height:1.5">
                          {{ k }}
                        </q-item-label>
                      </div>
                    </div>

                    <!-- Keterangan -->
                    <q-item-label
                      v-if="row.keterangan"
                      caption
                      class="q-mt-xs text-grey-6"
                      style="white-space:pre-line"
                    >
                      {{ row.keterangan }}
                    </q-item-label>

                    <!-- Tombol aksi -->
                    <div
                      v-if="row.youtube || row.kitabArabFile || row.kitabTerjemahFile"
                      class="row items-center q-gutter-xs q-mt-sm"
                    >
                      <a
                        v-if="row.youtube"
                        :href="row.youtube"
                        target="_blank"
                        rel="noopener noreferrer"
                        style="text-decoration:none"
                        @click.stop
                      >
                        <q-btn
                          outline dense no-caps size="xs"
                          color="red-7"
                          icon="fab fa-youtube"
                          label="YouTube"
                        />
                      </a>
                      <a
                        v-if="row.kitabArabFile"
                        :href="row.kitabArabFile"
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        style="text-decoration:none"
                        @click.stop
                      >
                        <q-btn
                          outline dense no-caps size="xs"
                          color="red-7"
                          icon="picture_as_pdf"
                          label="Kitab Arab"
                        />
                      </a>
                      <a
                        v-if="row.kitabTerjemahFile"
                        :href="row.kitabTerjemahFile"
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        style="text-decoration:none"
                        @click.stop
                      >
                        <q-btn
                          outline dense no-caps size="xs"
                          color="deep-orange"
                          icon="picture_as_pdf"
                          label="Terjemah"
                        />
                      </a>
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-expansion-item>
          </div>

        </q-tab-panel>

        <!-- ── KAJIAN TEMATIK ──────────────────────────────────────── -->
        <q-tab-panel name="TEMATIK" class="q-pa-none">

          <!-- Empty -->
          <div v-if="!tematikRows.length" class="text-center q-py-xl text-grey-6">
            <q-icon name="person_off" size="72px" color="grey-4" />
            <div class="q-mt-md">Belum ada data pemateri kajian tematik.</div>
          </div>

          <!-- ═══ DESKTOP table ════════════════════════════════════ -->
          <q-card v-else-if="!isMobile" flat bordered class="day-card">
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
              <template #body-cell-kitabArabFile="props">
                <q-td class="text-center">
                  <a v-if="props.value" :href="props.value" target="_blank" rel="noopener noreferrer" download>
                    <q-btn flat dense round color="red-7" icon="picture_as_pdf" size="sm">
                      <q-tooltip>Unduh Kitab Arab</q-tooltip>
                    </q-btn>
                  </a>
                  <span v-else class="text-grey-5">-</span>
                </q-td>
              </template>
              <template #body-cell-kitabTerjemahFile="props">
                <q-td class="text-center">
                  <a v-if="props.value" :href="props.value" target="_blank" rel="noopener noreferrer" download>
                    <q-btn flat dense round color="deep-orange" icon="picture_as_pdf" size="sm">
                      <q-tooltip>Unduh Kitab Terjemah</q-tooltip>
                    </q-btn>
                  </a>
                  <span v-else class="text-grey-5">-</span>
                </q-td>
              </template>
            </q-table>
          </q-card>

          <!-- ═══ MOBILE — QList flat ══════════════════════════════ -->
          <q-card v-else flat bordered class="rounded-borders overflow-hidden">
            <q-list separator>
              <q-item
                v-for="(row, index) in tematikRows"
                :key="row.id"
                class="q-py-sm items-start"
              >
                <!-- Nomor -->
                <q-item-section avatar style="min-width:36px">
                  <q-avatar size="30px" color="deep-orange" text-color="white" font-size="12px">
                    {{ index + 1 }}
                  </q-avatar>
                </q-item-section>

                <!-- Konten -->
                <q-item-section>
                  <q-item-label class="text-weight-bold text-grey-9" style="font-size:14px">
                    {{ row.nama }}
                  </q-item-label>

                  <!-- Kitab -->
                  <div v-if="row.kitab" class="q-mt-xs">
                    <div
                      v-for="k in kitabList(row.kitab)"
                      :key="k"
                      class="row items-start no-wrap q-gutter-x-xs"
                    >
                      <q-icon name="menu_book" size="13px" color="deep-orange" class="q-mt-xs" style="flex-shrink:0" />
                      <q-item-label caption style="word-break:break-word;line-height:1.5">
                        {{ k }}
                      </q-item-label>
                    </div>
                  </div>

                  <!-- Keterangan -->
                  <q-item-label
                    v-if="row.keterangan"
                    caption
                    class="q-mt-xs text-grey-6"
                    style="white-space:pre-line"
                  >
                    {{ row.keterangan }}
                  </q-item-label>

                  <!-- Tombol aksi -->
                  <div
                    v-if="row.youtube || row.kitabArabFile || row.kitabTerjemahFile"
                    class="row items-center q-gutter-xs q-mt-sm"
                  >
                    <a
                      v-if="row.youtube"
                      :href="row.youtube"
                      target="_blank"
                      rel="noopener noreferrer"
                      style="text-decoration:none"
                      @click.stop
                    >
                      <q-btn outline dense no-caps size="xs" color="red-7" icon="fab fa-youtube" label="YouTube" />
                    </a>
                    <a
                      v-if="row.kitabArabFile"
                      :href="row.kitabArabFile"
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      style="text-decoration:none"
                      @click.stop
                    >
                      <q-btn outline dense no-caps size="xs" color="red-7" icon="picture_as_pdf" label="Kitab Arab" />
                    </a>
                    <a
                      v-if="row.kitabTerjemahFile"
                      :href="row.kitabTerjemahFile"
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      style="text-decoration:none"
                      @click.stop
                    >
                      <q-btn outline dense no-caps size="xs" color="deep-orange" icon="picture_as_pdf" label="Terjemah" />
                    </a>
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
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

const rutinRows = computed(() =>
  [...store.list]
    .filter((pemateri) => pemateri.jenis === 'RUTIN')
    .flatMap((pemateri) => {
      // Expand by hari — one row per teaching day
      const hariList = splitCommaValues(pemateri.hari);
      const hariArray = hariList.length ? hariList : ['-'];
      const pekanDisplay = splitPekanValues(pemateri.waktu).join(', ') || '-';
      const firstPekan = splitPekanValues(pemateri.waktu)[0] || '-';

      return hariArray.map((hari, index) => ({
        ...pemateri,
        rowKey: `${pemateri.id}-${index}-${hari}`,
        hariSingle: hari,
        pekanDisplay,
        firstPekanRank: pekanRank(firstPekan),
      }));
    })
    .sort((a, b) => {
      // Primary sort: hari order
      const hA = HARI_ORDER.indexOf(a.hariSingle);
      const hB = HARI_ORDER.indexOf(b.hariSingle);
      if (hA !== hB) return (hA === -1 ? 99 : hA) - (hB === -1 ? 99 : hB);

      // Secondary: earliest pekan they teach
      if (a.firstPekanRank !== b.firstPekanRank) return a.firstPekanRank - b.firstPekanRank;

      // Tertiary: jam
      const jA = jamOrder[a.jam] ?? 99;
      const jB = jamOrder[b.jam] ?? 99;
      if (jA !== jB) return jA - jB;

      return (a.urutan ?? 0) - (b.urutan ?? 0) || a.nama.localeCompare(b.nama);
    })
);

const rutinGroups = computed(() => {
  const grouped = new Map();

  for (const row of rutinRows.value) {
    const key = row.hariSingle || '-';
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(row);
  }

  // Sort groups by HARI_ORDER
  return [...grouped.entries()]
    .sort((a, b) => {
      const iA = HARI_ORDER.indexOf(a[0]);
      const iB = HARI_ORDER.indexOf(b[0]);
      return (iA === -1 ? 99 : iA) - (iB === -1 ? 99 : iB);
    })
    .map(([hari, rows]) => ({
      key: hari,
      label: hari,
      rows,
    }));
});

const tematikRows = computed(() =>
  [...store.list]
    .filter(p => p.jenis === 'TEMATIK')
    .sort((a, b) => (a.urutan ?? 0) - (b.urutan ?? 0) || a.nama.localeCompare(b.nama))
);

const rutinColumns = [
  { name: 'no',                label: 'No',               field: 'no',              align: 'center', style: 'width: 56px' },
  { name: 'pekan',             label: 'Pekan',            field: 'pekanDisplay',    align: 'center' },
  { name: 'waktu',             label: 'Waktu',            field: 'jam',             align: 'center' },
  { name: 'nama',              label: 'Nama Ustadz',      field: 'nama',            align: 'left',   sortable: true },
  { name: 'kitab',             label: 'Kitab / Materi',   field: 'kitab',           align: 'left' },
  { name: 'kitabArabFile',     label: 'Kitab Arab',       field: 'kitabArabFile',   align: 'center' },
  { name: 'kitabTerjemahFile', label: 'Kitab Terjemah',  field: 'kitabTerjemahFile', align: 'center' },
  { name: 'keterangan',        label: 'Keterangan',       field: 'keterangan',      align: 'left' },
  { name: 'youtube',           label: 'Playlist YouTube', field: 'youtube',         align: 'center' },
];

const tematikColumns = [
  { name: 'no',         label: 'No',               field: 'no',         align: 'center', style: 'width: 56px' },
  { name: 'nama',       label: 'Nama',             field: 'nama',       align: 'left',   sortable: true },
  { name: 'kitab',      label: 'Kitab / Materi',   field: 'kitab',      align: 'left' },
  { name: 'kitabArabFile',      label: 'Kitab Arab',      field: 'kitabArabFile',      align: 'center' },
  { name: 'kitabTerjemahFile',  label: 'Kitab Terjemah',  field: 'kitabTerjemahFile',  align: 'center' },
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

/* ── Desktop table ── */
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

/* ── Mobile QExpansionItem ── */
.rutin-expansion {
  border-radius: 12px !important;
  overflow: hidden;
}
.rutin-expansion :deep(.rutin-hari-header) {
  background: linear-gradient(135deg, #1976D2 0%, #1565C0 100%);
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;
  min-height: 48px;
}
.rutin-expansion :deep(.rutin-hari-header .q-item__label) {
  color: #ffffff;
}

@media (max-width: 599px) {
  .page-hero { padding: 56px 0; }
}
</style>
