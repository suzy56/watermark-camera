import WatermarkCamera from './components/WatermarkCamera.vue'
import type { App } from 'vue'

export { WatermarkCamera }

export const install = (app: App) => {
  app.component('WatermarkCamera', WatermarkCamera)
}

export * from './types' 