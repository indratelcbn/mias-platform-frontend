<template>
  <q-page>
    <!-- ─── Hero Section ──────────────────────────────────────────────── -->
    <HeroSection />

    <!-- ─── Jadwal Sholat ─────────────────────────────────────────────── -->
    <section class="q-py-xl bg-grey-1">
      <div class="q-px-md" style="max-width: 1200px; margin: 0 auto">
        <SectionTitle
          title="Jadwal Sholat"
          subtitle="Jadwal sholat hari ini untuk wilayah Depok, Jawa Barat"
          icon="schedule"
        />
        <JadwalSholat />
      </div>
    </section>

    <!-- ─── Kajian Terdekat ────────────────────────────────────────────── -->
    <section class="q-py-xl">
      <div class="q-px-md" style="max-width: 1200px; margin: 0 auto">
        <div class="row items-center justify-between q-mb-lg">
          <SectionTitle
            title="Kajian Terdekat"
            subtitle="Jadwal kajian yang akan datang"
            icon="menu_book"
          />
          <q-btn flat no-caps label="Lihat Semua →" to="/kajian" color="primary" />
        </div>

        <div v-if="kajianStore.loading" class="row q-col-gutter-md">
          <div v-for="i in 3" :key="i" class="col-12 col-md-4">
            <q-skeleton type="rect" height="200px" class="rounded-xl" />
          </div>
        </div>

        <div v-else class="row q-col-gutter-md">
          <div
            v-for="kajian in kajianStore.kajianTerdekat"
            :key="kajian.id"
            class="col-12 col-sm-6 col-md-4"
          >
            <KajianCard :kajian="kajian" />
          </div>
          <div v-if="!kajianStore.kajianTerdekat.length" class="col-12 text-center text-grey q-py-xl">
            Belum ada kajian terjadwal
          </div>
        </div>
      </div>
    </section>

    <!-- ─── Artikel Terbaru ───────────────────────────────────────────── -->
    <section class="q-py-xl bg-grey-1">
      <div class="q-px-md" style="max-width: 1200px; margin: 0 auto">
        <div class="row items-center justify-between q-mb-lg">
          <SectionTitle
            title="Artikel Terbaru"
            subtitle="Tulisan & informasi dari masjid"
            icon="article"
          />
          <q-btn flat no-caps label="Lihat Semua →" to="/artikel" color="primary" />
        </div>

        <div v-if="artikelStore.loading" class="row q-col-gutter-md">
          <div v-for="i in 3" :key="i" class="col-12 col-md-4">
            <q-skeleton type="rect" height="240px" class="rounded-xl" />
          </div>
        </div>

        <div v-else class="row q-col-gutter-md">
          <div
            v-for="artikel in artikelStore.artikelTerbaru"
            :key="artikel.id"
            class="col-12 col-sm-6 col-md-4"
          >
            <ArtikelCard :artikel="artikel" />
          </div>
        </div>
      </div>
    </section>

    <!-- ─── Infaq CTA ──────────────────────────────────────────────────── -->
    <DonasiSection />
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue';
import { useKajianStore } from 'src/stores/kajian';
import { useArtikelStore } from 'src/stores/artikel';

import HeroSection from 'src/components/HeroSection.vue';
import JadwalSholat from 'src/components/JadwalSholat.vue';
import KajianCard from 'src/components/KajianCard.vue';
import ArtikelCard from 'src/components/ArtikelCard.vue';
import DonasiSection from 'src/components/DonasiSection.vue';
import SectionTitle from 'src/components/SectionTitle.vue';

const kajianStore = useKajianStore();
const artikelStore = useArtikelStore();

onMounted(() => {
  kajianStore.fetchAll({ page: 1, limit: 3 });
  artikelStore.fetchAll({ page: 1, limit: 3 });
});
</script>
