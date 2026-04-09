<template>
  <q-page class="q-pa-lg">
    <div class="row items-center justify-between q-mb-lg">
      <div class="text-h5 text-weight-bold">
        <q-icon name="diversity_3" color="primary" class="q-mr-sm" />Kelola Program Sosial
      </div>
      <q-btn unelevated color="primary" icon="add" label="Tambah Foto" no-caps @click="openDialog()" />
    </div>

    <!-- Filter Kategori Chips -->
    <div class="q-mb-md row items-center q-gutter-xs">
      <q-chip
        v-for="opt in kategoriOpts"
        :key="opt.value ?? 'all'"
        :label="opt.label"
        :color="filterKategori === opt.value ? 'primary' : 'grey-3'"
        :text-color="filterKategori === opt.value ? 'white' : 'dark'"
        clickable
        class="q-ma-none"
        style="font-size: 12px"
        @click="setFilter(opt.value)"
      />
    </div>

    <!-- Grid View -->
    <div v-if="sosialStore.loading" class="row q-col-gutter-md">
      <div v-for="n in 8" :key="n" class="col-12 col-sm-6 col-md-3">
        <q-skeleton height="180px" style="border-radius: 12px" />
      </div>
    </div>

    <div v-else-if="sosialStore.listAdmin.length" class="row q-col-gutter-md">
      <div
        v-for="item in sosialStore.listAdmin"
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
                    :color="kategoriColor(item.kategori)"
                    :label="kategoriLabel(item.kategori)"
                    style="font-size: 10px"
                  />
                  <q-badge color="grey-6" :label="item.tahun" style="font-size: 10px" />
                </div>
              </div>
              <div class="row no-wrap q-gutter-xs q-ml-xs">
                <q-btn flat round icon="edit" color="primary" size="xs" @click="openDialog(item)" />
                <q-btn flat round icon="delete" color="negative" size="xs" @click="confirmDelete(item)" />
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
    <div v-if="sosialStore.meta.totalPages > 1" class="row justify-center q-mt-lg">
      <q-pagination
        v-model="currentPage"
        :max="sosialStore.meta.totalPages"
        boundary-numbers
        @update:model-value="onPageChange"
      />
    </div>

    <!-- ─── Dialog Form ──────────────────────────────────────────────── -->
    <q-dialog v-model="dialog" persistent>
      <q-card style="width: 540px; max-width: 96vw">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ isEdit ? 'Edit Foto' : 'Tambah Foto' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-form @submit="save" class="q-gutter-md">
            <q-input
              v-model="form.judul"
              outlined
              :label="isBatchCreate ? 'Judul Dasar (opsional untuk batch)' : 'Judul Foto *'"
              :rules="[v => isBatchCreate || !!v || 'Wajib diisi']"
            />

            <q-select
              v-model="form.kategori"
              outlined
              label="Program Sosial *"
              :options="kategoriOpts.filter(o => o.value !== null)"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              :rules="[v => !!v || 'Wajib dipilih']"
            />

            <q-select
              v-model="form.tahun"
              outlined
              label="Tahun *"
              :options="tahunOptions"
              emit-value
              map-options
              :rules="[v => !!v || 'Wajib dipilih']"
            />

            <q-input
              v-model="form.deskripsi"
              outlined
              label="Keterangan Foto (opsional)"
              type="textarea"
              rows="3"
            />

            <q-input
              v-model.number="form.urutan"
              outlined
              type="number"
              label="Urutan Tampil"
              hint="Angka lebih kecil tampil lebih dulu"
            />

            <q-file
              v-model="form.fotoFile"
              outlined
              :multiple="!isEdit"
              use-chips
              :label="isEdit ? 'Ganti Foto (opsional)' : 'Pilih Satu / Banyak Foto *'"
              accept="image/*"
              :rules="isEdit ? [] : [v => normalizeFiles(v).length > 0 || 'Foto wajib diunggah']"
            >
              <template #prepend><q-icon name="photo_camera" /></template>
            </q-file>

            <div v-if="isBatchCreate" class="text-caption text-grey-6">
              Jika judul dasar dikosongkan, judul tiap foto akan otomatis mengikuti nama file. Urutan tampil akan bertambah otomatis.
            </div>

            <!-- Preview -->
            <div v-if="previewUrl" class="q-mt-sm">
              <q-img :src="previewUrl" :ratio="16/9" fit="cover" style="border-radius: 10px; max-height: 180px" />
            </div>

            <div class="row justify-end q-gutter-sm q-mt-sm">
              <q-btn flat no-caps label="Batal" v-close-popup />
              <q-btn
                unelevated color="primary" no-caps type="submit"
                :label="isEdit ? 'Simpan' : 'Tambah'"
                :loading="saving"
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
import { useSosialStore } from 'src/stores/sosial';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const sosialStore = useSosialStore();

const dialog = ref(false);
const isEdit = ref(false);
const saving = ref(false);
const editId = ref(null);
const filterKategori = ref(null);
const currentPage = ref(1);

const kategoriOpts = [
  { label: 'Semua', value: null },
  { label: 'Santunan Anak Yatim', value: 'SANTUNAN_ANAK_YATIM' },
  { label: 'Air Galon Gratis', value: 'AIR_GALON_GRATIS' },
  { label: 'Layanan Kesehatan Ibu & Anak', value: 'LAYANAN_KESEHATAN_IBU_ANAK' },
  { label: 'Armalah & Al Miskin', value: 'ARMALAH_AL_MISKIN' },
  { label: 'Bantuan Pengobatan', value: 'BANTUAN_PENGOBATAN' },
  { label: 'Zakat Maal', value: 'ZAKAT_MAAL' },
];

const KATEGORI_COLORS = {
  SANTUNAN_ANAK_YATIM: 'indigo',
  AIR_GALON_GRATIS: 'cyan-8',
  LAYANAN_KESEHATAN_IBU_ANAK: 'green-8',
  ARMALAH_AL_MISKIN: 'purple',
  BANTUAN_PENGOBATAN: 'red-8',
  ZAKAT_MAAL: 'orange-9',
};

const kategoriColor = (k) => KATEGORI_COLORS[k] || 'grey';
const kategoriLabel = (k) => (kategoriOpts.find(o => o.value === k)?.label ?? k);

const currentYear = new Date().getFullYear();
const tahunOptions = Array.from({ length: 5 }, (_, i) => {
  const y = currentYear - i;
  return { label: String(y), value: y };
});

const emptyForm = () => ({ judul: '', kategori: 'SANTUNAN_ANAK_YATIM', tahun: currentYear, deskripsi: '', urutan: 0, fotoFile: null });
const form = reactive(emptyForm());

const previewUrl = computed(() => {
  if (form.fotoFile instanceof File) return URL.createObjectURL(form.fotoFile);
  return null;
});
const normalizeFiles = (value) => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};
const isBatchCreate = computed(() => !isEdit.value && normalizeFiles(form.fotoFile).length > 1);

const setFilter = (val) => {
  filterKategori.value = val;
  currentPage.value = 1;
  loadData();
};

const loadData = () => {
  sosialStore.fetchAdmin({ kategori: filterKategori.value || undefined, page: currentPage.value });
};

const onPageChange = (page) => {
  currentPage.value = page;
  loadData();
};

const openDialog = (row = null) => {
  if (row) {
    isEdit.value = true;
    editId.value = row.id;
    Object.assign(form, {
      judul: row.judul,
      kategori: row.kategori,
      tahun: row.tahun ?? currentYear,
      deskripsi: row.deskripsi || '',
      urutan: row.urutan ?? 0,
      fotoFile: null,
    });
  } else {
    isEdit.value = false;
    editId.value = null;
    Object.assign(form, emptyForm());
  }
  dialog.value = true;
};

const save = async () => {
  saving.value = true;
  const payload = { judul: form.judul, kategori: form.kategori, tahun: form.tahun, deskripsi: form.deskripsi, urutan: form.urutan };
  if (normalizeFiles(form.fotoFile).length) payload.foto = normalizeFiles(form.fotoFile);

  const result = isEdit.value
    ? await sosialStore.update(editId.value, payload)
    : await sosialStore.create(payload);

  saving.value = false;
  if (result) {
    dialog.value = false;
    loadData();
  }
};

const confirmDelete = (row) => {
  $q.dialog({
    title: 'Hapus Foto',
    message: `Yakin ingin menghapus foto "${row.judul}"?`,
    cancel: { flat: true, label: 'Batal' },
    ok: { unelevated: true, color: 'negative', label: 'Hapus' },
    persistent: true,
  }).onOk(async () => {
    const ok = await sosialStore.remove(row.id);
    if (ok) loadData();
  });
};

onMounted(loadData);
</script>
