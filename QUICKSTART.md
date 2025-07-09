# 🚀 快速开始指南

本指南将帮助您在 5 分钟内完成 GitHub Actions 和 npm 发布的设置。

## 📋 前置要求

- Node.js 18+ 
- Git
- GitHub 账户
- npm 账户

## ⚡ 5分钟设置

### 1. 初始化项目

```bash
# 运行设置向导
npm run setup

# 或者手动初始化 Git
git init
git add .
git commit -m "feat: initial commit"
```

### 2. 创建 GitHub 仓库

1. 在 GitHub 上创建新仓库：`watermark-camera`
2. 推送代码：

```bash
git branch -M main
git remote add origin https://github.com/your-username/watermark-camera.git
git push -u origin main
```

### 3. 配置 NPM Token

1. 访问 [npmjs.com/settings/tokens](https://www.npmjs.com/settings/tokens)
2. 点击 "Generate new token"
3. 选择 "Automation" 类型
4. 复制生成的 token

### 4. 配置 GitHub Secrets

1. 进入仓库设置：`https://github.com/your-username/watermark-camera/settings/secrets/actions`
2. 点击 "New repository secret"
3. 添加：
   - **Name**: `NPM_TOKEN`
   - **Value**: 你的 npm token

### 5. 测试发布

```bash
# 推送一个测试提交
echo "# 测试" >> README.md
git add README.md
git commit -m "feat: add test feature"
git push
```

## 🎯 发布流程

### 自动发布（推荐）

项目已配置自动版本管理，推送代码到 main 分支时会：

1. ✅ 自动分析提交信息
2. ✅ 自动更新版本号
3. ✅ 自动创建标签
4. ✅ 自动构建并发布到 npm

### 手动发布

```bash
# 补丁版本 (1.0.0 -> 1.0.1)
npm run release:patch

# 次版本 (1.0.0 -> 1.1.0)  
npm run release:minor

# 主版本 (1.0.0 -> 2.0.0)
npm run release:major
```

## 📝 提交规范

使用 Conventional Commits 规范：

```bash
# 新功能 - 自动更新到次版本
git commit -m "feat: add watermark text support"

# 修复问题 - 自动更新到补丁版本
git commit -m "fix: resolve camera permission issue"

# 破坏性变更 - 自动更新到主版本
git commit -m "feat!: change API interface"
```

## 🔍 监控状态

- **GitHub Actions**: `https://github.com/your-username/watermark-camera/actions`
- **NPM 包**: `https://www.npmjs.com/package/watermark-camera`
- **GitHub Releases**: `https://github.com/your-username/watermark-camera/releases`

## 🛠️ 故障排除

### 常见问题

1. **构建失败**
   ```bash
   npm run type-check  # 检查类型错误
   npm run build:lib   # 本地构建测试
   ```

2. **发布失败**
   - 检查 NPM_TOKEN 是否正确配置
   - 确保包名在 npm 上可用
   - 检查版本号是否已存在

3. **版本更新失败**
   - 确保提交信息符合规范
   - 检查 Git 权限配置

### 调试命令

```bash
# 本地构建测试
npm run build:lib

# 类型检查
npm run type-check

# 查看构建产物
ls -la dist/

# 测试发布（不会真正发布）
npm pack
```

## 📚 更多信息

- 📖 [详细部署指南](DEPLOYMENT.md)
- 📖 [项目说明](README.md)
- 🔗 [Conventional Commits](https://www.conventionalcommits.org/)
- 🔗 [GitHub Actions 文档](https://docs.github.com/en/actions)

## 🎉 完成！

现在您的项目已经配置了完整的 CI/CD 流水线：

- ✅ 自动构建和测试
- ✅ 自动版本管理
- ✅ 自动发布到 npm
- ✅ 自动创建 GitHub Release

每次推送代码到 main 分支时，GitHub Actions 都会自动处理构建和发布流程！ 