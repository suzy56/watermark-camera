# WatermarkCamera

一个完全解耦的 Vue 3 水印相机组件，支持多种配置和自定义功能。

## ✨ 特性

- 📸 **H5 原生相机** - 使用 HTML5 原生 API
- 🏷️ **可配置水印** - 支持时间、位置、姓名、公司信息自定义显示
- 📍 **多种定位方式** - 支持 H5 定位、钉钉定位、自定义定位
- 🕐 **灵活时间获取** - 支持网络时间、本地时间、自定义时间
- 📤 **可配置上传** - 支持自动上传、自定义上传函数
- 🎨 **样式单位标准化** - 使用 px 单位，替换 rpx
- 🔧 **完全可配置** - 所有功能都可通过配置项控制
- 📱 **跨平台兼容** - 支持 H5、钉钉、微信等环境

## 🚀 安装

```bash
npm install watermark-camera
```

## 🛠️ 开发测试

### 启动开发服务器

```bash
# 使用 npm
npm run dev

# 使用 PowerShell
.\start-dev.ps1

# 使用批处理文件 (Windows)
start-dev.bat
```

### 访问测试页面

- **App.vue 版本** (推荐): https://localhost:3000/example/app.html
- **main.ts 版本**: https://localhost:3000/example/index.html

### 局域网访问

开发服务器支持局域网访问，可以通过以下地址访问：
- 本机: https://localhost:3000

## 📖 使用方法

### 基本用法

```vue
<template>
  <div>
    <WatermarkCamera 
      v-model="photoUrl"
      name="张三"
      company="某某公司"
      @upload-success="handleUploadSuccess"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { WatermarkCamera } from 'watermark-camera'

const photoUrl = ref('')

const handleUploadSuccess = (data) => {
  console.log('上传成功:', data)
}
</script>
```

### 高级配置

```vue
<template>
  <div>
    <WatermarkCamera 
      v-model="photoUrl"
      :watermark-config="watermarkConfig"
      :location-config="locationConfig"
      :time-config="timeConfig"
      :upload-config="uploadConfig"
      :camera-config="cameraConfig"
      @location-success="handleLocationSuccess"
      @time-success="handleTimeSuccess"
      @camera-success="handleCameraSuccess"
      @upload-success="handleUploadSuccess"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { WatermarkCamera } from 'watermark-camera'

const photoUrl = ref('')

// 水印配置
const watermarkConfig = {
  showTime: true,
  showLocation: true,
  showName: true,
  showCompany: true,
  backgroundColor: 'rgba(0,0,0,0.6)',
  textColor: '#ffffff',
  fontSize: 16
}

// 定位配置
const locationConfig = {
  enableLocation: true,
  locationProvider: 'h5', // 'h5' | 'dingtalk' | 'custom'
  customLocationFn: async () => {
    // 自定义定位逻辑
    return { latitude: 39.9, longitude: 116.4, address: '北京市' }
  }
}

// 时间配置
const timeConfig = {
  enableNetworkTime: true,
  networkTimeUrl: 'https://api.example.com/time',
  customTimeFn: async () => {
    // 自定义时间获取逻辑
    return new Date().toLocaleString()
  }
}

// 上传配置
const uploadConfig = {
  enableAutoUpload: true,
  customUploadFn: async (file) => {
    // 自定义上传逻辑
    const formData = new FormData()
    formData.append('file', file)
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
    return response.json()
  }
}

// 相机配置
const cameraConfig = {
  enableCamera: true,
  customCameraFn: async () => {
    // 自定义相机逻辑
    return 'data:image/jpeg;base64,...'
  }
}

const handleLocationSuccess = (location) => {
  console.log('定位成功:', location)
}

const handleTimeSuccess = (time) => {
  console.log('时间获取成功:', time)
}

const handleCameraSuccess = (filePath) => {
  console.log('拍照成功:', filePath)
}

const handleUploadSuccess = (data) => {
  console.log('上传成功:', data)
}
</script>
```

## 📋 Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| modelValue | String | - | 图片 URL，支持 v-model |
| name | String | '用户' | 水印中显示的用户姓名 |
| company | String | '公司' | 水印中显示的公司名称 |
| action | String | 'url' | 图片上传接口地址 |
| amapKey | String | 'xxx' | 高德地图 API Key |
| watermarkConfig | Object | - | 水印配置项 |
| locationConfig | Object | - | 定位配置项 |
| timeConfig | Object | - | 时间配置项 |
| uploadConfig | Object | - | 上传配置项 |
| cameraConfig | Object | - | 相机配置项 |

### watermarkConfig 配置项

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| showTime | Boolean | true | 是否显示时间 |
| showLocation | Boolean | true | 是否显示位置 |
| showName | Boolean | true | 是否显示姓名 |
| showCompany | Boolean | true | 是否显示公司 |
| backgroundColor | String | 'rgba(0,0,0,0.5)' | 水印背景色 |
| textColor | String | '#fff' | 水印文字颜色 |
| fontSize | Number | 14 | 水印字体大小 |
| height | Number | 110 | 水印高度 |

### locationConfig 配置项

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| enableLocation | Boolean | true | 是否启用定位 |
| locationProvider | String | 'h5' | 定位提供者：'h5' \| 'dingtalk' \| 'custom' |
| customLocationFn | Function | - | 自定义定位函数 |

### timeConfig 配置项

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| enableNetworkTime | Boolean | true | 是否启用网络时间 |
| networkTimeUrl | String | '' | 网络时间接口 |
| customTimeFn | Function | - | 自定义时间获取函数 |

### uploadConfig 配置项

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| enableAutoUpload | Boolean | true | 是否启用自动上传 |
| customUploadFn | Function | - | 自定义上传函数 |

### cameraConfig 配置项

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| enableCamera | Boolean | true | 是否启用相机 |
| customCameraFn | Function | - | 自定义相机函数 |

## 📡 Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| update:modelValue | (value: string) | 图片 URL 更新时触发 |
| upload-success | (data: any) | 图片上传成功时触发 |
| location-success | (location: LocationResult) | 定位成功时触发 |
| location-error | (error: any) | 定位失败时触发 |
| time-success | (time: string) | 时间获取成功时触发 |
| time-error | (error: any) | 时间获取失败时触发 |
| camera-success | (filePath: string) | 拍照成功时触发 |
| camera-error | (error: any) | 拍照失败时触发 |

## 🔧 暴露方法

组件暴露以下方法供外部调用：

```vue
<template>
  <WatermarkCamera ref="cameraRef" />
</template>

<script setup>
import { ref } from 'vue'
import { WatermarkCamera } from 'watermark-camera'

const cameraRef = ref()

// 手动拍照
const takePhoto = async () => {
  await cameraRef.value.takePhoto()
}

// 删除照片
const deletePhoto = () => {
  cameraRef.value.deletePhoto()
}

// 获取定位
const getLocation = async () => {
  const location = await cameraRef.value.getLocation()
  console.log('定位结果:', location)
}

// 获取网络时间
const getTime = async () => {
  const time = await cameraRef.value.getNetworkTime()
  console.log('网络时间:', time)
}
</script>
```

## 🎨 样式定制

组件使用 scoped 样式，可以通过以下方式定制：

```vue
<template>
  <WatermarkCamera class="custom-camera" />
</template>

<style>
.custom-camera .camera-btn {
  background: #007bff;
  border-radius: 12px;
}

.custom-camera .camera-icon {
  opacity: 0.8;
}

.custom-camera .thumb-img {
  border-radius: 12px;
  border: 2px solid #007bff;
}
</style>
```

## 🔧 技术特性

### 解耦设计
- **无 uni-app 依赖** - 使用 H5 原生 API
- **模块化架构** - 定位、时间、相机、上传功能独立
- **可配置化** - 所有功能都可通过配置控制

### 定位支持
- **H5 定位** - 使用 `navigator.geolocation` API
- **钉钉定位** - 支持钉钉 JSAPI 定位
- **自定义定位** - 支持自定义定位函数

### 时间获取
- **网络时间** - 支持自定义网络时间接口
- **本地时间** - 作为网络时间失败时的备选
- **自定义时间** - 支持自定义时间获取函数

### 相机功能
- **H5 原生相机** - 使用 `input[type=file]` 调用相机
- **权限检查** - 自动检查相机权限
- **自定义相机** - 支持自定义相机实现

### 上传功能
- **自动上传** - 拍照后自动上传到服务器
- **自定义上传** - 支持自定义上传逻辑
- **错误处理** - 完善的错误处理机制

## 📝 注意事项

1. **权限要求**: 组件需要相机和定位权限
2. **HTTPS 要求**: 在 HTTPS 环境下才能正常使用相机和定位
3. **浏览器兼容**: 需要现代浏览器支持
4. **钉钉环境**: 在钉钉中使用需要配置钉钉 JSAPI

## 🛠️ 开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 类型检查
npm run type-check
```

## 📄 License

MIT 

## 🚀 发布流程

本项目使用 GitHub Actions 进行自动化发布：

1. **推送代码到 GitHub**
2. **创建版本标签**：`git tag v1.0.1 && git push origin v1.0.1`
3. **自动触发发布**：GitHub Actions 会自动构建并发布到 npm

## 🔧 CI/CD 流程

- **CI**: 每次推送到 main/develop 分支时自动运行测试和构建
- **CD**: 推送版本标签时自动发布到 npm 并创建 GitHub Release

## 🎯 贡献

欢迎提交 Issue 和 Pull Request！ 