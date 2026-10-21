<template>
  <section class="donasi-section text-white q-py-xl text-center">
    <div class="q-px-md" style="max-width: 700px; margin: 0 auto">
      <q-icon name="volunteer_activism" size="56px" class="q-mb-md" style="opacity: 0.9" />
      <h2 class="text-h4 text-weight-bold q-mb-md">Dukung Pembangunan Masjid</h2>
      <p class="text-body1 q-mb-sm opacity-85" style="line-height: 1.8">
        "Barang siapa membangun masjid karena Allah, maka Allah akan membangunkan untuknya yang semisalnya di Surga."
        <br />
        <em style="opacity: 0.8">– HR. Bukhari &amp; Muslim</em>
      </p>

      <!-- Jumlah program aktif -->
      <div v-if="!loading && totalProgram > 0" class="text-caption q-mb-xl" style="opacity: 0.75">
        {{ totalProgram }} program aktif saat ini
      </div>
      <div v-else class="q-mb-xl" />

      <div class="row q-gutter-md justify-center q-mb-xl">
        <q-btn
          unelevated size="lg" no-caps label="Infaq Sekarang" to="/donasi"
          color="white" text-color="primary" class="q-px-xl"
          style="border-radius: 10px; font-weight: 700" icon="volunteer_activism"
        />
      </div>

      <!-- Skeleton loading -->
      <template v-if="loading">
        <q-skeleton type="text" width="120px" class="q-mx-auto q-mb-sm" dark />
        <q-skeleton v-for="i in 2" :key="'sk-' + i" height="130px" class="rounded-xl q-mb-md" dark />
      </template>

      <!-- Error state -->
      <q-banner v-else-if="fetchError" rounded class="bg-red-8 text-white q-mb-md">
        <template #avatar><q-icon name="error_outline" /></template>
        Gagal memuat data program. Silakan muat ulang halaman.
      </q-banner>

      <template v-else>
        <!-- Program Infaq dari API -->
        <template v-if="programs.length">
          <div class="text-subtitle1 text-weight-bold q-mb-sm" style="opacity: 0.9">
            <q-icon name="volunteer_activism" size="18px" class="q-mr-xs" />Program Infaq
          </div>
          <q-card
            v-for="prog in programs"
            :key="prog.id"
            flat class="rounded-xl bg-white text-dark q-pa-lg q-mb-md"
          >
            <!-- Header: judul + kode + persen -->
            <div class="row items-start justify-between q-mb-xs">
              <div class="text-left">
                <div class="row items-center q-gutter-xs q-mb-xs">
                  <q-badge v-if="prog.kode" color="primary" :label="prog.kode" />
                  <q-badge v-if="prog.divisi" outline color="grey-6" :label="prog.divisi.nama" />
                </div>
                <span class="text-subtitle2 text-weight-bold text-primary">{{ prog.judul }}</span>
              </div>
              <q-chip dense color="primary" text-color="white" size="sm" class="q-ml-sm">
                {{ progressPercent(prog) }}%
              </q-chip>
            </div>
            <q-linear-progress
              rounded size="12px"
              :value="progressValue(prog)"
              color="primary" track-color="grey-3"
              class="q-mb-sm"
            />
            <div class="row justify-between q-mt-xs">
              <span class="text-caption text-grey-6">Terkumpul: <strong>{{ formatCurrency(prog.terkumpul) }}</strong></span>
              <span class="text-caption text-grey-6">Target: {{ formatCurrency(prog.target) }}</span>
            </div>
            <div v-if="Number(prog.target) > Number(prog.terkumpul)" class="text-caption text-orange-8 q-mt-xs text-right">
              Sisa: {{ formatCurrency(Number(prog.target) - Number(prog.terkumpul)) }}
            </div>
            <div v-if="prog.deskripsi" class="text-caption text-grey-7 q-mt-xs text-left">{{ prog.deskripsi }}</div>
            <div class="text-right q-mt-sm">
              <q-btn
                unelevated dense no-caps size="sm"
                label="Infaq Program Ini" icon="volunteer_activism"
                color="primary" class="q-px-md"
                @click="openDialog(prog, 'infaq')"
              />
            </div>
          </q-card>
        </template>

        <!-- Program Wakaf dari API -->
        <template v-if="wakafPrograms.length">
          <div class="text-subtitle1 text-weight-bold q-mb-sm q-mt-lg" style="opacity: 0.9">
            <q-icon name="mosque" size="18px" class="q-mr-xs" />Program Wakaf
          </div>
          <q-card
            v-for="prog in wakafPrograms"
            :key="prog.id"
            flat class="rounded-xl bg-white text-dark q-pa-lg q-mb-md"
          >
            <!-- Header: kegiatan + kode + persen -->
            <div class="row items-start justify-between q-mb-xs">
              <div class="text-left">
                <div class="row items-center q-gutter-xs q-mb-xs">
                  <q-badge v-if="prog.kode" color="teal" :label="prog.kode" />
                  <q-badge v-if="prog.divisi" outline color="grey-6" :label="prog.divisi.nama" />
                </div>
                <span class="text-subtitle2 text-weight-bold text-teal">{{ prog.kegiatan }}</span>
              </div>
              <q-chip dense color="teal" text-color="white" size="sm" class="q-ml-sm">
                {{ progressPercent(prog) }}%
              </q-chip>
            </div>
            <q-linear-progress
              rounded size="12px"
              :value="progressValue(prog)"
              color="teal" track-color="grey-3"
              class="q-mb-sm"
            />
            <div class="row justify-between q-mt-xs">
              <span class="text-caption text-grey-6">Terkumpul: <strong>{{ formatCurrency(prog.terkumpul) }}</strong></span>
              <span class="text-caption text-grey-6">Target: {{ formatCurrency(prog.target) }}</span>
            </div>
            <div v-if="Number(prog.target) > Number(prog.terkumpul)" class="text-caption text-orange-8 q-mt-xs text-right">
              Sisa: {{ formatCurrency(Number(prog.target) - Number(prog.terkumpul)) }}
            </div>
            <div v-if="prog.deskripsi" class="text-caption text-grey-7 q-mt-xs text-left">{{ prog.deskripsi }}</div>
            <div class="text-right q-mt-sm">
              <q-btn
                unelevated dense no-caps size="sm"
                label="Wakaf Sekarang" icon="mosque"
                color="teal" class="q-px-md"
                @click="openDialog(prog, 'wakaf')"
              />
            </div>
          </q-card>
        </template>

        <!-- Fallback jika belum ada program -->
        <q-card v-if="!programs.length && !wakafPrograms.length" flat class="rounded-xl bg-white text-dark q-pa-lg">
          <q-icon name="info_outline" color="grey-5" size="32px" class="q-mb-sm" />
          <div class="text-subtitle2 text-grey-6">Belum ada program aktif saat ini.</div>
          <div class="text-caption text-grey-5 q-mt-xs">Silakan cek kembali nanti.</div>
        </q-card>
      </template>

      <!-- Dialog QRIS + Tatacara Transfer -->
      <q-dialog
        v-model="showDialog"
        position="bottom"
        transition-show="slide-up"
        transition-hide="slide-down"
      >
        <q-card class="qris-dialog-card">
          <!-- Header -->
          <q-card-section
            :class="dialogType === 'wakaf' ? 'bg-teal' : 'bg-primary'"
            class="text-white q-py-md"
          >
            <div class="row items-center no-wrap">
              <q-icon :name="dialogType === 'wakaf' ? 'mosque' : 'volunteer_activism'" size="24px" class="q-mr-sm" />
              <div class="col">
                <div class="text-subtitle1 text-weight-bold">
                  {{ dialogType === 'wakaf' ? 'Wakaf Sekarang' : 'Infaq Program Ini' }}
                </div>
                <div class="text-caption" style="opacity: 0.85">
                  {{ selectedProgram?.judul || selectedProgram?.kegiatan }}
                  <q-badge v-if="selectedProgram?.kode" outline color="white" :label="selectedProgram.kode" class="q-ml-xs" />
                </div>
              </div>
              <q-btn flat round icon="close" color="white" v-close-popup />
            </div>
          </q-card-section>

          <!-- Scrollable content -->
          <div class="qris-dialog-scroll">
            <div class="q-pa-md">

              <!-- QRIS -->
              <template v-if="qrisRekening">
                <div class="text-subtitle2 text-weight-bold q-mb-sm" :class="dialogType === 'wakaf' ? 'text-teal' : 'text-primary'">
                  <q-icon name="qr_code_2" class="q-mr-xs" />Scan QRIS
                </div>
                <div class="text-center q-mb-sm">
                  <img
                    :src="qrisRekening.qrisImage"
                    alt="QRIS"
                    class="qris-img qris-img--clickable"
                    title="Klik untuk memperbesar"
                    @click="openLightbox(qrisRekening.qrisImage, 'QRIS – Scan untuk bayar via semua e-wallet & m-banking')"
                  />
                  <div class="text-caption text-grey-6 q-mt-xs">Scan untuk bayar via semua e-wallet &amp; m-banking</div>
                </div>
                <q-separator class="q-my-md" />
              </template>

              <!-- Rekening Bank -->
              <template v-if="rekeningList.length">
                <div class="text-subtitle2 text-weight-bold q-mb-sm" :class="dialogType === 'wakaf' ? 'text-teal' : 'text-primary'">
                  <q-icon name="account_balance" class="q-mr-xs" />Transfer Bank
                </div>
                <q-card
                  v-for="rek in rekeningList"
                  :key="rek.id"
                  flat bordered class="rounded-xl q-mb-sm q-pa-sm"
                >
                  <div class="row items-center justify-between no-wrap">
                    <div class="col">
                      <div class="text-caption text-grey-6">{{ rek.namaBank }}</div>
                      <div class="text-body2 text-weight-bold">{{ rek.noRekening }}</div>
                      <div class="text-caption text-grey-7">a.n. {{ rek.atasNama }}</div>
                    </div>
                    <q-btn
                      flat dense no-caps icon="content_copy"
                      :label="copiedRek === rek.id ? '✓' : 'Salin'"
                      :color="copiedRek === rek.id ? 'positive' : 'primary'"
                      size="sm"
                      @click="copyNoRek(rek)"
                    />
                  </div>
                </q-card>
                <q-separator class="q-my-md" />
              </template>

              <!-- Tatacara Transfer -->
              <div class="text-subtitle2 text-weight-bold q-mb-sm" :class="dialogType === 'wakaf' ? 'text-teal' : 'text-primary'">
                <q-icon name="checklist" class="q-mr-xs" />Tatacara Transfer
              </div>
              <q-list dense class="q-mb-sm">
                <q-item v-for="(step, i) in transferSteps" :key="i" class="q-pl-none">
                  <q-item-section avatar style="min-width: 28px">
                    <q-avatar size="22px" :color="dialogType === 'wakaf' ? 'teal' : 'primary'" text-color="white" font-size="11px">
                      {{ i + 1 }}
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>
                      <span class="text-body2" style="line-height: 1.5" v-html="step" />
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>

            </div>
          </div>

          <!-- Tombol Konfirmasi -->
          <div class="q-pa-md q-pt-sm">
            <q-btn
              unelevated no-caps class="full-width"
              :color="dialogType === 'wakaf' ? 'teal' : 'primary'"
              icon="check_circle"
              label="Konfirmasi Transfer Saya"
              size="lg"
              style="border-radius: 10px; font-weight: 700"
              :to="confirmUrl"
              v-close-popup
            />
            <div class="text-caption text-grey-6 text-center q-mt-xs">
              Setelah transfer, klik tombol di atas untuk mengisi konfirmasi
            </div>
          </div>
        </q-card>
      </q-dialog>

      <!-- Catatan transparansi -->
      <div class="q-mt-xl text-caption text-center" style="opacity: 0.65; line-height: 1.7; max-width: 560px; margin: 0 auto">
        <q-icon name="info" size="14px" class="q-mr-xs" />
        Jumlah infaq/wakaf yang tertera di atas hanya mencakup infaq/wakaf yang telah dikonfirmasi melalui aplikasi website ini.
        Infaq/wakaf yang belum melakukan konfirmasi belum tercatat dalam total tersebut.
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { api } from 'src/boot/axios';
import { copyToClipboard } from 'quasar';
import { useLightbox } from 'src/composables/useLightbox';

const { open: openLightbox } = useLightbox();

const programs = ref([]);
const wakafPrograms = ref([]);
const rekeningList = ref([]);
const loading = ref(true);
const fetchError = ref(false);

// Dialog state
const showDialog = ref(false);
const selectedProgram = ref(null);
const dialogType = ref('infaq'); // 'infaq' | 'wakaf'
const copiedRek = ref(null);

const totalProgram = computed(() => programs.value.length + wakafPrograms.value.length);

const qrisRekening = computed(() =>
  rekeningList.value.find((r) => r.isActive && r.qrisImage) || null
);

const confirmUrl = computed(() => {
  if (!selectedProgram.value) return '/donasi';
  return `/donasi${selectedProgram.value.kode ? '?program=' + selectedProgram.value.kode : ''}`;
});

const transferSteps = computed(() => {
  const prog = selectedProgram.value;
  if (!prog) return [];
  const kode = prog.kode || '';
  const kodeNum = parseInt(kode, 10);
  const kodePad = kode ? String(kodeNum || kode).padStart(3, '0') : '';
  const nama = prog.judul || prog.kegiatan || 'Program';
  const jenisStr = dialogType.value === 'wakaf' ? 'Wakaf' : 'Infaq';
  const rekening = rekeningList.value.filter((r) => r.isActive);
  const rekeningText = rekening.length
    ? rekening.map((r) =>
        `<strong>${r.namaBank}</strong> nomor rekening <strong>${r.noRekening}</strong> a.n. <strong>${r.atasNama}</strong>`
      ).join(' atau ')
    : 'rekening yang tertera';

  const fmt = (v) => new Intl.NumberFormat('id-ID').format(v);
  const kodeStep = kode && !isNaN(kodeNum)
    ? `<strong>Tambahkan kode program ${kodePad} pada nominal transfer</strong> sebagai penanda ${jenisStr} ${nama}. Contoh:<ul style="margin:6px 0 4px 4px;padding-left:18px;line-height:1.8">${
        [10000, 25000, 50000, 100000]
          .map((n) => `<li>Donasi Rp${fmt(n)} → Transfer <strong>Rp${fmt(n + kodeNum)}</strong></li>`)
          .join('')
      }</ul><em style="font-size:11px;color:#888">Tiga digit terakhir, yaitu <strong>${kodePad}</strong>, merupakan kode program ${nama} agar donasi Anda dapat diidentifikasi.</em>`
    : `Tuliskan keterangan <strong>${nama}</strong> pada kolom berita/catatan transfer.`;

  return [
    `Transfer ke ${rekeningText}, atau scan QRIS yang tersedia di atas.`,
    `Tentukan nominal donasi sesuai kemampuan Anda. Tidak ada batasan minimum donasi.`,
    kodeStep,
    `Simpan <strong>bukti transfer</strong> berupa screenshot atau struk transaksi untuk keperluan konfirmasi.`,
    `Klik tombol <strong>"Konfirmasi Transfer Saya"</strong> di bawah, kemudian isi formulir konfirmasi agar donasi Anda tercatat dengan benar.<br><br><em style="font-size:12px;color:#666"><strong>Jazakumullahu khairan</strong> atas partisipasi dan kepedulian Anda dalam mendukung program ${jenisStr} | ${nama} Masjid Imam Asy Syafi'i.</em>`,
  ];
});

const formatCurrency = (val) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

const progressValue = (prog) =>
  prog.target > 0 ? Math.min(Number(prog.terkumpul) / Number(prog.target), 1) : 0;

const progressPercent = (prog) =>
  prog.target > 0 ? Math.min(Math.round((Number(prog.terkumpul) / Number(prog.target)) * 100), 100) : 0;

function openDialog(prog, type) {
  selectedProgram.value = prog;
  dialogType.value = type;
  showDialog.value = true;
}

async function copyNoRek(rek) {
  await copyToClipboard(rek.noRekening);
  copiedRek.value = rek.id;
  setTimeout(() => { copiedRek.value = null; }, 2000);
}

onMounted(async () => {
  try {
    const [donasiRes, wakafRes, rekRes] = await Promise.all([
      api.get('/donasi/program'),
      api.get('/donasi/wakaf'),
      api.get('/donasi/rekening'),
    ]);
    programs.value = donasiRes.data.data;
    wakafPrograms.value = wakafRes.data.data;
    rekeningList.value = rekRes.data.data;
  } catch {
    fetchError.value = true;
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.donasi-section {
  background: linear-gradient(135deg, #1B7A4A 0%, #D4AF37 100%);
  padding: 80px 0;
}

.qris-dialog-card {
  width: 100%;
  max-width: 520px;
  border-radius: 16px 16px 0 0;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.qris-dialog-scroll {
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.qris-img {
  display: block;
  width: 220px;
  height: 220px;
  object-fit: contain;
  margin: 0 auto;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
}

.qris-img--clickable {
  cursor: zoom-in;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.qris-img--clickable:hover {
  transform: scale(1.04);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.18);
}
</style>

