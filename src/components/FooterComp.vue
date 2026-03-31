<template>
  <footer class="masjid-footer">
    <div class="footer-main q-py-xl q-px-md">
      <div class="row q-col-gutter-xl" style="max-width: 1200px; margin: 0 auto">
        <!-- Tentang -->
        <div class="col-12 col-sm-6 col-md-4">
          <div class="row items-center q-mb-md">
            <q-icon name="mosque" color="primary" size="32px" class="q-mr-sm" />
            <div>
              <div class="text-weight-bold" style="font-size: 14px; line-height: 1.2">
                Masjid Imam Asy Syafi'i
              </div>
              <div class="text-grey-5 text-caption">Depok, Jawa Barat</div>
            </div>
          </div>
          <p class="text-grey-5" style="font-size: 13px; line-height: 1.8">
            Pusat ibadah dan dakwah Islam yang berupaya memakmurkan umat dengan program-program berkualitas.
          </p>
          <div class="row q-gutter-sm q-mt-md">
            <q-btn round flat icon="fab fa-facebook" color="grey-5" size="sm" />
            <q-btn round flat icon="fab fa-instagram" color="grey-5" size="sm" />
            <q-btn round flat icon="fab fa-youtube" color="grey-5" size="sm" />
            <q-btn round flat icon="fab fa-whatsapp" color="grey-5" size="sm" />
          </div>
        </div>

        <!-- Navigasi -->
        <div class="col-6 col-md-2">
          <div class="text-weight-bold text-white q-mb-md">Navigasi</div>
          <div class="column q-gutter-sm">
            <router-link v-for="link in navLinks" :key="link.to" :to="link.to" class="footer-link">
              {{ link.label }}
            </router-link>
          </div>
        </div>

        <!-- Kegiatan -->
        <div class="col-6 col-md-2">
          <div class="text-weight-bold text-white q-mb-md">Kegiatan</div>
          <div class="column q-gutter-sm">
            <span v-for="k in kegiatan" :key="k" class="text-grey-5" style="font-size: 13px">{{ k }}</span>
          </div>
        </div>

        <!-- Kontak -->
        <div class="col-12 col-md-4">
          <div class="text-weight-bold text-white q-mb-md">Kontak</div>
          <div class="column q-gutter-sm">
            <div class="row q-gutter-sm items-start" v-for="c in contactItems" :key="c.label">
              <q-icon :name="c.icon" color="primary" size="18px" class="q-mt-xs" />
              <span class="text-grey-5" style="font-size: 13px; line-height: 1.6">{{ c.value }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Bottom -->
    <div class="footer-bottom text-center q-py-md text-grey-6 text-caption">
      <q-separator color="grey-9" class="q-mb-md" />
      © {{ currentYear }} Masjid Imam Asy Syafi'i Depok. All rights reserved.
      <span class="q-mx-sm">·</span>
      <router-link to="/admin" class="text-grey-6">Admin</router-link>
    </div>
  </footer>
</template>

<script setup>
const currentYear = new Date().getFullYear();

const navLinks = [
  { label: 'Beranda', to: '/' },
  { label: 'Kajian', to: '/kajian' },
  { label: 'Artikel', to: '/artikel' },
  { label: 'Donasi', to: '/donasi' },
  { label: 'Kontak', to: '/kontak' },
];

const kegiatan = ['Kajian Ahad Pagi', 'Tahfizh Al-Quran', 'TPA Anak', 'Kajian Remaja', 'Pengajian Ibu-ibu'];

const contactItems = [
  { icon: 'place', value: 'Jl. Contoh No. 1, Depok, Jawa Barat 16400' },
  { icon: 'phone', value: '+62 812-3456-7890' },
  { icon: 'email', value: 'info@masjidasyafii-depok.id' },
];
</script>

<style scoped>
.masjid-footer {
  background: #0d1117;
}
.footer-main {
  background: #0d1117;
}
.footer-link {
  color: #aaa;
  text-decoration: none;
  font-size: 13px;
  transition: color 0.2s;
}
.footer-link:hover {
  color: #1B7A4A;
}
</style>
