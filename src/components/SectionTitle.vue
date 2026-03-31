<template>
  <div class="q-mb-lg">
    <div class="row items-center q-mb-xs">
      <q-icon v-if="icon" :name="icon" color="primary" size="28px" class="q-mr-sm" />
      <h2 class="text-h5 text-weight-bold q-ma-none">{{ title }}</h2>
    </div>
    <div class="section-divider" />
    <p v-if="subtitle" class="text-grey-6 q-mt-sm q-mb-none">{{ subtitle }}</p>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  icon: { type: String, default: '' },
});
</script>

<style scoped>
.section-divider {
  width: 48px;
  height: 4px;
  background: linear-gradient(90deg, #1B7A4A, #D4AF37);
  border-radius: 2px;
  margin-top: 6px;
}
</style>
