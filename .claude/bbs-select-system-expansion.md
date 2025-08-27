# BBSセレクトシステム拡張計画

## 概要
現在の顔文字セレクト（配列対応）を廃止し、3種類のセレクト機能を新設。純正セレクトはOS標準UI、インクリメンタル検索・エモートは独自実装で差別化。

## 現状の問題

### 複雑な配列セレクト
```javascript
// 現在：複雑な配列設定
dropdowns: [
  { id: 'face', options: ['(^_^)', '(>_<)', '(^o^)'] },
  { id: 'mood', options: ['嬉しい', '悲しい', '怒り'] },
  { id: 'action', options: ['歩く', '走る', '寝る'] }
]
```

**問題点:**
- 設定が複雑
- UI実装の複雑さ
- 用途が不明確

## 新仕様設計

### 3種類のセレクト機能

#### 1. 純正セレクト（Standard Select）
```javascript
standardSelect: {
  label: 'カテゴリ',
  options: ['一般', '質問', '雑談', '報告', 'その他']
}
```
- **UI**: OS標準の `<select>` 要素
- **用途**: カテゴリ、種別、優先度など
- **特徴**: シンプル、高速、アクセシブル

#### 2. インクリメンタル検索セレクト（Incremental Search Select）
```javascript
incrementalSelect: {
  label: 'タグ',
  options: ['JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'HTML', 'CSS', 'Vue.js', 'Angular', 'Svelte', 'PHP', 'Python', 'Java', 'C#', 'Go', 'Rust']
}
```
- **UI**: 独自実装（入力フィールド + ドロップダウン）
- **用途**: 大量の選択肢から絞り込み（タグ、言語、地域など）
- **特徴**: タイプして絞り込み、大量データに対応

#### 3. エモートセレクト（Emote Select）
```javascript
emoteSelect: {
  label: 'エモート',
  options: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓']
}
```
- **UI**: 独自実装（グリッド表示 + 検索）
- **用途**: 絵文字、顔文字、感情表現
- **特徴**: 視覚的、楽しい、直感的

## API設計

### BBS作成時の設定

#### デフォルト（初期値）
```javascript
// 全セレクトが空配列（初期状態）
standardSelect: { label: '', options: [] },
incrementalSelect: { label: '', options: [] }, 
emoteSelect: { label: '', options: [] }
```

#### ユーザー設定例
```javascript
// /api/bbs?action=create （フォーム経由推奨）
standardSelect: {
  label: 'カテゴリ',
  options: ['一般', '質問', '雑談', 'バグ報告']
},
incrementalSelect: {
  label: 'プログラミング言語',
  options: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift']
},
emoteSelect: {
  label: '感情',
  options: [
    '/images/happy.png',      // ユーザーサーバーの画像
    '/emoji/sad.gif',         // 相対パス
    'https://example.com/angry.svg', // 絶対パス
    '../assets/thinking.jpg'  // 相対パス
  ]
}
```

#### URL長の問題とフォーム対応
```javascript
// GET URL例（設定が多いと非常に長くなる）
/api/bbs?action=create&url=https://example.com&token=abc123&standardSelect.label=カテゴリ&standardSelect.options[0]=一般&standardSelect.options[1]=質問&incrementalSelect.label=言語&incrementalSelect.options[0]=JavaScript&incrementalSelect.options[1]=TypeScript&emoteSelect.label=感情&emoteSelect.options[0]=/images/happy.png

// 実質的にはフォーム専用機能
```

### メッセージ投稿時
```javascript
// /api/bbs?action=post
{
  author: 'ユーザー名',
  message: '投稿内容',
  standardValue: '質問',        // 選択されたカテゴリ
  incrementalValue: 'React',    // 選択されたタグ
  emoteValue: '🤔'              // 選択されたエモート
}
```

## UI実装設計

### 1. 純正セレクト（OS標準）
```html
<div class="bbs-select-standard">
  <label for="standard-select">カテゴリ</label>
  <select id="standard-select" name="standardValue">
    <option value="">選択してください</option>
    <option value="一般">一般</option>
    <option value="質問">質問</option>
    <option value="雑談">雑談</option>
  </select>
</div>
```

### 2. インクリメンタル検索セレクト
```html
<div class="bbs-select-incremental">
  <label for="incremental-input">タグ</label>
  <div class="incremental-container">
    <input type="text" id="incremental-input" placeholder="入力して検索..." />
    <input type="hidden" name="incrementalValue" />
    <div class="incremental-dropdown">
      <!-- 検索結果がここに表示される -->
    </div>
  </div>
</div>
```

### 3. エモートセレクト
```html
<div class="bbs-select-emote">
  <label>エモート</label>
  <div class="emote-container">
    <button type="button" class="emote-trigger">
      <span class="selected-emote">😀</span>
      <span class="emote-label">選択中</span>
    </button>
    <input type="hidden" name="emoteValue" value="😀" />
    <div class="emote-popup">
      <div class="emote-search">
        <input type="text" placeholder="絵文字を検索..." />
      </div>
      <div class="emote-grid">
        <button type="button" class="emote-option" data-emote="😀">😀</button>
        <button type="button" class="emote-option" data-emote="😢">😢</button>
        <!-- ... -->
      </div>
    </div>
  </div>
</div>
```

## JavaScript実装

### インクリメンタル検索
```javascript
class IncrementalSelect {
  constructor(element, options) {
    this.element = element
    this.options = options
    this.filteredOptions = options
    this.init()
  }
  
  init() {
    this.input = this.element.querySelector('input[type="text"]')
    this.hiddenInput = this.element.querySelector('input[type="hidden"]')
    this.dropdown = this.element.querySelector('.incremental-dropdown')
    
    this.input.addEventListener('input', this.handleSearch.bind(this))
    this.input.addEventListener('focus', this.showDropdown.bind(this))
    document.addEventListener('click', this.hideDropdown.bind(this))
  }
  
  handleSearch(e) {
    const query = e.target.value.toLowerCase()
    this.filteredOptions = this.options.filter(option => 
      option.toLowerCase().includes(query)
    )
    this.renderDropdown()
  }
  
  renderDropdown() {
    this.dropdown.innerHTML = ''
    this.filteredOptions.forEach(option => {
      const item = document.createElement('div')
      item.className = 'incremental-item'
      item.textContent = option
      item.addEventListener('click', () => this.selectOption(option))
      this.dropdown.appendChild(item)
    })
  }
  
  selectOption(option) {
    this.input.value = option
    this.hiddenInput.value = option
    this.hideDropdown()
  }
}
```

### エモートセレクト（画像パス対応）
```javascript
class EmoteSelect {
  constructor(element, options) {
    this.element = element
    this.options = options // 画像パスの配列
    this.selectedEmote = options[0] || null
    this.init()
  }
  
  init() {
    this.trigger = this.element.querySelector('.emote-trigger')
    this.hiddenInput = this.element.querySelector('input[type="hidden"]')
    this.popup = this.element.querySelector('.emote-popup')
    this.searchInput = this.popup.querySelector('input[type="text"]')
    this.grid = this.popup.querySelector('.emote-grid')
    
    this.trigger.addEventListener('click', this.togglePopup.bind(this))
    this.searchInput.addEventListener('input', this.handleSearch.bind(this))
    
    this.renderGrid()
  }
  
  renderGrid() {
    this.grid.innerHTML = ''
    
    // 未選択オプション
    const clearButton = document.createElement('button')
    clearButton.type = 'button'
    clearButton.className = 'emote-option emote-clear'
    clearButton.textContent = '表情なし'
    clearButton.addEventListener('click', () => this.selectEmote(null))
    this.grid.appendChild(clearButton)
    
    // 画像オプション
    this.options.forEach((imagePath, index) => {
      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'emote-option'
      button.dataset.emote = imagePath
      button.addEventListener('click', () => this.selectEmote(imagePath))
      
      // 画像を表示
      const img = document.createElement('img')
      img.src = imagePath
      img.alt = `Emote ${index + 1}`
      img.onerror = () => {
        // 画像読み込み失敗時の代替表示
        button.textContent = '❓'
      }
      button.appendChild(img)
      
      this.grid.appendChild(button)
    })
  }
  
  selectEmote(imagePath) {
    this.selectedEmote = imagePath
    this.hiddenInput.value = imagePath || ''
    this.updateTrigger()
    this.hidePopup()
  }
  
  updateTrigger() {
    const selectedSpan = this.trigger.querySelector('.selected-emote')
    if (this.selectedEmote) {
      selectedSpan.innerHTML = `<img src="${this.selectedEmote}" alt="Selected" />`
    } else {
      selectedSpan.textContent = '未選択'
    }
  }
}
```

## CSS設計

### インクリメンタル検索スタイル
```css
.bbs-select-incremental {
  position: relative;
}

.incremental-container {
  position: relative;
}

.incremental-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  display: none;
}

.incremental-dropdown.show {
  display: block;
}

.incremental-item {
  padding: 8px 12px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
}

.incremental-item:hover {
  background-color: #f5f5f5;
}

.incremental-item:last-child {
  border-bottom: none;
}
```

### エモートセレクトスタイル
```css
.bbs-select-emote {
  position: relative;
}

.emote-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.selected-emote {
  font-size: 20px;
}

.emote-popup {
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 16px;
  z-index: 1000;
  display: none;
  min-width: 280px;
}

.emote-popup.show {
  display: block;
}

.emote-search {
  margin-bottom: 12px;
}

.emote-search input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.emote-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
}

.emote-option {
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  font-size: 18px;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.emote-option:hover {
  background-color: #f0f0f0;
}
```

## データベース設計

### BBSメタデータ拡張
```typescript
interface BBSMetadata {
  id: string
  url: string
  created: string
  service: 'bbs'
  
  // 新規追加
  standardSelect?: {
    label: string
    options: string[]
  }
  incrementalSelect?: {
    label: string
    options: string[]
  }
  emoteSelect?: {
    label: string
    options: string[]
  }
  
  // 既存設定は維持
  settings: {
    theme: 'light' | 'dark' | 'kawaii'
    maxMessages: number
  }
}
```

### メッセージデータ拡張
```typescript
interface BBSMessage {
  id: string
  author: string
  message: string
  timestamp: string
  
  // 新規追加
  standardValue?: string      // 純正セレクトの値
  incrementalValue?: string   // インクリメンタル検索の値
  emoteValue?: string         // エモートの値
}
```

## Web Components対応

### BBS Web Component更新
```javascript
class NostalgicBBS extends HTMLElement {
  // 既存プロパティ
  static get observedAttributes() {
    return [
      'id', 'theme', 'max-messages',
      // 新規追加
      'standard-select', 'incremental-select', 'emote-select'
    ]
  }
  
  connectedCallback() {
    this.render()
    this.initializeSelects()
  }
  
  initializeSelects() {
    // 純正セレクトはそのまま（OS標準）
    
    // インクリメンタル検索セレクト
    const incrementalElement = this.querySelector('.bbs-select-incremental')
    if (incrementalElement && this.incrementalOptions) {
      new IncrementalSelect(incrementalElement, this.incrementalOptions)
    }
    
    // エモートセレクト
    const emoteElement = this.querySelector('.bbs-select-emote')
    if (emoteElement && this.emoteOptions) {
      new EmoteSelect(emoteElement, this.emoteOptions)
    }
  }
}
```

## 実装フェーズ

### Phase 1: API・データベース拡張
- [ ] BBSメタデータスキーマ拡張（デフォルト空配列対応）
- [ ] メッセージスキーマ拡張
- [ ] API エンドポイント更新（フォーム前提の長いURL対応）
- [ ] 既存データの互換性確保
- [ ] BBS作成フォームページの実装（複雑な設定用）

### Phase 2: UI基盤実装
- [ ] 純正セレクトUI
- [ ] インクリメンタル検索JavaScript実装
- [ ] エモートセレクトJavaScript実装
- [ ] CSS スタイリング

### Phase 3: Web Components統合
- [ ] BBS Web Component更新
- [ ] 属性パラメータ対応
- [ ] 既存機能との互換性確保

### Phase 4: テーマ対応・テスト
- [ ] 3テーマ全対応
- [ ] 各セレクトの動作テスト
- [ ] モバイル対応確認

## メリット・効果

### ユーザー体験向上
- **直感的操作**: 用途に応じた最適なUI
- **大量データ対応**: インクリメンタル検索で快適
- **楽しい体験**: エモートセレクトで感情表現

### 技術的メリット
- **差別化**: 独自実装による他社との差別化
- **拡張性**: 各セレクトの独立性
- **パフォーマンス**: 必要な機能のみ実装

### 管理・運用
- **シンプル設定**: 3種類の明確な役割分担
- **メンテナンス性**: モジュール化された実装
- **アクセシビリティ**: 純正セレクトによる標準対応

## llll-ll.com 共通サポートBBS 具体仕様

### コンセプト
全アプリ共通のサポートBBSを1つ設置。分散による過疎化を防ぎ、活発なコミュニティを形成。

### セレクト機能の具体的用途

#### 1. 純正セレクト - サービス選択
```javascript
standardSelect: {
  label: 'サービス',
  options: ['Counter', 'Like', 'Ranking', 'BBS', '全般', 'その他']
}
```

**表示位置**: 名前と本文の間（タイトル風）
```
投稿者名 🇯🇵
[Counter] ← ここに表示
投稿内容がここに...
```

**未選択オプション**: 「選択なし」で未選択に戻せる

#### 2. インクリメンタル検索セレクト - 国選択
```javascript
incrementalSelect: {
  label: '国',
  options: ['日本', 'アメリカ', 'イギリス', 'フランス', 'ドイツ', 'カナダ', 'オーストラリア', '韓国', '中国', 'インド', 'ブラジル', 'イタリア', 'スペイン', 'ロシア', 'メキシコ', 'アルゼンチン', 'タイ', 'ベトナム', 'インドネシア', 'フィリピン', 'マレーシア', 'シンガポール', 'ニュージーランド', 'オランダ', 'ベルギー', 'スイス', 'オーストリア', 'ノルウェー', 'スウェーデン', 'デンマーク', 'フィンランド', 'ポーランド', 'チェコ', 'ハンガリー', 'ポルトガル', 'アイルランド', 'ギリシャ', 'トルコ', 'イスラエル', 'エジプト', '南アフリカ', 'ナイジェリア', 'ケニア', 'モロッコ', 'アルジェリア']
}
```

**UI仕様**:
- スマホ対応：全画面オーバーラップポップアップ
- 検索例：「j」→「日本」が上位表示
- 国旗アイコン付き選択肢

**表示位置**: 名前の右側
```
投稿者名 🇯🇵 ← ここに国旗表示
[Counter]
投稿内容がここに...
```

**国旗対応表**:
```javascript
const countryFlags = {
  '日本': '🇯🇵',
  'アメリカ': '🇺🇸', 
  'イギリス': '🇬🇧',
  'フランス': '🇫🇷',
  'ドイツ': '🇩🇪',
  'カナダ': '🇨🇦',
  'オーストラリア': '🇦🇺',
  '韓国': '🇰🇷',
  '中国': '🇨🇳',
  // ... 全国対応
}
```

**未選択機能**: 「未選択」ボタンで国旗を非表示に

#### 3. エモートセレクト - ユーザー画像指定
```javascript
emoteSelect: {
  label: '感情',
  options: [
    '/emotes/happy.png',     // 嬉しい
    '/emotes/sad.png',       // 悲しい  
    '/emotes/angry.gif',     // 怒り
    '/emotes/worried.svg',   // 不安
    '/emotes/thinking.png',  // 考え中
    '/emotes/sleepy.gif',    // 眠い
    '/emotes/yummy.png',     // 美味しい
    '/emotes/shocked.gif'    // 驚き
  ]
}
```

**UI仕様**: ロックマン2ステージセレクト風
- 2×4 グリッドレイアウト
- 大きなボタン（タップしやすい）
- 各感情に対応した専用イラスト使用予定

**表示位置**: 本文の左端
```
投稿者名 🇯🇵
[Counter]
😊 投稿内容がここに... ← 左端に感情表示
```

**未選択機能**: 「表情なし」ボタンで感情を非表示に

### 投稿表示例
```
田中太郎 🇯🇵
[Counter]
😊 カウンターの設置方法がわからないのですが、
   どなたか教えていただけませんか？
```

### UI実装詳細

#### 国選択ポップアップ（スマホ対応）
```css
.country-search-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.country-search-popup {
  background: white;
  width: 90vw;
  max-width: 400px;
  height: 80vh;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.country-search-input {
  font-size: 18px;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 8px;
  margin-bottom: 16px;
}

.country-results {
  flex: 1;
  overflow-y: auto;
}

.country-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  font-size: 16px;
}

.country-flag {
  font-size: 24px;
  margin-right: 12px;
}

.country-item:hover {
  background-color: #f5f5f5;
}

.country-clear {
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-size: 16px;
  margin-top: 12px;
  cursor: pointer;
}
```

#### エモート8感情グリッド（ロックマン2風）
```css
.emote-grid-8 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 12px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
}

.emote-option-8 {
  width: 60px;
  height: 60px;
  border: 3px solid #fff;
  border-radius: 8px;
  background: #f0f0f0;
  font-size: 32px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.emote-option-8:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  border-color: #ffd700;
}

.emote-clear-btn {
  grid-column: 1 / -1;
  background: #666;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}
```

### JavaScript実装
```javascript
// 国選択の全画面ポップアップ
class CountrySelectFullscreen {
  constructor(element, countries) {
    this.element = element
    this.countries = countries
    this.filteredCountries = countries
    this.init()
  }
  
  showPopup() {
    const overlay = document.createElement('div')
    overlay.className = 'country-search-overlay'
    overlay.innerHTML = this.getPopupHTML()
    document.body.appendChild(overlay)
    
    this.bindPopupEvents(overlay)
  }
  
  getPopupHTML() {
    return `
      <div class="country-search-popup">
        <input type="text" class="country-search-input" placeholder="国名を入力..." />
        <div class="country-results"></div>
        <button class="country-clear">未選択にする</button>
      </div>
    `
  }
  
  filterCountries(query) {
    return this.countries.filter(country => 
      country.includes(query) || 
      this.getCountryFlag(country) // 国旗での検索も対応
    )
  }
  
  getCountryFlag(country) {
    const flags = {
      '日本': '🇯🇵',
      'アメリカ': '🇺🇸',
      // ... 全国対応
    }
    return flags[country] || '🏳️'
  }
}

// 8感情エモートセレクト（ロックマン2風）
class EmoteSelect8Grid {
  constructor(element, emotes) {
    this.element = element
    this.emotes = emotes // 8個固定
    this.init()
  }
  
  renderGrid() {
    const grid = document.createElement('div')
    grid.className = 'emote-grid-8'
    
    this.emotes.forEach(emote => {
      const button = document.createElement('button')
      button.className = 'emote-option-8'
      button.textContent = emote
      button.onclick = () => this.selectEmote(emote)
      grid.appendChild(button)
    })
    
    // 未選択ボタン
    const clearBtn = document.createElement('button')
    clearBtn.className = 'emote-clear-btn'
    clearBtn.textContent = '表情なし'
    clearBtn.onclick = () => this.clearEmote()
    grid.appendChild(clearBtn)
    
    return grid
  }
}
```

---

*llll-ll.com共通サポートBBSにより、全サービスのユーザーが集まる活発なコミュニティが形成され、国際的な情報交換と感情豊かなコミュニケーションが実現される。*