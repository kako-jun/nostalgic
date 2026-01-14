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
    const mode = this.yokosoData.mode || "badge";
    const name = this.yokosoData.name || "Maneki";
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
        valueBg: "#e91e63",
      },
      dark: {
        bgColor: "#2a2a2a",
        textColor: "#ffffff",
        borderColor: "#ffffff",
        shadowColor: "#ffffff",
        labelBg: "#555",
        valueBg: "#e91e63",
      },
      retro: {
        bgColor: "#0d1117",
        textColor: "#00ff41",
        borderColor: "#00ff41",
        shadowColor: "#00ff41",
        labelBg: "#003300",
        valueBg: "#006600",
      },
      kawaii: {
        bgColor: "#ffe4ec",
        textColor: "#ff69b4",
        borderColor: "#9c27b0",
        shadowColor: "#9c27b0",
        labelBg: "#ff69b4",
        valueBg: "#ffb6c1",
      },
      mom: {
        bgColor: "#98fb98",
        textColor: "#2d4a2b",
        borderColor: "#ff8c00",
        shadowColor: "#ff8c00",
        labelBg: "#4d6b4a",
        valueBg: "#98fb98",
      },
      final: {
        bgColor: "#0000ff",
        textColor: "#ffffff",
        borderColor: "#ffffff",
        shadowColor: "#ffffff",
        labelBg: "#000080",
        valueBg: "#0000ff",
      },
    };

    // デフォルトテーマはdark
    const style = themeStyles[theme] || themeStyles.dark;

    // 招き猫SVGアイコン（インライン）
    const manekiNekoSvg = `<svg viewBox="0 0 16 16" width="20" height="20" style="vertical-align: middle; margin-right: 4px;">
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
    </svg>`;

    // バッジモード
    if (mode === "badge") {
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: inline-block;
          }
          .yokoso-badge {
            display: inline-flex;
            align-items: center;
            font-family: 'BIZ UDGothic', Verdana, Geneva, sans-serif;
            font-size: 14px;
            border-radius: 4px;
            overflow: hidden;
            box-shadow: 2px 2px 0px ${style.shadowColor};
            border: 1px solid ${style.borderColor};
          }
          .yokoso-label {
            background-color: ${style.labelBg};
            color: #fff;
            padding: 4px 8px;
            font-weight: bold;
          }
          .yokoso-value {
            background-color: ${style.valueBg};
            color: #fff;
            padding: 4px 8px;
            display: flex;
            align-items: center;
          }
          .yokoso-badge.retro .yokoso-label,
          .yokoso-badge.retro .yokoso-value {
            text-shadow: 0 0 3px currentColor;
          }
          .yokoso-badge.mom .yokoso-label,
          .yokoso-badge.mom .yokoso-value {
            text-shadow: 1px 1px 0px white;
          }
          .yokoso-badge.final .yokoso-label,
          .yokoso-badge.final .yokoso-value {
            text-shadow: 1px 1px 0px black;
          }
        </style>
        <div class="yokoso-badge ${theme || ""}">
          <span class="yokoso-label">Yokoso</span>
          <span class="yokoso-value">${manekiNekoSvg}${this.escapeHtml(message)}</span>
        </div>
      `;
      return;
    }

    // カードモード
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
          display: flex;
          font-family: 'BIZ UDGothic', Verdana, Geneva, sans-serif;
          font-size: 14px;
          border-radius: 4px;
          overflow: hidden;
          box-shadow: 3px 3px 0px ${style.shadowColor};
          border: 2px solid ${style.borderColor};
          max-width: 330px;
        }
        .yokoso-card-label {
          background-color: ${style.labelBg};
          color: #fff;
          padding: 12px 8px;
          font-weight: bold;
          writing-mode: vertical-rl;
          text-orientation: mixed;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 40px;
        }
        .yokoso-card-content {
          background-color: ${style.bgColor};
          color: ${style.textColor};
          padding: 12px;
          flex: 1;
          min-width: 200px;
        }
        .yokoso-card-header {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
        }
        .yokoso-card-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          margin-right: 8px;
          object-fit: cover;
        }
        .yokoso-card-name {
          font-weight: bold;
        }
        .yokoso-card-message {
          line-height: 1.5;
          margin-bottom: 8px;
          word-break: break-word;
        }
        .yokoso-card-date {
          text-align: right;
          font-size: 11px;
          color: #999;
        }
        .yokoso-card.retro .yokoso-card-label,
        .yokoso-card.retro .yokoso-card-content {
          text-shadow: 0 0 3px currentColor;
        }
        .yokoso-card.mom .yokoso-card-label,
        .yokoso-card.mom .yokoso-card-content {
          text-shadow: 1px 1px 0px white;
        }
        .yokoso-card.final .yokoso-card-label,
        .yokoso-card.final .yokoso-card-content {
          text-shadow: 1px 1px 0px black;
        }
      </style>
      <div class="yokoso-card ${theme || ""}">
        <div class="yokoso-card-label">Yokoso</div>
        <div class="yokoso-card-content">
          <div class="yokoso-card-header">
            <img class="yokoso-card-avatar" src="${this.escapeHtml(avatarUrl)}" alt="avatar" />
            <span class="yokoso-card-name">${this.escapeHtml(name)}</span>
          </div>
          <div class="yokoso-card-message">${this.escapeHtml(message)}</div>
          <div class="yokoso-card-date">${dateStr}</div>
        </div>
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
      if (this.lang === "en") {
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
