<script setup lang="ts">
import { defineProps } from 'vue';
import { Card, Typography, Divider } from 'ant-design-vue';

const { Title, Text } = Typography;

interface Location {
  address: string;
  distance: string;
  lonlat: string;
  name: string;
}

const props = defineProps<{
  selectedAddress: Location;
}>();
</script>

<template>
  <Card v-if="props.selectedAddress" :bordered="false" class="address-card">
    <Title :level="4" class="card-title">{{ props.selectedAddress.name }}</Title>
    <Divider class="divider" />
    <div class="info-container">
      <div class="info-item">
        <Text type="secondary">地址</Text>
        <Text strong>{{ props.selectedAddress.address }}</Text>
      </div>
      <div class="info-item">
        <Text type="secondary">距离</Text>
        <Text strong>{{ props.selectedAddress.distance }}</Text>
      </div>
      <div class="info-item">
        <Text type="secondary">经纬度</Text>
        <Text strong>{{ props.selectedAddress.lonlat }}</Text>
      </div>
    </div>
  </Card>
</template>

<style scoped>
.address-card {
  max-width: 300px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.address-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.card-title {
  margin-bottom: 0 !important;
}

.divider {
  margin: 12px 0;
}

.info-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@media (max-width: 576px) {
  .address-card {
    max-width: 100%;
  }
}
</style>
