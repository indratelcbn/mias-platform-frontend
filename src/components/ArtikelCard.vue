<template>
  <router-link :to="`/artikel/${artikel.slug}`" class="no-underline">
    <q-card class="artikel-card rounded-xl" flat bordered>
      <q-img
        v-if="artikel.thumbnail"
        :src="artikel.thumbnail"
        height="200px"
        fit="cover"
        class="rounded-top"
      />
      <div v-else class="artikel-thumb-placeholder flex items-center justify-center">
        <q-icon name="article" size="48px" color="white" />
      </div>

      <q-card-section>
        <div class="text-caption text-grey-5 q-mb-xs">
          {{ formatDate(artikel.createdAt) }}
        </div>
        <div class="text-subtitle1 text-weight-bold ellipsis-2-lines q-mb-sm">
          {{ artikel.judul }}
        </div>
        <div v-if="artikel.ringkasan" class="text-caption text-grey-6 ellipsis-3-lines">
          {{ artikel.ringkasan }}
        </div>
      </q-card-section>

      <q-card-actions>
        <q-btn flat no-caps label="Baca Selengkapnya →" color="primary" size="sm" />
      </q-card-actions>
    </q-card>
  </router-link>
</template>

<script setup>
defineProps({ artikel: { type: Object, required: true } });

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
</script>

<style scoped>
.artikel-card {
  transition: all 0.25s ease;
  cursor: pointer;
}
.artikel-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important;
}
.artikel-thumb-placeholder {
  height: 200px;
  background: linear-gradient(135deg, #26A65B, #1B7A4A);
  border-radius: 12px 12px 0 0;
}
.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.ellipsis-3-lines {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
