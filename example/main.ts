import { createApp, ref, watch, onMounted, nextTick } from 'vue'
import { WatermarkCamera } from '../src/index'
import './style.css'

// 扩展 Window 接口
declare global {
  interface Window {
    cameraRef: any
    takePhoto: () => Promise<void>
    deletePhoto: () => void
    getLocation: () => Promise<void>
    getTime: () => Promise<void>
    checkCameraStatus: () => any
    forceInitCamera: () => boolean
  }
}

// 全局变量
let cameraRef: any = null
let logs: Array<{ time: string; type: string; message: string }> = []

// 添加日志
function addLog(type: string, message: string) {
  logs.unshift({
    time: new Date().toLocaleTimeString(),
    type,
    message
  })
  if (logs.length > 10) {
    logs = logs.slice(0, 10)
  }
  updateLogDisplay()
}

// 更新日志显示
function updateLogDisplay() {
  const container = document.getElementById('log-container')
  if (container) {
    container.innerHTML = logs.map(log => `
      <div class="log-item">
        <span class="log-time">${log.time}</span>
        <span class="log-type">${log.type}</span>
        <span class="log-message">${log.message}</span>
      </div>
    `).join('')
  }
}

// 基本用法
const basicApp = createApp({
  template: `
    <WatermarkCamera 
      v-model="photoUrl"
      name="张三"
      company="某某科技有限公司"
      @upload-success="handleUploadSuccess"
    />
  `,
  setup() {
    const photoUrl = ref('')
    
    const handleUploadSuccess = (data: any) => {
      addLog('上传成功', `上传结果: ${JSON.stringify(data)}`)
    }

    watch(photoUrl, (newVal) => {
      const info = document.getElementById('basic-info')
      if (info) {
        if (newVal) {
          info.textContent = `当前图片: ${newVal.substring(0, 50)}...`
        } else {
          info.textContent = ''
        }
      }
    })

    return {
      photoUrl,
      handleUploadSuccess
    }
  }
})
basicApp.component('WatermarkCamera', WatermarkCamera)
basicApp.mount('#basic-demo')

// 高级配置
const advancedApp = createApp({
  template: `
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
  `,
  setup() {
    const photoUrl = ref('')

    const watermarkConfig = {
      showTime: true,
      showLocation: true,
      showName: true,
      showCompany: true,
      backgroundColor: 'rgba(0,0,0,0.6)',
      textColor: '#ffffff',
      fontSize: 16
    }

    const locationConfig = {
      enableLocation: true,
      locationProvider: 'h5' as const,
      customLocationFn: async () => {
        return { latitude: 39.9, longitude: 116.4, address: '北京市朝阳区' }
      }
    }

    const timeConfig = {
      enableNetworkTime: true,
      networkTimeUrl: 'https://quan.suning.com/getSysTime.do',
      customTimeFn: async () => {
        return new Date().toLocaleString()
      }
    }

    const uploadConfig = {
      enableAutoUpload: true,
      customUploadFn: async (file: File) => {
        addLog('上传', '自定义上传函数被调用')
        return { success: true, url: 'https://example.com/uploaded.jpg' }
      }
    }

    const cameraConfig = {
      enableCamera: true,
      customCameraFn: async () => {
        addLog('相机', '自定义相机函数被调用')
        return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
      }
    }

    const handleLocationSuccess = (location: any) => {
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

    return {
      photoUrl,
      watermarkConfig,
      locationConfig,
      timeConfig,
      uploadConfig,
      cameraConfig,
      handleLocationSuccess,
      handleTimeSuccess,
      handleCameraSuccess,
      handleUploadSuccess
    }
  }
})
advancedApp.component('WatermarkCamera', WatermarkCamera)
advancedApp.mount('#advanced-demo')

// 手动控制
const manualApp = createApp({
  template: `
    <WatermarkCamera 
      ref="cameraRef"
      v-model="photoUrl"
      :upload-config="{ enableAutoUpload: false }"
    />
  `,
  setup() {
    const photoUrl = ref('')
    const cameraRef = ref()
    let initAttempts = 0

    const initCameraRef = () => {
      if (cameraRef.value && typeof cameraRef.value.takePhoto === 'function') {
        window.cameraRef = cameraRef.value
        addLog('系统', '手动控制组件已初始化')
        return true
      }
      return false
    }

    onMounted(() => {
      // 立即尝试初始化
      if (!initCameraRef()) {
        // 如果失败，使用轮询方式
        const interval = setInterval(() => {
          initAttempts++
          if (initCameraRef()) {
            clearInterval(interval)
          } else if (initAttempts > 20) { // 最多尝试20次，约2秒
            clearInterval(interval)
            addLog('系统', '手动控制组件初始化失败')
          }
        }, 100)
      }
    })

    // 监听 cameraRef 变化
    watch(cameraRef, (newVal) => {
      if (newVal && typeof newVal.takePhoto === 'function') {
        window.cameraRef = newVal
        addLog('系统', '手动控制组件已更新')
      }
    })

    return {
      photoUrl,
      cameraRef
    }
  }
})
manualApp.component('WatermarkCamera', WatermarkCamera)
manualApp.mount('#manual-demo')

// 全局方法
window.takePhoto = async () => {
  try {
    // 如果组件未初始化，尝试等待
    if (!window.cameraRef) {
      addLog('手动拍照', '等待组件初始化...')
      
      // 等待最多3秒
      for (let i = 0; i < 30; i++) {
        await new Promise(resolve => setTimeout(resolve, 100))
        if (window.cameraRef && typeof window.cameraRef.takePhoto === 'function') {
          break
        }
      }
      
      if (!window.cameraRef) {
        addLog('手动拍照失败', '相机组件初始化超时，请刷新页面重试')
        return
      }
    }
    
    // 检查组件是否有 takePhoto 方法
    if (typeof window.cameraRef.takePhoto !== 'function') {
      addLog('手动拍照失败', '相机组件方法不可用')
      return
    }
    
    await window.cameraRef.takePhoto()
    addLog('手动拍照', '手动拍照成功')
  } catch (error: any) {
    addLog('手动拍照失败', error.message || '未知错误')
  }
}

window.deletePhoto = () => {
  if (!window.cameraRef) {
    addLog('删除照片失败', '相机组件未初始化，请等待组件加载完成')
    return
  }
  
  if (typeof window.cameraRef.deletePhoto !== 'function') {
    addLog('删除照片失败', '相机组件方法不可用')
    return
  }
  
  window.cameraRef.deletePhoto()
  addLog('删除照片', '照片已删除')
}

window.getLocation = async () => {
  try {
    if (!window.cameraRef) {
      addLog('手动定位失败', '相机组件未初始化，请等待组件加载完成')
      return
    }
    
    if (typeof window.cameraRef.getLocation !== 'function') {
      addLog('手动定位失败', '相机组件方法不可用')
      return
    }
    
    const location = await window.cameraRef.getLocation()
    addLog('手动定位', `定位结果: ${JSON.stringify(location)}`)
  } catch (error: any) {
    addLog('手动定位失败', error.message || '未知错误')
  }
}

window.getTime = async () => {
  try {
    if (!window.cameraRef) {
      addLog('手动获取时间失败', '相机组件未初始化，请等待组件加载完成')
      return
    }
    
    if (typeof window.cameraRef.getNetworkTime !== 'function') {
      addLog('手动获取时间失败', '相机组件方法不可用')
      return
    }
    
    const time = await window.cameraRef.getNetworkTime()
    addLog('手动获取时间', `时间: ${time}`)
  } catch (error: any) {
    addLog('手动获取时间失败', error.message || '未知错误')
  }
}

// 添加调试函数
window.checkCameraStatus = () => {
  const status = {
    cameraRef: !!window.cameraRef,
    cameraRefType: typeof window.cameraRef,
    hasTakePhoto: typeof window.cameraRef?.takePhoto === 'function',
    hasDeletePhoto: typeof window.cameraRef?.deletePhoto === 'function',
    hasGetLocation: typeof window.cameraRef?.getLocation === 'function',
    hasGetNetworkTime: typeof window.cameraRef?.getNetworkTime === 'function',
    availableMethods: window.cameraRef ? Object.keys(window.cameraRef).filter(key => typeof window.cameraRef[key] === 'function') : []
  }
  console.log('相机组件状态:', status)
  addLog('调试', `组件状态: ${JSON.stringify(status)}`)
  return status
}

// 添加强制初始化函数
window.forceInitCamera = () => {
  const manualDemo = document.querySelector('#manual-demo')
  if (manualDemo && (manualDemo as any).__vueParentComponent) {
    const instance = (manualDemo as any).__vueParentComponent.ctx
    if (instance && instance.cameraRef) {
      window.cameraRef = instance.cameraRef
      addLog('调试', '强制初始化相机组件')
      return true
    }
  }
  addLog('调试', '强制初始化失败')
  return false
}

// 初始化日志
addLog('系统', '组件加载完成，可以开始测试')
addLog('系统', '可以在控制台使用以下命令调试:')
addLog('系统', '- checkCameraStatus() - 检查组件状态')
addLog('系统', '- forceInitCamera() - 强制初始化组件') 