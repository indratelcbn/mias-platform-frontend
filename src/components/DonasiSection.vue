<template>
  <section class="donasi-section text-white q-py-xl text-center">
    <div class="q-px-md" style="max-width: 700px; margin: 0 auto">
      <q-icon name="volunteer_activism" size="56px" class="q-mb-md" style="opacity: 0.9" />
      <h2 class="text-h4 text-weight-bold q-mb-md">Dukung Pembangunan Masjid</h2>
      <p class="text-body1 q-mb-xl opacity-85" style="line-height: 1.8">
        "Barang siapa membangun masjid karena Allah, maka Allah akan membangunkan untuknya yang semisalnya di Surga."
        <br />
        <em style="opacity: 0.8">– HR. Bukhari & Muslim</em>
      </p>

      <div class="row q-gutter-md justify-center q-mb-xl">
        <q-btn
          unelevated
          size="lg"
          no-caps
          label="Donasi Sekarang"
          to="/donasi"
          color="white"
          text-color="primary"
          class="q-px-xl"
          style="border-radius: 10px; font-weight: 700"
          icon="volunteer_activism"
        />
        <q-btn
          outline
          size="lg"
          no-caps
          label="Lihat Progress"
          color="white"
          to="/donasi"
          class="q-px-xl"
          style="border-radius: 10px"
        />
      </div>

      <!-- Progress Bar -->
      <q-card flat class="rounded-xl bg-white text-dark q-pa-lg">
        <div class="row items-center justify-between q-mb-sm">
          <span class="text-subtitle2 text-weight-bold text-primary">Target Pembangunan Lantai 2</span>
          <span class="text-caption text-grey-6">60%</span>
        </div>
        <q-linear-progress
          rounded
          size="12px"
          :value="0.6"
          color="primary"
          track-color="grey-3"
        />
        <div class="row justify-between q-mt-sm">
          <span class="text-caption text-grey-6">Terkumpul: Rp 180.000.000</span>
          <span class="text-caption text-grey-6">Target: Rp 300.000.000</span>
        </div>
      </q-card>
    </div>
  </section>
</template>

<style scoped>
.donasi-section {
  background: linear-gradient(135deg, #1B7A4A 0%, #D4AF37 100%);
  padding: 80px 0;
}
</style>
