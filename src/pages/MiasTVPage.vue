<template>
  <q-page class="mias-tv-page">
    <!-- ─── Hero ──────────────────────────────────────────────────────────── -->
    <div class="tv-hero q-pa-xl text-center text-white">
      <div class="text-overline q-mb-sm" style="letter-spacing: 3px; opacity: .7">DAKWAH DIGITAL</div>
      <img src="/LOGO MIAS TV.png" alt="MIAS TV" class="mias-tv-logo q-mb-sm" />
      <div class="text-subtitle1" style="opacity: .85">
        Saksikan kajian, ceramah, dan siaran langsung Masjid Imam Asy Syafi'i
      </div>
    </div>

    <div class="q-pa-lg q-pa-md-xl" style="max-width: 1200px; margin: 0 auto">

      <!-- ─── Live Streaming Section ─────────────────────────────────────── -->
      <div class="q-mb-xl" style="max-width: 900px; margin: 0 auto">
        <!-- Loading -->
        <div v-if="streamingStore.loading || ytLiveLoading" class="text-center q-py-xl">
          <q-spinner-audio color="primary" size="48px" />
          <div class="q-mt-md text-grey">Memuat siaran...</div>
        </div>

        <!-- ① YouTube Auto-detected Live (prioritas tertinggi) -->
        <template v-else-if="ytLive">
          <q-card flat bordered class="q-mb-lg player-card">
            <div class="live-badge-wrap q-pa-md row items-center q-gutter-sm">
              <q-badge color="red" class="live-badge">
                <q-icon name="fiber_manual_record" size="10px" class="q-mr-xs" /> LIVE
              </q-badge>
              <span class="text-h6 text-weight-bold">{{ ytLive.title }}</span>
              <q-space />
              <q-badge outline color="red" label="YouTube Live" />
            </div>
            <q-card-section class="q-pa-none">
              <div class="video-wrapper">
                <iframe
                  :src="ytLive.embedUrl"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                  class="video-iframe"
                />
              </div>
            </q-card-section>
          </q-card>
        </template>

        <!-- ② Streaming manual dari DB (fallback) -->
        <template v-else-if="streamingStore.active">
          <q-card flat bordered class="q-mb-lg player-card">
            <div class="live-badge-wrap q-pa-md row items-center q-gutter-sm">
              <q-badge color="red" class="live-badge">
                <q-icon name="fiber_manual_record" size="10px" class="q-mr-xs" /> LIVE
              </q-badge>
              <span class="text-h6 text-weight-bold">{{ streamingStore.active.judul }}</span>
            </div>
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

        <!-- ③ Tidak ada siaran -->
        <template v-else>
          <q-banner rounded class="bg-blue-1 text-blue-9 q-mb-lg">
            <template #avatar><q-icon name="info" /></template>
            Tidak ada siaran langsung saat ini. Tonton video kajian terbaru kami di bawah.
          </q-banner>
        </template>
      </div>

      <!-- ─── YouTube Video List ─────────────────────────────────────────── -->
      <div class="q-mb-xl">
        <div class="row items-center q-mb-lg">
          <q-icon name="fab fa-youtube" color="red" size="28px" class="q-mr-sm" />
          <div class="text-h6 text-weight-bold">Video Terbaru dari Channel MIAS</div>
          <q-space />
          <q-btn
            flat no-caps dense
            label="Lihat Semua di YouTube"
            icon-right="open_in_new"
            color="red"
            href="https://www.youtube.com/@miasdepok2468"
            target="_blank"
            type="a"
          />
        </div>

        <!-- Loading videos -->
        <div v-if="ytLoading && videos.length === 0" class="text-center q-py-xl">
          <q-spinner-dots color="red" size="48px" />
          <div class="q-mt-md text-grey">Memuat video...</div>
        </div>

        <!-- Error -->
        <div v-else-if="ytError" class="text-center q-py-xl">
          <q-icon name="error_outline" size="48px" color="grey-4" />
          <div class="text-grey-6 q-mt-sm">Gagal memuat video. Silakan coba lagi.</div>
          <q-btn flat color="primary" label="Coba Lagi" class="q-mt-sm" @click="loadVideos" />
        </div>

        <!-- Video Grid -->
        <div v-else class="row q-col-gutter-md">
          <div
            v-for="v in videos"
            :key="v.videoId"
            class="col-12 col-sm-6 col-md-4"
          >
            <q-card flat bordered class="video-card cursor-pointer" @click="openVideo(v)">
              <q-img
                :src="v.thumbnail"
                :ratio="16/9"
                class="video-thumb"
              >
                <div class="absolute-full flex flex-center play-overlay">
                  <q-icon name="play_circle" size="52px" color="white" />
                </div>
              </q-img>
              <q-card-section class="q-pa-sm">
                <div class="text-body2 text-weight-medium video-title ellipsis-2-lines">{{ v.title }}</div>
                <div class="text-caption text-grey-6 q-mt-xs">
                  {{ formatDate(v.publishedAt) }}
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- Load More -->
        <div v-if="nextPageToken" class="text-center q-mt-lg">
          <q-btn
            unelevated color="red"
            label="Muat Lebih Banyak"
            icon="expand_more"
            no-caps
            :loading="ytLoading"
            @click="loadMore"
          />
        </div>
      </div>

      <!-- ─── Info Card ──────────────────────────────────────────────────── -->
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

    <!-- ─── Video Dialog ───────────────────────────────────────────────────── -->
    <q-dialog v-model="videoDialog" maximized>
      <q-card class="bg-black">
        <q-bar class="bg-grey-10 text-white">
          <span class="text-body2 ellipsis" style="max-width:80%">{{ selectedVideo?.title }}</span>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup />
        </q-bar>
        <div class="video-wrapper-dialog">
          <iframe
            v-if="selectedVideo"
            :src="`${selectedVideo.embedUrl}?autoplay=1`"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            class="video-iframe"
          />
        </div>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStreamingStore } from 'src/stores/streaming';
import { api } from 'src/boot/axios';

const streamingStore = useStreamingStore();

// ─── YouTube Live Auto-detect ───────────────────────────────────────────
const ytLive        = ref(null);
const ytLiveLoading = ref(false);

async function checkYouTubeLive() {
  ytLiveLoading.value = true;
  try {
    const res = await api.get('/youtube/live');
    ytLive.value = res.data.data; // null jika tidak ada live
  } catch {
    ytLive.value = null;
  } finally {
    ytLiveLoading.value = false;
  }
}

// ─── Streaming ──────────────────────────────────────────────────────────
onMounted(() => {
  checkYouTubeLive();
  streamingStore.fetchActive();
  loadVideos();
});

const embedUrl = computed(() => {
  if (!streamingStore.active?.url) return '';
  const url = streamingStore.active.url;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
  if (match) return `https://www.youtube.com/embed/${match[1]}?autoplay=1`;
  return url;
});

// ─── YouTube Videos ─────────────────────────────────────────────────────────
const videos        = ref([]);
const ytLoading     = ref(false);
const ytError       = ref(false);
const nextPageToken = ref(null);

async function loadVideos() {
  ytLoading.value = true;
  ytError.value   = false;
  try {
    const res = await api.get('/youtube/videos', { params: { maxResults: 12 } });
    videos.value        = res.data.videos;
    nextPageToken.value = res.data.nextPageToken;
  } catch {
    ytError.value = true;
  } finally {
    ytLoading.value = false;
  }
}

async function loadMore() {
  if (!nextPageToken.value || ytLoading.value) return;
  ytLoading.value = true;
  try {
    const res = await api.get('/youtube/videos', {
      params: { maxResults: 12, pageToken: nextPageToken.value },
    });
    videos.value.push(...res.data.videos);
    nextPageToken.value = res.data.nextPageToken;
  } catch {
    // silent fail on load more
  } finally {
    ytLoading.value = false;
  }
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

// ─── Video Dialog ────────────────────────────────────────────────────────────
const videoDialog   = ref(false);
const selectedVideo = ref(null);

function openVideo(v) {
  selectedVideo.value = v;
  videoDialog.value   = true;
}
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
.mias-tv-logo {
  height: 90px;
  width: auto;
  object-fit: contain;
  filter: drop-shadow(0 2px 8px rgba(0,0,0,.35));
  display: block;
  margin: 0 auto;
}
@media (max-width: 599px) {
  .mias-tv-logo { height: 60px; }
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
.video-wrapper-dialog {
  position: relative;
  padding-bottom: 56.25%;
  height: 0;
  overflow: hidden;
  background: #000;
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
.video-card {
  border-radius: 10px;
  overflow: hidden;
  transition: transform .15s, box-shadow .15s;
}
.video-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0,0,0,.12);
}
.video-thumb .play-overlay {
  background: rgba(0,0,0,0);
  transition: background .2s;
}
.video-card:hover .play-overlay {
  background: rgba(0,0,0,.35);
}
.video-title {
  line-height: 1.4;
}
.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

