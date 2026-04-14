<template>
  <q-page class="q-pb-xl">
    <div class="page-hero q-py-xl text-center text-white">
      <q-icon name="auto_stories" size="48px" class="q-mb-sm" />
      <h1 class="text-h4 text-weight-bold q-mb-sm">Pemateri Kajian Islam Ilmiyyah</h1>
      <p class="text-body1 opacity-80">Para ustadz pengajar di Masjid Imam Asy Syafi'i</p>
    </div>

    <div class="q-px-md q-py-xl" style="max-width: 1600px; margin: 0 auto">
      <!-- Filter tabs -->
      <div class="row justify-center q-mb-xl">
        <q-tabs v-model="tab" dense indicator-color="primary" active-color="primary">
          <q-tab name="all"    label="Semua" />
          <q-tab name="RUTIN"  label="Kajian Rutin" />
          <q-tab name="TEMATIK" label="Kajian Tematik" />
        </q-tabs>
      </div>

      <div v-if="store.loading" class="text-center q-py-xl">
        <q-spinner-dots color="primary" size="48px" />
      </div>
      <div v-else-if="!filtered.length" class="text-center q-py-xl text-grey-6">
        <q-icon name="person_off" size="72px" color="grey-4" />
        <div class="q-mt-md">Belum ada data pemateri.</div>
      </div>

      <!-- Grid Table -->
      <q-card v-else flat bordered class="pemateri-table-card">
        <q-table
          :rows="filtered"
          :columns="columns"
          row-key="id"
          flat
          hide-pagination
          :rows-per-page-options="[0]"
          :pagination="{ rowsPerPage: 0 }"
        >
          <template #body-cell-foto="props">
            <q-td class="text-center">
              <q-avatar
                size="48px"
                :class="props.value ? 'cursor-pointer' : ''"
                @click="props.value && open(props.value, props.row.nama)"
              >
                <img v-if="props.value" :src="props.value" />
                <q-icon v-else name="person" size="28px" color="grey-5" />
              </q-avatar>
            </q-td>
          </template>
          <template #body-cell-jenis="props">
            <q-td class="text-center">
              <q-badge
                :color="props.value === 'RUTIN' ? 'primary' : 'deep-orange'"
              >{{ props.value === 'RUTIN' ? 'Rutin' : 'Tematik' }}</q-badge>
            </q-td>
          </template>
          <template #body-cell-waktu="props">
            <q-td class="text-center">
              {{ props.row.jenis === 'RUTIN' ? (props.value || '-') : '-' }}
            </q-td>
          </template>
          <template #body-cell-jam="props">
            <q-td class="text-center">
              {{ props.row.jenis === 'RUTIN' ? (props.value || '-') : '-' }}
            </q-td>
          </template>
          <template #body-cell-kitab="props">
            <q-td>
              <div v-if="props.value" class="column q-gutter-xs">
                <div v-for="k in kitabList(props.value)" :key="k" class="row items-center q-gutter-xs no-wrap">
                  <q-icon name="menu_book" size="14px" color="primary" />
                  <span class="text-caption">{{ k }}</span>
                </div>
              </div>
              <span v-else class="text-grey-5">-</span>
            </q-td>
          </template>
          <template #body-cell-keterangan="props">
            <q-td style="white-space: pre-line; max-width: 180px">
              {{ props.value || '-' }}
            </q-td>
          </template>
          <template #body-cell-youtube="props">
            <q-td class="text-center">
              <a v-if="props.value" :href="props.value" target="_blank" rel="noopener noreferrer" class="youtube-link">
                <q-icon name="fab fa-youtube" color="red" size="20px" />
                <q-tooltip>Buka YouTube</q-tooltip>
              </a>
              <span v-else class="text-grey-5">-</span>
            </q-td>
          </template>
        </q-table>
      </q-card>
    </div>

    <AppLightbox />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useProfilPemateriStore } from 'src/stores/profil';
import AppLightbox from 'components/AppLightbox.vue';
import { useLightbox } from 'src/composables/useLightbox';

const store = useProfilPemateriStore();
onMounted(() => store.fetchPublic());

const { open } = useLightbox();

const tab = ref('all');

// Urutan waktu untuk sorting
const waktuOrder = { 'Pekan 1': 1, 'Pekan 2': 2, 'Pekan 3': 3, 'Pekan 4': 4, 'Pekan 5': 5 };
const jamOrder = { "Ba'da Shubuh - Selesai": 1, '09.00 - 12.00 WIB': 2, "Ba'da Maghrib - Selesai": 3 };

function firstWaktuRank(waktu) {
  if (!waktu) return 99;
  const first = waktu.split(',')[0].trim();
  return waktuOrder[first] ?? 99;
}

const filtered = computed(() => {
  const list = tab.value === 'all' ? [...store.list] : store.list.filter(p => p.jenis === tab.value);
  return list.sort((a, b) => {
    const wA = firstWaktuRank(a.waktu);
    const wB = firstWaktuRank(b.waktu);
    if (wA !== wB) return wA - wB;
    const jA = jamOrder[a.jam] ?? 99;
    const jB = jamOrder[b.jam] ?? 99;
    return jA - jB;
  });
});

const columns = [
  { name: 'foto',       label: 'Foto',       field: 'foto',       align: 'center', style: 'width: 64px' },
  { name: 'nama',       label: 'Nama',       field: 'nama',       align: 'left',   sortable: true },
  { name: 'jenis',      label: 'Jenis Kajian',      field: 'jenis',      align: 'center', sortable: true },
  { name: 'waktu',      label: 'Waktu',      field: 'waktu',      align: 'center', sortable: true },
  { name: 'jam',        label: 'Jam',        field: 'jam',        align: 'center', sortable: true },
  { name: 'kitab',      label: 'Kitab / Materi', field: 'kitab',  align: 'left' },
  { name: 'keterangan', label: 'Keterangan', field: 'keterangan', align: 'left' },
  { name: 'youtube',    label: 'Playlist YouTube',    field: 'youtube',    align: 'center' },
];

function kitabList(kitab) {
  return kitab ? kitab.split('\n').map(k => k.trim()).filter(Boolean) : [];
}
</script>

<style scoped>
.page-hero {
  background: linear-gradient(135deg, #BF360C 0%, #E64A19 100%);
  padding: 80px 0;
}
.pemateri-table-card {
  border-radius: 12px;
  overflow: hidden;
}
</style>
