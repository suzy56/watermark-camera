// H5 相机拍照（最佳实践：input+capture，体验和uniapp一致）
export async function takePhoto(options?: { facingMode?: 'user' | 'environment' }): Promise<string> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = options?.facingMode || 'environment' // 'user' 前置, 'environment' 后置
    input.style.display = 'none'
    document.body.appendChild(input)

    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          resolve(result)
          document.body.removeChild(input)
        }
        reader.onerror = () => {
          reject(new Error('文件读取失败'))
          document.body.removeChild(input)
        }
        reader.readAsDataURL(file)
      } else {
        reject(new Error('未选择文件'))
        document.body.removeChild(input)
      }
    }
    input.onerror = () => {
      reject(new Error('相机调用失败'))
      document.body.removeChild(input)
    }
    input.click()
  })
}

// 从相册选择图片
export async function selectImage(): Promise<string> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          resolve(result)
        }
        reader.onerror = () => reject(new Error('文件读取失败'))
        reader.readAsDataURL(file)
      } else {
        reject(new Error('未选择文件'))
      }
    }
    
    input.onerror = () => reject(new Error('相册调用失败'))
    input.click()
  })
}

// 检查相机权限
export async function checkCameraPermission(): Promise<boolean> {
  return new Promise((resolve) => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      resolve(false)
      return
    }
    
    // 检查权限状态
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'camera' as PermissionName })
        .then(permissionStatus => {
          if (permissionStatus.state === 'granted') {
            resolve(true)
          } else if (permissionStatus.state === 'denied') {
            resolve(false)
          } else {
            // 权限未确定，尝试获取权限
            navigator.mediaDevices.getUserMedia({ video: true })
              .then(() => resolve(true))
              .catch(() => resolve(false))
          }
        })
        .catch(() => {
          // 如果权限查询失败，直接尝试获取权限
          navigator.mediaDevices.getUserMedia({ video: true })
            .then(() => resolve(true))
            .catch(() => resolve(false))
        })
    } else {
      // 不支持权限 API，直接尝试获取权限
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(() => resolve(true))
        .catch(() => resolve(false))
    }
  })
} 