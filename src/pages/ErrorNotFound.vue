<template>
  <div class="not-found-page flex flex-center">
    <div class="column items-center text-center q-pa-xl">
      <q-icon name="error_outline" size="100px" color="grey-5" />
      <h1 class="text-h4 text-weight-bold text-grey-7 q-mt-md">404</h1>
      <p class="text-h6 text-grey-6">Halaman tidak ditemukan</p>
      <p class="text-grey-5 q-mb-lg">Maaf, halaman yang Anda cari tidak tersedia.</p>
      <q-btn unelevated color="primary" label="Kembali ke Beranda" no-caps to="/" style="border-radius: 8px" />
    </div>
  </div>
</template>

<style scoped>
.not-found-page {
  min-height: 100vh;
}
</style>
