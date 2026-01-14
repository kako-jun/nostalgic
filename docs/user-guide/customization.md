# Web Components Customization Guide

## 🎨 スタイルカスタマイズ方法

Nostalgic Web Componentsは複数の方法でスタイルをカスタマイズできます。

## 1. CSS Custom Properties（推奨）

### Ranking Component

```html
<style>
  nostalgic-ranking {
    /* サイズ調整 */
    --ranking-width: 480px;
    --ranking-padding: 15px;

    /* 色調整 */
    --ranking-bg-color: #f8f9fa;
    --ranking-border-color: #007bff;
    --ranking-header-bg: #007bff;
    --ranking-header-color: white;
    --ranking-text-color: #333;

    /* フォント調整 */
    --ranking-font-family: "Arial", sans-serif;

    /* アイテム間隔調整 */
    --ranking-item-padding: 10px 15px;
    --ranking-header-padding: 12px;
    --ranking-border-radius: 4px;
  }
</style>

<nostalgic-ranking id="game-abc123" theme="light"></nostalgic-ranking>
```

### BBS Component

```html
<style>
  nostalgic-bbs {
    /* サイズ調整 */
    --bbs-width: 480px;
    --bbs-max-height: 400px;

    /* メッセージ調整 */
    --bbs-message-padding: 12px;
    --bbs-message-margin: 8px;
    --bbs-message-border-radius: 8px;

    /* 色調整 */
    --bbs-bg-color: #ffffff;
    --bbs-border-color: #28a745;
    --bbs-header-bg: #28a745;
    --bbs-header-color: white;
    --bbs-message-bg: #f8f9fa;
    --bbs-text-color: #212529;

    /* フォント調整 */
    --bbs-font-family: "Helvetica", sans-serif;
    --bbs-border-radius: 4px;
  }
</style>

<nostalgic-bbs id="site-def456"></nostalgic-bbs>
```

### Counter Component

Counterコンポーネントは`theme`属性でスタイルを切り替えます。CSS変数によるカスタマイズは現在サポートされていません。

```html
<nostalgic-counter id="blog-ghi789" theme="dark"></nostalgic-counter>
```

### Like Component

```html
<style>
  nostalgic-like {
    /* カスタム色 */
    --like-bg: #ffeaa7;
    --like-text: #2d3436;
    --like-border: #fdcb6e;
    --like-radius: 8px;
    --like-font: "Arial", sans-serif;
  }
</style>

<nostalgic-like id="blog-jkl012"></nostalgic-like>
```

## 2. テーマ作成

### カスタムテーマCSS例

```html
<style>
  /* 企業ブランド風テーマ */
  .corporate-theme {
    --ranking-bg-color: #ffffff;
    --ranking-border-color: #0066cc;
    --ranking-header-bg: linear-gradient(135deg, #0066cc, #004499);
    --ranking-header-color: white;
    --ranking-text-color: #333333;
    --ranking-font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
    --ranking-border-radius: 8px;
    --ranking-item-padding: 12px 16px;
  }

  /* ダークテーマ */
  .dark-theme {
    --bbs-bg-color: #2c3e50;
    --bbs-border-color: #34495e;
    --bbs-header-bg: #34495e;
    --bbs-header-color: #ecf0f1;
    --bbs-message-bg: #34495e;
    --bbs-text-color: #ecf0f1;
    --bbs-message-border-radius: 6px;
  }

  /* ゲーム風テーマ */
  .game-theme {
    --ranking-bg-color: #1a1a2e;
    --ranking-border-color: #16213e;
    --ranking-header-bg: linear-gradient(45deg, #e94560, #f39c12);
    --ranking-header-color: white;
    --ranking-text-color: #eee;
    --ranking-font-family: "Courier New", monospace;
    --ranking-border-radius: 0;
    --ranking-item-padding: 8px 12px;
  }
</style>

<nostalgic-ranking class="corporate-theme" id="business-ranking"></nostalgic-ranking>
<nostalgic-bbs class="dark-theme" id="dark-bbs"></nostalgic-bbs>
<nostalgic-ranking class="game-theme" id="game-ranking"></nostalgic-ranking>
```

## 3. レスポンシブ対応

```html
<style>
  /* スマホ対応 */
  @media (max-width: 768px) {
    nostalgic-ranking {
      --ranking-width: 100%;
      --ranking-item-padding: 8px 12px;
    }

    nostalgic-bbs {
      --bbs-width: 100%;
      --bbs-max-height: 300px;
      --bbs-message-padding: 8px;
    }
  }

  /* デスクトップ対応 */
  @media (min-width: 1200px) {
    nostalgic-ranking {
      --ranking-width: 600px;
    }

    nostalgic-bbs {
      --bbs-width: 900px;
      --bbs-max-height: 600px;
    }
  }
</style>
```

> **Note**: 実装では `width: min(var(--ranking-width), 100%)` となっているため、指定した幅か画面幅の小さい方が適用されます。

## 4. 高度なカスタマイズ例

### 表形式ランキング

```html
<style>
  .table-style-ranking {
    --ranking-bg-color: white;
    --ranking-border-color: #dee2e6;
    --ranking-header-bg: #f8f9fa;
    --ranking-header-color: #495057;
    --ranking-text-color: #212529;
    --ranking-item-padding: 12px 16px;
    --ranking-border-radius: 0;
    --ranking-font-family: "Arial", sans-serif;
    --ranking-width: 400px;
  }
</style>

<nostalgic-ranking class="table-style-ranking" id="table-ranking"></nostalgic-ranking>
```

### チャット風BBS

```html
<style>
  .chat-style-bbs {
    --bbs-bg-color: #f1f3f4;
    --bbs-border-color: transparent;
    --bbs-header-bg: #4285f4;
    --bbs-header-color: white;
    --bbs-message-bg: white;
    --bbs-text-color: #202124;
    --bbs-message-border-radius: 18px;
    --bbs-message-padding: 10px 16px;
    --bbs-message-margin: 2px 8px;
    --bbs-border-radius: 12px;
    --bbs-width: 700px;
    --bbs-font-family: "Roboto", sans-serif;
  }
</style>

<nostalgic-bbs class="chat-style-bbs" id="chat-bbs"></nostalgic-bbs>
```

## 5. 利用可能なCSS Variables一覧

### Ranking Component

- `--ranking-bg-color`: 背景色
- `--ranking-border-color`: 枠線色
- `--ranking-header-bg`: ヘッダー背景色
- `--ranking-header-color`: ヘッダー文字色
- `--ranking-text-color`: 本文色
- `--ranking-font-family`: フォント
- `--ranking-padding`: 内部余白
- `--ranking-border-radius`: 角丸
- `--ranking-width`: 幅
- `--ranking-item-padding`: 項目内余白
- `--ranking-header-padding`: ヘッダー内余白

### BBS Component

- `--bbs-bg-color`: 背景色
- `--bbs-border-color`: 枠線色
- `--bbs-shadow-color`: 影色
- `--bbs-header-bg`: ヘッダー背景色
- `--bbs-header-color`: ヘッダー文字色
- `--bbs-message-bg`: メッセージ背景色
- `--bbs-text-color`: 文字色
- `--bbs-font-family`: フォント
- `--bbs-border-radius`: 角丸
- `--bbs-width`: 幅
- `--bbs-message-padding`: メッセージ内余白
- `--bbs-message-margin`: メッセージ間隔
- `--bbs-message-border-radius`: メッセージ角丸
- `--bbs-max-height`: 最大高さ
- `--bbs-header-padding`: ヘッダー内余白
- `--bbs-scrollbar-thumb`: スクロールバーの色
- `--bbs-scrollbar-hover`: スクロールバーホバー時の色

### Like Component

#### Interactive/Image Format

- `--like-bg`: 背景色
- `--like-text`: 文字色
- `--like-border`: 枠線色
- `--like-radius`: 角丸
- `--like-shadow`: 影色
- `--like-font`: フォント
- `--like-font-size`: フォントサイズ
- `--like-hover-bg`: ホバー時背景色
- `--like-icon-size`: アイコンサイズ
- `--like-icon-color`: アイコン色

#### Text Format

- `--like-text-color`: テキスト文字色
- `--like-text-hover-color`: テキストホバー時文字色

### Counter Component

CounterコンポーネントはCSS Variables未対応です。`theme`属性でスタイルを切り替えてください。

## 6. 言語設定（i18n）

すべてのWeb Componentsは `lang` 属性で表示言語を切り替えられます。

### 対応言語

- `ja`: 日本語
- `en`: 英語

### 使用方法

```html
<!-- 英語で表示 -->
<nostalgic-bbs id="your-id" lang="en"></nostalgic-bbs>

<!-- 日本語で表示 -->
<nostalgic-bbs id="your-id" lang="ja"></nostalgic-bbs>

<!-- ブラウザ言語で自動判定（デフォルト） -->
<nostalgic-bbs id="your-id"></nostalgic-bbs>
```

### 自動判定ロジック

`lang` 属性を指定しない場合、ブラウザの言語設定（`navigator.language`）を参照します。

- 日本語ブラウザ（`ja`, `ja-JP`など）→ 日本語で表示
- それ以外 → 英語で表示

### 全コンポーネント対応

```html
<nostalgic-counter id="..." lang="en"></nostalgic-counter>
<nostalgic-like id="..." lang="en"></nostalgic-like>
<nostalgic-ranking id="..." lang="en"></nostalgic-ranking>
<nostalgic-bbs id="..." lang="en"></nostalgic-bbs>
```

## 💡 Tips

1. **段階的カスタマイズ**: まず基本的な色から変更し、徐々に細かい調整を行う
2. **テーマファイル化**: よく使う組み合わせは別CSSファイルにまとめる
3. **ブラウザ互換性**: CSS Variables はモダンブラウザでサポート
4. **デバッグ**: ブラウザの開発者ツールでCSS Variablesを確認可能

## 🚀 1990年代風からモダンまで

従来の1990年代風デザインから、最新のフラットデザインまで、CSS Variablesで簡単に切り替え可能です！
