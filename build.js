const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🚀 开始构建 watermark-camera 组件...')

try {
  // 清理 dist 目录
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true })
    console.log('✅ 清理 dist 目录')
  }

  // 安装依赖
  console.log('📦 安装依赖...')
  execSync('npm install', { stdio: 'inherit' })

  // 构建组件
  console.log('🔨 构建组件...')
  execSync('npm run build', { stdio: 'inherit' })

  // 生成类型声明文件
  console.log('📝 生成类型声明...')
  execSync('npm run type-check', { stdio: 'inherit' })

  console.log('✅ 构建完成！')
  console.log('📁 输出目录: dist/')
  console.log('📦 可以运行 npm publish 发布到 npm')

} catch (error) {
  console.error('❌ 构建失败:', error.message)
  process.exit(1)
} 