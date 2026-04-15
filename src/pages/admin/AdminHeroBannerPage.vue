<template>
  <q-page padding>
    <div class="row items-center q-mb-lg">
      <q-icon name="panorama" size="28px" color="primary" class="q-mr-sm" />
      <div class="text-h5 text-weight-bold">Banner Hero Section</div>
      <q-space />
      <q-btn
        v-if="store.items.length < 5"
        color="primary"
        icon="add_photo_alternate"
        label="Upload Banner"
        no-caps
        unelevated
        @click="showUpload = true"
      />
    </div>

    <q-banner v-if="!store.items.length && !store.loading" class="bg-blue-1 text-blue-9 q-mb-lg" rounded>
      <template #avatar><q-icon name="info" color="blue" /></template>
      Belum ada banner. Upload hingga 5 gambar untuk slideshow hero section di halaman utama.
    </q-banner>

    <div v-if="store.loading" class="flex justify-center q-pa-xl">
      <q-spinner-dots size="48px" color="primary" />
    </div>

    <!-- Banner Grid -->
    <div class="row q-col-gutter-lg">
      <div v-for="banner in store.items" :key="banner.id" class="col-12 col-sm-6 col-md-4">
        <q-card flat bordered class="banner-card">
          <q-img
            :src="`/uploads/hero_banner/${banner.gambar}`"
            :ratio="16/9"
            class="rounded-borders"
            spinner-color="primary"
          >
            <div class="absolute-top-right q-pa-xs">
              <q-badge
                :color="banner.isActive ? 'positive' : 'grey'"
                :label="banner.isActive ? 'Aktif' : 'Nonaktif'"
              />
            </div>
          </q-img>

          <q-card-section class="q-pa-sm">
            <div class="row items-center no-wrap">
              <div class="text-caption text-grey">Urutan: {{ banner.urutan }}</div>
              <q-space />
              <q-btn flat dense round icon="edit" color="primary" size="sm" @click="openEdit(banner)">
                <q-tooltip>Edit</q-tooltip>
              </q-btn>
              <q-btn flat dense round icon="delete" color="negative" size="sm" @click="confirmDelete(banner)">
                <q-tooltip>Hapus</q-tooltip>
              </q-btn>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Upload Dialog -->
    <q-dialog v-model="showUpload" persistent>
      <q-card style="min-width: 420px; max-width: 90vw">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Upload Banner Baru</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <q-file
            v-model="uploadFile"
            label="Pilih Gambar"
            outlined
            accept="image/jpeg, image/png, image/webp"
            max-file-size="10485760"
            hint="JPG, PNG, atau WebP. Maks 10 MB. Resolusi rekomendasi: 1920x1080"
            @rejected="onFileRejected"
          >
            <template #prepend><q-icon name="image" /></template>
          </q-file>

          <!-- Preview -->
          <div v-if="uploadPreview" class="q-mt-md">
            <q-img :src="uploadPreview" :ratio="16/9" class="rounded-borders" />
          </div>

          <q-input
            v-model.number="uploadUrutan"
            label="Urutan"
            outlined
            type="number"
            class="q-mt-md"
            hint="Angka kecil ditampilkan lebih dulu"
          />

          <q-toggle v-model="uploadActive" label="Aktif" class="q-mt-sm" />
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Batal" no-caps v-close-popup />
          <q-btn
            unelevated
            color="primary"
            label="Upload"
            no-caps
            icon="cloud_upload"
            :loading="uploading"
            :disable="!uploadFile"
            @click="handleUpload"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Edit Dialog -->
    <q-dialog v-model="showEdit" persistent>
      <q-card style="min-width: 420px; max-width: 90vw">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Edit Banner</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <q-img
            v-if="editBanner"
            :src="`/uploads/hero_banner/${editBanner.gambar}`"
            :ratio="16/9"
            class="rounded-borders q-mb-md"
          />

          <q-file
            v-model="editFile"
            label="Ganti Gambar (opsional)"
            outlined
            clearable
            accept="image/jpeg, image/png, image/webp"
            max-file-size="10485760"
          >
            <template #prepend><q-icon name="image" /></template>
          </q-file>

          <q-input
            v-model.number="editUrutan"
            label="Urutan"
            outlined
            type="number"
            class="q-mt-md"
          />

          <q-toggle v-model="editActive" label="Aktif" class="q-mt-sm" />
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Batal" no-caps v-close-popup />
          <q-btn
            unelevated
            color="primary"
            label="Simpan"
            no-caps
            icon="save"
            :loading="uploading"
            @click="handleEdit"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useHeroBannerStore } from 'src/stores/hero-banner';

const $q = useQuasar();
const store = useHeroBannerStore();

// ─── Upload state ──────────────────────────────────────────────────────
const showUpload = ref(false);
const uploadFile = ref(null);
const uploadPreview = ref(null);
const uploadUrutan = ref(0);
const uploadActive = ref(true);
const uploading = ref(false);

watch(uploadFile, (f) => {
  if (f) {
    const reader = new FileReader();
    reader.onload = (e) => { uploadPreview.value = e.target.result; };
    reader.readAsDataURL(f);
  } else {
    uploadPreview.value = null;
  }
});

function onFileRejected() {
  $q.notify({ type: 'negative', message: 'File ditolak. Pastikan format dan ukuran sesuai.', position: 'top' });
}

async function handleUpload() {
  if (!uploadFile.value) return;
  uploading.value = true;
  try {
    const fd = new FormData();
    fd.append('gambar', uploadFile.value);
    fd.append('urutan', uploadUrutan.value);
    fd.append('isActive', uploadActive.value);
    await store.create(fd);
    showUpload.value = false;
    uploadFile.value = null;
    uploadUrutan.value = 0;
    uploadActive.value = true;
    $q.notify({ type: 'positive', message: 'Banner berhasil diupload', position: 'top' });
  } catch (err) {
    $q.notify({ type: 'negative', message: err.response?.data?.message || 'Gagal upload banner', position: 'top' });
  } finally {
    uploading.value = false;
  }
}

// ─── Edit state ────────────────────────────────────────────────────────
const showEdit = ref(false);
const editBanner = ref(null);
const editFile = ref(null);
const editUrutan = ref(0);
const editActive = ref(true);

function openEdit(banner) {
  editBanner.value = banner;
  editFile.value = null;
  editUrutan.value = banner.urutan;
  editActive.value = banner.isActive;
  showEdit.value = true;
}

async function handleEdit() {
  if (!editBanner.value) return;
  uploading.value = true;
  try {
    const fd = new FormData();
    fd.append('urutan', editUrutan.value);
    fd.append('isActive', editActive.value);
    if (editFile.value) fd.append('gambar', editFile.value);
    await store.update(editBanner.value.id, fd);
    showEdit.value = false;
    $q.notify({ type: 'positive', message: 'Banner berhasil diperbarui', position: 'top' });
  } catch (err) {
    $q.notify({ type: 'negative', message: err.response?.data?.message || 'Gagal update banner', position: 'top' });
  } finally {
    uploading.value = false;
  }
}

// ─── Delete ────────────────────────────────────────────────────────────
function confirmDelete(banner) {
  $q.dialog({
    title: 'Hapus Banner',
    message: 'Yakin ingin menghapus banner ini?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await store.remove(banner.id);
      $q.notify({ type: 'positive', message: 'Banner dihapus', position: 'top' });
    } catch (err) {
      $q.notify({ type: 'negative', message: 'Gagal menghapus banner', position: 'top' });
    }
  });
}

onMounted(() => store.fetch());
</script>

<style scoped>
.banner-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.banner-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}
</style>
