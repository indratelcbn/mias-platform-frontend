<template>
  <q-card flat bordered class="rounded-xl">
    <q-card-section>
      <div class="row items-center justify-between q-mb-md">
        <div>
          <div class="text-subtitle1 text-weight-bold">
            <q-icon name="show_chart" color="primary" class="q-mr-sm" />
            Grafik Tren Keuangan
          </div>
          <div class="text-caption text-grey-6">
            {{ chartTitle }}
          </div>
        </div>
      </div>

      <!-- Chart Container -->
      <div v-if="loading" class="row justify-center q-py-lg">
        <q-spinner color="primary" size="60px" />
      </div>
      <div v-else-if="!hasData" class="text-center text-grey-6 q-py-xl">
        <q-icon name="bar_chart" size="64px" class="q-mb-md" />
        <div class="text-subtitle2">Tidak ada data untuk periode ini</div>
      </div>
      <div v-else id="finance-trend-chart" style="width: 100%; height: 400px"></div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import ApexCharts from 'apexcharts';
import { formatCurrency } from 'src/utils/format';

const props = defineProps({
  data: {
    type: Object,
    default: () => ({ labels: [], series: [] }),
  },
  loading: {
    type: Boolean,
    default: false,
  },
  divisiName: {
    type: String,
    default: 'Semua Divisi',
  },
  period: {
    type: String,
    default: 'MONTHLY',
  },
});

const chart = ref(null);

const destroyChart = () => {
  if (chart.value) {
    try {
      chart.value.destroy();
    } catch (e) {
      // ignore
    }
    chart.value = null;
  }
};

const hasData = computed(() => {
  return props.data?.labels?.length > 0 && props.data?.series?.length > 0;
});

const chartTitle = computed(() => {
  const periodLabel = {
    MONTHLY: 'Tren Bulanan',
    SEMESTER: 'Tren Per Semester',
    YEARLY: 'Tren Per Tahun',
  };
  return `${props.divisiName} - ${periodLabel[props.period] || 'Tren'}`;
});

const initChart = async () => {
  await nextTick();

  if (!hasData.value) return;

  const options = {
    chart: {
      type: 'line',
      height: 400,
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: false,
          reset: true,
        },
      },
      animations: {
        enabled: true,
        speed: 800,
      },
    },
    colors: ['#4CAF50', '#F44336'],
    stroke: {
      width: [3, 3],
      curve: 'smooth',
    },
    markers: {
      size: 5,
      hover: {
        size: 7,
      },
    },
    dataLabels: {
      enabled: false,
    },
    series: props.data.series.map((s) => ({
      name: s.name,
      data: s.data,
    })),
    xaxis: {
      categories: props.data.labels,
      labels: {
        style: {
          fontSize: '12px',
        },
      },
    },
    yaxis: {
      labels: {
        formatter: (val) => {
          if (val >= 1000000000) return `${(val / 1000000000).toFixed(1)}M`;
          if (val >= 1000000) return `${(val / 1000000).toFixed(1)}jt`;
          if (val >= 1000) return `${(val / 1000).toFixed(0)}rb`;
          return val.toFixed(0);
        },
        style: {
          fontSize: '12px',
        },
      },
    },
    grid: {
      borderColor: '#e0e0e0',
      strokeDashArray: 4,
    },
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
      fontSize: '14px',
      markers: {
        width: 12,
        height: 12,
        radius: 12,
      },
    },
    tooltip: {
      theme: 'light',
      shared: true,
      intersect: false,
      y: {
        formatter: (val) => formatCurrency(val),
      },
    },
  };

  const chartElement = document.querySelector('#finance-trend-chart');
  if (!chartElement) return;

  // Always destroy stale instance before creating a fresh one
  destroyChart();

  chart.value = new ApexCharts(chartElement, options);
  await chart.value.render();
};

onMounted(() => {
  if (hasData.value) {
    initChart();
  }
});

onUnmounted(() => {
  destroyChart();
});

// Destroy chart the moment loading starts — the v-else div is removed from DOM
watch(
  () => props.loading,
  (isLoading) => {
    if (isLoading) {
      destroyChart();
    } else if (hasData.value) {
      initChart();
    }
  }
);

watch(
  () => props.data,
  () => {
    if (!props.loading && hasData.value) {
      initChart();
    }
  },
  { deep: true }
);

watch(
  () => props.period,
  () => {
    if (!props.loading && hasData.value) {
      initChart();
    }
  }
);
</script>

<style scoped>
.rounded-xl {
  border-radius: 16px;
}
</style>
