<template>
  <q-card class="analytics-chart">
    <q-card-section>
      <h6 class="q-my-0">{{ title }}</h6>
      <div v-if="loading" class="row justify-center q-py-lg">
        <q-spinner color="primary" size="40px" />
      </div>
      <div v-else :id="chartId" style="width: 100%; height: 350px"></div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { watch, onMounted, nextTick, computed } from 'vue'
import ApexCharts from 'apexcharts'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  data: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  dataKey: {
    type: String,
    required: true, // 'browser', 'operatingSystem'
  },
})

let chart = null

const chartId = computed(() => `chart-${props.dataKey}`)

const initChart = async () => {
  await nextTick()

  const options = {
    chart: {
      type: 'pie',
      height: 350,
      animations: {
        enabled: true,
        speed: 800,
      },
    },
    colors: ['#1976D2', '#04A0AD', '#E57373', '#81C784', '#FFB74D', '#BA68C8'],
    labels: props.data.map((d) => d[props.dataKey]),
    series: props.data.map((d) => d.count),
    dataLabels: {
      enabled: true,
      formatter: (val) => {
        return `${parseFloat(val).toFixed(1)}%`
      },
    },
    legend: {
      position: 'bottom',
      fontSize: '12px',
    },
    tooltip: {
      theme: 'light',
      y: {
        formatter: (val) => {
          const idx = props.data.findIndex((d) => d.count === val)
          const percentage = idx >= 0 ? props.data[idx]?.percentage : 0
          return `${val} (${percentage}%)`
        },
      },
    },
  }

  if (!chart) {
    chart = new ApexCharts(document.querySelector(`#${chartId.value}`), options)
    await chart.render()
  } else {
    await chart.updateOptions(options, false, true)
  }
}

onMounted(() => {
  if (props.data.length > 0) {
    initChart()
  }
})

watch(
  () => props.data,
  () => {
    if (props.data.length > 0) {
      initChart()
    }
  },
  { deep: true }
)

watch(
  () => props.loading,
  (val) => {
    if (!val && props.data.length > 0) {
      initChart()
    }
  }
)
</script>

<style scoped lang="scss">
.analytics-chart {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
</style>
