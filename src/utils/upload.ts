// 上传文件到服务器
export async function uploadFile(
  file: File, 
  url: string, 
  headers?: Record<string, string>
): Promise<any> {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await fetch(url, {
    method: 'POST',
    body: formData,
    headers: {
      ...headers,
      // 不要设置 Content-Type，让浏览器自动设置
    }
  })
  
  if (!response.ok) {
    throw new Error(`上传失败: ${response.status}`)
  }
  
  return response.json()
}

// 将 base64 转换为 File 对象
export function base64ToFile(base64: string, filename: string): File {
  const arr = base64.split(',')
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  
  return new File([u8arr], filename, { type: mime })
} 