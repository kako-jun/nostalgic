/**
 * Nostalgic Yokoso Web Component
 * 招き猫が喋るウェルカムメッセージ
 *
 * Usage / 使用方法:
 * <script src="/components/yokoso.js"></script>
 * <nostalgic-yokoso id="your-yokoso-id" theme="dark" lang="en"></nostalgic-yokoso>
 */

// i18n translations
const YOKOSO_I18N = {
  ja: {
    errorIdRequired: "エラー: id属性が必要です",
    loading: "読み込み中...",
  },
  en: {
    errorIdRequired: "Error: id attribute is required",
    loading: "Loading...",
  },
};

function getYokosoLang(element) {
  const lang = element?.getAttribute("lang") || navigator.language?.split("-")[0] || "en";
  return lang === "ja" ? "ja" : "en";
}

function getYokosoTranslations(element) {
  return YOKOSO_I18N[getYokosoLang(element)] || YOKOSO_I18N.en;
}

class NostalgicYokoso extends HTMLElement {
  // APIのベースURL
  static apiBaseUrl = "https://api.nostalgic.llll-ll.com";

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.yokosoData = null;
    this.isLoading = false;
  }

  static get observedAttributes() {
    return ["id", "theme", "format", "lang"];
  }

  get t() {
    return getYokosoTranslations(this);
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
    this.loadYokosoData();
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this.loadYokosoData();
    }
  }

  async loadYokosoData() {
    const id = this.safeGetAttribute("id");
    if (!id) {
      this.renderError(this.t.errorIdRequired);
      return;
    }

    this.isLoading = true;
    this.renderLoading();

    try {
      const baseUrl = this.safeGetAttribute("api-base") || NostalgicYokoso.apiBaseUrl;
      const apiUrl = `${baseUrl}/yokoso?action=get&id=${encodeURIComponent(id)}`;

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const responseData = await response.json();
      if (responseData.success) {
        this.yokosoData = responseData.data;
      } else {
        throw new Error(responseData.error || "API returned an error");
      }
    } catch (error) {
      console.error("nostalgic-yokoso: Failed to load data:", error);
      this.yokosoData = { message: "", mode: "badge", name: null, avatar: null };
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

  renderLoading() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          color: #666;
          font-size: 12px;
        }
      </style>
      <span>${this.t.loading}</span>
    `;
  }

  render() {
    const theme = this.safeGetAttribute("theme");
    const format = this.safeGetAttribute("format");

    if (!this.safeGetAttribute("id")) {
      this.renderError(this.t.errorIdRequired);
      return;
    }

    // SVG画像形式の場合
    if (format === "image") {
      const baseUrl = this.safeGetAttribute("api-base") || NostalgicYokoso.apiBaseUrl;
      const id = this.safeGetAttribute("id");
      const apiUrl = `${baseUrl}/yokoso?action=get&id=${encodeURIComponent(id)}&format=image`;

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
        <img src="${apiUrl}" alt="yokoso message" loading="lazy" />
      `;
      return;
    }

    if (!this.yokosoData) {
      this.renderLoading();
      return;
    }

    const message = this.yokosoData.message || "";
    const name = this.yokosoData.name || "Lucky Cat";
    const avatar = this.yokosoData.avatar;
    const updatedAt = this.yokosoData.updatedAt;

    // テーマ別のスタイル
    const themeStyles = {
      light: {
        bgColor: "#ffffff",
        textColor: "#000000",
        borderColor: "#000000",
        shadowColor: "#000000",
        labelBg: "#555",
      },
      dark: {
        bgColor: "#2a2a2a",
        textColor: "#ffffff",
        borderColor: "#ffffff",
        shadowColor: "#ffffff",
        labelBg: "#555",
      },
      retro: {
        bgColor: "#0d1117",
        textColor: "#00ff41",
        borderColor: "#00ff41",
        shadowColor: "#00ff41",
        labelBg: "#003300",
      },
      kawaii: {
        bgColor: "#ffe4ec",
        textColor: "#ff69b4",
        borderColor: "#9c27b0",
        shadowColor: "#9c27b0",
        labelBg: "#ff69b4",
      },
      mom: {
        bgColor: "#98fb98",
        textColor: "#2d4a2b",
        borderColor: "#ff8c00",
        shadowColor: "#ff8c00",
        labelBg: "#4d6b4a",
      },
      final: {
        bgColor: "#0000ff",
        textColor: "#ffffff",
        borderColor: "#ffffff",
        shadowColor: "#ffffff",
        labelBg: "#000080",
      },
    };

    // デフォルトテーマはdark
    const style = themeStyles[theme] || themeStyles.dark;

    // カードモード（SVG版と同じレイアウト）
    const dateStr = updatedAt ? this.formatDate(updatedAt) : "";

    // デフォルトアバター（招き猫）
    const avatarUrl =
      avatar ||
      `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16">
      <rect width="16" height="16" fill="#fff5e6"/>
      <ellipse cx="8" cy="11" rx="6" ry="5" fill="#fff5e6" stroke="#d4a574" stroke-width="0.5"/>
      <circle cx="8" cy="6" r="5" fill="#fff5e6" stroke="#d4a574" stroke-width="0.5"/>
      <path d="M4 3 L3 0 L5.5 2 Z" fill="#fff5e6" stroke="#d4a574" stroke-width="0.3"/>
      <path d="M12 3 L13 0 L10.5 2 Z" fill="#fff5e6" stroke="#d4a574" stroke-width="0.3"/>
      <path d="M4 2.5 L3.5 1 L5 2 Z" fill="#ffb6c1"/>
      <path d="M12 2.5 L12.5 1 L11 2 Z" fill="#ffb6c1"/>
      <ellipse cx="6" cy="5.5" rx="1" ry="1.2" fill="#333"/>
      <ellipse cx="10" cy="5.5" rx="1" ry="1.2" fill="#333"/>
      <circle cx="6.3" cy="5.2" r="0.3" fill="#fff"/>
      <circle cx="10.3" cy="5.2" r="0.3" fill="#fff"/>
      <ellipse cx="8" cy="7" rx="0.6" ry="0.4" fill="#ffb6c1"/>
      <path d="M7 8 Q8 9 9 8" fill="none" stroke="#d4a574" stroke-width="0.4"/>
      <ellipse cx="13" cy="5" rx="2" ry="2.5" fill="#fff5e6" stroke="#d4a574" stroke-width="0.5"/>
      <ellipse cx="8" cy="12" rx="2.5" ry="1.5" fill="#ffd700" stroke="#daa520" stroke-width="0.3"/>
    </svg>`)}`;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
        }
        .yokoso-card {
          font-family: 'BIZ UDGothic', monospace;
          font-size: 14px;
          border-radius: 4px;
          overflow: hidden;
          background-color: ${style.bgColor};
          border: 2px solid ${style.borderColor};
          box-shadow: 3px 3px 0px ${style.shadowColor};
          padding: 12px;
          max-width: 350px;
          position: relative;
        }
        .yokoso-card-header {
          display: flex;
          align-items: flex-start;
          margin-bottom: 8px;
          position: relative;
          z-index: 10;
        }
        .yokoso-card-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          margin-right: 8px;
          object-fit: cover;
          flex-shrink: 0;
        }
        .yokoso-card-meta {
          display: flex;
          flex-direction: column;
        }
        .yokoso-card-name {
          font-weight: bold;
          color: ${style.textColor};
          line-height: 1.2;
        }
        .yokoso-card-date {
          font-size: 10px;
          color: #999;
          margin-top: 2px;
        }
        .yokoso-card-message {
          color: ${style.textColor};
          line-height: 1.5;
          word-break: break-word;
          position: relative;
          z-index: 10;
        }
        /* Retro: 横線オーバーレイ */
        .yokoso-card.retro::after {
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
        .yokoso-card.retro {
          text-shadow: 0 0 3px currentColor;
        }
        .yokoso-card.mom {
          text-shadow: 1px 1px 0px white;
        }
        /* Final: グラデーションオーバーレイ */
        .yokoso-card.final {
          text-shadow: 1px 1px 0px black;
          overflow: hidden;
        }
        .yokoso-card.final::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 150%;
          height: 150%;
          background: radial-gradient(circle at 20% 20%, #add8e6 5%, rgba(173, 216, 230, 0.4) 30%, rgba(173, 216, 230, 0.1) 60%, rgba(173, 216, 230, 0) 100%);
          pointer-events: none;
          z-index: 1;
        }
        .yokoso-card.final::after {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 150%;
          height: 150%;
          background: radial-gradient(circle at 80% 20%, #000080 5%, rgba(0, 0, 128, 0.4) 30%, rgba(0, 0, 128, 0.1) 60%, rgba(0, 0, 128, 0) 100%);
          pointer-events: none;
          z-index: 1;
        }
        .gradient-bottom-left {
          position: absolute;
          bottom: -50%;
          left: -50%;
          width: 150%;
          height: 150%;
          background: radial-gradient(circle at 20% 80%, #9c27b0 5%, rgba(156, 39, 176, 0.4) 30%, rgba(156, 39, 176, 0.1) 60%, rgba(156, 39, 176, 0) 100%);
          pointer-events: none;
          z-index: 1;
        }
        .gradient-bottom-right {
          position: absolute;
          bottom: -50%;
          right: -50%;
          width: 150%;
          height: 150%;
          background: radial-gradient(circle at 80% 80%, #000033 5%, rgba(0, 0, 51, 0.4) 30%, rgba(0, 0, 51, 0.1) 60%, rgba(0, 0, 51, 0) 100%);
          pointer-events: none;
          z-index: 1;
        }
      </style>
      <div class="yokoso-card ${theme || ""}">
        ${theme === "final" ? '<div class="gradient-bottom-left"></div><div class="gradient-bottom-right"></div>' : ""}
        <div class="yokoso-card-header">
          <img class="yokoso-card-avatar" src="${this.escapeHtml(avatarUrl)}" alt="avatar" />
          <div class="yokoso-card-meta">
            <span class="yokoso-card-name">${this.escapeHtml(name)}</span>
            <span class="yokoso-card-date">${dateStr}</span>
          </div>
        </div>
        <div class="yokoso-card-message">${this.escapeHtml(message)}</div>
      </div>
    `;
  }

  escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  formatDate(dateString) {
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      // 言語に応じてフォーマットを変更
      const lang = getYokosoLang(this);
      if (lang === "en") {
        return `${month}-${day}-${year}`;
      }
      return `${year}-${month}-${day}`;
    } catch (e) {
      return dateString;
    }
  }
}

// カスタム要素として登録
if (!customElements.get("nostalgic-yokoso")) {
  customElements.define("nostalgic-yokoso", NostalgicYokoso);
}
