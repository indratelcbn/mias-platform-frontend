<template>
  <q-page class="mart-page">

    <!-- ─── Hero ──────────────────────────────────────────────────────────── -->
    <section class="mart-hero">
      <div class="hero-overlay">
        <div class="hero-content">
          <q-icon name="storefront" size="52px" color="white" class="q-mb-md" />
          <div class="text-overline q-mb-xs hero-overline">USAHA MASJID IMAM ASY SYAFI'I</div>
          <h1 class="hero-title">Mias Mart</h1>
          <p class="hero-tagline">Produk-produk terbaik dari masjid untuk mendukung dakwah dan kemandirian</p>
        </div>
      </div>
    </section>

    <!-- ─── Body ──────────────────────────────────────────────────────────── -->
    <div class="mart-body q-px-lg q-px-md-xl q-pb-xl" style="max-width: 1200px; margin: 0 auto">

      <!-- Search bar -->
      <div class="row justify-between items-center q-mt-xl q-mb-lg">
        <div class="text-h6 text-weight-bold">
          <span v-if="!search">Semua Produk</span>
          <span v-else>Hasil pencarian: "{{ search }}"</span>
          <q-badge v-if="filteredList.length" color="primary" :label="filteredList.length" class="q-ml-sm" />
        </div>
        <q-input
          v-model="search"
          dense
          outlined
          placeholder="Cari produk..."
          clearable
          style="min-width: 240px"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>

      <!-- Loading Skeleton -->
      <div v-if="store.loading" class="row q-col-gutter-lg">
        <div v-for="n in 8" :key="n" class="col-6 col-sm-4 col-md-3">
          <q-skeleton height="300px" style="border-radius: 16px" />
        </div>
      </div>

      <!-- Product Grid -->
      <div v-else-if="filteredList.length" class="row q-col-gutter-lg">
        <div
          v-for="produk in filteredList"
          :key="produk.id"
          class="col-6 col-sm-4 col-md-3"
        >
          <q-card class="produk-card" flat>
            <!-- Foto -->
            <q-img
              :src="produk.foto"
              :ratio="1"
              fit="cover"
              class="produk-foto cursor-pointer"
              @click="open(produk.foto, produk.nama)"
            >
              <template #loading>
                <div class="absolute-full flex flex-center bg-grey-2">
                  <q-spinner color="primary" />
                </div>
              </template>
              <template #error>
                <div class="absolute-full flex flex-center bg-grey-2 text-grey-5">
                  <q-icon name="broken_image" size="36px" />
                </div>
              </template>
              <!-- Stok badge -->
              <div v-if="produk.stok" class="absolute-top-right q-ma-sm">
                <q-badge color="green-8" :label="produk.stok" style="font-size: 11px; padding: 3px 8px; border-radius: 8px" />
              </div>
            </q-img>

            <!-- Info -->
            <q-card-section class="q-pt-sm q-pb-xs q-px-md">
              <div class="produk-nama text-weight-bold">{{ produk.nama }}</div>
              <div class="produk-harga text-primary text-weight-bold q-mt-xs">
                {{ formatRupiah(produk.harga) }}
              </div>
              <p v-if="produk.deskripsi" class="text-caption text-grey-6 produk-deskripsi q-mt-xs">
                {{ produk.deskripsi }}
              </p>
            </q-card-section>

            <q-card-actions class="q-px-md q-pb-md q-pt-xs">
              <q-btn
                v-if="produk.linkBeli"
                unelevated
                no-caps
                color="primary"
                icon="shopping_cart"
                label="Beli Sekarang"
                class="full-width"
                style="border-radius: 10px; font-size: 12px"
                :href="produk.linkBeli"
                target="_blank"
              />
              <q-btn
                v-else
                flat
                no-caps
                color="primary"
                icon="phone"
                label="Hubungi Kami"
                class="full-width"
                style="border-radius: 10px; font-size: 12px"
                @click="$router.push('/kontak')"
              />
            </q-card-actions>
          </q-card>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state q-mt-xl">
        <div class="empty-icon-wrap">
          <q-icon name="storefront" color="grey-5" size="64px" />
        </div>
        <div class="text-h6 text-grey-6 q-mt-lg">
          {{ search ? 'Produk tidak ditemukan' : 'Produk Segera Hadir' }}
        </div>
        <div class="text-body2 text-grey-5 q-mt-sm">
          {{ search ? 'Coba kata kunci lain' : 'Produk-produk MIAS akan segera tersedia.' }}
        </div>
      </div>

    </div>

    <AppLightbox />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useMartStore } from 'src/stores/usaha';
import AppLightbox from 'components/AppLightbox.vue';
import { useLightbox } from 'src/composables/useLightbox';

const store = useMartStore();
const { open } = useLightbox();
const search = ref('');

const filteredList = computed(() => {
  if (!search.value.trim()) return store.list;
  const q = search.value.toLowerCase();
  return store.list.filter(
    (p) =>
      p.nama.toLowerCase().includes(q) ||
      (p.deskripsi || '').toLowerCase().includes(q)
  );
});

const formatRupiah = (val) => {
  const num = Number(val);
  if (!num) return 'Hubungi Kami';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
};

onMounted(() => store.fetchPublic());
</script>

<style scoped>
/* ── Hero ──────────────────────────────────────────────────────────────────── */
.mart-hero {
  position: relative;
  min-height: 280px;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #37474F 0%, #1C313A 100%);
}
.hero-overlay {
  width: 100%;
  padding: 60px 32px;
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
.hero-tagline { opacity: 0.9; font-size: 16px; margin: 0; }

/* ── Product Cards ─────────────────────────────────────────────────────────── */
.produk-card {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 14px rgba(0,0,0,0.09);
  transition: transform 0.22s, box-shadow 0.22s;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.produk-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 28px rgba(0,0,0,0.14);
}
.produk-foto { border-radius: 0; }
.produk-nama {
  font-size: 14px;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.produk-harga { font-size: 15px; }
.produk-deskripsi {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 0;
}

/* ── Empty ─────────────────────────────────────────────────────────────────── */
.empty-state { text-align: center; padding: 60px 0; }
.empty-icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 50%;
  width: 100px;
  height: 100px;
}
</style>
