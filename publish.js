const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🚀 准备发布 watermark-camera 组件...')

try {
  // 检查是否已构建
  if (!fs.existsSync('dist')) {
    console.log('📦 未找到 dist 目录，开始构建...')
    execSync('npm run build:lib', { stdio: 'inherit' })
  }

  // 检查 package.json 中的版本
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  console.log(`📋 当前版本: ${packageJson.version}`)

  // 询问是否继续
  const readline = require('readline')
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  rl.question('是否继续发布到 npm? (y/N): ', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      try {
        console.log('📤 发布到 npm...')
        execSync('npm publish', { stdio: 'inherit' })
        console.log('✅ 发布成功！')
      } catch (error) {
        console.error('❌ 发布失败:', error.message)
      }
    } else {
      console.log('❌ 取消发布')
    }
    rl.close()
  })

} catch (error) {
  console.error('❌ 准备发布失败:', error.message)
  process.exit(1)
} 