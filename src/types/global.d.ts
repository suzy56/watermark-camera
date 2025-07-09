declare global {
  interface Window {
    uni: any
  }
  
  const uni: any
  const navigator: Navigator
  
  interface Recordable {
    [key: string]: any
  }
}

export {} 