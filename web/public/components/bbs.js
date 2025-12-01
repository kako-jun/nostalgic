/**
 * Nostalgic BBS Web Component
 *
 * 使用方法:
 * <script src="/components/bbs.js"></script>
 * <nostalgic-bbs id="your-bbs-id" page="1" theme="dark"></nostalgic-bbs>
 */

// バリデーション定数は不要になりました（API側でデフォルト値処理）

class NostalgicBBS extends HTMLElement {
  // スクリプトが読み込まれたドメインを自動検出
  static apiBaseUrl = (() => {
    const scripts = document.querySelectorAll('script[src*="bbs.js"]');
    for (const script of scripts) {
      const src = script.getAttribute("src");
      if (src && src.includes("bbs.js")) {
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
    this.bbsData = null;
    this.loading = false;
    this.currentPage = 1;
    this.posting = false;
    this.editMode = false;
    this.editingMessageId = null;
  }

  static get observedAttributes() {
    return ["id", "page", "theme", "format"];
  }

  // 安全なアトリビュート処理
  safeGetAttribute(name) {
    const value = this.getAttribute(name);

    switch (name) {
      case "page":
        return value;

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

  async connectedCallback() {
    // 最初にBBSデータを読み込んで最終ページを取得
    await this.loadBBSData();
    // 最終ページに設定（最新の投稿を表示）
    const lastPage = this.bbsData?.totalPages || 1;
    this.currentPage = this.safeGetAttribute("page") || lastPage;
    this.setAttribute("page", this.currentPage.toString());
    // 最終ページのデータを再読み込み
    if (this.currentPage !== 1) {
      await this.loadBBSData();
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // 安全な値に変換
    const safeValue = this.safeGetAttribute(name);

    if (name === "page") {
      this.currentPage = safeValue || 1;
      this.loadBBSData();
    } else {
      this.loadBBSData();
    }
  }

  async loadBBSData() {
    const id = this.safeGetAttribute("id");
    if (!id) {
      this.renderError("ID attribute is required");
      return;
    }

    try {
      this.loading = true;
      this.render();

      const response = await fetch(
        `${NostalgicBBS.apiBaseUrl}/api/bbs?action=display&id=${encodeURIComponent(id)}&page=${this.currentPage}`
      );
      const data = await response.json();

      if (data.success) {
        this.bbsData = data.data;
      } else {
        this.renderError(data.error || "Failed to load BBS data");
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

  async changePage(newPage) {
    this.currentPage = newPage;
    this.setAttribute("page", newPage.toString());
    await this.loadBBSData();
  }

  render() {
    const theme = this.getAttribute("theme") || "dark";

    if (!this.bbsData) {
      this.shadowRoot.innerHTML = `
        <style>
          .bbs-container {
            font-family: 'Courier New', monospace;
            background: #f0f0f0;
            border: 2px solid #333;
            padding: 10px;
            border-radius: 4px;
            box-shadow: 3px 3px 0px #333;
            min-width: 300px;
            max-width: 600px;
          }
          .loading {
            color: #666;
            text-align: center;
            padding: 20px;
          }
        </style>
        <div class="bbs-container">
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
        shadowColor: "#000000",
        headerBg: "#e8e8e8",
        headerColor: "#000000",
        messageBg: "#ffffff",
        textColor: "#000000",
        scrollbarThumb: "#cccccc",
        scrollbarHover: "#999999",
      },
      dark: {
        bgColor: "#2a2a2a",
        borderColor: "#ffffff",
        shadowColor: "#ffffff",
        headerBg: "#000000",
        headerColor: "#ffffff",
        messageBg: "#2a2a2a",
        textColor: "#ffffff",
        scrollbarThumb: "#555555",
        scrollbarHover: "#777777",
      },
      kawaii: {
        bgColor: "#e0f7fa",
        borderColor: "#9c27b0",
        shadowColor: "#9c27b0",
        headerBg: "#b2ebf2",
        headerColor: "#ff69b4",
        messageBg: "#e0f7fa",
        textColor: "#ff69b4",
        scrollbarThumb: "#ff69b4",
        scrollbarHover: "#e91e63",
      },
      retro: {
        bgColor: "#0d1117",
        borderColor: "#00ff41",
        shadowColor: "#00ff41",
        headerBg: "#161b22",
        headerColor: "#00ff41",
        messageBg: "#0d1117",
        textColor: "#00ff41",
        scrollbarThumb: "#00ff41",
        scrollbarHover: "#41ff00",
      },
      mom: {
        bgColor: "#d8f5d8",
        borderColor: "#ff8c00",
        shadowColor: "#ff8c00",
        headerBg: "#98fb98",
        headerColor: "#2d4a2b",
        messageBg: "#d8f5d8",
        textColor: "#2d4a2b",
        scrollbarThumb: "#ff8c00",
        scrollbarHover: "#ffad33",
      },
      final: {
        bgColor: "#0000ff",
        borderColor: "#ffffff",
        shadowColor: "#ffffff",
        headerBg: "transparent",
        headerColor: "#ffffff",
        messageBg: "transparent",
        textColor: "#f0f0f0",
        scrollbarThumb: "#ffffff",
        scrollbarHover: "#f0f0f0",
      },
    };

    const style = themeStyles[theme] || themeStyles.dark;
    // サーバーから取得したメッセージを逆順にして表示（新しいものが下に表示される）
    const messages = (this.bbsData.messages || []).slice();
    const pagination = this.bbsData.pagination || {};

    // 連番計算：現在のページの開始番号を計算
    const currentPage = pagination.page || 1;
    const perPage = pagination.perPage || 10;
    const startNumber = (currentPage - 1) * perPage;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          /* CSS Variables for customization */
          --bbs-bg-color: ${style.bgColor};
          --bbs-border-color: ${style.borderColor};
          --bbs-shadow-color: ${style.shadowColor};
          --bbs-header-bg: ${style.headerBg};
          --bbs-header-color: ${style.headerColor};
          --bbs-message-bg: ${style.messageBg};
          --bbs-text-color: ${style.textColor};
          --bbs-scrollbar-thumb: ${style.scrollbarThumb || style.borderColor};
          --bbs-scrollbar-hover: ${style.scrollbarHover || style.textColor};
          --bbs-border-radius: 4px;
          --bbs-width: 480px;
          --bbs-message-padding: 6px;
          --bbs-message-margin: 4px;
          --bbs-max-height: 400px;
          display: block;
          width: 480px;
          max-width: 100%;
          margin: 0 auto;
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
        .bbs-container {
          font-family: var(--bbs-font-family, 'Courier New', monospace);
          background: var(--bbs-bg-color);
          border: 2px solid var(--bbs-border-color);
          border-radius: var(--bbs-border-radius);
          box-shadow: 3px 3px 0px var(--bbs-shadow-color);
          width: 100%;
          width: min(var(--bbs-width), 100%);
          box-sizing: border-box;
          position: relative;
        }
        .bbs-container.retro::after {
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
        .bbs-container.final {
          position: relative;
          overflow: hidden;
        }
        .bbs-container.final::before {
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
        .bbs-container.final::after {
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
        .bbs-container.final .gradient-bottom-left {
          position: absolute;
          bottom: -50%;
          left: -50%;
          width: 150%;
          height: 150%;
          background: radial-gradient(circle at 20% 80%, #9c27b0 5%, rgba(156, 39, 176, 0.4) 30%, rgba(156, 39, 176, 0.1) 60%, rgba(156, 39, 176, 0) 100%);
          pointer-events: none;
          z-index: 1;
        }
        .bbs-container.final .gradient-bottom-right {
          position: absolute;
          bottom: -50%;
          right: -50%;
          width: 150%;
          height: 150%;
          background: radial-gradient(circle at 80% 80%, #000033 5%, rgba(0, 0, 51, 0.4) 30%, rgba(0, 0, 51, 0.1) 60%, rgba(0, 0, 51, 0) 100%);
          pointer-events: none;
          z-index: 1;
        }
        .bbs-container.final .bbs-header,
        .bbs-container.final .bbs-messages,
        .bbs-container.final .post-form {
          position: relative;
          z-index: 10;
        }
        .bbs-header {
          background-color: var(--bbs-header-bg);
          color: var(--bbs-header-color);
          padding: var(--bbs-header-padding, 8px);
          text-align: center;
          font-weight: bold;
          border-bottom: 2px solid var(--bbs-border-color);
        }
        .bbs-header.kawaii {
          background-color: var(--kawaii-dark-bg);
          background-image: var(--kawaii-dark-dots);
          background-size: 220px 120px;
          background-repeat: repeat;
        }
        .bbs-header.mom {
          background-image: 
            repeating-linear-gradient(45deg, rgba(216, 245, 216, 0.7), rgba(216, 245, 216, 0.7) 10px, transparent 10px, transparent 20px),
            repeating-linear-gradient(-45deg, rgba(255, 255, 0, 0.5), rgba(255, 255, 0, 0.5) 10px, transparent 10px, transparent 20px);
          text-shadow: -1px -1px 0px white, 1px -1px 0px white, -1px 1px 0px white, 1px 1px 0px white;
        }
        .bbs-header.retro {
          background-image: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 65, 0.03) 2px, rgba(0, 255, 65, 0.03) 4px);
          text-shadow: 0 0 3px currentColor;
        }
        .bbs-header.final {
          background: transparent;
        }
        .bbs-messages {
          height: 400px;
          min-height: 400px;
          max-height: 400px;
          overflow-y: auto;
        }
        .bbs-messages::-webkit-scrollbar {
          width: 8px;
        }
        .bbs-messages::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 2px;
        }
        .bbs-messages::-webkit-scrollbar-thumb {
          background: var(--bbs-scrollbar-thumb);
          border: 1px solid var(--bbs-bg-color);
          border-radius: 6px;
        }
        .bbs-messages::-webkit-scrollbar-thumb:hover {
          background: var(--bbs-scrollbar-hover);
        }
        .message-item {
          background: var(--bbs-message-bg);
          margin: var(--bbs-message-margin);
          padding: var(--bbs-message-padding);
          border: 1px solid var(--bbs-border-color);
          border-radius: var(--bbs-message-border-radius, 2px);
          color: var(--bbs-text-color);
          position: relative;
          z-index: 1;
        }
        .bbs-container.final .message-item {
          z-index: 10;
        }
        .message-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 4px;
          font-size: 12px;
          color: #666;
        }
        .message-time-actions {
          display: flex;
          flex-direction: column;
          gap: 4px;
          align-items: flex-end;
        }
        .message-actions {
          display: flex;
          gap: 4px;
          align-items: center;
        }
        .edit-btn, .delete-btn {
          font-size: 14px;
          padding: 4px;
          border: none;
          background: transparent;
          color: #666;
          cursor: pointer;
          border-radius: 2px;
          line-height: 1;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .edit-btn:hover, .delete-btn:hover {
          opacity: 0.6;
        }
        .message-author {
          font-weight: bold;
          font-size: 12px;
          font-family: 'Courier New', 'MS Gothic', 'ＭＳ ゴシック', monospace;
        }
        .message-time {
          font-size: 12px;
          font-family: 'Courier New', 'MS Gothic', 'ＭＳ ゴシック', monospace;
        }
        .message-content {
          margin: 4px 0;
          line-height: 1.4;
          word-wrap: break-word;
          word-break: break-word;
          overflow-wrap: break-word;
          font-family: 'Courier New', 'MS Gothic', 'ＭＳ ゴシック', monospace;
          white-space: pre-wrap;
          text-align: left;
          font-size: clamp(12px, 2vw, 16px);
        }
        .bbs-container.retro .message-content {
          text-shadow: 0 0 3px currentColor;
        }
        .message-meta {
          font-size: 10px;
          color: #999;
          margin-top: 4px;
        }
        .bbs-container.mom .message-item {
          border: 2px solid #ff8c00;
          background: transparent;
        }
        .bbs-container.mom .message-author,
        .bbs-container.mom .message-time,
        .bbs-container.mom .message-content,
        .bbs-container.mom .pagination,
        .bbs-container.mom .pagination button,
        .bbs-container.mom input,
        .bbs-container.mom textarea,
        .bbs-container.mom select,
        .bbs-container.mom button {
          text-shadow: -1px -1px 0px white, 1px -1px 0px white, -1px 1px 0px white, 1px 1px 0px white;
        }
        .bbs-container.final .bbs-header,
        .bbs-container.final .message-author,
        .bbs-container.final .message-time,
        .bbs-container.final .message-content,
        .bbs-container.final .pagination,
        .bbs-container.final .pagination button,
        .bbs-container.final .current-page,
        .bbs-container.final input,
        .bbs-container.final textarea,
        .bbs-container.final select,
        .bbs-container.final button,
        .bbs-container.final .form-header,
        .bbs-container.final label {
          text-shadow: 1px 1px 0px black;
          position: relative;
          z-index: 10;
        }
        .pagination {
          padding: 10px;
          text-align: center;
          border-top: 1px solid var(--bbs-border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }
        .pagination button {
          background: var(--bbs-header-bg);
          color: var(--bbs-header-color);
          border: 1px solid var(--bbs-border-color);
          padding: 4px 8px;
          cursor: pointer;
          font-family: inherit;
          font-size: 12px;
        }
        .pagination button:hover {
          opacity: 0.8;
        }
        .pagination button:disabled {
          opacity: 0.5;
          cursor: default;
        }
        .pagination .current-page {
          font-size: 12px;
          font-family: inherit;
          color: var(--bbs-text-color);
          padding: 4px 8px;
        }
        .bbs-container.final .pagination {
          border-top: 1px solid #ffffff;
        }
        .bbs-container.final .pagination button {
          background: transparent;
          color: #ffffff;
          border: 1px solid #ffffff;
        }
        .bbs-container.final .pagination .current-page {
          color: #ffffff;
        }
        .bbs-container.final .loading,
        .bbs-container.final .message-header,
        .bbs-container.final .edit-btn,
        .bbs-container.final .delete-btn,
        .bbs-container.final .empty-message {
          color: #999999;
        }
        .bbs-container.final input::placeholder,
        .bbs-container.final textarea::placeholder {
          color: #999999 !important;
        }
        .empty-message {
          text-align: center;
          padding: 20px;
          color: #666;
          font-size: 14px;
        }
        /* Font balancing for Japanese-English mixed text in header only */
        .bbs-header .jp-text {
          font-size: 0.85em;
          font-feature-settings: "palt" 1;
        }
        .bbs-header .en-text {
          font-size: 1.05em;
          font-weight: bold;
          letter-spacing: -0.02em;
        }
        .post-form {
          border-top: 2px solid var(--bbs-border-color);
        }
        .form-header {
          background-color: var(--bbs-header-bg);
          color: var(--bbs-header-color);
          padding: 6px 8px;
          text-align: center;
          font-weight: bold;
          font-size: 14px;
          margin-bottom: 8px;
          border-bottom: 1px solid var(--bbs-border-color);
        }
        .form-header.kawaii {
          background-color: var(--kawaii-dark-bg);
          background-image: var(--kawaii-dark-dots);
          background-size: 220px 120px;
          background-repeat: repeat;
        }
        .form-header.mom {
          background-image: 
            repeating-linear-gradient(45deg, rgba(216, 245, 216, 0.7), rgba(216, 245, 216, 0.7) 10px, transparent 10px, transparent 20px),
            repeating-linear-gradient(-45deg, rgba(255, 255, 0, 0.5), rgba(255, 255, 0, 0.5) 10px, transparent 10px, transparent 20px);
          text-shadow: -1px -1px 0px white, 1px -1px 0px white, -1px 1px 0px white, 1px 1px 0px white;
        }
        .form-header.retro {
          background-image: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 65, 0.03) 2px, rgba(0, 255, 65, 0.03) 4px);
          text-shadow: 0 0 3px currentColor;
        }
        .form-header.final {
          background: transparent;
        }
        .form-body {
          padding: 0 5px;
        }
        .form-row {
          margin-bottom: 6px;
          display: flex;
          gap: 6px;
          align-items: flex-start;
          flex-wrap: wrap;
        }
        @media (max-width: 480px) {
          .form-row {
            flex-direction: column;
          }
          .form-row input[type="text"],
          .form-row select {
            flex: 1 1 100%;
            width: 100%;
          }
          .form-row.button-right {
            align-items: flex-end;
          }
        }
        .form-row input, .form-row select, .form-row textarea {
          font-family: inherit;
          font-size: 12px;
          padding: 4px 6px;
          border: 1px solid var(--bbs-border-color);
          border-radius: 2px;
          background: var(--bbs-message-bg);
          color: var(--bbs-text-color);
          height: 32px;
          box-sizing: border-box;
        }
        .form-row input[type="text"] {
          flex: 2;
          font-family: 'Courier New', 'MS Gothic', 'ＭＳ ゴシック', monospace;
          min-width: 0;
        }
        .form-row select {
          flex: 1;
          min-width: 0;
        }
        .form-row textarea {
          flex: 1;
          width: 100%;
          resize: vertical;
          min-height: 60px;
          height: auto;
          font-family: 'Courier New', 'MS Gothic', 'ＭＳ ゴシック', monospace;
        }
        .form-row button {
          font-family: inherit;
          font-size: 12px;
          padding: 6px 12px;
          background: var(--bbs-header-bg);
          color: var(--bbs-header-color);
          border: 1px solid var(--bbs-border-color);
          border-radius: 2px;
          cursor: pointer;
          font-weight: bold;
        }
        .form-row button:hover:not(:disabled) {
          opacity: 0.8;
        }
        .form-row button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .form-row button.kawaii {
          /* 投稿ボタンなどは水玉なしで濃い水色背景のみ */
        }
        .form-row.button-right {
          justify-content: flex-end !important;
        }
        .message-area {
          margin: 8px 0;
          padding: 6px 8px;
          border-radius: 2px;
          font-size: 12px;
          display: none;
        }
        .message-area.error {
          background: #ffebee;
          border: 1px solid #f44336;
          color: #d32f2f;
        }
        .message-area.success {
          background: #e8f5e8;
          border: 1px solid #4caf50;
          color: #2e7d32;
        }
      </style>
      <div class="bbs-container ${theme}">
        ${theme === "final" ? '<div class="gradient-bottom-left"></div><div class="gradient-bottom-right"></div>' : ""}
        <div class="bbs-header ${theme}">${this.formatMixedText(this.bbsData.settings?.title || "BBS")}</div>
        <div class="bbs-messages">
          ${
            messages.length > 0
              ? messages
                  .map(
                    (message, index) => `
              <div class="message-item">
                <div class="message-header">
                  <span class="message-author"><span style="display:inline-block;min-width:2em;text-align:right;">${startNumber + index + 1}.</span> ${this.escapeHtml(message.author || "Anonymous")}${this.formatSelectValues(message)}</span>
                  <div class="message-time-actions">
                    <span class="message-time">${this.formatDate(message.timestamp)}</span>
                    <div class="message-actions">
                      <button class="edit-btn" onclick="this.getRootNode().host.editMessage('${message.id}')">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                      </button>
                      <button class="delete-btn" onclick="this.getRootNode().host.deleteMessage('${message.id}')">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                <div class="message-content">${this.escapeHtml(message.message || "")}</div>
              </div>
            `
                  )
                  .join("")
              : `<div class="empty-message">まだメッセージがありません</div>`
          }
        </div>
        ${
          pagination.totalPages > 1
            ? `
          <div class="pagination">
            ${this.generatePageButtons(pagination)}
          </div>
        `
            : ""
        }
        <div class="post-form">
            <div class="form-header ${theme}">コメントを投稿</div>
            <div class="form-body">
              <div class="form-row">
                <input type="text" id="message-author" placeholder="名前（省略可、20文字まで）" maxlength="20" spellcheck="false">
                ${this.generateSelectDropdowns()}
              </div>
              <div class="form-row">
                <textarea id="message-content" placeholder="メッセージを入力（200文字まで）" maxlength="200" rows="5" spellcheck="false"></textarea>
              </div>
              <div class="form-row button-right">
                <button id="post-button" class="${theme}" onclick="this.getRootNode().host.postMessage()">投稿</button>
              </div>
              <div class="message-area" id="form-message"></div>
            </div>
          </div>
      </div>
    `;
  }

  renderError(message) {
    this.shadowRoot.innerHTML = `
      <style>
        .error-container {
          font-family: 'Courier New', monospace;
          background: #ffebee;
          border: 2px solid #f44336;
          padding: 10px;
          border-radius: 4px;
          color: #d32f2f;
          font-size: 12px;
          min-width: 300px;
        }
      </style>
      <div class="error-container">
        ❌ ${message}
      </div>
    `;
  }

  generateSelectDropdowns() {
    let dropdowns = "";

    // 設定されているセレクトオプションを生成
    if (this.bbsData?.settings) {
      const settings = this.bbsData.settings;

      // 標準セレクト
      if (
        settings.standardSelect &&
        settings.standardSelect.options &&
        settings.standardSelect.options.length > 0
      ) {
        dropdowns += `
          <select id="standard-select">
            <option value="">${this.escapeHtml(settings.standardSelect.label || "セレクト")}</option>
            ${settings.standardSelect.options
              .map(
                (option) =>
                  `<option value="${this.escapeHtml(option)}">${this.escapeHtml(option)}</option>`
              )
              .join("")}
          </select>
        `;
      }

      // インクリメンタルセレクト
      if (
        settings.incrementalSelect &&
        settings.incrementalSelect.options &&
        settings.incrementalSelect.options.length > 0
      ) {
        dropdowns += `
          <select id="incremental-select">
            <option value="">${this.escapeHtml(settings.incrementalSelect.label || "セレクト")}</option>
            ${settings.incrementalSelect.options
              .map(
                (option) =>
                  `<option value="${this.escapeHtml(option)}">${this.escapeHtml(option)}</option>`
              )
              .join("")}
          </select>
        `;
      }

      // エモートセレクト
      if (
        settings.emoteSelect &&
        settings.emoteSelect.options &&
        settings.emoteSelect.options.length > 0
      ) {
        dropdowns += `
          <select id="emote-select">
            <option value="">${this.escapeHtml(settings.emoteSelect.label || "セレクト")}</option>
            ${settings.emoteSelect.options
              .map(
                (option) =>
                  `<option value="${this.escapeHtml(option)}">${this.escapeHtml(option)}</option>`
              )
              .join("")}
          </select>
        `;
      }
    }

    return dropdowns;
  }

  formatSelectValues(message) {
    const values = [];
    if (message.standardValue) values.push(`${message.standardValue}`);
    if (message.incrementalValue) values.push(`${message.incrementalValue}`);
    if (message.emoteValue) values.push(`${message.emoteValue}`);
    return values.length > 0 ? ` [${values.join(", ")}]` : "";
  }

  showMessage(text, type = "error") {
    const messageArea = this.shadowRoot.querySelector("#form-message");
    if (messageArea) {
      messageArea.textContent = text;
      messageArea.className = `message-area ${type}`;
      messageArea.style.display = "block";

      // 3秒後に自動で消去
      setTimeout(() => {
        messageArea.style.display = "none";
      }, 3000);
    }
  }

  async postMessage() {
    const id = this.safeGetAttribute("id");

    if (!id) {
      this.showMessage("エラー: メッセージ投稿にid属性が必要です");
      return;
    }

    const authorInput = this.shadowRoot.querySelector("#message-author");
    const messageInput = this.shadowRoot.querySelector("#message-content");
    const standardSelect = this.shadowRoot.querySelector("#standard-select");
    const incrementalSelect = this.shadowRoot.querySelector("#incremental-select");
    const emoteSelect = this.shadowRoot.querySelector("#emote-select");

    // 安全な入力値検証
    if (!authorInput || !messageInput) {
      this.showMessage("エラー: フォーム要素が見つかりません");
      return;
    }

    let rawAuthor = "";
    let rawMessage = "";
    let rawStandardValue = "";
    let rawIncrementalValue = "";
    let rawEmoteValue = "";

    // 存在チェックと型チェック
    try {
      rawAuthor = (typeof authorInput.value === "string" ? authorInput.value : "").trim();
      // メッセージは前側のスペースを保持（アスキーアート調整のため）、後ろのみトリミング
      rawMessage = (typeof messageInput.value === "string" ? messageInput.value : "").replace(
        /\s+$/,
        ""
      );
      rawStandardValue =
        standardSelect && typeof standardSelect.value === "string" ? standardSelect.value : "";
      rawIncrementalValue =
        incrementalSelect && typeof incrementalSelect.value === "string"
          ? incrementalSelect.value
          : "";
      rawEmoteValue = emoteSelect && typeof emoteSelect.value === "string" ? emoteSelect.value : "";
    } catch (error) {
      this.showMessage("エラー: 入力値の取得に失敗しました");
      return;
    }

    // 致命的エラー防止のみ（軽微なバリデーションはAPI側に任せる）
    const author = typeof rawAuthor === "string" ? rawAuthor || "ああああ" : "ああああ";
    const message = typeof rawMessage === "string" ? rawMessage : "";
    const standardValue = typeof rawStandardValue === "string" ? rawStandardValue : "";
    const incrementalValue = typeof rawIncrementalValue === "string" ? rawIncrementalValue : "";
    const emoteValue = typeof rawEmoteValue === "string" ? rawEmoteValue : "";

    // 致命的な状態のみチェック
    if (typeof author !== "string" || typeof message !== "string") {
      console.error("Fatal: author or message is not a string");
      return;
    }

    this.posting = true;
    this.updatePostButton();

    try {
      const baseUrl = this.getAttribute("api-base") || NostalgicBBS.apiBaseUrl;
      let apiUrl;

      if (this.editMode && this.editingMessageId) {
        // 編集モード
        const storageKey = `bbs_edit_${this.getAttribute("id")}`;
        const tokens = JSON.parse(localStorage.getItem(storageKey) || "{}");
        const editToken = tokens[this.editingMessageId];

        if (!editToken) {
          this.showMessage("編集権限がありません");
          return;
        }

        apiUrl = `${baseUrl}/api/bbs?action=editMessageById&id=${encodeURIComponent(id)}&messageId=${encodeURIComponent(this.editingMessageId)}&editToken=${encodeURIComponent(editToken)}&author=${encodeURIComponent(author)}&message=${encodeURIComponent(message)}${standardValue ? `&standardValue=${encodeURIComponent(standardValue)}` : ""}${incrementalValue ? `&incrementalValue=${encodeURIComponent(incrementalValue)}` : ""}${emoteValue ? `&emoteValue=${encodeURIComponent(emoteValue)}` : ""}`;
      } else {
        // 新規投稿モード
        apiUrl = `${baseUrl}/api/bbs?action=post&id=${encodeURIComponent(id)}&author=${encodeURIComponent(author)}&message=${encodeURIComponent(message)}${standardValue ? `&standardValue=${encodeURIComponent(standardValue)}` : ""}${incrementalValue ? `&incrementalValue=${encodeURIComponent(incrementalValue)}` : ""}${emoteValue ? `&emoteValue=${encodeURIComponent(emoteValue)}` : ""}`;
      }

      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.success) {
        // editTokenをlocalStorageに保存（新規投稿の場合のみ）
        if (!this.editMode && data.data && data.data.editToken && data.data.messageId) {
          const storageKey = `bbs_edit_${this.getAttribute("id")}`;
          const existingTokens = JSON.parse(localStorage.getItem(storageKey) || "{}");
          existingTokens[data.data.messageId] = data.data.editToken;
          localStorage.setItem(storageKey, JSON.stringify(existingTokens));
        }

        // 成功: フォームをクリアして再読み込み
        authorInput.value = "";
        messageInput.value = "";
        if (standardSelect) standardSelect.value = "";
        if (incrementalSelect) incrementalSelect.value = "";
        if (emoteSelect) emoteSelect.value = "";

        // 編集モードをクリア
        this.clearEditMode();

        // 新しい投稿が表示される最後のページに移動して再読み込み
        await this.loadBBSData();
        const lastPage = this.bbsData.totalPages || 1;
        this.currentPage = lastPage;
        this.setAttribute("page", lastPage.toString());
        await this.loadBBSData();

        // 成功メッセージ
        if (this.editMode) {
          this.showMessage("メッセージを更新しました", "success");
        } else {
          this.showMessage("メッセージを投稿しました", "success");
        }
      } else {
        throw new Error(data.error || "Failed to post message");
      }
    } catch (error) {
      console.error("Post message failed:", error);
      this.showMessage(`メッセージの投稿に失敗しました: ${error.message}`);
    } finally {
      this.posting = false;
      this.updatePostButton();
    }
  }

  updatePostButton() {
    const button = this.shadowRoot.querySelector("#post-button");
    if (button) {
      button.disabled = this.posting;
      if (this.posting) {
        button.textContent = this.editMode ? "更新中..." : "投稿中...";
      } else {
        button.textContent = this.editMode ? "更新" : "投稿";
      }
    }
  }

  formatDate(dateString) {
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    } catch (e) {
      return dateString;
    }
  }

  // 編集モードをクリア
  clearEditMode() {
    this.editMode = false;
    this.editingMessageId = null;
    const postButton = this.shadowRoot.querySelector("#post-button");
    if (postButton) {
      postButton.textContent = "投稿";
    }
  }

  // ページングボタン生成
  generatePageButtons(pagination) {
    const messagesPerPage = this.bbsData.messagesPerPage || 10;
    const totalPages = pagination.totalPages;
    const currentPage = pagination.page;

    let buttons = [];

    for (let page = 1; page <= totalPages; page++) {
      const startNum = (page - 1) * messagesPerPage + 1;
      const endNum = Math.min(page * messagesPerPage, this.bbsData.totalMessages || 0);

      let label;
      if (page === totalPages && endNum === startNum) {
        // 最終ページで1つだけの場合
        label = `${startNum}-`;
      } else if (page === totalPages) {
        // 最終ページの場合
        label = `${startNum}-${endNum}`;
      } else {
        // 通常のページ
        label = `${startNum}-${endNum}`;
      }

      if (page === currentPage) {
        buttons.push(`<span class="current-page">${label}</span>`);
      } else {
        buttons.push(
          `<button onclick="this.getRootNode().host.changePage(${page})">${label}</button>`
        );
      }
    }

    return buttons.join(" ");
  }

  // メッセージ編集
  editMessage(messageId) {
    // localStorageからeditTokenを取得
    const storageKey = `bbs_edit_${this.getAttribute("id")}`;
    const tokens = JSON.parse(localStorage.getItem(storageKey) || "{}");

    if (!tokens[messageId]) {
      this.showMessage("このメッセージを編集する権限がありません");
      return;
    }

    // メッセージデータを取得
    const message = this.bbsData.messages.find((m) => m.id === messageId);
    if (!message) {
      this.showMessage("メッセージが見つかりません");
      return;
    }

    // フォームに内容を読み込み
    const authorInput = this.shadowRoot.querySelector("#message-author");
    const messageInput = this.shadowRoot.querySelector("#message-content");
    const standardSelect = this.shadowRoot.querySelector("#standard-select");
    const incrementalSelect = this.shadowRoot.querySelector("#incremental-select");
    const emoteSelect = this.shadowRoot.querySelector("#emote-select");

    authorInput.value = message.author || "";
    messageInput.value = message.message || "";
    if (standardSelect && message.standardValue) {
      standardSelect.value = message.standardValue;
    }
    if (incrementalSelect && message.incrementalValue) {
      incrementalSelect.value = message.incrementalValue;
    }
    if (emoteSelect && message.emoteValue) {
      emoteSelect.value = message.emoteValue;
    }

    // 編集モードに変更
    this.editMode = true;
    this.editingMessageId = messageId;

    const postButton = this.shadowRoot.querySelector("#post-button");
    if (postButton) {
      postButton.textContent = "更新";
    }

    // フォームまでスクロール
    const postForm = this.shadowRoot.querySelector(".post-form");
    if (postForm) {
      postForm.scrollIntoView({ behavior: "smooth" });
    }
  }

  // メッセージ削除
  async deleteMessage(messageId) {
    // localStorageからeditTokenを取得
    const storageKey = `bbs_edit_${this.getAttribute("id")}`;
    const tokens = JSON.parse(localStorage.getItem(storageKey) || "{}");

    if (!tokens[messageId]) {
      this.showMessage("このメッセージを削除する権限がありません");
      return;
    }

    if (!confirm("このメッセージを削除しますか？")) {
      return;
    }

    try {
      const baseUrl = this.getAttribute("api-base") || NostalgicBBS.apiBaseUrl;
      const deleteUrl = `${baseUrl}/api/bbs?action=deleteMessageById&id=${encodeURIComponent(this.getAttribute("id"))}&messageId=${encodeURIComponent(messageId)}&editToken=${encodeURIComponent(tokens[messageId])}`;

      const response = await fetch(deleteUrl);
      const data = await response.json();

      if (data.success) {
        // localStorageからトークンを削除
        delete tokens[messageId];
        localStorage.setItem(storageKey, JSON.stringify(tokens));

        // BBSデータを再読み込み
        await this.loadBBSData();
        this.showMessage("メッセージが削除されました", "success");
      } else {
        throw new Error(data.error || "Failed to delete message");
      }
    } catch (error) {
      console.error("Delete message failed:", error);
      this.showMessage(`メッセージの削除に失敗しました: ${error.message}`);
    }
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    // 全角スペースを半角スペース2つに変換
    return div.innerHTML.replace(/　/g, "  ");
  }

  formatMixedText(text) {
    const escapedText = this.escapeHtml(text);
    // 日本語文字（ひらがな、カタカナ、漢字）を検出
    const japanesePattern = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;
    // 英数字を検出
    const englishPattern = /[a-zA-Z0-9]/;

    return escapedText.replace(/(.)/g, (char) => {
      if (japanesePattern.test(char)) {
        return `<span class="jp-text">${char}</span>`;
      } else if (englishPattern.test(char)) {
        return `<span class="en-text">${char}</span>`;
      } else {
        return char;
      }
    });
  }
}

// Web Componentを登録
if (!customElements.get("nostalgic-bbs")) {
  customElements.define("nostalgic-bbs", NostalgicBBS);
}
