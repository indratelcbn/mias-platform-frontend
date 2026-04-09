<template>
  <router-link :to="`/kajian/${kajian.id}`" class="no-underline">
    <q-card class="kajian-card rounded-xl" flat bordered>
      <!-- Thumbnail -->
      <div class="kajian-thumb relative-position">
        <q-img
          v-if="kajian.thumbnail"
          :src="kajian.thumbnail"
          height="480px"
          fit="cover"
          class="rounded-top"
        />
        <div v-else class="kajian-thumb-placeholder flex items-center justify-center">
          <q-icon name="menu_book" size="48px" color="white" />
        </div>
        <q-badge
          color="primary"
          class="absolute-top-right q-ma-sm"
          :label="formatRelativeDate(kajian.tanggal)"
        />
      </div>

      <q-card-section>
        <div class="text-subtitle1 text-weight-bold ellipsis-2-lines q-mb-sm">
          {{ kajian.judul }}
        </div>

        <div class="row items-center q-gutter-xs q-mb-xs">
          <q-icon name="person" size="16px" color="primary" />
          <span class="text-caption text-grey-7">{{ kajian.ustadz }}</span>
        </div>
        <div class="row items-center q-gutter-xs q-mb-xs">
          <q-icon name="event" size="16px" color="primary" />
          <span class="text-caption text-grey-7">{{ formatDate(kajian.tanggal) }}</span>
        </div>
        <div class="row items-center q-gutter-xs">
          <q-icon name="schedule" size="16px" color="primary" />
          <span class="text-caption text-grey-7">{{ kajian.waktu }}</span>
        </div>
      </q-card-section>

      <q-card-actions>
        <q-btn flat no-caps label="Selengkapnya →" color="primary" size="sm" />
      </q-card-actions>
    </q-card>
  </router-link>
</template>

<script setup>
defineProps({ kajian: { type: Object, required: true } });

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString('id-ID', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });

const formatRelativeDate = (dateString) => {
  const diff = Math.ceil((new Date(dateString) - Date.now()) / 86400000);
  if (diff < 0) return 'Selesai';
  if (diff === 0) return 'Hari ini';
  if (diff === 1) return 'Besok';
  return `${diff} hari lagi`;
};
</script>

<style scoped>
.kajian-card {
  transition: all 0.25s ease;
  cursor: pointer;
}
.kajian-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(27, 122, 74, 0.15) !important;
}
.kajian-thumb-placeholder {
  height: 180px;
  background: linear-gradient(135deg, #1B7A4A, #26A65B);
  border-radius: 12px 12px 0 0;
}
.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
