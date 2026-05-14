<template>
  <q-card class="analytics-card">
    <q-card-section>
      <div class="row items-center">
        <div class="col">
          <div class="text-overline text-grey-7">{{ title }}</div>
          <div class="text-h4 text-weight-bold q-mt-md">{{ formattedValue }}</div>
          <div v-if="subtitle" class="text-caption text-grey-6 q-mt-sm">{{ subtitle }}</div>
        </div>
        <div class="col-auto">
          <q-icon
            :name="icon"
            :color="iconColor"
            size="48px"
            class="opacity-60"
          />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    default: 0,
  },
  subtitle: {
    type: String,
    default: null,
  },
  icon: {
    type: String,
    default: 'trending_up',
  },
  iconColor: {
    type: String,
    default: 'primary',
  },
  format: {
    type: String,
    enum: ['number', 'percentage', 'time', 'custom'],
    default: 'number',
  },
})

const formattedValue = computed(() => {
  const val = props.value

  switch (props.format) {
    case 'percentage':
      return `${parseFloat(val).toFixed(1)}%`
    case 'time':
      return `${Math.floor(parseFloat(val))}s`
    case 'number':
      return parseInt(val).toLocaleString('id-ID')
    default:
      return val
  }
})
</script>

<style scoped lang="scss">
.analytics-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }
}
</style>
