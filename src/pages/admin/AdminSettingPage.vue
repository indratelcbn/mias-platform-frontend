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
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useSettingStore } from 'src/stores/setting';

const $q = useQuasar();
const store = useSettingStore();

const form = ref({
  youtube: '', facebook: '', instagram: '', whatsapp: '',
  alamat: '', telepon: '', email: '', jamOperasional: '',
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
  };
});

async function handleSave() {
  try {
    await store.save({ ...form.value });
    $q.notify({ type: 'positive', message: 'Pengaturan berhasil disimpan', position: 'top' });
  } catch {
    $q.notify({ type: 'negative', message: 'Gagal menyimpan pengaturan', position: 'top' });
  }
}
</script>

