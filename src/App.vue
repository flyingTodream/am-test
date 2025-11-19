<template>
  <div class="app">
    <!-- Header -->
    <AppHeader />

    <!-- Main Content -->
    <div class="main-container">
      <div class="sidebar">
        <!-- CSV上传组件 -->
        <div class="sidebar-section">
          <h3 class="section-title">数据上传</h3>
          <CsvUploader ref="csvUploader" @file-selected="handleFileSelected" />
        </div>

        <!-- 图例说明 -->
        <div class="sidebar-section">
          <h3 class="section-title">图例说明</h3>
          <div class="legend-container">
            <div class="legend-item">
              <div class="legend-color" style="background: #1f2937;"></div>
              <div class="legend-content">
                <span class="legend-title">黑色预警</span>
                <span class="legend-desc">（5级）- 2.5m以上</span>
              </div>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background: #dc2626;"></div>
              <div class="legend-content">
                <span class="legend-title">红色预警</span>
                <span class="legend-desc">（4级）- 1.5-2.5m</span>
              </div>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background: #ea580c;"></div>
              <div class="legend-content">
                <span class="legend-title">橙色预警</span>
                <span class="legend-desc">（3级）- 1.0-1.5m</span>
              </div>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background: #ca8a04;"></div>
              <div class="legend-content">
                <span class="legend-title">黄色预警</span>
                <span class="legend-desc">（2级）- 0.5-1.0m</span>
              </div>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background: #2563eb;"></div>
              <div class="legend-content">
                <span class="legend-title">蓝色预警</span>
                <span class="legend-desc">（1级）- 0.5m以下</span>
              </div>
            </div>
          </div>
        </div>

              </div>

      <!-- 地图和统计区域 -->
      <div class="map-stats-section">
        <!-- 地图区域 -->
        <div class="map-section">
          <MapViewer
            ref="mapViewer"
            :coordinates="currentCoordinates"
            :shp-coordinates="shpCoordinates"
            :shp-data="shpJsonData"
            :map-stats="mapStats"
            @map-ready="handleMapReady" />
        </div>

        <!-- 实时统计区域 -->
        <div class="stats-section">
          <div class="stats-panel">
            <div class="stats-header">
              <h4 class="stats-title">实时统计</h4>
              <div class="stats-status" :class="mapStats ? mapStats.status : 'ready'">
                <div class="status-dot"></div>
                <span>{{ mapStats ? (mapStats.status === 'loading' ? '加载中' : mapStats.status === 'updated' ? '已更新' :
                  mapStats.status === 'error' ? '错误' : '就绪') : '就绪' }}</span>
              </div>
            </div>

            <div class="warning-stats-grid">
              <div class="warning-stat-box">
                <div class="stat-number">{{ mapStats ? mapStats.pointCount : 0 }}</div>
                <div class="stat-desc">检测站点总数</div>
              </div>

              <div class="warning-stat-box black-warning">
                <div class="stat-number">0</div>
                <div class="stat-desc">黑色预警</div>
              </div>

              <div class="warning-stat-box red-warning">
                <div class="stat-number">0</div>
                <div class="stat-desc">红色预警</div>
              </div>

              <div class="warning-stat-box orange-warning">
                <div class="stat-number">0</div>
                <div class="stat-desc">橙色预警</div>
              </div>

              <div class="warning-stat-box yellow-warning">
                <div class="stat-number">0</div>
                <div class="stat-desc">黄色预警</div>
              </div>

              <div class="warning-stat-box blue-warning">
                <div class="stat-number">0</div>
                <div class="stat-desc">蓝色预警</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 状态消息组件 -->
    <StatusMessage v-model:error="errorMessage" v-model:success="successMessage" v-model:warning="warningMessage"
      v-model:info="infoMessage" :auto-close="true" :duration="5000" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { CSVParser } from './utils/csvParser.js'
import AppHeader from './components/AppHeader.vue'
import CsvUploader from './components/CsvUploader.vue'
import MapViewer from './components/MapViewer.vue'
import StatusMessage from './components/StatusMessage.vue'

// 响应式变量
const mapViewer = ref(null)
const csvUploader = ref(null)
const isProcessing = ref(false)
const currentCoordinates = ref([])
const currentFile = ref(null)
const mapStats = ref(null)
const shpJsonData = ref([])
const shpCoordinates = ref([])

// 消息状态
const errorMessage = ref('')
const successMessage = ref('')
const warningMessage = ref('')
const infoMessage = ref('')

// CSV解析器
const csvParser = new CSVParser()

// 处理文件选择
const handleFileSelected = async (file) => {
  try {
    isProcessing.value = true
    currentFile.value = file
    const processingStartTime = Date.now()

    // 显示处理信息
    if (!file.name.includes('kml.csv')) {
      infoMessage.value = '正在解析CSV文件...'
    }

    // 解析CSV文件
    await csvParser.parseCSVFile(file)

    // 清除处理中消息
    if (!file.name.includes('kml.csv')) {
      infoMessage.value = ''
    }

    // 获取坐标数据
    const coordinates = csvParser.getCoordinates()
    currentCoordinates.value = coordinates

    // 更新统计信息
    const info = csvParser.getInfo()
    const processTime = Date.now() - processingStartTime

    mapStats.value = {
      ...info,
      status: 'updated',
      processTime: processTime,
      lastUpdate: new Date().toISOString(),
      dataRange: calculateDataRange(currentCoordinates.value)
    }

    // 显示成功消息
    if (!file.name.includes('kml.csv')) {
      successMessage.value = `CSV文件解析成功！共提取${coordinates.length}个坐标点`
    } else {
      successMessage.value = `默认数据加载成功！共提取${coordinates.length}个坐标点`
    }

  } catch (error) {
    errorMessage.value = error.message
    mapStats.value = null
    currentCoordinates.value = []
  } finally {
    isProcessing.value = false
  }
}


// 处理地图就绪
const handleMapReady = () => {
  console.log('地图已准备就绪')
  infoMessage.value = '地图加载完成，可以上传CSV文件'
}


// 计算数据范围
const calculateDataRange = (coordinates) => {
  if (!coordinates || coordinates.length === 0) {
    return '无数据'
  }

  const lons = coordinates.map(coord => coord[0])
  const lats = coordinates.map(coord => coord[1])

  const minLon = Math.min(...lons).toFixed(4)
  const maxLon = Math.max(...lons).toFixed(4)
  const minLat = Math.min(...lats).toFixed(4)
  const maxLat = Math.max(...lats).toFixed(4)

  return `经度:${minLon}-${maxLon}, 纬度:${minLat}-${maxLat}`
}


// 页面加载完成后初始化
onMounted(async () => {
  // 等待地图API加载完成
  const checkAMapReady = async () => {
    if (typeof AMap === 'undefined') {
      setTimeout(checkAMapReady, 500)
      return
    }

    // 地图API加载完成后，加载默认文件
    await loadDefaultFiles()
  }

  checkAMapReady()
})

// 加载默认的文件
const loadDefaultFiles = async () => {
  try {
    // 显示处理信息
    infoMessage.value = '正在加载默认数据文件...'

    // 同时加载kml.csv和shp.csv
    const [kmlResponse, shpResponse] = await Promise.allSettled([
      fetch('/kml.csv'),
      fetch('/shp.csv')
    ])

    let kmlLoaded = false
    let shpLoaded = false
    let totalPoints = 0

    // 处理kml.csv文件
    if (kmlResponse.status === 'fulfilled' && kmlResponse.value.ok) {
      const csvText = await kmlResponse.value.text()
      const blob = new Blob([csvText], { type: 'text/csv' })
      const file = new File([blob], 'kml.csv', { type: 'text/csv' })

      // 使用现有的文件处理逻辑
      await handleFileSelected(file)
      kmlLoaded = true
      totalPoints += currentCoordinates.value.length
      console.log('成功加载kml.csv文件')
    } else {
      console.warn('加载kml.csv文件失败')
    }

    // 处理shp.csv文件
    if (shpResponse.status === 'fulfilled' && shpResponse.value.ok) {
      const csvText = await shpResponse.value.text()
      const jsonData = parseShpCsvToJson(csvText)

      // 保存JSON数据到响应式变量
      shpJsonData.value = jsonData

      // 提取X,Y坐标并转换为地图坐标
      const coordinates = jsonData.map(item => [parseFloat(item.X), parseFloat(item.Y)])
      shpCoordinates.value = coordinates

      shpLoaded = true
      totalPoints += coordinates.length
      console.log(`成功加载shp.csv文件，共${coordinates.length}个坐标点`)
    } else {
      console.warn('加载shp.csv文件失败')
    }

    // 更新统计信息
    updateCombinedStats()

    // 清除加载信息
    infoMessage.value = ''

    // 显示成功消息
    let successMsg = '数据加载完成！'
    if (kmlLoaded && shpLoaded) {
      successMsg = `KML和SHP数据加载成功！共提取${totalPoints}个数据点`
    } else if (kmlLoaded) {
      successMsg = `KML数据加载成功！共提取${currentCoordinates.value.length}个数据点`
    } else if (shpLoaded) {
      successMsg = `SHP数据加载成功！共提取${shpCoordinates.value.length}个数据点`
    }

    if (kmlLoaded || shpLoaded) {
      successMessage.value = successMsg
    } else {
      infoMessage.value = '无法加载默认数据，请手动上传CSV文件'
    }

  } catch (error) {
    console.error('加载默认文件失败:', error.message)
    infoMessage.value = '无法加载默认数据，请手动上传CSV文件'
  }
}

// 解析shp.csv为JSON格式
const parseShpCsvToJson = (csvText) => {
  const lines = csvText.trim().split('\n')
  const headers = lines[0].split(',').map(h => h.trim())

  const jsonData = []
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim())
    const row = {}
    headers.forEach((header, index) => {
      row[header] = values[index] || ''
    })
    // 添加value字段，默认为null
    row.value = null
    jsonData.push(row)
  }

  return jsonData
}

// 更新综合统计信息
const updateCombinedStats = () => {
  const kmlCount = currentCoordinates.value.length
  const shpCount = shpCoordinates.value.length
  const totalCount = kmlCount + shpCount

  mapStats.value = {
    kmlPointCount: kmlCount,
    shpPointCount: shpCount,
    totalPointCount: totalCount,
    status: 'updated',
    lastUpdate: new Date().toISOString()
  }
}
</script>

<style scoped>
.app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f5f5f5;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-container {
  flex: 1;
  display: flex;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
  padding: 2rem;
  gap: 2rem;
}

.map-stats-section {
  flex: 1;
  display: flex;
  gap: 2rem;
}

.sidebar {
  width: 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.sidebar-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-title::before {
  content: '';
  width: 4px;
  height: 20px;
  background: #667eea;
  border-radius: 2px;
}

.legend-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem;
  background: #f9fafb;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.legend-item:hover {
  background: #f3f4f6;
  transform: translateX(2px);
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.legend-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  flex-wrap: nowrap;
}

.legend-title {
  font-size: 0.875rem;
  color: #1f2937;
  font-weight: 600;
  white-space: nowrap;
}

.legend-desc {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 400;
  white-space: nowrap;
}


.map-section {
  flex: 1;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  min-height: 600px;
}

.stats-section {
  width: 280px;
  flex-shrink: 0;
  max-height: 400px;
}

.stats-panel {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  height: 100%;
  max-height: 400px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.stats-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stats-title::before {
  content: '';
  width: 4px;
  height: 20px;
  background: #667eea;
  border-radius: 2px;
}

.stats-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
}

.stats-status.ready {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
}

.stats-status.updated {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.stats-status.loading {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.stats-status.error {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  animation: pulse 2s infinite;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

.warning-stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  flex: 1;
  overflow-y: auto;
}

.warning-stat-box {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem 0.75rem;
  text-align: center;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.warning-stat-box:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 不同预警级别的颜色 */
.warning-stat-box.black-warning {
  background: #1f2937;
  border-color: #1f2937;
}

.warning-stat-box.black-warning .stat-number,
.warning-stat-box.black-warning .stat-desc {
  color: white;
}

.warning-stat-box.red-warning {
  background: #dc2626;
  border-color: #dc2626;
}

.warning-stat-box.red-warning .stat-number,
.warning-stat-box.red-warning .stat-desc {
  color: white;
}

.warning-stat-box.orange-warning {
  background: #ea580c;
  border-color: #ea580c;
}

.warning-stat-box.orange-warning .stat-number,
.warning-stat-box.orange-warning .stat-desc {
  color: white;
}

.warning-stat-box.yellow-warning {
  background: #ca8a04;
  border-color: #ca8a04;
}

.warning-stat-box.yellow-warning .stat-number,
.warning-stat-box.yellow-warning .stat-desc {
  color: white;
}

.warning-stat-box.blue-warning {
  background: #2563eb;
  border-color: #2563eb;
}

.warning-stat-box.blue-warning .stat-number,
.warning-stat-box.blue-warning .stat-desc {
  color: white;
}

.stat-number {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
  line-height: 1.2;
}

.stat-desc {
  font-size: 0.7rem;
  color: #6b7280;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .main-container {
    flex-direction: column;
    padding: 1rem;
  }

  .sidebar {
    width: 100%;
    order: 2;
  }

  .map-stats-section {
    flex-direction: column;
    order: 1;
  }

  .map-section {
    order: 1;
    min-height: 400px;
  }

  .stats-section {
    width: 100%;
    order: 2;
  }

  .warning-stats-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }

  .warning-stat-box {
    padding: 0.875rem 0.5rem;
  }

  .stat-number {
    font-size: 1.125rem;
  }

  .stat-desc {
    font-size: 0.65rem;
  }
}

@media (max-width: 640px) {
  .main-container {
    padding: 0.5rem;
  }

  .sidebar-section {
    padding: 1rem;
  }

  .section-title {
    font-size: 1rem;
  }

  .map-section {
    min-height: 300px;
  }

  .stats-section {
    width: 100%;
  }

  .stats-panel {
    padding: 1rem;
  }

  .warning-stats-grid {
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }

  .warning-stat-box {
    padding: 0.75rem 0.5rem;
  }

  .stat-number {
    font-size: 1rem;
  }

  .stat-desc {
    font-size: 0.6rem;
  }
}
</style>