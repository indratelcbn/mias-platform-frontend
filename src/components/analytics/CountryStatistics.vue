<template>
  <q-card class="analytics-chart">
    <q-card-section>
      <h6 class="q-my-0">Country Statistics</h6>
      <div v-if="loading" class="row justify-center q-py-lg">
        <q-spinner color="primary" size="40px" />
      </div>
      <div v-else-if="!data.length" class="text-center text-grey-5 q-py-lg">
        No country data available
      </div>
      <template v-else>
        <!-- Top bar chart for top 10 -->
        <div :id="chartId" style="width: 100%; height: 340px" class="q-mb-md"></div>

        <!-- Table for all countries -->
        <q-table
          :rows="data"
          :columns="columns"
          row-key="country"
          flat
          dense
          :rows-per-page-options="[10, 20, 0]"
          :pagination="{ rowsPerPage: 10 }"
        >
          <template #body-cell-country="props">
            <q-td :props="props">
              <div class="row items-center q-gutter-xs">
                <span :class="`fi fi-${props.row.country.toLowerCase()}`" style="font-size: 18px" />
                <span>{{ countryName(props.row.country) }}</span>
                <q-badge outline color="grey-6" :label="props.row.country" />
              </div>
            </q-td>
          </template>
          <template #body-cell-percentage="props">
            <q-td :props="props">
              <div class="row items-center q-gutter-sm">
                <q-linear-progress
                  rounded
                  size="8px"
                  :value="props.row.percentage / 100"
                  color="primary"
                  track-color="grey-3"
                  style="width: 80px"
                />
                <span class="text-caption text-grey-7">{{ props.row.percentage }}%</span>
              </div>
            </q-td>
          </template>
        </q-table>
      </template>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { watch, onMounted, nextTick, computed } from 'vue'
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
const chartId = 'chart-countries'

const top10 = computed(() => props.data.slice(0, 10))

const columns = [
  { name: 'country', label: 'Negara', field: 'country', align: 'left', sortable: true },
  { name: 'count', label: 'Pengunjung', field: 'count', align: 'right', sortable: true },
  { name: 'percentage', label: 'Persentase', field: 'percentage', align: 'left', sortable: true },
]

/**
 * Convert ISO 3166-1 alpha-2 country code to display name using Intl API
 */
const countryName = (code) => {
  if (!code || code === 'Unknown') return 'Unknown'
  try {
    const displayNames = new Intl.DisplayNames(['id'], { type: 'region' })
    return displayNames.of(code) || code
  } catch {
    return code
  }
}

const initChart = async () => {
  await nextTick()
  if (!top10.value.length) return

  const options = {
    chart: {
      type: 'bar',
      height: 340,
      toolbar: { show: false },
      animations: { enabled: true, speed: 800 },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        dataLabels: { position: 'top' },
      },
    },
    colors: ['#1976D2'],
    dataLabels: {
      enabled: true,
      formatter: (val) => val,
      offsetX: 4,
      style: { fontSize: '11px', colors: ['#555'] },
    },
    xaxis: {
      categories: top10.value.map((d) => countryName(d.country)),
      labels: { style: { fontSize: '12px' } },
    },
    yaxis: {
      labels: { style: { fontSize: '12px' } },
    },
    series: [
      {
        name: 'Pengunjung',
        data: top10.value.map((d) => d.count),
      },
    ],
    tooltip: {
      theme: 'light',
      y: {
        formatter: (val, { dataPointIndex }) => {
          const item = top10.value[dataPointIndex]
          return `${val} (${item?.percentage ?? 0}%)`
        },
      },
    },
    grid: { borderColor: '#f1f1f1' },
  }

  const el = document.querySelector(`#${chartId}`)
  if (!el) return

  if (!chart) {
    chart = new ApexCharts(el, options)
    await chart.render()
  } else {
    chart.updateOptions(options)
  }
}

onMounted(() => {
  if (!props.loading) initChart()
})

watch(
  () => [props.data, props.loading],
  ([, isLoading]) => {
    if (!isLoading) initChart()
  },
)
</script>
