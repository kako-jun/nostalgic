/**
 * Nostalgic Like Web Component
 *
 * Usage / 使用方法:
 * <script src="/components/like.js"></script>
 * <nostalgic-like id="your-like-id" theme="dark" icon="heart" format="interactive" lang="en"></nostalgic-like>
 */

// i18n translations
const LIKE_I18N = {
  ja: {
    errorIdRequired: "エラー: id属性が必要です",
    networkError: "ネットワークエラー",
    errors: {
      "Like service not found": "いいねサービスが見つかりません",
      "id is required": "ID が必要です",
      "API returned an error": "APIエラーが発生しました",
      "Rate limit exceeded. Please try again later.":
        "アクセスが集中しています。\nしばらくしてからもう一度お試しください",
    },
  },
  en: {
    errorIdRequired: "Error: id attribute is required",
    networkError: "Network error",
    errors: {
      "Like service not found": "Like service not found",
      "id is required": "id is required",
      "API returned an error": "API returned an error",
      "Rate limit exceeded. Please try again later.":
        "Rate limit exceeded.\nPlease try again later.",
    },
  },
};

function getLikeLang(element) {
  const lang = element?.getAttribute("lang") || navigator.language?.split("-")[0] || "en";
  return lang === "ja" ? "ja" : "en";
}

function getLikeTranslations(element) {
  return LIKE_I18N[getLikeLang(element)] || LIKE_I18N.en;
}

function translateLikeError(message, element) {
  const t = getLikeTranslations(element);
  if (t.errors[message]) {
    return t.errors[message];
  }
  return message;
}

class NostalgicLike extends HTMLElement {
  // APIのベースURL
  static apiBaseUrl = "https://api.nostalgic.llll-ll.com";
  static batchDelayMs = 16;
  static cacheTtlMs = 5000;
  static maxBatchSize = 1000;
  static dataCache = new Map();
  static batchQueues = new Map();
  static instances = new Map();

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.likeData = null;
    this.isLoading = false;
  }

  static get observedAttributes() {
    return ["id", "theme", "icon", "format", "lang", "api-base"];
  }

  static cacheKey(baseUrl, id) {
    return `${baseUrl}|${id}`;
  }

  static getCachedData(key) {
    const cached = NostalgicLike.dataCache.get(key);
    if (!cached || cached.expiresAt <= Date.now()) {
      NostalgicLike.dataCache.delete(key);
      return null;
    }
    return cached.data;
  }

  static setCachedData(baseUrl, id, data) {
    const key = NostalgicLike.cacheKey(baseUrl, id);
    NostalgicLike.dataCache.set(key, {
      data,
      expiresAt: Date.now() + NostalgicLike.cacheTtlMs,
    });
    NostalgicLike.notifyInstances(key, data);
  }

  static registerInstance(instance, baseUrl, id) {
    const key = NostalgicLike.cacheKey(baseUrl, id);
    instance.likeKey = key;
    if (!NostalgicLike.instances.has(key)) {
      NostalgicLike.instances.set(key, new Set());
    }
    NostalgicLike.instances.get(key).add(instance);
  }

  static unregisterInstance(instance) {
    if (!instance.likeKey) return;
    const set = NostalgicLike.instances.get(instance.likeKey);
    if (set) {
      set.delete(instance);
      if (set.size === 0) {
        NostalgicLike.instances.delete(instance.likeKey);
      }
    }
    instance.likeKey = null;
  }

  static notifyInstances(key, data) {
    const set = NostalgicLike.instances.get(key);
    if (!set) return;
    for (const instance of set) {
      instance.likeData = data;
      instance.isLoading = false;
      instance.render();
    }
  }

  static requestLikeData(baseUrl, id) {
    const key = NostalgicLike.cacheKey(baseUrl, id);
    const cached = NostalgicLike.getCachedData(key);
    if (cached) {
      return Promise.resolve(cached);
    }

    return new Promise((resolve, reject) => {
      let queue = NostalgicLike.batchQueues.get(baseUrl);
      if (!queue) {
        queue = { ids: new Set(), resolvers: new Map(), timer: null };
        NostalgicLike.batchQueues.set(baseUrl, queue);
      }

      queue.ids.add(id);
      if (!queue.resolvers.has(id)) {
        queue.resolvers.set(id, []);
      }
      queue.resolvers.get(id).push({ resolve, reject });

      if (!queue.timer) {
        queue.timer = setTimeout(() => {
          NostalgicLike.flushBatch(baseUrl);
        }, NostalgicLike.batchDelayMs);
      }
    });
  }

  static async flushBatch(baseUrl) {
    const queue = NostalgicLike.batchQueues.get(baseUrl);
    if (!queue) return;
    NostalgicLike.batchQueues.delete(baseUrl);

    const ids = [...queue.ids];
    for (let i = 0; i < ids.length; i += NostalgicLike.maxBatchSize) {
      const chunk = ids.slice(i, i + NostalgicLike.maxBatchSize);
      try {
        const response = await fetch(`${baseUrl}/like?action=batchGet`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: chunk }),
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const responseData = await response.json();
        if (!responseData.success) {
          throw new Error(responseData.error || "API returned an error");
        }

        for (const id of chunk) {
          const data = responseData.data?.[id] || { id, total: 0, liked: false };
          NostalgicLike.setCachedData(baseUrl, id, data);
          for (const resolver of queue.resolvers.get(id) || []) {
            resolver.resolve(data);
          }
        }
      } catch (error) {
        for (const id of chunk) {
          for (const resolver of queue.resolvers.get(id) || []) {
            resolver.reject(error);
          }
        }
      }
    }
  }

  static generateLikeSVG(count) {
    const label = "♥ likes";
    const labelWidth = 50;
    const valueWidth = Math.max(String(count).length * 7 + 10, 30);
    const totalWidth = labelWidth + valueWidth;

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20">
  <linearGradient id="smooth" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="round">
    <rect width="${totalWidth}" height="20" rx="3" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#round)">
    <rect width="${labelWidth}" height="20" fill="#555"/>
    <rect x="${labelWidth}" width="${valueWidth}" height="20" fill="#e91e63"/>
    <rect width="${totalWidth}" height="20" fill="url(#smooth)"/>
  </g>
  <g text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
    <text x="${labelWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${label}</text>
    <text x="${labelWidth / 2}" y="14" fill="#fff">${label}</text>
    <text x="${labelWidth + valueWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${count}</text>
    <text x="${labelWidth + valueWidth / 2}" y="14" fill="#fff">${count}</text>
  </g>
</svg>`;
  }

  get t() {
    return getLikeTranslations(this);
  }

  // 安全なアトリビュート処理
  safeGetAttribute(name) {
    const value = this.getAttribute(name);

    switch (name) {
      case "id":
        if (!value || typeof value !== "string" || value.trim() === "") {
          return null;
        }
        return value.trim();

      case "theme":
        return value;

      case "icon":
        return value;

      case "format":
        return value;

      default:
        return value;
    }
  }

  loadFont() {
    const fontId = "nostalgic-biz-udgothic-font";
    if (!document.getElementById(fontId)) {
      const link = document.createElement("link");
      link.id = fontId;
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=BIZ+UDGothic&display=swap";
      document.head.appendChild(link);
    }
  }

  connectedCallback() {
    this.loadFont();
    this.loadLikeData();
  }

  disconnectedCallback() {
    NostalgicLike.unregisterInstance(this);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (this.isConnected) {
      if (name === "id" || name === "api-base") {
        NostalgicLike.unregisterInstance(this);
        this.loadLikeData();
      } else {
        this.render();
      }
    }
  }

  async loadLikeData() {
    const id = this.safeGetAttribute("id");
    if (!id) {
      this.renderError(this.t.errorIdRequired);
      return;
    }

    this.isLoading = true;

    try {
      const baseUrl = this.safeGetAttribute("api-base") || NostalgicLike.apiBaseUrl;
      NostalgicLike.registerInstance(this, baseUrl, id);
      this.likeData = await NostalgicLike.requestLikeData(baseUrl, id);
    } catch (error) {
      console.error("nostalgic-like: Failed to load data:", error);
      this.likeData = { total: 0, liked: false };
    }

    this.isLoading = false;
    this.render();
  }

  async toggleLike() {
    const id = this.safeGetAttribute("id");
    if (!id || this.isLoading) return;

    this.isLoading = true;

    try {
      const baseUrl = this.safeGetAttribute("api-base") || NostalgicLike.apiBaseUrl;
      const toggleUrl = `${baseUrl}/like?action=toggle&id=${encodeURIComponent(id)}`;

      const response = await fetch(toggleUrl);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const responseData = await response.json();
      if (responseData.success) {
        this.likeData = responseData.data;
        NostalgicLike.setCachedData(baseUrl, id, responseData.data);
      } else {
        throw new Error(translateLikeError(responseData.error || "API returned an error", this));
      }
    } catch (error) {
      // Like ボタンは小さなインライン Widget のため、トグル失敗時に本体をエラー表示へ置き換えない（サイレント劣化が意図）。
      // エラー内容は console に出す。translateLikeError は将来エラーを可視化する場合に備えた整備。
      console.error("nostalgic-like: Toggle failed:", error);
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
          /* 案内文は文単位で \n を挿入しているため、改行をそのまま反映する。 */
          white-space: pre-line;
        }
      </style>
      <span>${message}</span>
    `;
  }

  render() {
    const theme = this.safeGetAttribute("theme");
    const icon = this.safeGetAttribute("icon");
    const format = this.safeGetAttribute("format");

    if (!this.safeGetAttribute("id")) {
      this.renderError(this.t.errorIdRequired);
      return;
    }

    // SVG画像形式の場合
    if (format === "image") {
      const total = this.likeData ? this.likeData.total : 0;

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
        ${NostalgicLike.generateLikeSVG(total)}
      `;
      return;
    }

    // テキスト形式の場合（数字のみ）
    if (format === "text") {
      const isLoading = this.isLoading;
      const total = this.likeData ? this.likeData.total : 0;
      const userLiked = this.likeData ? this.likeData.liked : false;

      // テーマ別デフォルト色（ボタン版textColorと完全一致）
      const textThemes = {
        light: {
          color: "#000000",
          hoverColor: "#333333",
        },
        dark: {
          color: "#ffffff",
          hoverColor: "#cccccc",
        },
        retro: {
          color: "#00ff41",
          hoverColor: "#00cc33",
        },
        kawaii: {
          color: "#ff69b4",
          hoverColor: "#ff4081",
        },
        mom: {
          color: "#2d4a2b",
          hoverColor: "#1a3319",
        },
        final: {
          color: "#ffffff",
          hoverColor: "#ffffff",
        },
      };

      // デフォルトテーマはdark
      const currentTheme = textThemes[theme] || textThemes.dark;
      const textStyle = currentTheme;
      const likedClass = userLiked ? "liked" : "unliked";

      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: inline;
            /* CSS Custom Properties for external customization */
            --like-text-color: ${textStyle.color};
            --like-text-hover-color: ${textStyle.hoverColor};
          }
          .like-text {
            cursor: pointer;
            text-decoration: underline;
            font-family: inherit;
            font-size: inherit;
            opacity: ${isLoading ? "0.6" : "1"};
            transition: color 0.2s ease;
          }
          .like-text {
            color: var(--like-text-color, ${textStyle.color});
          }
          .like-text:hover:not(.loading) {
            color: var(--like-text-hover-color, ${textStyle.hoverColor});
          }
          .like-text.mom {
            text-shadow: 1px 1px 0px white;
          }
          .like-text.final {
            text-shadow: 1px 1px 0px black;
          }
          .like-text.retro {
            text-shadow: 0 0 3px currentColor;
          }
        </style>
        <span class="like-text ${isLoading ? "loading" : ""} ${theme || ""}" onclick="this.getRootNode().host.toggleLike()">${total}</span>
      `;
      return;
    }

    const isLoading = this.isLoading;
    const total = this.likeData ? this.likeData.total : 0;
    const userLiked = this.likeData ? this.likeData.liked : false;

    // アイコンマッピング（幅を統一するため同じ文字を使用）
    const iconMapping = {
      heart: "♥",
      star: "★",
      thumb: "👍",
      peta: "🐾",
    };

    const displayIcon = iconMapping[icon] || iconMapping.heart;

    // アイコンの色設定（テーマ別）
    const getIconColor = () => {
      if (theme === "light") {
        return userLiked ? "#000000" : "#999999";
      } else if (theme === "dark") {
        return userLiked ? "#ffffff" : "#666666";
      } else if (theme === "retro") {
        return userLiked ? "#00ff41" : "#00cc33";
      } else if (theme === "kawaii") {
        if (icon === "heart") return userLiked ? "#ff69b4" : "#f06292";
        if (icon === "star") return userLiked ? "#ff69b4" : "#f06292";
        if (icon === "thumb") return userLiked ? "#ff69b4" : "#f06292";
        if (icon === "peta") return userLiked ? "#ff69b4" : "#f06292";
      } else if (theme === "mom") {
        return userLiked ? "#2d4a2b" : "#4d6b4a";
      } else if (theme === "final") {
        return userLiked ? "#ffffff" : "#e0e0e0";
      }
      // デフォルト（dark）
      return userLiked ? "#ffffff" : "#666666";
    };

    const currentIconColor = getIconColor();

    // テーマ別のスタイル
    const themeStyles = {
      light: {
        bgColor: "#ffffff",
        hoverBgColor: "#f5f5f5",
        textColor: "#000000",
        borderColor: "#000000",
        shadowColor: "#000000",
      },
      dark: {
        bgColor: "#2a2a2a",
        hoverBgColor: "#333333",
        textColor: "#ffffff",
        borderColor: "#ffffff",
        shadowColor: "#ffffff",
      },
      retro: {
        bgColor: "#0d1117",
        hoverBgColor: "#161b22",
        textColor: "#00ff41",
        borderColor: "#00ff41",
        shadowColor: "#00ff41",
      },
      kawaii: {
        bgColor: "#e0f7fa",
        hoverBgColor: "#b2ebf2",
        textColor: "#ff69b4",
        borderColor: "#9c27b0",
        shadowColor: "#9c27b0",
      },
      mom: {
        bgColor: "#98fb98",
        hoverBgColor: "#a5d6a7",
        textColor: "#2d4a2b",
        borderColor: "#ff8c00",
        shadowColor: "#ff8c00",
      },
      final: {
        bgColor: "#0000ff",
        hoverBgColor: "#3333ff",
        textColor: "#ffffff",
        borderColor: "#ffffff",
        shadowColor: "#ffffff",
      },
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
          font-family: var(--like-font, 'BIZ UDGothic', monospace);
          font-size: var(--like-font-size, 14px);
          font-weight: bold;
          user-select: none;
          transition: all 0.2s ease;
          opacity: ${isLoading ? "0.6" : "1"};
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
            repeating-linear-gradient(45deg, rgba(216, 245, 216, 0.7), rgba(216, 245, 216, 0.7) 10px, transparent 10px, transparent 20px),
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
          font-family: 'BIZ UDGothic', monospace;
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
      
      <button class="like-button ${isLoading ? "loading" : ""} ${theme || ""}" ${isLoading ? "disabled" : ""}>
        ${theme === "final" ? '<div class="gradient-bottom-left"></div><div class="gradient-bottom-right"></div>' : ""}
        <span class="heart-icon">${displayIcon}</span>
        <span class="like-count">${total}</span>
      </button>
    `;

    // クリックイベントを追加
    if (!isLoading) {
      this.shadowRoot.querySelector(".like-button").addEventListener("click", () => {
        this.toggleLike();
      });
    }
  }
}

// カスタム要素として登録
if (!customElements.get("nostalgic-like")) {
  customElements.define("nostalgic-like", NostalgicLike);
}
