/**
 * Nostalgic Like Web Component
 * 
 * 使用方法:
 * <script src="/components/like.js"></script>
 * <nostalgic-like id="your-like-id" theme="dark" icon="heart" format="interactive"></nostalgic-like>
 */

// バリデーション定数は不要になりました（API側でデフォルト値処理）

class NostalgicLike extends HTMLElement {
  // スクリプトが読み込まれたドメインを自動検出
  static apiBaseUrl = (() => {
    const scripts = document.querySelectorAll('script[src*="like.js"]');
    for (const script of scripts) {
      const src = script.getAttribute('src');
      if (src && src.includes('like.js')) {
        try {
          const url = new URL(src, window.location.href);
          return url.origin;
        } catch (e) {
          console.warn('Failed to parse script URL:', src);
        }
      }
    }
    // フォールバック: 現在のドメインを使用
    return window.location.origin;
  })();
  
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.likeData = null;
    this.isLoading = false;
  }

  static get observedAttributes() {
    return ['id', 'theme', 'icon', 'format'];
  }

  // 安全なアトリビュート処理
  safeGetAttribute(name) {
    const value = this.getAttribute(name);
    
    switch (name) {
      case 'id':
        if (!value || typeof value !== 'string' || value.trim() === '') {
          return null;
        }
        return value.trim();
        
      case 'theme':
        return value;
        
      case 'icon':
        return value;
        
      case 'format':
        return value;
        
      case 'url':
        if (!value || typeof value !== 'string') return null;
        try {
          new URL(value);
          return value;
        } catch {
          return null;
        }
        
      case 'token':
        if (!value || typeof value !== 'string' || value.trim() === '') {
          return null;
        }
        return value.trim();
        
      default:
        return value;
    }
  }

  connectedCallback() {
    this.loadLikeData();
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this.loadLikeData();
    }
  }

  async loadLikeData() {
    const id = this.safeGetAttribute('id');
    if (!id) {
      this.renderError('エラー: id属性が必要です');
      return;
    }

    this.isLoading = true;

    try {
      const baseUrl = this.safeGetAttribute('api-base') || NostalgicLike.apiBaseUrl;
      const apiUrl = `${baseUrl}/api/like?action=get&id=${encodeURIComponent(id)}`;
      
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const responseData = await response.json();
      if (responseData.success) {
        this.likeData = responseData.data;
      } else {
        throw new Error(responseData.error || 'APIがエラーを返しました');
      }
    } catch (error) {
      console.error('nostalgic-like: Failed to load data:', error);
      this.likeData = { total: 0, userLiked: false };
    }

    this.isLoading = false;
    this.render();
  }

  async toggleLike() {
    const id = this.safeGetAttribute('id');
    if (!id || this.isLoading) return;

    this.isLoading = true;

    try {
      const baseUrl = this.safeGetAttribute('api-base') || NostalgicLike.apiBaseUrl;
      const toggleUrl = `${baseUrl}/api/like?action=toggle&id=${encodeURIComponent(id)}`;
      
      const response = await fetch(toggleUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const responseData = await response.json();
      if (responseData.success) {
        this.likeData = responseData.data;
      } else {
        throw new Error(responseData.error || 'APIがエラーを返しました');
      }
    } catch (error) {
      console.error('nostalgic-like: Toggle failed:', error);
    }

    this.isLoading = false;
    this.render();
  }

  renderError(message) {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          color: red;
          font-size: 12px;
        }
      </style>
      <span>${message}</span>
    `;
  }

  render() {
    const theme = this.safeGetAttribute('theme');
    const icon = this.safeGetAttribute('icon');
    const format = this.safeGetAttribute('format');
    
    if (!this.safeGetAttribute('id')) {
      this.renderError('エラー: id属性が必要です');
      return;
    }

    // SVG画像形式の場合
    if (format === 'image') {
      const baseUrl = this.safeGetAttribute('api-base') || NostalgicLike.apiBaseUrl;
      const id = this.safeGetAttribute('id');
      const apiUrl = `${baseUrl}/api/like?action=display&id=${encodeURIComponent(id)}${theme ? `&theme=${theme}` : ''}&format=image`;
      
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: inline-block;
          }
          img {
            display: block;
            max-width: 100%;
            height: auto;
          }
        </style>
        <img src="${apiUrl}" alt="like count" loading="lazy" />
      `;
      return;
    }

    // テキスト形式の場合（数字のみ）
    if (format === 'text') {
      const isLoading = this.isLoading;
      const total = this.likeData ? this.likeData.total : 0;
      const userLiked = this.likeData ? this.likeData.userLiked : false;
      
      // テーマ別デフォルト色（CSS変数のフォールバック）
      const textThemes = {
        light: {
          color: userLiked ? '#000000' : '#666666',
          hoverColor: userLiked ? '#333333' : '#000000'
        },
        dark: {
          color: userLiked ? '#ffffff' : '#999999',
          hoverColor: userLiked ? '#cccccc' : '#ffffff'
        },
        kawaii: {
          color: userLiked ? '#ff69b4' : '#f06292',
          hoverColor: userLiked ? '#f06292' : '#ff4081'
        }
      };
      
      // デフォルトテーマはdark
      const textStyle = textThemes[theme] || textThemes.dark;
      const likedClass = userLiked ? 'liked' : 'unliked';
      
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: inline;
            /* CSS Custom Properties for external customization */
            --like-text-color-unliked: ${textStyle.color};
            --like-text-color-liked: ${userLiked ? textStyle.color : textThemes[theme].color};
            --like-text-hover-color-unliked: ${textStyle.hoverColor};
            --like-text-hover-color-liked: ${userLiked ? textStyle.hoverColor : textThemes[theme].hoverColor};
          }
          .like-text {
            cursor: pointer;
            text-decoration: underline;
            font-family: inherit;
            font-size: inherit;
            opacity: ${isLoading ? '0.6' : '1'};
            transition: color 0.2s ease;
          }
          .like-text.unliked {
            color: var(--like-text-color-unliked, ${textStyle.color});
          }
          .like-text.liked {
            color: var(--like-text-color-liked, ${userLiked ? textStyle.color : textThemes[theme].color});
          }
          .like-text.unliked:hover:not(.loading) {
            color: var(--like-text-hover-color-unliked, ${textStyle.hoverColor});
          }
          .like-text.liked:hover:not(.loading) {
            color: var(--like-text-hover-color-liked, ${userLiked ? textStyle.hoverColor : textThemes[theme].hoverColor});
          }
        </style>
        <span class="like-text ${likedClass} ${isLoading ? 'loading' : ''}" onclick="this.getRootNode().host.toggleLike()">${total}</span>
      `;
      return;
    }
    
    const isLoading = this.isLoading;
    const total = this.likeData ? this.likeData.total : 0;
    const userLiked = this.likeData ? this.likeData.userLiked : false;
    
    // アイコンマッピング（幅を統一するため同じ文字を使用）
    const iconMapping = {
      heart: '♥',
      star: '★', 
      thumb: '👍'
    };
    
    const displayIcon = iconMapping[icon] || iconMapping.heart;
    
    // アイコンの色設定（テーマ別）
    const getIconColor = () => {
      if (theme === 'light') {
        return userLiked ? '#000000' : '#999999';
      } else if (theme === 'dark') {
        return userLiked ? '#ffffff' : '#666666';
      } else if (theme === 'kawaii') {
        if (icon === 'heart') return userLiked ? '#ff69b4' : '#f06292';
        if (icon === 'star') return userLiked ? '#ff69b4' : '#f06292';
        if (icon === 'thumb') return userLiked ? '#ff69b4' : '#f06292';
      }
      // デフォルト（dark）
      return userLiked ? '#ffffff' : '#666666';
    };
    
    const currentIconColor = getIconColor();
    
    // テーマ別のスタイル
    const themeStyles = {
      light: {
        bgColor: '#ffffff',
        hoverBgColor: '#f5f5f5',
        textColor: '#000000',
        borderColor: '#000000',
        shadowColor: '#000000'
      },
      dark: {
        bgColor: '#2a2a2a',
        hoverBgColor: '#333333',
        textColor: '#ffffff',
        borderColor: '#ffffff',
        shadowColor: '#ffffff'
      },
      kawaii: {
        bgColor: '#e0f7fa',
        hoverBgColor: '#b2ebf2',
        textColor: '#ff69b4',
        borderColor: '#9c27b0',
        shadowColor: '#9c27b0'
      }
    };
    
    // デフォルトテーマはdark
    const style = themeStyles[theme] || themeStyles.dark;
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
        }
        
        .like-button {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: var(--like-bg, ${style.bgColor});
          color: var(--like-text, ${style.textColor});
          border: 2px solid var(--like-border, ${style.borderColor});
          border-radius: var(--like-radius, 4px);
          box-shadow: 3px 3px 0px var(--like-shadow, ${style.shadowColor});
          cursor: pointer;
          font-family: var(--like-font, 'Courier New', monospace);
          font-size: var(--like-font-size, 14px);
          font-weight: bold;
          user-select: none;
          transition: all 0.2s ease;
          opacity: ${isLoading ? '0.6' : '1'};
        }
        
        .like-button:hover:not(.loading) {
          background: var(--like-hover-bg, ${style.hoverBgColor});
          transform: translate(-1px, -1px);
          box-shadow: 4px 4px 0px var(--like-shadow, ${style.shadowColor});
        }
        
        .like-button.kawaii {
          background-color: #e0f7fa;
          background-image: 
            radial-gradient(circle at 8% 15%, rgba(255,255,255,0.8) 8px, transparent 8px),
            radial-gradient(circle at 25% 8%, rgba(255,255,255,0.8) 5px, transparent 5px),
            radial-gradient(circle at 45% 22%, rgba(255,255,255,0.8) 11px, transparent 11px),
            radial-gradient(circle at 68% 5%, rgba(255,255,255,0.8) 7px, transparent 7px),
            radial-gradient(circle at 85% 18%, rgba(255,255,255,0.8) 9px, transparent 9px),
            radial-gradient(circle at 5% 45%, rgba(255,255,255,0.8) 6px, transparent 6px),
            radial-gradient(circle at 22% 38%, rgba(255,255,255,0.8) 10px, transparent 10px),
            radial-gradient(circle at 38% 55%, rgba(255,255,255,0.8) 8px, transparent 8px),
            radial-gradient(circle at 58% 42%, rgba(255,255,255,0.8) 5px, transparent 5px),
            radial-gradient(circle at 75% 35%, rgba(255,255,255,0.8) 12px, transparent 12px),
            radial-gradient(circle at 92% 48%, rgba(255,255,255,0.8) 7px, transparent 7px),
            radial-gradient(circle at 12% 75%, rgba(255,255,255,0.8) 9px, transparent 9px),
            radial-gradient(circle at 30% 68%, rgba(255,255,255,0.8) 6px, transparent 6px),
            radial-gradient(circle at 48% 82%, rgba(255,255,255,0.8) 8px, transparent 8px),
            radial-gradient(circle at 65% 72%, rgba(255,255,255,0.8) 10px, transparent 10px),
            radial-gradient(circle at 82% 85%, rgba(255,255,255,0.8) 5px, transparent 5px),
            radial-gradient(circle at 15% 92%, rgba(255,255,255,0.8) 11px, transparent 11px),
            radial-gradient(circle at 55% 95%, rgba(255,255,255,0.8) 7px, transparent 7px),
            radial-gradient(circle at 95% 78%, rgba(255,255,255,0.8) 9px, transparent 9px);
        }
        
        .like-button.kawaii:hover:not(.loading) {
          background-color: #b2ebf2;
          background-image: 
            radial-gradient(circle at 8% 15%, rgba(255,255,255,0.9) 8px, transparent 8px),
            radial-gradient(circle at 25% 8%, rgba(255,255,255,0.9) 5px, transparent 5px),
            radial-gradient(circle at 45% 22%, rgba(255,255,255,0.9) 11px, transparent 11px),
            radial-gradient(circle at 68% 5%, rgba(255,255,255,0.9) 7px, transparent 7px),
            radial-gradient(circle at 85% 18%, rgba(255,255,255,0.9) 9px, transparent 9px),
            radial-gradient(circle at 5% 45%, rgba(255,255,255,0.9) 6px, transparent 6px),
            radial-gradient(circle at 22% 38%, rgba(255,255,255,0.9) 10px, transparent 10px),
            radial-gradient(circle at 38% 55%, rgba(255,255,255,0.9) 8px, transparent 8px),
            radial-gradient(circle at 58% 42%, rgba(255,255,255,0.9) 5px, transparent 5px),
            radial-gradient(circle at 75% 35%, rgba(255,255,255,0.9) 12px, transparent 12px),
            radial-gradient(circle at 92% 48%, rgba(255,255,255,0.9) 7px, transparent 7px),
            radial-gradient(circle at 12% 75%, rgba(255,255,255,0.9) 9px, transparent 9px),
            radial-gradient(circle at 30% 68%, rgba(255,255,255,0.9) 6px, transparent 6px),
            radial-gradient(circle at 48% 82%, rgba(255,255,255,0.9) 8px, transparent 8px),
            radial-gradient(circle at 65% 72%, rgba(255,255,255,0.9) 10px, transparent 10px),
            radial-gradient(circle at 82% 85%, rgba(255,255,255,0.9) 5px, transparent 5px),
            radial-gradient(circle at 15% 92%, rgba(255,255,255,0.9) 11px, transparent 11px),
            radial-gradient(circle at 55% 95%, rgba(255,255,255,0.9) 7px, transparent 7px),
            radial-gradient(circle at 95% 78%, rgba(255,255,255,0.9) 9px, transparent 9px);
        }
        
        .heart-icon {
          font-size: var(--like-icon-size, 16px);
          line-height: 1;
          color: var(--like-icon-color, ${currentIconColor});
          width: 16px;
          text-align: center;
          display: inline-block;
        }
        
        .like-count {
          font-family: monospace;
          min-width: 20px;
          text-align: center;
        }
        
        .loading {
          cursor: pointer !important;
          opacity: 0.7;
        }
        
        .like-button:disabled {
          cursor: pointer !important;
        }
      </style>
      
      <button class="like-button ${isLoading ? 'loading' : ''} ${theme === 'kawaii' ? 'kawaii' : ''}" ${isLoading ? 'disabled' : ''}>
        <span class="heart-icon">${displayIcon}</span>
        <span class="like-count">${total}</span>
      </button>
    `;
    
    // クリックイベントを追加
    if (!isLoading) {
      this.shadowRoot.querySelector('.like-button').addEventListener('click', () => {
        this.toggleLike();
      });
    }
  }
}

// カスタム要素として登録
if (!customElements.get('nostalgic-like')) {
  customElements.define('nostalgic-like', NostalgicLike);
}

