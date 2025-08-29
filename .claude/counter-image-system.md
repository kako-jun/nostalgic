# カウンター画像化システム実装計画

## 概要
現在のSVGテキストベースカウンターを、数字画像ベースのシステムに拡張する。

## 新しい表示形式
- **現在**: `format="svg"` (テキストベースSVG)
- **追加1**: `format="image"` (数字画像ベースSVG) 
- **追加2**: `format="text"` (プレーンテキスト)

## 属性設計
```html
<!-- 画像ベース -->
<nostalgic-counter id="xxx" format="image" theme="light" font="final" />
<nostalgic-counter id="xxx" format="image" theme="dark" font="dot" />

<!-- プレーンテキスト -->
<nostalgic-counter id="xxx" format="text" />

<!-- 従来のSVG（後方互換） -->
<nostalgic-counter id="xxx" format="svg" theme="light" />
```

## ディレクトリ構造
```
public/assets/numbers/
├── light/
│   ├── final/        # Final Fantasy風フォント
│   │   ├── 0.svg
│   │   ├── 1.svg
│   │   └── ...9.svg
│   └── dot/       # 8bitドット風フォント
│       ├── 0.svg
│       └── ...9.svg
├── dark/
│   ├── final/
│   └── dot/
└── kawaii/
    ├── final/
    └── dot/
```

## 実装ステップ

### Phase 1: 基盤準備
- [ ] 数字素材作成（0-9.svg × 3テーマ × 2フォント = 60ファイル）
- [ ] ディレクトリ構造作成

### Phase 2: API実装
- [ ] SVG生成関数の実装
```typescript
function generateImageCounterSVG(count: string, theme: string, font: string): string
function generateTextCounter(count: string): string
```
- [ ] `/api/visit` の `format=image`, `format=text` 対応

### Phase 3: Web Component更新
- [ ] `visit.js` に `format`, `font` 属性対応追加
- [ ] 後方互換性の確保

### Phase 4: UI更新
- [ ] ホームページにサンプル表示追加
- [ ] デモページの更新

## 数字素材仕様
- **形式**: SVG
- **サイズ**: 30px × 40px（統一）
- **背景**: 透明
- **色**: テーマカラーで統一

### テーマカラー
- **light**: `#333333` (ダークグレー)
- **dark**: `#finalfinalfinal` (ホワイト)
- **kawaii**: `#e91e63` (ピンク)

### フォントスタイル
- **final**: Final Fantasy風角ばったフォント
- **dot**: 8bitドット絵風フォント

## API仕様拡張
```
GET /api/visit?action=display&format=image&theme=light&font=final&id=xxx&type=total
GET /api/visit?action=display&format=text&id=xxx&type=total
```

## レスポンス例
```xml
<!-- format=image -->
<svg width="120" height="40" xmlns="http://www.w3.org/2000/svg">
  <image x="0" y="0" width="30" height="40" href="/assets/numbers/light/final/1.svg" />
  <image x="30" y="0" width="30" height="40" href="/assets/numbers/light/final/2.svg" />
  <image x="60" y="0" width="30" height="40" href="/assets/numbers/light/final/3.svg" />
  <image x="90" y="0" width="30" height="40" href="/assets/numbers/light/final/4.svg" />
</svg>
```

```
<!-- format=text -->
1234
```

## 利点
- **透明背景**: サイトデザインに自然に溶け込む
- **高品質**: ベクター画像で拡縮しても美しい
- **軽量**: 背景・枠描画処理が不要
- **カスタマイズ性**: テーマ×フォントの豊富な組み合わせ
- **アクセシビリティ**: プレーンテキスト形式で対応

## ホームページ表示予定
```html
<!-- カウンターサンプルセクション -->
<div>画像ベース（FF風）</div>
<nostalgic-counter format="image" theme="light" font="final" />

<div>画像ベース（ドット風）</div>
<nostalgic-counter format="image" theme="kawaii" font="dot" />

<div>プレーンテキスト</div>
<nostalgic-counter format="text" />
</div>
```