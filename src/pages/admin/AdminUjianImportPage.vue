<template>
  <q-page class="q-pa-lg">
    <!-- Header -->
    <div class="row items-center q-mb-lg q-gutter-sm">
      <q-btn flat round dense icon="arrow_back" color="primary" :to="{ name: 'admin-ujian-detail', params: { id: route.params.id } }" />
      <div class="text-h6 text-weight-bold">
        <q-icon name="upload_file" color="primary" class="q-mr-xs" />Import Soal Massal
      </div>
    </div>

    <q-stepper v-model="step" animated flat header-nav class="shadow-1" style="max-width:800px">

      <!-- ── Step 1: Pilih Format ──────────────────────────────────────── -->
      <q-step :name="1" title="Pilih Format" icon="description" :done="step > 1">
        <div class="q-gutter-md q-mt-sm">
          <div class="text-body2 text-grey-7 q-mb-sm">Pilih format file yang akan Anda gunakan untuk import soal.</div>
          <div class="row q-gutter-md">
            <q-card
              v-for="fmt in formats"
              :key="fmt.value"
              flat
              bordered
              clickable
              class="col-auto q-pa-md cursor-pointer"
              :class="{ 'bg-primary text-white': selectedFormat === fmt.value }"
              style="min-width:160px"
              @click="selectedFormat = fmt.value"
            >
              <div class="text-center">
                <q-icon :name="fmt.icon" size="36px" class="q-mb-sm" />
                <div class="text-weight-bold text-body1">{{ fmt.label }}</div>
                <div class="text-caption">{{ fmt.desc }}</div>
              </div>
            </q-card>
          </div>

          <!-- Download template -->
          <div class="q-mt-md">
            <div class="text-caption text-grey-6 q-mb-xs">Unduh template:</div>
            <q-btn flat dense no-caps color="primary" icon="download" label="Template JSON" @click="downloadTemplate('json')" class="q-mr-sm" />
            <q-btn flat dense no-caps color="primary" icon="download" label="Template CSV" @click="downloadTemplate('csv')" />
          </div>
        </div>

        <q-stepper-navigation>
          <q-btn unelevated color="primary" label="Lanjut" icon-right="arrow_forward" @click="step = 2" :disable="!selectedFormat" />
        </q-stepper-navigation>
      </q-step>

      <!-- ── Step 2: Upload / Paste ─────────────────────────────────────── -->
      <q-step :name="2" title="Upload / Paste" icon="upload" :done="step > 2">
        <div class="q-gutter-md q-mt-sm">
          <div v-if="selectedFormat === 'json'">
            <div class="text-caption text-grey-7 q-mb-xs">Tempel JSON langsung (misalnya hasil ChatGPT):</div>
            <q-input
              v-model="pasteText"
              type="textarea"
              outlined
              dense
              :rows="12"
              placeholder='[{"teks":"...","pilihanA":"...","pilihanB":"...","pilihanC":"...","pilihanD":"...","kunci":"A","bobot":1}]'
              font-size="13px"
            />
            <div class="text-caption text-grey-5 q-mt-xs">— atau —</div>
          </div>
          <div>
            <div class="text-caption text-grey-7 q-mb-xs">Upload file {{ selectedFormat?.toUpperCase() }}:</div>
            <q-file v-model="uploadFile" outlined dense :accept="`.${selectedFormat}`" :label="`Pilih file .${selectedFormat}`">
              <template #prepend><q-icon name="attach_file" /></template>
            </q-file>
          </div>
        </div>

        <q-stepper-navigation>
          <q-btn flat label="Kembali" @click="step = 1" class="q-mr-sm" />
          <q-btn unelevated color="primary" label="Validasi" icon-right="check_circle" @click="doValidasi" :loading="validating" :disable="!hasInput" />
        </q-stepper-navigation>
      </q-step>

      <!-- ── Step 3: Preview & Validasi ────────────────────────────────── -->
      <q-step :name="3" title="Preview & Validasi" icon="preview" :done="step > 3">
        <div v-if="previewResult" class="q-mt-sm">
          <!-- Ringkasan -->
          <div class="row q-gutter-md q-mb-md">
            <q-chip icon="check_circle" color="positive" text-color="white" :label="`${previewResult.totalValid} soal valid`" />
            <q-chip v-if="previewResult.totalInvalid" icon="error" color="negative" text-color="white" :label="`${previewResult.totalInvalid} soal error`" />
          </div>

          <!-- Error list -->
          <q-banner v-if="previewResult.totalInvalid" dense rounded class="bg-red-1 text-negative q-mb-md">
            <template #avatar><q-icon name="warning" /></template>
            <div v-for="inv in previewResult.invalid" :key="inv.baris" class="text-caption">
              <b>Baris {{ inv.baris }}:</b> {{ inv.errors.join('; ') }}
            </div>
          </q-banner>

          <!-- Preview tabel soal valid -->
          <div class="text-subtitle2 q-mb-xs">Preview soal valid:</div>
          <q-table
            :rows="previewResult.valid"
            :columns="previewColumns"
            row-key="urutan"
            flat
            bordered
            dense
            :rows-per-page-options="[10, 25, 0]"
          >
            <template #body-cell-no="{ rowIndex }">
              <q-td class="text-center">{{ rowIndex + 1 }}</q-td>
            </template>
            <template #body-cell-teks="{ row }">
              <q-td style="max-width:280px; white-space:normal; font-size:12px">{{ row.teks }}</q-td>
            </template>
            <template #body-cell-kunci="{ row }">
              <q-td class="text-center"><q-badge color="positive" :label="row.kunciJawaban" /></q-td>
            </template>
          </q-table>
        </div>

        <q-stepper-navigation>
          <q-btn flat label="Kembali" @click="step = 2" class="q-mr-sm" />
          <q-btn
            unelevated
            color="primary"
            icon-right="arrow_forward"
            :label="previewResult?.totalValid ? `Lanjut (${previewResult.totalValid} soal)` : 'Lanjut'"
            @click="step = 4"
            :disable="!previewResult?.totalValid"
          />
        </q-stepper-navigation>
      </q-step>

      <!-- ── Step 4: Konfirmasi ─────────────────────────────────────────── -->
      <q-step :name="4" title="Konfirmasi" icon="check" :done="step > 4">
        <div class="q-mt-sm">
          <q-banner rounded class="bg-blue-1 text-primary q-mb-md">
            <template #avatar><q-icon name="info" /></template>
            Anda akan mengimport <b>{{ previewResult?.totalValid }}</b> soal ke ujian ini.
            <span v-if="previewResult?.totalInvalid"> {{ previewResult.totalInvalid }} soal tidak valid akan dilewati.</span>
          </q-banner>
          <div class="text-body2 q-mb-md">Klik <b>"Import Soal"</b> untuk menyimpan ke database. Tindakan ini tidak dapat dibatalkan.</div>
        </div>

        <q-stepper-navigation>
          <q-btn flat label="Kembali" @click="step = 3" class="q-mr-sm" />
          <q-btn
            unelevated
            color="positive"
            icon="check_circle"
            :label="`Import ${previewResult?.totalValid ?? 0} Soal`"
            @click="doImport"
            :loading="importing"
          />
        </q-stepper-navigation>
      </q-step>

    </q-stepper>

    <!-- Hasil Import -->
    <q-card v-if="importResult" flat bordered class="q-mt-md bg-green-1" style="max-width:800px">
      <q-card-section>
        <div class="text-positive text-h6 q-mb-xs"><q-icon name="check_circle" class="q-mr-xs" />Import Selesai!</div>
        <div><b>{{ importResult.inserted }}</b> soal berhasil disimpan.</div>
        <div v-if="importResult.skipped">{{ importResult.skipped }} soal dilewati karena tidak valid.</div>
        <q-btn class="q-mt-md" unelevated color="primary" label="Kembali ke Soal" :to="{ name: 'admin-ujian-detail', params: { id: route.params.id } }" />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useUjianStore } from 'src/stores/ujian';

const route = useRoute();
const ujianStore = useUjianStore();

const step = ref(1);
const selectedFormat = ref('json');
const pasteText = ref('');
const uploadFile = ref(null);
const validating = ref(false);
const importing = ref(false);
const previewResult = ref(null);
const importResult = ref(null);
const parsedRows = ref([]);

const formats = [
  { value: 'json', label: 'JSON', icon: 'data_object', desc: 'Cocok untuk hasil ChatGPT' },
  { value: 'csv', label: 'CSV', icon: 'table_chart', desc: 'Spreadsheet / Excel' },
];

const hasInput = computed(() => pasteText.value.trim() || uploadFile.value);

// ─── Download template ────────────────────────────────────────────────────────
const downloadTemplate = (fmt) => {
  if (fmt === 'json') {
    const tmpl = JSON.stringify([
      { teks: 'Contoh pertanyaan?', pilihanA: 'Jawaban A', pilihanB: 'Jawaban B', pilihanC: 'Jawaban C', pilihanD: 'Jawaban D', kunci: 'A', bobot: 1 },
    ], null, 2);
    download('template-soal.json', 'application/json', tmpl);
  } else {
    const csv = 'teks,pilihanA,pilihanB,pilihanC,pilihanD,kunci,bobot\nContoh pertanyaan?,Jawaban A,Jawaban B,Jawaban C,Jawaban D,A,1';
    download('template-soal.csv', 'text/csv', csv);
  }
};

const download = (filename, type, content) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

// ─── Parse input ─────────────────────────────────────────────────────────────
const parseInput = async () => {
  // JSON paste
  if (selectedFormat.value === 'json' && pasteText.value.trim()) {
    const raw = JSON.parse(pasteText.value.trim());
    return raw.map(r => ({
      teks: r.teks, pilihanA: r.pilihanA, pilihanB: r.pilihanB,
      pilihanC: r.pilihanC, pilihanD: r.pilihanD, kunci: r.kunci, bobot: r.bobot ?? 1,
    }));
  }
  // File upload
  if (uploadFile.value) {
    const text = await uploadFile.value.text();
    if (selectedFormat.value === 'json') {
      return JSON.parse(text).map(r => ({ ...r }));
    }
    // CSV
    const lines = text.split('\n').filter(Boolean);
    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
      const cols = line.split(',');
      const obj = {};
      headers.forEach((h, i) => { obj[h] = cols[i]?.trim() ?? ''; });
      return obj;
    });
  }
  return [];
};

// ─── Validasi ─────────────────────────────────────────────────────────────────
const doValidasi = async () => {
  validating.value = true;
  try {
    const rows = await parseInput();
    parsedRows.value = rows;
    const result = await ujianStore.previewImport(route.params.id, rows);
    if (result) {
      previewResult.value = result;
      step.value = 3;
    }
  } catch (e) {
    const { Notify } = await import('quasar');
    Notify.create({ type: 'negative', message: `Format tidak valid: ${e.message}` });
  } finally {
    validating.value = false;
  }
};

// ─── Konfirmasi Import ────────────────────────────────────────────────────────
const doImport = async () => {
  importing.value = true;
  const result = await ujianStore.confirmImport(route.params.id, parsedRows.value);
  importing.value = false;
  if (result) {
    importResult.value = result;
    step.value = 4;
  }
};

// ─── Preview columns ──────────────────────────────────────────────────────────
const previewColumns = [
  { name: 'no', label: 'No', field: 'urutan', align: 'center', style: 'width:40px' },
  { name: 'teks', label: 'Pertanyaan', field: 'teks', align: 'left' },
  { name: 'kunci', label: 'Kunci', field: 'kunciJawaban', align: 'center', style: 'width:60px' },
  { name: 'bobot', label: 'Bobot', field: 'bobot', align: 'center', style: 'width:60px' },
];
</script>
