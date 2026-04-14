<template>
  <q-page class="q-pb-xl">
    <!-- Hero -->
    <div class="page-hero q-py-xl text-center text-white">
      <div class="q-px-md">
        <q-icon name="volunteer_activism" size="56px" class="q-mb-md" />
        <h1 class="text-h4 text-weight-bold q-mb-sm">Donasi & Wakaf</h1>
        <p class="text-body1 opacity-85">
          "Orang yang menginfakkan hartanya di jalan Allah seperti biji yang menumbuhkan tujuh tangkai" – QS. Al-Baqarah: 261
        </p>
      </div>
    </div>

    <div class="q-px-md q-py-xl" style="max-width: 1200px; margin: 0 auto">
      <div class="row q-col-gutter-lg">
        <!-- ─── Daftar Program (Kiri) ────────────────────────────────── -->
        <div class="col-12 col-md-3">
          <div class="text-h6 text-weight-bold q-mb-md text-primary">
            <q-icon name="list_alt" class="q-mr-sm" />Daftar Program
          </div>

          <q-card v-if="donasiStore.programList.length" flat bordered class="rounded-xl q-mb-md">
            <q-card-section class="q-pb-none">
              <div class="text-subtitle2 text-weight-bold text-primary">Program Donasi</div>
            </q-card-section>
            <q-list dense separator>
              <q-item v-for="p in donasiStore.programList" :key="p.id">
                <q-item-section side>
                  <q-badge color="primary" :label="p.kode || '-'" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ p.judul }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>

          <q-card v-if="donasiStore.wakafList.length" flat bordered class="rounded-xl">
            <q-card-section class="q-pb-none">
              <div class="text-subtitle2 text-weight-bold text-teal">Program Wakaf</div>
            </q-card-section>
            <q-list dense separator>
              <q-item v-for="p in donasiStore.wakafList" :key="p.id">
                <q-item-section side>
                  <q-badge color="teal" :label="p.kode || '-'" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ p.kegiatan }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>
        </div>

        <!-- ─── Rekening & QRIS (Tengah) ─────────────────────────────── -->
        <div class="col-12 col-md-4">
          <div class="text-h6 text-weight-bold q-mb-md text-primary">
            <q-icon name="account_balance" class="q-mr-sm" />Rekening Donasi & Wakaf
          </div>

          <div v-if="donasiStore.rekeningList.length">
            <q-card
              v-for="rek in donasiStore.rekeningList"
              :key="rek.id"
              flat
              bordered
              class="rounded-xl q-mb-md"
            >
              <q-card-section>
                <div class="text-weight-bold text-primary">{{ rek.namaBank }}</div>
                <div class="text-h5 text-weight-bold q-my-xs letter-spacing-lg">
                  {{ rek.noRekening }}
                </div>
                <div class="text-grey-7">a.n. {{ rek.atasNama }}</div>
                <div v-if="rek.keterangan" class="text-caption text-grey-6 q-mt-xs">
                  {{ rek.keterangan }}
                </div>
                <q-btn
                  flat
                  dense
                  no-caps
                  icon="content_copy"
                  :label="copied === rek.id ? '✓ Tersalin!' : 'Salin Nomor'"
                  color="primary"
                  class="q-mt-sm"
                  @click="copyRekening(rek)"
                />
              </q-card-section>
            </q-card>
          </div>

          <q-skeleton v-else height="140px" class="rounded-xl" />

          <!-- QRIS -->
          <div v-if="qrisRekening">
            <q-card flat bordered class="rounded-xl q-mt-md text-center q-pa-md">
              <div class="text-weight-bold q-mb-sm text-primary">
                <q-icon name="qr_code_2" class="q-mr-xs" />QRIS
              </div>
              <q-img :src="qrisRekening.qrisImage" fit="contain" style="max-height: 200px; max-width: 200px; margin: 0 auto" />
              <div class="text-caption text-grey-6 q-mt-sm">Scan untuk donasi via semua e-wallet</div>
            </q-card>
          </div>
          <div v-else>
            <q-card flat bordered class="rounded-xl q-mt-md text-center q-pa-md">
              <q-icon name="qr_code_2" size="80px" color="primary" />
              <div class="text-weight-bold q-mt-sm">QRIS</div>
              <div class="text-caption text-grey-6">Scan untuk donasi via semua e-wallet</div>
            </q-card>
          </div>
        </div>

        <!-- ─── Form Konfirmasi (Kanan) ──────────────────────────────── -->
        <div class="col-12 col-md-5">
          <div class="text-h6 text-weight-bold q-mb-md text-primary">
            <q-icon name="check_circle" class="q-mr-sm" />Konfirmasi Transfer
          </div>

          <q-card flat bordered class="rounded-xl">
            <q-card-section>
              <q-form @submit="submitDonasi" class="q-gutter-md">
                <q-input
                  v-model="form.nama"
                  outlined
                  label="Nama Lengkap *"
                  :rules="[val => !!val || 'Nama harus diisi']"
                >
                  <template #prepend><q-icon name="person" /></template>
                </q-input>

                <q-input
                  v-model="form.email"
                  outlined
                  label="Email (opsional)"
                  type="email"
                >
                  <template #prepend><q-icon name="email" /></template>
                </q-input>

                <q-input
                  v-model="form.telepon"
                  outlined
                  label="No. Telepon (opsional)"
                  type="tel"
                >
                  <template #prepend><q-icon name="phone" /></template>
                </q-input>

                <q-select
                  v-model="form.jenisProgram"
                  outlined
                  label="Jenis Program (opsional)"
                  :options="jenisOptions"
                  emit-value
                  map-options
                  clearable
                  @update:model-value="onJenisChange"
                >
                  <template #prepend><q-icon name="category" /></template>
                </q-select>

                <q-select
                  v-if="form.jenisProgram"
                  v-model="form.namaProgram"
                  outlined
                  :label="form.jenisProgram === 'DONASI' ? 'Pilih Program Donasi' : 'Pilih Program Wakaf'"
                  :options="programOptions"
                  emit-value
                  map-options
                  clearable
                >
                  <template #prepend><q-icon name="list_alt" /></template>
                </q-select>

                <q-input
                  v-model.number="form.jumlah"
                  outlined
                  label="Jumlah Donasi *"
                  type="number"
                  prefix="Rp"
                  :rules="[val => val > 0 || 'Jumlah donasi harus diisi']"
                >
                  <template #prepend><q-icon name="payments" /></template>
                </q-input>

                <div>
                  <div class="text-caption text-grey-7 q-mb-xs">Nominal Cepat:</div>
                  <div class="row q-gutter-sm">
                    <q-btn
                      v-for="nominal in quickAmounts"
                      :key="nominal"
                      flat
                      dense
                      no-caps
                      :label="formatCurrency(nominal)"
                      :color="form.jumlah === nominal ? 'primary' : 'grey'"
                      :outline="form.jumlah !== nominal"
                      style="border-radius: 8px; font-size: 12px"
                      @click="form.jumlah = nominal"
                    />
                  </div>
                </div>

                <q-file
                  v-model="form.buktiTransfer"
                  outlined
                  label="Upload Bukti Transfer"
                  accept=".jpg,.jpeg,.png,.webp"
                  max-file-size="2097152"
                >
                  <template #prepend><q-icon name="attach_file" /></template>
                  <template #hint>Maks. 2MB (jpg, png, webp)</template>
                </q-file>

                <q-input
                  v-model="form.pesan"
                  outlined
                  label="Pesan / Catatan (opsional)"
                  type="textarea"
                  rows="3"
                >
                  <template #prepend><q-icon name="message" /></template>
                </q-input>

                <q-btn
                  type="submit"
                  unelevated
                  color="primary"
                  :label="donasiStore.submitting ? 'Mengirim...' : 'Kirim Konfirmasi'"
                  :loading="donasiStore.submitting"
                  no-caps
                  class="full-width q-py-sm"
                  style="border-radius: 8px; font-size: 16px"
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
import { reactive, ref, computed, onMounted } from 'vue';
import { useDonasiStore } from 'src/stores/donasi';

const donasiStore = useDonasiStore();
const copied = ref(null);

// Ambil rekening pertama yang punya QRIS untuk ditampilkan
const qrisRekening = computed(() =>
  donasiStore.rekeningList.find((r) => r.isActive && r.qrisImage) || null
);

const form = reactive({
  nama: '',
  email: '',
  telepon: '',
  jenisProgram: null,
  namaProgram: null,
  jumlah: null,
  buktiTransfer: null,
  pesan: '',
});

const jenisOptions = [
  { label: 'Program Donasi', value: 'DONASI' },
  { label: 'Program Wakaf', value: 'WAKAF' },
];

const programOptions = computed(() => {
  if (form.jenisProgram === 'DONASI') {
    return donasiStore.programList.map(p => ({
      label: p.kode ? `[${p.kode}] ${p.judul}` : p.judul,
      value: p.kode ? `[${p.kode}] ${p.judul}` : p.judul,
    }));
  }
  if (form.jenisProgram === 'WAKAF') {
    return donasiStore.wakafList.map(p => ({
      label: p.kode ? `[${p.kode}] ${p.kegiatan}` : p.kegiatan,
      value: p.kode ? `[${p.kode}] ${p.kegiatan}` : p.kegiatan,
    }));
  }
  return [];
});

const onJenisChange = () => {
  form.namaProgram = null;
};

const quickAmounts = [50000, 100000, 200000, 500000, 1000000];

const formatCurrency = (val) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

const copyRekening = async (rek) => {
  await navigator.clipboard.writeText(rek.noRekening);
  copied.value = rek.id;
  setTimeout(() => (copied.value = null), 2000);
};

const submitDonasi = async () => {
  const ok = await donasiStore.konfirmasi({ ...form });
  if (ok) {
    form.nama = '';
    form.email = '';
    form.telepon = '';
    form.jenisProgram = null;
    form.namaProgram = null;
    form.jumlah = null;
    form.buktiTransfer = null;
    form.pesan = '';
  }
};

onMounted(() => {
  donasiStore.fetchRekening();
  donasiStore.fetchActiveProgram();
  donasiStore.fetchActiveWakaf();
});
</script>

<style scoped>
.page-hero {
  background: linear-gradient(135deg, #1B7A4A 0%, #D4AF37 100%);
  padding: 80px 0;
}
.letter-spacing-lg {
  letter-spacing: 2px;
}
</style>
