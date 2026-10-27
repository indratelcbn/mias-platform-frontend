<template>
  <q-page class="q-pa-lg">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h5 text-weight-bold">
          <q-icon name="auto_stories" color="primary" class="q-mr-sm" />Muroja'ah Kajian
        </div>
        <div class="text-grey-7 text-caption">Kelola kajian, sesi, materi, dan soal Muroja'ah.</div>
      </div>
      <q-btn unelevated color="primary" icon="add" no-caps label="Muroja'ah Baru" @click="openCreate" />
    </div>

    <!-- Filter bar -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section class="row q-col-gutter-md items-center">
        <div class="col-12 col-md-6">
          <q-input v-model="search" outlined dense clearable debounce="400" placeholder="Cari judul, ustadz, atau kitab…" @update:model-value="reload">
            <template #prepend><q-icon name="search" /></template>
          </q-input>
        </div>
        <div class="col-12 col-md-3">
          <q-select v-model="statusFilter" outlined dense emit-value map-options :options="statusOptions" label="Status" clearable @update:model-value="reload" />
        </div>
        <div class="col-12 col-md-3 text-right text-grey-7 text-caption">
          Total: {{ store.meta.total }} kajian
        </div>
      </q-card-section>
    </q-card>

    <!-- Table -->
    <q-card flat bordered>
      <q-table
        :rows="store.daftarKajian"
        :columns="columns"
        row-key="id"
        :loading="store.loading"
        flat
        :pagination="{ rowsPerPage: 0 }"
        hide-pagination
      >
        <template #body-cell-judul="{ row }">
          <q-td>
            <div class="text-weight-medium">{{ row.judul }}</div>
            <div class="text-caption text-grey-6">{{ row.ustadz }}<span v-if="row.kitab"> · {{ row.kitab }}</span></div>
          </q-td>
        </template>
        <template #body-cell-info="{ row }">
          <q-td class="text-center">
            <q-chip dense square color="blue-1" text-color="primary" icon="layers" :label="`${row.totalSesi} sesi`" />
            <q-chip dense square color="teal-1" text-color="teal-8" icon="quiz" :label="`${row.totalSoal} soal`" />
          </q-td>
        </template>
        <template #body-cell-tanggal="{ row }">
          <q-td class="text-center">{{ row.tanggal ? formatDate(row.tanggal) : '—' }}</q-td>
        </template>
        <template #body-cell-status="{ row }">
          <q-td class="text-center">
            <q-badge :color="statusColor(row.status)" :label="row.status" />
          </q-td>
        </template>
        <template #body-cell-aksi="{ row }">
          <q-td class="text-right">
            <q-btn flat round dense icon="tune" color="primary" :to="{ name: 'admin-murojaah-detail', params: { id: row.id } }">
              <q-tooltip>Kelola sesi, materi & soal</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="edit" color="grey-8" @click="openEdit(row)"><q-tooltip>Edit kajian</q-tooltip></q-btn>
            <q-btn flat round dense icon="more_vert">
              <q-menu>
                <q-list dense style="min-width:180px">
                  <q-item clickable v-close-popup @click="setStatus(row, 'PUBLISHED')" :disable="row.status==='PUBLISHED'">
                    <q-item-section avatar><q-icon name="public" color="positive" /></q-item-section>
                    <q-item-section>Publikasikan</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="setStatus(row, 'DRAFT')" :disable="row.status==='DRAFT'">
                    <q-item-section avatar><q-icon name="edit_note" color="orange" /></q-item-section>
                    <q-item-section>Jadikan Draft</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="setStatus(row, 'ARCHIVED')" :disable="row.status==='ARCHIVED'">
                    <q-item-section avatar><q-icon name="archive" color="grey" /></q-item-section>
                    <q-item-section>Arsipkan</q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item clickable v-close-popup class="text-negative" @click="confirmDelete(row)">
                    <q-item-section avatar><q-icon name="delete" color="negative" /></q-item-section>
                    <q-item-section>Hapus</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-td>
        </template>
        <template #no-data>
          <div class="full-width column items-center q-pa-xl text-grey-6">
            <q-icon name="auto_stories" size="48px" class="q-mb-sm" />
            <div>Belum ada kajian Muroja'ah. Klik "Kajian Baru" untuk memulai.</div>
          </div>
        </template>
      </q-table>
    </q-card>

    <!-- Pagination -->
    <div v-if="store.meta.totalPages > 1" class="row justify-center q-mt-md">
      <q-pagination v-model="page" :max="store.meta.totalPages" direction-links @update:model-value="reload" />
    </div>

    <!-- Create / Edit dialog -->
    <q-dialog v-model="formDialog" persistent>
      <q-card style="min-width:360px; max-width:640px; width:92vw">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ editId ? "Edit Muroja'ah" : "Muroja'ah Baru" }}</div>
          <q-space /><q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <q-form @submit="submitForm" class="q-gutter-md">
            <!-- Pilih Kajian (hanya saat buat baru) -->
            <template v-if="!editId">
              <!-- Step 1: Ustadz -->
              <q-select
                v-model="selUstadz" outlined dense emit-value map-options
                :options="ustadzOptions" label="1. Pilih Ustadz / Pemateri *"
                :loading="loadingKajian" @update:model-value="onUstadzChange"
                :rules="[v => !!v || 'Ustadz wajib dipilih']"
              >
                <template #prepend><q-icon name="person" /></template>
                <template #no-option><q-item><q-item-section class="text-grey-6">Belum ada kajian. Buat dahulu di menu Kajian Ilmiyyah.</q-item-section></q-item></template>
              </q-select>

              <!-- Step 2: Kitab (Rutin) atau Tematik -->
              <q-select
                v-if="selUstadz" v-model="selKitab" outlined dense emit-value map-options
                :options="kitabOptions" label="2. Pilih Kitab (Rutin) atau Tematik *"
                @update:model-value="onKitabChange"
                :rules="[v => !!v || 'Pilih kitab atau tematik']"
                hint="Ada kitab = Kajian Rutin. Tanpa kitab = Kajian Tematik (pilih judul)."
              >
                <template #prepend><q-icon name="menu_book" /></template>
              </q-select>

              <!-- Step 3: Kajian final -->
              <q-select
                v-if="selKitab" v-model="form.kajianId" outlined dense emit-value map-options
                :options="kajianCandidates" option-value="id" :option-label="candidateLabel"
                :option-disable="(o) => o.alreadyLinked"
                :label="selKitab === TEMATIK ? '3. Pilih Judul Kajian Tematik *' : '3. Pilih Kajian / Tanggal *'"
                :rules="[v => !!v || 'Kajian wajib dipilih']"
              >
                <template #prepend><q-icon name="event_note" /></template>
                <template #option="{ itemProps, opt }">
                  <q-item v-bind="itemProps" :disable="opt.alreadyLinked">
                    <q-item-section>
                      <q-item-label>{{ opt.judul }}</q-item-label>
                      <q-item-label caption>
                        {{ opt.kitab || 'Tematik' }}<span v-if="opt.tanggal"> · {{ formatDate(opt.tanggal) }}</span>
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side v-if="opt.alreadyLinked"><q-badge color="grey" label="Sudah ada" /></q-item-section>
                  </q-item>
                </template>
                <template #no-option><q-item><q-item-section class="text-grey-6">Tidak ada kajian yang cocok.</q-item-section></q-item></template>
              </q-select>
            </template>
            <q-banner v-else dense class="bg-blue-1 text-primary rounded-borders">
              <template #avatar><q-icon name="menu_book" /></template>
              Kajian: <b>{{ form._judul }}</b>
            </q-banner>

            <q-input v-model="form.youtubeUrl" outlined dense label="Link Video YouTube" placeholder="https://youtu.be/...">
              <template #prepend><q-icon name="smart_display" color="red" /></template>
            </q-input>
            <q-input
              v-model="form.thumbnail" outlined dense disable readonly
              label="URL Thumbnail (otomatis dari kajian)"
              hint="Thumbnail mengikuti thumbnail kajian / YouTube dan tidak dapat diubah di sini."
            >
              <template #prepend><q-icon name="image" /></template>
            </q-input>
            <q-input v-model="form.ringkasan" outlined dense type="textarea" rows="3" label="Ringkasan materi / cakupan halaman kitab" />
            <q-select v-model="form.status" outlined dense emit-value map-options :options="statusOptions" label="Status Publikasi" />
            <div class="row justify-end q-gutter-sm">
              <q-btn flat no-caps label="Batal" v-close-popup />
              <q-btn unelevated color="primary" no-caps :label="editId ? 'Simpan' : 'Buat'" type="submit" :loading="saving" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useMurojaahStore } from 'src/stores/murojaah';

const $q = useQuasar();
const store = useMurojaahStore();

const search = ref('');
const statusFilter = ref(null);
const page = ref(1);

const statusOptions = [
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Published', value: 'PUBLISHED' },
  { label: 'Archived', value: 'ARCHIVED' },
];

const columns = [
  { name: 'judul', label: 'Kajian', field: 'judul', align: 'left' },
  { name: 'info', label: 'Konten', field: 'info', align: 'center' },
  { name: 'tanggal', label: 'Tanggal', field: 'tanggal', align: 'center' },
  { name: 'status', label: 'Status', field: 'status', align: 'center' },
  { name: 'aksi', label: 'Aksi', field: 'aksi', align: 'right' },
];

const statusColor = (s) => ({ DRAFT: 'orange', PUBLISHED: 'positive', ARCHIVED: 'grey' }[s] || 'grey');
const formatDate = (d) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

const reload = () => {
  store.fetchDaftar({ page: page.value, search: search.value || undefined, status: statusFilter.value || undefined });
};

// ── Kajian options (cascading: Ustadz → Kitab/Tematik → Kajian) ─────────────
const TEMATIK = '__TEMATIK__';
const kajianOptions = ref([]);
const loadingKajian = ref(false);
const selUstadz = ref(null);
const selKitab = ref(null);

const loadKajianOptions = async () => {
  loadingKajian.value = true;
  kajianOptions.value = await store.fetchKajianOptions();
  loadingKajian.value = false;
};

const ustadzOptions = computed(() => {
  const set = new Map();
  kajianOptions.value.forEach((k) => { if (k.ustadz) set.set(k.ustadz, true); });
  return [...set.keys()].sort((a, b) => a.localeCompare(b, 'id')).map((u) => ({ label: u, value: u }));
});

const kitabOptions = computed(() => {
  if (!selUstadz.value) return [];
  const mine = kajianOptions.value.filter((k) => k.ustadz === selUstadz.value);
  const kitabs = [...new Set(mine.filter((k) => k.kitab && k.kitab.trim()).map((k) => k.kitab))]
    .sort((a, b) => a.localeCompare(b, 'id'))
    .map((kt) => ({ label: kt, value: kt }));
  const opts = [...kitabs];
  if (mine.some((k) => !k.kitab || !k.kitab.trim())) {
    opts.push({ label: 'Tanpa Kitab (Kajian Tematik)', value: TEMATIK });
  }
  return opts;
});

const kajianCandidates = computed(() => {
  if (!selUstadz.value || !selKitab.value) return [];
  return kajianOptions.value.filter((k) => {
    if (k.ustadz !== selUstadz.value) return false;
    if (selKitab.value === TEMATIK) return !k.kitab || !k.kitab.trim();
    return k.kitab === selKitab.value;
  });
});

const candidateLabel = (o) => o?.judul || '';

const onUstadzChange = () => { selKitab.value = null; form.kajianId = null; };
const onKitabChange = () => {
  form.kajianId = null;
  // Auto-pilih bila hanya ada satu kandidat yang belum terpakai
  const avail = kajianCandidates.value.filter((k) => !k.alreadyLinked);
  if (avail.length === 1) form.kajianId = avail[0].id;
};

// ── Form ────────────────────────────────────────────────────────────────────
const formDialog = ref(false);
const saving = ref(false);
const editId = ref(null);
const form = reactive({
  kajianId: null, _judul: '', youtubeUrl: '', thumbnail: '', ringkasan: '', status: 'DRAFT',
});

const resetForm = () => {
  Object.assign(form, { kajianId: null, _judul: '', youtubeUrl: '', thumbnail: '', ringkasan: '', status: 'DRAFT' });
  selUstadz.value = null;
  selKitab.value = null;
  editId.value = null;
};

const openCreate = () => { resetForm(); loadKajianOptions(); formDialog.value = true; };

const openEdit = (row) => {
  resetForm();
  editId.value = row.id;
  Object.assign(form, {
    kajianId: row.kajianId, _judul: row.judul,
    youtubeUrl: row.youtubeUrl || '', thumbnail: row.thumbnail || '',
    ringkasan: row.ringkasan || '', status: row.status,
  });
  formDialog.value = true;
};

const submitForm = async () => {
  saving.value = true;
  // thumbnail sengaja tidak dikirim: selalu mengikuti thumbnail kajian (otomatis)
  const payload = {
    youtubeUrl: form.youtubeUrl, ringkasan: form.ringkasan, status: form.status,
  };
  if (!editId.value) payload.kajianId = form.kajianId;
  const res = editId.value
    ? await store.updateKajian(editId.value, payload)
    : await store.createKajian(payload);
  saving.value = false;
  if (res) { formDialog.value = false; reload(); }
};

const setStatus = async (row, status) => {
  if (await store.updateStatus(row.id, status)) reload();
};

const confirmDelete = (row) => {
  $q.dialog({
    title: "Hapus Muroja'ah",
    message: `Hapus Muroja'ah untuk "${row.judul}" beserta semua sesi, materi, soal, dan nilai peserta? Kajian aslinya tidak ikut terhapus. Tindakan ini tidak dapat dibatalkan.`,
    cancel: true,
    ok: { label: 'Hapus', color: 'negative', unelevated: true },
  }).onOk(async () => {
    if (await store.deleteKajian(row.id)) reload();
  });
};

onMounted(() => { reload(); });
</script>
