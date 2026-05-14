<template>
  <q-card class="analytics-chart">
    <q-card-section>
      <h6 class="q-my-0">Device Statistics</h6>
      <div v-if="loading" class="row justify-center q-py-lg">
        <q-spinner color="primary" size="40px" />
      </div>
      <div v-else id="chart-devices" style="width: 100%; height: 350px"></div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { watch, onMounted, nextTick } from 'vue'
import ApexCharts from 'apexcharts'

const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

let chart = null

const initChart = async () => {
  await nextTick()

  const options = {
    chart: {
      type: 'donut',
      height: 350,
      animations: {
        enabled: true,
        speed: 800,
      },
    },
    colors: ['#1976D2', '#04A0AD', '#E57373', '#81C784'],
    labels: props.data.map((d) => d.deviceType),
    series: props.data.map((d) => d.count),
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '14px',
            },
            value: {
              show: true,
              fontSize: '12px',
              formatter: (val) => {
                return val
              },
            },
            total: {
              show: true,
              label: 'Total Devices',
              fontSize: '12px',
              formatter: () => {
                const total = props.data.reduce((sum, d) => sum + d.count, 0)
                return total.toString()
              },
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => {
        return `${parseFloat(val).toFixed(1)}%`
      },
    },
    legend: {
      position: 'bottom',
    },
    tooltip: {
      theme: 'light',
      y: {
        formatter: (val) => {
          const percentage = props.data[props.data.findIndex((d) => d.count === val)]?.percentage || 0
          return `${val} (${percentage}%)`
        },
      },
    },
  }

  if (!chart) {
    chart = new ApexCharts(document.querySelector('#chart-devices'), options)
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
