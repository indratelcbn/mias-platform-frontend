<template>
  <q-card class="analytics-chart">
    <q-card-section>
      <h6 class="q-my-0">{{ title }}</h6>
      <div v-if="loading" class="row justify-center q-py-lg">
        <q-spinner color="primary" size="40px" />
      </div>
      <div v-else id="chart-trends" style="width: 100%; height: 400px"></div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { watch, onMounted, nextTick } from 'vue'
import ApexCharts from 'apexcharts'

const props = defineProps({
  title: {
    type: String,
    default: 'Visitor Trends',
  },
  data: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    enum: ['line', 'area', 'bar'],
    default: 'line',
  },
})

let chart = null

const initChart = async () => {
  await nextTick()

  const options = {
    chart: {
      type: props.type,
      height: 400,
      sparkline: {
        enabled: false,
      },
      animations: {
        enabled: true,
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150,
        },
        dynamicAnimation: {
          enabled: true,
          speed: 150,
        },
      },
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [20, 100, 100, 100],
      },
    },
    grid: {
      show: true,
      borderColor: 'rgba(0,0,0,0.05)',
    },
    colors: ['#1976D2', '#04A0AD'],
    series: [
      {
        name: 'Total Visitors',
        data: props.data.map((d) => d.totalVisitors || 0),
      },
      {
        name: 'Unique Visitors',
        data: props.data.map((d) => d.uniqueVisitors || 0),
      },
    ],
    xaxis: {
      categories: props.data.map((d) => new Date(d.date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })),
      type: 'datetime',
    },
    yaxis: {
      title: {
        text: 'Visitors',
      },
    },
    legend: {
      position: 'top',
    },
    tooltip: {
      theme: 'light',
      x: {
        format: 'dd MMM yyyy',
      },
    },
  }

  if (!chart) {
    chart = new ApexCharts(document.querySelector('#chart-trends'), options)
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
