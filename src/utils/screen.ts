/**
 * 屏幕尺寸工具函数
 */

export interface ScreenInfo {
  width: number
  height: number
  availWidth: number
  availHeight: number
  pixelRatio: number
  orientation: 'portrait' | 'landscape'
}

/**
 * 获取屏幕信息
 */
export function getScreenInfo(): ScreenInfo {
  const screen = window.screen
  const orientation = screen.width > screen.height ? 'landscape' : 'portrait'
  
  return {
    width: screen.width,
    height: screen.height,
    availWidth: screen.availWidth,
    availHeight: screen.availHeight,
    pixelRatio: window.devicePixelRatio || 1,
    orientation
  }
}

/**
 * 获取视口信息
 */
export function getViewportInfo() {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    clientWidth: document.documentElement.clientWidth,
    clientHeight: document.documentElement.clientHeight
  }
}

/**
 * 获取设备像素比
 */
export function getDevicePixelRatio(): number {
  return window.devicePixelRatio || 1
}

/**
 * 检测是否为移动设备
 */
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

/**
 * 检测是否为高分辨率屏幕
 */
export function isHighDPIScreen(): boolean {
  return getDevicePixelRatio() > 1
} 