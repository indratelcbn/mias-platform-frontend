<template>
  <q-page class="q-pa-sm q-pa-md-lg">
    <!-- Header -->
    <div class="row items-start justify-between q-mb-lg">
      <div class="q-mb-sm">
        <div class="text-h5 text-weight-bold">Pengajuan Keuangan</div>
        <div class="text-caption text-grey-6">Buat dan kelola pengajuan dana</div>
      </div>
      <div class="row q-gutter-xs">
        <q-btn flat color="deep-orange" icon="picture_as_pdf" label="Cetak Laporan" no-caps @click="exportListPDF" />
        <q-btn unelevated color="primary" icon="add" label="Tambah Pengajuan" no-caps @click="openJenisDialog()" />
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="row q-col-gutter-sm q-mb-lg" v-if="submissionStore.summary">
      <div class="col-6 col-sm-6 col-md-3" v-for="card in summaryCards" :key="card.key">
        <q-card flat bordered class="rounded-xl cursor-pointer" @click="filterByStatus(card.status)">
          <q-card-section>
            <div class="row items-center">
              <q-icon :name="card.icon" :color="card.color" size="32px" class="q-mr-md" />
              <div>
                <div class="text-caption text-grey-6">{{ card.label }}</div>
                <div class="text-h6 text-weight-bold" :class="'text-' + card.color">{{ card.count }}</div>
                <div class="text-caption text-grey-7">{{ formatCurrency(card.amount) }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Filters -->
    <q-card flat bordered class="rounded-xl q-mb-md">
      <q-card-section>
        <div class="row q-gutter-md items-center">
          <q-select v-model="filters.status" :options="statusOptions" label="Status" outlined dense emit-value
            map-options clearable class="col-auto" style="min-width: 180px" @update:model-value="applyFilters" />
          <q-btn flat dense icon="filter_list_off" label="Reset" no-caps @click="resetFilters" />
        </div>
      </q-card-section>
    </q-card>

    <!-- Loading -->
    <div v-if="submissionStore.loading && submissionStore.submissions.length === 0" class="flex flex-center q-py-xl">
      <q-spinner-dots size="48px" color="primary" />
    </div>

    <!-- Table -->
    <q-card v-else flat bordered class="rounded-xl">
      <q-table :rows="submissionStore.submissions" :columns="columns" row-key="id" :loading="submissionStore.loading"
        flat :rows-per-page-options="[10, 20, 50]" :pagination="pagination" @request="onRequest">
        <template #body-cell-nomor="props">
          <q-td>
            <span class="text-weight-medium">{{ props.row.nomor || '-' }}</span>
          </q-td>
        </template>

        <template #body-cell-judul="props">
          <q-td style="white-space: normal; max-width: 350px">
            <div class="text-weight-medium">{{ props.row.judul }}</div>
            <div v-if="props.row.deskripsi" class="text-caption text-grey-6" style="word-break: break-word">
              {{ props.row.deskripsi }}
            </div>
          </q-td>
        </template>

        <template #body-cell-amount="props">
          <q-td>
            <span class="text-weight-bold text-primary">{{ formatCurrency(props.row.amount) }}</span>
          </q-td>
        </template>

        <template #body-cell-status="props">
          <q-td>
            <q-badge :color="statusColor(props.row.status)" :label="statusLabel(props.row.status)" />
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td>
            <div class="row no-wrap q-gutter-xs">
              <q-btn flat dense icon="visibility" color="info" size="sm" @click="openDetailDialog(props.row)">
                <q-tooltip>Detail</q-tooltip>
              </q-btn>
              <q-btn flat dense icon="picture_as_pdf" color="deep-orange" size="sm" @click="exportSinglePDF(props.row)">
                <q-tooltip>Cetak PDF</q-tooltip>
              </q-btn>

              <template v-if="props.row.status === 'DRAFT'">
                <q-btn flat dense icon="edit" color="primary" size="sm" @click="openFormDialog(props.row)">
                  <q-tooltip>Edit</q-tooltip>
                </q-btn>
                <q-btn flat dense icon="send" color="green" size="sm" @click="confirmSubmit(props.row)">
                  <q-tooltip>Ajukan</q-tooltip>
                </q-btn>
                <q-btn flat dense icon="delete" color="negative" size="sm" @click="confirmDelete(props.row)">
                  <q-tooltip>Hapus</q-tooltip>
                </q-btn>
              </template>

              <template v-if="props.row.status === 'SUBMITTED' && canApprove">
                <q-btn flat dense icon="check_circle" color="positive" size="sm" @click="confirmApprove(props.row)">
                  <q-tooltip>Setujui</q-tooltip>
                </q-btn>
                <q-btn flat dense icon="cancel" color="negative" size="sm" @click="openRejectDialog(props.row)">
                  <q-tooltip>Tolak</q-tooltip>
                </q-btn>
              </template>

              <template v-if="props.row.status === 'APPROVED' && canDisburse">
                <q-btn flat dense icon="attach_money" color="green-7" size="sm" @click="openDisburseDialog(props.row)">
                  <q-tooltip>Cairkan Dana</q-tooltip>
                </q-btn>
              </template>
            </div>
          </q-td>
        </template>

        <template #no-data>
          <div class="full-width row flex-center q-py-xl">
            <div class="text-grey-6 text-center">
              <q-icon name="inbox" size="48px" />
              <div class="text-h6 q-mt-sm">Belum ada pengajuan</div>
              <q-btn unelevated color="primary" icon="add" label="Buat Pengajuan Pertama" no-caps class="q-mt-md"
                @click="openJenisDialog()" />
            </div>
          </div>
        </template>
      </q-table>
    </q-card>

    <!-- Jenis Pengajuan Dialog -->
    <q-dialog v-model="jenisDialogOpen" persistent>
      <q-card style="width: min(440px, 95vw); max-width: 95vw" class="rounded-xl">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">Pilih Jenis Pengajuan</div>
          <q-space />
          <q-btn flat dense icon="close" v-close-popup />
        </q-card-section>
        <q-card-section>
          <div class="text-caption text-grey-7 q-mb-sm">Tentukan jenis pengajuan yang akan dibuat.</div>
          <q-option-group v-model="selectedJenis" :options="jenisOptions" color="primary" type="radio">
            <template #label="opt">
              <div class="q-ml-xs">
                <div class="text-weight-medium">{{ opt.label }}</div>
                <div class="text-caption text-grey-6">{{ opt.desc }}</div>
              </div>
            </template>
          </q-option-group>
          <div class="row justify-end q-gutter-sm q-mt-md">
            <q-btn flat label="Batal" color="grey-7" no-caps v-close-popup />
            <q-btn unelevated label="Lanjutkan" color="primary" no-caps @click="proceedJenis" />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Form Dialog (Create/Edit) -->
    <q-dialog v-model="formDialogOpen" persistent full-width>
      <q-card style="width: min(700px, 95vw); max-width: 95vw" class="rounded-xl">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">{{ formDialogTitle }}</div>
          <q-space />
          <q-btn flat dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section class="scroll" style="max-height: 70vh">
          <q-form @submit="handleSubmit" class="q-gutter-md" ref="formRef">
            <!-- Info Pengajuan -->
            <q-input v-model="form.judul" label="Judul Pengajuan *" outlined dense
              hint="Contoh: Pengadaan Sound System untuk Kajian Akbar" :rules="[val => !!val || 'Judul wajib diisi']" />

            <q-input v-model="form.deskripsi" label="Deskripsi (opsional)" outlined dense type="textarea" rows="2"
              hint="Jelaskan tujuan dan rincian kebutuhan" />

            <q-separator />

            <!-- Rincian Item (Pengajuan Umum) -->
            <div v-if="form.jenis === 'UMUM'">
              <div class="text-subtitle2 text-weight-bold q-mb-sm">Rincian Item</div>

              <!-- Input Tambah Item -->
              <q-card flat bordered class="bg-blue-1 q-mb-sm">
                <q-card-section class="q-pa-sm">
                  <div class="row q-col-gutter-sm items-end">
                    <div class="col-12 col-sm-4">
                      <q-select v-model="newItem.namaBarang" :options="itemNameFiltered" label="Nama Item *" outlined
                        dense bg-color="white" use-input hide-selected fill-input hide-dropdown-icon input-debounce="0"
                        new-value-mode="add-unique" @filter="filterItemName"
                        @input-value="val => newItem.namaBarang = val" @keyup.enter="addItem" />
                    </div>
                    <div class="col-6 col-sm-1">
                      <q-input v-model.number="newItem.qty" label="Qty" outlined dense type="number" min="1"
                        bg-color="white" />
                    </div>
                    <div class="col-6 col-sm-2">
                      <q-input :model-value="formatNumberInput(newItem.hargaSatuan)"
                        @update:model-value="val => newItem.hargaSatuan = parseNumberInput(val)" label="Harga Satuan"
                        outlined dense prefix="Rp" inputmode="numeric" bg-color="white" />
                    </div>
                    <div class="col-12 col-sm-3">
                      <q-input v-model="newItem.keterangan" label="Keterangan (opsional)" outlined dense
                        bg-color="white" @keyup.enter="addItem" />
                    </div>
                    <div class="col-12 col-sm-2">
                      <q-btn unelevated :color="editingItemIdx !== null ? 'orange-8' : 'primary'"
                        :icon="editingItemIdx !== null ? 'save' : 'add'"
                        :label="editingItemIdx !== null ? 'Update' : 'Tambah Item'" no-caps @click="addItem" />
                      <q-btn v-if="editingItemIdx !== null" flat dense size="sm" color="grey-7" label="Batal" no-caps
                        class="q-mt-xs" @click="cancelEditItem" />
                    </div>
                    <div class="col-12 col-sm-6 flex justify-end">
                      <div class="text-caption text-grey-7 self-center q-mr-sm"
                        v-if="newItem.qty && newItem.hargaSatuan">
                        Subtotal: <strong class="text-primary">{{ formatCurrency(newItem.qty * newItem.hargaSatuan)
                          }}</strong>
                      </div>

                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <!-- Tabel Item yang Sudah Ditambahkan -->
              <div v-if="form.items.length === 0" class="text-center q-py-md text-grey-6 rounded-borders"
                style="border: 1px dashed #ccc">
                <q-icon name="shopping_cart" size="28px" />
                <div class="text-caption q-mt-xs">Belum ada item — isi form di atas lalu klik Tambah Item</div>
              </div>
              <q-table v-else :rows="form.items" :columns="formItemColumns" row-key="idx" flat bordered dense
                hide-pagination :rows-per-page-options="[0]">
                <template #body-cell-no="props">
                  <q-td class="text-center text-grey-7">{{ props.rowIndex + 1 }}</q-td>
                </template>
                <template #body-cell-hargaSatuan="props">
                  <q-td class="text-right">{{ formatCurrency(props.row.hargaSatuan) }}</q-td>
                </template>
                <template #body-cell-subtotal="props">
                  <q-td class="text-right text-weight-medium text-primary">{{ formatCurrency(props.row.qty *
                    props.row.hargaSatuan) }}</q-td>
                </template>
                <template #body-cell-aksi="props">
                  <q-td class="text-center">
                    <q-btn flat dense round icon="edit" color="primary" size="sm" @click="editItem(props.rowIndex)">
                      <q-tooltip>Edit</q-tooltip>
                    </q-btn>
                    <q-btn flat dense round icon="delete" color="negative" size="sm"
                      @click="removeItem(props.rowIndex)">
                      <q-tooltip>Hapus</q-tooltip>
                    </q-btn>
                  </q-td>
                </template>
                <template v-slot:bottom-row>
                  <q-tr class="bg-grey-2">
                    <q-td colspan="4" class="text-right text-weight-bold">Total</q-td>
                    <q-td class="text-right text-weight-bold text-primary">{{ formatCurrency(totalAmount) }}</q-td>
                    <q-td colspan="2"></q-td>
                  </q-tr>
                </template>
              </q-table>
            </div>

            <!-- Rincian Item (Pengajuan Kajian) -->
            <div v-else-if="form.jenis === 'KAJIAN'">
              <div class="row items-center q-mb-sm">
                <div class="text-subtitle2 text-weight-bold">Rincian Sub Judul & Item</div>
                <q-space />
                <q-btn dense unelevated color="secondary" icon="add" label="Tambah Sub Judul" no-caps size="sm"
                  @click="addGroup" />
              </div>

              <div v-if="form.groups.length === 0" class="text-center q-py-md text-grey-6 rounded-borders"
                style="border: 1px dashed #ccc">
                <q-icon name="playlist_add" size="28px" />
                <div class="text-caption q-mt-xs">Belum ada sub judul — klik "Tambah Sub Judul"</div>
              </div>

              <q-card v-for="(group, gIdx) in form.groups" :key="gIdx" flat bordered class="q-mb-md">
                <q-card-section class="q-pa-sm">
                  <div class="row items-start q-col-gutter-sm q-mb-sm">
                    <div class="col-12 col-sm-3">
                      <q-input v-model="group.subJudul" :label="'Sub Judul Pengajuan #' + (gIdx + 1) + ' *'" outlined
                        dense placeholder="Contoh: Kajian Ustadz Fadhlan" />
                    </div>
                    <div class="col-6 col-sm-2">
                      <q-input :model-value="group.subTanggal"
                        @update:model-value="val => onGroupTanggalChange(group, val)" label="Tanggal" outlined dense
                        type="date" />
                    </div>
                    <div class="col-6 col-sm-2">
                      <q-input :model-value="group.subHari" label="Hari" outlined dense readonly placeholder="Otomatis"
                        bg-color="grey-2" />
                    </div>
                    <div class="col-6 col-sm-2">
                      <q-select :model-value="group.waktuOption"
                        @update:model-value="val => onGroupWaktuChange(group, val)" :options="waktuOptions" label="Jam"
                        outlined dense clearable />
                    </div>
                    <div v-if="group.waktuOption === 'Lainnya'" class="col-6 col-sm-2">
                      <q-input v-model="group.subWaktu" label="Isi Jam Manual *" outlined dense
                        placeholder="Contoh: 19.30 - 21.00 WIB" />
                    </div>
                    <div class="col-auto">
                      <q-btn flat dense round icon="delete" color="negative" @click="removeGroup(gIdx)">
                        <q-tooltip>Hapus Sub Judul</q-tooltip>
                      </q-btn>
                    </div>
                  </div>

                  <!-- Input Tambah Item ke Sub Judul -->
                  <div class="row q-col-gutter-sm items-end bg-blue-1 rounded-borders q-pa-sm q-mb-sm">
                    <div class="col-12 col-sm-4">
                      <q-select v-model="group.newItem.namaBarang" :options="itemNameFiltered" label="Nama Item *"
                        outlined dense bg-color="white" use-input hide-selected fill-input hide-dropdown-icon
                        input-debounce="0" new-value-mode="add-unique" @filter="filterItemName"
                        @input-value="val => group.newItem.namaBarang = val" @keyup.enter="addGroupItem(gIdx)" />
                    </div>
                    <div class="col-6 col-sm-1">
                      <q-input v-model.number="group.newItem.qty" label="Qty" outlined dense type="number" min="1"
                        bg-color="white" />
                    </div>
                    <div class="col-6 col-sm-2">
                      <q-input :model-value="formatNumberInput(group.newItem.hargaSatuan)"
                        @update:model-value="val => group.newItem.hargaSatuan = parseNumberInput(val)"
                        label="Harga Satuan" outlined dense prefix="Rp" inputmode="numeric" bg-color="white" />
                    </div>
                    <div class="col-12 col-sm-3">
                      <q-input v-model="group.newItem.keterangan" label="Keterangan (opsional)" outlined dense
                        bg-color="white" @keyup.enter="addGroupItem(gIdx)" />
                    </div>
                    <div class="col-12 col-sm-2">
                      <q-btn unelevated :color="group.editingIdx != null ? 'orange-8' : 'primary'"
                        :icon="group.editingIdx != null ? 'save' : 'add'"
                        :label="group.editingIdx != null ? 'Update' : 'Item'" no-caps @click="addGroupItem(gIdx)" />
                      <q-btn v-if="group.editingIdx != null" flat dense size="sm" color="grey-7" label="Batal" no-caps
                        class="q-mt-xs" @click="cancelEditGroupItem(gIdx)" />
                    </div>
                  </div>

                  <q-table v-if="group.items.length" :rows="group.items" :columns="formItemColumns" row-key="idx" flat
                    bordered dense hide-pagination :rows-per-page-options="[0]">
                    <template #body-cell-no="props">
                      <q-td class="text-center text-grey-7">{{ props.rowIndex + 1 }}</q-td>
                    </template>
                    <template #body-cell-hargaSatuan="props">
                      <q-td class="text-right">{{ formatCurrency(props.row.hargaSatuan) }}</q-td>
                    </template>
                    <template #body-cell-subtotal="props">
                      <q-td class="text-right text-weight-medium text-primary">{{ formatCurrency(props.row.qty *
                        props.row.hargaSatuan) }}</q-td>
                    </template>
                    <template #body-cell-aksi="props">
                      <q-td class="text-center">
                        <q-btn flat dense round icon="edit" color="primary" size="sm"
                          @click="editGroupItem(gIdx, props.rowIndex)">
                          <q-tooltip>Edit</q-tooltip>
                        </q-btn>
                        <q-btn flat dense round icon="delete" color="negative" size="sm"
                          @click="removeGroupItem(gIdx, props.rowIndex)">
                          <q-tooltip>Hapus</q-tooltip>
                        </q-btn>
                      </q-td>
                    </template>
                    <template v-slot:bottom-row>
                      <q-tr class="bg-grey-2">
                        <q-td colspan="4" class="text-right text-weight-bold">Subtotal</q-td>
                        <q-td class="text-right text-weight-bold text-primary">{{ formatCurrency(groupSubtotal(group))
                          }}</q-td>
                        <q-td colspan="2"></q-td>
                      </q-tr>
                    </template>
                  </q-table>
                  <div v-else class="text-caption text-grey-6 q-pl-xs">Belum ada item pada sub judul ini.</div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Rincian Item (Pengajuan Sosial) -->
            <div v-else-if="form.jenis === 'SOSIAL'">
              <div class="row items-center q-mb-sm">
                <div class="text-subtitle2 text-weight-bold">Rincian Program & Item</div>
                <q-space />
                <q-btn dense unelevated color="secondary" icon="add" label="Tambah Program" no-caps size="sm"
                  @click="addGroup" />
              </div>
              <div class="text-caption text-grey-6 q-mb-sm">
                <q-icon name="info" size="14px" class="q-mr-xs" />Pilih <strong>Sub Judul</strong> dari daftar program
                Divisi Sosial, lalu tambahkan rincian item untuk tiap program.
              </div>

              <div v-if="form.groups.length === 0" class="text-center q-py-md text-grey-6 rounded-borders"
                style="border: 1px dashed #ccc">
                <q-icon name="volunteer_activism" size="28px" />
                <div class="text-caption q-mt-xs">Belum ada program — klik "Tambah Program"</div>
              </div>

              <q-card v-for="(group, gIdx) in form.groups" :key="gIdx" flat bordered class="q-mb-md">
                <q-card-section class="q-pa-sm">
                  <div class="row items-start q-col-gutter-sm q-mb-sm">
                    <div class="col-12 col-sm-5">
                      <q-select v-model="group.subJudul" :options="sosialProgramFiltered"
                        :label="'Sub Judul (Program Sosial) #' + (gIdx + 1) + ' *'" outlined dense use-input
                        input-debounce="0" new-value-mode="add-unique" hide-dropdown-icon fill-input hide-selected
                        @filter="filterSosialProgram" @input-value="val => group.subJudul = val"
                        placeholder="Pilih program Divisi Sosial">
                        <template #no-option>
                          <q-item>
                            <q-item-section class="text-grey-6 text-caption">
                              Belum ada program Divisi Sosial — ketik manual untuk menambah.
                            </q-item-section>
                          </q-item>
                        </template>
                      </q-select>
                    </div>
                    <div class="col-6 col-sm-3">
                      <q-input :model-value="group.subTanggal"
                        @update:model-value="val => onGroupTanggalChange(group, val)" label="Tanggal Kegiatan" outlined
                        dense type="date" />
                    </div>
                    <div class="col-6 col-sm-3">
                      <q-input :model-value="group.subHari" label="Hari" outlined dense readonly placeholder="Otomatis"
                        bg-color="grey-2" />
                    </div>
                    <div class="col-auto">
                      <q-btn flat dense round icon="delete" color="negative" @click="removeGroup(gIdx)">
                        <q-tooltip>Hapus Program</q-tooltip>
                      </q-btn>
                    </div>
                  </div>

                  <!-- Input Tambah Item ke Program -->
                  <div class="row q-col-gutter-sm items-end bg-blue-1 rounded-borders q-pa-sm q-mb-sm">
                    <div class="col-12 col-sm-4">
                      <q-select v-model="group.newItem.namaBarang" :options="itemNameFiltered" label="Nama Item *"
                        outlined dense bg-color="white" use-input hide-selected fill-input hide-dropdown-icon
                        input-debounce="0" new-value-mode="add-unique" @filter="filterItemName"
                        @input-value="val => group.newItem.namaBarang = val" @keyup.enter="addGroupItem(gIdx)" />
                    </div>
                    <div class="col-6 col-sm-1">
                      <q-input v-model.number="group.newItem.qty" label="Qty" outlined dense type="number" min="1"
                        bg-color="white" />
                    </div>
                    <div class="col-6 col-sm-2">
                      <q-input :model-value="formatNumberInput(group.newItem.hargaSatuan)"
                        @update:model-value="val => group.newItem.hargaSatuan = parseNumberInput(val)"
                        label="Harga Satuan" outlined dense prefix="Rp" inputmode="numeric" bg-color="white" />
                    </div>
                    <div class="col-12 col-sm-3">
                      <q-input v-model="group.newItem.keterangan" label="Keterangan (opsional)" outlined dense
                        bg-color="white" @keyup.enter="addGroupItem(gIdx)" />
                    </div>
                    <div class="col-12 col-sm-2">
                      <q-btn unelevated :color="group.editingIdx != null ? 'orange-8' : 'primary'"
                        :icon="group.editingIdx != null ? 'save' : 'add'"
                        :label="group.editingIdx != null ? 'Update' : 'Item'" no-caps @click="addGroupItem(gIdx)" />
                      <q-btn v-if="group.editingIdx != null" flat dense size="sm" color="grey-7" label="Batal" no-caps
                        class="q-mt-xs" @click="cancelEditGroupItem(gIdx)" />
                    </div>
                  </div>

                  <q-table v-if="group.items.length" :rows="group.items" :columns="formItemColumns" row-key="idx" flat
                    bordered dense hide-pagination :rows-per-page-options="[0]">
                    <template #body-cell-no="props">
                      <q-td class="text-center text-grey-7">{{ props.rowIndex + 1 }}</q-td>
                    </template>
                    <template #body-cell-hargaSatuan="props">
                      <q-td class="text-right">{{ formatCurrency(props.row.hargaSatuan) }}</q-td>
                    </template>
                    <template #body-cell-subtotal="props">
                      <q-td class="text-right text-weight-medium text-primary">{{ formatCurrency(props.row.qty *
                        props.row.hargaSatuan) }}</q-td>
                    </template>
                    <template #body-cell-aksi="props">
                      <q-td class="text-center">
                        <q-btn flat dense round icon="edit" color="primary" size="sm"
                          @click="editGroupItem(gIdx, props.rowIndex)">
                          <q-tooltip>Edit</q-tooltip>
                        </q-btn>
                        <q-btn flat dense round icon="delete" color="negative" size="sm"
                          @click="removeGroupItem(gIdx, props.rowIndex)">
                          <q-tooltip>Hapus</q-tooltip>
                        </q-btn>
                      </q-td>
                    </template>
                    <template v-slot:bottom-row>
                      <q-tr class="bg-grey-2">
                        <q-td colspan="4" class="text-right text-weight-bold">Subtotal</q-td>
                        <q-td class="text-right text-weight-bold text-primary">{{ formatCurrency(groupSubtotal(group))
                          }}</q-td>
                        <q-td colspan="2"></q-td>
                      </q-tr>
                    </template>
                  </q-table>
                  <div v-else class="text-caption text-grey-6 q-pl-xs">Belum ada item pada program ini.</div>
                </q-card-section>
              </q-card>
            </div>

            <q-separator class="q-my-md" />

            <!-- Metode Pencairan -->
            <div>
              <div class="text-subtitle2 text-weight-bold q-mb-sm">Metode Pencairan</div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-4">
                  <q-select v-model="form.metodePencairan" :options="metodeOptions" label="Metode" outlined dense
                    emit-value map-options clearable />
                </div>
                <div v-if="form.metodePencairan === 'TRANSFER'" class="col-12 col-md-8">
                  <div class="row q-gutter-sm items-end">
                    <q-select v-model="form.rekeningId" :options="rekeningOptions" label="Rekening Tujuan" outlined
                      dense emit-value map-options class="col" />
                    <q-btn dense flat icon="add" color="primary" size="sm" @click="openRekeningDialog">
                      <q-tooltip>Tambah Rekening</q-tooltip>
                    </q-btn>
                  </div>
                </div>
              </div>
            </div>

            <q-separator class="q-my-md" />

            <q-input v-model="form.notes" label="Catatan untuk Approver (opsional)" outlined dense type="textarea"
              rows="2" />

            <!-- Total -->
            <q-card flat class="bg-grey-1">
              <q-card-section class="row items-center justify-between q-py-sm">
                <div class="text-subtitle2 text-grey-7">Total Pengajuan</div>
                <div class="text-h5 text-weight-bold text-primary">{{ formatCurrency(totalAmount) }}</div>
              </q-card-section>
            </q-card>

            <div class="row justify-end q-gutter-sm">
              <q-btn flat label="Batal" color="grey-7" no-caps v-close-popup />
              <q-btn unelevated type="submit" label="Simpan Draft" color="primary" no-caps
                :loading="submissionStore.submitting" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Detail Dialog -->
    <q-dialog v-model="detailDialogOpen" maximized transition-show="slide-up" transition-hide="slide-down">
      <q-card v-if="detailData">
        <q-toolbar class="bg-primary text-white">
          <q-toolbar-title class="ellipsis">
            <div class="text-subtitle1 text-weight-bold ellipsis">Detail Pengajuan</div>
            <div class="text-caption ellipsis" style="max-width: 60vw">{{ detailData.judul }}</div>
          </q-toolbar-title>
          <q-badge :color="statusColor(detailData.status)" :label="statusLabel(detailData.status)" class="q-mr-sm" />
          <q-btn flat dense round icon="close" v-close-popup />
        </q-toolbar>

        <q-card-section class="scroll q-pa-sm q-pa-md-md" style="max-height: calc(100vh - 60px)">
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-md-6">
              <q-card flat bordered class="rounded-xl">
                <q-card-section class="q-pa-sm q-pa-md-md">
                  <div class="text-subtitle2 text-weight-bold q-mb-sm">Informasi Pengajuan</div>
                  <q-list dense>
                    <q-item class="q-px-none">
                      <q-item-section side style="min-width: 100px; max-width: 110px">
                        <q-item-label caption>Nomor</q-item-label>
                      </q-item-section>
                      <q-item-section class="text-weight-medium">{{ detailData.nomor || '-' }}</q-item-section>
                    </q-item>
                    <q-item class="q-px-none">
                      <q-item-section side style="min-width: 100px; max-width: 110px">
                        <q-item-label caption>Jenis</q-item-label>
                      </q-item-section>
                      <q-item-section>
                        <q-chip dense :color="detailJenisChip.color" text-color="white"
                          size="sm">
                          {{ detailJenisChip.label }}
                        </q-chip>
                      </q-item-section>
                    </q-item>
                    <q-item class="q-px-none">
                      <q-item-section side style="min-width: 100px; max-width: 110px">
                        <q-item-label caption>Judul</q-item-label>
                      </q-item-section>
                      <q-item-section style="word-break: break-word">{{ detailData.judul }}</q-item-section>
                    </q-item>
                    <q-item class="q-px-none">
                      <q-item-section side style="min-width: 100px; max-width: 110px">
                        <q-item-label caption>Total</q-item-label>
                      </q-item-section>
                      <q-item-section class="text-weight-bold text-primary">
                        {{ formatCurrency(detailData.amount) }}
                      </q-item-section>
                    </q-item>
                    <q-item class="q-px-none">
                      <q-item-section side style="min-width: 100px; max-width: 110px">
                        <q-item-label caption>Pemohon</q-item-label>
                      </q-item-section>
                      <q-item-section>{{ detailData.submittedBy?.nama || '-' }}</q-item-section>
                    </q-item>
                    <q-item class="q-px-none">
                      <q-item-section side style="min-width: 100px; max-width: 110px">
                        <q-item-label caption>Tanggal</q-item-label>
                      </q-item-section>
                      <q-item-section>{{ formatDateShort(detailData.createdAt) }}</q-item-section>
                    </q-item>
                    <q-item v-if="detailData.deskripsi" class="q-px-none">
                      <q-item-section side style="min-width: 100px; max-width: 110px">
                        <q-item-label caption>Deskripsi</q-item-label>
                      </q-item-section>
                      <q-item-section style="word-break: break-word">{{ detailData.deskripsi }}</q-item-section>
                    </q-item>
                    <q-item v-if="detailData.notes" class="q-px-none">
                      <q-item-section side style="min-width: 100px; max-width: 110px">
                        <q-item-label caption>Catatan</q-item-label>
                      </q-item-section>
                      <q-item-section style="word-break: break-word">{{ detailData.notes }}</q-item-section>
                    </q-item>
                    <q-item v-if="detailData.metodePencairan" class="q-px-none">
                      <q-item-section side style="min-width: 100px; max-width: 110px">
                        <q-item-label caption>Metode</q-item-label>
                      </q-item-section>
                      <q-item-section>
                        <div>
                          <q-chip :color="detailData.metodePencairan === 'CASH' ? 'blue' : 'green'" text-color="white"
                            size="sm">
                            {{ detailData.metodePencairan === 'CASH' ? 'Cash' : 'Transfer' }}
                          </q-chip>
                        </div>
                        <div v-if="detailData.rekening" class="text-caption q-mt-xs" style="word-break: break-word">
                          {{ detailData.rekening.namaBank }} — {{ detailData.rekening.noRekening }}<br />(a.n. {{
                          detailData.rekening.atasNama }})
                        </div>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-md-6">
              <q-card flat bordered class="rounded-xl">
                <q-card-section class="q-pa-sm q-pa-md-md">
                  <div class="text-subtitle2 text-weight-bold q-mb-sm">Status & Persetujuan</div>
                  <q-list dense>
                    <q-item class="q-px-none">
                      <q-item-section side style="min-width: 100px; max-width: 110px">
                        <q-item-label caption>Status</q-item-label>
                      </q-item-section>
                      <q-item-section>
                        <q-badge :color="statusColor(detailData.status)" :label="statusLabel(detailData.status)" />
                      </q-item-section>
                    </q-item>
                    <q-item v-if="detailData.approvedBy" class="q-px-none">
                      <q-item-section side style="min-width: 100px; max-width: 110px">
                        <q-item-label caption>Disetujui</q-item-label>
                      </q-item-section>
                      <q-item-section>
                        <div>{{ detailData.approvedBy.nama }}</div>
                        <div class="text-caption text-grey-6">{{ formatDateShort(detailData.approvedAt) }}</div>
                      </q-item-section>
                    </q-item>
                    <q-item v-if="detailData.rejectedBy" class="q-px-none">
                      <q-item-section side style="min-width: 100px; max-width: 110px">
                        <q-item-label caption>Ditolak</q-item-label>
                      </q-item-section>
                      <q-item-section>
                        <div>{{ detailData.rejectedBy.nama }}</div>
                        <div class="text-caption text-grey-6">{{ formatDateShort(detailData.rejectedAt) }}</div>
                        <div v-if="detailData.rejectionNote" class="text-caption text-negative"
                          style="word-break: break-word">
                          Alasan: {{ detailData.rejectionNote }}
                        </div>
                      </q-item-section>
                    </q-item>
                    <q-item v-if="detailData.disbursedBy" class="q-px-none">
                      <q-item-section side style="min-width: 100px; max-width: 110px">
                        <q-item-label caption>Dicairkan</q-item-label>
                      </q-item-section>
                      <q-item-section>
                        <div>{{ detailData.disbursedBy.nama }}</div>
                        <div class="text-caption text-grey-6">{{ formatDateShort(detailData.disbursedAt) }}</div>
                        <div v-if="detailData.disbursementRef" class="text-caption">
                          Ref: {{ detailData.disbursementRef }}
                        </div>
                        <div v-if="detailData.buktiPencairan" class="q-mt-xs">
                          <a :href="detailData.buktiPencairan" target="_blank" class="text-primary text-caption">
                            <q-icon name="receipt_long" size="xs" /> Lihat Bukti Transfer
                          </a>
                        </div>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <!-- Items Table -->
          <q-card flat bordered class="rounded-xl q-mt-sm">
            <q-card-section class="q-pa-sm q-pa-md-md">
              <div class="text-subtitle2 text-weight-bold q-mb-sm">Rincian Item</div>

              <!-- Pengajuan Kajian / Sosial: dikelompokkan per Sub Judul -->
              <template v-if="detailData.jenis === 'KAJIAN' || detailData.jenis === 'SOSIAL'">
                <div v-for="(group, gIdx) in detailGroups" :key="gIdx" class="q-mb-md">
                  <div class="text-weight-bold text-primary q-mb-xs">
                    <q-icon name="folder" size="18px" class="q-mr-xs" />{{ group.subJudul }}
                  </div>
                  <div v-if="group.subTanggal || group.subWaktu" class="text-caption text-grey-7 q-mb-xs">
                    <q-icon v-if="group.subTanggal" name="event" size="14px" class="q-mr-xs" />
                    <span v-if="group.subTanggal">{{ group.subHari ? group.subHari + ', ' : '' }}{{
                      formatDateShort(group.subTanggal) }}</span>
                    <q-icon v-if="group.subWaktu" name="schedule" size="14px" class="q-mr-xs q-ml-sm" />
                    <span v-if="group.subWaktu">{{ group.subWaktu }}</span>
                  </div>
                  <q-table :rows="group.items" :columns="itemColumns" row-key="id" flat dense hide-pagination
                    :rows-per-page-options="[0]">
                    <template #body-cell-qty="props">
                      <q-td class="text-center">{{ props.row.qty }}</q-td>
                    </template>
                    <template #body-cell-hargaSatuan="props">
                      <q-td class="text-right">{{ formatCurrency(props.row.hargaSatuan) }}</q-td>
                    </template>
                    <template #body-cell-jumlah="props">
                      <q-td class="text-right text-weight-medium">{{ formatCurrency(props.row.jumlah) }}</q-td>
                    </template>
                    <template v-slot:bottom-row>
                      <q-tr>
                        <q-td colspan="3" class="text-right text-weight-medium">Subtotal</q-td>
                        <q-td class="text-right text-weight-medium text-primary">{{ formatCurrency(group.subtotal)
                          }}</q-td>
                      </q-tr>
                    </template>
                  </q-table>
                </div>
                <q-separator class="q-my-sm" />
                <div class="row justify-end items-center q-gutter-sm">
                  <div class="text-subtitle2 text-grey-7">Total</div>
                  <div class="text-h6 text-weight-bold text-primary">{{ formatCurrency(detailData.amount) }}</div>
                </div>
              </template>

              <!-- Pengajuan Umum -->
              <q-table v-else :rows="detailData.items || []" :columns="itemColumns" row-key="id" flat dense
                hide-pagination :rows-per-page-options="[0]">
                <template #body-cell-qty="props">
                  <q-td class="text-center">{{ props.row.qty }}</q-td>
                </template>
                <template #body-cell-hargaSatuan="props">
                  <q-td class="text-right">{{ formatCurrency(props.row.hargaSatuan) }}</q-td>
                </template>
                <template #body-cell-jumlah="props">
                  <q-td class="text-right text-weight-medium">{{ formatCurrency(props.row.jumlah) }}</q-td>
                </template>
                <template v-slot:bottom-row>
                  <q-tr>
                    <q-td colspan="3" class="text-right text-weight-bold">Total</q-td>
                    <q-td class="text-right text-weight-bold text-primary">{{ formatCurrency(detailData.amount)
                      }}</q-td>
                  </q-tr>
                </template>
              </q-table>
            </q-card-section>
          </q-card>

          <!-- Approval Logs -->
          <q-card v-if="detailData.approvalLogs?.length" flat bordered class="rounded-xl q-mt-sm">
            <q-card-section class="q-pa-sm q-pa-md-md">
              <div class="text-subtitle2 text-weight-bold q-mb-sm">Riwayat Persetujuan</div>
              <q-timeline color="primary">
                <q-timeline-entry v-for="log in detailData.approvalLogs" :key="log.id"
                  :subtitle="formatDateShort(log.createdAt) + ' — ' + (log.user?.nama || 'Sistem')"
                  :icon="log.action === 'APPROVED' ? 'check_circle' : 'cancel'"
                  :color="log.action === 'APPROVED' ? 'positive' : 'negative'">
                  <div class="text-weight-medium">{{ log.action === 'APPROVED' ? 'Disetujui' : 'Ditolak' }}</div>
                  <div v-if="log.notes" class="text-caption text-grey-7">{{ log.notes }}</div>
                </q-timeline-entry>
              </q-timeline>
            </q-card-section>
          </q-card>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Reject Dialog -->
    <q-dialog v-model="rejectDialogOpen" persistent full-width>
      <q-card style="width: min(400px, 95vw); max-width: 95vw" class="rounded-xl">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold text-negative">Tolak Pengajuan</div>
          <q-space />
          <q-btn flat dense icon="close" v-close-popup />
        </q-card-section>
        <q-card-section>
          <q-form @submit="handleReject">
            <q-input v-model="rejectNote" label="Alasan Penolakan *" outlined dense type="textarea" rows="3"
              :rules="[val => !!val || 'Alasan wajib diisi']" />
            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn flat label="Batal" color="grey-7" no-caps v-close-popup />
              <q-btn unelevated type="submit" label="Tolak" color="negative" no-caps
                :loading="submissionStore.submitting" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Disburse Dialog -->
    <q-dialog v-model="disburseDialogOpen" persistent full-width>
      <q-card style="width: min(400px, 95vw); max-width: 95vw" class="rounded-xl">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold text-green-7">Cairkan Dana</div>
          <q-space />
          <q-btn flat dense icon="close" v-close-popup />
        </q-card-section>
        <q-card-section>
          <div class="text-caption text-grey-7 q-mb-md">
            Konfirmasi pencairan dana sebesar <strong class="text-primary">{{ formatCurrency(disburseTarget?.amount)
              }}</strong>
          </div>
          <q-form @submit="handleDisburse">
            <q-input v-model="disbursementRef" label="Nomor Referensi (opsional)" outlined dense
              hint="Misal: nomor transfer, nomor cek, dll" />
            <q-file v-model="buktiPencairanFile" label="Bukti Transfer" outlined dense accept="image/*"
              max-file-size="5242880" hint="Upload screenshot/struk transfer (max 5MB)" class="q-mt-md" />
            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn flat label="Batal" color="grey-7" no-caps v-close-popup />
              <q-btn unelevated type="submit" label="Cairkan" color="green-7" no-caps :loading="disburseSubmitting" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Rekening Management Dialog -->
    <q-dialog v-model="rekeningDialogOpen" persistent full-width>
      <q-card style="width: min(500px, 95vw); max-width: 95vw" class="rounded-xl">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">Kelola Rekening Pencairan</div>
          <q-space />
          <q-btn flat dense icon="close" v-close-popup />
        </q-card-section>
        <q-card-section>
          <q-list bordered separator class="rounded-borders q-mb-md">
            <q-item v-for="rek in rekeningList" :key="rek.id">
              <q-item-section>
                <q-item-label class="text-weight-medium">{{ rek.namaBank }} — {{ rek.noRekening }}</q-item-label>
                <q-item-label caption>a.n. {{ rek.atasNama }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-if="rekeningList.length === 0">
              <q-item-section class="text-center text-grey-6">Belum ada rekening</q-item-section>
            </q-item>
          </q-list>
          <q-form @submit="handleTambahRekening" class="q-gutter-sm">
            <q-input v-model="rekeningForm.namaBank" label="Nama Bank *" outlined dense
              :rules="[val => !!val || 'Wajib']" />
            <q-input v-model="rekeningForm.noRekening" label="No. Rekening *" outlined dense
              :rules="[val => !!val || 'Wajib']" />
            <q-input v-model="rekeningForm.atasNama" label="Atas Nama *" outlined dense
              :rules="[val => !!val || 'Wajib']" />
            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn flat label="Tutup" color="grey-7" no-caps v-close-popup />
              <q-btn unelevated type="submit" label="Tambah Rekening" color="primary" no-caps
                :loading="rekeningSubmitting" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useFinanceSubmissionStore } from 'src/stores/financeSubmission';
import { useAuthStore } from 'src/stores/auth';
import { useQuasar } from 'quasar';
import { formatCurrency, formatDateShort } from 'src/utils/format';
import { api } from 'src/boot/axios';

const $q = useQuasar();
const submissionStore = useFinanceSubmissionStore();
const authStore = useAuthStore();

const formRef = ref(null);
const formDialogOpen = ref(false);
const detailDialogOpen = ref(false);
const rejectDialogOpen = ref(false);
const disburseDialogOpen = ref(false);

const isEdit = ref(false);
const editId = ref(null);
const detailData = ref(null);
const rejectTarget = ref(null);
const disburseTarget = ref(null);
const rejectNote = ref('');
const disbursementRef = ref('');
const buktiPencairanFile = ref(null);
const disburseSubmitting = ref(false);
const rekeningDialogOpen = ref(false);
const rekeningList = ref([]);
const rekeningSubmitting = ref(false);
const rekeningForm = ref({ namaBank: '', noRekening: '', atasNama: '' });

const filters = ref({ status: null });
const pagination = ref({ page: 1, limit: 20 });

const jenisDialogOpen = ref(false);
const selectedJenis = ref('UMUM');
const jenisOptions = [
  { label: 'Pengajuan Umum', value: 'UMUM', desc: 'Pengajuan dana dengan rincian item biasa.' },
  { label: 'Pengajuan Kajian', value: 'KAJIAN', desc: 'Pengajuan anggaran kajian dengan sub judul per kajian.' },
  { label: 'Pengajuan Sosial', value: 'SOSIAL', desc: 'Pengajuan anggaran sosial dengan sub judul dari program Divisi Sosial.' },
];

const form = ref({
  jenis: 'UMUM',
  judul: '',
  deskripsi: '',
  notes: '',
  metodePencairan: null,
  rekeningId: null,
  items: [],
  groups: [],
});

const newItem = ref({ namaBarang: '', qty: 1, hargaSatuan: 0, keterangan: '' });
const editingItemIdx = ref(null);

const itemNameOptions = ref([]);
const itemNameFiltered = ref([]);

// Nama program Divisi Sosial untuk pilihan Sub Judul (Pengajuan Sosial)
const sosialProgramOptions = ref([]);
const sosialProgramFiltered = ref([]);

// Jenis pengajuan yang dikelompokkan per sub judul (Kajian & Sosial)
const isGrouped = computed(() => ['KAJIAN', 'SOSIAL'].includes(form.value.jenis));

// Format angka ke tampilan rupiah (mis. 1000000 -> "1.000.000")
const formatNumberInput = (val) => {
  if (val === null || val === undefined || val === '' || Number(val) === 0) return '';
  const n = Number(val);
  return isNaN(n) ? '' : n.toLocaleString('id-ID');
};

// Parse tampilan rupiah kembali ke angka (mis. "1.000.000" -> 1000000)
const parseNumberInput = (val) => {
  if (val === null || val === undefined) return 0;
  const digits = String(val).replace(/[^\d]/g, '');
  return digits ? Number(digits) : 0;
};

// ─── Jadwal Sub Judul (Hari otomatis & pilihan Jam) ──────────────────────────
const HARI_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const getDayName = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return isNaN(d.getTime()) ? '' : HARI_NAMES[d.getDay()];
};

const WAKTU_PRESETS = [
  '08.30 - 11.00 WIB',
  '09.00 - 11.00 WIB',
  "Ba'da Maghrib - Selesai",
  '09.00 - Selesai',
  "Ba'da Shubuh - Selesai",
];
const waktuOptions = [...WAKTU_PRESETS, 'Lainnya'];

const determineWaktuOption = (w) => {
  if (!w) return null;
  return WAKTU_PRESETS.includes(w) ? w : 'Lainnya';
};

const onGroupTanggalChange = (group, val) => {
  group.subTanggal = val;
  group.subHari = getDayName(val);
};

const onGroupWaktuChange = (group, val) => {
  group.waktuOption = val;
  if (val === 'Lainnya') {
    if (WAKTU_PRESETS.includes(group.subWaktu)) group.subWaktu = '';
  } else {
    group.subWaktu = val || '';
  }
};

const canApprove = computed(() => {
  const role = authStore.currentUser?.role;
  return ['VIEWER', 'KETUA_DKM', 'WAKIL_DKM', 'SUPERADMIN', 'ADMIN'].includes(role);
});

const canDisburse = computed(() => {
  const role = authStore.currentUser?.role;
  return ['KEUANGAN', 'SUPERADMIN', 'ADMIN'].includes(role);
});

const summaryCards = computed(() => {
  const summary = submissionStore.summary;
  if (!summary) return [];
  return [
    { key: 'draft', label: 'Draft', count: summary.counts.draft, amount: summary.amounts.draft, status: 'DRAFT', icon: 'edit_note', color: 'grey' },
    { key: 'submitted', label: 'Menunggu', count: summary.counts.submitted, amount: summary.amounts.submitted, status: 'SUBMITTED', icon: 'pending', color: 'orange' },
    { key: 'approved', label: 'Disetujui', count: summary.counts.approved, amount: summary.amounts.approved, status: 'APPROVED', icon: 'check_circle', color: 'positive' },
    { key: 'rejected', label: 'Ditolak', count: summary.counts.rejected, amount: summary.amounts.rejected, status: 'REJECTED', icon: 'cancel', color: 'negative' },
  ];
});

const totalAmount = computed(() => {
  if (isGrouped.value) {
    return form.value.groups.reduce((sum, g) => sum + groupSubtotal(g), 0);
  }
  return form.value.items.reduce((sum, item) => sum + (Number(item.qty) || 0) * (Number(item.hargaSatuan) || 0), 0);
});

const groupSubtotal = (group) => {
  return group.items.reduce((sum, item) => sum + (Number(item.qty) || 0) * (Number(item.hargaSatuan) || 0), 0);
};

const formDialogTitle = computed(() => {
  if (form.value.jenis === 'KAJIAN') {
    return isEdit.value ? 'Edit Pengajuan Anggaran Kajian' : 'Pengajuan Anggaran Kajian';
  }
  if (form.value.jenis === 'SOSIAL') {
    return isEdit.value ? 'Edit Pengajuan Anggaran Sosial' : 'Pengajuan Anggaran Sosial';
  }
  return isEdit.value ? 'Edit Pengajuan' : 'Buat Pengajuan Baru';
});

const detailGroups = computed(() => {
  const items = detailData.value?.items || [];
  const groups = [];
  const map = new Map();
  items.forEach((item) => {
    const key = item.subJudul || 'Lainnya';
    if (!map.has(key)) {
      const g = { subJudul: key, subTanggal: item.subTanggal || null, subHari: item.subHari || null, subWaktu: item.subWaktu || null, items: [], subtotal: 0 };
      map.set(key, g);
      groups.push(g);
    }
    const g = map.get(key);
    g.items.push(item);
    g.subtotal += Number(item.jumlah) || 0;
  });
  return groups;
});

const statusColor = (status) => {
  const colors = { DRAFT: 'grey', SUBMITTED: 'orange', APPROVED: 'positive', REJECTED: 'negative' };
  return colors[status] || 'grey';
};

const statusLabel = (status) => {
  const labels = { DRAFT: 'Draft', SUBMITTED: 'Menunggu', APPROVED: 'Disetujui', REJECTED: 'Ditolak' };
  return labels[status] || status;
};

const detailJenisChip = computed(() => {
  const jenis = detailData.value?.jenis;
  if (jenis === 'KAJIAN') return { label: 'Pengajuan Kajian', color: 'purple' };
  if (jenis === 'SOSIAL') return { label: 'Pengajuan Sosial', color: 'teal' };
  return { label: 'Pengajuan Umum', color: 'blue-grey' };
});

const columns = [
  { name: 'nomor', label: 'Nomor', field: 'nomor', align: 'left', sortable: true },
  { name: 'judul', label: 'Judul', field: 'judul', align: 'left', sortable: true },
  { name: 'amount', label: 'Jumlah', field: 'amount', align: 'left', sortable: true },
  { name: 'status', label: 'Status', field: 'status', align: 'left', sortable: true },
  { name: 'actions', label: 'Aksi', field: 'actions', align: 'left' },
];

const itemColumns = [
  { name: 'namaBarang', label: 'Nama Item', field: 'namaBarang', align: 'left' },
  { name: 'qty', label: 'Qty', field: 'qty', align: 'center' },
  { name: 'hargaSatuan', label: 'Harga', field: 'hargaSatuan', align: 'right' },
  { name: 'jumlah', label: 'Jumlah', field: 'jumlah', align: 'right' },
];

const formItemColumns = [
  { name: 'no', label: '#', field: 'no', align: 'center', style: 'width: 40px' },
  { name: 'namaBarang', label: 'Nama Item', field: 'namaBarang', align: 'left' },
  { name: 'qty', label: 'Qty', field: 'qty', align: 'center', style: 'width: 50px' },
  { name: 'hargaSatuan', label: 'Harga Satuan', field: 'hargaSatuan', align: 'right' },
  { name: 'subtotal', label: 'Subtotal', field: row => row.qty * row.hargaSatuan, align: 'right' },
  { name: 'keterangan', label: 'Keterangan', field: 'keterangan', align: 'left' },
  { name: 'aksi', label: '', field: 'aksi', align: 'center', style: 'width: 84px' },
];

const statusOptions = [
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Menunggu Persetujuan', value: 'SUBMITTED' },
  { label: 'Disetujui', value: 'APPROVED' },
  { label: 'Ditolak', value: 'REJECTED' },
];

const metodeOptions = [
  { label: 'Cash', value: 'CASH' },
  { label: 'Transfer', value: 'TRANSFER' },
];

const rekeningOptions = computed(() =>
  rekeningList.value.map(r => ({
    label: `${r.namaBank} — ${r.noRekening} (a.n. ${r.atasNama})`,
    value: r.id,
  }))
);

const fetchRekening = async () => {
  try {
    const { data } = await api.get('/finance/submissions/rekening/list');
    rekeningList.value = data.data;
  } catch (e) { /* silent */ }
};

const openRekeningDialog = () => {
  rekeningForm.value = { namaBank: '', noRekening: '', atasNama: '' };
  rekeningDialogOpen.value = true;
};

const handleTambahRekening = async () => {
  rekeningSubmitting.value = true;
  try {
    await api.post('/finance/submissions/rekening', rekeningForm.value);
    await fetchRekening();
    rekeningForm.value = { namaBank: '', noRekening: '', atasNama: '' };
  } catch (e) {
    $q.notify({ type: 'negative', message: 'Gagal menambah rekening.' });
  } finally { rekeningSubmitting.value = false; }
};

const addItem = () => {
  if (!newItem.value.namaBarang?.trim()) {
    $q.notify({ type: 'warning', message: 'Nama item wajib diisi.' });
    return;
  }
  if (editingItemIdx.value !== null) {
    form.value.items.splice(editingItemIdx.value, 1, { ...newItem.value });
    editingItemIdx.value = null;
  } else {
    form.value.items.push({ ...newItem.value });
  }
  newItem.value = { namaBarang: '', qty: 1, hargaSatuan: 0, keterangan: '' };
};

const editItem = (idx) => {
  const it = form.value.items[idx];
  newItem.value = { namaBarang: it.namaBarang, qty: it.qty, hargaSatuan: it.hargaSatuan, keterangan: it.keterangan || '' };
  editingItemIdx.value = idx;
};

const cancelEditItem = () => {
  editingItemIdx.value = null;
  newItem.value = { namaBarang: '', qty: 1, hargaSatuan: 0, keterangan: '' };
};

const removeItem = (idx) => {
  form.value.items.splice(idx, 1);
  if (editingItemIdx.value === idx) {
    cancelEditItem();
  } else if (editingItemIdx.value !== null && idx < editingItemIdx.value) {
    editingItemIdx.value -= 1;
  }
};

// ─── Pengajuan Kajian: Sub Judul Groups ───────────────────────────────────────
const addGroup = () => {
  form.value.groups.push({
    subJudul: '',
    subTanggal: '',
    subHari: '',
    subWaktu: '',
    waktuOption: null,
    items: [],
    editingIdx: null,
    newItem: { namaBarang: '', qty: 1, hargaSatuan: 0, keterangan: '' },
  });
};

const removeGroup = (gIdx) => {
  form.value.groups.splice(gIdx, 1);
};

const addGroupItem = (gIdx) => {
  const group = form.value.groups[gIdx];
  if (!group.newItem.namaBarang?.trim()) {
    $q.notify({ type: 'warning', message: 'Nama item wajib diisi.' });
    return;
  }
  if (group.editingIdx != null) {
    group.items.splice(group.editingIdx, 1, { ...group.newItem });
    group.editingIdx = null;
  } else {
    group.items.push({ ...group.newItem });
  }
  group.newItem = { namaBarang: '', qty: 1, hargaSatuan: 0, keterangan: '' };
};

const editGroupItem = (gIdx, iIdx) => {
  const group = form.value.groups[gIdx];
  const it = group.items[iIdx];
  group.newItem = { namaBarang: it.namaBarang, qty: it.qty, hargaSatuan: it.hargaSatuan, keterangan: it.keterangan || '' };
  group.editingIdx = iIdx;
};

const cancelEditGroupItem = (gIdx) => {
  const group = form.value.groups[gIdx];
  group.editingIdx = null;
  group.newItem = { namaBarang: '', qty: 1, hargaSatuan: 0, keterangan: '' };
};

const removeGroupItem = (gIdx, iIdx) => {
  const group = form.value.groups[gIdx];
  group.items.splice(iIdx, 1);
  if (group.editingIdx === iIdx) {
    cancelEditGroupItem(gIdx);
  } else if (group.editingIdx != null && iIdx < group.editingIdx) {
    group.editingIdx -= 1;
  }
};

// ─── Item Name Suggestions (auto-complete) ────────────────────────────────────
const fetchItemSuggestions = async () => {
  try {
    const { data } = await api.get('/finance/submissions/items/suggestions');
    itemNameOptions.value = data.data || [];
    itemNameFiltered.value = itemNameOptions.value;
  } catch (e) { /* silent */ }
};

const filterItemName = (val, update) => {
  update(() => {
    if (!val) {
      itemNameFiltered.value = itemNameOptions.value;
    } else {
      const needle = val.toLowerCase();
      itemNameFiltered.value = itemNameOptions.value.filter((o) => o.toLowerCase().includes(needle));
    }
  });
};

// ─── Program Divisi Sosial (Sub Judul Pengajuan Sosial) ───────────────────────
const fetchSosialPrograms = async () => {
  try {
    const { data } = await api.get('/finance/submissions/sosial/programs');
    sosialProgramOptions.value = data.data || [];
    sosialProgramFiltered.value = sosialProgramOptions.value;
  } catch (e) { /* silent */ }
};

const filterSosialProgram = (val, update) => {
  update(() => {
    if (!val) {
      sosialProgramFiltered.value = sosialProgramOptions.value;
    } else {
      const needle = val.toLowerCase();
      sosialProgramFiltered.value = sosialProgramOptions.value.filter((o) => o.toLowerCase().includes(needle));
    }
  });
};

// ─── Jenis Pengajuan Selection ────────────────────────────────────────────────
const openJenisDialog = () => {
  selectedJenis.value = 'UMUM';
  jenisDialogOpen.value = true;
};

const proceedJenis = () => {
  jenisDialogOpen.value = false;
  openFormDialog(null, selectedJenis.value);
};

const openFormDialog = (row = null, jenis = 'UMUM') => {
  if (row) {
    isEdit.value = true;
    editId.value = row.id;
    const rowJenis = ['KAJIAN', 'SOSIAL'].includes(row.jenis) ? row.jenis : 'UMUM';
    const isGroupedRow = rowJenis === 'KAJIAN' || rowJenis === 'SOSIAL';
    const mappedItems = (row.items || []).map(i => ({
      subJudul: i.subJudul || null,
      subTanggal: i.subTanggal || null,
      subHari: i.subHari || null,
      subWaktu: i.subWaktu || null,
      namaBarang: i.namaBarang,
      qty: i.qty,
      hargaSatuan: Number(i.hargaSatuan),
      keterangan: i.keterangan || '',
    }));

    let groups = [];
    if (isGroupedRow) {
      const map = new Map();
      mappedItems.forEach((i) => {
        const key = i.subJudul || 'Lainnya';
        if (!map.has(key)) {
          const g = { subJudul: key, subTanggal: i.subTanggal || '', subHari: i.subHari || getDayName(i.subTanggal), subWaktu: i.subWaktu || '', waktuOption: determineWaktuOption(i.subWaktu), items: [], editingIdx: null, newItem: { namaBarang: '', qty: 1, hargaSatuan: 0, keterangan: '' } };
          map.set(key, g);
          groups.push(g);
        }
        map.get(key).items.push({
          namaBarang: i.namaBarang,
          qty: i.qty,
          hargaSatuan: i.hargaSatuan,
          keterangan: i.keterangan,
        });
      });
    }

    form.value = {
      jenis: rowJenis,
      judul: row.judul,
      deskripsi: row.deskripsi || '',
      notes: row.notes || '',
      metodePencairan: row.metodePencairan || null,
      rekeningId: row.rekening?.id || null,
      items: isGroupedRow ? [] : mappedItems,
      groups,
    };
  } else {
    isEdit.value = false;
    editId.value = null;
    const isKajian = jenis === 'KAJIAN';
    const isSosial = jenis === 'SOSIAL';
    const isGroupedNew = isKajian || isSosial;
    let defaultJudul = '';
    if (isKajian) defaultJudul = 'Pengajuan Anggaran Kajian';
    else if (isSosial) defaultJudul = 'Pengajuan Anggaran Sosial';
    form.value = {
      jenis: isGroupedNew ? jenis : 'UMUM',
      judul: defaultJudul,
      deskripsi: '',
      notes: '',
      metodePencairan: null,
      rekeningId: null,
      items: [],
      groups: isGroupedNew ? [{ subJudul: '', subTanggal: '', subHari: '', subWaktu: '', waktuOption: null, items: [], editingIdx: null, newItem: { namaBarang: '', qty: 1, hargaSatuan: 0, keterangan: '' } }] : [],
    };
  }
  newItem.value = { namaBarang: '', qty: 1, hargaSatuan: 0, keterangan: '' };
  editingItemIdx.value = null;
  formDialogOpen.value = true;
};

const openDetailDialog = async (row) => {
  const data = await submissionStore.fetchSubmissionById(row.id);
  if (data) {
    detailData.value = data;
    detailDialogOpen.value = true;
  }
};

const openRejectDialog = (row) => {
  rejectTarget.value = row;
  rejectNote.value = '';
  rejectDialogOpen.value = true;
};

const openDisburseDialog = (row) => {
  disburseTarget.value = row;
  disbursementRef.value = '';
  buktiPencairanFile.value = null;
  disburseDialogOpen.value = true;
};

const handleDisburse = async () => {
  disburseSubmitting.value = true;
  try {
    const formData = new FormData();
    formData.append('disbursementRef', disbursementRef.value || '');
    if (buktiPencairanFile.value) {
      formData.append('buktiPencairan', buktiPencairanFile.value);
    }
    await api.post('/finance/submissions/' + disburseTarget.value.id + '/disburse', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    $q.notify({ type: 'positive', message: 'Dana berhasil dicairkan.' });
    disburseDialogOpen.value = false;
    await loadData();
  } catch (err) {
    $q.notify({ type: 'negative', message: err.response?.data?.message || 'Gagal mencairkan dana.' });
  } finally { disburseSubmitting.value = false; }
};

const handleSubmit = async () => {
  let items = [];

  if (form.value.jenis === 'KAJIAN' || form.value.jenis === 'SOSIAL') {
    const isSosial = form.value.jenis === 'SOSIAL';
    const subJudulLabel = isSosial ? 'Program' : 'Sub judul';
    const groups = form.value.groups || [];
    if (groups.length === 0) {
      $q.notify({ type: 'warning', message: `Tambahkan minimal satu ${isSosial ? 'program' : 'sub judul'}.` });
      return;
    }
    for (const g of groups) {
      if (!g.subJudul?.trim()) {
        $q.notify({ type: 'warning', message: `${subJudulLabel} pengajuan wajib diisi.` });
        return;
      }
      if (!isSosial && g.waktuOption === 'Lainnya' && !g.subWaktu?.trim()) {
        $q.notify({ type: 'warning', message: `Isi jam manual untuk sub judul "${g.subJudul}".` });
        return;
      }
      if (!g.items.length) {
        $q.notify({ type: 'warning', message: `${subJudulLabel} "${g.subJudul}" belum memiliki item.` });
        return;
      }
    }
    groups.forEach((g) => {
      g.items.forEach((it) => {
        items.push({
          subJudul: g.subJudul.trim(),
          subTanggal: g.subTanggal || null,
          subHari: g.subHari || null,
          subWaktu: g.subWaktu || null,
          namaBarang: it.namaBarang,
          qty: it.qty,
          hargaSatuan: it.hargaSatuan,
          keterangan: it.keterangan,
          urutan: items.length,
        });
      });
    });
  } else {
    if (!form.value.items.length) {
      $q.notify({ type: 'warning', message: 'Tambahkan minimal satu item.' });
      return;
    }
    items = form.value.items.map((it, idx) => ({ ...it, urutan: idx }));
  }

  const payload = {
    jenis: form.value.jenis,
    judul: form.value.judul,
    deskripsi: form.value.deskripsi || null,
    notes: form.value.notes || null,
    metodePencairan: form.value.metodePencairan,
    rekeningId: form.value.rekeningId,
    items,
  };

  let success;
  if (isEdit.value) {
    success = await submissionStore.updateSubmission(editId.value, payload);
  } else {
    success = await submissionStore.createSubmission(payload);
  }

  if (success) {
    formDialogOpen.value = false;
    await loadData();
    await fetchItemSuggestions();
  }
};

const confirmSubmit = (row) => {
  $q.dialog({
    title: 'Konfirmasi',
    message: `Ajukan "${row.judul}" untuk persetujuan?`,
    cancel: { flat: true, label: 'Batal', color: 'grey-7', noCaps: true },
    ok: { unelevated: true, label: 'Ajukan', color: 'primary', noCaps: true },
    persistent: true,
  }).onOk(async () => {
    const success = await submissionStore.submitSubmission(row.id);
    if (success) await loadData();
  });
};

const confirmApprove = (row) => {
  $q.dialog({
    title: 'Konfirmasi',
    message: `Setujui pengajuan "${row.judul}" sebesar ${formatCurrency(row.amount)}?`,
    cancel: { flat: true, label: 'Batal', color: 'grey-7', noCaps: true },
    ok: { unelevated: true, label: 'Setujui', color: 'positive', noCaps: true },
    persistent: true,
  }).onOk(async () => {
    const success = await submissionStore.approveSubmission(row.id);
    if (success) await loadData();
  });
};

const handleReject = async () => {
  const success = await submissionStore.rejectSubmission(rejectTarget.value.id, rejectNote.value);
  if (success) {
    rejectDialogOpen.value = false;
    await loadData();
  }
};

const confirmDelete = (row) => {
  $q.dialog({
    title: 'Konfirmasi',
    message: `Hapus pengajuan "${row.judul}"?`,
    cancel: { flat: true, label: 'Batal', color: 'grey-7', noCaps: true },
    ok: { unelevated: true, label: 'Hapus', color: 'negative', noCaps: true },
    persistent: true,
  }).onOk(async () => {
    const success = await submissionStore.deleteSubmission(row.id);
    if (success) await loadData();
  });
};

const filterByStatus = (status) => {
  filters.value.status = filters.value.status === status ? null : status;
  applyFilters();
};

const applyFilters = () => {
  pagination.value.page = 1;
  loadData();
};

const resetFilters = () => {
  filters.value = { status: null };
  applyFilters();
};

const onRequest = (props) => {
  pagination.value.page = props.pagination.page;
  pagination.value.limit = props.pagination.rowsPerPage;
  loadData();
};

const loadData = async () => {
  const params = { page: pagination.value.page, limit: pagination.value.limit };
  if (filters.value.status) params.status = filters.value.status;
  await Promise.all([
    submissionStore.fetchSubmissions(params),
    submissionStore.fetchSummary(),
  ]);
};

const exportListPDF = async () => {
  try {
    const { data } = await api.get('/finance/submissions/export/pdf/list', {
      params: filters.value,
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Laporan-Pengajuan-Keuangan.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Gagal mencetak laporan.' });
  }
};

const exportSinglePDF = async (row) => {
  try {
    const { data } = await api.get('/finance/submissions/' + row.id + '/pdf', {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([data]));
    const link = document.createElement('a');
    link.href = url;
    const filename = 'Pengajuan-' + (row.judul || 'Keuangan').replace(/[^a-zA-Z0-9]/g, '_') + '.pdf';
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Gagal mencetak PDF.' });
  }
};

onMounted(async () => {
  await Promise.all([loadData(), fetchRekening(), fetchItemSuggestions(), fetchSosialPrograms()]);
});
</script>

<style scoped>
.rounded-xl {
  border-radius: 16px;
}
</style>
