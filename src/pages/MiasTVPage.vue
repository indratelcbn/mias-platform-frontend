<template>
  <q-page class="mias-tv-page">
    <!-- ─── Hero ──────────────────────────────────────────────────────────── -->
    <div class="tv-hero q-pa-xl text-center text-white">
      <div class="text-overline q-mb-xs" style="letter-spacing: 3px; opacity: .7">DAKWAH DIGITAL</div>
      <div class="text-h3 text-weight-bold q-mb-sm">MIAS TV</div>
      <div class="text-subtitle1" style="opacity: .85">
        Saksikan kajian, ceramah, dan siaran langsung Masjid Imam Asy Syafi'i
      </div>
    </div>

    <div class="q-pa-lg q-pa-md-xl" style="max-width: 900px; margin: 0 auto">

      <!-- Loading -->
      <div v-if="streamingStore.loading" class="text-center q-py-xl">
        <q-spinner-audio color="primary" size="48px" />
        <div class="q-mt-md text-grey">Memuat siaran...</div>
      </div>

      <!-- Live Streaming Player -->
      <template v-else-if="streamingStore.active">
        <q-card flat bordered class="q-mb-lg player-card">
          <div class="live-badge-wrap q-pa-md row items-center q-gutter-sm">
            <q-badge color="red" class="live-badge">
              <q-icon name="fiber_manual_record" size="10px" class="q-mr-xs" /> LIVE
            </q-badge>
            <span class="text-h6 text-weight-bold">{{ streamingStore.active.judul }}</span>
          </div>

          <!-- Embedded YouTube iframe -->
          <q-card-section class="q-pa-none">
            <div class="video-wrapper">
              <iframe
                :src="embedUrl"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
                class="video-iframe"
              />
            </div>
          </q-card-section>

          <q-card-section v-if="streamingStore.active.deskripsi">
            <div class="text-body2 text-grey-7">{{ streamingStore.active.deskripsi }}</div>
          </q-card-section>
        </q-card>
      </template>

      <!-- No Active Streaming -->
      <template v-else>
        <div class="text-center q-py-xl">
          <q-icon name="live_tv" size="72px" color="grey-4" />
          <div class="text-h6 text-grey-6 q-mt-md">Tidak Ada Siaran Aktif</div>
          <div class="text-body2 text-grey-5 q-mt-sm">
            Belum ada siaran yang sedang berlangsung saat ini.<br />
            Silakan cek kembali nanti atau ikuti pengumuman resmi kami.
          </div>
          <q-btn
            unelevated
            color="primary"
            label="Kembali ke Beranda"
            to="/"
            class="q-mt-lg"
            no-caps
            style="border-radius: 8px"
          />
        </div>
      </template>

      <!-- Info Card -->
      <q-card flat class="info-card q-mt-lg">
        <q-card-section class="row q-col-gutter-md">
          <div class="col-12 col-sm-4 text-center">
            <q-icon name="live_tv" color="primary" size="32px" />
            <div class="text-subtitle2 q-mt-xs text-weight-bold">Siaran Langsung</div>
            <div class="text-caption text-grey-6">Kajian & ceramah masjid</div>
          </div>
          <div class="col-12 col-sm-4 text-center">
            <q-icon name="schedule" color="positive" size="32px" />
            <div class="text-subtitle2 q-mt-xs text-weight-bold">Jadwal Rutin</div>
            <div class="text-caption text-grey-6">Setiap selesai sholat Subuh & Isya</div>
          </div>
          <div class="col-12 col-sm-4 text-center">
            <q-icon name="notifications_active" color="orange" size="32px" />
            <div class="text-subtitle2 q-mt-xs text-weight-bold">Notifikasi</div>
            <div class="text-caption text-grey-6">Pantau pengumuman di sosmed kami</div>
          </div>
        </q-card-section>
      </q-card>

    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useStreamingStore } from 'src/stores/streaming';

const streamingStore = useStreamingStore();

onMounted(() => {
  streamingStore.fetchActive();
});

const embedUrl = computed(() => {
  if (!streamingStore.active?.url) return '';
  const url = streamingStore.active.url;
  // Convert YouTube watch URL to embed URL if needed
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
  if (match) return `https://www.youtube.com/embed/${match[1]}?autoplay=1`;
  // If already embed URL or other format, return as-is
  return url;
});
</script>

<style scoped>
.tv-hero {
  background: linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #1565c0 100%);
  min-height: 220px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.player-card {
  border-radius: 12px;
  overflow: hidden;
}
.live-badge {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 4px;
}
.live-badge-wrap {
  background: #f8f9fa;
}
.video-wrapper {
  position: relative;
  padding-bottom: 56.25%;
  height: 0;
  overflow: hidden;
}
.video-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.info-card {
  border-radius: 12px;
  background: #f5f7ff;
}
</style>
