<template>
  <q-page class="q-pb-xl">
    <!-- Hero -->
    <div class="page-hero q-py-xl text-center text-white">
      <q-icon name="contact_mail" size="48px" class="q-mb-sm" />
      <h1 class="text-h4 text-weight-bold q-mb-sm">Hubungi Kami</h1>
      <p class="text-body1 opacity-80">Kami siap mendengar kritik, saran, dan pertanyaan Anda</p>
    </div>

    <div class="q-px-md q-py-xl" style="max-width: 1100px; margin: 0 auto">
      <div class="row q-col-gutter-xl">
        <!-- ─── Info Kontak ────────────────────────────────────────────── -->
        <div class="col-12 col-md-4">
          <div class="text-h6 text-weight-bold text-primary q-mb-lg">Informasi Masjid</div>

          <q-list>
            <q-item v-for="info in contactInfo" :key="info.label" class="q-px-none q-mb-md">
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white" size="42px">
                  <q-icon :name="info.icon" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">{{ info.label }}</q-item-label>
                <q-item-label caption class="text-grey-7" style="white-space: pre-line">{{ info.value }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>

          <!-- Social Media -->
          <div class="q-mt-lg">
            <div class="text-subtitle2 text-weight-bold q-mb-sm">Ikuti Kami</div>
            <div class="row q-gutter-sm">
              <q-btn round unelevated color="green" icon="fab fa-whatsapp" />
              <q-btn round unelevated color="blue-9" icon="fab fa-facebook" />
              <q-btn round unelevated color="pink" icon="fab fa-instagram" />
              <q-btn round unelevated color="red" icon="fab fa-youtube" />
            </div>
          </div>
        </div>

        <!-- ─── Google Maps ─────────────────────────────────────────────── -->
        <div class="col-12 col-md-8">
          <!-- Maps Embed -->
          <q-card flat bordered class="rounded-xl overflow-hidden q-mb-lg">
            <iframe
              src="https://www.google.com/maps?q=Masjid%20SYAIKH%20HAMAD%20AL%20HAMAD%20IMAM%20ASY-SYAFI%27I%20MAIS%2C%20-6.4143689%2C106.8381553&z=17&output=embed"
              width="100%"
              height="280"
              style="border: 0"
              allowfullscreen=""
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
            />
          </q-card>

          <!-- Form Pesan -->
          <q-card flat bordered class="rounded-xl">
            <q-card-section class="q-pa-lg">
              <div class="text-subtitle1 text-weight-bold q-mb-md text-primary">
                <q-icon name="send" class="q-mr-sm" />Kirim Pesan
              </div>

              <q-form @submit="submitPesan" class="q-gutter-md">
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-sm-6">
                    <q-input v-model="form.nama" outlined label="Nama *" :rules="[v => !!v || 'Nama harus diisi']">
                      <template #prepend><q-icon name="person" /></template>
                    </q-input>
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-input v-model="form.email" outlined label="Email *" type="email" :rules="[v => !!v || 'Email harus diisi', v => /\S+@\S+\.\S+/.test(v) || 'Email tidak valid']">
                      <template #prepend><q-icon name="email" /></template>
                    </q-input>
                  </div>
                </div>

                <q-input v-model="form.subjek" outlined label="Subjek">
                  <template #prepend><q-icon name="subject" /></template>
                </q-input>

                <q-input
                  v-model="form.pesan"
                  outlined
                  label="Pesan *"
                  type="textarea"
                  rows="5"
                  :rules="[v => !!v || 'Pesan harus diisi']"
                >
                  <template #prepend><q-icon name="message" /></template>
                </q-input>

                <q-btn
                  type="submit"
                  unelevated
                  color="primary"
                  label="Kirim Pesan"
                  icon="send"
                  no-caps
                  :loading="loading"
                  style="border-radius: 8px"
                />
              </q-form>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { api } from 'src/boot/axios';
import { Notify } from 'quasar';

const loading = ref(false);

const form = reactive({ nama: '', email: '', subjek: '', pesan: '' });

const contactInfo = [
  { icon: 'place', label: 'Alamat', value: "Jl. Persahabatan RT 01/10 No. 69. Raden Saleh, Sukmajaya, Depok 16412" },
  { icon: 'phone', label: 'Telepon / WhatsApp', value: '+62 895 6352 01053' },
  { icon: 'email', label: 'Email', value: 'info@mias.depok.org' },
  { icon: 'schedule', label: 'Jam Operasional Admin', value: 'Senin – Jumat: 08.00 – 16.00 WIB' },
];

const submitPesan = async () => {
  loading.value = true;
  try {
    await api.post('/pesan', form);
    Notify.create({ type: 'positive', message: 'Pesan berhasil dikirim! Kami akan segera merespons.' });
    Object.assign(form, { nama: '', email: '', subjek: '', pesan: '' });
  } catch {
    Notify.create({ type: 'negative', message: 'Gagal mengirim pesan, coba lagi.' });
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.page-hero {
  background: linear-gradient(135deg, #1B7A4A 0%, #26A65B 100%);
  padding: 80px 0;
}
</style>
