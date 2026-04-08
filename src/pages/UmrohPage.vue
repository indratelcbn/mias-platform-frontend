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
              class="umroh-flyer"
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
            <q-card-section class="q-pt-md">
              <div class="text-h6 text-weight-bold q-mb-sm umroh-judul">{{ program.judul }}</div>
              <p v-if="program.deskripsi" class="text-body2 text-grey-7 umroh-deskripsi">
                {{ program.deskripsi }}
              </p>
            </q-card-section>

            <q-card-actions class="q-px-md q-pb-md">
              <q-btn
                unelevated
                no-caps
                color="primary"
                icon="phone"
                label="Hubungi Kami"
                class="full-width"
                style="border-radius: 10px"
                @click="openContact"
              />
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
          href="https://wa.me/6281234567890"
          target="_blank"
        />
      </div>
    </section>
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue';
import { useUmrohStore } from 'src/stores/usaha';
import { useRouter } from 'vue-router';

const store = useUmrohStore();
const router = useRouter();

const formatRupiah = (val) => {
  const num = Number(val);
  if (!num) return '';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
};

const openContact = () => router.push('/kontak');

onMounted(() => store.fetchPublic());
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
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.6;
  margin: 0;
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
