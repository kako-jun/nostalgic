/**
 * Nostalgic Counter Web Component
 *
 * Usage / 使用方法:
 * <script src="/components/visit.js"></script>
 * <nostalgic-counter id="your-counter-id" type="total" theme="dark" lang="en"></nostalgic-counter>
 */

// i18n translations
const COUNTER_I18N = {
  ja: {
    error: "エラー",
  },
  en: {
    error: "Error",
  },
};

function getCounterLang(element) {
  const lang = element?.getAttribute("lang") || navigator.language?.split("-")[0] || "en";
  return lang === "ja" ? "ja" : "en";
}

function getCounterTranslations(element) {
  return COUNTER_I18N[getCounterLang(element)] || COUNTER_I18N.en;
}

class NostalgicCounter extends HTMLElement {
  // ページ内でカウント済みのIDを記録（同じIDは1回のみカウント）
  static counted = new Set();
  // カウントアップ後の最新データを保存。TTL は持たず、ページ存続中は保持し続ける
  // （「1ページ1回だけカウント」の意図どおり、再 render 時に同じ最新値を即表示するため）。
  static latestCounts = new Map();
  static countPromises = new Map();
  static batchDelayMs = 16;
  static cacheTtlMs = 5000;
  static maxBatchSize = 1000;
  static readCache = new Map();
  static readQueues = new Map();
  // APIのベースURL
  static apiBaseUrl = "https://api.nostalgic.llll-ll.com";

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  static get observedAttributes() {
    return ["id", "type", "theme", "digits", "format", "lang", "api-base"];
  }

  static cacheKey(baseUrl, id) {
    return `${baseUrl}|${id}`;
  }

  static getCachedData(key) {
    const cached = NostalgicCounter.readCache.get(key);
    if (!cached || cached.expiresAt <= Date.now()) {
      NostalgicCounter.readCache.delete(key);
      return null;
    }
    return cached.data;
  }

  static setCachedData(baseUrl, id, data) {
    NostalgicCounter.latestCounts.set(id, data);
    NostalgicCounter.readCache.set(NostalgicCounter.cacheKey(baseUrl, id), {
      data,
      expiresAt: Date.now() + NostalgicCounter.cacheTtlMs,
    });
  }

  static requestCounterData(baseUrl, id) {
    const cached = NostalgicCounter.getCachedData(NostalgicCounter.cacheKey(baseUrl, id));
    if (cached) {
      return Promise.resolve(cached);
    }

    return new Promise((resolve, reject) => {
      let queue = NostalgicCounter.readQueues.get(baseUrl);
      if (!queue) {
        queue = { ids: new Set(), resolvers: new Map(), timer: null };
        NostalgicCounter.readQueues.set(baseUrl, queue);
      }

      queue.ids.add(id);
      if (!queue.resolvers.has(id)) {
        queue.resolvers.set(id, []);
      }
      queue.resolvers.get(id).push({ resolve, reject });

      if (!queue.timer) {
        queue.timer = setTimeout(() => {
          NostalgicCounter.flushReadBatch(baseUrl);
        }, NostalgicCounter.batchDelayMs);
      }
    });
  }

  static async flushReadBatch(baseUrl) {
    const queue = NostalgicCounter.readQueues.get(baseUrl);
    if (!queue) return;
    NostalgicCounter.readQueues.delete(baseUrl);

    const ids = [...queue.ids];
    for (let i = 0; i < ids.length; i += NostalgicCounter.maxBatchSize) {
      const chunk = ids.slice(i, i + NostalgicCounter.maxBatchSize);
      try {
        const response = await fetch(`${baseUrl}/visit?action=batchGet`, {
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
          const data = responseData.data?.[id] || {
            id,
            total: 0,
            today: 0,
            yesterday: 0,
            week: 0,
            month: 0,
          };
          NostalgicCounter.setCachedData(baseUrl, id, data);
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

  // ピクセルアート系テーマ。これらは API が画像を焼き込んで返すため、
  // クライアント直描画ではなくサーバー <img> にフォールバックする。
  // apps/api/src/routes/visit.ts の IMAGE_THEMES と必ず同期させること。
  static IMAGE_THEME_NAMES = ["mahjong", "segment", "nixie", "dots_f"];

  static isImageTheme(theme) {
    return NostalgicCounter.IMAGE_THEME_NAMES.includes(theme);
  }

  // 通常色テーマの SVG 生成。見た目の定数（テーマ色・寸法・フォント）は
  // apps/api/src/routes/visit.ts の generateCounterSVG / generateShieldsBadgeSVG の
  // 逐語コピー。どちらか片方を変えると表示が割れるため、必ず両方を同期させること。
  static generateCounterSVG(value, theme) {
    if (theme === "github") {
      return NostalgicCounter.generateShieldsBadgeSVG("visitors", value, "#4c1");
    }

    const themes = {
      light: { bg: "#ffffff", text: "#333333", border: "#cccccc" },
      dark: { bg: "#1a1a2e", text: "#eaeaea", border: "#4a4a6a" },
      retro: { bg: "#000000", text: "#00ff00", border: "#00ff00" },
      kawaii: { bg: "#e0f7fa", text: "#ff69b4", border: "#ff69b4" },
      mom: { bg: "#98fb98", text: "#2d4a2b", border: "#2d4a2b" },
      final: { bg: "#0000ff", text: "#ffffff", border: "#ffffff" },
    };

    const t = themes[theme] || themes.dark;
    const width = Math.max(60, String(value).length * 12 + 20);

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="28">
  <rect width="100%" height="100%" fill="${t.bg}" stroke="${t.border}" stroke-width="1"/>
  <text x="50%" y="50%" dy="0.35em" text-anchor="middle"
        fill="${t.text}" font-family="'BIZ UDGothic', monospace" font-size="14" font-weight="bold">${value}</text>
</svg>`;
  }

  static generateShieldsBadgeSVG(label, value, valueColor) {
    const labelWidth = label.length * 6 + 6;
    const valueWidth = Math.max(String(value).length * 7 + 10, 30);
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
    <rect x="${labelWidth}" width="${valueWidth}" height="20" fill="${valueColor}"/>
    <rect width="${totalWidth}" height="20" fill="url(#smooth)"/>
  </g>
  <g text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
    <text x="${labelWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${label}</text>
    <text x="${labelWidth / 2}" y="14" fill="#fff">${label}</text>
    <text x="${labelWidth + valueWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${value}</text>
    <text x="${labelWidth + valueWidth / 2}" y="14" fill="#fff">${value}</text>
  </g>
</svg>`;
  }

  get t() {
    return getCounterTranslations(this);
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

      case "type":
        return value;

      case "theme":
        return value;

      case "digits":
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
    // カウントアップを先に実行し、完了を待つ
    this.countUpAndRender();
  }

  attributeChangedCallback(name) {
    // 初回接続前は何もしない（connectedCallbackで処理）
    if (!this.isConnected) {
      return;
    }
    if (name === "id" || name === "api-base") {
      this.countUpAndRender();
    } else {
      this.render();
    }
  }

  async countUpAndRender() {
    const id = this.safeGetAttribute("id");
    if (!id) {
      this.render();
      return;
    }

    // フォーマットをチェックして初期表示を設定
    const format = this.safeGetAttribute("format");

    // テキスト形式の場合は先に初期値を表示
    if (format === "text") {
      this.renderInitialText();
    }

    // カウントアップして結果を待つ
    await this.countUp();
    await this.ensureCounterData();
    this.render();
  }

  async countUp() {
    const id = this.safeGetAttribute("id");

    if (!id) {
      console.warn("nostalgic-counter: id attribute is required");
      return;
    }

    // 同じIDは1回のみカウント（ページ内重複防止）
    if (NostalgicCounter.counted.has(id)) {
      return NostalgicCounter.countPromises.get(id);
    }

    NostalgicCounter.counted.add(id);

    const promise = (async () => {
      const baseUrl = this.getAttribute("api-base") || NostalgicCounter.apiBaseUrl;
      const countUrl = `${baseUrl}/visit?action=increment&id=${encodeURIComponent(id)}`;
      const response = await fetch(countUrl);
      if (!response.ok) {
        console.error(
          "nostalgic-counter: Count failed with status:",
          response.status,
          response.statusText
        );
        const errorData = await response.text();
        console.error("nostalgic-counter: Error response:", errorData);
      } else {
        const result = await response.json();
        // カウントアップ後の値で表示を更新
        if (result.success && result.data) {
          NostalgicCounter.setCachedData(baseUrl, id, result.data);
        } else {
          NostalgicCounter.setCachedData(baseUrl, id, result);
        }
      }
    })();

    NostalgicCounter.countPromises.set(id, promise);

    try {
      await promise;
    } catch (error) {
      console.error("nostalgic-counter: Count failed:", error);
    }
  }

  async ensureCounterData() {
    const id = this.safeGetAttribute("id");
    if (!id) return;

    const baseUrl = this.getAttribute("api-base") || NostalgicCounter.apiBaseUrl;
    if (NostalgicCounter.latestCounts.has(id)) {
      return;
    }

    try {
      await NostalgicCounter.requestCounterData(baseUrl, id);
    } catch (error) {
      console.error("nostalgic-counter: Failed to load data:", error);
    }
  }

  renderInitialText() {
    // テキスト形式の初期表示（ローディング中表示）
    const digits = this.safeGetAttribute("digits");
    const formatValue = (value) => {
      if (digits && !isNaN(digits) && digits > 0) {
        return String(value).padStart(parseInt(digits), "0");
      }
      return String(value);
    };

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline;
          font-family: 'BIZ UDGothic', monospace;
        }
      </style>
      <span>${digits ? formatValue(0) : "0"}</span>
    `;
  }

  render() {
    const id = this.safeGetAttribute("id");
    const type = this.safeGetAttribute("type") || "total";
    const theme = this.safeGetAttribute("theme");
    const digits = this.safeGetAttribute("digits");
    const format = this.safeGetAttribute("format");

    if (!id) {
      // IDが無い場合は0を表示
      const formatValue = (value) => {
        if (digits && !isNaN(digits) && digits > 0) {
          return String(value).padStart(parseInt(digits), "0");
        }
        return String(value);
      };
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: inline;
            font-family: 'BIZ UDGothic', monospace;
          }
        </style>
        <span>${formatValue(0)}</span>
      `;
      return;
    }

    const baseUrl = this.getAttribute("api-base") || NostalgicCounter.apiBaseUrl;
    const effectiveFormat = format || "text";
    // カウントアップ後の最新データがあれば使用
    const latestData = NostalgicCounter.latestCounts.get(id);
    const hasLatestData = latestData && latestData[type] !== undefined;

    if (effectiveFormat === "text") {
      // プレーンテキスト形式の場合
      const formatValue = (value) => {
        if (digits && !isNaN(digits) && digits > 0) {
          return String(value).padStart(parseInt(digits), "0");
        }
        return String(value);
      };

      const textStyle = `
        <style>
          :host {
            display: inline;
            font-family: 'BIZ UDGothic', monospace;
          }
        </style>
      `;

      // 最新データがあれば即座に表示
      if (hasLatestData) {
        const value = latestData[type];
        this.shadowRoot.innerHTML = `${textStyle}<span>${formatValue(value)}</span>`;
      } else {
        // ローディング中は0を桁数分表示
        this.shadowRoot.innerHTML = `${textStyle}<span>${formatValue(0)}</span>`;

        // 値を非同期で取得（ページ全体でbatchGetに集約）
        NostalgicCounter.requestCounterData(baseUrl, id)
          .then((data) => {
            const value = data[type] ?? data.total;
            this.shadowRoot.innerHTML = `${textStyle}<span>${formatValue(value)}</span>`;
          })
          .catch((error) => {
            this.shadowRoot.innerHTML = `${textStyle}<span>${this.t.error}</span>`;
          });
      }
    } else if (NostalgicCounter.isImageTheme(theme)) {
      // ピクセルアート系テーマは API が画像を焼き込んで返すため、サーバー <img> に委ねる。
      // 値も URL 経由でサーバーが算出するため batchGet 集約には乗せない。
      const apiUrl = `${baseUrl}/visit?action=get&id=${encodeURIComponent(id)}${type ? `&type=${type}` : ""}${theme ? `&theme=${theme}` : ""}${digits ? `&digits=${digits}` : ""}&format=image`;
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: inline-block;
          }
          img {
            display: block;
            image-rendering: pixelated;
            image-rendering: -moz-crisp-edges;
            image-rendering: crisp-edges;
            max-width: 100%;
            height: auto;
          }
        </style>
        <img src="${apiUrl}" alt="${type} counter" loading="lazy" />
      `;
    } else {
      // 通常の色テーマは <img>直叩きではなく共有済みデータからクライアント描画する。
      const value = hasLatestData ? latestData[type] : 0;
      const displayValue = digits ? String(value).padStart(Number(digits), "0") : String(value);
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: inline-block;
          }
        </style>
        ${NostalgicCounter.generateCounterSVG(displayValue, theme)}
      `;

      if (!hasLatestData) {
        NostalgicCounter.requestCounterData(baseUrl, id)
          .then(() => this.render())
          .catch(() => {});
      }
    }
  }
}

// カスタム要素として登録
if (!customElements.get("nostalgic-counter")) {
  customElements.define("nostalgic-counter", NostalgicCounter);
}
