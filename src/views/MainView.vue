<template>
  <a-row :gutter="[16, 16]">
    <!-- 左侧地图部分 -->
    <a-col :span="18">
      <a-card class="map-card" :bordered="false">
        <main-map
            ref="mapComponentRef"
            :initial-locations="locations"
            @onLocationSelect="handleLocationSelect"
        ></main-map>
      </a-card>
    </a-col>

    <!-- 右侧控制面板 -->
    <a-col :span="6">
      <div class="right-panel">
        <!-- 搜索控制卡片 -->
        <a-card class="control-card" hoverable title="搜索控制">
          <a-space direction="vertical" size="middle" style="width: 100%">
            <!-- 搜索框 -->
            <a-select
                placeholder="请输入小区的名字"
                v-model:value="value"
                label-in-value
                show-search
                enter-button
                :default-active-first-option="false"
                :show-arrow="false"
                :filter-option="false"
                :not-found-content="null"
                :options="data"
                @search="onSearch"
                @change="handleSearchChange"
                @input="value = $event.data"
                class="search-input"
            >
              <template #suffixIcon>
                <SearchOutlined/>
              </template>
              <template #menuItemSelectedIcon>
                <ArrowRightOutlined />
              </template>
            </a-select>

            <!-- 下拉选择框 -->
            <a-select
                v-model:value="value1"
                placeholder="请选择要使用的算法"
                @focus="focus"
                @change="handleChange"
                class="select-box"
            >
              <a-select-option
                  v-for="item in algoSelectConfig"
                  :key="item"
                  :value="item"
              >
                {{ item }}
              </a-select-option>
            </a-select>
          </a-space>
          <a-divider></a-divider>
          <!--          控制-->
          <a-space direction="vertical" size="middle" style="width: 100%">
            <!-- 进度显示 -->
            <a-card
                v-if="isShowProcess"
                class="progress-card"
                :bodyStyle="{ padding: '12px' }"
            >
              <div class="progress-container">
                <a-progress
                    :stroke-color="{
                    from: '#8A2BE2',
                    to: '#DA70D6',
                  }"
                    :percent="completePercentStore.$state.percent"
                    status="active"
                />
                <p class="progress-text">寻路进度</p>
              </div>
            </a-card>

            <!-- 控制按钮组 -->
            <div class="button-group">
              <div class="button-row">
                <a-button
                    type="primary"
                    :loading="isFindAllRoads"
                    @click="findAllRoads"
                    class="action-btn"
                >
                  <template #icon>
                    <SearchOutlined/>
                  </template>
                  查找添加顺序
                </a-button>
                <a-button
                    type="primary"
                    :loading="isFindBestRoads"
                    @click="getGraph"
                    class="action-btn"
                >
                  <template #icon>
                    <PushpinOutlined/>
                  </template>
                  获取当前的图
                </a-button>
              </div>
              <div class="button-row">
                <a-button
                    type="primary"
                    :loading="isShowFindRoads"
                    @click="showCheapPrice"
                    class="action-btn"
                >
                  <template #icon>
                    <AccountBookOutlined/>
                  </template>
                  开始计算
                </a-button>


              </div>
              <div class="button-row">
                <a-button
                    type="primary"
                    :loading="isShowFindRoads"
                    @click="showFindRoads"
                    class="action-btn"
                >
                  <template #icon>
                    <EyeOutlined/>
                  </template>
                  展示查找过程
                </a-button>
                <a-button
                    type="primary"
                    danger
                    @click="clearSelection"
                    class="action-btn"
                >
                  <template #icon>
                    <DeleteOutlined/>
                  </template>
                  清除当前选中
                </a-button>
              </div>
            </div>
          </a-space>
        </a-card>


        <!-- 选择的地址 -->
        <a-card class="selected-address" hoverable :title="`已选择的地址(${selectedAddress.length})`">
          <location-card v-for="(add, index) in selectedAddress" :key="index" :selected-address="add"></location-card>
        </a-card>
      </div>
    </a-col>
  </a-row>

  <contextHolder />

</template>

<style scoped>
/* 右侧面板布局 */
.right-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 控制卡片通用样式 */
.control-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* 搜索框和选择框样式 */
.search-input,
.select-box {
  width: 100%;
  border-radius: 6px;
}

/* 进度卡片样式 */
.progress-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  margin-bottom: 8px;
}

.progress-container {
  text-align: center;
}

.progress-text {
  margin: 8px 0 0;
  color: #666;
  font-size: 14px;
}

/* 按钮组样式 */
.button-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.button-row {
  display: flex;
  gap: 8px;
  justify-content: space-between;
}

.action-btn {
  flex: 1;
  min-width: 120px;
  height: 36px;
  border-radius: 6px;
}

/* 地图卡片样式 */
.map-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  height: 100%;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .button-row {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
    margin-bottom: 8px;
  }
}
</style>
<script setup lang="ts">
import MainMap from "@/components/MainMap.vue";
import {onMounted, ref} from 'vue';
import {AccountBookOutlined, DeleteOutlined, EyeOutlined, PushpinOutlined, SearchOutlined, ArrowRightOutlined} from '@ant-design/icons-vue';
// 用于展示最优的价格
import {message, notification} from "ant-design-vue";
import {searchTips} from "@/service/searchLocation/search.ts";
import LocationCard from "@/components/LocationCard.vue";
import type {JCLocation} from "@/location";
import {createGraph, createMoneyGraph} from "@/service/CreateGraph/CreateGraph.ts";
import {useCompletePercentStore} from "@/stores/counter.ts";
import {useGlobalJCGraphStore} from "@/stores/globalgraph.ts";
import {findShortestPathFloyd} from "@/service/findRoute/findRouteFloyd.ts";
import {findShortestPath} from "@/service/findRoute/findRouteKruskal.ts";
import {adjustCoordinates} from "@/utils/handleLocationOffset.ts";
import {findShortPath} from "@/service/findRoute/findShortPath.ts";
import type {JCGraph} from "@/JCGraph";

const algoSelectConfig = ref(['最优电网价格(多地)', '最短电网距离(两地)']);
const completePercentStore = useCompletePercentStore();
// 下拉选择框
const value1 = ref<string>('最优电网价格(多地)');
const isShowProcess = ref(false);
const progressPercent = ref(0);
const isFindAllRoads = ref(false);
const isFindBestRoads = ref(false);
const isShowFindRoads = ref(false);

// 选择的地址
const selectedAddress = ref<JCLocation[]>([]);

// 图状态库
const GlobalJCGraphStore = useGlobalJCGraphStore();

const [api, contextHolder] = notification.useNotification();
const openResults = (title: string, description: string) => openNotification(title, description);
const openNotification = (title: string, description: string) => {
  api.info({
    message: title,
    description: description,
    placement: 'bottomRight',
  });
};

onMounted(() => {
  mapComponentRef.value.setPolylineStyle({
    strokeColor: '#7E57C2',
    strokeWidth: 6,
    strokeOpacity: 0.9,

  });
})

const findAllRoads = () => {
  isFindAllRoads.value = true;

  try {
    mapComponentRef.value.drawLocations(selectedAddress.value);
  } catch (e) {
    message.error('请选择正确的地址', e);
  }


  isFindAllRoads.value = false;

};

const getGraph = async () => {
  isFindBestRoads.value = true;
  isShowProcess.value = true;

  setTimeout(() => {
    progressPercent.value = completePercentStore.getPercent();
  }, 500)
  let graph: JCGraph = null!;
  let totalDistance = 0;
  if(value1.value === '最优电网价格(多地)') {
    graph = await createMoneyGraph(selectedAddress.value);
    await mapComponentRef.value.drawGraph(graph, {animated: false});
  } else if (value1.value === '最短电网距离(两地)') {
    if (selectedAddress.value.length !== 2) {
      message.error('你只能选择两个地址')
      isFindBestRoads.value = false;
      isShowProcess.value = false;
      return
    }
    graph = await createGraph(selectedAddress.value);

  }

  GlobalJCGraphStore.setGraph(graph);

  console.log('graph', graph);

  // 直接显示，不使用动画
  // await mapRef.value.drawGraph(graphData, { animated: false });
  isFindBestRoads.value = false;
  isShowProcess.value = false;

};

// 最便宜的价格展示
const showCheapPrice = async () => {
  let currentGraph = GlobalJCGraphStore.getGraph();
  console.log('curr', currentGraph);
  if (currentGraph.graph === undefined || currentGraph.graph.length === 0) {
    message.error('请先点击相应按钮获取当前的图');
    return;
  }
  if (value1.value === '最优电网价格(多地)') {
    // 使用最短路径算法
    const { locations, totalDistance} = findShortestPath(currentGraph);
    console.log('better', locations, totalDistance)
    await mapComponentRef.value.animateDrawPath(locations);
    openResults('最便宜的电网路线',
        `最优价格为 ${totalDistance} 万元, 顺序为:
        ${locations.map(l => l.name).join(' -> ')}`);
  } else if (value1.value === '最短电网距离(两地)') {
    // 使用最短路径算法
    let totalDistance = currentGraph.totalDistance
    await mapComponentRef.value.animateDrawPath(currentGraph.locations, {
      duration: 500,  // 每段路径的动画时长
      delay: 250       // 每个点之间的延迟
    });
    openResults('最短的电网路线',
        `最短的路径为 ${totalDistance} 千米`)
  }

};

const showFindRoads = async () => {
  isShowFindRoads.value = true;
  await mapComponentRef.value.animateDrawPath(selectedAddress.value);
  isShowFindRoads.value = false;
};

const clearSelection = () => {
  selectedAddress.value = [];
  mapComponentRef.value.clearAll();
  mapComponentRef.value.deleteAllWeight();
  message.warn('清除成功')
};

const handleChange = (value: string) => {
  message.info(`现在的算法是 ${value}`);
};

// 请求地图相关
const value = ref<{ value: string | number, label?: any }>(null);
const data = ref<any[]>([]);

// 地图上标点用
const mapComponentRef = ref();
const locations = ref<JCLocation[]>([]);

let timeout: any;
let currentValue = '';

async function fetch(fetchValue: string, callback: any) {
  if (timeout) {
    clearTimeout(timeout);
    timeout = null;
  }
  // 使用传入的 fetchValue 而不是 currentValue
  const response = await searchTips(fetchValue);
  console.log('resp', response);

  // 提取 name, location, 和 address 字段
  let id = 0;
  const extractedData = response.pois.map((tip: any) => ({
    value: id++,
    label: tip.name,
    address: tip.address,
    distance: tip.distance,
    // 这里处理一下 lonlat 字段
    lonlat: adjustCoordinates(tip.lonlat, 'E','W', 555,  70),
  }));

  callback(extractedData);
}

const onSearch = async () => {
  await fetch(value.value, (d: any[]) => (data.value = d));
};

const handleSearchChange = async (selectedOption: { value: string | number, label?: any }) => {
  if (selectedOption) {
    console.log('选中的值:', selectedOption.label);
    // 在这里处理选中的值，比如设置 selectedAddress 或其他逻辑
    console.log('selectedOption', selectedOption)
    let tempLocation: JCLocation = {
      name: selectedOption.label,
      address: selectedOption.option.address,
      distance: selectedOption.option.distance,
      lonlat: selectedOption.option.lonlat
    };

    selectedAddress.value.push(tempLocation);
    const newLocation = {
      position: tempLocation.lonlat.split(','),
      name: tempLocation.name,

    };
    mapComponentRef.value.addMarker(newLocation, false);

  }
  await fetch(value.value.value, (d: any[]) => (data.value = d));

};

</script>
