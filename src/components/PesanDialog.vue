<template>
  <q-dialog v-model="show" @hide="onHide">
    <q-card class="pesan-dialog-card">
      <q-card-section class="row items-center q-pb-sm">
        <div class="text-subtitle1 text-weight-bold text-primary">
          <q-icon name="send" class="q-mr-sm" />Kirim Pesan
        </div>
        <q-space />
        <q-btn flat round dense icon="close" v-close-popup />
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pa-lg">
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

          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <q-input v-model="form.noHp" outlined label="No. Handphone *" :rules="[v => !!v || 'No. Handphone harus diisi']">
                <template #prepend><q-icon name="phone" /></template>
              </q-input>
            </div>
            <div class="col-12 col-sm-6">
              <q-select
                v-model="form.kategori"
                outlined
                emit-value
                map-options
                label="Tujuan Pesan *"
                :options="kategoriOptions"
                :rules="[v => !!v || 'Tujuan pesan harus dipilih']"
              >
                <template #prepend><q-icon name="category" /></template>
              </q-select>
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

          <div class="row justify-end q-gutter-sm">
            <q-btn flat no-caps label="Batal" color="grey-7" v-close-popup />
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
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { reactive, ref, computed, watch } from 'vue';
import { api } from 'src/boot/axios';
import { Notify } from 'quasar';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  defaultKategori: { type: String, default: '' },
  defaultSubjek: { type: String, default: '' },
});
const emit = defineEmits(['update:modelValue']);

const show = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});

const loading = ref(false);

const kategoriOptions = [
  { label: 'Fasilitas', value: 'FASILITAS' },
  { label: 'Divisi Dakwah', value: 'DIVISI_DAKWAH' },
  { label: 'Divisi Pendidikan', value: 'DIVISI_PENDIDIKAN' },
  { label: 'Divisi Sosial', value: 'DIVISI_SOSIAL' },
  { label: 'Umroh', value: 'UMROH' },
  { label: 'Pembelian Produk MIAS Mart', value: 'PEMBELIAN_PRODUK_MIAS_MART' },
  { label: 'Lain-Lain', value: 'LAIN_LAIN' },
];

const emptyForm = () => ({ nama: '', email: '', noHp: '', kategori: '', subjek: '', pesan: '' });
const form = reactive(emptyForm());

const resetForm = () => {
  Object.assign(form, emptyForm(), {
    kategori: props.defaultKategori || '',
    subjek: props.defaultSubjek || '',
  });
};

watch(
  () => props.modelValue,
  (open) => { if (open) resetForm(); },
);

const onHide = () => { emit('update:modelValue', false); };

const submitPesan = async () => {
  loading.value = true;
  try {
    await api.post('/pesan', form);
    Notify.create({ type: 'positive', message: 'Pesan berhasil dikirim! Kami akan segera merespons.' });
    show.value = false;
  } catch {
    Notify.create({ type: 'negative', message: 'Gagal mengirim pesan, coba lagi.' });
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.pesan-dialog-card {
  width: 100%;
  max-width: 640px;
  border-radius: 16px;
}
</style>
