# 地图标注与CSV路径更新工具

基于Vue3+Vite框架的现代化Web应用，支持上传CSV文件并动态更新地图路径。

## 🚀 功能特性

- **Vue3 Composition API**: 使用最新的Vue3语法和响应式系统
- **Vite构建工具**: 快速的开发服务器和构建体验
- **CSV智能解析**: 自动识别x,y坐标列
- **实时地图更新**: 上传CSV后立即更新地图路径
- **拖拽上传**: 支持文件拖拽上传
- **响应式设计**: 适配不同屏幕尺寸

## 📁 项目结构

```
test/
├── index-vue.html          # Vue应用入口HTML
├── vite.config.js          # Vite配置文件
├── package.json            # 项目依赖配置
├── src/
│   ├── main.js            # Vue应用入口
│   ├── App.vue            # 主应用组件（布局管理）
│   ├── components/        # Vue组件库
│   │   ├── AppHeader.vue   # 页面头部组件
│   │   ├── CsvUploader.vue # CSV上传组件
│   │   ├── MapViewer.vue   # 地图显示组件
│   │   └── StatusMessage.vue # 状态消息组件
│   └── utils/
│       └── csvParser.js   # CSV解析工具类
├── csv-parser.js          # 独立的CSV解析器（兼容原版）
└── index.html             # 原版HTML文件
```

## 🛠️ 开发环境

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:3000 查看应用

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

## 📋 CSV文件格式

支持包含x,y坐标的CSV文件，自动识别以下列名：

**X坐标列**: x, X, longitude, lng, lon, 经度, 经度(x)
**Y坐标列**: y, Y, latitude, lat, 纬度, 纬度(y)

### 示例CSV格式
```csv
x,y
116.395428,39.90773
116.399428,39.90753
116.401628,39.90903
...
```

## 🎯 使用方法

1. **点击上传**: 点击"上传CSV坐标文件"按钮选择文件
2. **拖拽上传**: 直接将CSV文件拖拽到页面
3. **自动解析**: 系统自动识别坐标列并解析数据
4. **实时更新**: 地图路径立即更新，自动调整视野
5. **连续操作**: 支持连续上传多个CSV文件

## ⚡ 技术栈

- **Vue 3.4+**: 渐进式JavaScript框架
- **Vite 5.0+**: 下一代前端构建工具
- **Composition API**: Vue3的组合式API
- **高德地图API**: 地图展示和路径绘制
- **ES6 Modules**: 现代JavaScript模块系统

## 🔧 开发说明

### CSV解析器
- 位置: `src/utils/csvParser.js`
- 支持复杂CSV格式（引号、逗号等）
- 自动识别坐标列
- 确保路径闭合

### 组件结构
- `App.vue`: 主应用组件，包含所有功能
- 使用Composition API进行状态管理
- 响应式数据绑定

### 样式管理
- 使用Vue Scoped CSS
- 响应式设计
- 现代化UI设计

## 🌟 项目特点

- **现代化架构**: Vue3 + Vite + ES6
- **开发体验**: 热重载、快速构建
- **代码组织**: 组件化、模块化
- **用户体验**: 简洁界面、流畅交互
- **性能优化**: 按需加载、响应式更新