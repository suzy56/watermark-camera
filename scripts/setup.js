#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const readline = require('readline')

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

function success(message) {
  log(`✅ ${message}`, 'green')
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue')
}

function warn(message) {
  log(`⚠️  ${message}`, 'yellow')
}

function error(message) {
  log(`❌ ${message}`, 'red')
}

// 检查 Git 是否初始化
function checkGit() {
  try {
    execSync('git status', { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

// 检查远程仓库
function checkRemote() {
  try {
    const remote = execSync('git remote get-url origin', { encoding: 'utf8' }).trim()
    return remote
  } catch {
    return null
  }
}

// 获取用户输入
function askQuestion(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer)
    })
  })
}

// 主函数
async function main() {
  console.log('🚀 Watermark Camera 项目设置向导')
  console.log('=' * 50)
  
  // 检查 Git
  if (!checkGit()) {
    error('Git 未初始化，请先运行 git init')
    process.exit(1)
  }
  
  success('Git 已初始化')
  
  // 检查远程仓库
  const remote = checkRemote()
  if (!remote) {
    warn('未检测到远程仓库')
    const repoUrl = await askQuestion('请输入 GitHub 仓库 URL (例如: https://github.com/username/watermark-camera.git): ')
    
    if (repoUrl) {
      try {
        execSync(`git remote add origin ${repoUrl}`, { stdio: 'inherit' })
        success('远程仓库已添加')
      } catch (error) {
        error('添加远程仓库失败')
        process.exit(1)
      }
    }
  } else {
    success(`远程仓库: ${remote}`)
  }
  
  // 检查 package.json
  if (!fs.existsSync('package.json')) {
    error('未找到 package.json 文件')
    process.exit(1)
  }
  
  success('package.json 已存在')
  
  // 检查 GitHub Actions 配置
  const workflowsDir = '.github/workflows'
  if (!fs.existsSync(workflowsDir)) {
    warn('GitHub Actions 配置目录不存在')
    fs.mkdirSync(workflowsDir, { recursive: true })
    success('GitHub Actions 配置目录已创建')
  }
  
  // 检查工作流文件
  const workflowFiles = [
    'ci.yml',
    'publish.yml',
    'version.yml'
  ]
  
  for (const file of workflowFiles) {
    const filePath = `${workflowsDir}/${file}`
    if (!fs.existsSync(filePath)) {
      warn(`工作流文件 ${file} 不存在`)
    } else {
      success(`工作流文件 ${file} 已存在`)
    }
  }
  
  // 检查 .npmrc
  if (!fs.existsSync('.npmrc')) {
    warn('.npmrc 文件不存在')
  } else {
    success('.npmrc 文件已存在')
  }
  
  // 检查 scripts 目录
  if (!fs.existsSync('scripts')) {
    warn('scripts 目录不存在')
    fs.mkdirSync('scripts', { recursive: true })
    success('scripts 目录已创建')
  }
  
  // 检查发布脚本
  const releaseScript = 'scripts/release.js'
  if (!fs.existsSync(releaseScript)) {
    warn('发布脚本不存在')
  } else {
    success('发布脚本已存在')
  }
  
  console.log('\n📋 下一步操作:')
  console.log('1. 在 GitHub 仓库设置中添加 NPM_TOKEN secret')
  console.log('2. 确保 Git 用户信息已正确配置')
  console.log('3. 推送代码到 GitHub: git push -u origin main')
  console.log('4. 查看 GitHub Actions 状态')
  
  console.log('\n🔗 有用的链接:')
  console.log('- GitHub Actions: https://github.com/your-username/watermark-camera/actions')
  console.log('- NPM Token 设置: https://www.npmjs.com/settings/tokens')
  console.log('- GitHub Secrets: https://github.com/your-username/watermark-camera/settings/secrets/actions')
  
  console.log('\n📚 文档:')
  console.log('- 详细部署指南: DEPLOYMENT.md')
  console.log('- 项目说明: README.md')
  
  success('设置向导完成！')
}

main().catch(console.error) 