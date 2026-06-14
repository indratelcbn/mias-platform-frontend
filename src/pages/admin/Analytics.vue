<template>
  <q-page class="q-pa-lg">
    <!-- Header -->
    <div class="q-mb-lg">
      <h1 class="q-my-0">Analytics Dashboard</h1>
      <div class="text-subtitle2 text-grey-7">Monitor visitor activity and engagement</div>
    </div>

    <!-- Filter Bar -->
    <FilterBar
      v-model="analyticsStore.currentFilter"
      :custom-range="analyticsStore.customDateRange"
      :is-refreshing="analyticsStore.loading"
      @update:model-value="(val) => analyticsStore.setFilter(val)"
      @update:custom-range="(val) => analyticsStore.setCustomDateRange(val?.from, val?.to)"
      @refresh="analyticsStore.refresh"
    />

    <!-- Error Alert -->
    <q-banner v-if="analyticsStore.hasError" class="bg-red-2 text-red-9 q-mb-lg rounded-borders">
      <template #avatar>
        <q-icon name="error" />
      </template>
      {{ analyticsStore.errorMessage }}
      <template #action>
        <q-btn flat dense icon="close" @click="analyticsStore.error = null" />
      </template>
    </q-banner>

    <!-- Loading Overlay -->
    <q-linear-progress v-if="analyticsStore.loading" indeterminate color="primary" />

    <div v-if="!analyticsStore.loading">
      <!-- KPI Cards -->
      <div class="row q-col-gutter-lg q-mb-lg">
        <div class="col-12 col-md-6 col-lg-2-5">
          <AnalyticsCard
            title="Total Visitors"
            :value="analyticsStore.summary?.totalVisitors || 0"
            icon="people"
            icon-color="primary"
            format="number"
          />
        </div>
        <div class="col-12 col-md-6 col-lg-2-5">
          <AnalyticsCard
            title="Visitors Today"
            :value="analyticsStore.summary?.visitorsToday || 0"
            icon="calendar_today"
            icon-color="info"
            format="number"
          />
        </div>
        <div class="col-12 col-md-6 col-lg-2-5">
          <AnalyticsCard
            title="This Week"
            :value="analyticsStore.summary?.visitorsThisWeek || 0"
            icon="date_range"
            icon-color="warning"
            format="number"
          />
        </div>
        <div class="col-12 col-md-6 col-lg-2-5">
          <AnalyticsCard
            title="This Month"
            :value="analyticsStore.summary?.visitorsThisMonth || 0"
            icon="calendar_month"
            icon-color="positive"
            format="number"
          />
        </div>
        <div class="col-12 col-md-6 col-lg-2-5">
          <AnalyticsCard
            title="Unique Visitors"
            :value="analyticsStore.summary?.uniqueVisitors || 0"
            icon="badge"
            icon-color="secondary"
            format="number"
          />
        </div>
        <div class="col-12 col-md-6 col-lg-2-5">
          <AnalyticsCard
            title="Total Page Views"
            :value="analyticsStore.summary?.totalPageViews || 0"
            icon="visibility"
            icon-color="accent"
            format="number"
          />
        </div>
        <div class="col-12 col-md-6 col-lg-2-5">
          <AnalyticsCard
            title="Bounce Rate"
            :value="analyticsStore.summary?.bounceRate || 0"
            icon="trending_down"
            icon-color="negative"
            format="percentage"
          />
        </div>
        <div class="col-12 col-md-6 col-lg-2-5">
          <AnalyticsCard
            title="Avg Session Duration"
            :value="analyticsStore.summary?.avgSessionDuration || 0"
            icon="schedule"
            icon-color="primary"
            format="time"
            subtitle="seconds"
          />
        </div>
      </div>

      <!-- Charts Row 1 -->
      <div class="row q-col-gutter-lg q-mb-lg">
        <div class="col-12 col-lg-8">
          <VisitorTrendChart
            :data="analyticsStore.trends"
            :loading="analyticsStore.loading"
          />
        </div>
        <div class="col-12 col-lg-4">
          <TopPagesChart
            :data="analyticsStore.topPages.slice(0, 5)"
            :loading="analyticsStore.loading"
          />
        </div>
      </div>

      <!-- Charts Row 2 -->
      <div class="row q-col-gutter-lg q-mb-lg">
        <div class="col-12 col-lg-6">
          <DeviceStatistics
            :data="analyticsStore.devices"
            :loading="analyticsStore.loading"
          />
        </div>
        <div class="col-12 col-lg-6">
          <PieStatistics
            title="Browser Statistics"
            :data="analyticsStore.browsers"
            :loading="analyticsStore.loading"
            data-key="browser"
          />
        </div>
      </div>

      <!-- Charts Row 3 -->
      <div class="row q-col-gutter-lg q-mb-lg">
        <div class="col-12 col-lg-6">
          <PieStatistics
            title="Operating System"
            :data="analyticsStore.os"
            :loading="analyticsStore.loading"
            data-key="operatingSystem"
          />
        </div>
        <div class="col-12 col-lg-6">
          <ReferrerStatistics
            :data="analyticsStore.referrers"
            :loading="analyticsStore.loading"
          />
        </div>
      </div>

      <!-- Charts Row 4: Country -->
      <div class="row q-col-gutter-lg q-mb-lg">
        <div class="col-12">
          <CountryStatistics
            :data="analyticsStore.countries"
            :loading="analyticsStore.loading"
          />
        </div>
      </div>

      <!-- Heatmap -->
      <div class="row q-col-gutter-lg q-mb-lg">
        <div class="col-12">
          <VisitorHeatmap
            :data="analyticsStore.heatmap"
            :loading="analyticsStore.loading"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAnalyticsStore } from '../../stores/analyticsStore'
import FilterBar from '../../components/analytics/FilterBar.vue'
import AnalyticsCard from '../../components/analytics/AnalyticsCard.vue'
import VisitorTrendChart from '../../components/analytics/VisitorTrendChart.vue'
import TopPagesChart from '../../components/analytics/TopPagesChart.vue'
import DeviceStatistics from '../../components/analytics/DeviceStatistics.vue'
import PieStatistics from '../../components/analytics/PieStatistics.vue'
import ReferrerStatistics from '../../components/analytics/ReferrerStatistics.vue'
import VisitorHeatmap from '../../components/analytics/VisitorHeatmap.vue'
import CountryStatistics from '../../components/analytics/CountryStatistics.vue'

const analyticsStore = useAnalyticsStore()

onMounted(async () => {
  await analyticsStore.fetchAllData()
})
</script>

<style scoped lang="scss">
.q-page {
  background-color: #f5f5f5;
}

h1 {
  font-size: 28px;
  font-weight: 600;
  color: #333;
}

.col-lg-2-5 {
  @media (min-width: 1024px) {
    flex: 0 0 calc(20% - 12px);
    max-width: calc(20% - 12px);
  }
}
</style>
