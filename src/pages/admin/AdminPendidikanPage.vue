<template>
  <q-page class="q-pa-lg">
    <!-- ─── Header ───────────────────────────────────────────────────────── -->
    <div class="row items-center justify-between q-mb-lg">
      <div class="text-h5 text-weight-bold">
        <q-icon name="school" color="primary" class="q-mr-sm" />Kelola Pendidikan
      </div>
    </div>

    <!-- ─── Main Tabs ─────────────────────────────────────────────────────── -->
    <q-tabs
      v-model="mainTab"
      no-caps
      narrow-indicator
      align="left"
      class="q-mb-lg"
      active-color="primary"
      indicator-color="primary"
    >
      <q-tab name="info" icon="info" label="Info Kelas" />
      <q-tab name="foto" icon="photo_library" label="Dokumentasi Foto" />
    </q-tabs>

    <q-tab-panels v-model="mainTab" animated keep-alive>

      <!-- ═══════════════════════════════════════════════════════════════════
           TAB: INFO KELAS
      ════════════════════════════════════════════════════════════════════ -->
      <q-tab-panel name="info" class="q-pa-none">
        <div class="row q-col-gutter-md">
          <div
            v-for="opt in kategoriOpts"
            :key="opt.value"
            class="col-12 col-sm-6 col-md-4"
          >
            <q-card flat bordered style="border-radius: 14px; overflow: hidden">
              <!-- Color Header -->
              <div class="q-pa-md row items-center no-wrap" :style="{ background: opt.gradient, color:'#fff' }">
                <q-icon :name="opt.icon" size="28px" class="q-mr-sm" />
                <div class="text-weight-bold" style="font-size: 15px">{{ opt.label }}</div>
              </div>

              <!-- Info Body -->
              <q-card-section>
                <div v-if="infoMap[opt.value]">
                  <!-- Jumlah Penuntut Ilmu -->
                  <div class="row items-center q-mb-sm q-gutter-xs">
                    <q-icon name="groups" color="grey-7" size="18px" />
                    <span class="text-caption text-grey-7">Penuntut Ilmu:</span>
                    <span class="text-weight-bold">{{ infoMap[opt.value].jumlahPenuntutIlmu }}</span>
                  </div>
                  <!-- Kitab -->
                  <div class="q-mb-sm">
                    <div class="text-caption text-grey-7 q-mb-xs">
                      <q-icon name="menu_book" size="16px" class="q-mr-xs" />Kitab:
                    </div>
                    <div class="row q-gutter-xs">
                      <q-badge
                        v-for="(k, i) in parseJson(infoMap[opt.value].kitab)"
                        :key="i"
                        color="primary"
                        :label="k"
                        style="font-size: 11px"
                      />
                      <span v-if="!parseJson(infoMap[opt.value].kitab).length" class="text-caption text-grey-5">–</span>
                    </div>
                  </div>
                  <!-- Pengajar -->
                  <div>
                    <div class="text-caption text-grey-7 q-mb-xs">
                      <q-icon name="person" size="16px" class="q-mr-xs" />Pengajar:
                    </div>
                    <div v-for="(p, i) in parseJson(infoMap[opt.value].pengajar)" :key="i" class="text-body2">
                      {{ p }}
                    </div>
                    <span v-if="!parseJson(infoMap[opt.value].pengajar).length" class="text-caption text-grey-5">–</span>
                  </div>
                </div>
                <div v-else class="text-caption text-grey-5 text-center q-py-md">
                  Belum ada info. Klik Edit untuk mengisi.
                </div>
              </q-card-section>

              <q-card-actions align="right">
                <q-btn
                  flat
                  no-caps
                  icon="edit"
                  color="primary"
                  label="Edit Info"
                  size="sm"
                  @click="openInfoDialog(opt)"
                />
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </q-tab-panel>

      <!-- ═══════════════════════════════════════════════════════════════════
           TAB: DOKUMENTASI FOTO
      ════════════════════════════════════════════════════════════════════ -->
      <q-tab-panel name="foto" class="q-pa-none">
        <!-- Toolbar -->
        <div class="row items-center justify-between q-mb-md">
          <div class="row items-center q-gutter-xs flex-wrap">
            <q-chip
              v-for="opt in [{ label: 'Semua', value: null }, ...kategoriOpts]"
              :key="opt.value ?? 'all'"
              :label="opt.label"
              :color="filterKategori === opt.value ? 'primary' : 'grey-3'"
              :text-color="filterKategori === opt.value ? 'white' : 'dark'"
              clickable
              class="q-ma-none"
              style="font-size: 12px"
              @click="setFotoFilter(opt.value)"
            />
          </div>
          <q-btn unelevated color="primary" icon="add" label="Tambah Foto" no-caps @click="openFotoDialog()" />
        </div>

        <!-- Grid -->
        <div v-if="store.loading" class="row q-col-gutter-md">
          <div v-for="n in 8" :key="n" class="col-12 col-sm-6 col-md-3">
            <q-skeleton height="180px" style="border-radius: 12px" />
          </div>
        </div>

        <div v-else-if="store.listFotoAdmin.length" class="row q-col-gutter-md">
          <div
            v-for="item in store.listFotoAdmin"
            :key="item.id"
            class="col-12 col-sm-6 col-md-3"
          >
            <q-card flat bordered style="border-radius: 12px; overflow: hidden">
              <q-img :src="item.foto" :ratio="4/3" fit="cover">
                <template #error>
                  <div class="absolute-full flex flex-center bg-grey-2 text-grey-5">
                    <q-icon name="broken_image" size="36px" />
                  </div>
                </template>
              </q-img>
              <q-card-section class="q-py-sm q-px-md">
                <div class="row items-start justify-between no-wrap">
                  <div class="col ellipsis">
                    <div class="text-caption text-weight-bold ellipsis">{{ item.judul }}</div>
                    <div class="row items-center q-gutter-xs q-mt-xs">
                      <q-badge
                        color="primary"
                        :label="kategoriLabel(item.kategori)"
                        style="font-size: 10px"
                      />
                      <q-badge color="grey-6" :label="item.tahun" style="font-size: 10px" />
                    </div>
                  </div>
                  <div class="row no-wrap q-gutter-xs q-ml-xs">
                    <q-btn flat round icon="edit" color="primary" size="xs" @click="openFotoDialog(item)" />
                    <q-btn flat round icon="delete" color="negative" size="xs" @click="confirmDeleteFoto(item)" />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <div v-else class="text-center q-py-xl">
          <q-icon name="photo_library" size="64px" color="grey-4" />
          <div class="text-grey-6 q-mt-md">Belum ada foto untuk kategori ini</div>
        </div>

        <!-- Pagination -->
        <div v-if="store.meta.totalPages > 1" class="row justify-center q-mt-lg">
          <q-pagination
            v-model="fotoPage"
            :max="store.meta.totalPages"
            boundary-numbers
            @update:model-value="onFotoPageChange"
          />
        </div>
      </q-tab-panel>
    </q-tab-panels>

    <!-- ─── Dialog: Info Kelas ────────────────────────────────────────────── -->
    <q-dialog v-model="infoDialog" persistent>
      <q-card style="width: 560px; max-width: 96vw">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Edit Info – {{ selectedOpt?.label }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-form @submit="saveInfo" class="q-gutter-md">
            <q-input
              v-model.number="infoForm.jumlahPenuntutIlmu"
              outlined
              type="number"
              label="Jumlah Penuntut Ilmu *"
              :rules="[v => v >= 0 || 'Harus angka positif']"
            />

            <!-- Pengajar list -->
            <div>
              <div class="text-caption text-grey-7 q-mb-xs">Pengajar</div>
              <div
                v-for="(p, i) in infoForm.pengajarList"
                :key="i"
                class="row items-center q-mb-xs q-gutter-xs"
              >
                <q-input
                  v-model="infoForm.pengajarList[i]"
                  outlined dense
                  :label="`Pengajar ${i + 1}`"
                  class="col"
                />
                <q-btn flat round icon="remove_circle" color="negative" size="sm" @click="removePengajar(i)" />
              </div>
              <q-btn flat no-caps icon="add" label="Tambah Pengajar" color="primary" size="sm" @click="addPengajar" />
            </div>

            <!-- Kitab list -->
            <div>
              <div class="text-caption text-grey-7 q-mb-xs">Kitab yang Digunakan</div>
              <div
                v-for="(k, i) in infoForm.kitabList"
                :key="i"
                class="row items-center q-mb-xs q-gutter-xs"
              >
                <q-input
                  v-model="infoForm.kitabList[i]"
                  outlined dense
                  :label="`Kitab ${i + 1}`"
                  class="col"
                />
                <q-btn flat round icon="remove_circle" color="negative" size="sm" @click="removeKitab(i)" />
              </div>
              <q-btn flat no-caps icon="add" label="Tambah Kitab" color="primary" size="sm" @click="addKitab" />
            </div>

            <q-input
              v-model="infoForm.deskripsi"
              outlined
              label="Deskripsi (opsional)"
              type="textarea"
              rows="3"
            />

            <div class="row justify-end q-gutter-sm q-mt-sm">
              <q-btn flat no-caps label="Batal" v-close-popup />
              <q-btn
                unelevated color="primary" no-caps type="submit"
                label="Simpan"
                :loading="savingInfo"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- ─── Dialog: Foto ──────────────────────────────────────────────────── -->
    <q-dialog v-model="fotoDialog" persistent>
      <q-card style="width: 540px; max-width: 96vw">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ isFotoEdit ? 'Edit Foto' : 'Tambah Foto' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-form @submit="saveFoto" class="q-gutter-md">
            <q-input
              v-model="fotoForm.judul"
              outlined
              label="Judul Foto *"
              :rules="[v => !!v || 'Wajib diisi']"
            />

            <q-select
              v-model="fotoForm.kategori"
              outlined
              label="Kategori *"
              :options="kategoriOpts"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              :rules="[v => !!v || 'Wajib dipilih']"
            />

            <q-select
              v-model="fotoForm.tahun"
              outlined
              label="Tahun *"
              :options="tahunOptions"
              emit-value
              map-options
              :rules="[v => !!v || 'Wajib dipilih']"
            />

            <q-input
              v-model="fotoForm.keterangan"
              outlined
              label="Keterangan (opsional)"
              type="textarea"
              rows="3"
            />

            <q-input
              v-model.number="fotoForm.urutan"
              outlined
              type="number"
              label="Urutan Tampil"
              hint="Angka lebih kecil tampil lebih dulu"
            />

            <q-file
              v-model="fotoForm.fotoFile"
              outlined
              :label="isFotoEdit ? 'Ganti Foto (opsional)' : 'File Foto *'"
              accept="image/*"
              :rules="isFotoEdit ? [] : [v => !!v || 'Foto wajib diunggah']"
            >
              <template #prepend><q-icon name="photo_camera" /></template>
            </q-file>

            <!-- Preview -->
            <div v-if="fotoPreviewUrl" class="q-mt-sm">
              <q-img :src="fotoPreviewUrl" :ratio="16/9" fit="cover" style="border-radius: 10px; max-height: 180px" />
            </div>

            <div class="row justify-end q-gutter-sm q-mt-sm">
              <q-btn flat no-caps label="Batal" v-close-popup />
              <q-btn
                unelevated color="primary" no-caps type="submit"
                :label="isFotoEdit ? 'Simpan' : 'Tambah'"
                :loading="savingFoto"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { usePendidikanStore } from 'src/stores/pendidikan';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const store = usePendidikanStore();

const mainTab = ref('info');

// ── Kategori Options ──────────────────────────────────────────────────────────
const kategoriOpts = [
  {
    value: 'TAHSIN_IKHWAN', label: 'Tahsin Ikhwan',
    icon: 'auto_stories',
    gradient: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
  },
  {
    value: 'TAHSIN_AKHWAT', label: 'Tahsin Akhwat',
    icon: 'auto_stories',
    gradient: 'linear-gradient(135deg, #6A1B9A 0%, #4A148C 100%)',
  },
  {
    value: 'BAHASA_ARAB_IKHWAN', label: 'Bahasa Arab Ikhwan',
    icon: 'translate',
    gradient: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
  },
  {
    value: 'BAHASA_ARAB_AKHWAT', label: 'Bahasa Arab Akhwat',
    icon: 'translate',
    gradient: 'linear-gradient(135deg, #BF360C 0%, #870000 100%)',
  },
  {
    value: 'TPQ', label: 'TPQ',
    icon: 'child_care',
    gradient: 'linear-gradient(135deg, #E65100 0%, #BF360C 100%)',
  },
];

const kategoriLabel = (k) => kategoriOpts.find(o => o.value === k)?.label ?? k;

const parseJson = (str) => { try { return JSON.parse(str || '[]'); } catch { return []; } };

// ── Info Map ──────────────────────────────────────────────────────────────────
const infoMap = computed(() => {
  const map = {};
  store.allInfo.forEach((i) => { map[i.kategori] = i; });
  return map;
});

// ── Info Dialog ───────────────────────────────────────────────────────────────
const infoDialog = ref(false);
const savingInfo = ref(false);
const selectedOpt = ref(null);

const infoForm = reactive({
  jumlahPenuntutIlmu: 0,
  pengajarList: [],
  kitabList: [],
  deskripsi: '',
});

const openInfoDialog = (opt) => {
  selectedOpt.value = opt;
  const existing = infoMap.value[opt.value];
  infoForm.jumlahPenuntutIlmu = existing?.jumlahPenuntutIlmu ?? 0;
  infoForm.pengajarList = [...parseJson(existing?.pengajar)];
  infoForm.kitabList = [...parseJson(existing?.kitab)];
  infoForm.deskripsi = existing?.deskripsi || '';
  infoDialog.value = true;
};

const addPengajar = () => infoForm.pengajarList.push('');
const removePengajar = (i) => infoForm.pengajarList.splice(i, 1);
const addKitab = () => infoForm.kitabList.push('');
const removeKitab = (i) => infoForm.kitabList.splice(i, 1);

const saveInfo = async () => {
  savingInfo.value = true;
  const payload = {
    jumlahPenuntutIlmu: infoForm.jumlahPenuntutIlmu,
    pengajar: JSON.stringify(infoForm.pengajarList.filter(Boolean)),
    kitab: JSON.stringify(infoForm.kitabList.filter(Boolean)),
    deskripsi: infoForm.deskripsi || undefined,
  };
  const result = await store.upsertInfo(selectedOpt.value.value, payload);
  savingInfo.value = false;
  if (result) {
    infoDialog.value = false;
    store.fetchAllInfo();
  }
};

// ── Foto Section ──────────────────────────────────────────────────────────────
const filterKategori = ref(null);
const fotoPage = ref(1);

const currentYear = new Date().getFullYear();
const tahunOptions = Array.from({ length: 6 }, (_, i) => {
  const y = currentYear - i;
  return { label: String(y), value: y };
});

const setFotoFilter = (val) => {
  filterKategori.value = val;
  fotoPage.value = 1;
  loadFotos();
};

const loadFotos = () => {
  store.fetchFotoAdmin({ kategori: filterKategori.value || undefined, page: fotoPage.value });
};

const onFotoPageChange = (page) => {
  fotoPage.value = page;
  loadFotos();
};

// ── Foto Dialog ───────────────────────────────────────────────────────────────
const fotoDialog = ref(false);
const isFotoEdit = ref(false);
const savingFoto = ref(false);
const editFotoId = ref(null);

const emptyFotoForm = () => ({
  judul: '',
  kategori: 'TAHSIN_IKHWAN',
  tahun: currentYear,
  keterangan: '',
  urutan: 0,
  fotoFile: null,
});
const fotoForm = reactive(emptyFotoForm());

const fotoPreviewUrl = computed(() => {
  if (fotoForm.fotoFile instanceof File) return URL.createObjectURL(fotoForm.fotoFile);
  return null;
});

const openFotoDialog = (row = null) => {
  if (row) {
    isFotoEdit.value = true;
    editFotoId.value = row.id;
    Object.assign(fotoForm, {
      judul: row.judul,
      kategori: row.kategori,
      tahun: row.tahun ?? currentYear,
      keterangan: row.keterangan || '',
      urutan: row.urutan ?? 0,
      fotoFile: null,
    });
  } else {
    isFotoEdit.value = false;
    editFotoId.value = null;
    Object.assign(fotoForm, emptyFotoForm());
  }
  fotoDialog.value = true;
};

const saveFoto = async () => {
  savingFoto.value = true;
  const payload = {
    judul: fotoForm.judul,
    kategori: fotoForm.kategori,
    tahun: fotoForm.tahun,
    keterangan: fotoForm.keterangan || undefined,
    urutan: fotoForm.urutan,
  };
  if (fotoForm.fotoFile) payload.foto = fotoForm.fotoFile;

  const result = isFotoEdit.value
    ? await store.updateFoto(editFotoId.value, payload)
    : await store.createFoto(payload);

  savingFoto.value = false;
  if (result) {
    fotoDialog.value = false;
    loadFotos();
  }
};

const confirmDeleteFoto = (row) => {
  $q.dialog({
    title: 'Hapus Foto',
    message: `Yakin ingin menghapus foto "${row.judul}"?`,
    cancel: { flat: true, label: 'Batal' },
    ok: { unelevated: true, color: 'negative', label: 'Hapus' },
    persistent: true,
  }).onOk(async () => {
    const ok = await store.removeFoto(row.id);
    if (ok) loadFotos();
  });
};

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(() => {
  store.fetchAllInfo();
  loadFotos();
});
</script>
