# GitHub README での使い方

GitHub の README.md に Nostalgic のサービスを埋め込む方法を説明します。

## 概要

GitHub の README では JavaScript が実行されないため、通常の Web Components は使用できません。代わりに、**画像として埋め込む**方法を提供しています。

画像をクリックすると操作ページに飛び、そこで実際の操作（いいね、書き込みなど）ができます。

### 対応サービス

| サービス | 形式         | 動作                     |
| -------- | ------------ | ------------------------ |
| Counter  | バッジ       | 表示時にカウントアップ   |
| Like     | ボタン風画像 | クリックでいいねページへ |
| BBS      | 投稿一覧画像 | クリックで掲示板ページへ |

※ Ranking は README 埋め込みには対応していません

---

## Counter（カウンター）

訪問者数をバッジ形式で表示します。README が表示されるたびにカウントアップされます。

### 使い方

```markdown
![visitors](https://api.nostalgic.llll-ll.com/visit?action=increment&id=YOUR_ID&format=image&theme=github)
```

### パラメータ

| パラメータ | 必須 | 説明                                            |
| ---------- | ---- | ----------------------------------------------- |
| `id`       | ○    | カウンターの公開ID                              |
| `format`   | ○    | `image` を指定                                  |
| `theme`    | -    | `github`（推奨）、または既存テーマ              |
| `type`     | -    | `total`（デフォルト）、`today`、`week`、`month` |
| `digits`   | -    | ゼロ埋め桁数（例: `6`）                         |

### 表示例

```
┌──────────┬────────┐
│ visitors │  1234  │
└──────────┴────────┘
```

### コピペ用テンプレート

```markdown
<!-- カウンター（バッジ形式） -->

![visitors](https://api.nostalgic.llll-ll.com/visit?action=increment&id=YOUR_ID&format=image&theme=github)
```

---

## Like（いいね）

いいねボタンを表示します。クリックすると操作ページに移動し、そこでいいねを押せます。

**注意**: これは GitHub の Star とは異なります。GitHub アカウントがなくても誰でもいいねできます。

### 使い方

```markdown
[![Like](https://api.nostalgic.llll-ll.com/like?action=get&id=YOUR_ID&format=image)](https://nostalgic.llll-ll.com/like?id=YOUR_ID)
```

### パラメータ

| パラメータ | 必須 | 説明           |
| ---------- | ---- | -------------- |
| `id`       | ○    | いいねの公開ID |
| `format`   | ○    | `image` を指定 |

### 表示例

```
┌─────────┬──────┐
│ ♥ likes │  56  │
└─────────┴──────┘
```

Shields.io 風のバッジデザインで表示されます。

### コピペ用テンプレート

```markdown
<!-- いいねボタン（クリックでいいねページへ） -->

[![Like](https://api.nostalgic.llll-ll.com/like?action=get&id=YOUR_ID&format=image)](https://nostalgic.llll-ll.com/like?id=YOUR_ID)
```

---

## BBS（掲示板）

最新の書き込みを一覧表示します。クリックすると掲示板ページに移動し、そこで書き込みができます。

### 使い方

```markdown
[![BBS](https://api.nostalgic.llll-ll.com/bbs?action=get&id=YOUR_ID&format=image&limit=3)](https://nostalgic.llll-ll.com/bbs?id=YOUR_ID)
```

### パラメータ

| パラメータ | 必須 | 説明                            |
| ---------- | ---- | ------------------------------- |
| `id`       | ○    | BBSの公開ID                     |
| `format`   | ○    | `image` を指定                  |
| `limit`    | -    | 表示する投稿数（デフォルト: 3） |

### 表示例

```
┌───────┬────────────────────────────────┐
│  BBS  │ • ああああ: こんにちは！       │
│       │ • 名無し: テスト投稿です       │
│       │ • User: Hello world            │
└───────┴────────────────────────────────┘
```

白背景・黒文字のシンプルなデザインで、どのテーマの GitHub でも見やすく表示されます。

### コピペ用テンプレート

```markdown
<!-- BBS（クリックで掲示板ページへ） -->

[![BBS](https://api.nostalgic.llll-ll.com/bbs?action=get&id=YOUR_ID&format=image&limit=3)](https://nostalgic.llll-ll.com/bbs?id=YOUR_ID)
```

---

## デザインについて

GitHub README 用の画像は [Shields.io](https://shields.io/) のデザインを参考にしています。

- 左側：ラベル（グレー背景）
- 右側：値（色付き背景）
- 角丸のバッジ形式
- Verdana / DejaVu Sans 系フォント

これにより、他の一般的なバッジと並べても違和感のないデザインになっています。

---

## よくある質問

### Q: カウンターが更新されない

GitHub はプロキシ経由で画像をキャッシュするため、更新が反映されるまで数分〜数時間かかることがあります。

### Q: Like をクリックしてもいいねが増えない

GitHub の README 上では画像が表示されるだけです。クリックするとリンク先の操作ページに移動するので、そこでいいねボタンを押してください。

### Q: BBS に書き込むには？

BBS 画像をクリックすると掲示板ページに移動します。そこで書き込みフォームから投稿できます。

### Q: GitHub の Star との違いは？

- **GitHub Star**: GitHub アカウントが必要、リポジトリ単位
- **Nostalgic Like**: アカウント不要、どのページにも設置可能

Nostalgic Like は「気軽にいいね」を押してもらうための仕組みです。

---

## 関連ドキュメント

- [Counter サービス詳細](./services/counter.md)
- [Like サービス詳細](./services/like.md)
- [BBS サービス詳細](./services/bbs.md)
- [API リファレンス](./api.md)
