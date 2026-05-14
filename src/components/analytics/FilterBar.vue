<template>
  <q-card class="q-mb-lg">
    <q-card-section>
      <div class="row items-center gap-md">
        <div>
          <div class="text-weight-bold q-mb-sm">Quick Filters</div>
          <div class="row gap-sm">
            <q-btn
              v-for="filter in filters"
              :key="filter.value"
              :outline="modelValue !== filter.value"
              :unelevated="modelValue === filter.value"
              color="primary"
              size="sm"
              @click="selectFilter(filter.value)"
            >
              {{ filter.label }}
            </q-btn>
          </div>
        </div>

        <q-separator vertical />

        <div class="q-ml-lg">
          <div class="text-weight-bold q-mb-sm">Custom Range</div>
          <div class="row gap-sm">
            <q-input
              type="date"
              outlined
              dense
              :model-value="formatDateInput(customRange?.from)"
              @update:model-value="(val) => updateCustomRange(val, true)"
              label="From"
              class="col"
            />
            <q-input
              type="date"
              outlined
              dense
              :model-value="formatDateInput(customRange?.to)"
              @update:model-value="(val) => updateCustomRange(val, false)"
              label="To"
              class="col"
            />
            <q-btn
              v-if="customRange"
              flat
              dense
              icon="close"
              size="sm"
              @click="clearCustomRange"
              class="q-mt-sm"
            />
          </div>
        </div>

        <q-space />

        <q-btn
          color="primary"
          label="Refresh"
          icon="refresh"
          @click="refresh"
          :loading="isRefreshing"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    default: 'last30days',
  },
  customRange: {
    type: Object,
    default: null,
  },
  isRefreshing: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'update:customRange', 'refresh'])

const filters = [
  { label: 'Today', value: 'today' },
  { label: 'Last 7 days', value: 'last7days' },
  { label: 'Last 30 days', value: 'last30days' },
  { label: 'This month', value: 'thisMonth' },
  { label: 'This year', value: 'thisYear' },
]

const selectFilter = (filter) => {
  emit('update:modelValue', filter)
}

const formatDateInput = (date) => {
  if (!date) return ''
  return new Date(date).toISOString().split('T')[0]
}

const updateCustomRange = (value, isStart) => {
  if (!value) {
    clearCustomRange()
    return
  }

  const newDate = new Date(value)
  const newRange = {
    from: isStart ? newDate : props.customRange?.from || new Date(),
    to: !isStart ? newDate : props.customRange?.to || new Date(),
  }

  // Ensure from is before to
  if (newRange.from > newRange.to) {
    [newRange.from, newRange.to] = [newRange.to, newRange.from]
  }

  emit('update:customRange', newRange)
}

const clearCustomRange = () => {
  emit('update:customRange', null)
}

const refresh = () => {
  emit('refresh')
}
</script>

<style scoped lang="scss">
.q-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.gap-md {
  gap: 24px;
}

.gap-sm {
  gap: 8px;
}
</style>
