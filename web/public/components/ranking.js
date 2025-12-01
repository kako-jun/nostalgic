/**
 * Nostalgic Ranking Web Component (Read-only)
 *
 * 使用方法:
 * <script src="/components/ranking.js"></script>
 * <nostalgic-ranking id="your-ranking-id" limit="10" theme="dark"></nostalgic-ranking>
 */

// バリデーション定数は不要になりました（API側でデフォルト値処理）

class NostalgicRanking extends HTMLElement {
  // スクリプトが読み込まれたドメインを自動検出
  static apiBaseUrl = (() => {
    const scripts = document.querySelectorAll('script[src*="ranking.js"]');
    for (const script of scripts) {
      const src = script.getAttribute("src");
      if (src && src.includes("ranking.js")) {
        try {
          const url = new URL(src, window.location.href);
          return url.origin;
        } catch (e) {
          console.warn("Failed to parse script URL:", src);
        }
      }
    }
    // フォールバック: 現在のドメインを使用
    return window.location.origin;
  })();

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.rankingData = null;
    this.loading = false;
  }

  static get observedAttributes() {
    return ["id", "limit", "theme", "format"];
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

      case "limit":
        return value;

      case "theme":
        return value;

      case "format":
        return value;

      default:
        return value;
    }
  }

  connectedCallback() {
    this.loadRankingData();
  }

  attributeChangedCallback() {
    this.loadRankingData();
  }

  async loadRankingData() {
    const id = this.safeGetAttribute("id");
    if (!id) {
      this.renderError("ID attribute is required");
      return;
    }

    const limit = this.getAttribute("limit");

    try {
      this.loading = true;
      this.render();

      let url = `${NostalgicRanking.apiBaseUrl}/api/ranking?action=display&id=${encodeURIComponent(id)}`;
      if (limit) {
        url += `&limit=${encodeURIComponent(limit)}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        this.rankingData = data.data;
      } else {
        this.renderError(data.error || "Failed to load ranking data");
        return;
      }
    } catch (error) {
      this.renderError(`Network error: ${error.message}`);
      return;
    } finally {
      this.loading = false;
    }

    this.render();
  }

  render() {
    const theme = this.safeGetAttribute("theme");

    if (!this.rankingData) {
      this.shadowRoot.innerHTML = `
        <style>
          .ranking-container {
            font-family: 'Courier New', 'MS Gothic', 'ＭＳ ゴシック', monospace;
            background: #f0f0f0;
            border: 2px solid #333;
            padding: 10px;
            border-radius: 4px;
            box-shadow: 3px 3px 0px #333;
            min-width: 300px;
          }
          .loading {
            color: #666;
            text-align: center;
            padding: 20px;
          }
        </style>
        <div class="ranking-container">
          <div class="loading">${this.loading ? "読み込み中..." : "データがありません"}</div>
        </div>
      `;
      return;
    }

    // テーマ別のスタイル
    const themeStyles = {
      light: {
        bgColor: "#ffffff",
        borderColor: "#000000",
        headerBg: "#e8e8e8",
        headerColor: "#000000",
        textColor: "#000000",
      },
      dark: {
        bgColor: "#2a2a2a",
        borderColor: "#ffffff",
        headerBg: "#000000",
        headerColor: "#ffffff",
        textColor: "#ffffff",
      },
      retro: {
        bgColor: "#0d1117",
        borderColor: "#00ff41",
        headerBg: "#161b22",
        headerColor: "#00ff41",
        textColor: "#00ff41",
      },
      kawaii: {
        bgColor: "#e0f7fa",
        borderColor: "#9c27b0",
        headerBg: "#b2ebf2",
        headerColor: "#ff69b4",
        textColor: "#ff69b4",
      },
      mom: {
        bgColor: "#d8f5d8",
        borderColor: "#ff8c00",
        headerBg: "#98fb98",
        headerColor: "#2d4a2b",
        textColor: "#2d4a2b",
      },
      final: {
        bgColor: "#0000ff",
        borderColor: "#ffffff",
        headerBg: "transparent",
        headerColor: "#ffffff",
        textColor: "#ffffff",
      },
    };

    const style = themeStyles[theme] || themeStyles.dark;
    const entries = this.rankingData.entries || [];

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 480px;
          max-width: 100%;
          margin: 0 auto;
          /* CSS Variables for customization */
          --ranking-bg-color: ${style.bgColor};
          --ranking-border-color: ${style.borderColor};
          --ranking-header-bg: ${style.headerBg};
          --ranking-header-color: ${style.headerColor};
          --ranking-text-color: ${style.textColor};
          --ranking-padding: 10px;
          --ranking-border-radius: 4px;
          --ranking-width: 480px;
          --ranking-item-padding: 6px 10px;
          /* 水玉パターン変数 */
          --kawaii-dark-bg: #b2ebf2;
          --kawaii-dark-dots: radial-gradient(circle at 15px 5px, rgba(255,255,255,0.4) 9px, transparent 9px),
                              radial-gradient(circle at 50px 2px, rgba(255,255,255,0.4) 7px, transparent 7px),
                              radial-gradient(circle at 85px 8px, rgba(255,255,255,0.4) 11px, transparent 11px),
                              radial-gradient(circle at 120px 0px, rgba(255,255,255,0.4) 8px, transparent 8px),
                              radial-gradient(circle at 155px 10px, rgba(255,255,255,0.4) 6px, transparent 6px),
                              radial-gradient(circle at 190px 5px, rgba(255,255,255,0.4) 10px, transparent 10px),
                              radial-gradient(circle at 25px 30px, rgba(255,255,255,0.4) 8px, transparent 8px),
                              radial-gradient(circle at 60px 35px, rgba(255,255,255,0.4) 12px, transparent 12px),
                              radial-gradient(circle at 95px 25px, rgba(255,255,255,0.4) 7px, transparent 7px),
                              radial-gradient(circle at 130px 38px, rgba(255,255,255,0.4) 9px, transparent 9px),
                              radial-gradient(circle at 165px 30px, rgba(255,255,255,0.4) 6px, transparent 6px),
                              radial-gradient(circle at 200px 35px, rgba(255,255,255,0.4) 8px, transparent 8px),
                              radial-gradient(circle at 20px 55px, rgba(255,255,255,0.4) 10px, transparent 10px),
                              radial-gradient(circle at 55px 60px, rgba(255,255,255,0.4) 7px, transparent 7px),
                              radial-gradient(circle at 90px 50px, rgba(255,255,255,0.4) 11px, transparent 11px),
                              radial-gradient(circle at 125px 65px, rgba(255,255,255,0.4) 8px, transparent 8px),
                              radial-gradient(circle at 160px 55px, rgba(255,255,255,0.4) 6px, transparent 6px),
                              radial-gradient(circle at 195px 60px, rgba(255,255,255,0.4) 9px, transparent 9px),
                              radial-gradient(circle at 30px 85px, rgba(255,255,255,0.4) 8px, transparent 8px),
                              radial-gradient(circle at 65px 80px, rgba(255,255,255,0.4) 12px, transparent 12px),
                              radial-gradient(circle at 100px 90px, rgba(255,255,255,0.4) 7px, transparent 7px),
                              radial-gradient(circle at 135px 85px, rgba(255,255,255,0.4) 10px, transparent 10px),
                              radial-gradient(circle at 170px 95px, rgba(255,255,255,0.4) 6px, transparent 6px),
                              radial-gradient(circle at 10px 110px, rgba(255,255,255,0.4) 9px, transparent 9px),
                              radial-gradient(circle at 45px 115px, rgba(255,255,255,0.4) 8px, transparent 8px),
                              radial-gradient(circle at 80px 105px, rgba(255,255,255,0.4) 11px, transparent 11px),
                              radial-gradient(circle at 115px 120px, rgba(255,255,255,0.4) 7px, transparent 7px),
                              radial-gradient(circle at 150px 110px, rgba(255,255,255,0.4) 9px, transparent 9px),
                              radial-gradient(circle at 185px 115px, rgba(255,255,255,0.4) 6px, transparent 6px);
        }
        .ranking-container {
          font-family: var(--ranking-font-family, 'Courier New', 'MS Gothic', 'ＭＳ ゴシック', monospace);
          background: var(--ranking-bg-color);
          border: 2px solid var(--ranking-border-color);
          border-radius: var(--ranking-border-radius);
          box-shadow: 3px 3px 0px var(--ranking-border-color);
          width: 100%;
          width: min(var(--ranking-width), 100%);
          box-sizing: border-box;
          position: relative;
        }
        .ranking-container.retro::after {
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
        .ranking-container.final {
          position: relative;
          overflow: hidden;
        }
        .ranking-container.final::before {
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
        .ranking-container.final::after {
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
        .ranking-container.final .gradient-bottom-left {
          position: absolute;
          bottom: -50%;
          left: -50%;
          width: 150%;
          height: 150%;
          background: radial-gradient(circle at 20% 80%, #9c27b0 5%, rgba(156, 39, 176, 0.4) 30%, rgba(156, 39, 176, 0.1) 60%, rgba(156, 39, 176, 0) 100%);
          pointer-events: none;
          z-index: 1;
        }
        .ranking-container.final .gradient-bottom-right {
          position: absolute;
          bottom: -50%;
          right: -50%;
          width: 150%;
          height: 150%;
          background: radial-gradient(circle at 80% 80%, #000033 5%, rgba(0, 0, 51, 0.4) 30%, rgba(0, 0, 51, 0.1) 60%, rgba(0, 0, 51, 0) 100%);
          pointer-events: none;
          z-index: 1;
        }
        .ranking-container.final .ranking-header,
        .ranking-container.final .ranking-list {
          position: relative;
          z-index: 2;
        }
        .ranking-header {
          background: var(--ranking-header-bg);
          color: var(--ranking-header-color);
          padding: var(--ranking-header-padding, 8px);
          text-align: center;
          font-weight: bold;
          border-bottom: 2px solid var(--ranking-border-color);
          position: relative;
          z-index: 1;
        }
        .ranking-header.kawaii {
          background-color: var(--kawaii-dark-bg);
          background-image: var(--kawaii-dark-dots);
          background-size: 220px 120px;
          background-repeat: repeat;
        }
        .ranking-header.mom {
          background-image: 
            repeating-linear-gradient(45deg, rgba(216, 245, 216, 0.7), rgba(216, 245, 216, 0.7) 10px, transparent 10px, transparent 20px),
            repeating-linear-gradient(-45deg, rgba(255, 255, 0, 0.5), rgba(255, 255, 0, 0.5) 10px, transparent 10px, transparent 20px);
          text-shadow: -1px -1px 0px white, 1px -1px 0px white, -1px 1px 0px white, 1px 1px 0px white;
        }
        .ranking-container.mom .ranking-item,
        .ranking-container.mom .rank,
        .ranking-container.mom .name,
        .ranking-container.mom .score,
        .ranking-container.mom .empty-message {
          text-shadow: -1px -1px 0px white, 1px -1px 0px white, -1px 1px 0px white, 1px 1px 0px white;
        }
        .ranking-header.retro {
          text-shadow: 0 0 3px currentColor;
        }
        .ranking-container.retro .rank,
        .ranking-container.retro .name,
        .ranking-container.retro .score {
          text-shadow: 0 0 3px currentColor;
        }
        .ranking-container.final .ranking-header,
        .ranking-container.final .rank,
        .ranking-container.final .name,
        .ranking-container.final .score,
        .ranking-container.final .empty-message {
          text-shadow: 1px 1px 0px black;
        }
        .ranking-list {
          padding: 10px;
          margin: 0;
          list-style: none;
        }
        .ranking-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--ranking-item-padding);
          border-bottom: 1px solid var(--ranking-border-color);
          color: var(--ranking-text-color);
          position: relative;
          z-index: 1;
        }
        .ranking-item:last-child {
          border-bottom: none;
        }
        .ranking-item:nth-child(1) .rank {
          color: #ffd700;
          font-weight: bold;
        }
        .ranking-item:nth-child(2) .rank {
          color: #c0c0c0;
          font-weight: bold;
        }
        .ranking-item:nth-child(3) .rank {
          color: #cd7f32;
          font-weight: bold;
        }
        .rank {
          min-width: 30px;
          text-align: center;
          font-weight: bold;
        }
        .name {
          flex: 1;
          margin: 0 40px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          text-align: left;
        }
        .score {
          font-weight: bold;
          min-width: 60px;
          text-align: right;
        }
        .empty-message {
          text-align: center;
          padding: 15px;
          color: #666;
          font-size: 14px;
        }
        
        /* Font balancing for Japanese-English mixed text in header only */
        .ranking-header .jp-text {
          font-size: 0.85em;
          font-feature-settings: "palt" 1;
        }
        
        .ranking-header .en-text {
          font-size: 1.05em;
          font-weight: bold;
          letter-spacing: -0.02em;
        }
      </style>
      <div class="ranking-container ${theme || ""}">
        ${theme === "final" ? '<div class="gradient-bottom-left"></div><div class="gradient-bottom-right"></div>' : ""}
        <div class="ranking-header ${theme || ""}">${this.escapeHtml(this.rankingData.settings?.title || "RANKING")}</div>
        ${
          entries.length > 0
            ? `
          <ul class="ranking-list">
            ${entries
              .map(
                (entry, index) => `
              <li class="ranking-item">
                <span class="rank">${entry.rank || index + 1}</span>
                <span class="name">${this.escapeHtml(entry.name || "Anonymous")}</span>
                <span class="score">${entry.displayScore || entry.score || 0}</span>
              </li>
            `
              )
              .join("")}
          </ul>
        `
            : `
          <div class="empty-message">まだランキングがありません</div>
        `
        }
      </div>
    `;
  }

  renderError(message) {
    this.shadowRoot.innerHTML = `
      <style>
        .error-container {
          font-family: 'Courier New', 'MS Gothic', 'ＭＳ ゴシック', monospace;
          background: #ffebee;
          border: 2px solid #f44336;
          padding: 10px;
          border-radius: 4px;
          color: #d32f2f;
          font-size: 12px;
          min-width: 200px;
        }
      </style>
      <div class="error-container">
        ❌ ${message}
      </div>
    `;
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}

// Web Componentを登録
if (!customElements.get("nostalgic-ranking")) {
  customElements.define("nostalgic-ranking", NostalgicRanking);
}
