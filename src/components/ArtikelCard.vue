<template>
  <router-link :to="`/artikel/${artikel.slug}`" class="no-underline artikel-link">
    <q-card class="artikel-card rounded-xl column" flat bordered>
      <div class="artikel-thumb-wrap">
        <q-img
          v-if="artikel.thumbnail"
          :src="artikel.thumbnail"
          height="500px"
          fit="cover"
          class="artikel-thumb"
        />
        <div v-else class="artikel-thumb-placeholder flex items-center justify-center">
          <q-icon name="article" size="48px" color="white" />
        </div>
        <q-badge v-if="artikel.isHighlight" color="orange" class="artikel-badge">
          <q-icon name="bolt" size="xs" class="q-mr-xs" /> Headline
        </q-badge>
        <q-chip v-if="artikel.kategori" dense color="primary" text-color="white"
                class="artikel-kategori" :label="artikel.kategori" />
      </div>

      <q-card-section class="col">
        <div class="text-caption text-grey-6 q-mb-xs row items-center q-gutter-xs">
          <q-icon name="event" size="xs" />
          <span>{{ formatDate(artikel.tanggalPublish || artikel.createdAt) }}</span>
        </div>
        <div class="text-subtitle1 text-weight-bold ellipsis-2-lines q-mb-sm artikel-title">
          {{ artikel.judul }}
        </div>
        <div v-if="artikel.ringkasan" class="text-body2 text-grey-7 ellipsis-2-lines">
          {{ artikel.ringkasan }}
        </div>
      </q-card-section>

      <q-card-actions class="q-px-md q-pb-md">
        <q-btn flat no-caps color="primary" size="sm" label="Baca Selengkapnya" icon-right="arrow_forward" />
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
.artikel-link {
  display: block;
  text-decoration: none;
  height: 100%;
}
.artikel-card {
  transition: all 0.25s ease;
  cursor: pointer;
  overflow: hidden;
  height: 100%;
}
.artikel-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(0,0,0,0.10) !important;
}
.artikel-card:hover .artikel-title { color: #1B7A4A; }
.artikel-thumb-wrap {
  position: relative;
  height: 200px;
  overflow: hidden;
  flex-shrink: 0;
}
.artikel-thumb {
  width: 100%;
  height: 100%;
  display: block;
}
.artikel-thumb-placeholder {
  height: 200px;
  background: linear-gradient(135deg, #26A65B, #1B7A4A);
}
.artikel-badge {
  position: absolute; top: 10px; left: 10px;
  padding: 4px 8px;
  font-weight: 600;
}
.artikel-kategori {
  position: absolute; bottom: 10px; left: 10px;
}
.ellipsis-2-lines {
  display: -webkit-box; -webkit-line-clamp: 2;
  -webkit-box-orient: vertical; overflow: hidden;
}
.ellipsis-3-lines {
  display: -webkit-box; -webkit-line-clamp: 3;
  -webkit-box-orient: vertical; overflow: hidden;
}
</style>
