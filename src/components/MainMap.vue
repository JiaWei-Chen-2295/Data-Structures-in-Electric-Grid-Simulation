<template>
  <div class="map-page-container">
    <el-amap
        ref="mapRef"
        :min-zoom="10"
        :max-zoom="22"
        :center="center"
        :zoom="zoom"
        @init="init"
        @click="handleMapClick"
    >
      <el-amap-layer-road-net visible />

      <!-- 添加标记点 -->
      <el-amap-marker
          v-for="(marker, index) in markers"
          :key="index"
          :position="marker.position"
          :label="{ content: marker.name, direction: 'top' }"
      >
        <div class="custom-marker">
          <div class="pulse-point"></div>
        </div>
      </el-amap-marker>

      <!-- 添加路线 -->
      <el-amap-polyline
          v-if="polyline.path.length >= 2"
          :path="polyline.path"
          :strokeColor="polyline.strokeColor"
          :strokeWeight="polyline.strokeWidth"
          :strokeStyle="polyline.strokeStyle"
          :strokeOpacity="polyline.strokeOpacity"
          :lineJoin="polyline.lineJoin"
      />

      <!-- 添加权重标签 -->
      <el-amap-text
          v-for="(label, index) in weightLabels"
          :key="index"
          :text="String(label.weight)"
          :position="label.position"
          :style="{
          'background-color': 'rgba(126, 87, 194, 0.8)',
          'color': 'white',
          'padding': '4px 8px',
          'border-radius': '12px',
          'font-size': '12px'
        }"
      />
    </el-amap>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import { ElAmap } from "@vuemap/vue-amap";
import { useMapObject } from "@/stores/mapObject.ts";
import type { JCLocation } from "@/location";
import {message} from "ant-design-vue";

interface Marker {
  position: [number, number];
  name: string;
}

const mapRef = ref();
const zoom = ref(14);
const center = ref([112.707808, 37.750316]);
const markers = ref<Marker[]>([]);
const polyline = ref({
  path: [] as [number, number][],
  strokeColor: '#7E57C2',
  strokeWidth: 4,
  strokeStyle: 'solid',
  strokeOpacity: 0.8,
  lineJoin: 'round',
  showDir: true,
  geodesic: true
});

let map = null;
const mapObjectStore = useMapObject();

// 验证位置数据的有效性
const isValidLocation = (location: JCLocation): boolean => {
  if (!location.lonlat) return false;
  const [lng, lat] = location.lonlat.split(',').map(Number);
  return !isNaN(lng) && !isNaN(lat) &&
      lng >= -180 && lng <= 180 &&
      lat >= -90 && lat <= 90;
};

const handleMapClick = (e) => {
  const position: [number, number] = [e.lnglat.lng, e.lnglat.lat];
  addMarker({
    position,
    name: `点 ${markers.value.length + 1}`
  }, false);

  emit('onLocationSelect', {
    name: `点 ${markers.value.length}`,
    address: '',
    distance: '',
    lonlat: `${position[0]},${position[1]}`
  });
};

// 计算两点之间的中点
const calculateMidpoint = (point1: [number, number], point2: [number, number]): [number, number] => {
  return [
    (point1[0] + point2[0]) / 2,
    (point1[1] + point2[1]) / 2
  ];
};

// 路径文字数组
const pathTexts = ref<Array<{ content: string; position: [number, number] }>>([]);

// 更新折线和路径文字
const updatePolyline = () => {
  if (markers.value.length < 2) {
    polyline.value.path = [];
    return;
  }

  // 确保按照标记点的顺序创建路径
  const path = markers.value.map(marker => marker.position);
  polyline.value = {
    ...polyline.value,
    path
  };

  // 更新路径文字
  pathTexts.value = [];
  for (let i = 0; i < markers.value.length - 1; i++) {
    const midPoint = calculateMidpoint(
        markers.value[i].position,
        markers.value[i + 1].position
    );
    pathTexts.value.push({
      content: markers.value[i].name,
      position: midPoint
    });
  }
};

// 添加标记点
const addMarker = (marker: Marker, updatePath: boolean = true) => {
  markers.value.push(marker);
  if (updatePath) {
    updatePolyline();
  }
  adjustZoomToFitMarkers();
};

// 绘制位置点和连线
const drawLocations = async (locations: JCLocation[]) => {
  // 1. 首先清除现有的所有标记和线条
  clearAll();

  if (!locations || locations.length === 0) return;

  // 2. 创建临时数组存储标记点
  const newMarkers: Marker[] = [];

  // 3. 处理所有位置点
  for (let i = 0; i < locations.length; i++) {
    const location = locations[i];
    if (!isValidLocation(location)) continue;

    const [lng, lat] = location.lonlat.split(',').map(Number);
    newMarkers.push({
      position: [lng, lat],
      name: location.name || `点 ${i + 1}`
    });
  }

  // 4. 按顺序添加标记点
  for (const marker of newMarkers) {
    markers.value.push(marker);
  }

  // 5. 更新折线路径
  if (newMarkers.length > 1) {
    polyline.value = {
      ...polyline.value,
      path: newMarkers.map(marker => marker.position)
    };
  }

  // 6. 调整地图视野
  await nextTick();
  adjustZoomToFitMarkers();
};

// 动态展示路径过程
const animateDrawPath = async (locations: JCLocation[], options = {
  duration: 1000,  // 每段路径的动画时长
  delay: 500       // 每个点之间的延迟
}) => {
  // 清除现有内容
  clearAll();

  if (!locations || locations.length < 2) return;

  // 存储所有点位
  const points: [number, number][] = [];
  const markersTemp: Marker[] = [];

  // 处理所有位置点
  locations.forEach((location, index) => {
    if (!isValidLocation(location)) return;
    const [lng, lat] = location.lonlat.split(',').map(Number);
    points.push([lng, lat]);
    markersTemp.push({
      position: [lng, lat],
      name: location.name || `点 ${index + 1}`
    });
  });

  // 动画函数
  const animate = async () => {
    // 当前已绘制的路径点集合
    let currentPath: [number, number][] = [];

    for (let i = 0; i < points.length; i++) {
      // 添加当前点
      markers.value.push(markersTemp[i]);
      currentPath.push(points[i]);

      // 如果有下一个点，开始绘制到下一个点的线段
      if (i < points.length - 1) {
        const startPoint = points[i];
        const endPoint = points[i + 1];

        // 分步绘制当前线段
        const steps = 50; // 增加步数使动画更平滑
        for (let step = 0; step <= steps; step++) {
          const progress = step / steps;
          const currentEndPoint: [number, number] = [
            startPoint[0] + (endPoint[0] - startPoint[0]) * progress,
            startPoint[1] + (endPoint[1] - startPoint[1]) * progress
          ];

          // 更新路径，包含之前的完整路径和当前正在绘制的部分
          polyline.value = {
            ...polyline.value,
            path: [
              ...currentPath.slice(0, -1), // 之前的完整路径
              startPoint,                  // 当前线段的起点
              currentEndPoint              // 当前线段的动态终点
            ],
            strokeColor: '#7E57C2',
            strokeOpacity: 0.8,
            showDir: true
          };

          // 控制动画速度
          await new Promise(resolve => setTimeout(resolve, options.duration / steps));
        }

        // 完成当前线段后的延迟
        await new Promise(resolve => setTimeout(resolve, options.delay));
      }
    }
  };

  // 开始动画并调整视野
  await animate();
  adjustZoomToFitMarkers();
};




// 展示 JCGraph
// 添加权重标签接口
interface WeightLabel {
  position: [number, number];
  weight: number;
}

// 添加权重标签数组
const weightLabels = ref<WeightLabel[]>([]);

// 修改 drawLocations 函数为 drawGraph 函数
const drawGraph = async (graphData: JCGraph, options = {
  duration: 1000,
  delay: 500,
  animated: true
}) => {
  clearAll();

  if (!graphData.locations || graphData.locations.length === 0) return;

  const points: [number, number][] = [];
  const markersTemp: Marker[] = [];
  weightLabels.value = []; // 清空权重标签

  // 处理所有位置点
  graphData.locations.forEach((location, index) => {
    if (!isValidLocation(location)) return;
    const [lng, lat] = location.lonlat.split(',').map(Number);
    points.push([lng, lat]);
    markersTemp.push({
      position: [lng, lat],
      name: location.name || `点 ${index + 1}`
    });
  });

  // 如果不需要动画，直接绘制
  if (!options.animated) {
    markers.value = markersTemp;

    // 处理所有边和权重
    const allPaths: [number, number][] = [];
    graphData.graph.forEach((row, i) => {
      row.forEach((weight, j) => {
        if (weight > 0) {
          // 添加路径
          allPaths.push(points[i], points[j]);

          // 计算权重标签位置（两点的中点）
          const midPoint: [number, number] = [
            (points[i][0] + points[j][0]) / 2,
            (points[i][1] + points[j][1]) / 2
          ];

          // 添加权重标签
          weightLabels.value.push({
            position: midPoint,
            weight: weight
          });
        }
      });
    });

    polyline.value = {
      ...polyline.value,
      path: allPaths,
      strokeColor: '#7E57C2',
      strokeOpacity: 0.8,
      showDir: true
    };

    adjustZoomToFitMarkers();
    return;
  }

  // 动画函数
  const animateForGraph = async () => {
    // 添加所有点
    for (const marker of markersTemp) {
      markers.value.push(marker);
      await new Promise(resolve => setTimeout(resolve, options.delay / 2));
    }

    // 逐条添加边和权重
    for (let i = 0; i < graphData.graph.length; i++) {
      for (let j = 0; j < graphData.graph[i].length; j++) {
        const weight = graphData.graph[i][j];
        if (weight > 0) {
          const startPoint = points[i];
          const endPoint = points[j];

          // 分步绘制当前边
          const steps = 50;
          for (let step = 0; step <= steps; step++) {
            const progress = step / steps;
            const currentEndPoint: [number, number] = [
              startPoint[0] + (endPoint[0] - startPoint[0]) * progress,
              startPoint[1] + (endPoint[1] - startPoint[1]) * progress
            ];

            // 当线段画到一半时添加权重标签
            if (step === Math.floor(steps / 2)) {
              weightLabels.value.push({
                position: currentEndPoint,
                weight: weight
              });
            }

            polyline.value = {
              ...polyline.value,
              path: [...polyline.value.path, startPoint, currentEndPoint],
              strokeColor: '#7E57C2',
              strokeOpacity: 0.8,
              showDir: true
            };

            await new Promise(resolve =>
                setTimeout(resolve, options.duration / steps)
            );
          }

          await new Promise(resolve => setTimeout(resolve, options.delay));
        }
      }
    }
  };

  await animateForGraph();
  adjustZoomToFitMarkers();
};




// 调整地图视野以适应所有标记点
const adjustZoomToFitMarkers = () => {
  if (markers.value.length === 0) return;

  if (markers.value.length === 1) {
    center.value = markers.value[0].position;
    zoom.value = 15;
    return;
  }

  const bounds = new AMap.Bounds();
  markers.value.forEach(marker => {
    bounds.extend(marker.position);
  });

  // map?.setFitView(bounds, {
  //   padding: [50, 50, 50, 50]
  // });
};

// 清除标记点
const clearMarkers = () => {
  markers.value = [];
  updatePolyline();
};

// 清除路线
const clearPolyline = () => {
  polyline.value.path = [];
};

// 清除所有
const clearAll = () => {
  clearMarkers();
  clearPolyline();
};

// 获取当前所有标记点
const getMarkers = () => {
  return markers.value.map(marker => ({
    name: marker.name,
    address: '',
    distance: '',
    lonlat: `${marker.position[0]},${marker.position[1]}`
  }));
};

const deleteAllWeight = () => {
  weightLabels.value = [];
};

// 初始化地图
const init = (o) => {
  map = o;
  mapObjectStore.setMapObject(mapRef.value.$$getInstance());
};

// 定义组件的属性和事件
const props = defineProps<{
  initialLocations?: JCLocation[];
}>();

const emit = defineEmits<{
  (e: 'onLocationSelect', location: JCLocation): void;
}>();

// 监听初始位置数组的变化
watch(() => props.initialLocations, (newLocations) => {
  if (newLocations?.length) {
    drawLocations(newLocations);
  }
}, { immediate: true });

// 暴露方法供父组件使用
defineExpose({
  // 地图基础操作
  getMapInstance: () => map,

  // 标记点操作
  addMarker,
  drawLocations,
  getMarkers,
  animateDrawPath, // 添加新的动画函数
  drawGraph,

  // 清除操作
  clearMarkers,
  clearPolyline,
  clearAll,
  deleteAllWeight,

  // 样式配置
  setPolylineStyle: (style: Partial<typeof polyline.value>) => {
    Object.assign(polyline.value, style);
  },

  // 获取当前地图状态
  getCurrentState: () => ({
    center: center.value,
    zoom: zoom.value,
    markers: getMarkers(),
    polyline: polyline.value
  })
});
</script>

<style>
.map-page-container {
  width: 100%; /* 确保父容器有宽度 */
  height: 80vh; /* 可选：设置父容器高度 */
}

el-amap {
  height: 70vh;
  width: 75vw;
}

/* 修改标记点样式 */
.custom-marker {
  position: relative;
  width: 12px;
  height: 12px;
}

.pulse-point {
  position: absolute;
  width: 12px;
  height: 12px;
  background: #7E57C2;
  border-radius: 50%;
  box-shadow: 0 0 10px #7E57C2;
  animation: pulse 2s infinite;
}

/* 添加发光动画效果 */
@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(126, 87, 194, 0.7);
  }
  70% {
    transform: scale(1.2);
    box-shadow: 0 0 0 10px rgba(126, 87, 194, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(126, 87, 194, 0);
  }
}

/* 添加线条发光效果 */
:deep(.amap-polyline) {
  filter: drop-shadow(0 0 4px rgba(126, 87, 194, 0.8));
}

/* 添加线条动画 */
:deep(.amap-polyline) {
  stroke-dasharray: 20;
  animation: dash 2s linear infinite;
}

@keyframes dash {
  to {
    stroke-dashoffset: -40;
  }
}

.marker-appear {
  animation: markerAppear 0.5s ease-out;
}

@keyframes markerAppear {
  0% {
    transform: scale(0) translateY(-20px);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) translateY(0);
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

/* 添加路径动画发光效果 */
:deep(.amap-polyline) {
  filter: drop-shadow(0 0 8px rgba(126, 87, 194, 0.6));
  transition: all 0.3s ease;
}

/* 添加点击波纹效果 */
.pulse-point::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 24px;
  height: 24px;
  background: rgba(126, 87, 194, 0.4);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: ripple 1.5s ease-out infinite;
}

@keyframes ripple {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0;
  }
}

:deep(.amap-text) {
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

:deep(.amap-text):hover {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}
</style>
