export interface WatermarkInfo {
  address: string
  time: string
  lat: number
  lng: number
  name?: string
  company?: string
}

export interface LocationResult {
  latitude: number
  longitude: number
  address?: string
}

export interface WatermarkCameraProps {
  modelValue?: string
  name?: string
  company?: string
  action?: string
  // 配置项
  amapKey?: string
  watermarkConfig?: {
    showTime?: boolean
    showLocation?: boolean
    showName?: boolean
    showCompany?: boolean
    backgroundColor?: string
    textColor?: string
    fontSize?: number
  }
  // 定位配置
  locationConfig?: {
    enableLocation?: boolean
    locationProvider?: 'h5' | 'dingtalk' | 'custom'
    customLocationFn?: () => Promise<LocationResult>
  }
  // 时间配置
  timeConfig?: {
    enableNetworkTime?: boolean
    networkTimeUrl?: string
    customTimeFn?: () => Promise<string>
  }
  // 上传配置
  uploadConfig?: {
    enableAutoUpload?: boolean
    customUploadFn?: (file: File) => Promise<any>
  }
  // 相机配置
  cameraConfig?: {
    enableCamera?: boolean
    customCameraFn?: () => Promise<string>
  }
}

export interface WatermarkCameraEmits {
  'update:modelValue': [value: string]
  'upload-success': [data: any]
  'location-success': [location: LocationResult]
  'location-error': [error: any]
  'time-success': [time: string]
  'time-error': [error: any]
  'camera-success': [filePath: string]
  'camera-error': [error: any]
}

export interface WatermarkCameraExpose {
  takePhoto: () => Promise<void>
  deletePhoto: () => void
  getLocation: () => Promise<LocationResult>
  getNetworkTime: () => Promise<string>
} 