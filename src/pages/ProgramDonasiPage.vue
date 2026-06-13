<template>
  <q-page class="q-pb-xl">
    <!-- Hero -->
    <div class="page-hero text-center text-white">
      <div class="hero-content q-px-md">
        <q-icon name="volunteer_activism" size="64px" class="q-mb-md hero-icon" />
        <h1 class="text-h3 text-weight-bold q-mb-sm">Program Infaq</h1>
        <p class="text-body1 opacity-90 q-mb-lg" style="max-width:600px;margin:0 auto">
          "Perumpamaan orang yang menginfakkan hartanya di jalan Allah seperti biji yang menumbuhkan tujuh tangkai, pada setiap tangkai ada seratus biji."
        </p>
        <div class="text-caption opacity-75">— QS. Al-Baqarah: 261</div>
      </div>
    </div>

    <!-- Stats Bar -->
    <div class="stats-bar">
      <div class="row justify-center q-gutter-md" style="max-width:900px;margin:0 auto">
        <div class="stat-chip">
          <q-icon name="list_alt" color="primary" size="20px" class="q-mr-sm" />
          <div>
            <div class="stat-value text-primary">{{ donasiStore.programList.length }} Program</div>
            <div class="stat-label">Aktif</div>
          </div>
        </div>
        <div class="stat-chip">
          <q-icon name="volunteer_activism" color="green-7" size="20px" class="q-mr-sm" />
          <div>
            <div class="stat-value text-green-7">{{ formatCurrency(totalTerkumpul) }}</div>
            <div class="stat-label">Total Terkumpul</div>
          </div>
        </div>
      </div>
    </div>

    <div class="q-px-md" style="max-width:1100px;margin:0 auto">

      <!-- ── Program Cards ──────────────────────────────────────────── -->
      <div class="q-mb-xl">
        <div class="section-title q-mb-lg">
          <q-icon name="list_alt" color="primary" size="28px" class="q-mr-sm" />
          <span>Daftar Program Infaq</span>
        </div>

        <div v-if="donasiStore.loading" class="row q-col-gutter-md">
          <div v-for="n in 4" :key="n" class="col-12 col-sm-6 col-md-4">
            <q-skeleton height="180px" class="rounded-xl" />
          </div>
        </div>

        <div v-else-if="!donasiStore.programList.length" class="text-center q-py-xl text-grey-5">
          <q-icon name="inbox" size="80px" />
          <div class="text-h6 q-mt-md">Belum ada program infaq aktif</div>
        </div>

        <div v-else class="row q-col-gutter-md">
          <div
            v-for="prog in sortedProgramList"
            :key="prog.id"
            class="col-12 col-sm-6 col-md-4"
          >
            <q-card flat bordered class="rounded-xl program-card full-height">
              <q-card-section class="q-pb-sm">
                <div class="row items-center justify-between q-mb-sm">
                  <q-badge
                    v-if="prog.kode"
                    color="primary"
                    :label="'[' + prog.kode + ']'"
                    class="text-weight-bold"
                  />
                  <q-badge
                    v-if="prog.divisi"
                    :color="divisiColor(prog.divisi?.nama)"
                    :label="prog.divisi?.nama"
                    outline
                  />
                </div>
                <div class="text-subtitle1 text-weight-bold q-mb-xs">{{ prog.judul }}</div>
                <div v-if="prog.deskripsi" class="text-caption text-grey-6 prog-desc">
                  {{ prog.deskripsi }}
                </div>
              </q-card-section>

              <q-card-section class="q-pt-none">
                <div class="row justify-between text-caption text-grey-7 q-mb-xs">
                  <span>Terkumpul</span>
                  <span class="text-weight-bold text-green-7">
                    {{ persen(prog) }}%
                  </span>
                </div>
                <q-linear-progress
                  rounded
                  size="8px"
                  :value="progressVal(prog)"
                  color="green-6"
                  track-color="grey-3"
                  class="q-mb-sm"
                />
                <div class="row justify-between text-caption">
                  <span class="text-green-7 text-weight-medium">{{ formatCurrency(prog.terkumpul) }}</span>
                  <span class="text-grey-6">dari {{ formatCurrency(prog.target) }}</span>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <!-- ── Cara Berinfaq ─────────────────────────────────────────── -->
      <div class="q-mb-xl">
        <div class="section-title q-mb-lg">
          <q-icon name="format_list_numbered" color="primary" size="28px" class="q-mr-sm" />
          <span>Cara Berinfaq</span>
        </div>

        <div class="row q-col-gutter-md">
          <div v-for="step in steps" :key="step.no" class="col-12 col-sm-6 col-md-3">
            <q-card flat bordered class="rounded-xl step-card text-center q-pa-md full-height">
              <div class="step-number q-mx-auto q-mb-md">{{ step.no }}</div>
              <q-icon :name="step.icon" :color="step.color" size="36px" class="q-mb-sm" />
              <div class="text-subtitle2 text-weight-bold q-mb-xs">{{ step.title }}</div>
              <div class="text-caption text-grey-6">{{ step.desc }}</div>
            </q-card>
          </div>
        </div>
      </div>

      <!-- ── Rekening & QRIS ────────────────────────────────────────── -->
      <div class="q-mb-xl">
        <div class="section-title q-mb-lg">
          <q-icon name="account_balance" color="primary" size="28px" class="q-mr-sm" />
          <span>Cara Transfer &amp; Rekening Infaq</span>
        </div>

        <div class="row q-col-gutter-lg">
          <!-- Kiri: Rekening cards stacked -->
          <div class="col-12 col-md-7">
            <div class="row q-col-gutter-md">
              <div
                v-for="rek in donasiStore.rekeningList"
                :key="rek.id"
                class="col-12"
              >
                <q-card flat class="rounded-xl rek-card">
                  <q-card-section class="q-pa-lg">
                    <div class="row items-center no-wrap q-mb-md">
                      <q-avatar color="primary" text-color="white" size="44px" class="q-mr-md">
                        <q-icon name="account_balance" size="24px" />
                      </q-avatar>
                      <div>
                        <div class="text-weight-bold text-subtitle1 text-primary">{{ rek.namaBank }}</div>
                        <div v-if="rek.keterangan" class="text-caption text-grey-5">{{ rek.keterangan }}</div>
                      </div>
                    </div>

                    <div class="rek-number q-mb-xs">{{ rek.noRekening }}</div>
                    <div class="text-caption text-grey-6 q-mb-md">a.n. <span class="text-weight-medium text-grey-8">{{ rek.atasNama }}</span></div>

                    <q-btn
                      unelevated no-caps
                      :icon="copied === rek.id ? 'check' : 'content_copy'"
                      :label="copied === rek.id ? 'Tersalin!' : 'Salin Nomor'"
                      :color="copied === rek.id ? 'positive' : 'primary'"
                      size="sm"
                      style="border-radius:8px"
                      @click="copyRekening(rek)"
                    />
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <!-- Info penting di bawah rekening -->
            <q-card flat class="rounded-xl info-box q-mt-md">
              <q-card-section class="q-pa-md">
                <div class="text-caption text-weight-bold text-primary q-mb-sm">
                  <q-icon name="lightbulb" class="q-mr-xs" />Tips Berinfaq
                </div>
                <div class="row q-col-gutter-sm">
                  <div v-for="info in infos" :key="info" class="col-12 col-sm-6">
                    <div class="row items-start no-wrap">
                      <q-icon name="check_circle" color="green-6" size="14px" class="q-mt-xs q-mr-xs" style="flex-shrink:0" />
                      <span class="text-caption text-grey-7">{{ info }}</span>
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Kanan: QRIS -->
          <div class="col-12 col-md-5">
            <q-card flat class="rounded-xl qris-card full-height text-center">
              <q-card-section class="q-pa-lg">
                <div class="text-subtitle1 text-weight-bold q-mb-xs">
                  <q-icon name="qr_code_2" color="primary" size="22px" class="q-mr-xs" />QRIS
                </div>
                <div class="text-caption text-grey-5 q-mb-lg">Scan &amp; bayar dari aplikasi manapun</div>

                <div class="qris-frame q-mx-auto q-mb-md">
                  <template v-if="qrisRekening">
                    <q-img
                      :src="qrisRekening.qrisImage"
                      fit="contain"
                      style="width:100%;height:100%"
                    />
                  </template>
                  <template v-else>
                    <q-icon name="qr_code_2" size="100px" color="grey-4" />
                    <div class="text-caption text-grey-4 q-mt-xs">Segera tersedia</div>
                  </template>
                </div>

                <div class="row justify-center q-gutter-xs q-mb-md">
                  <q-chip dense color="green-1" text-color="green-8" icon="check" size="sm">GoPay</q-chip>
                  <q-chip dense color="purple-1" text-color="purple-8" icon="check" size="sm">OVO</q-chip>
                  <q-chip dense color="blue-1" text-color="blue-8" icon="check" size="sm">Dana</q-chip>
                  <q-chip dense color="teal-1" text-color="teal-8" icon="check" size="sm">BSI Mobile</q-chip>
                  <q-chip dense color="orange-1" text-color="orange-8" icon="check" size="sm">+ lainnya</q-chip>
                </div>

                <div class="text-caption text-grey-5">Berlaku untuk semua bank &amp; e-wallet</div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <!-- ── CTA ────────────────────────────────────────────────────── -->
      <div class="text-center q-py-lg">
        <div class="text-h6 text-weight-bold q-mb-sm">Sudah Transfer?</div>
        <div class="text-body2 text-grey-6 q-mb-lg">Konfirmasikan transfer Anda agar segera kami verifikasi</div>
        <q-btn
          unelevated
          color="primary"
          no-caps
          icon="volunteer_activism"
          label="Konfirmasi Infaq Sekarang"
          to="/donasi"
          size="lg"
          class="rounded-btn"
        />
      </div>

    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useDonasiStore } from 'src/stores/donasi';
import { copyToClipboard } from 'quasar';

const donasiStore = useDonasiStore();
const copied = ref(null);

onMounted(() => {
  donasiStore.fetchActiveProgram();
  donasiStore.fetchRekening();
});

const totalTerkumpul = computed(() =>
  donasiStore.programList.reduce((s, p) => s + Number(p.terkumpul || 0), 0)
);

const sortedProgramList = computed(() =>
  [...donasiStore.programList].sort((a, b) => {
    const ka = a.kode ?? '';
    const kb = b.kode ?? '';
    // numeric sort if both are numeric strings, otherwise lexicographic
    const na = Number(ka);
    const nb = Number(kb);
    if (!isNaN(na) && !isNaN(nb)) return na - nb;
    return ka.localeCompare(kb);
  })
);

const progressVal = (prog) => {
  if (!prog.target || Number(prog.target) === 0) return 0;
  return Math.min(Number(prog.terkumpul) / Number(prog.target), 1);
};

const persen = (prog) => {
  if (!prog.target || Number(prog.target) === 0) return 0;
  return Math.min(Math.round((Number(prog.terkumpul) / Number(prog.target)) * 100), 100);
};

const formatCurrency = (val) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);

const divisiColorMap = {
  Sosial: 'red-7', Pendidikan: 'blue-7', Usaha: 'amber-8',
  Multimedia: 'purple-7', Operasional: 'grey-7', Wakaf: 'teal-7', Dakwah: 'green-7',
};
const divisiColor = (nama) => divisiColorMap[nama] || 'grey-6';

const copyRekening = (rek) => {
  copyToClipboard(rek.noRekening).then(() => {
    copied.value = rek.id;
    setTimeout(() => { copied.value = null; }, 2500);
  });
};

const qrisRekening = computed(() =>
  donasiStore.rekeningList.find((r) => r.qrisImage) || null
);

const steps = [
  { no: 1, icon: 'search', color: 'primary', title: 'Pilih Program', desc: 'Pilih program infaq yang ingin Anda dukung dari daftar di atas.' },
  { no: 2, icon: 'account_balance', color: 'green-7', title: 'Transfer Dana', desc: 'Silakan transfer ke rekening masjid imam asy syafii depok yang tertera dengan menambahkan kode unik/program pada nominal transfer agar infaq Anda tercatat dan tersalurkan ke program yang sesuai. Contoh: Rp1.000.004 (kode program: 004).' },
  { no: 3, icon: 'camera_alt', color: 'orange-7', title: 'Simpan Bukti', desc: 'Simpan screenshot/foto bukti transfer sebagai referensi konfirmasi.' },
  { no: 4, icon: 'check_circle', color: 'teal-7', title: 'Konfirmasi', desc: 'Buka halaman Konfirmasi Infaq, isi form dan unggah bukti transfer Anda.' },
];

const infos = [
  'Infaq dapat disalurkan ke program manapun sesuai niat Anda',
  'Konfirmasi wajib dilakukan agar infaq segera diverifikasi',
  'Tidak ada minimum nominal infaq',
  'QRIS tersedia untuk transfer via GoPay, OVO, Dana, BSI Mobile, dll',
  'Infaq akan dilaporkan secara transparan setiap bulan',
  'Hubungi kami via WhatsApp jika ada kendala',
];
</script>

<style scoped>
.page-hero {
  background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #388E3C 100%);
  padding: 80px 24px 60px;
}
.hero-icon { filter: drop-shadow(0 4px 12px rgba(0,0,0,0.3)); }
.stats-bar {
  background: #f9fbe7;
  border-bottom: 1px solid #dcedc8;
  padding: 14px 24px;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(46,125,50,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}
.stat-chip {
  display: flex;
  align-items: center;
  background: #fff;
  border: 1px solid #c8e6c9;
  border-radius: 40px;
  padding: 8px 20px;
  box-shadow: 0 1px 4px rgba(46,125,50,0.08);
}
.stat-value {
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.2;
}
.stat-label {
  font-size: 0.7rem;
  color: #888;
  line-height: 1.2;
}
.section-title {
  display: flex;
  align-items: center;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
  padding-top: 40px;
}
.program-card {
  transition: box-shadow 0.2s, transform 0.2s;
}
.program-card:hover {
  box-shadow: 0 8px 24px rgba(46,125,50,0.12);
  transform: translateY(-2px);
}
.prog-desc {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.step-card { border-top: 4px solid #1976D2 !important; }
.step-number {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #1976D2;
  color: #fff;
  font-weight: 700;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.rekening-card { border-left: 4px solid #1976D2 !important; }
.rek-card {
  background: linear-gradient(135deg, #e3f2fd 0%, #ffffff 60%);
  border: 1px solid #bbdefb;
}
.rek-number {
  font-size: 1.6rem;
  font-weight: 800;
  letter-spacing: 0.15em;
  color: #0d47a1;
  font-family: monospace;
}
.qris-card {
  background: linear-gradient(160deg, #f1f8e9 0%, #ffffff 60%);
  border: 1px solid #c8e6c9;
}
.qris-frame {
  width: 220px;
  height: 220px;
  border: 2px dashed #a5d6a7;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fff;
  overflow: hidden;
}
.info-box { background: #f0f7ff !important; border: 1px solid #bbdefb !important; }
.letter-spacing-lg { letter-spacing: 0.1em; }
.rounded-btn { border-radius: 12px; }
.rounded-xl { border-radius: 16px !important; }
</style>
