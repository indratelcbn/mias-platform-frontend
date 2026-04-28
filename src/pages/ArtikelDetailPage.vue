<template>
  <q-page class="q-pb-xl">
    <div v-if="artikelStore.loading" class="flex justify-center items-center" style="min-height: 60vh">
      <q-spinner-dots color="primary" size="64px" />
    </div>

    <template v-else-if="artikelStore.current">
      <!-- Hero Image -->
      <div class="artikel-hero" :style="heroStyle">
        <div class="hero-overlay q-px-md q-pb-xl" style="max-width: 820px; margin: 0 auto">
          <q-btn
            flat dense icon="arrow_back" label="Semua Artikel" no-caps
            class="q-mb-md text-white opacity-80"
            @click="$router.push('/artikel')"
          />
          <q-chip
            v-if="artikelStore.current.kategori"
            color="primary" text-color="white" dense
            :label="artikelStore.current.kategori"
            class="q-mb-sm"
          />
          <h1 class="text-h3 text-white text-weight-bold q-my-sm article-title">
            {{ artikelStore.current.judul }}
          </h1>
          <div class="row items-center q-gutter-md q-mt-md text-white opacity-90 text-body2">
            <div class="row items-center q-gutter-xs">
              <q-icon name="person" size="sm" />
              <span>{{ artikelStore.current.creator?.nama || 'Admin MIAS' }}</span>
            </div>
            <div class="row items-center q-gutter-xs">
              <q-icon name="event" size="sm" />
              <span>{{ formatDate(artikelStore.current.tanggalPublish || artikelStore.current.createdAt) }}</span>
            </div>
            <div class="row items-center q-gutter-xs">
              <q-icon name="schedule" size="sm" />
              <span>{{ readingTime }} menit baca</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="q-px-md" style="max-width: 820px; margin: 0 auto; margin-top: -40px; position: relative; z-index: 1">
        <q-card flat bordered class="rounded-xl">
          <q-card-section class="q-pa-xl">
            <p v-if="artikelStore.current.ringkasan" class="text-h6 text-grey-8 article-lead">
              {{ artikelStore.current.ringkasan }}
            </p>
            <q-separator v-if="artikelStore.current.ringkasan" class="q-my-md" />
            <div class="artikel-content" v-html="artikelStore.current.konten" />
          </q-card-section>

          <!-- Share -->
          <q-separator />
          <q-card-section class="row items-center justify-between">
            <div class="text-caption text-grey-7">Bagikan artikel ini</div>
            <div class="q-gutter-xs">
              <q-btn round dense flat icon="content_copy" color="grey-8" @click="copyLink">
                <q-tooltip>Salin link</q-tooltip>
              </q-btn>
              <q-btn round dense flat icon="img:https://cdn.simpleicons.org/whatsapp/25D366" :href="shareWA" target="_blank">
                <q-tooltip>Bagikan ke WhatsApp</q-tooltip>
              </q-btn>
              <q-btn round dense flat icon="img:https://cdn.simpleicons.org/facebook/1877F2" :href="shareFB" target="_blank">
                <q-tooltip>Bagikan ke Facebook</q-tooltip>
              </q-btn>
            </div>
          </q-card-section>
        </q-card>

        <!-- Related -->
        <div v-if="related.length" class="q-mt-xl">
          <div class="text-h6 text-weight-bold q-mb-md">Artikel Lainnya</div>
          <div class="row q-col-gutter-md">
            <div v-for="a in related" :key="a.id" class="col-12 col-sm-6 col-md-4">
              <ArtikelCard :artikel="a" />
            </div>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="flex column items-center justify-center q-py-xl">
      <q-icon name="article" size="80px" color="grey-4" />
      <p class="text-grey-6 q-mt-md">Artikel tidak ditemukan</p>
      <q-btn unelevated color="primary" label="Kembali" @click="$router.push('/artikel')" class="q-mt-md" />
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useArtikelStore } from 'src/stores/artikel';
import { useQuasar } from 'quasar';
import ArtikelCard from 'src/components/ArtikelCard.vue';

const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const artikelStore = useArtikelStore();

const heroStyle = computed(() => {
  if (artikelStore.current?.thumbnail) {
    return {
      backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url(${artikelStore.current.thumbnail})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }
  return { background: 'linear-gradient(135deg, #1B7A4A 0%, #26A65B 100%)' };
});

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

const readingTime = computed(() => {
  const text = (artikelStore.current?.konten || '').replace(/<[^>]+>/g, ' ');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
});

const related = computed(() => artikelStore.current?.related || []);

const pageUrl = computed(() => typeof window !== 'undefined' ? window.location.href : '');
const shareWA = computed(() => `https://wa.me/?text=${encodeURIComponent(`${artikelStore.current?.judul} - ${pageUrl.value}`)}`);
const shareFB = computed(() => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl.value)}`);

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(pageUrl.value);
    $q.notify({ type: 'positive', message: 'Link disalin.' });
  } catch {
    $q.notify({ type: 'negative', message: 'Gagal menyalin link.' });
  }
};

const updateMeta = () => {
  const a = artikelStore.current;
  if (!a) return;
  document.title = (a.metaTitle || a.judul) + ' | MIAS';
  let meta = document.querySelector('meta[name="description"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'description');
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', a.metaDescription || a.ringkasan || '');
};

watch(() => artikelStore.current, updateMeta);

onMounted(async () => {
  await artikelStore.fetchBySlug(route.params.slug);
  updateMeta();
});

watch(() => route.params.slug, async (slug) => {
  if (slug && route.name === router.currentRoute.value.name) {
    window.scrollTo({ top: 0 });
    await artikelStore.fetchBySlug(slug);
  }
});
</script>

<style scoped>
.artikel-hero {
  min-height: 380px;
  display: flex;
  align-items: flex-end;
  padding-top: 80px;
}
.hero-overlay { width: 100%; }
.article-title { line-height: 1.2; text-shadow: 0 2px 12px rgba(0,0,0,0.35); }
.article-lead { font-weight: 500; line-height: 1.6; }
</style>

<style>
/* Global so v-html content is styled */
.artikel-content {
  font-size: 17px;
  line-height: 1.85;
  color: #2c3340;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}
.artikel-content > *:first-child { margin-top: 0; }
.artikel-content p { margin: 0 0 1.25em; }
.artikel-content h2 {
  font-size: 1.7rem; font-weight: 700;
  margin: 1.8em 0 0.6em; color: #1B7A4A;
  border-left: 4px solid #1B7A4A; padding-left: 12px;
}
.artikel-content h3 {
  font-size: 1.3rem; font-weight: 700;
  margin: 1.5em 0 0.5em; color: #1B7A4A;
}
.artikel-content ul, .artikel-content ol {
  padding-left: 1.5em; margin: 0 0 1.2em;
}
.artikel-content li { margin-bottom: 0.5em; }
.artikel-content blockquote {
  border-left: 4px solid #1B7A4A;
  margin: 1.4em 0; padding: 0.8em 1.2em;
  background: #f1faf3; border-radius: 6px;
  font-style: italic; color: #2c3e50;
}
.artikel-content a {
  color: #1B7A4A; text-decoration: underline; font-weight: 500;
}
.artikel-content a:hover { color: #145c38; }
.artikel-content img {
  max-width: 100%; height: auto; border-radius: 10px; margin: 1.2em auto; display: block;
  box-shadow: 0 4px 14px rgba(0,0,0,0.08);
}
.artikel-content hr {
  border: none; border-top: 1px solid #e3e6ea; margin: 2em 0;
}
.artikel-content table {
  border-collapse: collapse; width: 100%; margin: 1.4em 0;
  font-size: 15px;
}
.artikel-content table td, .artikel-content table th {
  border: 1px solid #d4d8de; padding: 8px 12px; vertical-align: top;
}
.artikel-content table th { background: #f1faf3; font-weight: 700; color: #1B7A4A; }
.artikel-content strong { color: #1f2933; }
@media (max-width: 600px) {
  .artikel-content { font-size: 16px; }
  .artikel-content h2 { font-size: 1.4rem; }
  .artikel-content h3 { font-size: 1.15rem; }
}
</style>
