import { CounterType } from '@/types/counter'

export interface CounterImageOptions {
  value: number
  type: CounterType
  style?: 'light' | 'dark' | 'retro' | 'kawaii' | 'mother' | 'ff'
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
      border: '#000000'
    },
    dark: {
      backgroundColor: '#1a1a1a',
      textColor: '#ffffff',
      fontFamily: 'Courier New, Consolas, Monaco, Liberation Mono, DejaVu Sans Mono, monospace',
      fontSize: '16',
      border: '#ffffff'
    },
    retro: {
      backgroundColor: '#0d1117',
      textColor: '#00ff41',
      fontFamily: 'Courier New, Consolas, Monaco, Liberation Mono, DejaVu Sans Mono, monospace',
      fontSize: '16',
      border: '#00ff41',
      textShadow: '0 0 3px currentColor'
    },
    kawaii: {
      backgroundColor: '#e0f7fa',
      textColor: '#ff69b4',
      fontFamily: 'Comic Sans MS, Chalkboard SE, Comic Neue, cursive',
      fontSize: '18',
      border: '#9c27b0'
    },
    mother: {
      backgroundColor: '#f0f8e8',
      textColor: '#2d4a2b',
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontSize: '16',
      border: '#ff8c00'
    },
    ff: {
      backgroundColor: '#1a237e',
      textColor: '#e3f2fd',
      fontFamily: 'Times New Roman, Times, serif',
      fontSize: '16',
      border: '#64b5f6'
    }
  }
  
  const currentStyle = styles[style]
  const width = (digits ? digits : paddedValue.length) * 12 + 20
  const height = 30
  
  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      ${style === 'retro' ? `
      <!-- レトロテーマ用フィルター効果 -->
      <defs>
        <filter id="retroGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      ` : ''}
      
      <!-- 背景 -->
      <rect width="${width}" height="${height}" fill="${currentStyle.backgroundColor}" stroke="${currentStyle.border}" stroke-width="1"/>
      
      ${style === 'mother' ? `
      <!-- MOTHER2風ストライプパターン -->
      <defs>
        <pattern id="stripes" patternUnits="userSpaceOnUse" width="14" height="14" patternTransform="rotate(45)">
          <rect width="7" height="14" fill="#90ee90"/>
          <rect x="7" width="7" height="14" fill="#98fb98"/>
        </pattern>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#stripes)" opacity="0.3"/>
      ` : ''}
      
      ${style === 'ff' ? `
      <!-- FF風グラデーション -->
      <defs>
        <radialGradient id="ffGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="rgba(100, 181, 246, 0.2)"/>
          <stop offset="100%" stop-color="rgba(25, 118, 210, 0.1)"/>
        </radialGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#ffGradient)"/>
      ` : ''}
      
      <!-- カウンター値 -->
      <text x="${width / 2}" y="${style === 'light' ? (height / 2) + 1 : (height / 2)}" 
            fill="${currentStyle.textColor}" 
            font-family="${currentStyle.fontFamily}" 
            font-size="${currentStyle.fontSize}" 
            text-anchor="middle" 
            font-weight="bold"
            dominant-baseline="middle"
            ${style === 'retro' ? 'filter="url(#retroGlow)"' : ''}>${paddedValue}</text>
            
      ${style === 'retro' ? `
      <!-- スキャンライン効果 -->
      <defs>
        <pattern id="scanlines" patternUnits="userSpaceOnUse" width="1" height="4">
          <rect width="1" height="2" fill="transparent"/>
          <rect y="2" width="1" height="2" fill="rgba(0, 255, 65, 0.1)"/>
        </pattern>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#scanlines)"/>
      ` : ''}
    </svg>
  `.trim()
}

export function generateCounterWebP(options: CounterImageOptions): Buffer {
  // SVGからWebPへの変換（実際の実装では sharp などのライブラリを使用）
  // 簡易実装として、SVGをそのまま返す
  const svg = generateCounterSVG(options)
  return Buffer.from(svg, 'utf-8')
}