<template>
  <q-page class="umroh-page">

    <!-- ─── Hero ──────────────────────────────────────────────────────────── -->
    <section class="umroh-hero">
      <div class="hero-overlay">
        <div class="hero-content">
          <q-icon name="flight" size="52px" color="white" class="q-mb-md" />
          <div class="text-overline q-mb-xs hero-overline">PROGRAM PERJALANAN IBADAH</div>
          <h1 class="hero-title">Umroh Bersama MIAS</h1>
          <p class="hero-tagline">Wujudkan impian ibadah ke Tanah Suci dengan bimbingan terpercaya</p>
        </div>
      </div>
    </section>

    <!-- ─── Body ──────────────────────────────────────────────────────────── -->
    <div class="umroh-body q-px-lg q-px-md-xl q-pb-xl" style="max-width: 1100px; margin: 0 auto">

      <!-- Loading Skeleton -->
      <div v-if="store.loading" class="row q-col-gutter-lg q-mt-xl">
        <div v-for="n in 3" :key="n" class="col-12 col-sm-6 col-md-4">
          <q-skeleton height="380px" style="border-radius: 16px" />
        </div>
      </div>

      <!-- Cards Grid -->
      <div v-else-if="store.list.length" class="row q-col-gutter-lg q-mt-xl">
        <div
          v-for="program in store.list"
          :key="program.id"
          class="col-12 col-sm-6 col-md-4"
        >
          <q-card class="umroh-card" flat>
            <!-- Flyer Image -->
            <q-img
              :src="program.flyer"
              :ratio="3/4"
              fit="cover"
              class="umroh-flyer cursor-pointer"
              @click="open(program.flyer, program.judul)"
            >
              <template #loading>
                <div class="absolute-full flex flex-center bg-grey-2">
                  <q-spinner color="primary" />
                </div>
              </template>
              <template #error>
                <div class="absolute-full flex flex-center bg-grey-2 text-grey-5">
                  <q-icon name="broken_image" size="48px" />
                </div>
              </template>
              <!-- Harga badge -->
              <div v-if="program.harga" class="absolute-bottom-right q-ma-sm">
                <q-badge color="primary" class="harga-badge">
                  {{ formatRupiah(program.harga) }}
                </q-badge>
              </div>
            </q-img>

            <!-- Card Info -->
            <q-card-section class="q-pt-md col">
              <div class="text-h6 text-weight-bold q-mb-sm umroh-judul">{{ program.judul }}</div>
              <p v-if="program.deskripsi" class="text-body2 text-grey-7 umroh-deskripsi">
                {{ program.deskripsi }}
              </p>
              <q-btn
                v-if="program.deskripsi"
                flat
                dense
                no-caps
                color="primary"
                size="sm"
                label="Selengkapnya"
                icon-right="expand_more"
                class="q-mt-xs q-px-none"
                @click="openDetail(program)"
              />
            </q-card-section>

            <q-card-actions class="umroh-actions q-px-md q-pb-md">
              <q-btn
                unelevated
                no-caps
                color="primary"
                icon="chat"
                label="Hubungi Kami"
                class="umroh-btn umroh-btn--primary"
                @click="openContact(program)"
              />
              <div class="umroh-actions__row">
                <q-btn
                  outline
                  no-caps
                  color="primary"
                  icon="info"
                  label="Detail"
                  class="umroh-btn"
                  @click="openDetail(program)"
                />
                <q-btn
                  outline
                  no-caps
                  color="primary"
                  icon="share"
                  label="Bagikan"
                  class="umroh-btn"
                  @click="shareProgram(program)"
                />
              </div>
            </q-card-actions>
          </q-card>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state q-mt-xl">
        <div class="empty-icon-wrap">
          <q-icon name="flight_takeoff" color="grey-5" size="64px" />
        </div>
        <div class="text-h6 text-grey-6 q-mt-lg">Program Segera Hadir</div>
        <div class="text-body2 text-grey-5 q-mt-sm">
          Program Umroh MIAS akan segera diumumkan. Pantau terus!
        </div>
      </div>

    </div>

    <!-- ─── CTA Banner ─────────────────────────────────────────────────────── -->
    <section class="cta-section">
      <div class="cta-inner">
        <q-icon name="mosque" size="40px" color="white" class="q-mb-sm" />
        <div class="text-h5 text-white text-weight-bold q-mb-sm">Daftarkan Diri Sekarang</div>
        <p class="text-white text-body1 q-mb-lg" style="opacity: 0.9">
          Hubungi pengurus masjid untuk informasi dan pendaftaran lebih lanjut.
        </p>
        <q-btn
          unelevated
          no-caps
          color="white"
          text-color="primary"
          label="Hubungi via WhatsApp"
          icon="whatsapp"
          style="border-radius: 12px; font-weight: 600"
          :href="whatsappLink"
          target="_blank"
        />
      </div>
    </section>

    <!-- ─── Detail Dialog ──────────────────────────────────────────────────── -->
    <q-dialog v-model="detailDialog" @hide="detailProgram = null">
      <q-card v-if="detailProgram" class="detail-card">
        <q-card-section class="row items-center q-pb-sm">
          <div class="text-subtitle1 text-weight-bold text-primary ellipsis">{{ detailProgram.judul }}</div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>
        <q-separator />

        <q-card-section class="scroll detail-body">
          <div class="row q-col-gutter-lg">
            <!-- Flyer -->
            <div class="col-12 col-sm-5">
              <q-img
                :src="detailProgram.flyer"
                :ratio="3/4"
                fit="cover"
                class="detail-flyer cursor-pointer"
                @click="open(detailProgram.flyer, detailProgram.judul)"
              >
                <template #loading>
                  <div class="absolute-full flex flex-center bg-grey-2"><q-spinner color="primary" /></div>
                </template>
                <template #error>
                  <div class="absolute-full flex flex-center bg-grey-2 text-grey-5"><q-icon name="broken_image" size="48px" /></div>
                </template>
              </q-img>
            </div>

            <!-- Info -->
            <div class="col-12 col-sm-7">
              <div class="text-h6 text-weight-bold q-mb-sm">{{ detailProgram.judul }}</div>
              <div v-if="detailProgram.harga" class="q-mb-md">
                <q-chip color="primary" text-color="white" icon="sell" class="text-weight-bold">
                  {{ formatRupiah(detailProgram.harga) }}
                </q-chip>
              </div>
              <div v-if="detailProgram.deskripsi" class="text-body2 text-grey-8 detail-deskripsi">{{ detailProgram.deskripsi }}</div>
              <div v-else class="text-body2 text-grey-5">Belum ada deskripsi untuk program ini.</div>
            </div>
          </div>
        </q-card-section>

        <q-separator />
        <q-card-actions class="q-pa-md">
          <q-btn
            flat
            no-caps
            color="primary"
            icon="share"
            label="Bagikan"
            @click="shareProgram(detailProgram)"
          />
          <q-space />
          <q-btn
            unelevated
            no-caps
            color="primary"
            icon="chat"
            label="Hubungi Kami"
            style="border-radius: 10px"
            @click="openContact()"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <PesanDialog v-model="contactDialog" default-kategori="UMROH" :default-subjek="contactSubjek" />

    <AppLightbox />
  </q-page>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { useUmrohStore } from 'src/stores/usaha';
import { useSettingStore } from 'src/stores/setting';
import AppLightbox from 'components/AppLightbox.vue';
import PesanDialog from 'components/PesanDialog.vue';
import { useLightbox } from 'src/composables/useLightbox';
import { Notify, copyToClipboard, useMeta } from 'quasar';

const store = useUmrohStore();
const setting = useSettingStore();
const { open } = useLightbox();

const detailDialog = ref(false);
const detailProgram = ref(null);
const contactDialog = ref(false);
const contactSubjek = ref('');

const formatRupiah = (val) => {
  const num = Number(val);
  if (!num) return '';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
};

const whatsappLink = computed(() => setting.data.whatsapp || 'https://wa.me/6281234567890');

// ── SEO ─────────────────────────────────────────────────────────────────────
const siteOrigin = typeof window !== 'undefined' ? window.location.origin : '';
const pageUrl = `${siteOrigin}/usaha/umroh`;

const toAbsoluteUrl = (path) => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${siteOrigin}${path.startsWith('/') ? '' : '/'}${path}`;
};

const seoTitle = computed(() => "Program Umroh Bersama MIAS | Masjid Imam Asy-Syafi'i Depok");

const seoDescription = computed(() => {
  const programs = store.list;
  if (programs.length) {
    const nama = programs.map((p) => p.judul).slice(0, 4).join(', ');
    return `Ikuti program Umroh bersama MIAS (Masjid Imam Asy-Syafi'i Depok) dengan bimbingan terpercaya. Tersedia ${programs.length} program: ${nama}. Hubungi kami untuk informasi jadwal, harga, dan pendaftaran.`;
  }
  return "Program perjalanan ibadah Umroh bersama MIAS (Masjid Imam Asy-Syafi'i Depok). Wujudkan impian ibadah ke Tanah Suci dengan bimbingan terpercaya. Hubungi kami untuk informasi dan pendaftaran.";
});

const seoImage = computed(() => {
  const withFlyer = store.list.find((p) => p.flyer);
  return withFlyer ? toAbsoluteUrl(withFlyer.flyer) : toAbsoluteUrl('/icons/icon-512x512.png');
});

const structuredData = computed(() => {
  const graph = [
    {
      '@type': 'WebPage',
      '@id': pageUrl,
      url: pageUrl,
      name: seoTitle.value,
      description: seoDescription.value,
      inLanguage: 'id-ID',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Beranda', item: `${siteOrigin}/` },
        { '@type': 'ListItem', position: 2, name: 'Umroh', item: pageUrl },
      ],
    },
  ];

  if (store.list.length) {
    graph.push({
      '@type': 'ItemList',
      name: 'Program Umroh MIAS',
      itemListElement: store.list.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'Product',
          name: p.judul,
          ...(p.deskripsi ? { description: p.deskripsi } : {}),
          ...(p.flyer ? { image: toAbsoluteUrl(p.flyer) } : {}),
          brand: { '@type': 'Organization', name: "Masjid Imam Asy-Syafi'i Depok (MIAS)" },
          ...(Number(p.harga) > 0
            ? { offers: { '@type': 'Offer', price: Number(p.harga), priceCurrency: 'IDR', availability: 'https://schema.org/InStock', url: pageUrl } }
            : {}),
        },
      })),
    });
  }

  return { '@context': 'https://schema.org', '@graph': graph };
});

useMeta(() => ({
  title: seoTitle.value,
  meta: {
    description: { name: 'description', content: seoDescription.value },
    keywords: { name: 'keywords', content: "umroh, umroh depok, program umroh, umroh MIAS, Masjid Imam Asy-Syafi'i, travel umroh, paket umroh, ibadah umroh" },
    robots: { name: 'robots', content: 'index, follow' },
    ogType: { property: 'og:type', content: 'website' },
    ogTitle: { property: 'og:title', content: seoTitle.value },
    ogDescription: { property: 'og:description', content: seoDescription.value },
    ogUrl: { property: 'og:url', content: pageUrl },
    ogImage: { property: 'og:image', content: seoImage.value },
    ogSiteName: { property: 'og:site_name', content: "Masjid Imam Asy-Syafi'i Depok" },
    ogLocale: { property: 'og:locale', content: 'id_ID' },
    twitterCard: { name: 'twitter:card', content: 'summary_large_image' },
    twitterTitle: { name: 'twitter:title', content: seoTitle.value },
    twitterDescription: { name: 'twitter:description', content: seoDescription.value },
    twitterImage: { name: 'twitter:image', content: seoImage.value },
  },
  link: {
    canonical: { rel: 'canonical', href: pageUrl },
  },
  script: {
    ldJson: { type: 'application/ld+json', innerHTML: JSON.stringify(structuredData.value) },
  },
}));

const openDetail = (program) => {
  detailProgram.value = program;
  detailDialog.value = true;
};

const openContact = (program = null) => {
  const prog = program || detailProgram.value;
  contactSubjek.value = prog ? `Pertanyaan Program Umroh: ${prog.judul}` : '';
  detailDialog.value = false;
  contactDialog.value = true;
};

const shareProgram = async (program) => {
  const url = window.location.href;
  const title = `Program Umroh MIAS - ${program.judul}`;
  const text = [title, program.deskripsi, program.harga ? `Harga: ${formatRupiah(program.harga)}` : '']
    .filter(Boolean)
    .join('\n\n');
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
    } catch { /* dibatalkan pengguna */ }
    return;
  }
  try {
    await copyToClipboard(`${text}\n\n${url}`);
    Notify.create({ type: 'positive', message: 'Info program disalin ke clipboard.', position: 'top' });
  } catch {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n\n${url}`)}`, '_blank');
  }
};

onMounted(() => {
  store.fetchPublic();
  setting.fetch();
});
</script>

<style scoped>
/* ── Hero ──────────────────────────────────────────────────────────────────── */
.umroh-hero {
  position: relative;
  min-height: 320px;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #1a6e3c 0%, #0d4a28 100%);
}
.hero-overlay {
  width: 100%;
  padding: 64px 32px;
  background: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.3));
}
.hero-content {
  max-width: 820px;
  margin: 0 auto;
  text-align: center;
  color: #fff;
}
.hero-overline {
  letter-spacing: 2px;
  opacity: 0.85;
  font-size: 11px;
}
.hero-title {
  font-size: clamp(28px, 5vw, 44px);
  font-weight: 800;
  margin: 8px 0;
}
.hero-tagline {
  opacity: 0.9;
  font-size: 16px;
  margin: 0;
}

/* ── Cards ─────────────────────────────────────────────────────────────────── */
.umroh-card {
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.10);
  transition: transform 0.25s, box-shadow 0.25s;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.umroh-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.16);
}
.umroh-flyer {
  border-radius: 0;
}
.harga-badge {
  font-size: 13px;
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 700;
}
.umroh-judul {
  font-size: 17px;
  line-height: 1.3;
}
.umroh-deskripsi {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.6;
  margin: 0;
  white-space: pre-line;
}

/* ── Card Actions ──────────────────────────────────────────────────────────── */
.umroh-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.umroh-actions__row {
  display: flex;
  gap: 10px;
  width: 100%;
}
/* Samakan lebar: tombol utama penuh, dua tombol bawah membagi lebar sama rata.
   Total (Detail + gap + Bagikan) = lebar tombol "Hubungi Kami". */
.umroh-actions .umroh-btn {
  margin: 0;
  border-radius: 10px;
}
.umroh-actions .umroh-btn--primary {
  width: 100%;
}
.umroh-actions__row .umroh-btn {
  flex: 1 1 0;
  min-width: 0;
}

/* ── Detail Dialog ─────────────────────────────────────────────────────────── */
.detail-card {
  width: 100%;
  max-width: 820px;
  border-radius: 16px;
}
.detail-body {
  max-height: 70vh;
}
.detail-flyer {
  border-radius: 12px;
  overflow: hidden;
}
.detail-deskripsi {
  white-space: pre-line;
  line-height: 1.7;
}

/* ── Empty ─────────────────────────────────────────────────────────────────── */
.empty-state {
  text-align: center;
  padding: 60px 0;
}
.empty-icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 50%;
  width: 100px;
  height: 100px;
}

/* ── CTA ───────────────────────────────────────────────────────────────────── */
.cta-section {
  background: linear-gradient(135deg, #1a6e3c 0%, #0d4a28 100%);
  padding: 60px 32px;
  text-align: center;
  margin-top: 48px;
}
.cta-inner {
  max-width: 600px;
  margin: 0 auto;
}
</style>
