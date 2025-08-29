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
        retro: {
          color: userLiked ? '#00ff41' : '#00cc33',
          hoverColor: userLiked ? '#00cc33' : '#00ff41'
        },
        kawaii: {
          color: userLiked ? '#ff69b4' : '#f06292',
          hoverColor: userLiked ? '#f06292' : '#ff4081'
        },
        mom: {
          color: userLiked ? '#2d4a2b' : '#4d6b4a',
          hoverColor: userLiked ? '#4d6b4a' : '#2d4a2b'
        },
        final: {
          color: userLiked ? '#ffffff' : '#e0e0e0',
          hoverColor: userLiked ? '#e0e0e0' : '#ffffff'
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
          .like-text.mom {
            text-shadow: 1px 1px 0px white;
          }
          .like-text.final {
            text-shadow: 1px 1px 0px black;
          }
        </style>
        <span class="like-text ${likedClass} ${isLoading ? 'loading' : ''} ${theme === 'mom' ? 'mom' : ''} ${theme === 'final' ? 'final' : ''}" onclick="this.getRootNode().host.toggleLike()">${total}</span>
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
      thumb: '👍',
      peta: '🐾'
    };
    
    const displayIcon = iconMapping[icon] || iconMapping.heart;
    
    // アイコンの色設定（テーマ別）
    const getIconColor = () => {
      if (theme === 'light') {
        return userLiked ? '#000000' : '#999999';
      } else if (theme === 'dark') {
        return userLiked ? '#ffffff' : '#666666';
      } else if (theme === 'retro') {
        return userLiked ? '#00ff41' : '#00cc33';
      } else if (theme === 'kawaii') {
        if (icon === 'heart') return userLiked ? '#ff69b4' : '#f06292';
        if (icon === 'star') return userLiked ? '#ff69b4' : '#f06292';
        if (icon === 'thumb') return userLiked ? '#ff69b4' : '#f06292';
        if (icon === 'peta') return userLiked ? '#ff69b4' : '#f06292';
      } else if (theme === 'mom') {
        return userLiked ? '#2d4a2b' : '#4d6b4a';
      } else if (theme === 'final') {
        return userLiked ? '#ffffff' : '#e0e0e0';
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
      retro: {
        bgColor: '#0d1117',
        hoverBgColor: '#161b22',
        textColor: '#00ff41',
        borderColor: '#00ff41',
        shadowColor: '#00ff41'
      },
      kawaii: {
        bgColor: '#e0f7fa',
        hoverBgColor: '#b2ebf2',
        textColor: '#ff69b4',
        borderColor: '#9c27b0',
        shadowColor: '#9c27b0'
      },
      mom: {
        bgColor: '#d8f5d8',
        hoverBgColor: '#a5d6a7',
        textColor: '#2d4a2b',
        borderColor: '#ff8c00',
        shadowColor: '#ff8c00'
      },
      final: {
        bgColor: '#0000ff',
        hoverBgColor: '#3333ff',
        textColor: '#ffffff',
        borderColor: '#ffffff',
        shadowColor: '#ffffff'
      }
    };
    
    // デフォルトテーマはdark
    const style = themeStyles[theme] || themeStyles.dark;
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          /* 水玉パターン変数 */
          --kawaii-light-bg: #e0f7fa;
          --kawaii-light-dots: radial-gradient(circle at 15px 0px, rgba(255,255,255,0.8) 8px, transparent 8px),
                               radial-gradient(circle at 45px 5px, rgba(255,255,255,0.8) 10px, transparent 10px),
                               radial-gradient(circle at 80px 0px, rgba(255,255,255,0.8) 7px, transparent 7px),
                               radial-gradient(circle at 115px 8px, rgba(255,255,255,0.8) 9px, transparent 9px),
                               radial-gradient(circle at 150px 2px, rgba(255,255,255,0.8) 6px, transparent 6px),
                               radial-gradient(circle at 185px 10px, rgba(255,255,255,0.8) 11px, transparent 11px),
                               radial-gradient(circle at 20px 25px, rgba(255,255,255,0.8) 7px, transparent 7px),
                               radial-gradient(circle at 55px 30px, rgba(255,255,255,0.8) 8px, transparent 8px),
                               radial-gradient(circle at 90px 20px, rgba(255,255,255,0.8) 12px, transparent 12px),
                               radial-gradient(circle at 125px 35px, rgba(255,255,255,0.8) 6px, transparent 6px),
                               radial-gradient(circle at 160px 25px, rgba(255,255,255,0.8) 9px, transparent 9px),
                               radial-gradient(circle at 195px 30px, rgba(255,255,255,0.8) 7px, transparent 7px),
                               radial-gradient(circle at 30px 50px, rgba(255,255,255,0.8) 10px, transparent 10px),
                               radial-gradient(circle at 65px 55px, rgba(255,255,255,0.8) 8px, transparent 8px),
                               radial-gradient(circle at 100px 45px, rgba(255,255,255,0.8) 6px, transparent 6px),
                               radial-gradient(circle at 135px 60px, rgba(255,255,255,0.8) 11px, transparent 11px),
                               radial-gradient(circle at 170px 50px, rgba(255,255,255,0.8) 9px, transparent 9px),
                               radial-gradient(circle at 10px 75px, rgba(255,255,255,0.8) 7px, transparent 7px),
                               radial-gradient(circle at 45px 80px, rgba(255,255,255,0.8) 10px, transparent 10px),
                               radial-gradient(circle at 80px 70px, rgba(255,255,255,0.8) 8px, transparent 8px),
                               radial-gradient(circle at 115px 85px, rgba(255,255,255,0.8) 6px, transparent 6px),
                               radial-gradient(circle at 150px 75px, rgba(255,255,255,0.8) 12px, transparent 12px),
                               radial-gradient(circle at 185px 80px, rgba(255,255,255,0.8) 9px, transparent 9px),
                               radial-gradient(circle at 35px 100px, rgba(255,255,255,0.8) 8px, transparent 8px),
                               radial-gradient(circle at 70px 105px, rgba(255,255,255,0.8) 7px, transparent 7px),
                               radial-gradient(circle at 105px 110px, rgba(255,255,255,0.8) 10px, transparent 10px),
                               radial-gradient(circle at 140px 100px, rgba(255,255,255,0.8) 6px, transparent 6px),
                               radial-gradient(circle at 175px 115px, rgba(255,255,255,0.8) 9px, transparent 9px);
          --kawaii-dark-bg: #b2ebf2;
          --kawaii-light-dots-hover: radial-gradient(circle at 15px 0px, rgba(255,255,255,0.9) 8px, transparent 8px),
                                     radial-gradient(circle at 45px 5px, rgba(255,255,255,0.9) 10px, transparent 10px),
                                     radial-gradient(circle at 80px 0px, rgba(255,255,255,0.9) 7px, transparent 7px),
                                     radial-gradient(circle at 115px 8px, rgba(255,255,255,0.9) 9px, transparent 9px),
                                     radial-gradient(circle at 150px 2px, rgba(255,255,255,0.9) 6px, transparent 6px),
                                     radial-gradient(circle at 185px 10px, rgba(255,255,255,0.9) 11px, transparent 11px),
                                     radial-gradient(circle at 20px 25px, rgba(255,255,255,0.9) 7px, transparent 7px),
                                     radial-gradient(circle at 55px 30px, rgba(255,255,255,0.9) 8px, transparent 8px),
                                     radial-gradient(circle at 90px 20px, rgba(255,255,255,0.9) 12px, transparent 12px),
                                     radial-gradient(circle at 125px 35px, rgba(255,255,255,0.9) 6px, transparent 6px),
                                     radial-gradient(circle at 160px 25px, rgba(255,255,255,0.9) 9px, transparent 9px),
                                     radial-gradient(circle at 195px 30px, rgba(255,255,255,0.9) 7px, transparent 7px),
                                     radial-gradient(circle at 30px 50px, rgba(255,255,255,0.9) 10px, transparent 10px),
                                     radial-gradient(circle at 65px 55px, rgba(255,255,255,0.9) 8px, transparent 8px),
                                     radial-gradient(circle at 100px 45px, rgba(255,255,255,0.9) 6px, transparent 6px),
                                     radial-gradient(circle at 135px 60px, rgba(255,255,255,0.9) 11px, transparent 11px),
                                     radial-gradient(circle at 170px 50px, rgba(255,255,255,0.9) 9px, transparent 9px),
                                     radial-gradient(circle at 10px 75px, rgba(255,255,255,0.9) 7px, transparent 7px),
                                     radial-gradient(circle at 45px 80px, rgba(255,255,255,0.9) 10px, transparent 10px),
                                     radial-gradient(circle at 80px 70px, rgba(255,255,255,0.9) 8px, transparent 8px),
                                     radial-gradient(circle at 115px 85px, rgba(255,255,255,0.9) 6px, transparent 6px),
                                     radial-gradient(circle at 150px 75px, rgba(255,255,255,0.9) 12px, transparent 12px),
                                     radial-gradient(circle at 185px 80px, rgba(255,255,255,0.9) 9px, transparent 9px),
                                     radial-gradient(circle at 35px 100px, rgba(255,255,255,0.9) 8px, transparent 8px),
                                     radial-gradient(circle at 70px 105px, rgba(255,255,255,0.9) 7px, transparent 7px),
                                     radial-gradient(circle at 105px 110px, rgba(255,255,255,0.9) 10px, transparent 10px),
                                     radial-gradient(circle at 140px 100px, rgba(255,255,255,0.9) 6px, transparent 6px),
                                     radial-gradient(circle at 175px 115px, rgba(255,255,255,0.9) 9px, transparent 9px);
        }
        
        .like-button {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background-color: var(--like-bg, ${style.bgColor});
          color: var(--like-text, ${style.textColor});
          border: 2px solid var(--like-border, ${style.borderColor});
          border-radius: var(--like-radius, 4px);
          box-shadow: 3px 3px 0px var(--like-shadow, ${style.shadowColor});
          cursor: pointer;
          font-family: var(--like-font, 'Courier New', 'MS Gothic', 'ＭＳ ゴシック', monospace);
          font-size: var(--like-font-size, 14px);
          font-weight: bold;
          user-select: none;
          transition: all 0.2s ease;
          opacity: ${isLoading ? '0.6' : '1'};
          position: relative;
        }
        
        .like-button.retro::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 255, 65, 0.15) 2px,
            rgba(0, 255, 65, 0.15) 4px
          );
          pointer-events: none;
          z-index: 100;
          border-radius: inherit;
        }
        .like-button.final {
          position: relative;
          overflow: hidden;
        }
        .like-button.final::before {
          content: '';
          position: absolute;
          top: -60%;
          left: -60%;
          width: 180%;
          height: 180%;
          background: radial-gradient(circle at 25% 25%, #add8e6 5%, rgba(173, 216, 230, 0.4) 30%, rgba(173, 216, 230, 0.1) 60%, rgba(173, 216, 230, 0) 100%);
          pointer-events: none;
          z-index: 1;
        }
        .like-button.final::after {
          content: '';
          position: absolute;
          top: -60%;
          right: -60%;
          width: 180%;
          height: 180%;
          background: radial-gradient(circle at 75% 25%, #000080 5%, rgba(0, 0, 128, 0.4) 30%, rgba(0, 0, 128, 0.1) 60%, rgba(0, 0, 128, 0) 100%);
          pointer-events: none;
          z-index: 1;
        }
        .like-button.final .gradient-bottom-left {
          position: absolute;
          bottom: -60%;
          left: -60%;
          width: 180%;
          height: 180%;
          background: radial-gradient(circle at 25% 75%, #9c27b0 5%, rgba(156, 39, 176, 0.4) 30%, rgba(156, 39, 176, 0.1) 60%, rgba(156, 39, 176, 0) 100%);
          pointer-events: none;
          z-index: 1;
        }
        .like-button.final .gradient-bottom-right {
          position: absolute;
          bottom: -60%;
          right: -60%;
          width: 180%;
          height: 180%;
          background: radial-gradient(circle at 75% 75%, #000033 5%, rgba(0, 0, 51, 0.4) 30%, rgba(0, 0, 51, 0.1) 60%, rgba(0, 0, 51, 0) 100%);
          pointer-events: none;
          z-index: 1;
        }
        .like-button.final .heart-icon,
        .like-button.final .like-count {
          position: relative;
          z-index: 2;
        }
        
        .like-button:hover:not(.loading) {
          background: var(--like-hover-bg, ${style.hoverBgColor});
          transform: translate(-1px, -1px);
          box-shadow: 4px 4px 0px var(--like-shadow, ${style.shadowColor});
        }
        
        .like-button.kawaii {
          background-color: var(--kawaii-light-bg);
          background-image: var(--kawaii-light-dots);
        }
        
        .like-button.kawaii:hover:not(.loading) {
          background-color: var(--kawaii-dark-bg);
          background-image: var(--kawaii-light-dots-hover);
        }
        
        .like-button.mom {
          background-image: 
            repeating-linear-gradient(45deg, rgba(76, 175, 80, 0.7), rgba(76, 175, 80, 0.7) 10px, transparent 10px, transparent 20px),
            repeating-linear-gradient(-45deg, rgba(255, 255, 0, 0.5), rgba(255, 255, 0, 0.5) 10px, transparent 10px, transparent 20px);
        }
        .like-button.mom,
        .like-button.mom .heart-icon,
        .like-button.mom .like-count {
          text-shadow: -1px -1px 0px white, 1px -1px 0px white, -1px 1px 0px white, 1px 1px 0px white;
        }
        .like-button.retro,
        .like-button.retro .heart-icon,
        .like-button.retro .like-count {
          text-shadow: 0 0 3px currentColor;
        }
        .like-text.retro {
          text-shadow: 0 0 3px currentColor;
        }
        .like-button.final .heart-icon,
        .like-button.final .like-count {
          text-shadow: 1px 1px 0px black;
        }
        .like-text.final {
          text-shadow: 1px 1px 0px black;
        }
        
        .heart-icon {
          font-size: var(--like-icon-size, 16px);
          line-height: 1;
          color: var(--like-icon-color, ${currentIconColor});
          width: 16px;
          text-align: center;
          display: inline-block;
          position: relative;
          z-index: 10;
        }
        
        .like-count {
          font-family: 'Courier New', 'MS Gothic', 'ＭＳ ゴシック', monospace;
          min-width: 20px;
          text-align: center;
          position: relative;
          z-index: 10;
        }
        
        .loading {
          cursor: pointer !important;
          opacity: 0.7;
        }
        
        .like-button:disabled {
          cursor: pointer !important;
        }
      </style>
      
      <button class="like-button ${isLoading ? 'loading' : ''} ${theme || ''}" ${isLoading ? 'disabled' : ''}>
        ${theme === 'final' ? '<div class="gradient-bottom-left"></div><div class="gradient-bottom-right"></div>' : ''}
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


