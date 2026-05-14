<template>
  <q-card class="analytics-chart">
    <q-card-section>
      <h6 class="q-my-0">Visitor Activity Heatmap</h6>
      <div v-if="loading" class="row justify-center q-py-lg">
        <q-spinner color="primary" size="40px" />
      </div>
      <div v-else id="chart-heatmap" style="width: 100%; height: 400px"></div>
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

  const hours = Array.from({ length: 24 }, (_, i) => i)
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  // Transform data for heatmap
  const series = hours.map((hour) => ({
    name: `${hour}:00`,
    data: days.map((_, dayIdx) => {
      const row = props.data[hour]
      return row ? row[dayIdx] || 0 : 0
    }),
  }))

  const options = {
    chart: {
      type: 'heatmap',
      height: 400,
      animations: {
        enabled: true,
        speed: 800,
      },
    },
    plotOptions: {
      heatmap: {
        distributed: false,
        enableShades: true,
        shadeIntensity: 0.5,
        radius: 0,
        useFillColorAsStroke: true,
        colorScale: {
          ranges: [
            {
              from: 0,
              to: 0,
              name: 'No Visitors',
              color: '#F3F3F3',
            },
            {
              from: 1,
              to: 10,
              name: 'Low',
              color: '#DEF4FF',
            },
            {
              from: 11,
              to: 30,
              name: 'Medium',
              color: '#8DD9FF',
            },
            {
              from: 31,
              to: 100,
              name: 'High',
              color: '#1976D2',
            },
            {
              from: 101,
              to: Infinity,
              name: 'Very High',
              color: '#0D47A1',
            },
          ],
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: days,
      title: {
        text: 'Day of Week',
      },
    },
    yaxis: {
      title: {
        text: 'Hour',
      },
    },
    grid: {
      show: true,
      borderColor: 'rgba(0,0,0,0.05)',
    },
    series,
    tooltip: {
      theme: 'light',
      y: {
        title: {
          formatter: () => 'Visitors:',
        },
      },
    },
  }

  if (!chart) {
    chart = new ApexCharts(document.querySelector('#chart-heatmap'), options)
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
