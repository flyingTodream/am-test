<template>
  <div class="map-viewer">
    <!-- 地图控制面板 -->
    <div class="map-controls">
      <div class="control-group">
        <button class="control-btn" @click="toggleFullscreen" :disabled="!isMapReady">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3">
            </path>
          </svg>
          {{ isFullscreen ? '退出全屏' : '全屏' }}
        </button>

        <!-- 预警信息显示开关 -->
        <button class="control-btn" @click="toggleWarningPoints" :class="{ 'active': showWarningPoints }">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" v-if="showWarningPoints">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" v-else>
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
          {{ showWarningPoints ? '隐藏预警' : '显示预警' }}
        </button>
      </div>

      <div class="control-group">
        <div class="zoom-info">
          <span class="zoom-level">缩放级别: {{ zoom }}</span>
        </div>
      </div>
    </div>

    <!-- 地图容器 -->
    <div class="map-container" :class="{ fullscreen: isFullscreen }" ref="mapContainer">
      <!-- 地图加载状态 -->
      <div v-if="!isMapReady" class="map-loading">
        <div class="loading-spinner"></div>
        <p>地图加载中...</p>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'

const emit = defineEmits(['map-ready', 'view-reset', 'point-clicked'])

// Props
const props = defineProps({
  coordinates: {
    type: Array,
    default: () => []
  },
  shpCoordinates: {
    type: Array,
    default: () => []
  },
  shpData: {
    type: Array,
    default: () => []
  },
  mapStats: {
    type: Object,
    default: null
  },
  currentTimeIndex: {
    type: Number,
    default: 0
  },
  timeColumns: {
    type: Array,
    default: () => []
  }
})


// 响应式数据
const mapContainer = ref(null)
const isMapReady = ref(false)
const isFullscreen = ref(false)
const zoom = ref(14)
const hasPath = ref(false)
const showWarningPoints = ref(true) // 是否显示预警信息圆点

// 地图实例
let map = null
let irregularPolygon = null
let shpCircleMarkers = []
let infoWindow = null // 信息气泡实例

// 初始化地图
const initMap = async () => {
  if (!mapContainer.value || typeof AMap === 'undefined') return

  try {
    // 创建地图实例
    map = new AMap.Map(mapContainer.value, {
      zoom: zoom.value,
      center: [116.397428, 39.90923],
      dragEnable: true,
      zoomEnable: false,
      keyboardEnable: false,
      doubleClickZoom: false
    })

    // 添加不规则闭合区域
    irregularPolygon = new AMap.Polygon({
      path: [],
      strokeColor: '#FF6B35',
      strokeWeight: 2,
      strokeOpacity: 0.5,
      fillColor: '#FF9558',
      fillOpacity: 0.2,
      strokeStyle: 'solid'
    })

    map.add(irregularPolygon)

    // 监听地图缩放级别变化
    map.on('zoomend', () => {
      zoom.value = map.getZoom()
    })

    isMapReady.value = true
    emit('map-ready', map)

  } catch (error) {
    console.error('地图初始化失败:', error)
  }
}

// 更新地图路径
const updateMapPath = (coordinates) => {
  if (!map || !irregularPolygon) {
    return
  }

  try {
    // 设置路径（即使是空数组也要设置，这样可以清除路径）
    irregularPolygon.setPath(coordinates || [])

    // 自动调整地图视野以适应新的区域
    if (coordinates && coordinates.length > 0) {
      map.setBounds(irregularPolygon.getBounds())
      hasPath.value = true
    } else {
      // 如果没有坐标，清除路径状态
      hasPath.value = false
    }
  } catch (error) {
    console.error('更新地图路径失败:', error)
  }
}

// 根据value字段的值获取对应颜色
const getColorByValue = (value) => {
  // 如果value为null或undefined，使用白色
  if (value === null || value === undefined) {
    return '#ffffff' // 默认白色
  }

  const numValue = parseFloat(value)
  if (numValue >= 2.5) return '#1f2937' // 黑色预警 (5级) - 2.5m以上
  if (numValue >= 1.5) return '#dc2626' // 红色预警 (4级) - 1.5-2.5m
  if (numValue >= 1.0) return '#ea580c' // 橙色预警 (3级) - 1.0-1.5m
  if (numValue >= 0.5) return '#ca8a04' // 黄色预警 (2级) - 0.5-1.0m
  if (numValue >= 0) return '#2563eb' // 蓝色预警 (1级) - 0-0.5m
  return '#ffffff' // 无预警 (0级) - 0m以下
}

// 根据value字段的值获取预警级别信息
const getWarningLevelInfo = (value) => {
  if (value === null || value === undefined) {
    return {
      level: '无数据',
      color: '#ffffff',
      description: '暂无监测数据'
    }
  }

  const numValue = parseFloat(value)
  if (numValue >= 2.5) {
    return {
      level: '5级',
      color: '#1f2937',
      description: '黑色预警（≥2.5m）'
    }
  }
  if (numValue >= 1.5) {
    return {
      level: '4级',
      color: '#dc2626',
      description: '红色预警（1.5-2.5m）'
    }
  }
  if (numValue >= 1.0) {
    return {
      level: '3级',
      color: '#ea580c',
      description: '橙色预警（1.0-1.5m）'
    }
  }
  if (numValue >= 0.5) {
    return {
      level: '2级',
      color: '#ca8a04',
      description: '黄色预警（0.5-1.0m）'
    }
  }
  if (numValue >= 0) {
    return {
      level: '1级',
      color: '#2563eb',
      description: '蓝色预警（0-0.5m）'
    }
  }
  return {
    level: '0级',
    color: '#ffffff',
    description: '无预警（<0m）'
  }
}

// 创建信息气泡内容
const createInfoWindowContent = (pointData, warningInfo) => {
  const stationName = pointData?.Name || `监测点 ${pointData?.CEM_No || '未知'}`
  const waterLevel = pointData?.value !== null && pointData?.value !== undefined
    ? `${parseFloat(pointData.value).toFixed(2)}m`
    : '无数据'

  // 获取当前时间节点
  const currentTime = props.timeColumns && props.timeColumns.length > 0 && props.currentTimeIndex < props.timeColumns.length
    ? props.timeColumns[props.currentTimeIndex]
    : '未知时间'

  return `
    <div style="padding: 12px; min-width: 220px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="display: flex; align-items: center; margin-bottom: 8px;">
        <div style="width: 12px; height: 12px; border-radius: 2px; background: ${warningInfo.color}; margin-right: 8px; flex-shrink: 0;"></div>
        <div style="font-weight: 600; font-size: 14px; color: #1f2937;">${stationName}</div>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <span style="font-size: 12px; color: #6b7280;">时间节点:</span>
        <span style="font-weight: 600; font-size: 12px; color: #3b82f6; background: rgba(59, 130, 246, 0.1); padding: 1px 4px; border-radius: 2px;">
          ${currentTime}
        </span>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <span style="font-size: 12px; color: #6b7280;">当前水位:</span>
        <span style="font-weight: 600; font-size: 13px; color: #1f2937;">${waterLevel}</span>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <span style="font-size: 12px; color: #6b7280;">预警级别:</span>
        <span style="font-weight: 600; font-size: 12px; color: ${warningInfo.color}; background: ${warningInfo.color}20; padding: 2px 6px; border-radius: 3px;">
          ${warningInfo.level}
        </span>
      </div>
      <div style="font-size: 11px; color: #6b7280; margin-top: 8px; padding-top: 6px; border-top: 1px solid #e5e7eb;">
        ${warningInfo.description}
      </div>
      ${pointData?.CEM_No ? `<div style="font-size: 11px; color: #9ca3af; margin-top: 4px;">设备编号: ${pointData.CEM_No}</div>` : ''}
    </div>
  `
}

// 显示信息气泡
const showInfoWindow = (coordinates, pointData) => {
  if (!map || !coordinates) return

  // 获取预警信息
  const warningInfo = getWarningLevelInfo(pointData?.value)

  // 创建信息气泡内容
  const content = createInfoWindowContent(pointData, warningInfo)

  // 如果已有信息气泡，先关闭
  if (infoWindow) {
    infoWindow.close()
  }

  // 创建新的信息气泡
  infoWindow = new AMap.InfoWindow({
    content: content,
    offset: new AMap.Pixel(0, -35), // 向上偏移，避免遮挡圆点
    closeWhenClickMap: true, // 点击地图时关闭
    anchor: 'bottom-center' // 气泡锚点在底部中心
  })

  // 打开信息气泡
  infoWindow.open(map, coordinates)
}

// 关闭信息气泡
const closeInfoWindow = () => {
  if (infoWindow) {
    infoWindow.close()
    infoWindow = null
  }
}

// 处理圆点点击事件
const handlePointClick = (pointData, coordinates, index) => {
  // 显示信息气泡
  showInfoWindow(coordinates, pointData)

  // 发射点击事件到父组件，传递点数据、坐标和索引
  emit('point-clicked', {
    data: pointData,
    coordinates: coordinates,
    index: index,
    color: getColorByValue(pointData?.value)
  })
}

// 更新SHP圆点
const updateShpCircles = (coordinates) => {
  if (!map) {
    return
  }

  try {
    // 如果预警信息开关关闭，清除现有圆点
    if (!showWarningPoints.value) {
      // 清除之前的圆点
      shpCircleMarkers.forEach(circle => {
        map.remove(circle)
      })
      shpCircleMarkers = []
      return
    }

    // 如果没有坐标或数据，清除现有圆点
    if (!coordinates || coordinates.length === 0 || props.shpData.length === 0) {
      // 清除之前的圆点
      shpCircleMarkers.forEach(circle => {
        map.remove(circle)
      })
      shpCircleMarkers = []
      return
    }

    // 检查是否需要重新创建所有圆点（圆点数量发生变化）
    if (shpCircleMarkers.length !== coordinates.length) {
      // 清除之前的圆点
      shpCircleMarkers.forEach(circle => {
        map.remove(circle)
      })
      shpCircleMarkers = []

      // 重新创建所有圆点
      coordinates.forEach(([lng, lat], index) => {
        const shpItem = props.shpData[index]
        const color = shpItem ? getColorByValue(shpItem.value) : '#FF6B35'

        const circle = new AMap.Circle({
          center: [lng, lat],
          radius: 30,
          strokeColor: color,
          strokeWeight: 0,
          strokeOpacity: 0,
          fillColor: color,
          fillOpacity: 1.0,
          strokeStyle: 'solid',
          cursor: 'pointer'
        })

        // 添加点击事件监听器
        circle.on('click', () => {
          handlePointClick(shpItem, [lng, lat], index)
        })

        map.add(circle)
        shpCircleMarkers.push(circle)
      })
    } else {
      // 圆点数量相同，只更新颜色变化的圆点
      coordinates.forEach(([lng, lat], index) => {
        const shpItem = props.shpData[index]
        const newColor = shpItem ? getColorByValue(shpItem.value) : '#FF6B35'

        // 获取当前圆点
        const existingCircle = shpCircleMarkers[index]
        if (existingCircle) {
          // 获取当前颜色
          const currentColor = existingCircle.getOptions().fillColor

          // 如果颜色发生变化，更新颜色
          if (currentColor !== newColor) {
            existingCircle.setOptions({
              fillColor: newColor,
              strokeColor: newColor
            })
          }
        }
      })
    }
  } catch (error) {
    console.error('更新SHP圆点失败:', error)
  }
}


// 重置视图
const resetView = () => {
  if (!map) return

  if (hasPath.value && irregularPolygon) {
    map.setBounds(irregularPolygon.getBounds())
  } else if (shpCircleMarkers.length > 0) {
    // 如果只有SHP圆点，计算所有圆点的边界
    const bounds = new AMap.Bounds()
    shpCircleMarkers.forEach(circle => {
      bounds.extend(circle.getCenter())
    })
    map.setBounds(bounds)
  } else {
    map.setCenter([116.397428, 39.90923])
    map.setZoom(13)
  }

  emit('view-reset')
}


// 切换全屏
const toggleFullscreen = () => {
  const container = mapContainer.value

  if (!document.fullscreenElement) {
    container.requestFullscreen().then(() => {
      isFullscreen.value = true
      nextTick(() => {
        map?.getSize()
        map?.setCenter(map?.getCenter())
      })
    }).catch(err => {
      console.error('无法进入全屏模式:', err)
    })
  } else {
    document.exitFullscreen().then(() => {
      isFullscreen.value = false
      nextTick(() => {
        map?.getSize()
        map?.setCenter(map?.getCenter())
      })
    })
  }
}

// 切换预警信息显示
const toggleWarningPoints = () => {
  showWarningPoints.value = !showWarningPoints.value
  // 更新圆点显示
  if (props.shpCoordinates.length > 0) {
    updateShpCircles(props.shpCoordinates)
  }
}


// 监听坐标变化
watch(() => props.coordinates, (newCoordinates) => {
  if (newCoordinates && newCoordinates.length > 0) {
    updateMapPath(newCoordinates)
  }
}, { deep: true })

// 监听SHP坐标变化
watch([() => props.shpCoordinates, () => props.shpData], ([newShpCoordinates, newShpData]) => {
  if (newShpCoordinates && newShpCoordinates.length > 0 && newShpData && newShpData.length > 0) {
    updateShpCircles(newShpCoordinates)
  }
}, { deep: true })

// 监听全屏状态变化
const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}

// 组件挂载
onMounted(() => {
  // 等待地图API加载完成
  const checkAMapReady = () => {
    if (typeof AMap !== 'undefined') {
      initMap()
    } else {
      setTimeout(checkAMapReady, 500)
    }
  }

  checkAMapReady()

  // 监听全屏变化
  document.addEventListener('fullscreenchange', handleFullscreenChange)
})

// 组件卸载
onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)

  // 关闭信息气泡
  closeInfoWindow()

  // 清理地图实例
  if (map) {
    map.destroy()
    map = null
    irregularPolygon = null
    shpCircleMarkers = []
  }
})

// 暴露方法给父组件
defineExpose({
  updateMapPath,
  resetView,
  toggleFullscreen,
  closeInfoWindow,
  map: () => map
})
</script>

<style scoped>
.map-viewer {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.map-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  border-radius: 8px 8px 0 0;
  gap: 1rem;
  flex-wrap: wrap;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.control-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
}

.control-btn:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.control-btn.active {
  background: #dcfce7;
  border-color: #16a34a;
  color: #16a34a;
}

.control-btn.active:hover:not(:disabled) {
  background: #bbf7d0;
  border-color: #15803d;
}

.zoom-info {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
}

.zoom-level {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.map-container {
  flex: 1;
  position: relative;
  background: #f3f4f6;
  border-radius: 0 0 8px 8px;
  overflow: hidden;
  min-height: 500px;
}

.map-container.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  border-radius: 0;
}

.map-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #6b7280;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.map-info {
  display: flex;
  gap: 2rem;
  padding: 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0 0 8px 8px;
  margin-top: -1px;
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
}

.info-value.status {
  font-weight: 500;
}

.info-value.status.loading {
  color: #3b82f6;
}

.info-value.status.ready {
  color: #6b7280;
}

.info-value.status.updated {
  color: #10b981;
}

.info-value.status.error {
  color: #ef4444;
}

@media (max-width: 768px) {
  .map-controls {
    flex-direction: column;
    gap: 0.75rem;
  }

  .control-group {
    width: 100%;
    justify-content: center;
  }

  .map-info {
    gap: 1rem;
  }

  .info-item {
    flex: 1;
    min-width: 0;
  }
}

@media (max-width: 768px) {
  .map-controls {
    flex-direction: column;
    gap: 0.75rem;
  }

  .control-group {
    width: 100%;
    justify-content: center;
  }

  .map-info {
    gap: 1rem;
  }

  .info-item {
    flex: 1;
    min-width: 0;
  }
}

@media (max-width: 480px) {
  .map-controls {
    padding: 0.75rem;
  }

  .control-btn {
    padding: 0.5rem;
    font-size: 0.75rem;
  }

  .map-container {
    min-height: 400px;
  }

  .map-info {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>