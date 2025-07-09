import type { WatermarkInfo } from '@/types'
import { getViewportInfo } from './screen'

interface WatermarkConfig {
  showTime?: boolean
  showLocation?: boolean
  showName?: boolean
  showCompany?: boolean
  backgroundColor?: string
  textColor?: string
  fontSize?: number
  height?: number
}

/**
 * 生成带水印的图片
 * @param imgPath 原图路径
 * @param info 水印信息
 * @param config 水印配置
 * @returns Promise<string> 生成后的图片路径
 */
export function drawWatermark(
  imgPath: string, 
  info: WatermarkInfo, 
  config: WatermarkConfig = {}
): Promise<string> {
  return new Promise((resolve, reject) => {
    const {
      showTime = true,
      showLocation = true,
      showName = true,
      showCompany = true,
      backgroundColor = 'rgba(0,0,0,0.5)',
      textColor = '#fff',
      fontSize = 14
    } = config

    const name = info.name || '用户'
    const company = info.company || '公司'
    
    // 获取屏幕宽高
    const screenInfo = getViewportInfo()
    const screenWidth = screenInfo.width
    const screenHeight = screenInfo.height
    const dpr = window.devicePixelRatio || 1
    const canvas = document.getElementById('watermarkCanvas') as HTMLCanvasElement
    const ctx = canvas.getContext('2d') || {} as CanvasRenderingContext2D
    canvas.width = screenWidth * dpr
    canvas.height = screenHeight * dpr
    canvas.style.width = screenWidth + 'px'
    canvas.style.height = screenHeight + 'px'
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      // 绘制原图
      ctx.drawImage(img, 0, 0, screenWidth, screenHeight)
      
      // 绘制水印背景
      const barPadding = 16
      const barWidth = screenWidth - barPadding * 2
      const radius = 12
      const barHeight = config.height || 110
      const barY = screenHeight - barHeight - barPadding - 20
      const barX = barPadding
      
      // 绘制圆角矩形背景
      ctx.fillStyle = backgroundColor
      drawRoundRect(ctx, barX, barY, barWidth, barHeight, radius)
      ctx.fill()
      
      // 文字样式
      ctx.fillStyle = textColor
      ctx.textBaseline = 'top'
      let currentY = barY + 26
      
      // 分为左右两块
      const leftBlockWidth = barWidth * 0.4
      const rightBlockWidth = barWidth * 0.6
      const leftX = barX
      const rightX = barX + leftBlockWidth
      
      // 左侧：时间
      if (showTime && info.time) {
        const timeStr = info.time.split(' ')[1]?.slice(0, 5) || ''
        ctx.font = `bold 32px Arial`
        const timeWidth = ctx.measureText(timeStr).width
        const timeX = leftX + (leftBlockWidth - timeWidth) / 2
        ctx.fillText(timeStr, timeX, currentY)
        currentY += 36
        
        const dateStr = info.time.split(' ')[0] || ''
        ctx.font = `bold ${fontSize}px Arial`
        const dateWidth = ctx.measureText(dateStr).width
        const dateX = leftX + (leftBlockWidth - dateWidth) / 2
        ctx.fillText(dateStr, dateX, currentY)
      }
      
      // 分隔线
      ctx.beginPath()
      ctx.moveTo(rightX - 16, barY + 12)
      ctx.lineTo(rightX - 16, barY + barHeight - 12)
      ctx.strokeStyle = textColor
      ctx.lineWidth = 2
      ctx.stroke()
      
      // 右侧信息
      let rightY = barY + 16
      ctx.textAlign = 'left'
      // 姓名
      if (showName) {
        ctx.font = `bold 18px Arial`
        // const nameWidth = ctx.measureText(name).width
        // const nameX = rightX + (rightBlockWidth - nameWidth) / 2
        ctx.fillText(name, rightX + 16, rightY)
        rightY += 24
      }
      // 公司
      if (showCompany) {
        ctx.font = `${fontSize}px Arial`
        let companyStr = company
        const maxWidth = rightBlockWidth - 24
        if (ctx.measureText(companyStr).width > maxWidth) {
          while (ctx.measureText(companyStr + '...').width > maxWidth && companyStr.length > 0) {
            companyStr = companyStr.slice(0, -1)
          }
          companyStr += '...'
        }
        // const companyWidth = ctx.measureText(companyStr).width
        // const companyX = rightX + (rightBlockWidth - companyWidth) / 2
        ctx.fillText(companyStr, rightX, rightY)
        rightY += 20
      }

      // 经纬度
      if (showLocation && info.lat && info.lng) {
        const latLngStr = formatLatLng(info.lat, info.lng)
        ctx.font = `${fontSize}px Arial`
        ctx.fillText(latLngStr, rightX, rightY)
        rightY += 20
      }

      // 地址
      if (showLocation && info.address) {
        ctx.font = `${fontSize}px Arial`
        let addressStr = info.address
        if (addressStr.length > 30) {
          addressStr = addressStr.slice(0, 30) + '...'
        }
        drawTextAutoLine(ctx, addressStr, rightX, rightY, rightBlockWidth - 12, 18, false)
      }
      // 转换为 base64
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
      resolve(dataUrl)
    }
    
    img.onerror = () => reject(new Error('图片加载失败'))
    img.src = imgPath
  })
}

// 自动换行绘制文字，支持居中
function drawTextAutoLine(
  ctx: CanvasRenderingContext2D, 
  text: string, 
  x: number, 
  y: number, 
  maxWidth: number, 
  lineHeight: number,
  center = false
) {
  let line = ''
  for (let i = 0; i < text.length; i++) {
    const testLine = line + text[i]
    const metrics = ctx.measureText(testLine)
    if (metrics.width > maxWidth && i > 0) {
      let drawX = x
      if (center) {
        const lineWidth = ctx.measureText(line).width
        drawX = x + (maxWidth - lineWidth) / 2
      }
      ctx.fillText(line, drawX, y)
      y += lineHeight
      line = text[i]
    } else {
      line = testLine
    }
  }
  let drawX = x
  if (center) {
    const lineWidth = ctx.measureText(line).width
    drawX = x + (maxWidth - lineWidth) / 2
  }
  ctx.fillText(line, drawX, y)
}

// 绘制圆角矩形
function drawRoundRect(
  ctx: CanvasRenderingContext2D, 
  x: number, 
  y: number, 
  w: number, 
  h: number, 
  r: number
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
} 

// 经纬度格式化方法
export function formatLatLng(lat: string | number, lng: string | number) {
  if (!lat || !lng) return '';
  return `${Number(lat).toFixed(6)}°N,${Number(lng).toFixed(6)}°E`;
}