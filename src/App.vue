<template>
  <n-config-provider :theme="darkTheme" :locale="zhCN" :date-locale="dateZhCN">
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
                  <span class="legend-desc">（1级）- 0-0.5m</span>
                </div>
              </div>
              <div class="legend-item">
                <div class="legend-color" style="background: #ffffff; border: 1px solid #e5e7eb;"></div>
                <div class="legend-content">
                  <span class="legend-title">无预警</span>
                  <span class="legend-desc">（0级）- 0m以下</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- 地图和统计区域 -->
        <div class="map-stats-section">
          <!-- 地图区域 -->
          <div class="map-section">
            <MapViewer ref="mapViewer" :coordinates="currentCoordinates" :shp-coordinates="shpCoordinates"
              :shp-data="shpJsonData" :map-stats="mapStats" :current-time-index="currentTimeIndex"
              :time-columns="timeColumns" @map-ready="handleMapReady" @point-clicked="handlePointClicked" />

            <!-- 悬浮播放卡片 -->
            <div class="floating-player-card">
              <div class="player-content">
                <!-- 时间信息 -->
                <div class="time-info">
                  <div class="time-label">时间节点</div>
                  <div class="current-time-display">{{ currentTimeDisplay }}</div>
                </div>

                <!-- 播放控制按钮 -->
                <div class="player-controls-right">
                  <button class="player-btn prev-btn" :disabled="isPrevDisabled" @click="handlePrevClick">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                    </svg>
                  </button>
                  <button class="player-btn play-pause-btn" :disabled="isPlayerControlsDisabled"
                    @click="handlePlayPauseClick">
                    <svg v-if="!isPlaying" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                  </button>
                  <button class="player-btn next-btn" :disabled="isNextDisabled" @click="handleNextClick">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- 可拖动进度条 -->
              <div class="progress-slider">
                <n-slider v-model:value="currentTimeIndex" :min="0" :max="Math.max(0, timeColumns.length - 1)" :step="1"
                  :marks="timeColumnsMarks" :tooltip="false" @update:value="handleSliderChange" />
                <!-- <div class="slider-labels">
                  <span class="slider-start">{{ timeColumns[0] || '未知' }}</span>
                  <span class="slider-end">{{ timeColumns[timeColumns.length - 1] || '未知' }}</span>
                </div> -->
              </div>
            </div>
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
                  <div class="stat-number">{{ uploadedCsvData.length || 0 }}</div>
                  <div class="stat-desc">数据点总数</div>
                </div>

                <div class="warning-stat-box black-warning">
                  <div class="stat-number">{{ mapStats?.warningCounts?.black || 0 }}</div>
                  <div class="stat-desc">黑色预警</div>
                </div>

                <div class="warning-stat-box red-warning">
                  <div class="stat-number">{{ mapStats?.warningCounts?.red || 0 }}</div>
                  <div class="stat-desc">红色预警</div>
                </div>

                <div class="warning-stat-box orange-warning">
                  <div class="stat-number">{{ mapStats?.warningCounts?.orange || 0 }}</div>
                  <div class="stat-desc">橙色预警</div>
                </div>

                <div class="warning-stat-box yellow-warning">
                  <div class="stat-number">{{ mapStats?.warningCounts?.yellow || 0 }}</div>
                  <div class="stat-desc">黄色预警</div>
                </div>

                <div class="warning-stat-box blue-warning">
                  <div class="stat-number">{{ mapStats?.warningCounts?.blue || 0 }}</div>
                  <div class="stat-desc">蓝色预警</div>
                </div>
              </div>
            </div>

            <!-- 站点详情卡片 -->
            <div class="point-detail-section">
              <div class="point-detail-panel">
                <div class="point-detail-header">
                  <h4 class="point-detail-title">站点详情</h4>
                </div>

                <div class="point-detail-content">
                  <!-- 没有数据时显示暂无数据 -->
                  <div v-if="!selectedPoint" class="no-data-message">
                    暂无数据
                  </div>

                  <!-- 有数据时显示详细信息 -->
                  <template v-else>
                    <!-- 站点名称单独显示在顶部 -->
                    <div class="station-name-display">
                      <div class="warning-color-box" :class="getWarningLevelClass(selectedPoint.currentValue)"></div>
                      <div class="station-name-text">{{ selectedPoint.name || '未知站点' }}</div>
                    </div>

                    <div class="detail-grid">
                      <!-- 当前水位 -->
                      <div class="detail-item current-water">
                        <div class="detail-label">当前水位</div>
                        <div class="detail-value">
                          {{ selectedPoint.currentValue !== null ? selectedPoint.currentValue.toFixed(2) + 'm' : '暂无数据'
                          }}
                        </div>
                      </div>

                      <!-- 预警级别 -->
                      <div class="detail-item warning-level-item" v-if="selectedPoint.currentValue !== null">
                        <div class="detail-label">预警级别</div>
                        <div class="warning-level-display" :class="getWarningLevelClass(selectedPoint.currentValue)">
                          {{ getWarningLevelText(selectedPoint.currentValue) }}
                        </div>
                      </div>

                      <!-- 峰值水位 -->
                      <div class="detail-item peak-water" v-if="selectedPoint.peakValue !== null">
                        <div class="detail-label">峰值水位</div>
                        <div class="detail-value">
                          {{ selectedPoint.peakValue.toFixed(2) + 'm' }}
                        </div>
                      </div>

                      <!-- 峰值时间 -->
                      <div class="detail-item peak-time" v-if="selectedPoint.peakTime">
                        <div class="detail-label">峰值时间</div>
                        <div class="detail-value">{{ selectedPoint.peakTime }}</div>
                      </div>
                    </div>
                  </template>
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
  </n-config-provider>
</template>

<script setup>
import { zhCN, dateZhCN } from 'naive-ui'
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { CSVParser } from './utils/csvParser.js'
import AppHeader from './components/AppHeader.vue'
import CsvUploader from './components/CsvUploader.vue'
import MapViewer from './components/MapViewer.vue'
import StatusMessage from './components/StatusMessage.vue'
import { NSlider } from 'naive-ui'

// 响应式变量
const mapViewer = ref(null)
const csvUploader = ref(null)
const isProcessing = ref(false)
const currentCoordinates = ref([])
const currentFile = ref(null)
const mapStats = ref(null)
const shpJsonData = ref([])
const shpCoordinates = ref([])
const uploadedCsvData = ref([]) // 存储上传的CSV数据
const timeColumns = ref([]) // 存储时间列名称
const selectedPoint = ref(null) // 当前选中的站点信息
const currentTimeIndex = ref(0) // 当前时间节点索引（默认为第一个时间节点）
const isPlaying = ref(false) // 播放状态
const playTimer = ref(null) // 播放计时器

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

    // 读取CSV文件内容
    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())

    if (lines.length === 0) {
      throw new Error('CSV文件为空')
    }

    // 解析标题行
    const headers = lines[0].split(',').map(h => h.trim())

    // 检查是否是新的CSV格式 (Name, CEM_No, 时间列...)
    if (headers.length >= 3 && headers[0] === 'Name' && headers[1] === 'CEM_No') {
      // 新格式处理
      infoMessage.value = '正在处理监测数据文件...'

      // 解析数据行
      const dataLines = lines.slice(1)
      const csvData = dataLines.map((line, index) => {
        const values = line.split(',').map(v => v.trim())
        const row = {}
        headers.forEach((header, headerIndex) => {
          row[header] = values[headerIndex] || ''
        })
        return { id: index + 1, ...row }
      })

      // 存储CSV数据和时间列
      uploadedCsvData.value = csvData
      timeColumns.value = headers.slice(2) // CEM_No后面的列都是时间列

      // 将第一列时间数据匹配到SHP数据
      await matchCsvDataToShp(csvData, headers[2]) // 使用第一个时间列

      // 更新综合统计信息
      updateCombinedStats()

      // 更新处理信息
      const processTime = Date.now() - processingStartTime
      mapStats.value = {
        ...mapStats.value, // 保留updateCombinedStats中的统计数据
        fileName: file.name,
        dataRowCount: csvData.length,
        timeColumnCount: timeColumns.value.length,
        matchedPoints: shpJsonData.value.filter(item => item.value !== null).length,
        processTime: processTime,
        lastUpdate: new Date().toISOString()
      }

      successMessage.value = `监测数据文件处理成功！共${csvData.length}条记录，${timeColumns.value.length}个时间点，成功匹配${mapStats.value.matchedPoints}个检测点`

    } else {
      throw new Error('文件格式不正确。CSV文件必须包含Name、CEM_No字段，以及至少一个时间数据列。请检查文件格式后重新上传。')
    }

  } catch (error) {
    errorMessage.value = error.message
    mapStats.value = null
    currentCoordinates.value = []
  } finally {
    isProcessing.value = false
    infoMessage.value = ''
  }
}

// 处理KML格式文件
const handleKmlFile = async (file, processingStartTime) => {
  // 使用CSV解析器处理KML格式文件
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
}

// 将CSV数据与SHP数据按CEM_No匹配
const matchCsvDataToShp = async (csvData, timeColumnName) => {
  if (!shpJsonData.value.length || !csvData.length) {
    console.warn('SHP数据或CSV数据为空，无法匹配')
    return
  }

  // 创建CEM_No到CSV数据的映射
  const csvMap = new Map()
  csvData.forEach(row => {
    if (row.CEM_No) {
      csvMap.set(row.CEM_No, row[timeColumnName])
    }
  })

  // 更新SHP数据的value字段
  let matchedCount = 0
  shpJsonData.value.forEach(shpItem => {
    if (shpItem.CEM_No && csvMap.has(shpItem.CEM_No)) {
      const value = csvMap.get(shpItem.CEM_No)
      const numValue = parseFloat(value)
      shpItem.value = isNaN(numValue) ? null : numValue
      if (shpItem.value !== null) {
        matchedCount++
      }
    } else {
      shpItem.value = null
    }
  })

  console.log(`成功匹配 ${matchedCount} 个检测点的数据`)

  // 更新综合统计信息
  updateCombinedStats()
}

// 计算站点的峰值水位和峰值时间
const calculatePeakValues = (cemNo) => {
  if (!uploadedCsvData.value.length || !cemNo) {
    return { peakValue: null, peakTime: null }
  }

  let peakValue = -Infinity
  let peakTime = null

  // 查找对应CEM_No的数据
  const csvRow = uploadedCsvData.value.find(row => row.CEM_No === cemNo)
  if (!csvRow) {
    return { peakValue: null, peakTime: null }
  }

  // 遍历所有时间列，找到最大值
  timeColumns.value.forEach(timeColumn => {
    const value = parseFloat(csvRow[timeColumn])
    if (!isNaN(value) && value > peakValue) {
      peakValue = value
      peakTime = timeColumn
    }
  })

  return {
    peakValue: peakValue === -Infinity ? null : peakValue,
    peakTime: peakTime
  }
}

// 获取预警级别对应的CSS类名
const getWarningLevelClass = (value) => {
  if (value === null || value === undefined) {
    return 'no-data'
  }

  const numValue = parseFloat(value)
  if (numValue >= 2.5) return 'black-warning'
  if (numValue >= 1.5) return 'red-warning'
  if (numValue >= 1.0) return 'orange-warning'
  if (numValue >= 0.5) return 'yellow-warning'
  return 'blue-warning'
}

// 获取预警级别文本
const getWarningLevelText = (value) => {
  if (value === null || value === undefined) {
    return '暂无数据'
  }

  const numValue = parseFloat(value)
  if (numValue >= 2.5) return '黑色预警 (5级)'
  if (numValue >= 1.5) return '红色预警 (4级)'
  if (numValue >= 1.0) return '橙色预警 (3级)'
  if (numValue >= 0.5) return '黄色预警 (2级)'
  return '蓝色预警 (1级)'
}

// 处理地图就绪
const handleMapReady = () => {
  console.log('地图已准备就绪')
  infoMessage.value = '地图加载完成，可以上传CSV文件'
}

// 计算时间列标记
const timeColumnsMarks = computed(() => {
  const marks = {}
  if (timeColumns.value.length > 0) {
    // 在关键位置添加标记
    const step = Math.max(1, Math.floor(timeColumns.value.length / 10))
    timeColumns.value.forEach((time, index) => {
      if (index === 0 || index === timeColumns.value.length - 1 || index % step === 0) {
        marks[index] = time
      }
    })
  }
  return marks
})

// 计算当前时间显示
const currentTimeDisplay = computed(() => {
  if (timeColumns.value.length > 0) {
    return timeColumns.value[currentTimeIndex.value] || ''
  }
  return ''
})

// 计算上一个按钮是否禁用
const isPrevDisabled = computed(() => {
  return !hasCsvData.value || currentTimeIndex.value <= 0 || timeColumns.value.length <= 1
})

// 计算下一个按钮是否禁用
const isNextDisabled = computed(() => {
  return !hasCsvData.value || currentTimeIndex.value >= timeColumns.value.length - 1 || timeColumns.value.length <= 1
})

// 计算是否有CSV数据（用于禁用播放控制）
const hasCsvData = computed(() => {
  return uploadedCsvData.value.length > 0 && timeColumns.value.length > 0
})

// 计算播放控制按钮是否应该禁用
const isPlayerControlsDisabled = computed(() => {
  return !hasCsvData.value
})

// 处理上一个按钮点击
const handlePrevClick = () => {
  // 关闭信息气泡
  if (mapViewer.value && mapViewer.value.closeInfoWindow) {
    mapViewer.value.closeInfoWindow()
  }

  if (currentTimeIndex.value > 0) {
    currentTimeIndex.value--
    // 更新当前时间节点的统计数据
    updateCombinedStats()
    // 更新SHP数据为当前时间节点的值
    updateShpDataForCurrentTime()
  }
}

// 处理下一个按钮点击
const handleNextClick = () => {
  // 关闭信息气泡
  if (mapViewer.value && mapViewer.value.closeInfoWindow) {
    mapViewer.value.closeInfoWindow()
  }

  if (currentTimeIndex.value < timeColumns.value.length - 1) {
    currentTimeIndex.value++
    // 更新当前时间节点的统计数据
    updateCombinedStats()
    // 更新SHP数据为当前时间节点的值
    updateShpDataForCurrentTime()
  }
}

// 处理滑动条变化
const handleSliderChange = (value) => {
  // 关闭信息气泡
  if (mapViewer.value && mapViewer.value.closeInfoWindow) {
    mapViewer.value.closeInfoWindow()
  }

  currentTimeIndex.value = value
  // 更新当前时间节点的统计数据
  updateCombinedStats()
  // 更新SHP数据为当前时间节点的值
  updateShpDataForCurrentTime()
}

// 处理播放/暂停按钮点击
const handlePlayPauseClick = () => {
  // 关闭信息气泡
  if (mapViewer.value && mapViewer.value.closeInfoWindow) {
    mapViewer.value.closeInfoWindow()
  }

  if (isPlaying.value) {
    // 暂停播放
    stopPlayback()
  } else {
    // 开始播放
    startPlayback()
  }
}

// 开始播放
const startPlayback = () => {
  if (!hasCsvData.value || timeColumns.value.length <= 1) {
    return
  }

  isPlaying.value = true

  // 每秒10个时间节点，即每100ms切换一次
  playTimer.value = setInterval(() => {
    // 检查是否到达最后一个时间节点
    if (currentTimeIndex.value >= timeColumns.value.length - 1) {
      // 到达末尾，停止播放并回到初始状态
      stopPlayback(true) // 传递参数表示是播放完毕
      return
    }

    // 移动到下一个时间节点
    currentTimeIndex.value++

    // 更新统计数据
    updateCombinedStats()
    updateShpDataForCurrentTime()
  }, 100) // 100ms = 0.1秒，即每秒10个时间节点
}

// 停止播放
const stopPlayback = (isPlaybackComplete = false) => {
  if (playTimer.value) {
    clearInterval(playTimer.value)
    playTimer.value = null
  }
  isPlaying.value = false

  // 如果是播放完毕，回到初始状态（第一个时间节点）
  if (isPlaybackComplete) {
    currentTimeIndex.value = 0
    // 更新统计数据
    updateCombinedStats()
    updateShpDataForCurrentTime()
  }
}

// 更新SHP数据为当前时间节点的值
const updateShpDataForCurrentTime = () => {
  if (uploadedCsvData.value.length === 0 || timeColumns.value.length === 0) {
    return
  }

  const currentTimeColumn = timeColumns.value[currentTimeIndex.value]

  // 创建CEM_No到CSV数据的映射
  const csvMap = new Map()
  uploadedCsvData.value.forEach(row => {
    if (row.CEM_No) {
      csvMap.set(row.CEM_No, row[currentTimeColumn])
    }
  })

  // 更新SHP数据的value字段
  shpJsonData.value.forEach(shpItem => {
    if (shpItem.CEM_No && csvMap.has(shpItem.CEM_No)) {
      const value = csvMap.get(shpItem.CEM_No)
      const numValue = parseFloat(value)
      shpItem.value = isNaN(numValue) ? null : numValue
    } else {
      shpItem.value = null
    }
  })
}

// 处理圆点点击事件
const handlePointClicked = (pointInfo) => {
  console.log('点击了圆点:', pointInfo)

  const { data, coordinates, index, color } = pointInfo

  if (!data || !data.CEM_No) {
    console.warn('点击的站点没有完整信息')
    return
  }

  // 计算峰值数据
  const peakData = calculatePeakValues(data.CEM_No)

  // 设置选中的站点信息
  selectedPoint.value = {
    index: index,
    cemNo: data.CEM_No,
    name: data.Name || data.NAME || data.CEM_No, // 优先显示Name字段，其次NAME，最后CEM_No
    coordinates: coordinates,
    currentValue: data.value,
    peakValue: peakData.peakValue,
    peakTime: peakData.peakTime,
    color: color
  }

  console.log(`选中站点: ${selectedPoint.value.name}`)
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

// 组件卸载时清理计时器
onUnmounted(() => {
  stopPlayback()
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

    if (kmlResponse.status === 'fulfilled' && kmlResponse.value.ok) {
      const csvText = await kmlResponse.value.text()
      const blob = new Blob([csvText], { type: 'text/csv' })
      const file = new File([blob], 'kml.csv', { type: 'text/csv' })
      await handleKmlFile(file, Date.now)
      // 使用现有的文件处理逻辑
      // await handleFileSelected(file)
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

// 更新当前时间节点的预警统计信息
const updateWarningStatsForCurrentTime = () => {
  const kmlCount = currentCoordinates.value.length
  const shpCount = shpCoordinates.value.length
  const csvCount = uploadedCsvData.value.length

  // 计算各预警级别数量（基于当前时间节点）
  const warningCounts = {
    black: 0,    // 5级 - 2.5m以上
    red: 0,      // 4级 - 1.5-2.5m
    orange: 0,   // 3级 - 1.0-1.5m
    yellow: 0,   // 2级 - 0.5-1.0m
    blue: 0,     // 1级 - 0-0.5m
    white: 0     // 0级 - 0m以下（无预警）
  }

  let valueCount = 0

  // 如果有时间数据，基于当前时间节点计算预警级别
  if (uploadedCsvData.value.length > 0 && timeColumns.value.length > 0) {
    const currentTimeColumn = timeColumns.value[currentTimeIndex.value] || timeColumns.value[0]

    uploadedCsvData.value.forEach(row => {
      if (row[currentTimeColumn] && row[currentTimeColumn].trim() !== '') {
        const value = parseFloat(row[currentTimeColumn])
        if (!isNaN(value)) {
          valueCount++
          if (value >= 2.5) {
            warningCounts.black++
          } else if (value >= 1.5) {
            warningCounts.red++
          } else if (value >= 1.0) {
            warningCounts.orange++
          } else if (value >= 0.5) {
            warningCounts.yellow++
          } else if (value >= 0) {
            warningCounts.blue++
          } else {
            warningCounts.white++
          }
        }
      }
    })
  }

  // 调试信息
  console.log('当前时间节点预警统计:', {
    currentTimeIndex: currentTimeIndex.value,
    currentTimeColumn: timeColumns.value[currentTimeIndex.value],
    warningCounts: warningCounts,
    valueCount: valueCount
  })

  return {
    warningCounts: warningCounts,
    valueCount: valueCount
  }
}

// 更新综合统计信息
const updateCombinedStats = () => {
  const kmlCount = currentCoordinates.value.length
  const shpCount = shpCoordinates.value.length
  const csvCount = uploadedCsvData.value.length
  const totalCount = kmlCount + shpCount

  // 获取当前时间节点的预警统计
  const currentWarningStats = updateWarningStatsForCurrentTime()
  // debugger
  mapStats.value = {
    ...mapStats.value, // 保留其他已有属性
    kmlPointCount: kmlCount,
    shpPointCount: shpCount,
    totalPointCount: totalCount,
    csvDataCount: csvCount,
    dataPointCount: currentWarningStats.valueCount, // 当前时间节点有数据的点数
    warningCounts: currentWarningStats.warningCounts,
    status: 'updated',
    lastUpdate: new Date().toISOString(),
    currentTimeIndex: currentTimeIndex.value,

  }
  console.log(mapStats.value)
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
  width: 260px;
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
  position: relative;
}

/* 悬浮播放卡片样式 */
.floating-player-card {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  padding: 0.75rem 2rem 2.5rem 2rem;
  z-index: 1000;
  min-width: 500px;
  width: auto;
}

.player-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.time-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.time-label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

.current-time-display {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
}

.player-controls-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.player-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: #f3f4f6;
  border-radius: 8px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.player-btn.prev-btn,
.player-btn.next-btn,
.player-btn.play-pause-btn {
  width: 38px;
  height: 38px;
}

.player-btn:hover:not(:disabled) {
  background: #e5e7eb;
  color: #374151;
  transform: translateY(-1px);
}

.player-btn:active:not(:disabled) {
  transform: translateY(0);
}

.player-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.play-pause-btn:hover:not(:disabled) {
  background: #dcfce7;
  color: #16a34a;
}

.prev-btn:hover:not(:disabled),
.next-btn:hover:not(:disabled) {
  background: #ede9fe;
  color: #7c3aed;
}

/* 进度条样式 */
.progress-slider {
  width: 100%;
  padding: 0.25rem 0;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
  margin-top: 0.25rem;
}

/* 覆盖n-slider样式以适应深色主题 */
.floating-player-card :deep(.n-slider) {
  --n-rail-color: #e5e7eb;
  --n-handle-color: #3b82f6;
  --n-fill-color: #3b82f6;
}

.floating-player-card :deep(.n-slider-rail) {
  height: 4px;
  border-radius: 2px;
}

.floating-player-card :deep(.n-slider-handle) {
  width: 14px;
  height: 14px;
  border: 3px solid #3b82f6;
  background: white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.floating-player-card :deep(.n-slider-handle:hover) {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.stats-section {
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
}

.stats-panel {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  height: 350px;
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
  overflow: hidden;
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

.warning-stat-box.white-warning {
  background: #ffffff;
  border-color: #e5e7eb;
  border: 1px solid #e5e7eb;
}

.warning-stat-box.white-warning .stat-number,
.warning-stat-box.white-warning .stat-desc {
  color: #1f2937;
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

/* 站点详情卡片样式 */
.point-detail-section {
  width: 100%;
  flex: 1;
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
}

.point-detail-panel {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.point-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.point-detail-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.point-detail-title::before {
  content: '';
  width: 4px;
  height: 20px;
  background: #10b981;
  border-radius: 2px;
}

.point-detail-content {
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
}

.no-data-message {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: #9ca3af;
  font-size: 1rem;
  font-style: italic;
  text-align: center;
  background: #f9fafb;
  border-radius: 8px;
  border: 2px dashed #e5e7eb;
}

.station-name-display {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f3f4f6;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.warning-color-box {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  flex-shrink: 0;
  background: #9ca3af;
  /* 默认灰色 */
}

.warning-color-box.black-warning {
  background: #1f2937;
}

.warning-color-box.red-warning {
  background: #dc2626;
}

.warning-color-box.orange-warning {
  background: #ea580c;
}

.warning-color-box.yellow-warning {
  background: #ca8a04;
}

.warning-color-box.blue-warning {
  background: #2563eb;
}

.warning-color-box.white-warning {
  background: #ffffff;
  border: 1px solid #e5e7eb;
}

.station-name-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  flex: 1;
}

.detail-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.5rem 0.75rem;
  background: #f9fafb;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.detail-item:hover {
  background: #f3f4f6;
}

.warning-level-display {
  font-size: 1rem;
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  text-align: center;
}

.detail-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 600;
  flex-shrink: 0;
  min-width: 80px;
}

.detail-value {
  font-size: 1rem;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.2;
  text-align: right;
}

/* 确保所有值都是黑色，覆盖之前的预警颜色样式 */
.detail-value.black-warning,
.detail-value.red-warning,
.detail-value.orange-warning,
.detail-value.yellow-warning,
.detail-value.blue-warning {
  color: #1f2937 !important;
  background: transparent !important;
  padding: 0 !important;
}


/* 预警级别的颜色样式 */
.detail-value.black-warning,
.warning-level.black-warning {
  color: #1f2937 !important;
  background: rgba(31, 41, 55, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  display: inline-block;
}

.detail-value.red-warning,
.warning-level.red-warning {
  color: #dc2626 !important;
  background: rgba(220, 38, 38, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  display: inline-block;
}

.detail-value.orange-warning,
.warning-level.orange-warning {
  color: #ea580c !important;
  background: rgba(234, 88, 12, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  display: inline-block;
}

.detail-value.yellow-warning,
.warning-level.yellow-warning {
  color: #ca8a04 !important;
  background: rgba(202, 138, 4, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  display: inline-block;
}

.detail-value.blue-warning,
.warning-level.blue-warning {
  color: #2563eb !important;
  background: rgba(37, 99, 235, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  display: inline-block;
}

.detail-value.no-data {
  color: #9ca3af !important;
  font-weight: 500;
  font-style: italic;
}

.warning-level {
  font-size: 0.875rem;
  font-weight: 600;
  margin-top: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  display: inline-block;
  text-align: left;
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

  .detail-grid {
    grid-template-columns: 1fr;
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