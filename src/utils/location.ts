import type { LocationResult } from '@/types'

// 钉钉 API 类型声明
declare global {
  interface Window {
    dd?: {
      getLocation: (options: {
        targetAccuracy?: string
        cacheTimeout?: number
        coordinate?: string
        useCache?: boolean
        withReGeocode?: boolean
        type?: number
        success?: (res: any) => void
        fail?: (error: any) => void
      }) => void
    }
  }
}

// H5 浏览器定位
export async function getH5Location(): Promise<LocationResult> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('浏览器不支持定位'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        resolve({ latitude, longitude })
      },
      (error) => {
        reject(error)
      },
      { 
        enableHighAccuracy: true, 
        timeout: 8000, 
        maximumAge: 60000 
      }
    )
  })
}

// 钉钉定位
export async function getDingTalkLocation(): Promise<LocationResult> {
  return new Promise((resolve, reject) => {
    // 检查是否在钉钉环境
    if (typeof window.dd === 'undefined') {
      reject(new Error('钉钉 JSAPI 未加载'))
      return
    }

    window.dd!.getLocation({
      targetAccuracy: '200',
      cacheTimeout: 20,
      coordinate: '1',
      useCache: true,
      withReGeocode: true,
      type: 1,
      success: (res: any) => {
        const { address, latitude, longitude } = res
        resolve({ latitude, longitude, address })
      },
      fail: (error: any) => {
        reject(error)
      }
    })
  })
}

// 高德地图逆地理编码
export async function getAmapAddress(lat: number, lng: number, key: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', `https://restapi.amap.com/v3/geocode/regeo?key=${key}&location=${lng},${lat}`)
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText)
        if (data && data.regeocode) {
          resolve(data.regeocode.formatted_address)
        } else {
          resolve('')
        }
      } catch (error) {
        reject(error)
      }
    }
    xhr.onerror = () => reject(new Error('网络请求失败'))
    xhr.send()
  })
}

// 检测平台
export function detectPlatform(): 'dingtalk' | 'wechat' | 'alipay' | 'browser' {
  if (typeof navigator === 'undefined') return 'browser'
  
  const userAgent = navigator.userAgent.toLowerCase()
  if (userAgent.includes('dingtalk')) return 'dingtalk'
  if (userAgent.includes('micromessenger')) return 'wechat'
  if (userAgent.includes('alipay')) return 'alipay'
  return 'browser'
} 