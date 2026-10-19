<template>
  <q-page class="q-pa-lg">
    <!-- ─── Header ─────────────────────────────────────────────────────── -->
    <div class="row items-center q-mb-lg q-gutter-sm">
      <q-btn flat round dense icon="arrow_back" color="primary" :to="{ name: 'admin-pendidikan' }" />
      <div>
        <div class="text-h6 text-weight-bold">
          <q-icon name="quiz" color="primary" class="q-mr-xs" />
          {{ ujianStore.currentUjian?.judul || 'Detail Ujian' }}
        </div>
        <div class="text-caption text-grey-6">Kode: {{ ujianStore.currentUjian?.kodeUjian }}</div>
      </div>
      <q-space />
      <q-badge :color="statusColor(ujianStore.currentUjian?.status)" class="q-px-md q-py-xs text-body2">
        {{ ujianStore.currentUjian?.status }}
      </q-badge>
      <q-btn-dropdown flat no-caps color="primary" label="Ubah Status" icon="published_with_changes">
        <q-list>
          <q-item v-for="s in statusOptions" :key="s.value" clickable v-close-popup @click="changeStatus(s.value)">
            <q-item-section avatar><q-icon :name="s.icon" :color="s.color" /></q-item-section>
            <q-item-section>{{ s.label }}</q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </div>

    <!-- ─── Tabs ─────────────────────────────────────────────────────────── -->
    <q-tabs v-model="activeTab" no-caps narrow-indicator align="left" active-color="primary" indicator-color="primary" class="q-mb-md">
      <q-tab name="pengaturan" icon="settings" label="Pengaturan" />
      <q-tab name="soal" icon="list_alt" :label="`Soal (${soalStore.soalList.length})`" />
      <q-tab name="peserta" icon="people" :label="`Peserta (${soalStore.metaPeserta?.total ?? 0})`" />
    </q-tabs>

    <q-tab-panels v-model="activeTab" animated keep-alive>

      <!-- ══ TAB: PENGATURAN ══════════════════════════════════════════════ -->
      <q-tab-panel name="pengaturan" class="q-pa-none">
        <q-card flat bordered class="q-pa-lg" style="max-width:700px">
          <q-form @submit.prevent="saveUjian" class="q-gutter-md">
            <q-input v-model="form.judul" label="Judul Ujian *" outlined dense :rules="[v => !!v || 'Wajib diisi']" />
            <q-input v-model="form.deskripsi" label="Deskripsi" type="textarea" outlined dense autogrow />
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-input v-model="form.kodeUjian" label="Kode Ujian *" outlined dense :rules="[v => !!v || 'Wajib diisi']" />
              </div>
              <div class="col-12 col-sm-6">
                <q-input v-model.number="form.durasi" label="Durasi (menit) *" type="number" outlined dense :rules="[v => v > 0 || 'Harus > 0']" />
              </div>
            </div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-input v-model="form.tanggalMulai" label="Tanggal Mulai *" type="datetime-local" outlined dense />
              </div>
              <div class="col-12 col-sm-6">
                <q-input v-model="form.tanggalSelesai" label="Tanggal Selesai *" type="datetime-local" outlined dense />
              </div>
            </div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-input v-model.number="form.passingGrade" label="Nilai Kelulusan (%)" type="number" outlined dense hint="0–100" />
              </div>
              <div class="col-12 col-sm-6">
                <q-input v-model.number="form.maxPercobaan" label="Maks. Percobaan" type="number" outlined dense hint="Default 1" />
              </div>
            </div>
            <q-input v-model="form.petunjuk" label="Petunjuk Ujian" type="textarea" outlined dense autogrow />
            <q-toggle v-model="form.tampilNilai" label="Tampilkan nilai kepada peserta setelah submit" />
            <div class="row justify-end">
              <q-btn unelevated color="primary" type="submit" label="Simpan Pengaturan" :loading="saving" icon="save" />
            </div>
          </q-form>
        </q-card>
      </q-tab-panel>

      <!-- ══ TAB: SOAL ════════════════════════════════════════════════════ -->
      <q-tab-panel name="soal" class="q-pa-none">
        <div class="row items-center q-mb-md q-gutter-sm">
          <q-btn unelevated color="primary" icon="add" label="Tambah Soal" @click="openSoalDialog()" />
          <q-btn outline color="secondary" icon="upload_file" label="Import Soal" :to="{ name: 'admin-ujian-import', params: { id: route.params.id } }" />
          <q-space />
          <div class="text-caption text-grey-7">Total: {{ soalStore.soalList.length }} soal</div>
        </div>
        <q-card flat bordered>
          <q-table
            :rows="soalStore.soalList"
            :columns="soalColumns"
            row-key="id"
            flat
            :loading="soalStore.loadingSoal"
            hide-bottom
            :rows-per-page-options="[0]"
          >
            <template #body-cell-no="{ rowIndex }">
              <q-td class="text-center">{{ rowIndex + 1 }}</q-td>
            </template>
            <template #body-cell-teks="{ row }">
              <q-td style="max-width:320px; white-space:normal"><arabic-text :text="row.teks" /></q-td>
            </template>
            <template #body-cell-pilihan="{ row }">
              <q-td>
                <div class="text-caption row items-start no-wrap"><b class="q-mr-xs">A:</b><arabic-text :text="row.pilihanA" /></div>
                <div class="text-caption row items-start no-wrap"><b class="q-mr-xs">B:</b><arabic-text :text="row.pilihanB" /></div>
                <div class="text-caption row items-start no-wrap"><b class="q-mr-xs">C:</b><arabic-text :text="row.pilihanC" /></div>
                <div class="text-caption row items-start no-wrap"><b class="q-mr-xs">D:</b><arabic-text :text="row.pilihanD" /></div>
              </q-td>
            </template>
            <template #body-cell-kunci="{ row }">
              <q-td class="text-center">
                <q-badge color="positive" :label="row.kunciJawaban" />
              </q-td>
            </template>
            <template #body-cell-actions="{ row }">
              <q-td class="text-center">
                <q-btn flat round dense icon="edit" color="primary" size="sm" @click="openSoalDialog(row)" />
                <q-btn flat round dense icon="delete" color="negative" size="sm" @click="confirmDeleteSoal(row)" />
              </q-td>
            </template>
          </q-table>
        </q-card>
      </q-tab-panel>

      <!-- ══ TAB: PESERTA ═════════════════════════════════════════════════ -->
      <q-tab-panel name="peserta" class="q-pa-none">
        <div class="row items-center q-mb-md">
          <div class="text-subtitle1 text-weight-medium">Daftar Peserta & Hasil</div>
          <q-space />
          <q-btn outline color="primary" icon="download" label="Unduh Rekap CSV" @click="downloadRekap" :loading="downloadingRekap" />
        </div>
        <q-card flat bordered>
          <q-table
            :rows="soalStore.pesertaList"
            :columns="pesertaColumns"
            row-key="id"
            flat
            :loading="soalStore.loadingPeserta"
            hide-bottom
            :rows-per-page-options="[0]"
          >
            <template #body-cell-status="{ row }">
              <q-td class="text-center">
                <q-badge :color="statusPesertaColor(row.status)" :label="row.status" />
              </q-td>
            </template>
            <template #body-cell-isPassed="{ row }">
              <q-td class="text-center">
                <template v-if="row.status === 'SELESAI'">
                  <q-badge :color="row.isPassed ? 'positive' : 'negative'" :label="row.isPassed ? 'Lulus' : 'Tidak Lulus'" />
                </template>
                <span v-else class="text-grey-5">–</span>
              </q-td>
            </template>
            <template #body-cell-score="{ row }">
              <q-td class="text-center">
                <span v-if="row.score !== null">{{ row.score?.toFixed(1) }}</span>
                <span v-else class="text-grey-5">–</span>
              </q-td>
            </template>
          </q-table>
        </q-card>
        <div class="row justify-end q-mt-sm">
          <q-pagination v-if="soalStore.metaPeserta.totalPages > 1" v-model="pesertaPage"
            :max="soalStore.metaPeserta.totalPages" @update:model-value="loadPeserta" />
        </div>
      </q-tab-panel>

    </q-tab-panels>

    <!-- ─── Dialog Soal ──────────────────────────────────────────────────── -->
    <q-dialog v-model="soalDialog" persistent>
      <q-card style="min-width:480px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">{{ editSoalId ? 'Edit Soal' : 'Tambah Soal' }}</div>
        </q-card-section>
        <q-card-section class="q-gutter-sm">
          <q-input v-model="soalForm.teks" label="Teks Soal *" type="textarea" outlined dense autogrow :rules="[v => !!v || 'Wajib']" />
          <q-input v-model="soalForm.pilihanA" label="Pilihan A *" outlined dense :rules="[v => !!v || 'Wajib']" />
          <q-input v-model="soalForm.pilihanB" label="Pilihan B *" outlined dense :rules="[v => !!v || 'Wajib']" />
          <q-input v-model="soalForm.pilihanC" label="Pilihan C *" outlined dense :rules="[v => !!v || 'Wajib']" />
          <q-input v-model="soalForm.pilihanD" label="Pilihan D *" outlined dense :rules="[v => !!v || 'Wajib']" />
          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-select v-model="soalForm.kunciJawaban" label="Kunci Jawaban *" :options="['A','B','C','D']" outlined dense />
            </div>
            <div class="col-6">
              <q-input v-model.number="soalForm.bobot" label="Bobot" type="number" outlined dense />
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Batal" v-close-popup />
          <q-btn unelevated color="primary" :label="editSoalId ? 'Simpan' : 'Tambahkan'" @click="saveSoal" :loading="savingSoal" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { useUjianStore } from 'src/stores/ujian';
import ArabicText from 'components/ArabicText.vue';

const $q = useQuasar();
const route = useRoute();
const ujianStore = useUjianStore();
const soalStore = ujianStore; // same store

const activeTab = ref('pengaturan');
const saving = ref(false);
const savingSoal = ref(false);
const soalDialog = ref(false);
const editSoalId = ref(null);
const pesertaPage = ref(1);
const downloadingRekap = ref(false);

// ─── Form Pengaturan ──────────────────────────────────────────────────────────
const form = reactive({
  judul: '', deskripsi: '', kodeUjian: '', tanggalMulai: '', tanggalSelesai: '',
  durasi: 60, passingGrade: 70, maxPercobaan: 1, petunjuk: '', tampilNilai: false,
});

const fillForm = (u) => {
  if (!u) return;
  form.judul = u.judul;
  form.deskripsi = u.deskripsi || '';
  form.kodeUjian = u.kodeUjian;
  form.tanggalMulai = toDatetimeLocal(u.tanggalMulai);
  form.tanggalSelesai = toDatetimeLocal(u.tanggalSelesai);
  form.durasi = u.durasi;
  form.passingGrade = u.passingGrade;
  form.maxPercobaan = u.maxPercobaan;
  form.petunjuk = u.petunjuk || '';
  form.tampilNilai = u.tampilNilai;
};

const toDatetimeLocal = (iso) => {
  if (!iso) return '';
  return new Date(iso).toISOString().slice(0, 16);
};

const saveUjian = async () => {
  saving.value = true;
  await ujianStore.updateUjian(route.params.id, {
    ...form,
    tanggalMulai: new Date(form.tanggalMulai).toISOString(),
    tanggalSelesai: new Date(form.tanggalSelesai).toISOString(),
  });
  saving.value = false;
};

// ─── Status ───────────────────────────────────────────────────────────────────
const statusOptions = [
  { value: 'DRAFT', label: 'Draft', icon: 'edit_note', color: 'grey' },
  { value: 'PUBLISHED', label: 'Publikasikan', icon: 'public', color: 'positive' },
  { value: 'CLOSED', label: 'Tutup', icon: 'lock', color: 'warning' },
  { value: 'ARCHIVED', label: 'Arsipkan', icon: 'archive', color: 'negative' },
];

const statusColor = (s) => ({ DRAFT: 'grey', PUBLISHED: 'positive', CLOSED: 'warning', ARCHIVED: 'negative' }[s] || 'grey');
const statusPesertaColor = (s) => ({ AKTIF: 'primary', SELESAI: 'positive', EXPIRED: 'warning' }[s] || 'grey');

const changeStatus = async (status) => {
  await ujianStore.updateStatus(route.params.id, status);
};

// ─── Soal ──────────────────────────────────────────────────────────────────
const soalColumns = [
  { name: 'no', label: 'No', field: 'urutan', sortable: true, align: 'center', style: 'width:50px' },
  { name: 'teks', label: 'Pertanyaan', field: 'teks', align: 'left' },
  { name: 'pilihan', label: 'Pilihan', field: 'pilihanA', align: 'left' },
  { name: 'kunci', label: 'Kunci', field: 'kunciJawaban', align: 'center', style: 'width:70px' },
  { name: 'bobot', label: 'Bobot', field: 'bobot', align: 'center', style: 'width:60px' },
  { name: 'actions', label: '', field: 'actions', align: 'center', style: 'width:90px' },
];

const emptySoalForm = () => ({ teks: '', pilihanA: '', pilihanB: '', pilihanC: '', pilihanD: '', kunciJawaban: 'A', bobot: 1 });
const soalForm = reactive(emptySoalForm());

const openSoalDialog = (row = null) => {
  editSoalId.value = row?.id || null;
  if (row) {
    Object.assign(soalForm, { teks: row.teks, pilihanA: row.pilihanA, pilihanB: row.pilihanB, pilihanC: row.pilihanC, pilihanD: row.pilihanD, kunciJawaban: row.kunciJawaban, bobot: row.bobot });
  } else {
    Object.assign(soalForm, emptySoalForm());
  }
  soalDialog.value = true;
};

const saveSoal = async () => {
  savingSoal.value = true;
  const result = editSoalId.value
    ? await ujianStore.updateSoal(editSoalId.value, soalForm)
    : await ujianStore.createSoal(route.params.id, soalForm);
  savingSoal.value = false;
  if (result) {
    soalDialog.value = false;
    ujianStore.fetchSoal(route.params.id);
  }
};

const confirmDeleteSoal = (row) => {
  $q.dialog({
    title: 'Hapus Soal',
    message: `Hapus soal: "${row.teks.substring(0, 60)}..."?`,
    cancel: { flat: true, label: 'Batal' },
    ok: { unelevated: true, color: 'negative', label: 'Hapus' },
    persistent: true,
  }).onOk(async () => {
    const ok = await ujianStore.deleteSoal(row.id);
    if (ok) ujianStore.fetchSoal(route.params.id);
  });
};

// ─── Peserta ─────────────────────────────────────────────────────────────────
const pesertaColumns = [
  { name: 'namaLengkap', label: 'Nama', field: 'namaLengkap', align: 'left' },
  { name: 'identitas', label: 'Identitas', field: 'identitas', align: 'left' },
  { name: 'percobaan', label: 'Ke-', field: 'percobaan', align: 'center', style: 'width:50px' },
  { name: 'status', label: 'Status', field: 'status', align: 'center' },
  { name: 'score', label: 'Nilai', field: 'score', align: 'center' },
  { name: 'isPassed', label: 'Kelulusan', field: 'isPassed', align: 'center' },
  { name: 'finishedAt', label: 'Selesai', field: 'finishedAt', align: 'left', format: v => v ? new Date(v).toLocaleString('id-ID') : '–' },
];

const loadPeserta = () => {
  ujianStore.fetchPeserta(route.params.id, { page: pesertaPage.value });
};

const downloadRekap = async () => {
  downloadingRekap.value = true;
  const rekap = await ujianStore.fetchRekap(route.params.id);
  downloadingRekap.value = false;
  if (!rekap) return;

  const rows = rekap.peserta.map((p, i) => [
    i + 1, p.namaLengkap, p.identitas, p.percobaan, p.score?.toFixed(1) ?? '', p.isPassed ? 'Lulus' : 'Tidak Lulus', p.status
  ]);
  const header = ['No', 'Nama', 'Identitas', 'Percobaan', 'Nilai', 'Kelulusan', 'Status'];
  const csv = [header, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `rekap-${ujianStore.currentUjian?.kodeUjian ?? 'ujian'}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// ─── Lifecycle ───────────────────────────────────────────────────────────────
onMounted(async () => {
  const u = await ujianStore.fetchDetail(route.params.id);
  fillForm(u);
  await ujianStore.fetchSoal(route.params.id);
  loadPeserta();
});
</script>
