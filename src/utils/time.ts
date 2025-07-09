// 获取网络时间
export async function getNetworkTime(url?: string): Promise<string> {
  const timeUrl = url || 'https://quan.suning.com/getSysTime.do'
  
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', timeUrl)
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText)
        if (data && data.sysTime2) {
          resolve(data.sysTime2)
        } else {
          resolve(new Date().toLocaleString())
        }
      } catch (error) {
        resolve(new Date().toLocaleString())
      }
    }
    xhr.onerror = () => resolve(new Date().toLocaleString())
    xhr.send()
  })
}

// 获取本地时间
export function getLocalTime(): string {
  return new Date().toLocaleString()
} 