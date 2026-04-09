<template>
  <q-dialog
    v-model="visible"
    maximized
    transition-show="fade"
    transition-hide="fade"
    @keyup.esc="close"
  >
    <div class="lb-backdrop full-height column no-wrap" @click.self="close">
      <!-- Toolbar -->
      <div class="lb-toolbar row items-center q-px-md">
        <span v-if="caption" class="lb-caption text-white">{{ caption }}</span>
        <q-space />
        <q-btn flat dense round icon="close" color="white" size="md" @click="close" />
      </div>

      <!-- Image Area -->
      <div class="col flex flex-center lb-img-area" @click.self="close">
        <img
          :src="src"
          class="lb-img"
          alt=""
          @click.stop
        />
      </div>
    </div>
  </q-dialog>
</template>

<script setup>
import { useLightbox } from 'src/composables/useLightbox';

const { visible, src, caption, close } = useLightbox();
</script>

<style scoped>
.lb-backdrop {
  background: rgba(0, 0, 0, 0.95);
  cursor: zoom-out;
}
.lb-toolbar {
  min-height: 52px;
  background: rgba(0, 0, 0, 0.6);
  flex-shrink: 0;
}
.lb-caption {
  font-size: 14px;
  opacity: 0.88;
  max-width: 80%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.lb-img-area {
  overflow: hidden;
  padding: 16px;
}
.lb-img {
  max-width: 95vw;
  max-height: calc(100vh - 84px);
  object-fit: contain;
  cursor: default;
  border-radius: 4px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.6);
  display: block;
}
</style>
