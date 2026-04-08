<template>
  <q-page class="q-pa-lg">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-lg">
      <div class="text-h5 text-weight-bold">
        <q-icon name="storefront" color="primary" class="q-mr-sm" />Kelola Usaha
      </div>
    </div>

    <!-- Main Tabs -->
    <q-tabs
      v-model="mainTab"
      no-caps
      narrow-indicator
      align="left"
      class="q-mb-lg"
      active-color="primary"
      indicator-color="primary"
    >
      <q-tab name="umroh" icon="flight" label="Program Umroh" />
      <q-tab name="mart" icon="storefront" label="Mias Mart" />
    </q-tabs>

    <q-tab-panels v-model="mainTab" animated keep-alive>

      <!-- ═══════════════════════════════════════════════ TAB: UMROH -->
      <q-tab-panel name="umroh" class="q-pa-none">
        <div class="row items-center justify-between q-mb-md">
          <div class="text-subtitle1 text-weight-bold text-grey-8">Daftar Program Umroh</div>
          <q-btn unelevated color="primary" icon="add" label="Tambah Program" no-caps @click="openUmrohDialog()" />
        </div>

        <!-- Loading -->
        <div v-if="umrohStore.loading" class="row q-col-gutter-md">
          <div v-for="n in 4" :key="n" class="col-12 col-sm-6 col-md-3">
            <q-skeleton height="280px" style="border-radius: 12px" />
          </div>
        </div>

        <!-- Cards -->
        <div v-else-if="umrohStore.listAdmin.length" class="row q-col-gutter-md">
          <div
            v-for="item in umrohStore.listAdmin"
            :key="item.id"
            class="col-12 col-sm-6 col-md-4 col-lg-3"
          >
            <q-card flat bordered style="border-radius: 14px; overflow: hidden">
              <q-img :src="item.flyer" :ratio="3/4" fit="cover">
                <template #error>
                  <div class="absolute-full flex flex-center bg-grey-2 text-grey-5">
                    <q-icon name="broken_image" size="36px" />
                  </div>
                </template>
                <!-- Status badge -->
                <div class="absolute-top-right q-ma-xs">
                  <q-badge :color="item.isActive ? 'positive' : 'grey-6'" :label="item.isActive ? 'Aktif' : 'Non-aktif'" style="font-size: 10px" />
                </div>
              </q-img>
              <q-card-section class="q-py-sm q-px-md">
                <div class="text-caption text-weight-bold ellipsis">{{ item.judul }}</div>
                <div v-if="item.harga" class="text-caption text-primary text-weight-bold q-mt-xs">
                  {{ formatRupiah(item.harga) }}
                </div>
                <div v-if="item.deskripsi" class="text-caption text-grey-6 q-mt-xs ellipsis-2-lines">
                  {{ item.deskripsi }}
                </div>
              </q-card-section>
              <q-card-actions align="right" class="q-pt-none">
                <q-btn flat round icon="edit" color="primary" size="xs" @click="openUmrohDialog(item)" />
                <q-btn flat round icon="delete" color="negative" size="xs" @click="confirmDeleteUmroh(item)" />
              </q-card-actions>
            </q-card>
          </div>
        </div>

        <div v-else class="text-center q-py-xl">
          <q-icon name="flight_takeoff" size="64px" color="grey-4" />
          <div class="text-grey-6 q-mt-md">Belum ada program umroh</div>
        </div>

        <!-- Pagination -->
        <div v-if="umrohStore.meta.totalPages > 1" class="row justify-center q-mt-lg">
          <q-pagination v-model="umrohPage" :max="umrohStore.meta.totalPages" boundary-numbers @update:model-value="loadUmroh" />
        </div>
      </q-tab-panel>

      <!-- ═══════════════════════════════════════════════ TAB: MART -->
      <q-tab-panel name="mart" class="q-pa-none">
        <div class="row items-center justify-between q-mb-md">
          <div class="text-subtitle1 text-weight-bold text-grey-8">Daftar Produk</div>
          <q-btn unelevated color="primary" icon="add" label="Tambah Produk" no-caps @click="openMartDialog()" />
        </div>

        <!-- Loading -->
        <div v-if="martStore.loading" class="row q-col-gutter-md">
          <div v-for="n in 8" :key="n" class="col-12 col-sm-6 col-md-3">
            <q-skeleton height="260px" style="border-radius: 12px" />
          </div>
        </div>

        <!-- Table -->
        <q-table
          v-else
          :rows="martStore.listAdmin"
          :columns="martColumns"
          row-key="id"
          flat
          bordered
          :pagination="{ rowsPerPage: 0 }"
          hide-pagination
          style="border-radius: 12px"
        >
          <template #body-cell-foto="props">
            <q-td :props="props">
              <q-img :src="props.row.foto" width="56px" height="56px" fit="cover" style="border-radius: 8px" />
            </q-td>
          </template>
          <template #body-cell-harga="props">
            <q-td :props="props">
              <span class="text-weight-bold text-primary">{{ formatRupiah(props.row.harga) }}</span>
            </q-td>
          </template>
          <template #body-cell-isActive="props">
            <q-td :props="props">
              <q-badge :color="props.row.isActive ? 'positive' : 'grey-6'" :label="props.row.isActive ? 'Aktif' : 'Non-aktif'" />
            </q-td>
          </template>
          <template #body-cell-linkBeli="props">
            <q-td :props="props">
              <a v-if="props.row.linkBeli" :href="props.row.linkBeli" target="_blank" class="text-primary">
                <q-icon name="open_in_new" size="16px" /> Link
              </a>
              <span v-else class="text-grey-5">–</span>
            </q-td>
          </template>
          <template #body-cell-aksi="props">
            <q-td :props="props">
              <q-btn flat round icon="edit" color="primary" size="sm" @click="openMartDialog(props.row)" />
              <q-btn flat round icon="delete" color="negative" size="sm" @click="confirmDeleteMart(props.row)" />
            </q-td>
          </template>
        </q-table>

        <div v-if="!martStore.loading && !martStore.listAdmin.length" class="text-center q-py-xl">
          <q-icon name="storefront" size="64px" color="grey-4" />
          <div class="text-grey-6 q-mt-md">Belum ada produk</div>
        </div>

        <!-- Pagination -->
        <div v-if="martStore.meta.totalPages > 1" class="row justify-center q-mt-lg">
          <q-pagination v-model="martPage" :max="martStore.meta.totalPages" boundary-numbers @update:model-value="loadMart" />
        </div>
      </q-tab-panel>
    </q-tab-panels>

    <!-- ─── Dialog: Umroh ─────────────────────────────────────────────────── -->
    <q-dialog v-model="umrohDialog" persistent>
      <q-card style="width: 560px; max-width: 96vw">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ isUmrohEdit ? 'Edit Program Umroh' : 'Tambah Program Umroh' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-form @submit="saveUmroh" class="q-gutter-md">
            <q-input
              v-model="umrohForm.judul"
              outlined
              label="Judul Program *"
              :rules="[v => !!v || 'Wajib diisi']"
            />

            <q-input
              v-model="umrohForm.harga"
              outlined
              type="number"
              label="Harga (opsional)"
              prefix="Rp"
              hint="Kosongi jika tidak ingin menampilkan harga"
            />

            <q-input
              v-model="umrohForm.deskripsi"
              outlined
              label="Deskripsi Promosi"
              type="textarea"
              rows="4"
            />

            <q-input
              v-model.number="umrohForm.urutan"
              outlined
              type="number"
              label="Urutan Tampil"
              hint="Angka lebih kecil tampil lebih dulu"
            />

            <q-toggle
              v-model="umrohForm.isActive"
              label="Tampilkan di website"
              color="primary"
            />

            <q-file
              v-model="umrohForm.flyerFile"
              outlined
              :label="isUmrohEdit ? 'Ganti Flyer (opsional)' : 'File Flyer *'"
              accept="image/*"
              :rules="isUmrohEdit ? [] : [v => !!v || 'Flyer wajib diunggah']"
            >
              <template #prepend><q-icon name="image" /></template>
            </q-file>

            <!-- Preview -->
            <div v-if="umrohPreviewUrl" class="q-mt-sm">
              <q-img :src="umrohPreviewUrl" :ratio="3/4" fit="cover" style="border-radius: 10px; max-height: 220px" />
            </div>

            <div class="row justify-end q-gutter-sm q-mt-sm">
              <q-btn flat no-caps label="Batal" v-close-popup />
              <q-btn
                unelevated color="primary" no-caps type="submit"
                :label="isUmrohEdit ? 'Simpan' : 'Tambah'"
                :loading="savingUmroh"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- ─── Dialog: Mias Mart ─────────────────────────────────────────────── -->
    <q-dialog v-model="martDialog" persistent>
      <q-card style="width: 580px; max-width: 96vw">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ isMartEdit ? 'Edit Produk' : 'Tambah Produk' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-form @submit="saveMart" class="q-gutter-md">
            <q-input
              v-model="martForm.nama"
              outlined
              label="Nama Produk *"
              :rules="[v => !!v || 'Wajib diisi']"
            />

            <q-input
              v-model="martForm.harga"
              outlined
              type="number"
              label="Harga *"
              prefix="Rp"
              :rules="[v => !!v || 'Harga wajib diisi', v => Number(v) > 0 || 'Harga harus lebih dari 0']"
            />

            <q-input
              v-model="martForm.deskripsi"
              outlined
              label="Deskripsi Produk"
              type="textarea"
              rows="3"
            />

            <q-input
              v-model="martForm.linkBeli"
              outlined
              label="Link Pembelian (opsional)"
              hint="Bisa link WhatsApp, Tokopedia, Shopee, dll"
              placeholder="https://"
            />

            <q-input
              v-model="martForm.stok"
              outlined
              label="Keterangan Stok (opsional)"
              placeholder="Contoh: Tersedia, Habis, Pre-order"
            />

            <q-input
              v-model.number="martForm.urutan"
              outlined
              type="number"
              label="Urutan Tampil"
            />

            <q-toggle
              v-model="martForm.isActive"
              label="Tampilkan di website"
              color="primary"
            />

            <q-file
              v-model="martForm.fotoFile"
              outlined
              :label="isMartEdit ? 'Ganti Foto Produk (opsional)' : 'Foto Produk *'"
              accept="image/*"
              :rules="isMartEdit ? [] : [v => !!v || 'Foto wajib diunggah']"
            >
              <template #prepend><q-icon name="photo_camera" /></template>
            </q-file>

            <!-- Preview -->
            <div v-if="martPreviewUrl" class="q-mt-sm">
              <q-img :src="martPreviewUrl" :ratio="1" fit="cover" style="border-radius: 10px; max-height: 180px; max-width: 180px" />
            </div>

            <div class="row justify-end q-gutter-sm q-mt-sm">
              <q-btn flat no-caps label="Batal" v-close-popup />
              <q-btn
                unelevated color="primary" no-caps type="submit"
                :label="isMartEdit ? 'Simpan' : 'Tambah'"
                :loading="savingMart"
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
import { useUmrohStore, useMartStore } from 'src/stores/usaha';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const umrohStore = useUmrohStore();
const martStore = useMartStore();

const mainTab = ref('umroh');

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatRupiah = (val) => {
  const num = Number(val);
  if (!num) return '–';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
};

// ═══════════════════════════════════════════════════════════════════
//  UMROH
// ═══════════════════════════════════════════════════════════════════
const umrohPage = ref(1);
const umrohDialog = ref(false);
const isUmrohEdit = ref(false);
const savingUmroh = ref(false);
const editUmrohId = ref(null);

const emptyUmrohForm = () => ({ judul: '', harga: '', deskripsi: '', urutan: 0, isActive: true, flyerFile: null });
const umrohForm = reactive(emptyUmrohForm());

const umrohPreviewUrl = computed(() => {
  if (umrohForm.flyerFile instanceof File) return URL.createObjectURL(umrohForm.flyerFile);
  return null;
});

const loadUmroh = (page = umrohPage.value) => {
  umrohPage.value = page;
  umrohStore.fetchAdmin({ page });
};

const openUmrohDialog = (row = null) => {
  if (row) {
    isUmrohEdit.value = true;
    editUmrohId.value = row.id;
    Object.assign(umrohForm, {
      judul: row.judul,
      harga: row.harga ? String(row.harga) : '',
      deskripsi: row.deskripsi || '',
      urutan: row.urutan ?? 0,
      isActive: row.isActive,
      flyerFile: null,
    });
  } else {
    isUmrohEdit.value = false;
    editUmrohId.value = null;
    Object.assign(umrohForm, emptyUmrohForm());
  }
  umrohDialog.value = true;
};

const saveUmroh = async () => {
  savingUmroh.value = true;
  const payload = {
    judul: umrohForm.judul,
    deskripsi: umrohForm.deskripsi || undefined,
    urutan: umrohForm.urutan,
    isActive: umrohForm.isActive,
  };
  if (umrohForm.harga) payload.harga = umrohForm.harga;
  if (umrohForm.flyerFile) payload.flyer = umrohForm.flyerFile;

  const result = isUmrohEdit.value
    ? await umrohStore.update(editUmrohId.value, payload)
    : await umrohStore.create(payload);

  savingUmroh.value = false;
  if (result) {
    umrohDialog.value = false;
    loadUmroh();
  }
};

const confirmDeleteUmroh = (row) => {
  $q.dialog({
    title: 'Hapus Program',
    message: `Yakin ingin menghapus program "${row.judul}"?`,
    cancel: { flat: true, label: 'Batal' },
    ok: { unelevated: true, color: 'negative', label: 'Hapus' },
    persistent: true,
  }).onOk(async () => {
    const ok = await umrohStore.remove(row.id);
    if (ok) loadUmroh();
  });
};

// ═══════════════════════════════════════════════════════════════════
//  MIAS MART
// ═══════════════════════════════════════════════════════════════════
const martPage = ref(1);
const martDialog = ref(false);
const isMartEdit = ref(false);
const savingMart = ref(false);
const editMartId = ref(null);

const martColumns = [
  { name: 'foto', label: 'Foto', field: 'foto', align: 'left' },
  { name: 'nama', label: 'Nama Produk', field: 'nama', align: 'left', sortable: true },
  { name: 'harga', label: 'Harga', field: 'harga', align: 'left', sortable: true },
  { name: 'stok', label: 'Stok', field: 'stok', align: 'left' },
  { name: 'linkBeli', label: 'Link Beli', field: 'linkBeli', align: 'center' },
  { name: 'isActive', label: 'Status', field: 'isActive', align: 'center' },
  { name: 'urutan', label: 'Urutan', field: 'urutan', align: 'center' },
  { name: 'aksi', label: 'Aksi', field: 'aksi', align: 'center' },
];

const emptyMartForm = () => ({
  nama: '', harga: '', deskripsi: '', linkBeli: '', stok: '', urutan: 0, isActive: true, fotoFile: null,
});
const martForm = reactive(emptyMartForm());

const martPreviewUrl = computed(() => {
  if (martForm.fotoFile instanceof File) return URL.createObjectURL(martForm.fotoFile);
  return null;
});

const loadMart = (page = martPage.value) => {
  martPage.value = page;
  martStore.fetchAdmin({ page });
};

const openMartDialog = (row = null) => {
  if (row) {
    isMartEdit.value = true;
    editMartId.value = row.id;
    Object.assign(martForm, {
      nama: row.nama,
      harga: String(row.harga),
      deskripsi: row.deskripsi || '',
      linkBeli: row.linkBeli || '',
      stok: row.stok || '',
      urutan: row.urutan ?? 0,
      isActive: row.isActive,
      fotoFile: null,
    });
  } else {
    isMartEdit.value = false;
    editMartId.value = null;
    Object.assign(martForm, emptyMartForm());
  }
  martDialog.value = true;
};

const saveMart = async () => {
  savingMart.value = true;
  const payload = {
    nama: martForm.nama,
    harga: martForm.harga,
    deskripsi: martForm.deskripsi || undefined,
    linkBeli: martForm.linkBeli || undefined,
    stok: martForm.stok || undefined,
    urutan: martForm.urutan,
    isActive: martForm.isActive,
  };
  if (martForm.fotoFile) payload.foto = martForm.fotoFile;

  const result = isMartEdit.value
    ? await martStore.update(editMartId.value, payload)
    : await martStore.create(payload);

  savingMart.value = false;
  if (result) {
    martDialog.value = false;
    loadMart();
  }
};

const confirmDeleteMart = (row) => {
  $q.dialog({
    title: 'Hapus Produk',
    message: `Yakin ingin menghapus produk "${row.nama}"?`,
    cancel: { flat: true, label: 'Batal' },
    ok: { unelevated: true, color: 'negative', label: 'Hapus' },
    persistent: true,
  }).onOk(async () => {
    const ok = await martStore.remove(row.id);
    if (ok) loadMart();
  });
};

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(() => {
  loadUmroh();
  loadMart();
});
</script>
