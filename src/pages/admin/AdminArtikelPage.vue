<template>
  <q-page class="q-pa-lg">
    <div class="row items-center justify-between q-mb-lg">
      <div class="text-h5 text-weight-bold">
        <q-icon name="article" color="primary" class="q-mr-sm" />Kelola Artikel
      </div>
      <div class="row q-gutter-sm">
        <q-input
          v-model="searchQ"
          dense
          outlined
          placeholder="Cari judul…"
          debounce="400"
          @update:model-value="reload"
        >
          <template #prepend><q-icon name="search" /></template>
        </q-input>
        <q-select
          v-model="statusFilter"
          dense outlined emit-value map-options
          :options="statusOptions"
          style="min-width: 140px"
          @update:model-value="reload"
        />
        <q-btn unelevated color="primary" icon="add" label="Tambah Artikel" no-caps @click="openDialog()" />
      </div>
    </div>

    <q-card flat bordered class="rounded-xl">
      <q-table
        :rows="artikelStore.adminList"
        :columns="columns"
        row-key="id"
        flat
        :loading="artikelStore.loading"
        :pagination="{ rowsPerPage: 0 }"
        hide-pagination
      >
        <template #body-cell-thumbnail="props">
          <q-td>
            <q-img v-if="props.value" :src="props.value" width="64px" height="44px" fit="cover" class="rounded" />
            <q-icon v-else name="image_not_supported" color="grey-5" size="md" />
          </q-td>
        </template>
        <template #body-cell-judul="props">
          <q-td>
            <div class="text-weight-medium">{{ props.row.judul }}</div>
            <div class="text-caption text-grey-6">/{{ props.row.slug }}</div>
          </q-td>
        </template>
        <template #body-cell-kategori="props">
          <q-td>
            <q-chip v-if="props.value" dense color="primary" text-color="white" :label="props.value" />
            <span v-else class="text-grey-5">—</span>
          </q-td>
        </template>
        <template #body-cell-tanggalPublish="props">
          <q-td>{{ formatDate(props.row.tanggalPublish || props.row.createdAt) }}</q-td>
        </template>
        <template #body-cell-status="props">
          <q-td>
            <q-badge :color="props.row.isPublished ? 'positive' : 'grey'"
                     :label="props.row.isPublished ? 'Publish' : 'Draft'" />
            <q-badge v-if="props.row.isHighlight" color="orange" label="Headline" class="q-ml-xs" />
          </q-td>
        </template>
        <template #body-cell-actions="props">
          <q-td>
            <q-btn flat round icon="edit" color="primary" size="sm" @click="openDialog(props.row)" />
            <q-btn flat round icon="delete" color="negative" size="sm" @click="confirmDelete(props.row)" />
          </q-td>
        </template>
      </q-table>

      <div v-if="artikelStore.adminMeta.totalPages > 1" class="flex justify-center q-py-md">
        <q-pagination
          v-model="artikelStore.adminMeta.page"
          :max="artikelStore.adminMeta.totalPages"
          color="primary"
          @update:model-value="(p) => reload({ page: p })"
        />
      </div>
    </q-card>

    <!-- Dialog Form -->
    <q-dialog v-model="dialog" persistent maximized>
      <q-card class="bg-grey-1">
        <q-bar class="bg-primary text-white q-px-md">
          <div class="text-subtitle1">{{ isEdit ? 'Edit Artikel' : 'Tambah Artikel' }}</div>
          <q-space />
          <div v-if="autoSaveStatus" class="text-caption q-mr-md opacity-80">
            <q-icon name="cloud_done" size="xs" /> {{ autoSaveStatus }}
          </div>
          <q-btn flat dense icon="visibility" :color="showPreview ? 'yellow' : 'white'"
                 @click="showPreview = !showPreview">
            <q-tooltip>Toggle preview</q-tooltip>
          </q-btn>
          <q-btn flat dense icon="close" @click="confirmClose" />
        </q-bar>

        <q-form @submit.prevent="onSubmit(true)" class="q-pa-md">
          <div class="row q-col-gutter-md">
            <!-- LEFT: editor -->
            <div :class="showPreview ? 'col-12 col-md-7' : 'col-12'">
              <q-card flat bordered class="rounded-xl q-pa-md q-gutter-md">
                <q-input
                  v-model="form.judul"
                  outlined
                  label="Judul Artikel *"
                  :rules="[v => !!v || 'Wajib diisi']"
                  @update:model-value="onJudulChange"
                />
                <div class="row q-col-gutter-sm">
                  <div class="col-12 col-sm-7">
                    <q-input v-model="slugPreview" outlined dense readonly label="Slug (otomatis)">
                      <template #prepend><q-icon name="link" /></template>
                    </q-input>
                  </div>
                  <div class="col-12 col-sm-5">
                    <q-select
                      v-model="form.kategori"
                      :options="kategoriOptions"
                      outlined dense
                      label="Kategori"
                      use-input new-value-mode="add-unique" hide-dropdown-icon
                      input-debounce="0"
                    />
                  </div>
                </div>

                <q-input
                  v-model="form.ringkasan"
                  outlined
                  type="textarea"
                  rows="2"
                  label="Ringkasan / Excerpt"
                  hint="Tampil di kartu artikel & meta description (otomatis jika kosong)."
                />

                <div>
                  <div class="text-caption text-grey-7 q-mb-xs">Thumbnail</div>
                  <div class="row items-center q-gutter-md">
                    <q-img
                      v-if="thumbnailPreview"
                      :src="thumbnailPreview"
                      width="160px" height="100px" fit="cover" class="rounded"
                    />
                    <div v-else class="thumb-placeholder flex items-center justify-center">
                      <q-icon name="image" size="lg" color="grey-5" />
                    </div>
                    <div class="col">
                      <q-file
                        v-model="form.thumbnailFile"
                        outlined dense
                        accept="image/*"
                        label="Pilih thumbnail"
                        @update:model-value="onThumbnailChange"
                      >
                        <template #prepend><q-icon name="upload" /></template>
                      </q-file>
                      <q-btn
                        v-if="thumbnailPreview && !form.thumbnailFile && form.thumbnail"
                        flat dense color="negative" no-caps size="sm" label="Hapus thumbnail saat ini"
                        @click="clearThumbnail" class="q-mt-xs"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div class="text-caption text-grey-7 q-mb-xs">Isi Artikel *</div>
                  <RichTextEditor v-model="form.konten" />
                </div>

                <div class="row q-col-gutter-md">
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="form.tanggalPublish"
                      outlined dense
                      label="Tanggal Publish"
                      mask="####-##-## ##:##"
                      hint="Format: YYYY-MM-DD HH:mm"
                    >
                      <template #prepend><q-icon name="event" /></template>
                    </q-input>
                  </div>
                  <div class="col-12 col-sm-6 row items-center q-gutter-md">
                    <q-toggle v-model="form.isPublished" label="Publish" color="positive" />
                    <q-toggle v-model="form.isHighlight" label="Headline / Highlight" color="orange" />
                  </div>
                </div>

                <q-expansion-item
                  icon="search"
                  label="SEO (Auto-generated)"
                  header-class="text-primary text-weight-medium"
                >
                  <div class="q-pa-sm q-gutter-sm">
                    <q-input
                      v-model="form.metaTitle"
                      outlined dense
                      :label="`Meta Title (${(form.metaTitle || '').length}/70)`"
                      maxlength="70"
                      :placeholder="form.judul"
                    />
                    <q-input
                      v-model="form.metaDescription"
                      outlined dense
                      type="textarea"
                      rows="2"
                      :label="`Meta Description (${(form.metaDescription || '').length}/160)`"
                      maxlength="160"
                      :placeholder="form.ringkasan"
                    />
                  </div>
                </q-expansion-item>
              </q-card>

              <div class="row justify-end q-gutter-sm q-mt-md">
                <q-btn flat no-caps label="Batal" @click="confirmClose" />
                <q-btn outline no-caps color="grey-8" label="Simpan Draft" :loading="saving" @click="onSubmit(false)" />
                <q-btn unelevated no-caps color="primary"
                       :label="isEdit ? 'Simpan & Publish' : 'Publish'"
                       :loading="saving" type="submit" />
              </div>
            </div>

            <!-- RIGHT: live preview -->
            <div v-if="showPreview" class="col-12 col-md-5">
              <q-card flat bordered class="rounded-xl preview-card">
                <q-card-section class="bg-grey-2 row items-center q-py-sm">
                  <q-icon name="preview" class="q-mr-xs" /> <span class="text-weight-medium">Live Preview</span>
                </q-card-section>
                <q-img v-if="thumbnailPreview" :src="thumbnailPreview" height="220px" fit="cover" />
                <q-card-section>
                  <div class="row items-center q-gutter-xs q-mb-sm text-caption text-grey-7">
                    <q-chip v-if="form.kategori" dense color="primary" text-color="white" :label="form.kategori" />
                    <q-icon name="event" size="xs" />
                    <span>{{ formatDate(form.tanggalPublish || new Date()) }}</span>
                    <q-badge v-if="form.isHighlight" color="orange" label="Headline" />
                  </div>
                  <h2 class="text-h5 text-weight-bold q-mt-none q-mb-sm">
                    {{ form.judul || 'Judul artikel akan tampil di sini' }}
                  </h2>
                  <p v-if="form.ringkasan" class="text-grey-8">{{ form.ringkasan }}</p>
                  <q-separator class="q-my-md" />
                  <div class="article-preview" v-html="form.konten || '<p class=\'text-grey-5\'>Mulai menulis untuk melihat preview…</p>'" />
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useArtikelStore } from 'src/stores/artikel';
import { useQuasar } from 'quasar';
import RichTextEditor from 'src/components/RichTextEditor.vue';

const $q = useQuasar();
const artikelStore = useArtikelStore();

const dialog = ref(false);
const isEdit = ref(false);
const saving = ref(false);
const editId = ref(null);
const showPreview = ref(true);
const autoSaveStatus = ref('');
const autoSaveTimer = ref(null);
const dirty = ref(false);

const searchQ = ref('');
const statusFilter = ref('');
const statusOptions = [
  { label: 'Semua', value: '' },
  { label: 'Published', value: 'published' },
  { label: 'Draft', value: 'draft' },
];
const kategoriOptions = ['Berita', 'Himbauan', 'Pengumuman', 'Kegiatan', 'Edukasi'];

const emptyForm = () => ({
  judul: '',
  ringkasan: '',
  konten: '',
  kategori: null,
  tanggalPublish: '',
  isPublished: true,
  isHighlight: false,
  metaTitle: '',
  metaDescription: '',
  thumbnail: '',          // existing url
  thumbnailFile: null,    // new file
});
const form = reactive(emptyForm());
const thumbnailPreview = ref('');

const columns = [
  { name: 'thumbnail', label: 'Thumbnail', field: 'thumbnail', align: 'center' },
  { name: 'judul', label: 'Judul', field: 'judul', align: 'left' },
  { name: 'kategori', label: 'Kategori', field: 'kategori', align: 'left' },
  { name: 'tanggalPublish', label: 'Tanggal', field: 'tanggalPublish', align: 'left' },
  { name: 'status', label: 'Status', field: 'isPublished', align: 'center' },
  { name: 'actions', label: 'Aksi', field: 'actions', align: 'center' },
];

const slugPreview = computed(() => {
  return (form.judul || '')
    .toLowerCase()
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
});

const formatDate = (d) => {
  if (!d) return '-';
  const date = new Date(d);
  if (isNaN(date.getTime())) return d;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatDateTimeLocal = (d) => {
  if (!d) return '';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const reload = (extra = {}) => {
  artikelStore.fetchAllAdmin({
    page: extra.page || 1,
    search: searchQ.value || undefined,
    status: statusFilter.value || undefined,
  });
};

const draftKey = () => `mias.artikel.draft.${editId.value || 'new'}`;
const loadDraft = () => {
  try {
    const raw = localStorage.getItem(draftKey());
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
};
const saveDraft = () => {
  try {
    const snapshot = { ...form, thumbnailFile: null }; // file can't be serialized
    localStorage.setItem(draftKey(), JSON.stringify(snapshot));
    autoSaveStatus.value = `Draft tersimpan ${new Date().toLocaleTimeString('id-ID')}`;
  } catch { /* ignore quota */ }
};
const clearDraft = () => {
  try { localStorage.removeItem(draftKey()); } catch { /* */ }
};

const openDialog = (row = null) => {
  Object.assign(form, emptyForm());
  thumbnailPreview.value = '';
  autoSaveStatus.value = '';
  dirty.value = false;
  if (row) {
    isEdit.value = true;
    editId.value = row.id;
    Object.assign(form, {
      judul: row.judul || '',
      ringkasan: row.ringkasan || '',
      konten: row.konten || '',
      kategori: row.kategori || null,
      tanggalPublish: formatDateTimeLocal(row.tanggalPublish || row.createdAt),
      isPublished: !!row.isPublished,
      isHighlight: !!row.isHighlight,
      metaTitle: row.metaTitle || '',
      metaDescription: row.metaDescription || '',
      thumbnail: row.thumbnail || '',
    });
    thumbnailPreview.value = row.thumbnail || '';
  } else {
    isEdit.value = false;
    editId.value = null;
  }
  // Restore unsaved draft if any
  const draft = loadDraft();
  if (draft) {
    $q.dialog({
      title: 'Pulihkan Draft?',
      message: 'Ditemukan draft yang belum tersimpan untuk artikel ini. Pulihkan?',
      cancel: { flat: true, label: 'Buang' },
      ok: { unelevated: true, color: 'primary', label: 'Pulihkan' },
    }).onOk(() => {
      Object.assign(form, draft);
      if (form.thumbnail) thumbnailPreview.value = form.thumbnail;
    }).onCancel(() => clearDraft());
  }
  dialog.value = true;
};

const onJudulChange = () => {
  if (!form.metaTitle) {
    // auto fill meta title (live mirror)
    // intentionally leave empty so placeholder shows; backend will fill if blank
  }
};

const onThumbnailChange = (file) => {
  if (!file) { thumbnailPreview.value = form.thumbnail || ''; return; }
  const reader = new FileReader();
  reader.onload = (e) => { thumbnailPreview.value = e.target.result; };
  reader.readAsDataURL(file);
};

const clearThumbnail = () => {
  form.thumbnail = '';
  thumbnailPreview.value = '';
};

const parsePublishDate = (str) => {
  if (!str) return null;
  // expecting "YYYY-MM-DD HH:mm"
  const isoLike = str.replace(' ', 'T');
  const d = new Date(isoLike);
  return isNaN(d.getTime()) ? null : d;
};

const onSubmit = async (publish) => {
  if (!form.judul || !form.konten) {
    $q.notify({ type: 'warning', message: 'Judul dan konten wajib diisi.' });
    return;
  }
  saving.value = true;
  const payload = {
    judul: form.judul,
    konten: form.konten,
    ringkasan: form.ringkasan,
    kategori: form.kategori,
    tanggalPublish: parsePublishDate(form.tanggalPublish),
    isPublished: !!publish,
    isHighlight: form.isHighlight,
    metaTitle: form.metaTitle || form.judul.slice(0, 70),
    metaDescription: form.metaDescription || (form.ringkasan || '').slice(0, 160),
    thumbnail: form.thumbnailFile || undefined,
  };

  const result = isEdit.value
    ? await artikelStore.update(editId.value, payload)
    : await artikelStore.create(payload);
  saving.value = false;
  if (result) {
    clearDraft();
    dialog.value = false;
    reload({ page: artikelStore.adminMeta.page });
  }
};

const confirmClose = () => {
  if (!dirty.value) { dialog.value = false; return; }
  $q.dialog({
    title: 'Tutup tanpa menyimpan?',
    message: 'Perubahan akan disimpan sebagai draft lokal di browser.',
    cancel: { flat: true, label: 'Batal' },
    ok: { unelevated: true, color: 'primary', label: 'Tutup' },
  }).onOk(() => {
    saveDraft();
    dialog.value = false;
  });
};

const confirmDelete = (row) => {
  $q.dialog({
    title: 'Hapus Artikel',
    message: `Yakin ingin menghapus artikel "${row.judul}"?`,
    cancel: { flat: true, label: 'Batal' },
    ok: { unelevated: true, color: 'negative', label: 'Hapus' },
  }).onOk(async () => {
    await artikelStore.remove(row.id);
    reload({ page: artikelStore.adminMeta.page });
  });
};

// auto-save draft setiap 5 detik saat dialog terbuka & ada perubahan
watch(form, () => {
  if (!dialog.value) return;
  dirty.value = true;
  autoSaveStatus.value = 'Menulis…';
  clearTimeout(autoSaveTimer.value);
  autoSaveTimer.value = setTimeout(saveDraft, 1500);
}, { deep: true });

watch(dialog, (v) => {
  if (!v) {
    clearTimeout(autoSaveTimer.value);
    autoSaveTimer.value = null;
  }
});

onMounted(() => {
  reload();
});

onBeforeUnmount(() => clearTimeout(autoSaveTimer.value));
</script>

<style scoped>
.preview-card { position: sticky; top: 16px; max-height: calc(100vh - 80px); overflow: auto; }
.thumb-placeholder {
  width: 160px;
  height: 100px;
  border: 1px dashed #c8ccd0;
  border-radius: 8px;
  background: #f6f8fa;
}
</style>

<style>
.article-preview { font-size: 15px; line-height: 1.7; color: #1f2933; }
.article-preview p { margin: 0 0 1em; }
.article-preview h2 { font-size: 1.45rem; font-weight: 700; margin: 1.4em 0 0.5em; color: #1B7A4A; }
.article-preview h3 { font-size: 1.18rem; font-weight: 700; margin: 1.2em 0 0.4em; color: #1B7A4A; }
.article-preview ul, .article-preview ol { padding-left: 1.4em; margin: 0 0 1em; }
.article-preview blockquote {
  border-left: 4px solid #1B7A4A;
  margin: 1em 0; padding: 0.4em 1em; background: #f1faf3;
  border-radius: 4px; font-style: italic; color: #2c3e50;
}
.article-preview a { color: #1B7A4A; text-decoration: underline; }
.article-preview img { max-width: 100%; height: auto; border-radius: 8px; margin: 0.6em 0; }
.article-preview hr { border: none; border-top: 1px solid #d4d8de; margin: 1.4em 0; }
.article-preview table { border-collapse: collapse; width: 100%; margin: 1em 0; }
.article-preview table td, .article-preview table th { border: 1px solid #d4d8de; padding: 6px 10px; }
.article-preview table th { background: #f1faf3; font-weight: 700; }
</style>
