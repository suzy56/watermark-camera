import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'
import fs from 'fs'
import path from 'path'

export default defineConfig(({ command }) => {
  const isBuild = command === 'build'
  
  return {
    plugins: [
      vue(),
      dts({
        insertTypesEntry: true,
        include: ['src/**/*.ts', 'src/**/*.vue'],
      }),
    ],
    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'WatermarkCamera',
        fileName: 'index',
        formats: ['es', 'cjs'],
      },
      rollupOptions: {
        external: ['vue', 'dingtalk-jsapi'],
        output: {
          globals: {
            vue: 'Vue',
            'dingtalk-jsapi': 'dd',
          },
          exports: 'named',
        },
      },
      cssCodeSplit: false,
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        // 允许从dist目录导入
        'dist': resolve(__dirname, 'dist'),
      },
    },
    // 开发服务器配置
    server: {
      host: '0.0.0.0', // 允许局域网访问
      port: 3000,
      https: {
        // 使用自签名证书
        key: fs.readFileSync(path.resolve(__dirname, 'cert/localhost.key')),
        cert: fs.readFileSync(path.resolve(__dirname, 'cert/localhost.crt')),
      },
      open: '/example/app.html', // 默认打开 App.vue 版本
      cors: true,
      // 允许访问dist目录
      fs: {
        allow: ['..', 'dist']
      }
    },
    // 预览配置
    preview: {
      host: '0.0.0.0', // 允许局域网访问
      port: 4173,
      open: true,
      root: __dirname,
    },
  }
}) 