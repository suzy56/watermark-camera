#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// 颜色输出
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function error(message) {
  log(`❌ ${message}`, 'red')
  process.exit(1)
}

function success(message) {
  log(`✅ ${message}`, 'green')
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue')
}

function warn(message) {
  log(`⚠️  ${message}`, 'yellow')
}

// 获取当前版本
function getCurrentVersion() {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  return packageJson.version
}

// 更新版本
function updateVersion(type) {
  const currentVersion = getCurrentVersion()
  const [major, minor, patch] = currentVersion.split('.').map(Number)
  
  let newVersion
  switch (type) {
    case 'major':
      newVersion = `${major + 1}.0.0`
      break
    case 'minor':
      newVersion = `${major}.${minor + 1}.0`
      break
    case 'patch':
      newVersion = `${major}.${minor}.${patch + 1}`
      break
    default:
      error('版本类型必须是 major、minor 或 patch')
  }
  
  // 更新 package.json
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  packageJson.version = newVersion
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2))
  
  return newVersion
}

// 检查工作目录是否干净
function checkWorkingDirectory() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' })
    if (status.trim()) {
      error('工作目录不干净，请先提交或暂存更改')
    }
  } catch (error) {
    error('无法检查 git 状态')
  }
}

// 检查是否在正确的分支
function checkBranch() {
  try {
    const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim()
    if (branch !== 'main' && branch !== 'master') {
      warn(`当前分支是 ${branch}，建议在 main 分支上发布`)
    }
  } catch (error) {
    warn('无法检查当前分支')
  }
}

// 主函数
function main() {
  const args = process.argv.slice(2)
  const type = args[0]
  
  if (!type || !['major', 'minor', 'patch'].includes(type)) {
    console.log('使用方法: node scripts/release.js <major|minor|patch>')
    console.log('')
    console.log('参数:')
    console.log('  major  - 主版本更新 (1.0.0 -> 2.0.0)')
    console.log('  minor  - 次版本更新 (1.0.0 -> 1.1.0)')
    console.log('  patch  - 补丁版本更新 (1.0.0 -> 1.0.1)')
    process.exit(1)
  }
  
  log('🚀 开始发布流程...', 'blue')
  
  // 检查环境
  checkWorkingDirectory()
  checkBranch()
  
  // 获取当前版本
  const currentVersion = getCurrentVersion()
  info(`当前版本: ${currentVersion}`)
  
  // 更新版本
  const newVersion = updateVersion(type)
  success(`版本已更新: ${currentVersion} -> ${newVersion}`)
  
  // 构建项目
  info('构建项目...')
  try {
    execSync('npm run build:lib', { stdio: 'inherit' })
    success('构建完成')
  } catch (error) {
    error('构建失败')
  }
  
  // 提交更改
  info('提交更改...')
  try {
    execSync('git add .', { stdio: 'inherit' })
    execSync(`git commit -m "chore: release v${newVersion}"`, { stdio: 'inherit' })
    success('更改已提交')
  } catch (error) {
    error('提交失败')
  }
  
  // 创建标签
  info('创建版本标签...')
  try {
    execSync(`git tag v${newVersion}`, { stdio: 'inherit' })
    success(`标签 v${newVersion} 已创建`)
  } catch (error) {
    error('创建标签失败')
  }
  
  // 推送代码和标签
  info('推送代码和标签...')
  try {
    execSync('git push origin HEAD', { stdio: 'inherit' })
    execSync(`git push origin v${newVersion}`, { stdio: 'inherit' })
    success('代码和标签已推送')
  } catch (error) {
    error('推送失败')
  }
  
  success(`🎉 发布流程完成！版本 v${newVersion} 已推送`)
  info('GitHub Actions 将自动构建并发布到 npm')
  info(`查看发布状态: https://github.com/${process.env.GITHUB_REPOSITORY || 'your-repo'}/actions`)
}

main() 