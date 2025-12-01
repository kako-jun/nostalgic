# Nostalgic Theme System Design

## 概要

新テーマシステムでは、現在のclassic/modern/retroから、light/dark/kawaiiの3つのテーマに移行する。

## 設計方針

### 1. カラースキーム

- **light/dark**: モノクロームのみで構成
  - 白、黒、グレースケールのみ使用
  - 色彩は一切使用しない
- **kawaii**: パステルカラーや装飾的要素を使用

### 2. スタイルの外部カスタマイズ

- 全サービス（Counter/Like/Ranking/BBS）で外部からスタイルを変更可能
- CSS変数による柔軟なカスタマイズ
- Web Componentsでも同様の仕組みを提供

### 3. 実装方法

- テーマはCSSクラスとして実装
- CSS変数でカスタマイズポイントを定義
- インラインスタイルの上書きにも対応

## テーマ定義

### Light Theme (モノクロ)

```css
.theme-light {
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --text-primary: #000000;
  --text-secondary: #666666;
  --border-color: #cccccc;
  --shadow: rgba(0, 0, 0, 0.1);
}
```

### Dark Theme (モノクロ)

```css
.theme-dark {
  --bg-primary: #1a1a1a;
  --bg-secondary: #2a2a2a;
  --text-primary: #ffffff;
  --text-secondary: #999999;
  --border-color: #444444;
  --shadow: rgba(255, 255, 255, 0.1);
}
```

### Kawaii Theme

```css
.theme-kawaii {
  --bg-primary: #fff0f5;
  --bg-secondary: #ffe4e1;
  --text-primary: #ff69b4;
  --text-secondary: #ff1493;
  --border-color: #ffb6c1;
  --shadow: rgba(255, 182, 193, 0.3);
  /* 追加の装飾的要素 */
}
```

## カスタマイズAPI

### Web Components

```html
<!-- デフォルトテーマ（darkが適用される） -->
<nostalgic-like id="..."></nostalgic-like>

<!-- 明示的にテーマ指定 -->
<nostalgic-like id="..." theme="light"></nostalgic-like>

<!-- インラインスタイル上書き -->
<nostalgic-like id="..." theme="light" style="--bg-primary: #f0f0f0; --text-primary: #333333;">
</nostalgic-like>

<!-- カスタムCSSクラス -->
<nostalgic-like id="..." theme="light" class="my-custom-style"> </nostalgic-like>
```

### API Response

```json
{
  "display": {
    "theme": "light",
    "customStyles": {
      "--bg-primary": "#f0f0f0",
      "--text-primary": "#333333"
    }
  }
}
```

## デフォルトテーマ

- システム全体のデフォルトテーマは **dark**
- ユーザーが明示的に指定しない場合は dark テーマを使用

## 移行計画

1. **既存テーマのマッピング**
   - classic → light
   - modern → dark（デフォルト）
   - retro → kawaii

2. **段階的移行**
   - 既存のテーマパラメータは維持（後方互換性）
   - 新テーマシステムを並行して実装
   - 最終的に旧テーマを廃止

3. **実装順序**
   1. CSS変数システムの実装
   2. 各サービスのテーマ対応
   3. Web Componentsのテーマ対応
   4. デモページの更新
   5. ドキュメントの更新
