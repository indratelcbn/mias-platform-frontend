<template>
  <q-page class="q-pb-xl">
    <div v-if="kajianStore.loading" class="flex justify-center items-center" style="min-height: 60vh">
      <q-spinner-dots color="primary" size="64px" />
    </div>

    <template v-else-if="kajianStore.current">
      <!-- Hero -->
      <div class="page-hero q-py-xl" :style="heroStyle">
        <div class="q-px-md text-white" style="max-width: 800px; margin: 0 auto">
          <q-btn flat dense icon="arrow_back" label="Kembali" no-caps @click="$router.back()" class="q-mb-md opacity-80" />
          <div class="row items-center q-gutter-sm q-mb-md">
            <q-badge color="white" text-color="primary" label="Kajian" />
          </div>
          <h1 class="text-h4 text-weight-bold q-mb-md">{{ kajianStore.current.judul }}</h1>
          <div class="row q-col-gutter-sm">
            <q-chip icon="person" :label="kajianStore.current.ustadz" color="white" text-color="primary" />
            <q-chip icon="event" :label="formatDate(kajianStore.current.tanggal)" color="white" text-color="primary" />
            <q-chip icon="schedule" :label="kajianStore.current.waktu" color="white" text-color="primary" />
            <q-chip v-if="kajianStore.current.lokasi" icon="location_on" :label="kajianStore.current.lokasi" color="white" text-color="primary" />
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="q-px-md q-py-xl" style="max-width: 800px; margin: 0 auto">
        <q-card flat bordered class="rounded-xl">
          <q-card-section class="q-pa-xl">
            <div class="text-h6 text-weight-bold q-mb-sm text-primary">Tentang Kajian</div>
            <p class="text-body1" style="line-height: 1.8; white-space: pre-line">
              {{ kajianStore.current.deskripsi || 'Tidak ada deskripsi.' }}
            </p>
          </q-card-section>
        </q-card>

        <!-- Share -->
        <div class="q-mt-lg text-center">
          <div class="text-subtitle2 text-grey-7 q-mb-sm">Bagikan Kajian Ini</div>
          <div class="row justify-center q-gutter-sm">
            <q-btn round unelevated color="green" @click="shareWhatsApp">
              <span style="font-size: 20px; line-height: 1">💬</span>
              <q-tooltip>WhatsApp</q-tooltip>
            </q-btn>
            <q-btn round unelevated color="blue-6" @click="shareTelegram">
              <span style="font-size: 20px; line-height: 1">✈️</span>
              <q-tooltip>Telegram</q-tooltip>
            </q-btn>
            <q-btn round unelevated color="grey-8" icon="content_copy" @click="copyLink">
              <q-tooltip>Salin Link</q-tooltip>
            </q-btn>
            <q-btn v-if="hasNativeShare" round unelevated color="primary" icon="share" @click="nativeShare">
              <q-tooltip>Bagikan</q-tooltip>
            </q-btn>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="flex column items-center justify-center q-py-xl">
      <q-icon name="not_interested" size="80px" color="grey-4" />
      <p class="text-grey-6 q-mt-md">Kajian tidak ditemukan</p>
      <q-btn unelevated color="primary" label="Kembali" @click="$router.push('/kajian')" class="q-mt-md" />
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useKajianStore } from 'src/stores/kajian';
import { Notify } from 'quasar';

const route = useRoute();
const kajianStore = useKajianStore();
const hasNativeShare = !!navigator.share;

const heroStyle = computed(() => {
  if (kajianStore.current?.thumbnail) {
    return {
      backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url(${kajianStore.current.thumbnail})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }
  return { background: 'linear-gradient(135deg, #1B7A4A 0%, #26A65B 100%)' };
});

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
};

const shareUrl = () => `${window.location.origin}/kajian/${kajianStore.current.id}`;

const shareText = () => {
  const k = kajianStore.current;
  return `📖 *${k.judul}*\n👤 ${k.ustadz}\n📅 ${formatDate(k.tanggal)}\n🕐 ${k.waktu}\n\n${k.deskripsi || ''}`;
};

const shareWhatsApp = () => {
  const k = kajianStore.current;
  const thumb = k.thumbnail ? `${window.location.origin}${k.thumbnail}\n\n` : '';
  const text = `${thumb}📖 *${k.judul}*\n👤 ${k.ustadz}\n📅 ${formatDate(k.tanggal)}\n🕐 ${k.waktu}\n\n${k.deskripsi || ''}\n\n${shareUrl()}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
};

const shareTelegram = () => {
  const text = shareText();
  window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl())}&text=${encodeURIComponent(text)}`, '_blank');
};

const copyLink = () => {
  navigator.clipboard.writeText(shareUrl());
  Notify.create({ type: 'positive', message: 'Link berhasil disalin', position: 'top' });
};

const nativeShare = async () => {
  try {
    await navigator.share({ title: kajianStore.current.judul, text: shareText(), url: shareUrl() });
  } catch { /* user cancelled */ }
};

onMounted(() => {
  kajianStore.fetchById(route.params.id);
});
</script>

<style scoped>
.page-hero { min-height: 300px; display: flex; align-items: flex-end; padding-bottom: 48px; }
</style>
