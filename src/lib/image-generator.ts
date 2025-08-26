import { CounterType } from '@/types/counter'

export interface CounterImageOptions {
  value: number
  type: CounterType
  style?: 'light' | 'dark' | 'kawaii'
  digits?: number
}

export function generateCounterSVG(options: CounterImageOptions): string {
  const { value, type, style = 'dark', digits } = options
  
  // digitsが指定されている場合のみゼロパディング
  const paddedValue = digits ? value.toString().padStart(digits, '0') : value.toString()
  
  // スタイル設定
  const styles = {
    light: {
      backgroundColor: '#ffffff',
      textColor: '#000000',
      fontFamily: 'Courier New, Consolas, Monaco, Liberation Mono, DejaVu Sans Mono, monospace',
      fontSize: '16',
      border: '#cccccc'
    },
    dark: {
      backgroundColor: '#1a1a1a',
      textColor: '#ffffff',
      fontFamily: 'Courier New, Consolas, Monaco, Liberation Mono, DejaVu Sans Mono, monospace',
      fontSize: '16',
      border: '#444444'
    },
    kawaii: {
      backgroundColor: '#ffe4e1',
      textColor: '#ff69b4',
      fontFamily: 'Comic Sans MS, Chalkboard SE, Comic Neue, cursive',
      fontSize: '18',
      border: '#ffb6c1'
    }
  }
  
  const currentStyle = styles[style]
  const width = (digits ? digits : paddedValue.length) * 12 + 20
  const height = 30
  
  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <!-- 背景 -->
      <rect width="${width}" height="${height}" fill="${currentStyle.backgroundColor}" stroke="${currentStyle.border}" stroke-width="1"/>
      
      <!-- カウンター値 -->
      <text x="${width / 2}" y="${style === 'light' ? (height / 2) + 1 : (height / 2)}" 
            fill="${currentStyle.textColor}" 
            font-family="${currentStyle.fontFamily}" 
            font-size="${currentStyle.fontSize}" 
            text-anchor="middle" 
            font-weight="bold"
            dominant-baseline="middle">${paddedValue}</text>
    </svg>
  `.trim()
}

export function generateCounterWebP(options: CounterImageOptions): Buffer {
  // SVGからWebPへの変換（実際の実装では sharp などのライブラリを使用）
  // 簡易実装として、SVGをそのまま返す
  const svg = generateCounterSVG(options)
  return Buffer.from(svg, 'utf-8')
}