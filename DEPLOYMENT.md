# 部署指南

本指南将帮助您设置完整的 CI/CD 流水线，实现自动构建和发布到 npm。

## 🚀 快速开始

### 1. 准备 GitHub 仓库

1. 在 GitHub 上创建新仓库
2. 将本地代码推送到 GitHub：

```bash
git init
git add .
git commit -m "feat: initial commit"
git branch -M main
git remote add origin https://github.com/your-username/watermark-camera.git
git push -u origin main
```

### 2. 配置 NPM Token

1. 登录 [npmjs.com](https://www.npmjs.com)
2. 进入个人设置 → Access Tokens
3. 创建新的 Access Token（选择 "Automation" 类型）
4. 复制生成的 token

### 3. 配置 GitHub Secrets

在 GitHub 仓库设置中添加以下 secrets：

1. 进入仓库设置 → Secrets and variables → Actions
2. 点击 "New repository secret"
3. 添加以下 secret：

| Name | Value | 说明 |
|------|-------|------|
| `NPM_TOKEN` | 你的 npm token | 用于发布包到 npm |

### 4. 配置 Git 用户信息

确保 Git 配置了正确的用户信息：

```bash
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

## 🔄 发布流程

### 自动发布（推荐）

项目配置了自动版本管理，当您推送代码到 main 分支时：

1. **自动分析提交信息**：根据 Conventional Commits 规范自动确定版本类型
2. **自动更新版本号**：更新 package.json 中的版本
3. **自动创建标签**：创建版本标签并推送
4. **自动构建发布**：GitHub Actions 自动构建并发布到 npm

### 手动发布

如果需要手动控制版本，可以使用提供的脚本：

```bash
# 补丁版本 (1.0.0 -> 1.0.1)
npm run release:patch

# 次版本 (1.0.0 -> 1.1.0)
npm run release:minor

# 主版本 (1.0.0 -> 2.0.0)
npm run release:major
```

## 📝 提交规范

项目使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

### 提交类型

- `feat:` - 新功能
- `fix:` - 修复问题
- `docs:` - 文档更新
- `style:` - 代码格式调整
- `refactor:` - 代码重构
- `test:` - 测试相关
- `chore:` - 构建过程或辅助工具的变动

### 版本更新规则

- `feat:` → 次版本更新 (minor)
- `fix:` → 补丁版本更新 (patch)
- `BREAKING CHANGE` 或 `feat!:` → 主版本更新 (major)

### 示例

```bash
# 新功能 - 自动更新到次版本
git commit -m "feat: add watermark text support"

# 修复问题 - 自动更新到补丁版本
git commit -m "fix: resolve camera permission issue"

# 破坏性变更 - 自动更新到主版本
git commit -m "feat!: change API interface"

# 或者
git commit -m "feat: add new feature

BREAKING CHANGE: API interface has changed"
```

## 🔧 工作流说明

### CI 工作流 (`.github/workflows/ci.yml`)

- **触发条件**：推送到 main/develop 分支或创建 PR
- **功能**：
  - 安装依赖
  - 运行类型检查
  - 构建项目
  - 上传构建产物

### 版本管理工作流 (`.github/workflows/version.yml`)

- **触发条件**：推送到 main 分支（忽略文档更新）
- **功能**：
  - 分析提交信息
  - 自动更新版本号
  - 创建版本标签

### 发布工作流 (`.github/workflows/publish.yml`)

- **触发条件**：推送版本标签或手动触发
- **功能**：
  - 构建组件
  - 发布到 npm
  - 创建 GitHub Release

## 🛠️ 故障排除

### 常见问题

1. **构建失败**
   - 检查 TypeScript 类型错误
   - 确保所有依赖已正确安装

2. **发布失败**
   - 检查 NPM_TOKEN 是否正确配置
   - 确保包名在 npm 上可用
   - 检查版本号是否已存在

3. **版本更新失败**
   - 确保提交信息符合 Conventional Commits 规范
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

## 📊 监控和通知

### GitHub Actions 状态

- 查看工作流状态：`https://github.com/your-username/watermark-camera/actions`
- 查看发布历史：`https://github.com/your-username/watermark-camera/releases`

### NPM 包状态

- 包页面：`https://www.npmjs.com/package/watermark-camera`
- 下载统计：`https://www.npmjs.com/package/watermark-camera`

## 🔐 安全注意事项

1. **Token 安全**
   - 定期轮换 NPM_TOKEN
   - 使用最小权限原则
   - 不要在代码中硬编码 token

2. **依赖安全**
   - 定期更新依赖
   - 使用 `npm audit` 检查安全漏洞
   - 考虑使用 Dependabot 自动更新

3. **代码安全**
   - 不要在构建产物中包含敏感信息
   - 使用 `.gitignore` 和 `.npmignore` 正确配置

## 📚 相关资源

- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [NPM 发布指南](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [Semantic Versioning](https://semver.org/) 