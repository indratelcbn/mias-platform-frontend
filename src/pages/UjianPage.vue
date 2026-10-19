<template>
  <q-page class="flex flex-center bg-grey-1" style="min-height:100vh">
    <q-card flat bordered style="width:100%; max-width:480px; border-radius:16px" class="q-ma-md">
      <!-- Header -->
      <div class="q-pa-lg text-center bg-primary" style="border-radius:16px 16px 0 0">
        <q-icon name="quiz" color="white" size="48px" />
        <div class="text-h5 text-white text-weight-bold q-mt-sm">Ujian Online</div>
        <div class="text-caption text-white opacity-80">MIAS Depok</div>
      </div>

      <q-card-section class="q-pa-lg">
        <!-- Step 1: masukkan kode & identitas -->
        <template v-if="!ujianInfo">
          <div class="text-subtitle1 text-weight-medium q-mb-md">Masukkan Kode Ujian</div>
          <q-form @submit.prevent="cariUjian" class="q-gutter-md">
            <q-input
              v-model="kodeUjian"
              label="Kode Ujian *"
              outlined
              dense
              autofocus
              :rules="[v => !!v || 'Wajib diisi']"
              @keyup.enter="cariUjian"
            />
            <q-input
              v-model="namaLengkap"
              label="Nama Lengkap *"
              outlined
              dense
              :rules="[v => !!v || 'Wajib diisi']"
            />
            <q-input
              v-model="identitas"
              label="Identitas (NIM / No. Peserta / dll) *"
              outlined
              dense
              :rules="[v => !!v || 'Wajib diisi']"
            />
            <q-banner v-if="errorMsg" dense rounded class="bg-red-1 text-negative">
              <template #avatar><q-icon name="error" /></template>
              {{ errorMsg }}
            </q-banner>
            <q-btn unelevated color="primary" type="submit" label="Masuk" icon-right="arrow_forward" :loading="loading" class="full-width" />
          </q-form>
        </template>

        <!-- Step 2: tampilkan info ujian + petunjuk -->
        <template v-else>
          <div class="q-mb-md">
            <div class="text-h6 text-weight-bold"><arabic-text :text="ujianInfo.judul" /></div>
            <div v-if="ujianInfo.deskripsi" class="text-body2 text-grey-7 q-mt-xs"><arabic-text :text="ujianInfo.deskripsi" /></div>
          </div>

          <q-list dense class="q-mb-md">
            <q-item>
              <q-item-section avatar><q-icon name="schedule" color="primary" /></q-item-section>
              <q-item-section><span class="text-caption">Durasi: <b>{{ ujianInfo.durasi }} menit</b></span></q-item-section>
            </q-item>
            <q-item>
              <q-item-section avatar><q-icon name="timer" color="primary" /></q-item-section>
              <q-item-section><span class="text-caption">Nilai lulus: <b>{{ ujianInfo.passingGrade }}%</b></span></q-item-section>
            </q-item>
            <q-item>
              <q-item-section avatar><q-icon name="repeat" color="primary" /></q-item-section>
              <q-item-section><span class="text-caption">Maks. percobaan: <b>{{ ujianInfo.maxPercobaan }}×</b></span></q-item-section>
            </q-item>
          </q-list>

          <div v-if="ujianInfo.petunjuk" class="bg-blue-1 rounded-borders q-pa-md q-mb-md">
            <div class="text-caption text-weight-bold text-primary q-mb-xs"><q-icon name="info" class="q-mr-xs" />Petunjuk:</div>
            <div class="text-body2" style="white-space: pre-line"><arabic-text :text="ujianInfo.petunjuk" /></div>
          </div>

          <q-banner v-if="resumed" dense rounded class="bg-orange-1 text-warning q-mb-md">
            <template #avatar><q-icon name="restore" /></template>
            Anda melanjutkan sesi ujian yang sempat terhenti.
          </q-banner>

          <q-btn
            unelevated
            color="positive"
            :label="resumed ? 'Lanjutkan Ujian' : 'Mulai Ujian'"
            icon="play_arrow"
            class="full-width"
            :loading="starting"
            @click="mulaiUjian"
          />
          <q-btn flat class="full-width q-mt-sm" label="Kembali" @click="ujianInfo = null; errorMsg = ''" />
        </template>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { api } from 'src/boot/axios';
import ArabicText from 'components/ArabicText.vue';

const router = useRouter();

const kodeUjian = ref('');
const namaLengkap = ref('');
const identitas = ref('');
const errorMsg = ref('');
const loading = ref(false);
const starting = ref(false);
const ujianInfo = ref(null);
const resumed = ref(false);
const pesertaId = ref(null);

const cariUjian = async () => {
  errorMsg.value = '';
  if (!kodeUjian.value.trim() || !namaLengkap.value.trim() || !identitas.value.trim()) {
    errorMsg.value = 'Semua field wajib diisi.';
    return;
  }
  loading.value = true;
  try {
    const { data } = await api.post('/ujian/masuk', {
      kodeUjian: kodeUjian.value.trim(),
      namaLengkap: namaLengkap.value.trim(),
      identitas: identitas.value.trim(),
    });
    if (data.success) {
      pesertaId.value = data.pesertaId;
      resumed.value = data.resumed;

      // ambil info ujian untuk tampilkan petunjuk
      const sesi = await api.get(`/ujian/sesi/${data.pesertaId}`);
      ujianInfo.value = {
        ...sesi.data.data.ujian,
        passingGrade: 70, // fallback, akan dioverride di sesi
      };
    }
  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'Terjadi kesalahan. Coba lagi.';
  } finally {
    loading.value = false;
  }
};

const mulaiUjian = () => {
  starting.value = true;
  router.push({ name: 'ujian-sesi', params: { pesertaId: pesertaId.value } });
};
</script>
