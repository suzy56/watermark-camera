<template>
  <div class="app">
    <h1>WatermarkCamera 组件示例</h1>
    
    <div class="demo-section">
      <h2>基本用法</h2>
      <WatermarkCamera 
        v-model="photoUrl"
        name="张三"
        company="某某科技有限公司啊哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈"
        @upload-success="handleUploadSuccess"
      />
      <p v-if="photoUrl">当前图片: {{ photoUrl.substring(0, 50) }}...</p>
    </div>

    <div class="demo-section">
      <h2>高级配置</h2>
      <WatermarkCamera 
        v-model="photoUrl2"
        amap-key="替换你的高德key" 
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

    <div class="demo-section">
      <h2>手动控制</h2>
      <WatermarkCamera 
        ref="cameraRef"
        v-model="photoUrl3"
        :upload-config="{ enableAutoUpload: false }"
      />
      <div class="button-group">
        <button @click="takePhoto">手动拍照</button>
        <button @click="deletePhoto">删除照片</button>
        <button @click="getLocation">获取定位</button>
        <button @click="getTime">获取时间</button>
      </div>
    </div>

    <div class="demo-section">
      <h2>事件日志</h2>
      <div class="log-container">
        <div v-for="(log, index) in logs" :key="index" class="log-item">
          <span class="log-time">{{ log.time }}</span>
          <span class="log-type">{{ log.type }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { WatermarkCamera } from '../src/index'
import type { LocationResult } from '../src/types'

const photoUrl = ref('')
const photoUrl2 = ref('')
const photoUrl3 = ref('')
const cameraRef = ref()
const logs = ref<Array<{ time: string; type: string; message: string }>>([])

// 添加日志
function addLog(type: string, message: string) {
  logs.value.unshift({
    time: new Date().toLocaleTimeString(),
    type,
    message
  })
  if (logs.value.length > 10) {
    logs.value = logs.value.slice(0, 10)
  }
}

// 水印配置
const watermarkConfig = {
  showTime: true,
  showLocation: true,
  showName: true,
  showCompany: false,
  backgroundColor: 'rgba(0,0,0,0.6)',
  textColor: '#ffffff',
  fontSize: 14,
  height: 120
}

// 定位配置
const locationConfig = {
  enableLocation: true,
  locationProvider: 'h5' as const,
  customLocationFn: async (): Promise<LocationResult> => {
    // 模拟自定义定位
    return { latitude: 39.9, longitude: 116.4, address: '北京市朝阳区' }
  }
}

// 时间配置
const timeConfig = {
  enableNetworkTime: true,
  networkTimeUrl: 'https://quan.suning.com/getSysTime.do',
  customTimeFn: async (): Promise<string> => {
    // 模拟自定义时间获取
    return new Date().toLocaleString()
  }
}

// 上传配置
const uploadConfig = {
  enableAutoUpload: true,
  customUploadFn: async (file: File) => {
    // 模拟自定义上传
    addLog('上传', '自定义上传函数被调用')
    return { success: true, url: 'https://example.com/uploaded.jpg' }
  }
}

// 相机配置
const cameraConfig = {
  enableCamera: true,
  customCameraFn: async (): Promise<string> => {
    // 模拟自定义相机
    addLog('相机', '自定义相机函数被调用')
    return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
  }
}

// 事件处理
const handleLocationSuccess = (location: LocationResult) => {
  addLog('定位成功', `纬度: ${location.latitude}, 经度: ${location.longitude}, 地址: ${location.address}`)
}

const handleTimeSuccess = (time: string) => {
  addLog('时间成功', `获取到时间: ${time}`)
}

const handleCameraSuccess = (filePath: string) => {
  addLog('相机成功', `拍照成功，文件大小: ${filePath.length} 字符`)
}

const handleUploadSuccess = (data: any) => {
  addLog('上传成功', `上传结果: ${JSON.stringify(data)}`)
}

// 手动控制方法
const takePhoto = async () => {
  try {
    if (!cameraRef.value) {
      addLog('手动拍照失败', '相机组件未初始化')
      return
    }
    
    if (typeof cameraRef.value.takePhoto !== 'function') {
      addLog('手动拍照失败', '相机组件方法不可用')
      return
    }
    
    await cameraRef.value.takePhoto()
    addLog('手动拍照', '手动拍照成功')
  } catch (error: any) {
    addLog('手动拍照失败', error.message || '未知错误')
  }
}

const deletePhoto = () => {
  if (!cameraRef.value) {
    addLog('删除照片失败', '相机组件未初始化')
    return
  }
  
  if (typeof cameraRef.value.deletePhoto !== 'function') {
    addLog('删除照片失败', '相机组件方法不可用')
    return
  }
  
  cameraRef.value.deletePhoto()
  addLog('删除照片', '照片已删除')
}

const getLocation = async () => {
  try {
    if (!cameraRef.value) {
      addLog('手动定位失败', '相机组件未初始化')
      return
    }
    
    if (typeof cameraRef.value.getLocation !== 'function') {
      addLog('手动定位失败', '相机组件方法不可用')
      return
    }
    
    const location = await cameraRef.value.getLocation()
    addLog('手动定位', `定位结果: ${JSON.stringify(location)}`)
  } catch (error: any) {
    addLog('手动定位失败', error.message || '未知错误')
  }
}

const getTime = async () => {
  try {
    if (!cameraRef.value) {
      addLog('手动获取时间失败', '相机组件未初始化')
      return
    }
    
    if (typeof cameraRef.value.getNetworkTime !== 'function') {
      addLog('手动获取时间失败', '相机组件方法不可用')
      return
    }
    
    const time = await cameraRef.value.getNetworkTime()
    addLog('手动获取时间', `时间: ${time}`)
  } catch (error: any) {
    addLog('手动获取时间失败', error.message || '未知错误')
  }
}
</script>

<style scoped>
.app {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.demo-section {
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
}

h1 {
  color: #333;
  text-align: center;
}

h2 {
  color: #666;
  margin-bottom: 20px;
}

.button-group {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.button-group button {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.button-group button:hover {
  background: #0056b3;
}

.log-container {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  background: #f8f9fa;
}

.log-item {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
  padding: 4px 0;
  border-bottom: 1px solid #eee;
}

.log-time {
  color: #666;
  font-size: 12px;
  min-width: 80px;
}

.log-type {
  color: #007bff;
  font-weight: bold;
  min-width: 80px;
}

.log-message {
  color: #333;
  flex: 1;
  word-break: break-all;
}
</style> 