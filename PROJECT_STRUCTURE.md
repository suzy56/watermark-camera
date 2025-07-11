# WatermarkCamera 组件项目结构

```
vue3-watermark-camera/
├── src/                          # 源代码目录
│   ├── components/               # 组件目录
│   │   └── WatermarkCamera.vue  # 主组件文件
│   ├── utils/                    # 工具函数
│   │   ├── watermark.ts         # 水印生成工具
│   │   └── request.ts           # 请求工具
│   ├── api/                      # API 接口
│   │   └── common.api.ts        # 通用 API
│   ├── types/                    # 类型定义
│   │   ├── index.ts             # 组件类型
│   │   └── global.d.ts          # 全局类型
│   └── index.ts                  # 入口文件
├── example/                      # 示例代码
│   └── App.vue                  # 使用示例
├── dist/                         # 构建输出目录
├── package.json                  # 项目配置
├── vite.config.ts               # Vite 配置
├── tsconfig.json                # TypeScript 配置
├── tsconfig.node.json           # Node.js TypeScript 配置
├── build.js                     # 构建脚本
├── publish.js                   # 发布脚本
├── README.md                    # 说明文档
├── .gitignore                   # Git 忽略文件
└── PROJECT_STRUCTURE.md         # 项目结构说明
```

## 文件说明

### 核心文件

- **src/components/WatermarkCamera.vue**: 主组件，包含拍照、水印、上传等功能
- **src/utils/watermark.ts**: 水印生成工具，负责在图片上添加水印信息
- **src/utils/request.ts**: HTTP 请求工具，处理与服务器的通信
- **src/api/common.api.ts**: API 接口定义，包含钉钉签名和系统时间接口
- **src/types/index.ts**: 组件相关的 TypeScript 类型定义

### 配置文件

- **package.json**: 项目依赖和脚本配置
- **vite.config.ts**: Vite 构建配置，支持库模式构建
- **tsconfig.json**: TypeScript 编译配置
- **build.js**: 自动化构建脚本
- **publish.js**: 自动化发布脚本

### 文档文件

- **README.md**: 组件使用说明和 API 文档
- **example/App.vue**: 使用示例代码

## 构建流程

1. **开发**: `npm run dev` - 启动开发服务器
2. **构建**: `npm run build:lib` - 构建组件库
3. **发布**: `npm run publish:lib` - 发布到 npm

## 输出文件

构建完成后，`dist/` 目录包含：

- `index.js` - CommonJS 格式
- `index.mjs` - ES Module 格式
- `index.d.ts` - TypeScript 类型声明
- `style.css` - 组件样式文件

## 使用方式

### 作为 npm 包使用

```bash
npm install vue3-watermark-camera
```

```javascript
import { WatermarkCamera } from 'vue3-watermark-camera'
import 'vue3-watermark-camera/style'
```

### 本地开发

```bash
cd vue3-watermark-camera
npm install
npm run dev
```

## 技术栈

- **Vue 3**: 组件框架
- **TypeScript**: 类型安全
- **Vite**: 构建工具
- **uni-app**: 跨平台支持
- **Canvas**: 水印生成
- **钉钉 JSAPI**: 钉钉平台支持 