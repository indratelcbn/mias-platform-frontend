<template>
  <q-page class="q-pb-xl murojaah-page">
    <q-inner-loading :showing="loading"><q-spinner-dots size="40px" color="primary" /></q-inner-loading>

    <div v-if="!loading && !kajian" class="text-center text-grey-6 q-py-xl">
      <q-icon name="search_off" size="56px" class="q-mb-sm" />
      <div>Kajian Muroja'ah tidak ditemukan atau belum dipublikasikan.</div>
      <q-btn flat color="primary" no-caps label="Kembali" :to="{ name: 'murojaah' }" class="q-mt-md" />
    </div>

    <div v-if="kajian" class="container-narrow">
      <!-- ── Info Card ────────────────────────────────────────────────── -->
      <q-card flat bordered class="rounded-xl q-mb-md">
        <q-card-section>
          <div class="text-center">
            <div class="text-h5 text-weight-bold text-primary">Muroja'ah Kajian</div>
            <div class="text-subtitle2 text-primary q-mb-md">di Masjid Imam Asy-Syafi'i - Depok</div>
          </div>
          <div class="info-lines">
            <div v-if="kajian.kitab"><b>Kitab:</b> {{ kajian.kitab }}</div>
            <div><b>Pemateri:</b> {{ kajian.ustadz }}</div>
            <div v-if="kajian.tanggal"><b>Hari/Tanggal:</b> {{ formatDate(kajian.tanggal) }}</div>
            <div v-if="kajian.waktu"><b>Waktu:</b> {{ kajian.waktu }}</div>
            <div><b>Muroja'ah:</b> {{ kajian.sesi.length }} Sesi</div>
          </div>

          <div v-if="kajian.ringkasan" class="scope-box q-mt-md">
            <div class="scope-title">Materi Muroja'ah</div>
            <div style="white-space:pre-line">{{ kajian.ringkasan }}</div>
          </div>

          <!-- YouTube -->
          <div v-if="kajian.youtubeId" class="youtube-box q-mt-md" @click="openYoutube">
            <img :src="`https://img.youtube.com/vi/${kajian.youtubeId}/hqdefault.jpg`" :alt="kajian.judul" />
            <div class="play-btn"><span>▶</span></div>
          </div>
        </q-card-section>
      </q-card>

      <!-- ── Tabs ─────────────────────────────────────────────────────── -->
      <q-card flat bordered class="rounded-xl">
        <q-tabs v-model="activeTab" dense inline-label class="bg-primary text-white" align="justify" narrow-indicator>
          <q-tab v-for="s in kajian.sesi" :key="s.id" :name="s.id" :disable="s.locked" no-caps>
            <div class="row items-center no-wrap">
              <q-icon v-if="s.locked" name="lock" size="16px" class="q-mr-xs" />
              <span>{{ s.judul }}</span>
            </div>
            <q-tooltip v-if="s.locked">Dibuka {{ formatDateTime(s.jadwalBuka) }}</q-tooltip>
          </q-tab>
          <q-tab name="__peringkat" icon="leaderboard" label="Nilai &amp; Peringkat" no-caps @click="loadLeaderboard" />
        </q-tabs>
        <q-separator />

        <q-tab-panels v-model="activeTab" animated>
          <!-- Per-sesi panel -->
          <q-tab-panel v-for="s in kajian.sesi" :key="s.id" :name="s.id" class="q-pa-md">
            <q-banner v-if="s.locked" dense rounded class="bg-orange-1 text-orange-9">
              <template #avatar><q-icon name="lock_clock" /></template>
              Sesi ini akan dibuka pada {{ formatDateTime(s.jadwalBuka) }}.
            </q-banner>

            <template v-else>
              <!-- Baca Materi -->
              <div v-if="s.materi.length">
                <q-btn :icon="openMateri[s.id] ? 'menu_book' : 'auto_stories'" no-caps color="primary" :label="openMateri[s.id] ? 'Sembunyikan Materi' : 'Baca Materi'" @click="toggleMateri(s.id)" unelevated />
                <q-slide-transition>
                  <div v-show="openMateri[s.id]" class="q-mt-md">
                    <div v-for="m in s.materi" :key="m.id" class="materi-block">
                      <div v-if="m.judul" class="text-h6 text-primary">{{ m.judul }}</div>
                      <div v-if="m.halaman" class="text-caption text-grey-6">Halaman {{ m.halaman }}</div>
                      <div v-if="m.teksArab" class="arabic">{{ m.teksArab }}</div>
                      <div v-if="m.terjemah" class="translation">{{ m.terjemah }}</div>
                      <div v-if="m.pdfFile" class="q-mt-sm pdf-wrap">
                        <iframe :src="pdfViewUrl(m.pdfFile)" class="pdf-frame" title="Materi PDF" loading="lazy"></iframe>
                      </div>
                    </div>
                  </div>
                </q-slide-transition>
                <q-separator class="q-my-md" />
              </div>

              <!-- Quiz -->
              <div class="text-h6 text-primary q-mb-sm">Soal Jawab — {{ s.judul }}</div>

              <div v-if="!s.soal.length" class="text-grey-6">Belum ada soal pada sesi ini.</div>

              <template v-else>
                <!-- Result view -->
                <div v-if="results[s.id]">
                  <q-banner rounded class="bg-green-1 q-mb-md">
                    <div><b>Nama:</b> {{ results[s.id].namaLengkap }}</div>
                    <div class="text-h5 text-primary text-weight-bold">Nilai: {{ results[s.id].score }}/100</div>
                    <div class="text-caption">Benar {{ results[s.id].benar }} · Salah {{ results[s.id].salah }} dari {{ results[s.id].totalSoal }} soal</div>
                    <div v-if="results[s.id].attempt > 1" class="text-caption text-primary q-mt-xs">
                      <q-icon name="replay" size="14px" /> Pengerjaan ke-{{ results[s.id].attempt }}
                    </div>
                  </q-banner>
                  <div v-for="(d, i) in results[s.id].detail" :key="d.soalId" :class="d.benar ? 'result-item correct' : 'result-item wrong'">
                    <div class="text-weight-bold">Soal {{ i + 1 }}: {{ d.benar ? 'Benar ✓' : 'Salah ✗' }}</div>
                    <div>{{ d.teks }}</div>
                    <div class="q-mt-xs">Jawaban Anda: <b>{{ d.jawabanPeserta === '-' ? 'Tidak dijawab' : d.jawabanPeserta }}</b></div>
                    <div>Jawaban benar: <b>{{ d.kunciJawaban }}. {{ d.kunciTeks }}</b></div>
                    <div v-if="d.pembahasan" class="text-caption text-grey-8 q-mt-xs"><b>Pembahasan:</b> {{ d.pembahasan }}</div>
                  </div>
                  <q-btn-dropdown unelevated no-caps color="primary" icon="share" label="Bagikan Hasil" class="q-mt-sm">
                    <q-list>
                      <q-item v-if="canNativeShare" clickable v-close-popup @click="shareResult('native', s)">
                        <q-item-section avatar><q-icon name="ios_share" color="primary" /></q-item-section>
                        <q-item-section>Bagikan ke aplikasi…</q-item-section>
                      </q-item>
                      <q-item clickable v-close-popup @click="shareResult('whatsapp', s)">
                        <q-item-section avatar><q-icon name="fab fa-whatsapp" color="green" /></q-item-section>
                        <q-item-section>WhatsApp</q-item-section>
                      </q-item>
                      <q-item clickable v-close-popup @click="shareResult('telegram', s)">
                        <q-item-section avatar><q-icon name="fab fa-telegram" color="light-blue" /></q-item-section>
                        <q-item-section>Telegram</q-item-section>
                      </q-item>
                      <q-item clickable v-close-popup @click="shareResult('copy', s)">
                        <q-item-section avatar><q-icon name="content_copy" color="grey-8" /></q-item-section>
                        <q-item-section>Salin Teks</q-item-section>
                      </q-item>
                    </q-list>
                  </q-btn-dropdown>
                </div>

                <!-- Form view -->
                <q-form v-else @submit.prevent="submitSesi(s)">
                  <q-banner dense rounded class="bg-green-1 text-green-9 q-mb-md">
                    <template #avatar><q-icon name="person" /></template>
                    Peserta: <b>{{ identity.namaLengkap || '—' }}</b> · {{ maskWa(identity.whatsapp) }}
                    <template #action>
                      <q-btn flat dense no-caps size="sm" color="primary" icon="edit" label="Ganti" @click="openIdentity" />
                    </template>
                  </q-banner>

                  <div v-for="(q, qi) in s.soal" :key="q.id" class="question-block">
                    <div class="text-weight-medium q-mb-xs">{{ qi + 1 }}. {{ q.teks }}</div>
                    <q-option-group
                      v-model="forms[s.id].answers[q.id]"
                      :options="[
                        { label: `A. ${q.pilihanA}`, value: 'A' },
                        { label: `B. ${q.pilihanB}`, value: 'B' },
                        { label: `C. ${q.pilihanC}`, value: 'C' },
                        { label: `D. ${q.pilihanD}`, value: 'D' },
                      ]"
                      color="primary"
                    />
                  </div>

                  <q-btn type="submit" unelevated color="primary" no-caps icon="task_alt" label="Selesai &amp; Lihat Nilai" :loading="submitting" class="q-mt-md" />
                </q-form>
              </template>
            </template>
          </q-tab-panel>

          <!-- Leaderboard panel -->
          <q-tab-panel name="__peringkat" class="q-pa-md">
            <div class="text-h6 text-primary q-mb-xs">Nilai &amp; Peringkat</div>
            <div class="text-caption text-grey-7 q-mb-md">Nomor WhatsApp tidak ditampilkan lengkap. Peringkat mencakup seluruh sesi Muroja'ah yang dipublikasikan.</div>
            <q-input v-model="rankSearch" outlined dense clearable placeholder="Cari nama peserta…" class="q-mb-md">
              <template #prepend><q-icon name="search" /></template>
            </q-input>

            <q-inner-loading :showing="loadingLb"><q-spinner-dots color="primary" /></q-inner-loading>

            <template v-if="leaderboard">
              <q-expansion-item default-opened icon="emoji_events" label="Peringkat Seluruh Sesi Muroja'ah" header-class="text-weight-bold text-primary">
                <q-markup-table flat dense>
                  <thead><tr><th class="text-left">#</th><th class="text-left">Nama</th><th class="text-right">Rata-rata</th><th class="text-right">Sesi</th></tr></thead>
                  <tbody>
                    <tr v-for="r in filterRows(leaderboard.overall)" :key="r.peringkat">
                      <td class="text-left">{{ r.peringkat }}</td><td class="text-left">{{ r.namaTampil }}</td>
                      <td class="text-right">{{ r.nilaiRata }}</td><td class="text-right">{{ r.jumlahSesi }}</td>
                    </tr>
                    <tr v-if="!filterRows(leaderboard.overall).length"><td colspan="4" class="text-center text-grey-6">Belum ada data.</td></tr>
                  </tbody>
                </q-markup-table>
              </q-expansion-item>

              <q-expansion-item v-for="(g, gi) in leaderboard.perSesi" :key="gi" icon="list_alt" :label="`${g.kajianNama} — ${g.sesiNama}`" header-class="text-weight-medium">
                <q-markup-table flat dense>
                  <thead><tr><th class="text-left">#</th><th class="text-left">Nama</th><th class="text-right">Nilai</th></tr></thead>
                  <tbody>
                    <tr v-for="r in filterRows(g.data)" :key="r.peringkat">
                      <td class="text-left">{{ r.peringkat }}</td><td class="text-left">{{ r.namaTampil }}</td><td class="text-right">{{ r.nilai }}</td>
                    </tr>
                    <tr v-if="!filterRows(g.data).length"><td colspan="3" class="text-center text-grey-6">Belum ada peserta.</td></tr>
                  </tbody>
                </q-markup-table>
              </q-expansion-item>
            </template>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </div>

    <!-- ── Dialog Identitas Peserta (syarat mengikuti Muroja'ah) ───────────── -->
    <q-dialog v-model="identityDialog" persistent no-backdrop-dismiss no-esc-dismiss>
      <q-card style="min-width:320px; max-width:440px; width:92vw" class="rounded-xl">
        <q-card-section class="bg-primary text-white rounded-top">
          <div class="text-h6"><q-icon name="how_to_reg" class="q-mr-sm" />Identitas Peserta</div>
          <div class="text-caption opacity-80">Isi nama dan nomor WhatsApp untuk mengikuti Muroja'ah.</div>
        </q-card-section>
        <q-card-section>
          <q-form @submit.prevent="confirmIdentity" class="q-gutter-md">
            <q-input
              :model-value="identityForm.namaLengkap"
              @update:model-value="v => identityForm.namaLengkap = sanitizeNama(v)"
              outlined label="Nama Peserta *" maxlength="50" counter autofocus
              hint="Nama bebas (boleh kuniyah/samaran). Hanya huruf & spasi."
              :rules="[v => (v && v.trim().length >= 2) || 'Nama minimal 2 huruf']"
            >
              <template #prepend><q-icon name="person" /></template>
            </q-input>
            <q-input
              :model-value="identityForm.whatsapp"
              @update:model-value="v => identityForm.whatsapp = sanitizeWa(v)"
              outlined label="Nomor WhatsApp *" type="tel" inputmode="numeric" maxlength="15" counter
              placeholder="0812xxxxxxx"
              hint="Hanya angka. Tidak ditampilkan lengkap pada peringkat."
              :rules="[v => (v && v.length >= 9) || 'Nomor WhatsApp minimal 9 digit']"
            >
              <template #prepend><q-icon name="call" /></template>
            </q-input>
            <div class="row justify-end q-gutter-sm">
              <q-btn type="button" flat no-caps color="grey-8" label="Batal" @click="identityDialog = false" />
              <q-btn type="submit" unelevated color="primary" no-caps icon="check" label="Mulai Muroja'ah" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { useMurojaahStore } from 'src/stores/murojaah';

const route = useRoute();
const $q = useQuasar();
const store = useMurojaahStore();

const kajian = ref(null);
const loading = ref(true);
const activeTab = ref('');
const openMateri = reactive({});
const forms = reactive({});
const results = reactive({});
const submitting = ref(false);

// Identitas peserta (dikumpulkan sekali via dialog sebagai syarat)
const identity = reactive({ namaLengkap: '', whatsapp: '' });
const identityForm = reactive({ namaLengkap: '', whatsapp: '' });
const identityDialog = ref(false);

const leaderboard = ref(null);
const loadingLb = ref(false);
const rankSearch = ref('');

const formatDate = (d) => new Date(d).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const formatDateTime = (d) => new Date(d).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const openYoutube = () => { if (kajian.value?.youtubeUrl) window.open(kajian.value.youtubeUrl, '_blank'); };
const toggleMateri = (sid) => { openMateri[sid] = !openMateri[sid]; };
const pdfViewUrl = (p) => (p ? `${p}#view=FitH&toolbar=1` : '');
const maskWa = (wa) => {
  const s = String(wa || '');
  if (s.length <= 4) return '••••';
  return s.slice(0, 3) + '••••' + s.slice(-2);
};

// Nama: hanya huruf (termasuk unicode), spasi, dan ' . - ; maksimal 50 karakter.
const sanitizeNama = (val) => String(val || '').replace(/[^\p{L}\s'.-]/gu, '').replace(/\s{2,}/g, ' ').slice(0, 50);
// WhatsApp: hanya angka, maksimal 15 digit.
const sanitizeWa = (val) => String(val || '').replace(/\D/g, '').slice(0, 15);

const openIdentity = () => {
  identityForm.namaLengkap = identity.namaLengkap;
  identityForm.whatsapp = identity.whatsapp;
  identityDialog.value = true;
};

const confirmIdentity = () => {
  const nama = sanitizeNama(identityForm.namaLengkap).trim();
  const wa = sanitizeWa(identityForm.whatsapp);
  if (nama.length < 2 || wa.length < 9) return;
  identity.namaLengkap = nama;
  identity.whatsapp = wa;
  identityDialog.value = false;
};

const filterRows = (rows) => {
  const q = (rankSearch.value || '').trim().toLowerCase();
  if (!q) return rows;
  return rows.filter((r) => String(r.namaTampil || '').toLowerCase().includes(q));
};

const submitSesi = async (s) => {
  const nama = (identity.namaLengkap || '').trim();
  const waDigits = (identity.whatsapp || '').replace(/\D/g, '');
  if (nama.length < 2 || waDigits.length < 9) { openIdentity(); return; }

  submitting.value = true;
  const res = await store.publicSubmit(s.id, { namaLengkap: nama, whatsapp: waDigits, jawaban: forms[s.id].answers });
  submitting.value = false;

  if (res.ok) {
    results[s.id] = res.data;
  } else {
    $q.notify({ type: 'negative', message: res.message });
  }
};

const loadLeaderboard = async () => {
  loadingLb.value = true;
  leaderboard.value = await store.publicLeaderboard(route.params.slug);
  loadingLb.value = false;
};

// ── Bagikan Hasil Muroja'ah ─────────────────────────────────────────────────
const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

const buildShareText = (s) => {
  const r = results[s.id];
  if (!r) return '';
  const lines = [
    `📖 Hasil Muroja'ah — ${kajian.value?.judul || ''}`,
    `🗂️ Sesi: ${s.judul}`,
    `👤 Nama: ${r.namaLengkap}`,
    `✅ Nilai: ${r.score}/100 (Benar ${r.benar}, Salah ${r.salah} dari ${r.totalSoal} soal)`,
    '',
    `Ikut Muroja'ah di Masjid Imam Asy-Syafi'i Depok:`,
    window.location.href,
  ];
  return lines.join('\n');
};

const shareResult = async (channel, s) => {
  const text = buildShareText(s);
  const url = window.location.href;
  if (channel === 'native' && canNativeShare) {
    try { await navigator.share({ title: "Hasil Muroja'ah", text, url }); } catch { /* dibatalkan */ }
    return;
  }
  if (channel === 'whatsapp') {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    return;
  }
  if (channel === 'telegram') {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
    return;
  }
  if (channel === 'copy') {
    try {
      await navigator.clipboard.writeText(text);
      $q.notify({ type: 'positive', message: 'Hasil disalin ke clipboard.' });
    } catch {
      $q.notify({ type: 'negative', message: 'Gagal menyalin. Salin manual dari layar.' });
    }
  }
};

onMounted(async () => {
  const data = await store.publicDetail(route.params.slug);
  if (data) {
    kajian.value = data;
    data.sesi.forEach((s) => {
      openMateri[s.id] = false;
      forms[s.id] = { answers: {} };
    });
    const firstOpen = data.sesi.find((s) => !s.locked);
    activeTab.value = firstOpen ? firstOpen.id : (data.sesi[0]?.id || '__peringkat');
    // Tampilkan dialog identitas sebagai syarat mengikuti Muroja'ah
    openIdentity();
  }
  loading.value = false;
});
</script>

<style scoped>
.container-narrow { max-width: 780px; margin: 0 auto; padding: 24px 12px 0; }
/* Beri ruang ekstra di atas agar judul tidak tertutup bar Jadwal Sholat (tampil di layar > xs) */
@media (min-width: 600px) {
  .container-narrow { padding-top: 96px; }
}
.info-lines > div { margin: 4px 0; line-height: 1.6; }
.scope-box { background: #eef8f1; border-left: 4px solid #9ac7a6; border-radius: 7px; padding: 10px 12px; font-size: 14px; line-height: 1.5; color: #24452d; }
.scope-title { font-weight: 700; margin-bottom: 4px; }
.youtube-box { position: relative; width: 100%; aspect-ratio: 16/9; overflow: hidden; border-radius: 12px; background: #000; cursor: pointer; }
.youtube-box img { width: 100%; height: 100%; object-fit: cover; display: block; }
.play-btn { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 72px; height: 50px; background: #ff0000; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
.play-btn span { color: #fff; font-size: 28px; margin-left: 4px; }
.materi-block { margin-bottom: 14px; }
.arabic { direction: rtl; text-align: right; font-size: 24px; line-height: 2.05; font-family: "Traditional Arabic","Amiri","Noto Naskh Arabic","Scheherazade New",serif; margin: 10px 0; }
.translation { font-size: 15px; line-height: 1.7; color: #37474f; }
.pdf-wrap { border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden; background: #f5f5f5; }
.pdf-frame { width: 100%; height: 75vh; min-height: 420px; border: 0; display: block; }
.question-block { margin: 16px 0; }
.result-item { margin: 12px 0; padding: 12px; border-radius: 8px; }
.result-item.correct { background: #e7f6ea; border-left: 5px solid #2e8b57; }
.result-item.wrong { background: #fdeaea; border-left: 5px solid #c0392b; }
</style>
