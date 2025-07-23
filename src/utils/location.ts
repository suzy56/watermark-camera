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
        const { latitude: gcjLat, longitude: gcjLng } = coordinateTransform.wgs84ToGcj02(latitude, longitude)
        resolve({ latitude: gcjLat, longitude: gcjLng })
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
    xhr.open('GET', `https://restapi.amap.com/v3/geocode/regeo?radius=200&extensions=all&roadlevel=0&key=${key}&location=${lng},${lat}`)
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


/**
 * 坐标转换工具函数
 * WGS-84 转 GCJ-02 (高德地图坐标系)
 */
export const coordinateTransform = {
  /**
   * WGS-84 转 GCJ-02
   * @param wgsLat WGS-84纬度
   * @param wgsLng WGS-84经度
   * @returns { latitude: number, longitude: number } GCJ-02坐标
   */
  wgs84ToGcj02(wgsLat: number, wgsLng: number): { latitude: number, longitude: number } {
    const a = 6378245.0; // 长半轴
    const ee = 0.00669342162296594323; // 偏心率平方
    
    let dLat = this.transformLat(wgsLng - 105.0, wgsLat - 35.0);
    let dLng = this.transformLng(wgsLng - 105.0, wgsLat - 35.0);
    
    const radLat = wgsLat / 180.0 * Math.PI;
    let magic = Math.sin(radLat);
    magic = 1 - ee * magic * magic;
    const sqrtMagic = Math.sqrt(magic);
    
    dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * Math.PI);
    dLng = (dLng * 180.0) / (a / sqrtMagic * Math.cos(radLat) * Math.PI);
    
    const gcjLat = wgsLat + dLat;
    const gcjLng = wgsLng + dLng;
    
    return { latitude: gcjLat, longitude: gcjLng };
  },
  
  /**
   * 转换纬度
   */
  transformLat(x: number, y: number): number {
    let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(y * Math.PI) + 40.0 * Math.sin(y / 3.0 * Math.PI)) * 2.0 / 3.0;
    ret += (160.0 * Math.sin(y / 12.0 * Math.PI) + 320 * Math.sin(y * Math.PI / 30.0)) * 2.0 / 3.0;
    return ret;
  },
  
  /**
   * 转换经度
   */
  transformLng(x: number, y: number): number {
    let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(x * Math.PI) + 40.0 * Math.sin(x / 3.0 * Math.PI)) * 2.0 / 3.0;
    ret += (150.0 * Math.sin(x / 12.0 * Math.PI) + 300.0 * Math.sin(x / 30.0 * Math.PI)) * 2.0 / 3.0;
    return ret;
  }
};