<template>
  <q-page padding>
    <div class="row items-center q-mb-lg">
      <q-icon name="settings" size="28px" color="primary" class="q-mr-sm" />
      <div class="text-h5 text-weight-bold">Pengaturan Situs</div>
    </div>

    <q-form @submit.prevent="handleSave">
      <div class="row q-col-gutter-lg">

        <!-- ─── Informasi Masjid ─────────────────────────────────────── -->
        <div class="col-12 col-md-6">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-subtitle1 text-weight-medium q-mb-md">
                <q-icon name="mosque" color="primary" class="q-mr-sm" />Informasi Masjid
              </div>
              <div class="q-gutter-md">
                <q-input
                  v-model="form.alamat"
                  label="Alamat"
                  outlined
                  clearable
                  type="textarea"
                  rows="3"
                  hint="Alamat lengkap masjid"
                >
                  <template #prepend><q-icon name="place" color="grey-7" /></template>
                </q-input>

                <q-input
                  v-model="form.telepon"
                  label="Telepon / WhatsApp"
                  outlined
                  clearable
                  hint="Contoh: +62 895 6352 01053"
                >
                  <template #prepend><q-icon name="phone" color="grey-7" /></template>
                </q-input>

                <q-input
                  v-model="form.email"
                  label="Email"
                  outlined
                  clearable
                  type="email"
                  hint="Contoh: info@mias.depok.org"
                >
                  <template #prepend><q-icon name="email" color="grey-7" /></template>
                </q-input>

                <q-input
                  v-model="form.jamOperasional"
                  label="Jam Operasional Admin"
                  outlined
                  clearable
                  hint="Contoh: Senin – Jumat: 08.00 – 16.00 WIB"
                >
                  <template #prepend><q-icon name="schedule" color="grey-7" /></template>
                </q-input>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- ─── Sosial Media ─────────────────────────────────────────── -->
        <div class="col-12 col-md-6">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-subtitle1 text-weight-medium q-mb-md">
                <q-icon name="share" color="primary" class="q-mr-sm" />Link Sosial Media
              </div>
              <div class="q-gutter-md">
                <q-input
                  v-model="form.youtube"
                  label="YouTube"
                  outlined
                  clearable
                  hint="Contoh: https://youtube.com/@namakanal"
                >
                  <template #prepend><q-icon name="fab fa-youtube" color="red-7" /></template>
                </q-input>

                <q-input
                  v-model="form.facebook"
                  label="Facebook"
                  outlined
                  clearable
                  hint="Contoh: https://facebook.com/namahalaman"
                >
                  <template #prepend><q-icon name="fab fa-facebook" color="blue-8" /></template>
                </q-input>

                <q-input
                  v-model="form.instagram"
                  label="Instagram"
                  outlined
                  clearable
                  hint="Contoh: https://instagram.com/namaakun"
                >
                  <template #prepend><q-icon name="fab fa-instagram" color="pink-7" /></template>
                </q-input>

                <q-input
                  v-model="form.whatsapp"
                  label="WhatsApp (Link wa.me)"
                  outlined
                  clearable
                  hint="Contoh: https://wa.me/6281234567890"
                >
                  <template #prepend><q-icon name="fab fa-whatsapp" color="green-7" /></template>
                </q-input>
              </div>
            </q-card-section>
          </q-card>
        </div>

      </div>

      <!-- ─── Banner Hero Section ────────────────────────────────────── -->
      <div class="row q-col-gutter-lg q-mt-sm">
        <div class="col-12">
          <q-card flat bordered>
            <q-card-section class="row items-center">
              <div>
                <div class="text-subtitle1 text-weight-medium">
                  <q-icon name="panorama" color="primary" class="q-mr-sm" />Banner Hero Section
                </div>
                <div class="text-caption text-grey q-mt-xs">
                  Kelola gambar slideshow di hero section halaman utama (maks 5 gambar)
                </div>
              </div>
              <q-space />
              <q-btn
                color="primary"
                icon="panorama"
                label="Kelola Banner"
                no-caps
                unelevated
                to="/admin/hero-banner"
              />
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- ─── Popup Awal Website ─────────────────────────────────────── -->
      <div class="row q-col-gutter-lg q-mt-sm">
        <div class="col-12">
          <q-card flat bordered>
            <q-card-section>
              <div class="row items-start q-col-gutter-lg">
                <div class="col-12 col-md-5">
                  <div class="text-subtitle1 text-weight-medium q-mb-xs">
                    <q-icon name="campaign" color="primary" class="q-mr-sm" />Popup Tampilan Awal
                  </div>
                  <div class="text-caption text-grey q-mb-md">
                    Flyer akan tampil sekali di website publik. Klik flyer membuka link di tab baru.
                  </div>

                  <div class="popup-preview flex flex-center">
                    <q-img
                      v-if="popupPreviewSrc"
                      :src="popupPreviewSrc"
                      fit="contain"
                      class="popup-preview-img"
                      spinner-color="primary"
                    />
                    <div v-else class="column items-center text-grey-6">
                      <q-icon name="image" size="48px" />
                      <div class="text-caption q-mt-sm">Belum ada flyer popup</div>
                    </div>
                  </div>
                </div>

                <div class="col-12 col-md-7">
                  <div class="q-gutter-md">
                    <q-toggle
                      v-model="form.popupIsActive"
                      label="Aktifkan popup di website"
                      color="primary"
                    />

                    <q-input
                      v-model="form.popupUrl"
                      label="Link tujuan saat popup diklik"
                      outlined
                      clearable
                      hint="Contoh: https://mias.depok.org/donasi/program-donasi"
                    >
                      <template #prepend><q-icon name="open_in_new" color="grey-7" /></template>
                    </q-input>

                    <q-file
                      v-model="popupFile"
                      label="Upload / ganti flyer popup"
                      outlined
                      clearable
                      accept="image/jpeg, image/png, image/webp"
                      max-file-size="10485760"
                      hint="JPG, PNG, atau WebP. Maks 10 MB. Rekomendasi portrait atau square."
                      @rejected="onPopupFileRejected"
                    >
                      <template #prepend><q-icon name="image" /></template>
                    </q-file>

                    <q-btn
                      v-if="form.popupImage && !deletePopupImage"
                      outline
                      color="negative"
                      icon="delete"
                      label="Hapus Flyer Popup"
                      no-caps
                      @click="markPopupImageForDelete"
                    />
                    <q-banner v-if="deletePopupImage" rounded class="bg-red-1 text-red-9">
                      <template #avatar><q-icon name="delete" color="negative" /></template>
                      Flyer popup akan dihapus saat perubahan disimpan.
                    </q-banner>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <div class="q-mt-lg">
        <q-btn
          type="submit"
          label="Simpan Perubahan"
          color="primary"
          icon="save"
          :loading="store.loading"
          unelevated
        />
      </div>
    </q-form>
  </q-page>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useSettingStore } from 'src/stores/setting';

const $q = useQuasar();
const store = useSettingStore();

const form = ref({
  youtube: '', facebook: '', instagram: '', whatsapp: '',
  alamat: '', telepon: '', email: '', jamOperasional: '',
  popupImage: '', popupUrl: '', popupIsActive: false,
});

const popupFile = ref(null);
const popupPreview = ref('');
const deletePopupImage = ref(false);

const popupPreviewSrc = computed(() => {
  if (popupPreview.value) return popupPreview.value;
  if (deletePopupImage.value || !form.value.popupImage) return '';
  return `/uploads/popup/${form.value.popupImage}`;
});

watch(popupFile, (file) => {
  deletePopupImage.value = false;
  if (!file) {
    popupPreview.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = (event) => { popupPreview.value = event.target.result; };
  reader.readAsDataURL(file);
});

onMounted(async () => {
  await store.fetch();
  form.value = {
    youtube:        store.data.youtube        || '',
    facebook:       store.data.facebook       || '',
    instagram:      store.data.instagram      || '',
    whatsapp:       store.data.whatsapp       || '',
    alamat:         store.data.alamat         || '',
    telepon:        store.data.telepon        || '',
    email:          store.data.email          || '',
    jamOperasional: store.data.jamOperasional || '',
    popupImage:     store.data.popupImage     || '',
    popupUrl:       store.data.popupUrl       || '',
    popupIsActive:  !!store.data.popupIsActive,
  };
});

function onPopupFileRejected() {
  $q.notify({ type: 'negative', message: 'File ditolak. Pastikan format dan ukuran sesuai.', position: 'top' });
}

function markPopupImageForDelete() {
  popupFile.value = null;
  popupPreview.value = '';
  deletePopupImage.value = true;
}

async function handleSave() {
  try {
    const payload = new FormData();
    Object.entries(form.value).forEach(([key, value]) => {
      if (key !== 'popupImage') payload.append(key, value ?? '');
    });
    if (popupFile.value) payload.append('popupImage', popupFile.value);
    if (deletePopupImage.value) payload.append('deletePopupImage', 'true');

    const res = await store.save(payload);
    form.value.popupImage = res.data.popupImage || '';
    form.value.popupUrl = res.data.popupUrl || '';
    form.value.popupIsActive = !!res.data.popupIsActive;
    popupFile.value = null;
    popupPreview.value = '';
    deletePopupImage.value = false;
    $q.notify({ type: 'positive', message: 'Pengaturan berhasil disimpan', position: 'top' });
  } catch {
    $q.notify({ type: 'negative', message: 'Gagal menyimpan pengaturan', position: 'top' });
  }
}
</script>

<style scoped>
.popup-preview {
  min-height: 260px;
  border: 1px dashed #cfd8dc;
  border-radius: 8px;
  background: #f8faf9;
  overflow: hidden;
}
.popup-preview-img {
  width: 100%;
  max-height: 360px;
}
</style>

