# カウンター画像テーマシステム

## 概要

カウンターの `theme` パラメータを拡張し、テキストベースのカラーテーマに加えて、数字画像ベースの画像テーマを追加する。

## テーマ一覧

### カラーテーマ（テキストベース）

既存の6テーマ。SVGテキストと背景色で表現。

| テーマ   | 背景色   | 文字色   | 説明            |
| -------- | -------- | -------- | --------------- |
| `light`  | 白       | 黒       | シンプル        |
| `dark`   | 暗い紫   | 白       | デフォルト      |
| `retro`  | 黒       | 緑       | ターミナル風    |
| `kawaii` | ピンク   | マゼンタ | かわいい系      |
| `mom`    | ベージュ | 茶       | MOTHER2風       |
| `final`  | 黒       | 金       | Final Fantasy風 |

### 画像テーマ（数字画像）

新規追加の4テーマ。各数字をSVGパスで描画。

| テーマ    | 説明                                      |
| --------- | ----------------------------------------- |
| `mahjong` | 麻雀牌（萬子）- 零萬〜九萬                |
| `segment` | 7セグメントLED - 発光感のあるデジタル表示 |
| `nixie`   | ニキシー管 - オレンジグロー、ガラス管表現 |
| `dot_f`   | ドット絵 - FF5風レトロRPGスタイル         |

## API仕様

```
GET /api/visit?action=get&id={ID}&format=image&theme={THEME}
```

### format パラメータ

| 値      | 説明                               |
| ------- | ---------------------------------- |
| `json`  | JSONデータ                         |
| `text`  | プレーンテキスト（theme無視）      |
| `image` | SVG画像（themeで表示スタイル決定） |

※ `format=svg` は廃止

## 実装方針

### 数字データの埋め込み

外部ファイルではなく、コード内にSVGパスとして埋め込む。

```typescript
const IMAGE_THEMES = {
  mahjong: {
    width: 32,
    height: 40,
    digits: {
      "0": `<svg>...</svg>`,
      "1": `<svg>...</svg>`,
      // ...
    }
  },
  segment: { ... },
  nixie: { ... },
  dot_f: { ... },
};
```

### 判定ロジック

```typescript
const IMAGE_THEME_NAMES = ["mahjong", "segment", "nixie", "dot_f"];

if (IMAGE_THEME_NAMES.includes(theme)) {
  return generateImageCounterSVG(value, theme);
} else {
  return generateCounterSVG(value, theme); // 既存のテキストベース
}
```

## 各テーマの詳細仕様

### mahjong（麻雀牌）

- 萬子（マンズ）をベースに零萬を追加
- 牌の背景: 白〜アイボリー
- 文字: 赤（数字）+ 黒（萬の字）
- サイズ: 32x40px

### segment（7セグメントLED）

- 発光感のある赤色LED
- 消灯セグメントも薄く表示
- 背景: 暗いグレー
- サイズ: 24x40px

### nixie（ニキシー管）

- オレンジ色のグロー効果
- ガラス管の反射表現
- メッシュ/グリッドの背景
- サイズ: 28x40px

### dot_f（ドット絵）

- FF5のダメージ数字風
- 白文字 + 黒縁取り
- 8x8または16x16ピクセルベース
- サイズ: 16x24px

## Web Component

```html
<!-- カラーテーマ -->
<nostalgic-counter id="xxx" theme="dark"></nostalgic-counter>

<!-- 画像テーマ -->
<nostalgic-counter id="xxx" theme="mahjong"></nostalgic-counter>
<nostalgic-counter id="xxx" theme="segment"></nostalgic-counter>
<nostalgic-counter id="xxx" theme="nixie"></nostalgic-counter>
<nostalgic-counter id="xxx" theme="dot_f"></nostalgic-counter>
```

## 利点

- **統一されたAPI**: `theme` パラメータのみで全スタイル切り替え
- **外部依存なし**: SVGパスをコード内に埋め込み
- **高品質**: ベクター画像で拡縮しても美しい
- **軽量**: 追加のHTTPリクエスト不要
