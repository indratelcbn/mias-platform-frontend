<template>
  <q-page class="q-pa-lg">
    <!-- Header -->
    <div class="row items-center q-gutter-sm q-mb-md">
      <q-btn flat round dense icon="arrow_back" color="primary" :to="{ name: 'admin-murojaah' }" />
      <div>
        <div class="text-h6 text-weight-bold">{{ kajian?.judul || 'Memuat…' }}</div>
        <div class="text-caption text-grey-7">
          {{ kajian?.ustadz }}<span v-if="kajian?.kitab"> · {{ kajian.kitab }}</span>
        </div>
      </div>
      <q-space />
      <q-badge v-if="kajian" :color="statusColor(kajian.status)" :label="kajian.status" class="q-pa-sm" />
    </div>

    <div class="row q-col-gutter-md">
      <!-- ── Daftar Sesi ──────────────────────────────────────────────── -->
      <div class="col-12 col-md-4">
        <q-card flat bordered>
          <q-card-section class="row items-center q-pb-sm">
            <div class="text-subtitle1 text-weight-bold"><q-icon name="layers" class="q-mr-xs" />Sesi Muroja'ah</div>
            <q-space />
            <q-btn flat round dense icon="add" color="primary" @click="openSesiForm()"><q-tooltip>Tambah sesi</q-tooltip></q-btn>
          </q-card-section>
          <q-separator />
          <q-list separator>
            <q-item
              v-for="(s, idx) in sesiList" :key="s.id"
              clickable :active="selectedSesiId === s.id" active-class="bg-blue-1 text-primary"
              @click="selectSesi(s.id)"
            >
              <q-item-section avatar>
                <q-avatar size="30px" color="primary" text-color="white" class="text-caption">{{ idx + 1 }}</q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-medium">{{ s.judul }}</q-item-label>
                <q-item-label caption>
                  {{ s._count?.materi ?? 0 }} materi · {{ s._count?.soal ?? 0 }} soal · {{ s._count?.peserta ?? 0 }} peserta
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge :color="sesiStatusColor(s.status)" :label="s.status" />
              </q-item-section>
            </q-item>
            <q-item v-if="!sesiList.length">
              <q-item-section class="text-grey-6 text-center q-pa-md">Belum ada sesi. Klik + untuk menambah.</q-item-section>
            </q-item>
          </q-list>
          <q-separator v-if="sesiList.length > 1" />
          <q-card-section v-if="sesiList.length > 1" class="text-caption text-grey-6">
            <q-icon name="swap_vert" /> Urutkan sesi:
            <template v-for="(s, idx) in sesiList" :key="'r'+s.id">
              <q-btn flat dense size="sm" :label="idx + 1" class="q-px-xs">
                <q-menu>
                  <q-list dense>
                    <q-item clickable v-close-popup :disable="idx === 0" @click="moveSesi(idx, -1)"><q-item-section>⬆ Naik</q-item-section></q-item>
                    <q-item clickable v-close-popup :disable="idx === sesiList.length - 1" @click="moveSesi(idx, 1)"><q-item-section>⬇ Turun</q-item-section></q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </template>
          </q-card-section>
        </q-card>
      </div>

      <!-- ── Detail Sesi ──────────────────────────────────────────────── -->
      <div class="col-12 col-md-8">
        <q-card v-if="!selectedSesi" flat bordered class="flex flex-center" style="min-height:300px">
          <div class="text-grey-6 text-center">
            <q-icon name="touch_app" size="40px" class="q-mb-sm" /><div>Pilih sesi untuk mengelola materi &amp; soal.</div>
          </div>
        </q-card>

        <q-card v-else flat bordered>
          <q-card-section class="row items-center q-pb-none">
            <div class="text-subtitle1 text-weight-bold">{{ selectedSesi.judul }}</div>
            <q-space />
            <q-btn flat dense no-caps icon="edit" label="Edit Sesi" color="primary" @click="openSesiForm(selectedSesi)" />
            <q-btn flat dense no-caps icon="delete" label="Hapus" color="negative" @click="confirmDeleteSesi(selectedSesi)" />
          </q-card-section>

          <q-tabs v-model="tab" align="left" active-color="primary" indicator-color="primary" class="text-grey-7">
            <q-tab name="materi" icon="menu_book" label="Materi" />
            <q-tab name="soal" icon="quiz" label="Soal" />
            <q-tab name="peserta" icon="groups" label="Nilai &amp; Peserta" />
          </q-tabs>
          <q-separator />

          <q-tab-panels v-model="tab" animated>
            <!-- ════════════ MATERI ════════════ -->
            <q-tab-panel name="materi">
              <div class="row items-center q-mb-md">
                <div class="text-caption text-grey-7">Susun materi per blok: teks Arab (RTL) dipasangkan dengan terjemahan.</div>
                <q-space />
                <q-btn flat dense no-caps icon="visibility" :label="previewMateri ? 'Edit' : 'Preview'" color="primary" @click="previewMateri = !previewMateri" class="q-mr-sm" />
                <q-btn unelevated dense no-caps icon="add" label="Blok Materi" color="primary" @click="openMateriForm()" />
              </div>

              <!-- Preview mode -->
              <div v-if="previewMateri">
                <q-banner v-if="!materiList.length" dense class="bg-grey-2">Belum ada materi.</q-banner>
                <div v-for="m in materiList" :key="m.id" class="q-mb-md">
                  <div v-if="m.judul" class="text-h6 text-primary">{{ m.judul }}</div>
                  <div v-if="m.halaman" class="text-caption text-grey-6 q-mb-xs">Halaman {{ m.halaman }}</div>
                  <div v-if="m.teksArab" class="arabic-text">{{ m.teksArab }}</div>
                  <div v-if="m.terjemah" class="translation-text">{{ m.terjemah }}</div>
                  <div v-if="m.pdfFile" class="q-mt-xs">
                    <q-btn flat dense no-caps size="sm" color="red-8" icon="picture_as_pdf" label="Lihat PDF" type="a" :href="fileUrl(m.pdfFile)" target="_blank" />
                  </div>
                </div>
              </div>

              <!-- Edit mode -->
              <q-list v-else bordered separator>
                <q-item v-for="(m, idx) in materiList" :key="m.id">
                  <q-item-section avatar top>
                    <q-avatar size="28px" color="teal-1" text-color="teal-8" class="text-caption">{{ idx + 1 }}</q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label v-if="m.judul" class="text-weight-medium">{{ m.judul }}<span v-if="m.halaman" class="text-caption text-grey-6"> — hal. {{ m.halaman }}</span></q-item-label>
                    <div v-if="m.teksArab" class="arabic-text arabic-sm">{{ m.teksArab }}</div>
                    <div v-if="m.terjemah" class="translation-text text-grey-8">{{ m.terjemah }}</div>
                    <div v-if="m.pdfFile" class="q-mt-xs">
                      <q-btn flat dense no-caps size="sm" color="red-8" icon="picture_as_pdf" label="Lihat PDF" type="a" :href="fileUrl(m.pdfFile)" target="_blank" />
                    </div>
                  </q-item-section>
                  <q-item-section side top>
                    <div class="column q-gutter-xs">
                      <q-btn flat round dense size="sm" icon="arrow_upward" :disable="idx===0" @click="moveMateri(idx,-1)" />
                      <q-btn flat round dense size="sm" icon="arrow_downward" :disable="idx===materiList.length-1" @click="moveMateri(idx,1)" />
                    </div>
                  </q-item-section>
                  <q-item-section side top>
                    <div class="row q-gutter-xs">
                      <q-btn flat round dense size="sm" icon="edit" color="primary" @click="openMateriForm(m)" />
                      <q-btn flat round dense size="sm" icon="delete" color="negative" @click="confirmDeleteMateri(m)" />
                    </div>
                  </q-item-section>
                </q-item>
                <q-item v-if="!materiList.length"><q-item-section class="text-grey-6 text-center q-pa-md">Belum ada materi.</q-item-section></q-item>
              </q-list>
            </q-tab-panel>

            <!-- ════════════ SOAL ════════════ -->
            <q-tab-panel name="soal">
              <div class="row items-center q-mb-md">
                <div class="text-caption text-grey-7">{{ soalList.length }} soal. Kunci jawaban disimpan &amp; dinilai di server.</div>
                <q-space />
                <q-btn flat dense no-caps icon="upload_file" label="Import JSON" color="teal-8" @click="openImport" class="q-mr-sm" />
                <q-btn unelevated dense no-caps icon="add" label="Soal" color="primary" @click="openSoalForm()" />
              </div>
              <q-list bordered separator>
                <q-expansion-item v-for="(q, idx) in soalList" :key="q.id" group="soal" expand-separator>
                  <template #header>
                    <q-item-section avatar><q-avatar size="28px" color="primary" text-color="white" class="text-caption">{{ idx + 1 }}</q-avatar></q-item-section>
                    <q-item-section><div class="ellipsis-2-lines">{{ q.teks }}</div></q-item-section>
                    <q-item-section side><q-badge color="positive" :label="`Kunci ${q.kunciJawaban}`" /></q-item-section>
                    <q-item-section side><span class="text-caption text-grey-6">{{ q.bobot }} poin</span></q-item-section>
                  </template>
                  <q-card>
                    <q-card-section class="q-pt-none">
                      <div class="row q-col-gutter-sm">
                        <div v-for="opt in ['A','B','C','D']" :key="opt" class="col-12 col-sm-6">
                          <div :class="q.kunciJawaban === opt ? 'opt-correct' : 'opt-plain'">
                            <b>{{ opt }}.</b> {{ q['pilihan' + opt] }}
                          </div>
                        </div>
                      </div>
                      <div v-if="q.pembahasan" class="q-mt-sm text-caption text-grey-8"><b>Pembahasan:</b> {{ q.pembahasan }}</div>
                      <div class="row justify-end q-gutter-xs q-mt-sm">
                        <q-btn flat dense no-caps size="sm" icon="edit" label="Edit" color="primary" @click="openSoalForm(q)" />
                        <q-btn flat dense no-caps size="sm" icon="delete" label="Hapus" color="negative" @click="confirmDeleteSoal(q)" />
                      </div>
                    </q-card-section>
                  </q-card>
                </q-expansion-item>
                <q-item v-if="!soalList.length"><q-item-section class="text-grey-6 text-center q-pa-md">Belum ada soal. Tambah manual atau import JSON.</q-item-section></q-item>
              </q-list>
            </q-tab-panel>

            <!-- ════════════ PESERTA ════════════ -->
            <q-tab-panel name="peserta">
              <div class="row items-center q-mb-md">
                <div class="text-caption text-grey-7">Nomor WhatsApp disamarkan demi privasi peserta.</div>
                <q-space />
                <q-btn flat dense no-caps icon="refresh" label="Muat Ulang" color="primary" @click="loadPeserta" />
              </div>
              <q-table
                :rows="pesertaList" :columns="pesertaColumns" row-key="id" flat bordered dense
                :loading="loadingPeserta" :pagination="{ rowsPerPage: 20 }"
              >
                <template #body-cell-peringkat="{ row }">
                  <q-td class="text-center">
                    <q-icon v-if="row.peringkat<=3" name="emoji_events" :color="['amber','blue-grey-4','orange-4'][row.peringkat-1]" />
                    {{ row.peringkat }}
                  </q-td>
                </template>
                <template #no-data><div class="full-width text-center text-grey-6 q-pa-md">Belum ada peserta yang mengerjakan sesi ini.</div></template>
              </q-table>
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
      </div>
    </div>

    <!-- ══════════ Dialog Sesi ══════════ -->
    <q-dialog v-model="sesiDialog" persistent>
      <q-card style="min-width:340px; max-width:520px; width:90vw">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ sesiForm.id ? 'Edit' : 'Tambah' }} Sesi</div><q-space /><q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <q-form @submit="submitSesi" class="q-gutter-md">
            <q-input v-model="sesiForm.judul" outlined dense label="Judul Sesi *" placeholder="Muroja'ah 1" :rules="[v => !!v || 'Judul wajib diisi']" />
            <q-input v-model="sesiForm.deskripsi" outlined dense type="textarea" rows="2" label="Deskripsi" />
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-select v-model="sesiForm.status" outlined dense emit-value map-options :options="sesiStatusOptions" label="Status" />
              </div>
              <div class="col-12 col-sm-6">
                <q-input v-model.number="sesiForm.passingGrade" outlined dense type="number" label="Passing Grade (%)" />
              </div>
            </div>
            <q-input v-model="sesiForm.jadwalBuka" outlined dense type="datetime-local" label="Jadwal Pembukaan (opsional)" stack-label hint="Kosongkan untuk langsung terbuka" />
            <div class="row justify-end q-gutter-sm">
              <q-btn flat no-caps label="Batal" v-close-popup />
              <q-btn unelevated color="primary" no-caps :label="sesiForm.id ? 'Simpan' : 'Tambah'" type="submit" :loading="savingSesi" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- ══════════ Dialog Materi ══════════ -->
    <q-dialog v-model="materiDialog" persistent>
      <q-card style="min-width:360px; max-width:720px; width:94vw">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ materiForm.id ? 'Edit' : 'Tambah' }} Blok Materi</div><q-space /><q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <q-form @submit="submitMateri" class="q-gutter-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-8"><q-input v-model="materiForm.judul" outlined dense label="Judul / Sub-judul (opsional)" /></div>
              <div class="col-12 col-sm-4"><q-input v-model="materiForm.halaman" outlined dense label="Halaman kitab" /></div>
            </div>
            <div>
              <div class="text-caption text-grey-7 q-mb-xs">Teks Arab (kanan ke kiri) — opsional bila mengunggah PDF</div>
              <q-input v-model="materiForm.teksArab" outlined type="textarea" rows="4" input-class="arabic-input" />
            </div>
            <q-input v-model="materiForm.terjemah" outlined type="textarea" rows="3" label="Terjemahan Indonesia" />

            <!-- PDF upload -->
            <div>
              <div class="text-caption text-grey-7 q-mb-xs"><q-icon name="picture_as_pdf" color="red" /> File PDF materi (opsional)</div>
              <q-file
                v-model="materiForm.pdf" outlined dense clearable accept=".pdf" max-file-size="20971520"
                label="Pilih / seret file PDF (maks 20MB)" @rejected="onPdfRejected"
              >
                <template #prepend><q-icon name="attach_file" /></template>
              </q-file>
              <div v-if="materiForm.existingPdf && !materiForm.pdf" class="q-mt-xs row items-center q-gutter-sm">
                <q-btn flat dense no-caps size="sm" color="primary" icon="open_in_new" label="Lihat PDF saat ini" type="a" :href="fileUrl(materiForm.existingPdf)" target="_blank" />
                <q-btn flat dense no-caps size="sm" color="negative" icon="delete" label="Hapus PDF" @click="materiForm.removePdf = !materiForm.removePdf" />
                <q-badge v-if="materiForm.removePdf" color="negative" label="akan dihapus saat simpan" />
              </div>
            </div>

            <q-banner dense class="bg-grey-2 text-grey-8" v-if="materiForm.teksArab">
              <div class="text-caption text-grey-6 q-mb-xs">Preview:</div>
              <div class="arabic-text arabic-sm">{{ materiForm.teksArab }}</div>
              <div v-if="materiForm.terjemah" class="translation-text">{{ materiForm.terjemah }}</div>
            </q-banner>
            <div class="row justify-end q-gutter-sm">
              <q-btn flat no-caps label="Batal" v-close-popup />
              <q-btn unelevated color="primary" no-caps :label="materiForm.id ? 'Simpan' : 'Tambah'" type="submit" :loading="savingMateri" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- ══════════ Dialog Soal ══════════ -->
    <q-dialog v-model="soalDialog" persistent>
      <q-card style="min-width:360px; max-width:720px; width:94vw">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ soalForm.id ? 'Edit' : 'Tambah' }} Soal</div><q-space /><q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <q-form @submit="submitSoal" class="q-gutter-md">
            <q-input v-model="soalForm.teks" outlined type="textarea" rows="2" label="Pertanyaan *" :rules="[v => !!v || 'Pertanyaan wajib diisi']" />
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6" v-for="opt in ['A','B','C','D']" :key="opt">
                <q-input v-model="soalForm['pilihan'+opt]" outlined dense :label="`Pilihan ${opt} *`" :rules="[v => !!v || 'Wajib diisi']">
                  <template #prepend>
                    <q-radio v-model="soalForm.kunciJawaban" :val="opt" :label="opt" dense />
                  </template>
                </q-input>
              </div>
            </div>
            <div class="row q-col-gutter-md items-center">
              <div class="col-6 col-sm-3"><q-input v-model.number="soalForm.bobot" outlined dense type="number" label="Bobot" /></div>
              <div class="col-6 col-sm-3 text-caption text-grey-7">Kunci: <q-badge color="positive" :label="soalForm.kunciJawaban" /></div>
            </div>
            <q-input v-model="soalForm.pembahasan" outlined dense type="textarea" rows="2" label="Pembahasan (opsional)" />
            <div class="row justify-end q-gutter-sm">
              <q-btn flat no-caps label="Batal" v-close-popup />
              <q-btn unelevated color="primary" no-caps :label="soalForm.id ? 'Simpan' : 'Tambah'" type="submit" :loading="savingSoal" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- ══════════ Dialog Import JSON ══════════ -->
    <q-dialog v-model="importDialog" persistent>
      <q-card style="min-width:360px; max-width:820px; width:96vw">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6"><q-icon name="upload_file" class="q-mr-xs" />Import Soal Massal (JSON)</div>
          <q-space /><q-btn icon="close" flat round dense v-close-popup @click="resetImport" />
        </q-card-section>
        <q-card-section>
          <q-banner dense rounded class="bg-blue-1 text-primary q-mb-md">
            Target: <b>{{ kajian?.judul }}</b> → Sesi <b>{{ selectedSesi?.judul }}</b>
          </q-banner>

          <div class="row items-center q-gutter-sm q-mb-sm">
            <q-btn flat dense no-caps color="primary" icon="download" label="Unduh Contoh JSON" @click="downloadTemplate" />
            <q-btn flat dense no-caps color="primary" icon="attach_file" label="Pilih File .json" @click="$refs.fileInput.pickFiles()" />
            <q-file ref="fileInput" v-model="importFile" accept=".json" style="display:none" @update:model-value="onFilePick" />
          </div>

          <q-input
            v-model="importText" type="textarea" outlined dense :rows="8"
            label="Tempel array JSON soal di sini"
            placeholder='[{"teks":"...","pilihanA":"...","pilihanB":"...","pilihanC":"...","pilihanD":"...","kunci":"B","bobot":20}]'
          />

          <div class="q-mt-md">
            <q-btn unelevated color="primary" no-caps icon="fact_check" label="Validasi & Preview" @click="doPreview" :loading="validating" :disable="!importText.trim()" />
          </div>

          <!-- Preview result -->
          <div v-if="importPreview" class="q-mt-md">
            <div class="row q-gutter-sm q-mb-sm">
              <q-chip dense icon="check_circle" color="positive" text-color="white" :label="`${importPreview.totalValid} valid`" />
              <q-chip v-if="importPreview.totalInvalid" dense icon="error" color="negative" text-color="white" :label="`${importPreview.totalInvalid} error`" />
            </div>
            <q-banner v-if="importPreview.totalInvalid" dense rounded class="bg-red-1 text-negative q-mb-sm">
              <div v-for="inv in importPreview.invalid" :key="inv.baris" class="text-caption"><b>Soal #{{ inv.baris }}:</b> {{ inv.errors.join('; ') }}</div>
            </q-banner>
            <q-list v-if="importPreview.valid.length" bordered separator dense style="max-height:240px; overflow:auto">
              <q-item v-for="(v, i) in importPreview.valid" :key="i">
                <q-item-section>
                  <q-item-label class="ellipsis">{{ i + 1 }}. {{ v.teks }}</q-item-label>
                  <q-item-label caption>A: {{ v.pilihanA }} · B: {{ v.pilihanB }} · C: {{ v.pilihanC }} · D: {{ v.pilihanD }}</q-item-label>
                </q-item-section>
                <q-item-section side><q-badge color="positive" :label="v.kunciJawaban" /></q-item-section>
              </q-item>
            </q-list>
          </div>
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat no-caps label="Batal" v-close-popup @click="resetImport" />
          <q-btn
            unelevated color="positive" no-caps icon="save"
            :label="`Import ${importPreview?.totalValid ?? 0} Soal`"
            :disable="!importPreview?.totalValid" :loading="importing" @click="doConfirmImport"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { useMurojaahStore } from 'src/stores/murojaah';

const route = useRoute();
const $q = useQuasar();
const store = useMurojaahStore();
const kajianId = route.params.id;

const kajian = ref(null);
const sesiList = ref([]);
const selectedSesiId = ref(null);
const selectedSesi = ref(null);
const materiList = ref([]);
const soalList = ref([]);
const pesertaList = ref([]);
const loadingPeserta = ref(false);
const tab = ref('materi');
const previewMateri = ref(false);

const statusColor = (s) => ({ DRAFT: 'orange', PUBLISHED: 'positive', ARCHIVED: 'grey' }[s] || 'grey');
const sesiStatusColor = (s) => ({ DRAFT: 'orange', PUBLISHED: 'positive', CLOSED: 'blue-grey', ARCHIVED: 'grey' }[s] || 'grey');
const sesiStatusOptions = [
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Published', value: 'PUBLISHED' },
  { label: 'Closed (tutup pengerjaan)', value: 'CLOSED' },
  { label: 'Archived', value: 'ARCHIVED' },
];

const pesertaColumns = [
  { name: 'peringkat', label: '#', field: 'peringkat', align: 'center' },
  { name: 'namaLengkap', label: 'Nama', field: 'namaLengkap', align: 'left' },
  { name: 'whatsapp', label: 'WhatsApp', field: 'whatsapp', align: 'left' },
  { name: 'score', label: 'Nilai', field: 'score', align: 'center' },
  { name: 'benar', label: 'Benar', field: 'benar', align: 'center' },
  { name: 'salah', label: 'Salah', field: 'salah', align: 'center' },
  { name: 'attempt', label: 'Percobaan', field: 'attempt', align: 'center' },
];

const fileUrl = (p) => (p ? (p.startsWith('http') ? p : p) : '');

// ── Loaders ─────────────────────────────────────────────────────────────────
const loadKajian = async () => {
  const data = await store.fetchDetail(kajianId);
  if (data) { kajian.value = data; sesiList.value = data.sesi || []; }
};

const selectSesi = async (sesiId) => {
  selectedSesiId.value = sesiId;
  const data = await store.fetchSesiDetail(sesiId);
  if (data) {
    selectedSesi.value = data;
    materiList.value = data.materi || [];
    soalList.value = data.soal || [];
  }
  if (tab.value === 'peserta') loadPeserta();
};

const refreshSesi = async () => {
  sesiList.value = await store.fetchSesi(kajianId);
  if (selectedSesiId.value) await selectSesi(selectedSesiId.value);
};

const loadPeserta = async () => {
  if (!selectedSesiId.value) return;
  loadingPeserta.value = true;
  pesertaList.value = await store.fetchPeserta(selectedSesiId.value);
  loadingPeserta.value = false;
};

// ── Sesi form ───────────────────────────────────────────────────────────────
const sesiDialog = ref(false);
const savingSesi = ref(false);
const sesiForm = reactive({ id: null, judul: '', deskripsi: '', status: 'DRAFT', passingGrade: 0, jadwalBuka: '' });

const openSesiForm = (s = null) => {
  if (s) {
    Object.assign(sesiForm, {
      id: s.id, judul: s.judul, deskripsi: s.deskripsi || '', status: s.status,
      passingGrade: s.passingGrade ?? 0,
      jadwalBuka: s.jadwalBuka ? toLocalInput(s.jadwalBuka) : '',
    });
  } else {
    Object.assign(sesiForm, { id: null, judul: `Muroja'ah ${sesiList.value.length + 1}`, deskripsi: '', status: 'DRAFT', passingGrade: 0, jadwalBuka: '' });
  }
  sesiDialog.value = true;
};

const submitSesi = async () => {
  savingSesi.value = true;
  const payload = {
    judul: sesiForm.judul, deskripsi: sesiForm.deskripsi, status: sesiForm.status,
    passingGrade: Number(sesiForm.passingGrade) || 0,
    jadwalBuka: sesiForm.jadwalBuka ? new Date(sesiForm.jadwalBuka).toISOString() : null,
  };
  const res = sesiForm.id ? await store.updateSesi(sesiForm.id, payload) : await store.createSesi(kajianId, payload);
  savingSesi.value = false;
  if (res) {
    sesiDialog.value = false;
    await refreshSesi();
    if (!sesiForm.id) selectSesi(res.id);
  }
};

const confirmDeleteSesi = (s) => {
  $q.dialog({ title: 'Hapus Sesi', message: `Hapus "${s.judul}" beserta materi, soal, dan nilai peserta?`, cancel: true, ok: { label: 'Hapus', color: 'negative', unelevated: true } })
    .onOk(async () => {
      if (await store.deleteSesi(s.id)) {
        if (selectedSesiId.value === s.id) { selectedSesiId.value = null; selectedSesi.value = null; }
        await refreshSesi();
      }
    });
};

const moveSesi = async (idx, dir) => {
  const arr = [...sesiList.value];
  const target = idx + dir;
  if (target < 0 || target >= arr.length) return;
  [arr[idx], arr[target]] = [arr[target], arr[idx]];
  sesiList.value = arr;
  const updated = await store.reorderSesi(kajianId, arr.map((s) => s.id));
  if (updated) sesiList.value = updated;
};

// ── Materi form ─────────────────────────────────────────────────────────────
const materiDialog = ref(false);
const savingMateri = ref(false);
const materiForm = reactive({ id: null, judul: '', halaman: '', teksArab: '', terjemah: '', pdf: null, existingPdf: null, removePdf: false });

const openMateriForm = (m = null) => {
  Object.assign(materiForm, m
    ? { id: m.id, judul: m.judul || '', halaman: m.halaman || '', teksArab: m.teksArab || '', terjemah: m.terjemah || '', pdf: null, existingPdf: m.pdfFile || null, removePdf: false }
    : { id: null, judul: '', halaman: '', teksArab: '', terjemah: '', pdf: null, existingPdf: null, removePdf: false });
  materiDialog.value = true;
};

const onPdfRejected = () => {
  $q.notify({ type: 'negative', message: 'File ditolak: harus PDF dan maksimal 20MB.' });
};

const submitMateri = async () => {
  if (!materiForm.teksArab?.trim() && !materiForm.pdf && !(materiForm.existingPdf && !materiForm.removePdf)) {
    $q.notify({ type: 'warning', message: 'Isi teks Arab atau unggah file PDF.' });
    return;
  }
  savingMateri.value = true;
  const fd = new FormData();
  fd.append('judul', materiForm.judul || '');
  fd.append('halaman', materiForm.halaman || '');
  fd.append('teksArab', materiForm.teksArab || '');
  fd.append('terjemah', materiForm.terjemah || '');
  if (materiForm.pdf) fd.append('pdf', materiForm.pdf);
  if (materiForm.id && materiForm.removePdf && !materiForm.pdf) fd.append('removePdf', 'true');
  const res = materiForm.id ? await store.updateMateri(materiForm.id, fd) : await store.createMateri(selectedSesiId.value, fd);
  savingMateri.value = false;
  if (res) { materiDialog.value = false; await refreshSesi(); }
};

const confirmDeleteMateri = (m) => {
  $q.dialog({ title: 'Hapus Materi', message: 'Hapus blok materi ini?', cancel: true, ok: { label: 'Hapus', color: 'negative', unelevated: true } })
    .onOk(async () => { if (await store.deleteMateri(m.id)) await refreshSesi(); });
};

const moveMateri = async (idx, dir) => {
  const arr = [...materiList.value];
  const target = idx + dir;
  if (target < 0 || target >= arr.length) return;
  [arr[idx], arr[target]] = [arr[target], arr[idx]];
  materiList.value = arr;
  const updated = await store.reorderMateri(selectedSesiId.value, arr.map((m) => m.id));
  if (updated) materiList.value = updated;
};

// ── Soal form ───────────────────────────────────────────────────────────────
const soalDialog = ref(false);
const savingSoal = ref(false);
const soalForm = reactive({ id: null, teks: '', pilihanA: '', pilihanB: '', pilihanC: '', pilihanD: '', kunciJawaban: 'A', bobot: 20, pembahasan: '' });

const openSoalForm = (q = null) => {
  Object.assign(soalForm, q
    ? { id: q.id, teks: q.teks, pilihanA: q.pilihanA, pilihanB: q.pilihanB, pilihanC: q.pilihanC, pilihanD: q.pilihanD, kunciJawaban: q.kunciJawaban, bobot: q.bobot, pembahasan: q.pembahasan || '' }
    : { id: null, teks: '', pilihanA: '', pilihanB: '', pilihanC: '', pilihanD: '', kunciJawaban: 'A', bobot: 20, pembahasan: '' });
  soalDialog.value = true;
};

const submitSoal = async () => {
  savingSoal.value = true;
  const payload = { ...soalForm, bobot: Number(soalForm.bobot) || 1 };
  delete payload.id;
  const res = soalForm.id ? await store.updateSoal(soalForm.id, payload) : await store.createSoal(selectedSesiId.value, payload);
  savingSoal.value = false;
  if (res) { soalDialog.value = false; await refreshSesi(); }
};

const confirmDeleteSoal = (q) => {
  $q.dialog({ title: 'Hapus Soal', message: 'Hapus soal ini?', cancel: true, ok: { label: 'Hapus', color: 'negative', unelevated: true } })
    .onOk(async () => { if (await store.deleteSoal(q.id)) await refreshSesi(); });
};

// ── Import JSON ─────────────────────────────────────────────────────────────
const importDialog = ref(false);
const importText = ref('');
const importFile = ref(null);
const importPreview = ref(null);
const validating = ref(false);
const importing = ref(false);

const openImport = () => { resetImport(); importDialog.value = true; };
const resetImport = () => { importText.value = ''; importFile.value = null; importPreview.value = null; };

const onFilePick = async (file) => {
  if (!file) return;
  try { importText.value = await file.text(); importPreview.value = null; }
  catch { $q.notify({ type: 'negative', message: 'Gagal membaca file.' }); }
};

const parseRows = () => {
  const parsed = JSON.parse(importText.value.trim());
  if (!Array.isArray(parsed)) throw new Error('JSON harus berupa array soal.');
  return parsed;
};

const doPreview = async () => {
  validating.value = true;
  try {
    const rows = parseRows();
    const res = await store.previewImport(selectedSesiId.value, rows);
    if (res) importPreview.value = res;
  } catch (e) {
    $q.notify({ type: 'negative', message: `Format JSON tidak valid: ${e.message}` });
  } finally {
    validating.value = false;
  }
};

const doConfirmImport = async () => {
  importing.value = true;
  try {
    const rows = parseRows();
    const res = await store.confirmImport(selectedSesiId.value, rows);
    if (res) { importDialog.value = false; resetImport(); await refreshSesi(); }
  } catch (e) {
    $q.notify({ type: 'negative', message: `Gagal import: ${e.message}` });
  } finally {
    importing.value = false;
  }
};

const downloadTemplate = () => {
  const tmpl = JSON.stringify([
    { teks: 'Contoh pertanyaan dalam bahasa Arab atau Indonesia?', pilihanA: 'Pilihan A', pilihanB: 'Pilihan B', pilihanC: 'Pilihan C', pilihanD: 'Pilihan D', kunci: 'B', bobot: 20 },
  ], null, 2);
  const blob = new Blob([tmpl], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'contoh-soal-murojaah.json'; a.click();
  URL.revokeObjectURL(url);
};

// ── Utils ───────────────────────────────────────────────────────────────────
const toLocalInput = (iso) => {
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
};

// watch tab change to load peserta lazily
watch(tab, (t) => { if (t === 'peserta') loadPeserta(); });

onMounted(async () => {
  await loadKajian();
  if (sesiList.value.length) selectSesi(sesiList.value[0].id);
});
</script>

<style scoped>
.arabic-text {
  direction: rtl;
  text-align: right;
  font-size: 24px;
  line-height: 2.05;
  font-family: "Traditional Arabic", "Amiri", "Noto Naskh Arabic", "Scheherazade New", serif;
  margin: 8px 0;
}
.arabic-sm { font-size: 20px; line-height: 1.9; }
.translation-text { font-size: 15px; line-height: 1.7; color: #37474f; }
:deep(.arabic-input) {
  direction: rtl;
  text-align: right;
  font-size: 20px;
  line-height: 1.9;
  font-family: "Traditional Arabic", "Amiri", "Noto Naskh Arabic", "Scheherazade New", serif;
}
.opt-correct { border: 1px solid #2e8b57; background: #e7f6ea; border-radius: 8px; padding: 8px 10px; }
.opt-plain { border: 1px solid #e0e0e0; border-radius: 8px; padding: 8px 10px; }
.ellipsis-2-lines {
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
</style>
