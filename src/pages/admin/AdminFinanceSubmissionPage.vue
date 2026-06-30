<template>
  <q-page class="q-pa-lg">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h5 text-weight-bold">Pengajuan Keuangan</div>
        <div class="text-caption text-grey-6">Buat dan kelola pengajuan dana</div>
      </div>
      <div class="row q-gutter-sm">
        <q-btn flat color="deep-orange" icon="picture_as_pdf" label="Cetak Laporan" no-caps @click="exportListPDF" />
        <q-btn unelevated color="primary" icon="add" label="Buat Pengajuan" no-caps @click="openFormDialog()" />
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="row q-col-gutter-md q-mb-lg" v-if="submissionStore.summary">
      <div class="col-12 col-sm-6 col-md-3" v-for="card in summaryCards" :key="card.key">
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
          <q-select
            v-model="filters.status"
            :options="statusOptions"
            label="Status"
            outlined
            dense
            emit-value
            map-options
            clearable
            class="col-auto"
            style="min-width: 180px"
            @update:model-value="applyFilters"
          />
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
      <q-table
        :rows="submissionStore.submissions"
        :columns="columns"
        row-key="id"
        :loading="submissionStore.loading"
        flat
        :rows-per-page-options="[10, 20, 50]"
        :pagination="pagination"
        @request="onRequest"
      >
        <template #body-cell-nomor="props">
          <q-td>
            <span class="text-weight-medium">{{ props.row.nomor || '-' }}</span>
          </q-td>
        </template>

        <template #body-cell-judul="props">
          <q-td>
            <div class="text-weight-medium">{{ props.row.judul }}</div>
            <div v-if="props.row.deskripsi" class="text-caption text-grey-6 text-truncate" style="max-width: 250px">
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
              <q-btn unelevated color="primary" icon="add" label="Buat Pengajuan Pertama" no-caps class="q-mt-md" @click="openFormDialog()" />
            </div>
          </div>
        </template>
      </q-table>
    </q-card>

    <!-- Form Dialog (Create/Edit) -->
    <q-dialog v-model="formDialogOpen" persistent>
      <q-card style="min-width: 700px; max-width: 80vw" class="rounded-xl">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">{{ isEdit ? 'Edit Pengajuan' : 'Buat Pengajuan Baru' }}</div>
          <q-space />
          <q-btn flat dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section class="scroll" style="max-height: 70vh">
          <q-form @submit="handleSubmit" class="q-gutter-md" ref="formRef">
            <!-- Info Pengajuan -->
            <q-input
              v-model="form.judul"
              label="Judul Pengajuan *"
              outlined
              dense
              hint="Contoh: Pengadaan Sound System untuk Kajian Akbar"
              :rules="[val => !!val || 'Judul wajib diisi']"
            />

            <q-input
              v-model="form.deskripsi"
              label="Deskripsi (opsional)"
              outlined
              dense
              type="textarea"
              rows="2"
              hint="Jelaskan tujuan dan rincian kebutuhan"
            />

            <q-separator />

            <!-- Rincian Item -->
            <div>
              <div class="row items-center justify-between q-mb-sm">
                <div class="text-subtitle2 text-weight-bold">Rincian Item</div>
                <q-btn dense flat icon="add_circle" color="primary" label="Tambah Item" no-caps @click="addItem" />
              </div>

              <div v-if="form.items.length === 0" class="text-center q-py-md text-grey-6">
                <q-icon name="shopping_cart" size="28px" />
                <div class="text-caption q-mt-xs">Belum ada item</div>
              </div>

              <div v-else>
                <q-list bordered separator class="rounded-borders">
                  <q-item v-for="(item, idx) in form.items" :key="idx">
                    <q-item-section>
                      <div class="row q-col-gutter-sm">
                        <div class="col-12 col-md-5">
                          <q-input
                            v-model="item.namaBarang"
                            label="Nama Item *"
                            outlined
                            dense
                            :rules="[val => !!val || 'Wajib diisi']"
                          />
                        </div>
                        <div class="col-4 col-md-2">
                          <q-input
                            v-model.number="item.qty"
                            label="Qty"
                            outlined
                            dense
                            type="number"
                            :rules="[val => val > 0 || 'Min. 1']"
                          />
                        </div>
                        <div class="col-4 col-md-2">
                          <q-input
                            v-model.number="item.hargaSatuan"
                            label="Harga"
                            outlined
                            dense
                            type="number"
                            :rules="[val => val >= 0 || 'Min. 0']"
                          />
                        </div>
                        <div class="col-4 col-md-3">
                          <q-input
                            v-model="item.keterangan"
                            label="Keterangan"
                            outlined
                            dense
                          />
                        </div>
                      </div>
                      <div class="text-caption text-primary q-mt-xs">
                        Subtotal: <strong>{{ formatCurrency(item.qty * item.hargaSatuan) }}</strong>
                      </div>
                    </q-item-section>
                    <q-item-section side>
                      <q-btn flat dense round icon="delete" color="negative" size="sm" @click="removeItem(idx)">
                        <q-tooltip>Hapus</q-tooltip>
                      </q-btn>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
            </div>

            <q-separator class="q-my-md" />

            <!-- Metode Pencairan -->
            <div>
              <div class="text-subtitle2 text-weight-bold q-mb-sm">Metode Pencairan</div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-4">
                  <q-select
                    v-model="form.metodePencairan"
                    :options="metodeOptions"
                    label="Metode"
                    outlined
                    dense
                    emit-value
                    map-options
                    clearable
                  />
                </div>
                <div v-if="form.metodePencairan === 'TRANSFER'" class="col-12 col-md-8">
                  <div class="row q-gutter-sm items-end">
                    <q-select
                      v-model="form.rekeningId"
                      :options="rekeningOptions"
                      label="Rekening Tujuan"
                      outlined
                      dense
                      emit-value
                      map-options
                      class="col"
                    />
                    <q-btn dense flat icon="add" color="primary" size="sm" @click="openRekeningDialog">
                      <q-tooltip>Tambah Rekening</q-tooltip>
                    </q-btn>
                  </div>
                </div>
              </div>
            </div>

            <q-separator class="q-my-md" />

            <q-input
              v-model="form.notes"
              label="Catatan untuk Approver (opsional)"
              outlined
              dense
              type="textarea"
              rows="2"
            />

            <!-- Total -->
            <q-card flat class="bg-grey-1">
              <q-card-section class="row items-center justify-between q-py-sm">
                <div class="text-subtitle2 text-grey-7">Total Pengajuan</div>
                <div class="text-h5 text-weight-bold text-primary">{{ formatCurrency(totalAmount) }}</div>
              </q-card-section>
            </q-card>

            <div class="row justify-end q-gutter-sm">
              <q-btn flat label="Batal" color="grey-7" no-caps v-close-popup />
              <q-btn unelevated type="submit" label="Simpan Draft" color="primary" no-caps :loading="submissionStore.submitting" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Detail Dialog -->
    <q-dialog v-model="detailDialogOpen" maximized transition-show="slide-up" transition-hide="slide-down">
      <q-card v-if="detailData">
        <q-toolbar class="bg-primary text-white">
          <q-toolbar-title>
            <div class="text-h6">Detail Pengajuan</div>
            <div class="text-caption">{{ detailData.judul }}</div>
          </q-toolbar-title>
          <q-badge :color="statusColor(detailData.status)" :label="statusLabel(detailData.status)" class="q-mr-md" />
          <q-btn flat dense round icon="close" v-close-popup />
        </q-toolbar>

        <q-card-section class="scroll" style="max-height: calc(100vh - 100px)">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-card flat bordered class="rounded-xl">
                <q-card-section>
                  <div class="text-subtitle2 text-weight-bold q-mb-sm">Informasi Pengajuan</div>
                  <q-list dense>
                    <q-item>
                      <q-item-section side style="min-width: 120px">
                        <q-item-label caption>Nomor</q-item-label>
                      </q-item-section>
                      <q-item-section class="text-weight-medium">{{ detailData.nomor || '-' }}</q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section side style="min-width: 120px">
                        <q-item-label caption>Judul</q-item-label>
                      </q-item-section>
                      <q-item-section>{{ detailData.judul }}</q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section side style="min-width: 120px">
                        <q-item-label caption>Total</q-item-label>
                      </q-item-section>
                      <q-item-section class="text-weight-bold text-primary">
                        {{ formatCurrency(detailData.amount) }}
                      </q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section side style="min-width: 120px">
                        <q-item-label caption>Pemohon</q-item-label>
                      </q-item-section>
                      <q-item-section>{{ detailData.submittedBy?.nama || '-' }}</q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section side style="min-width: 120px">
                        <q-item-label caption>Tanggal</q-item-label>
                      </q-item-section>
                      <q-item-section>{{ formatDateShort(detailData.createdAt) }}</q-item-section>
                    </q-item>
                    <q-item v-if="detailData.deskripsi">
                      <q-item-section side style="min-width: 120px">
                        <q-item-label caption>Deskripsi</q-item-label>
                      </q-item-section>
                      <q-item-section>{{ detailData.deskripsi }}</q-item-section>
                    </q-item>
                    <q-item v-if="detailData.notes">
                      <q-item-section side style="min-width: 120px">
                        <q-item-label caption>Catatan</q-item-label>
                      </q-item-section>
                      <q-item-section>{{ detailData.notes }}</q-item-section>
                    </q-item>
                    <q-item v-if="detailData.metodePencairan">
                      <q-item-section side style="min-width: 120px">
                        <q-item-label caption>Metode Pencairan</q-item-label>
                      </q-item-section>
                      <q-item-section>
                        <q-chip :color="detailData.metodePencairan === 'CASH' ? 'blue' : 'green'" text-color="white" size="sm">
                          {{ detailData.metodePencairan === 'CASH' ? 'Cash' : 'Transfer' }}
                        </q-chip>
                        <div v-if="detailData.rekening" class="text-caption q-mt-xs">
                          {{ detailData.rekening.namaBank }} — {{ detailData.rekening.noRekening }} (a.n. {{ detailData.rekening.atasNama }})
                        </div>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-md-6">
              <q-card flat bordered class="rounded-xl">
                <q-card-section>
                  <div class="text-subtitle2 text-weight-bold q-mb-sm">Status & Persetujuan</div>
                  <q-list dense>
                    <q-item>
                      <q-item-section side style="min-width: 120px">
                        <q-item-label caption>Status</q-item-label>
                      </q-item-section>
                      <q-item-section>
                        <q-badge :color="statusColor(detailData.status)" :label="statusLabel(detailData.status)" />
                      </q-item-section>
                    </q-item>
                    <q-item v-if="detailData.approvedBy">
                      <q-item-section side style="min-width: 120px">
                        <q-item-label caption>Disetujui</q-item-label>
                      </q-item-section>
                      <q-item-section>
                        <div>{{ detailData.approvedBy.nama }}</div>
                        <div class="text-caption text-grey-6">{{ formatDateShort(detailData.approvedAt) }}</div>
                      </q-item-section>
                    </q-item>
                    <q-item v-if="detailData.rejectedBy">
                      <q-item-section side style="min-width: 120px">
                        <q-item-label caption>Ditolak</q-item-label>
                      </q-item-section>
                      <q-item-section>
                        <div>{{ detailData.rejectedBy.nama }}</div>
                        <div class="text-caption text-grey-6">{{ formatDateShort(detailData.rejectedAt) }}</div>
                        <div v-if="detailData.rejectionNote" class="text-caption text-negative">
                          Alasan: {{ detailData.rejectionNote }}
                        </div>
                      </q-item-section>
                    </q-item>
                    <q-item v-if="detailData.disbursedBy">
                      <q-item-section side style="min-width: 120px">
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
          <q-card flat bordered class="rounded-xl q-mt-md">
            <q-card-section>
              <div class="text-subtitle2 text-weight-bold q-mb-sm">Rincian Item</div>
              <q-table
                :rows="detailData.items || []"
                :columns="itemColumns"
                row-key="id"
                flat
                dense
                hide-pagination
                :rows-per-page-options="[0]"
              >
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
                    <q-td class="text-right text-weight-bold text-primary">{{ formatCurrency(detailData.amount) }}</q-td>
                  </q-tr>
                </template>
              </q-table>
            </q-card-section>
          </q-card>

          <!-- Approval Logs -->
          <q-card v-if="detailData.approvalLogs?.length" flat bordered class="rounded-xl q-mt-md">
            <q-card-section>
              <div class="text-subtitle2 text-weight-bold q-mb-sm">Riwayat Persetujuan</div>
              <q-timeline color="primary">
                <q-timeline-entry
                  v-for="log in detailData.approvalLogs"
                  :key="log.id"
                  :subtitle="formatDateShort(log.createdAt) + ' — ' + (log.user?.nama || 'Sistem')"
                  :icon="log.action === 'APPROVED' ? 'check_circle' : 'cancel'"
                  :color="log.action === 'APPROVED' ? 'positive' : 'negative'"
                >
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
    <q-dialog v-model="rejectDialogOpen" persistent>
      <q-card style="min-width: 400px" class="rounded-xl">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold text-negative">Tolak Pengajuan</div>
          <q-space />
          <q-btn flat dense icon="close" v-close-popup />
        </q-card-section>
        <q-card-section>
          <q-form @submit="handleReject">
            <q-input
              v-model="rejectNote"
              label="Alasan Penolakan *"
              outlined
              dense
              type="textarea"
              rows="3"
              :rules="[val => !!val || 'Alasan wajib diisi']"
            />
            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn flat label="Batal" color="grey-7" no-caps v-close-popup />
              <q-btn unelevated type="submit" label="Tolak" color="negative" no-caps :loading="submissionStore.submitting" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Disburse Dialog -->
    <q-dialog v-model="disburseDialogOpen" persistent>
      <q-card style="min-width: 400px" class="rounded-xl">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold text-green-7">Cairkan Dana</div>
          <q-space />
          <q-btn flat dense icon="close" v-close-popup />
        </q-card-section>
        <q-card-section>
          <div class="text-caption text-grey-7 q-mb-md">
            Konfirmasi pencairan dana sebesar <strong class="text-primary">{{ formatCurrency(disburseTarget?.amount) }}</strong>
          </div>
          <q-form @submit="handleDisburse">
            <q-input
              v-model="disbursementRef"
              label="Nomor Referensi (opsional)"
              outlined
              dense
              hint="Misal: nomor transfer, nomor cek, dll"
            />
            <q-file
              v-model="buktiPencairanFile"
              label="Bukti Transfer"
              outlined
              dense
              accept="image/*"
              max-file-size="5242880"
              hint="Upload screenshot/struk transfer (max 5MB)"
              class="q-mt-md"
            />
            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn flat label="Batal" color="grey-7" no-caps v-close-popup />
              <q-btn unelevated type="submit" label="Cairkan" color="green-7" no-caps :loading="disburseSubmitting" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Rekening Management Dialog -->
    <q-dialog v-model="rekeningDialogOpen" persistent>
      <q-card style="min-width: 500px" class="rounded-xl">
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
            <q-input v-model="rekeningForm.namaBank" label="Nama Bank *" outlined dense :rules="[val => !!val || 'Wajib']" />
            <q-input v-model="rekeningForm.noRekening" label="No. Rekening *" outlined dense :rules="[val => !!val || 'Wajib']" />
            <q-input v-model="rekeningForm.atasNama" label="Atas Nama *" outlined dense :rules="[val => !!val || 'Wajib']" />
            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn flat label="Tutup" color="grey-7" no-caps v-close-popup />
              <q-btn unelevated type="submit" label="Tambah Rekening" color="primary" no-caps :loading="rekeningSubmitting" />
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

const form = ref({
  judul: '',
  deskripsi: '',
  notes: '',
  metodePencairan: null,
  rekeningId: null,
  items: [],
});

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
  return form.value.items.reduce((sum, item) => sum + (Number(item.qty) || 0) * (Number(item.hargaSatuan) || 0), 0);
});

const statusColor = (status) => {
  const colors = { DRAFT: 'grey', SUBMITTED: 'orange', APPROVED: 'positive', REJECTED: 'negative' };
  return colors[status] || 'grey';
};

const statusLabel = (status) => {
  const labels = { DRAFT: 'Draft', SUBMITTED: 'Menunggu', APPROVED: 'Disetujui', REJECTED: 'Ditolak' };
  return labels[status] || status;
};

const columns = [
  { name: 'nomor', label: 'Nomor', field: 'nomor', align: 'left', sortable: true },
  { name: 'judul', label: 'Judul', field: 'judul', align: 'left', sortable: true },
  { name: 'amount', label: 'Jumlah', field: 'amount', align: 'right', sortable: true },
  { name: 'status', label: 'Status', field: 'status', align: 'center', sortable: true },
  { name: 'actions', label: 'Aksi', field: 'actions', align: 'center' },
];

const itemColumns = [
  { name: 'namaBarang', label: 'Nama Item', field: 'namaBarang', align: 'left' },
  { name: 'qty', label: 'Qty', field: 'qty', align: 'center' },
  { name: 'hargaSatuan', label: 'Harga', field: 'hargaSatuan', align: 'right' },
  { name: 'jumlah', label: 'Jumlah', field: 'jumlah', align: 'right' },
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
  form.value.items.push({ namaBarang: '', qty: 1, hargaSatuan: 0, keterangan: '' });
};

const removeItem = (idx) => {
  form.value.items.splice(idx, 1);
};

const openFormDialog = (row = null) => {
  if (row) {
    isEdit.value = true;
    editId.value = row.id;
    form.value = {
      judul: row.judul,
      deskripsi: row.deskripsi || '',
      notes: row.notes || '',
      metodePencairan: row.metodePencairan || null,
      rekeningId: row.rekening?.id || null,
      items: (row.items || []).map(i => ({
        namaBarang: i.namaBarang,
        qty: i.qty,
        hargaSatuan: Number(i.hargaSatuan),
        keterangan: i.keterangan || '',
      })),
    };
  } else {
    isEdit.value = false;
    editId.value = null;
    form.value = { judul: '', deskripsi: '', notes: '', metodePencairan: null, rekeningId: null, items: [{ namaBarang: '', qty: 1, hargaSatuan: 0, keterangan: '' }] };
  }
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
  const payload = {
    judul: form.value.judul,
    deskripsi: form.value.deskripsi || null,
    notes: form.value.notes || null,
    metodePencairan: form.value.metodePencairan,
    rekeningId: form.value.rekeningId,
    items: form.value.items,
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
  await Promise.all([loadData(), fetchRekening()]);
});
</script>

<style scoped>
.rounded-xl {
  border-radius: 16px;
}
</style>
