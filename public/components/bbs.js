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
      const src = script.getAttribute('src');
      if (src && src.includes('bbs.js')) {
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
    this.bbsData = null;
    this.loading = false;
    this.currentPage = 1;
    this.posting = false;
    this.editMode = false;
    this.editingMessageId = null;
  }

  static get observedAttributes() {
    return ['id', 'page', 'theme', 'format'];
  }

  // 安全なアトリビュート処理
  safeGetAttribute(name) {
    const value = this.getAttribute(name);
    
    switch (name) {
      case 'page':
        return value;
        
      case 'id':
        if (!value || typeof value !== 'string' || value.trim() === '') {
          return null;
        }
        return value.trim();
        
      case 'theme':
        return value;
        
      case 'format':
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
    this.currentPage = this.safeGetAttribute('page') || lastPage;
    this.setAttribute('page', this.currentPage.toString());
    // 最終ページのデータを再読み込み
    if (this.currentPage !== 1) {
      await this.loadBBSData();
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // 安全な値に変換
    const safeValue = this.safeGetAttribute(name);
    
    if (name === 'page') {
      this.currentPage = safeValue || 1;
      this.loadBBSData();
    } else {
      this.loadBBSData();
    }
  }

  async loadBBSData() {
    const id = this.safeGetAttribute('id');
    if (!id) {
      this.renderError('ID attribute is required');
      return;
    }

    try {
      this.loading = true;
      this.render();

      const response = await fetch(`${NostalgicBBS.apiBaseUrl}/api/bbs?action=display&id=${encodeURIComponent(id)}&page=${this.currentPage}`);
      const data = await response.json();

      if (data.success) {
        this.bbsData = data.data;
      } else {
        this.renderError(data.error || 'Failed to load BBS data');
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
    this.setAttribute('page', newPage.toString());
    await this.loadBBSData();
  }

  render() {
    const theme = this.getAttribute('theme') || 'dark';

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
          <div class="loading">${this.loading ? '読み込み中...' : 'データがありません'}</div>
        </div>
      `;
      return;
    }

    // テーマ別のスタイル
    const themeStyles = {
      light: {
        bgColor: '#ffffff',
        borderColor: '#000000',
        shadowColor: '#000000',
        headerBg: '#f5f5f5',
        headerColor: '#000000',
        messageBg: '#ffffff',
        textColor: '#000000'
      },
      dark: {
        bgColor: '#2a2a2a',
        borderColor: '#ffffff',
        shadowColor: '#ffffff',
        headerBg: '#000000',
        headerColor: '#ffffff',
        messageBg: '#2a2a2a',
        textColor: '#cccccc'
      },
      kawaii: {
        bgColor: '#e0f7fa',
        borderColor: '#9c27b0',
        shadowColor: '#9c27b0',
        headerBg: '#b2ebf2',
        headerColor: '#ff69b4',
        messageBg: '#e0f7fa',
        textColor: '#f06292',
        scrollbarThumb: '#ff69b4',
        scrollbarHover: '#e91e63'
      }
    };

    const style = themeStyles[theme] || themeStyles.dark;
    // サーバーから取得したメッセージをそのまま表示（新しいものが下に表示される）
    const messages = (this.bbsData.messages || []);
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
          --bbs-min-width: 320px;
          --bbs-max-width: 480px;
          --bbs-message-padding: 6px;
          --bbs-message-margin: 4px;
          --bbs-max-height: 400px;
          display: inline-block;
          max-width: min(480px, 100%);
          width: 100%;
          /* 水玉パターン変数 */
          --kawaii-dark-bg: #b2ebf2;
          --kawaii-dark-dots: radial-gradient(circle at 12% 12%, rgba(255,255,255,0.4) 9px, transparent 9px),
                              radial-gradient(circle at 28% 6%, rgba(255,255,255,0.4) 6px, transparent 6px),
                              radial-gradient(circle at 52% 15%, rgba(255,255,255,0.4) 11px, transparent 11px),
                              radial-gradient(circle at 72% 8%, rgba(255,255,255,0.4) 7px, transparent 7px),
                              radial-gradient(circle at 88% 25%, rgba(255,255,255,0.4) 5px, transparent 5px),
                              radial-gradient(circle at 6% 38%, rgba(255,255,255,0.4) 8px, transparent 8px),
                              radial-gradient(circle at 25% 45%, rgba(255,255,255,0.4) 10px, transparent 10px),
                              radial-gradient(circle at 45% 32%, rgba(255,255,255,0.4) 6px, transparent 6px),
                              radial-gradient(circle at 62% 48%, rgba(255,255,255,0.4) 9px, transparent 9px),
                              radial-gradient(circle at 78% 38%, rgba(255,255,255,0.4) 12px, transparent 12px),
                              radial-gradient(circle at 95% 52%, rgba(255,255,255,0.4) 7px, transparent 7px),
                              radial-gradient(circle at 8% 72%, rgba(255,255,255,0.4) 8px, transparent 8px),
                              radial-gradient(circle at 32% 78%, rgba(255,255,255,0.4) 5px, transparent 5px),
                              radial-gradient(circle at 52% 68%, rgba(255,255,255,0.4) 10px, transparent 10px),
                              radial-gradient(circle at 68% 82%, rgba(255,255,255,0.4) 6px, transparent 6px),
                              radial-gradient(circle at 85% 75%, rgba(255,255,255,0.4) 9px, transparent 9px),
                              radial-gradient(circle at 18% 88%, rgba(255,255,255,0.4) 11px, transparent 11px),
                              radial-gradient(circle at 42% 95%, rgba(255,255,255,0.4) 7px, transparent 7px),
                              radial-gradient(circle at 75% 92%, rgba(255,255,255,0.4) 8px, transparent 8px),
                              radial-gradient(circle at 92% 88%, rgba(255,255,255,0.4) 5px, transparent 5px);
        }
        .bbs-container {
          font-family: var(--bbs-font-family, 'Courier New', monospace);
          background: var(--bbs-bg-color);
          border: 2px solid var(--bbs-border-color);
          border-radius: var(--bbs-border-radius);
          box-shadow: 3px 3px 0px var(--bbs-shadow-color);
          width: 100%;
          max-width: var(--bbs-max-width);
          min-width: var(--bbs-min-width);
          box-sizing: border-box;
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
        }
        .bbs-messages {
          height: 400px;
          min-height: 400px;
          max-height: 400px;
          overflow-y: auto;
        }
        .bbs-messages::-webkit-scrollbar {
          width: 12px;
        }
        .bbs-messages::-webkit-scrollbar-track {
          background: var(--bbs-bg-color);
          border-radius: 2px;
        }
        .bbs-messages::-webkit-scrollbar-thumb {
          background: var(--bbs-scrollbar-thumb);
          border-radius: 2px;
          border: 1px solid var(--bbs-bg-color);
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
        }
        .message-meta {
          font-size: 10px;
          color: #999;
          margin-top: 4px;
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
      <div class="bbs-container ${theme === 'kawaii' ? 'kawaii' : ''}">
        ${this.bbsData.title ? `
          <div class="bbs-header ${theme === 'kawaii' ? 'kawaii' : ''}">${this.escapeHtml(this.bbsData.title)}</div>
        ` : ''}
        <div class="bbs-messages">
          ${messages.length > 0 ? 
            messages.map((message, index) => `
              <div class="message-item">
                <div class="message-header">
                  <span class="message-author"><span style="display:inline-block;min-width:2em;text-align:right;">${startNumber + index + 1}.</span> ${this.escapeHtml(message.author || 'Anonymous')}${message.icon ? ` ${message.icon}` : ''}</span>
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
                <div class="message-content">${this.escapeHtml(message.message || '')}</div>
                ${message.selects && Object.keys(message.selects).length > 0 ? `
                  <div class="message-meta">
                    ${Object.entries(message.selects).map(([key, value]) => `${key}: ${value}`).join(', ')}
                  </div>
                ` : ''}
              </div>
            `).join('') 
            : `<div class="empty-message">まだメッセージがありません</div>`
          }
        </div>
        ${pagination.totalPages > 1 ? `
          <div class="pagination">
            ${this.generatePageButtons(pagination)}
          </div>
        ` : ''}
        <div class="post-form">
            <div class="form-header ${theme === 'kawaii' ? 'kawaii' : ''}">コメントを投稿</div>
            <div class="form-body">
              <div class="form-row">
                <input type="text" id="message-author" placeholder="名前（省略可、20文字まで）" maxlength="20">
                <select id="message-icon">
                  <option value="">アイコンなし</option>
                  <option value="😀">😀</option>
                  <option value="😉">😉</option>
                  <option value="😎">😎</option>
                  <option value="😠">😠</option>
                  <option value="😢">😢</option>
                  <option value="😮">😮</option>
                </select>
              </div>
              <div class="form-row">
                <textarea id="message-content" placeholder="メッセージを入力（200文字まで）" maxlength="200" rows="5"></textarea>
              </div>
              <div class="message-area" id="form-message"></div>
              <div class="form-row button-right">
                <button id="post-button" class="${theme === 'kawaii' ? 'kawaii' : ''}" onclick="this.getRootNode().host.postMessage()">投稿</button>
              </div>
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

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  showMessage(text, type = 'error') {
    const messageArea = this.shadowRoot.querySelector('#form-message');
    if (messageArea) {
      messageArea.textContent = text;
      messageArea.className = `message-area ${type}`;
      messageArea.style.display = 'block';
      
      // 3秒後に自動で消去
      setTimeout(() => {
        messageArea.style.display = 'none';
      }, 3000);
    }
  }

  async postMessage() {
    const id = this.safeGetAttribute('id');
    
    if (!id) {
      this.showMessage('エラー: メッセージ投稿にid属性が必要です');
      return;
    }

    const authorInput = this.shadowRoot.querySelector('#message-author');
    const messageInput = this.shadowRoot.querySelector('#message-content');
    const iconSelect = this.shadowRoot.querySelector('#message-icon');
    
    // 安全な入力値検証
    if (!authorInput || !messageInput) {
      this.showMessage('エラー: フォーム要素が見つかりません');
      return;
    }

    let rawAuthor = '';
    let rawMessage = '';
    let rawIcon = '';

    // 存在チェックと型チェック
    try {
      rawAuthor = (typeof authorInput.value === 'string' ? authorInput.value : '').trim();
      // メッセージは前側のスペースを保持（アスキーアート調整のため）、後ろのみトリミング
      rawMessage = (typeof messageInput.value === 'string' ? messageInput.value : '').replace(/\s+$/, '');
      rawIcon = iconSelect && typeof iconSelect.value === 'string' ? iconSelect.value : '';
    } catch (error) {
      this.showMessage('エラー: 入力値の取得に失敗しました');
      return;
    }

    // 致命的エラー防止のみ（軽微なバリデーションはAPI側に任せる）
    const author = typeof rawAuthor === 'string' ? rawAuthor || '名無しさん' : '名無しさん';
    const message = typeof rawMessage === 'string' ? rawMessage : '';
    const icon = typeof rawIcon === 'string' ? rawIcon : '';

    // 致命的な状態のみチェック
    if (typeof author !== 'string' || typeof message !== 'string') {
      console.error('Fatal: author or message is not a string');
      return;
    }

    this.posting = true;
    this.updatePostButton();

    try {
      const baseUrl = this.getAttribute('api-base') || NostalgicBBS.apiBaseUrl;
      let apiUrl;
      
      if (this.editMode && this.editingMessageId) {
        // 編集モード
        const storageKey = `bbs_edit_${this.getAttribute('id')}`;
        const tokens = JSON.parse(localStorage.getItem(storageKey) || '{}');
        const editToken = tokens[this.editingMessageId];
        
        if (!editToken) {
          this.showMessage('編集権限がありません');
          return;
        }
        
        apiUrl = `${baseUrl}/api/bbs?action=editMessageById&id=${encodeURIComponent(id)}&messageId=${encodeURIComponent(this.editingMessageId)}&editToken=${encodeURIComponent(editToken)}&author=${encodeURIComponent(author)}&message=${encodeURIComponent(message)}${icon ? `&icon=${encodeURIComponent(icon)}` : ''}`;
      } else {
        // 新規投稿モード
        apiUrl = `${baseUrl}/api/bbs?action=post&id=${encodeURIComponent(id)}&author=${encodeURIComponent(author)}&message=${encodeURIComponent(message)}${icon ? `&icon=${encodeURIComponent(icon)}` : ''}`;
      }
      
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.success) {
        // editTokenをlocalStorageに保存（新規投稿の場合のみ）
        if (!this.editMode && data.data && data.data.editToken && data.data.messageId) {
          const storageKey = `bbs_edit_${this.getAttribute('id')}`;
          const existingTokens = JSON.parse(localStorage.getItem(storageKey) || '{}');
          existingTokens[data.data.messageId] = data.data.editToken;
          localStorage.setItem(storageKey, JSON.stringify(existingTokens));
        }
        
        // 成功: フォームをクリアして再読み込み
        authorInput.value = '';
        messageInput.value = '';
        if (iconSelect) iconSelect.value = '';
        
        // 編集モードをクリア
        this.clearEditMode();
        
        // 新しい投稿が表示される最後のページに移動して再読み込み
        await this.loadBBSData();
        const lastPage = this.bbsData.totalPages || 1;
        this.currentPage = lastPage;
        this.setAttribute('page', lastPage.toString());
        await this.loadBBSData();
        
        // 成功メッセージ
        if (this.editMode) {
          this.showMessage('メッセージを更新しました', 'success');
        } else {
          this.showMessage('メッセージを投稿しました', 'success');
        }
      } else {
        throw new Error(data.error || 'Failed to post message');
      }
    } catch (error) {
      console.error('Post message failed:', error);
      this.showMessage(`メッセージの投稿に失敗しました: ${error.message}`);
    } finally {
      this.posting = false;
      this.updatePostButton();
    }
  }

  updatePostButton() {
    const button = this.shadowRoot.querySelector('#post-button');
    if (button) {
      button.disabled = this.posting;
      if (this.posting) {
        button.textContent = this.editMode ? '更新中...' : '投稿中...';
      } else {
        button.textContent = this.editMode ? '更新' : '投稿';
      }
    }
  }

  formatDate(dateString) {
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    } catch (e) {
      return dateString;
    }
  }

  // 編集モードをクリア
  clearEditMode() {
    this.editMode = false;
    this.editingMessageId = null;
    const postButton = this.shadowRoot.querySelector('#post-button');
    if (postButton) {
      postButton.textContent = '投稿';
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
        buttons.push(`<button onclick="this.getRootNode().host.changePage(${page})">${label}</button>`);
      }
    }
    
    return buttons.join(' ');
  }

  // メッセージ編集
  editMessage(messageId) {
    // localStorageからeditTokenを取得
    const storageKey = `bbs_edit_${this.getAttribute('id')}`;
    const tokens = JSON.parse(localStorage.getItem(storageKey) || '{}');
    
    if (!tokens[messageId]) {
      this.showMessage('このメッセージを編集する権限がありません');
      return;
    }

    // メッセージデータを取得
    const message = this.bbsData.messages.find(m => m.id === messageId);
    if (!message) {
      this.showMessage('メッセージが見つかりません');
      return;
    }

    // フォームに内容を読み込み
    const authorInput = this.shadowRoot.querySelector('#message-author');
    const messageInput = this.shadowRoot.querySelector('#message-content');
    const iconSelect = this.shadowRoot.querySelector('#message-icon');

    authorInput.value = message.author || '';
    messageInput.value = message.message || '';
    if (iconSelect && message.icon) {
      iconSelect.value = message.icon;
    }

    // 編集モードに変更
    this.editMode = true;
    this.editingMessageId = messageId;
    
    const postButton = this.shadowRoot.querySelector('#post-button');
    if (postButton) {
      postButton.textContent = '更新';
    }

    // フォームまでスクロール
    const postForm = this.shadowRoot.querySelector('.post-form');
    if (postForm) {
      postForm.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // メッセージ削除
  async deleteMessage(messageId) {
    // localStorageからeditTokenを取得
    const storageKey = `bbs_edit_${this.getAttribute('id')}`;
    const tokens = JSON.parse(localStorage.getItem(storageKey) || '{}');
    
    if (!tokens[messageId]) {
      this.showMessage('このメッセージを削除する権限がありません');
      return;
    }

    if (!confirm('このメッセージを削除しますか？')) {
      return;
    }

    try {
      const baseUrl = this.getAttribute('api-base') || NostalgicBBS.apiBaseUrl;
      const deleteUrl = `${baseUrl}/api/bbs?action=deleteMessageById&id=${encodeURIComponent(this.getAttribute('id'))}&messageId=${encodeURIComponent(messageId)}&editToken=${encodeURIComponent(tokens[messageId])}`;
      
      const response = await fetch(deleteUrl);
      const data = await response.json();

      if (data.success) {
        // localStorageからトークンを削除
        delete tokens[messageId];
        localStorage.setItem(storageKey, JSON.stringify(tokens));
        
        // BBSデータを再読み込み
        await this.loadBBSData();
        this.showMessage('メッセージが削除されました', 'success');
      } else {
        throw new Error(data.error || 'Failed to delete message');
      }
    } catch (error) {
      console.error('Delete message failed:', error);
      this.showMessage(`メッセージの削除に失敗しました: ${error.message}`);
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    // 全角スペースを半角スペース2つに変換
    return div.innerHTML.replace(/　/g, '  ');
  }
}

// Web Componentを登録
if (!customElements.get('nostalgic-bbs')) {
  customElements.define('nostalgic-bbs', NostalgicBBS);
}

