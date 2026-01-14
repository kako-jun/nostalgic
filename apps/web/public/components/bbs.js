/**
 * Nostalgic BBS Web Component
 *
 * Usage / 使用方法:
 * <script src="/components/bbs.js"></script>
 * <nostalgic-bbs id="your-bbs-id" page="1" theme="dark" lang="en"></nostalgic-bbs>
 */

// i18n translations
const BBS_I18N = {
  ja: {
    loading: "読み込み中...",
    noData: "データがありません",
    noMessages: "まだメッセージがありません",
    postComment: "コメントを投稿",
    namePlaceholder: "名前（省略可、20文字まで）",
    messagePlaceholder: "メッセージを入力（420文字まで）",
    post: "投稿",
    update: "更新",
    posting: "投稿中...",
    updating: "更新中...",
    select: "セレクト",
    emote: "エモート",
    defaultAuthor: "ああああ",
    messageUpdated: "メッセージを更新しました",
    messagePosted: "メッセージを投稿しました",
    messageDeleted: "メッセージが削除されました",
    confirmDelete: "このメッセージを削除しますか？",
    messageNotFound: "メッセージが見つかりません",
    noEditPermission: "このメッセージを編集する権限がありません",
    noDeletePermission: "このメッセージを削除する権限がありません",
    errorIdRequired: "エラー: メッセージ投稿にid属性が必要です",
    errorFormNotFound: "エラー: フォーム要素が見つかりません",
    errorInputFailed: "エラー: 入力値の取得に失敗しました",
    networkError: "ネットワークエラー",
    errors: {
      "BBS not found": "掲示板が見つかりません",
      "BBS already exists for this URL": "この URL には既に掲示板が存在します",
      "id and message are required": "ID とメッセージが必要です",
      "Message must be 420 characters or less": "メッセージは420文字以内で入力してください",
      "Message not found": "メッセージが見つかりません",
      "You can only edit your own messages": "自分のメッセージのみ編集できます",
      "You can only delete your own messages": "自分のメッセージのみ削除できます",
      "Invalid token": "トークンが無効です",
      "url and token are required": "URL とトークンが必要です",
      "Token must be 8-16 characters": "トークンは8〜16文字で入力してください",
      "Failed to load BBS data": "掲示板データの読み込みに失敗しました",
      "Failed to post message": "メッセージの投稿に失敗しました",
      "Failed to delete message": "メッセージの削除に失敗しました",
    },
    charLimitError: (n) => `メッセージは${n}文字以内で入力してください`,
  },
  en: {
    loading: "Loading...",
    noData: "No data available",
    noMessages: "No messages yet",
    postComment: "Post a comment",
    namePlaceholder: "Name (optional, max 20 chars)",
    messagePlaceholder: "Enter message (max 420 chars)",
    post: "Post",
    update: "Update",
    posting: "Posting...",
    updating: "Updating...",
    select: "Select",
    emote: "Emote",
    defaultAuthor: "Anonymous",
    messageUpdated: "Message updated",
    messagePosted: "Message posted",
    messageDeleted: "Message deleted",
    confirmDelete: "Delete this message?",
    messageNotFound: "Message not found",
    noEditPermission: "You don't have permission to edit this message",
    noDeletePermission: "You don't have permission to delete this message",
    errorIdRequired: "Error: id attribute is required for posting",
    errorFormNotFound: "Error: Form elements not found",
    errorInputFailed: "Error: Failed to get input values",
    networkError: "Network error",
    errors: {
      "BBS not found": "BBS not found",
      "BBS already exists for this URL": "BBS already exists for this URL",
      "id and message are required": "ID and message are required",
      "Message must be 420 characters or less": "Message must be 420 characters or less",
      "Message not found": "Message not found",
      "You can only edit your own messages": "You can only edit your own messages",
      "You can only delete your own messages": "You can only delete your own messages",
      "Invalid token": "Invalid token",
      "url and token are required": "URL and token are required",
      "Token must be 8-16 characters": "Token must be 8-16 characters",
      "Failed to load BBS data": "Failed to load BBS data",
      "Failed to post message": "Failed to post message",
      "Failed to delete message": "Failed to delete message",
    },
    charLimitError: (n) => `Message must be ${n} characters or less`,
  },
};

function getBBSLang(element) {
  const lang = element?.getAttribute("lang") || navigator.language?.split("-")[0] || "en";
  return lang === "ja" ? "ja" : "en";
}

function getBBSTranslations(element) {
  return BBS_I18N[getBBSLang(element)] || BBS_I18N.en;
}

function translateBBSError(message, element) {
  const t = getBBSTranslations(element);
  if (t.errors[message]) {
    return t.errors[message];
  }
  // Dynamic pattern (character limit)
  const charLimitMatch = message.match(/^Message must be (\d+) characters or less$/);
  if (charLimitMatch) {
    return t.charLimitError(charLimitMatch[1]);
  }
  return message;
}

class NostalgicBBS extends HTMLElement {
  // APIのベースURL
  static apiBaseUrl = "https://api.nostalgic.llll-ll.com";

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

  // Load BIZ UDGothic font from Google Fonts
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

  static get observedAttributes() {
    return ["id", "page", "theme", "format", "lang"];
  }

  // Get translations for this element
  get t() {
    return getBBSTranslations(this);
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
    // Load BIZ UDGothic font if not already loaded
    this.loadFont();

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
        `${NostalgicBBS.apiBaseUrl}/bbs?action=get&id=${encodeURIComponent(id)}&page=${this.currentPage}`
      );
      const data = await response.json();

      if (data.success) {
        this.bbsData = data.data;
        // Calculate pagination from API response
        const messagesPerPage = this.bbsData.messagesPerPage || 20;
        const totalMessages = this.bbsData.totalMessages || this.bbsData.messages.length;
        const totalPages = Math.ceil(totalMessages / messagesPerPage) || 1;
        this.bbsData.totalPages = totalPages;
        this.bbsData.pagination = {
          page: this.currentPage,
          perPage: messagesPerPage,
          totalPages: totalPages,
        };
      } else {
        this.renderError(translateBBSError(data.error || "Failed to load BBS data", this));
        return;
      }
    } catch (error) {
      this.renderError(`${this.t.networkError}: ${error.message}`);
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
            font-family: 'BIZ UDGothic', monospace;
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
          <div class="loading">${this.loading ? this.t.loading : this.t.noData}</div>
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

    // 連番計算：投稿順の番号を計算（最古が1番、最新が最大番号）
    const currentPage = pagination.page || 1;
    const perPage = pagination.perPage || 10;
    const totalMessages = this.bbsData.totalMessages || messages.length;
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
          font-family: var(--bbs-font-family, 'BIZ UDGothic', monospace);
          background: var(--bbs-bg-color);
          border: 2px solid var(--bbs-border-color);
          border-radius: var(--bbs-border-radius);
          box-shadow: 3px 3px 0px var(--bbs-shadow-color);
          width: 100%;
          width: min(var(--bbs-width), 100%);
          box-sizing: border-box;
          position: relative;
          line-height: normal;
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
          font-family: 'BIZ UDGothic', monospace;
        }
        .message-time {
          font-size: 12px;
          font-family: 'BIZ UDGothic', monospace;
        }
        .message-content {
          margin: 4px 0;
          line-height: 1.4;
          word-wrap: break-word;
          word-break: break-word;
          overflow-wrap: break-word;
          font-family: 'BIZ UDGothic', monospace;
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
        .bbs-container.final .empty-message {
          text-shadow: 1px 1px 0px black;
        }
        .bbs-container.mom .empty-message {
          text-shadow: -1px -1px 0px white, 1px -1px 0px white, -1px 1px 0px white, 1px 1px 0px white;
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
          font-family: 'BIZ UDGothic', monospace;
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
          font-family: 'BIZ UDGothic', monospace;
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
        #post-button {
          min-width: 80px;
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
        /* Emote Picker */
        .emote-picker-container {
          position: relative;
          display: inline-block;
        }
        .emote-picker-btn {
          font-family: inherit;
          font-size: 12px;
          padding: 4px 8px;
          border: 1px solid var(--bbs-border-color);
          border-radius: 2px;
          background: var(--bbs-message-bg);
          color: var(--bbs-text-color);
          height: 32px;
          box-sizing: border-box;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .emote-picker-btn img {
          width: 20px;
          height: 20px;
          object-fit: cover;
          border-radius: 2px;
        }
        .emote-picker-popup {
          display: none;
          position: absolute;
          bottom: 100%;
          left: 0;
          margin-bottom: 4px;
          background: var(--bbs-message-bg);
          border: 1px solid var(--bbs-border-color);
          border-radius: 4px;
          padding: 6px;
          z-index: 1000;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        .emote-picker-popup.open {
          display: block;
        }
        .emote-picker-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 4px;
        }
        .emote-picker-item {
          width: 40px;
          height: 40px;
          padding: 2px;
          border: 1px solid var(--bbs-border-color);
          border-radius: 4px;
          background: var(--bbs-bg-color);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .emote-picker-item:hover {
          border-color: var(--bbs-header-bg);
          background: var(--bbs-header-bg);
        }
        .emote-picker-item.selected {
          border-color: var(--bbs-header-bg);
          border-width: 2px;
        }
        .emote-picker-item img {
          max-width: 36px;
          max-height: 36px;
          object-fit: contain;
        }
        .emote-display {
          width: 16px;
          height: 16px;
          object-fit: cover;
          border-radius: 2px;
          vertical-align: middle;
          margin-left: 2px;
        }
        .emote-clear {
          font-size: 14px;
          color: #999;
          cursor: pointer;
          padding: 0 2px;
        }
        .emote-clear:hover {
          color: #f44336;
        }
      </style>
      <div class="bbs-container ${theme}">
        ${theme === "final" ? '<div class="gradient-bottom-left"></div><div class="gradient-bottom-right"></div>' : ""}
        <div class="bbs-header ${theme}">${this.escapeHtml(this.bbsData.title || "BBS")}</div>
        <div class="bbs-messages">
          ${
            messages.length > 0
              ? messages
                  .map(
                    (message, index) => `
              <div class="message-item">
                <div class="message-header">
                  <span class="message-author"><span style="display:inline-block;min-width:2em;text-align:right;">${totalMessages - startNumber - index}.</span> ${this.escapeHtml(message.author || this.t.defaultAuthor)}${this.formatSelectValues(message)}</span>
                  <div class="message-time-actions">
                    <span class="message-time">${this.formatDate(message.timestamp)}</span>
                    ${
                      message.userHash === this.bbsData.currentUserHash
                        ? `
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
                    `
                        : ""
                    }
                  </div>
                </div>
                <div class="message-content">${this.escapeHtml(message.message || "")}</div>
              </div>
            `
                  )
                  .join("")
              : `<div class="empty-message">${this.t.noMessages}</div>`
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
            <div class="form-header ${theme}">${this.t.postComment}</div>
            <div class="form-body">
              <div class="form-row">
                <input type="text" id="message-author" name="bbs-author" autocomplete="nickname" placeholder="${this.t.namePlaceholder}" maxlength="20" spellcheck="false">
                ${this.generateSelectDropdowns()}
              </div>
              <div class="form-row">
                <textarea id="message-content" placeholder="${this.t.messagePlaceholder}" maxlength="420" rows="5" spellcheck="false"></textarea>
              </div>
              <div class="form-row button-right">
                <button id="post-button" class="${theme}" onclick="this.getRootNode().host.postMessage()">${this.t.post}</button>
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
          font-family: 'BIZ UDGothic', monospace;
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
            <option value="">${this.escapeHtml(settings.standardSelect.label || this.t.select)}</option>
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
            <option value="">${this.escapeHtml(settings.incrementalSelect.label || this.t.select)}</option>
            ${settings.incrementalSelect.options
              .map(
                (option) =>
                  `<option value="${this.escapeHtml(option)}">${this.escapeHtml(option)}</option>`
              )
              .join("")}
          </select>
        `;
      }

      // エモートセレクト（3x3グリッドポップアップ）
      if (
        settings.emoteSelect &&
        settings.emoteSelect.options &&
        settings.emoteSelect.options.length > 0
      ) {
        const emoteOptions = settings.emoteSelect.options.slice(0, 9); // 最大9個
        dropdowns += `
          <div class="emote-picker-container">
            <input type="hidden" id="emote-select" value="">
            <button type="button" class="emote-picker-btn" id="emote-picker-btn" onclick="this.getRootNode().host.toggleEmotePicker()">
              <span id="emote-picker-label">${this.escapeHtml(settings.emoteSelect.label || this.t.emote)}</span>
            </button>
            <div class="emote-picker-popup" id="emote-picker-popup">
              <div class="emote-picker-grid">
                ${emoteOptions
                  .map(
                    (url) =>
                      `<div class="emote-picker-item" data-emote="${this.escapeHtml(url)}" onclick="this.getRootNode().host.selectEmote('${this.escapeHtml(url)}')">
                        <img src="${this.escapeHtml(url)}" alt="emote" loading="lazy">
                      </div>`
                  )
                  .join("")}
              </div>
            </div>
          </div>
        `;
      }
    }

    return dropdowns;
  }

  formatSelectValues(message) {
    const values = [];
    if (message.standardValue) values.push(this.escapeHtml(message.standardValue));
    if (message.incrementalValue) values.push(this.escapeHtml(message.incrementalValue));
    // emoteValueは別途画像として表示
    let result = values.length > 0 ? ` [${values.join(", ")}]` : "";
    if (message.emoteValue) {
      result += `<img src="${this.escapeHtml(message.emoteValue)}" alt="emote" class="emote-display">`;
    }
    return result;
  }

  toggleEmotePicker() {
    const popup = this.shadowRoot.querySelector("#emote-picker-popup");
    if (popup) {
      popup.classList.toggle("open");
    }
  }

  selectEmote(url) {
    const hiddenInput = this.shadowRoot.querySelector("#emote-select");
    const btn = this.shadowRoot.querySelector("#emote-picker-btn");
    const popup = this.shadowRoot.querySelector("#emote-picker-popup");

    if (hiddenInput) {
      hiddenInput.value = url;
    }

    // ボタンの表示を更新（選択した画像を表示）
    if (btn) {
      btn.innerHTML = `<img src="${this.escapeHtml(url)}" alt="emote"><span class="emote-clear" onclick="event.stopPropagation(); this.getRootNode().host.clearEmoteSelection()">✕</span>`;
    }

    // ポップアップを閉じる
    if (popup) {
      popup.classList.remove("open");
    }

    // 選択状態を更新
    const items = this.shadowRoot.querySelectorAll(".emote-picker-item");
    items.forEach((item) => {
      item.classList.toggle("selected", item.dataset.emote === url);
    });
  }

  clearEmoteSelection() {
    const hiddenInput = this.shadowRoot.querySelector("#emote-select");
    const btn = this.shadowRoot.querySelector("#emote-picker-btn");
    const label = this.bbsData?.settings?.emoteSelect?.label || this.t.emote;

    if (hiddenInput) {
      hiddenInput.value = "";
    }

    if (btn) {
      btn.innerHTML = `<span id="emote-picker-label">${this.escapeHtml(label)}</span>`;
    }

    const items = this.shadowRoot.querySelectorAll(".emote-picker-item");
    items.forEach((item) => item.classList.remove("selected"));
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
      this.showMessage(this.t.errorIdRequired);
      return;
    }

    const authorInput = this.shadowRoot.querySelector("#message-author");
    const messageInput = this.shadowRoot.querySelector("#message-content");
    const standardSelect = this.shadowRoot.querySelector("#standard-select");
    const incrementalSelect = this.shadowRoot.querySelector("#incremental-select");
    const emoteSelect = this.shadowRoot.querySelector("#emote-select");

    // 安全な入力値検証
    if (!authorInput || !messageInput) {
      this.showMessage(this.t.errorFormNotFound);
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
      this.showMessage(this.t.errorInputFailed);
      return;
    }

    // 致命的エラー防止のみ（軽微なバリデーションはAPI側に任せる）
    const author =
      typeof rawAuthor === "string" ? rawAuthor || this.t.defaultAuthor : this.t.defaultAuthor;
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
        // 編集モード（userHashによる認証はAPI側で行う）
        apiUrl = `${baseUrl}/bbs?action=update&id=${encodeURIComponent(id)}&messageId=${encodeURIComponent(this.editingMessageId)}&author=${encodeURIComponent(author)}&message=${encodeURIComponent(message)}${standardValue ? `&standardValue=${encodeURIComponent(standardValue)}` : ""}${incrementalValue ? `&incrementalValue=${encodeURIComponent(incrementalValue)}` : ""}${emoteValue ? `&emoteValue=${encodeURIComponent(emoteValue)}` : ""}`;
      } else {
        // 新規投稿モード
        apiUrl = `${baseUrl}/bbs?action=post&id=${encodeURIComponent(id)}&author=${encodeURIComponent(author)}&message=${encodeURIComponent(message)}${standardValue ? `&standardValue=${encodeURIComponent(standardValue)}` : ""}${incrementalValue ? `&incrementalValue=${encodeURIComponent(incrementalValue)}` : ""}${emoteValue ? `&emoteValue=${encodeURIComponent(emoteValue)}` : ""}`;
      }

      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.success) {
        // 成功: フォームをクリアして再読み込み
        authorInput.value = "";
        messageInput.value = "";
        if (standardSelect) standardSelect.value = "";
        if (incrementalSelect) incrementalSelect.value = "";
        if (emoteSelect) emoteSelect.value = "";
        this.clearEmoteSelection();

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
          this.showMessage(this.t.messageUpdated, "success");
        } else {
          this.showMessage(this.t.messagePosted, "success");
        }
      } else {
        throw new Error(translateBBSError(data.error || "Failed to post message", this));
      }
    } catch (error) {
      console.error("Post message failed:", error);
      this.showMessage(error.message);
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
        button.textContent = this.editMode ? this.t.updating : this.t.posting;
      } else {
        button.textContent = this.editMode ? this.t.update : this.t.post;
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
      // 言語に応じてフォーマットを変更
      if (this.lang === "en") {
        return `${month}-${day}-${year} ${hours}:${minutes}`;
      }
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
      postButton.textContent = this.t.post;
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
    // currentUserHashとメッセージのuserHashを比較して権限確認
    const message = this.bbsData.messages.find((m) => m.id === messageId);
    if (!message) {
      this.showMessage(this.t.messageNotFound);
      return;
    }

    if (message.userHash !== this.bbsData.currentUserHash) {
      this.showMessage(this.t.noEditPermission);
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
      postButton.textContent = this.t.update;
    }

    // フォームまでスクロール
    const postForm = this.shadowRoot.querySelector(".post-form");
    if (postForm) {
      postForm.scrollIntoView({ behavior: "smooth" });
    }
  }

  // メッセージ削除
  async deleteMessage(messageId) {
    // currentUserHashとメッセージのuserHashを比較して権限確認
    const message = this.bbsData.messages.find((m) => m.id === messageId);
    if (!message) {
      this.showMessage(this.t.messageNotFound);
      return;
    }

    if (message.userHash !== this.bbsData.currentUserHash) {
      this.showMessage(this.t.noDeletePermission);
      return;
    }

    if (!confirm(this.t.confirmDelete)) {
      return;
    }

    try {
      const baseUrl = this.getAttribute("api-base") || NostalgicBBS.apiBaseUrl;
      const deleteUrl = `${baseUrl}/bbs?action=remove&id=${encodeURIComponent(this.getAttribute("id"))}&messageId=${encodeURIComponent(messageId)}`;

      const response = await fetch(deleteUrl);
      const data = await response.json();

      if (data.success) {
        // BBSデータを再読み込み
        await this.loadBBSData();
        this.showMessage(this.t.messageDeleted, "success");
      } else {
        throw new Error(translateBBSError(data.error || "Failed to delete message", this));
      }
    } catch (error) {
      console.error("Delete message failed:", error);
      this.showMessage(error.message);
    }
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    // 全角スペースを半角スペース2つに変換
    return div.innerHTML.replace(/　/g, "  ");
  }
}

// Web Componentを登録
if (!customElements.get("nostalgic-bbs")) {
  customElements.define("nostalgic-bbs", NostalgicBBS);
}
