<template>
  <div class="watermark-camera">
    <!-- 相机按钮 -->
    <div v-if="!watermarkedPhoto" class="camera-btn-group">
      <button class="camera-btn" @click="onTakePhoto('environment')">
        <span class="camera-icon"></span>
      </button>
    </div>

    <!-- 缩略图和删除 -->
    <div v-else class="photo-thumb">
      <img :src="watermarkedPhoto" class="thumb-img" @click="showModal = true" />
      <span class="delete-btn" @click="onDelete">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <line x1="6" y1="6" x2="18" y2="18" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
          <line x1="18" y1="6" x2="6" y2="18" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </span>
    </div>

    <!-- 全屏图片模态框 -->
    <teleport to="body">
      <div
        v-if="showModal"
        class="modal-mask"
        @click="showModal = false"

      >
        <div class="close-btn" @click.stop="showModal = false">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <line x1="6" y1="6" x2="18" y2="18" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
            <line x1="18" y1="6" x2="6" y2="18" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="modal-content">
          <img :src="watermarkedPhoto" class="modal-img-full" />
        </div>
      </div>
    </teleport>


    <!-- Loading遮罩层 -->
    <teleport to="body">
      <div v-if="isLoading" class="loading-mask">
        <div class="loading-content">
          <div class="loading-spinner"></div>
          <div class="loading-text">{{ loadingText }}</div>
        </div>
      </div>
    </teleport>

    <!-- 隐藏canvas用于生成水印，全屏尺寸 -->
    <canvas
      v-if="showCanvas"
      canvas-id="watermarkCanvas"
      id="watermarkCanvas"
      :style="`width:${screenWidth}px; height:${screenHeight}px; position: absolute; left: -9999px; top: -9999px;`"
      type="2d"
    ></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineEmits, defineProps, onMounted, defineExpose } from 'vue'
import { drawWatermark } from '@/utils/watermark'
import { getH5Location, getDingTalkLocation, getAmapAddress, detectPlatform } from '@/utils/location'
import { getNetworkTime, getLocalTime } from '@/utils/time'
import { takePhoto } from '@/utils/camera'
import { uploadFile, base64ToFile } from '@/utils/upload'
import { getViewportInfo } from '@/utils/screen'
import type { 
  WatermarkCameraProps, 
  WatermarkCameraEmits, 
  WatermarkCameraExpose,
  LocationResult 
} from '@/types'

const props = withDefaults(defineProps<WatermarkCameraProps>(), {
  name: '用户',
  company: '公司',
  action: '',
  amapKey: '',
  watermarkConfig: () => ({
    showTime: true,
    showLocation: true,
    showName: true,
    showCompany: true,
    backgroundColor: 'rgba(0,0,0,0.5)',
    textColor: '#fff',
    fontSize: 14,
    height: 110
  }),
  locationConfig: () => ({
    enableLocation: true,
    locationProvider: 'h5'
  }),
  timeConfig: () => ({
    enableNetworkTime: true,
    networkTimeUrl: 'https://quan.suning.com/getSysTime.do'
  }),
  uploadConfig: () => ({
    enableAutoUpload: true
  }),
  cameraConfig: () => ({
    enableCamera: true
  })
})

const emit = defineEmits<WatermarkCameraEmits>()

const isLoading = ref(false) // 添加loading状态
const loadingText = ref('正在处理...') // 添加loading文本状态
const watermarkedPhoto = ref(props.modelValue || '')
const showModal = ref(false)
const platform = ref(detectPlatform())
const showCanvas = ref(false)
const screenInfo = getViewportInfo()
const screenWidth = screenInfo.width
const screenHeight = screenInfo.height

watch(() => props.modelValue, v => watermarkedPhoto.value = v || '')
watch(watermarkedPhoto, v => emit('update:modelValue', v))

watch(showModal, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

// 获取定位信息
async function getLocation(): Promise<LocationResult> {
  try {
    const { locationConfig } = props
    
    if (!locationConfig?.enableLocation) {
      throw new Error('定位功能已禁用')
    }
    
    let location: LocationResult
    
    switch (locationConfig.locationProvider) {
      case 'dingtalk':
        location = await getDingTalkLocation()
        break
      case 'custom':
        if (locationConfig.customLocationFn) {
          location = await locationConfig.customLocationFn()
        } else {
          throw new Error('自定义定位函数未提供')
        }
        break
      case 'h5':
      default:
        location = await getH5Location()
        break
    }
    
    // 如果有高德地图key，获取地址信息
    if (props.amapKey && !location.address) {
      try {
        location.address = await getAmapAddress(location.latitude, location.longitude, props.amapKey)
      } catch (error) {
        console.warn('获取地址信息失败:', error)
        location.address = '位置信息获取失败了，请申请高德地图key，再配置amapKey，啊哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈'
      }
    }
    
    emit('location-success', location)
    return location
  } catch (error) {
    emit('location-error', error)
    throw error
  }
}

// 获取时间信息
async function getTime(): Promise<string> {
  try {
    const { timeConfig } = props
    
    let time: string
    
    if (timeConfig?.enableNetworkTime && timeConfig.customTimeFn) {
      time = await timeConfig.customTimeFn()
    } else if (timeConfig?.enableNetworkTime) {
      time = await getNetworkTime(timeConfig.networkTimeUrl)
    } else {
      time = getLocalTime()
    }
    
    emit('time-success', time)
    return time
  } catch (error) {
    emit('time-error', error)
    return getLocalTime()
  }
}

// 拍照（支持前后摄像头）
async function onTakePhoto(facingMode: 'user' | 'environment') {
  try {
    // 检查相机权限（input+capture 方案下通常不需要，但保留）
    // const hasPermission = await checkCameraPermission()
    // if (!hasPermission) {
    //   alert('请允许相机权限')
    //   return
    // }
    
    // 拍照
    const photoPath = await takePhoto({ facingMode })
    showCanvas.value = true
    // 获取定位和时间
    const [location, time] = await Promise.allSettled([
      getLocation(),
      getTime()
    ])
    
    const locationData = location.status === 'fulfilled' ? location.value : { latitude: 0, longitude: 0, address: '位置信息获取失败' }
    const timeData = time.status === 'fulfilled' ? time.value : getLocalTime()
    isLoading.value = true // 开始处理时显示loading
    loadingText.value = '正在处理...' // 设置初始loading文本
    // 生成水印
    const watermarkedPath = await drawWatermark(photoPath, {
      address: locationData.address || '',
      time: timeData,
      lat: locationData.latitude,
      lng: locationData.longitude,
      name: props.name,
      company: props.company
    }, props.watermarkConfig)
    
    watermarkedPhoto.value = watermarkedPath
    showModal.value = true
    
    // 自动上传
    await uploadImage(watermarkedPath)
    
  } catch (error) {
    console.error('拍照失败:', error)
    alert('拍照失败，请重试')
  }
}




// 压缩图片函数，H5下使用canvas压缩
// 默认 H5 下会自动将图片压缩到最大宽高 1280px、质量 0.7 后再上传，能有效减小文件体积。
function compressImage(file: File | Blob, quality: number = 0.7, maxWidth: number = 1280, maxHeight: number = 1280): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.onload = () => {
      let { width, height } = img
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = width * ratio
        height = height * ratio
      }
      canvas.width = width
      canvas.height = height
      ctx?.drawImage(img, 0, 0, width, height)
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('图片压缩失败'))
        }
      }, 'image/jpeg', quality)
    }
    img.onerror = () => reject(new Error('图片加载失败'))
    img.src = URL.createObjectURL(file)
  })
}

// 上传图片
async function uploadImage(filePath: string): Promise<any> {
  try {
    isLoading.value = true // 开始上传时显示loading
    loadingText.value = '正在上传...' // 更新loading文本
    const { uploadConfig, action } = props
    
    if (!uploadConfig?.enableAutoUpload) {
      return null
    }
    
    // 先将 base64 转为 File
    const originalFile = base64ToFile(filePath, `${Date.now()}.jpg`)
    // 压缩图片
    const compressedBlob = await compressImage(originalFile, 0.7, 1280, 1280)
    const compressedFile = new File([compressedBlob], `${Date.now()}.jpg`, { type: 'image/jpeg' })
    
    let result: any
    
    if (uploadConfig.customUploadFn) {
      result = await uploadConfig.customUploadFn(compressedFile)
    } else {
      result = await uploadFile(compressedFile, action)
    }
    
    emit('upload-success', result)
    isLoading.value = false // 上传成功，隐藏loading
    return result
  } catch (error) {
    console.error('上传失败:', error)
    isLoading.value = false // 上传失败，隐藏loading
    return null
  }
}

// 删除照片
function onDelete() {
  watermarkedPhoto.value = ''
  isLoading.value = false // 删除时隐藏loading
  loadingText.value = '' // 清空loading文本
}

// 暴露方法
defineExpose<WatermarkCameraExpose>({
  takePhoto: () => onTakePhoto('environment'),
  deletePhoto: onDelete,
  getLocation,
  getNetworkTime: getTime
})

// 组件挂载时检测平台
onMounted(() => {
  platform.value = detectPlatform()
})
</script>

<style scoped>
.watermark-camera {
  display: inline-block;
}

.camera-btn-group {
  display: flex;
  gap: 16px;
}

.camera-btn {
  width: 80px;
  height: 80px;
  background: rgb(247, 248, 250);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(0,0,0,0.04);
  border: none;
  cursor: pointer;
  transition: box-shadow 0.2s;
  position: relative;
}

.camera-btn:active {
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}

.camera-icon {
  display: block;
  width: 28px;
  height: 28px;
  background: url('data:image/png;base64,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') center center no-repeat;
  background-size: contain;
  opacity: 0.5;
  margin-bottom: 4px;
}

.camera-icon.flip {
  transform: scaleX(-1);
}

.camera-label {
  font-size: 12px;
  color: #888;
}

.photo-thumb {
  position: relative;
  display: inline-block;
}

.thumb-img {
  width: 80px; 
  height: 80px; 
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #eee;
  cursor: pointer;
}

.delete-btn {
  position: absolute; 
  top: 4px; 
  right: 4px;
  background: rgba(0,0,0,0.5);
  border-radius: 50%; 
  width: 24px; 
  height: 24px;
  display: flex; 
  align-items: center; 
  justify-content: center;
  cursor: pointer;
}

.modal-mask {
  position: fixed; 
  left: 0; 
  top: 0; 
  right: 0; 
  bottom: 0;
  background: rgba(0,0,0,0.85);
  display: flex; 
  align-items: center; 
  justify-content: center;
  z-index: 9999;
}

.close-btn {
  position: absolute;
  top: 30px;
  right: 10px;
  width: 40px;
  height: 40px;
  background: rgba(0,0,0,0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10000;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background: rgba(0,0,0,0.8);
}

.close-btn:active {
  background: rgba(0,0,0,0.9);
}

.modal-content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.modal-img-full {
  max-width: 96vw;
  max-height: 90vh;
  border-radius: 12px;
  object-fit: contain;
  box-shadow: 0 4px 24px rgba(0,0,0,0.25);
  background: #e25656;
}

/* Loading样式 */
.loading-mask {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10001;
}

.loading-content {
  background: rgba(255,255,255,0.95);
  border-radius: 12px;
  padding: 24px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007aff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

.loading-text {
  color: #333;
  font-size: 14px;
  font-weight: 500;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 