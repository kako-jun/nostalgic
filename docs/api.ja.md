# Nostalgic API リファレンス

## 概要

Nostalgicは90年代のインターネット文化から懐かしいWebツール（カウンター・いいね・ランキング・BBS）を最新技術で復活させた総合プラットフォームです。すべてのサービスは統一されたアクション型API設計に従っています。

## API アーキテクチャ

すべてのサービスは**GET リクエストのみ**の同じURLパターンでアクションパラメータを使用します：

```
/api/{service}?action={action}&url={your-site}&token={your-token}&...params
```

### 🌐 なぜGETのみ？ 1990年代Web文化への回帰

オリジナルの1990年代Webツールと同じく、すべてブラウザのURL欄から直接操作できます：

1. **クリックで作成**: リンクを共有するだけでサービスが作成
2. **URL ベース操作**: すべてのアクションが単純なGETリンク
3. **懐かしい簡単さ**: 複雑なフォームやPOSTリクエスト不要
4. **簡単共有**: すべての操作が共有可能なURL
5. **BBS文化**: メッセージ投稿もGETパラメータ、昔のままのスタイル

## サービス

### 📊 [カウンターサービス](services/counter.ja.md)

複数期間統計と懐かしい表示スタイルを持つ従来の訪問者カウンター。

### 💖 [いいねサービス](services/like.ja.md)

ユーザー状態追跡機能付きのトグル型いいね/取り消しボタン。

### 🏆 [ランキングサービス](services/ranking.ja.md)

自動ソートと管理機能を持つスコアリーダーボードシステム。

### 💬 [BBSサービス](services/bbs.ja.md)

カスタマイズ可能なオプションと投稿者による編集機能を持つメッセージボード。

## 共通概念

### 認証と所有権

- **オーナートークン**: サービス管理用の8-16文字秘密文字列
- **公開ID**: 表示/操作用の安全な識別子（形式: `domain-hash8`）
- **ユーザーハッシュ**: 重複防止と投稿者確認用のIP+UserAgent

### セキュリティ機能

- SHA256ハッシュ化トークン保存
- 1日1回重複防止（0時リセット）
- 公開IDシステムによる不正アクセス防止
- 投稿者確認による編集権限管理

### Webhook機能

各サービスは、重要なイベント発生時に自動通知を送信するWebhook機能をサポートしています：

- **リアルタイム通知**: サービスイベント（カウントアップ、いいね、ランキング変動、BBS投稿など）の即座通知
- **Slack/Discord/Teams対応**: チーム用チャットツールとの簡単統合
- **シンプル設計**: リトライやデジタル署名なしの軽量実装
- **オプション設定**: サービス作成時またはアップデート時にwebhookUrlパラメータで設定

### サービスライフサイクル

1. **作成**: URL + トークン → 公開ID返却
2. **使用**: 公開IDで表示/操作
3. **管理**: URL + トークンでオーナー操作

## クイックスタート例

### カウンター

```bash
# カウンター作成（Webhook付き）
curl "https://api.nostalgic.llll-ll.com/visit?action=create&url=https://yoursite.com&token=your-secret&webhookUrl=https://hooks.slack.com/services/YOUR/WEBHOOK/URL"

# カウンター取得
curl "https://api.nostalgic.llll-ll.com/visit?action=get&id=yoursite-a7b9c3d4&type=total&theme=light"
```

### いいね

```bash
# いいねボタン作成（Webhook付き）
curl "https://api.nostalgic.llll-ll.com/like?action=create&url=https://yoursite.com&token=your-secret&webhookUrl=https://hooks.slack.com/services/YOUR/WEBHOOK/URL"

# いいねトグル
curl "https://api.nostalgic.llll-ll.com/like?action=toggle&id=yoursite-a7b9c3d4"
```

### ランキング

```bash
# スコア系ゲーム用ランキング作成（高スコア優先、Webhook付き）
curl "https://api.nostalgic.llll-ll.com/ranking?action=create&url=https://yoursite.com&token=your-secret&max=100&sortOrder=desc&webhookUrl=https://hooks.slack.com/services/YOUR/WEBHOOK/URL"

# タイム系ゲーム用ランキング作成（低タイム優先）
curl "https://api.nostalgic.llll-ll.com/ranking?action=create&url=https://yoursite.com&token=your-secret&max=100&sortOrder=asc"

# スコア送信
curl "https://api.nostalgic.llll-ll.com/ranking?action=submit&id=yoursite-a7b9c3d4&name=Player1&score=1000"
```

### BBS

```bash
# BBS作成（Webhook付き）
curl "https://api.nostalgic.llll-ll.com/bbs?action=create&url=https://yoursite.com&token=your-secret&max=1000&webhookUrl=https://hooks.slack.com/services/YOUR/WEBHOOK/URL"

# メッセージ投稿
curl "https://api.nostalgic.llll-ll.com/bbs?action=post&id=yoursite-a7b9c3d4&author=User&message=こんにちは！"
```

## デモページ

すべてのサービスをテストできるインタラクティブデモページ：

- **[カウンターデモ](https://nostalgic.llll-ll.com/counter)**
- **[いいねデモ](https://nostalgic.llll-ll.com/like)**
- **[ランキングデモ](https://nostalgic.llll-ll.com/ranking)**
- **[BBSデモ](https://nostalgic.llll-ll.com/bbs)**

## デプロイメント

### ホスト型サービス（推奨）

`https://nostalgic.llll-ll.com` を使用 - セットアップ不要！

### セルフホスティング

1. このリポジトリをフォーク
2. Cloudflare Workersにデプロイ
3. D1データベースを作成・設定
4. Web ComponentのURLを自分のドメインに更新

---

_各サービスの詳細なAPI仕様については、`/docs/services/` ディレクトリ内の個別サービスドキュメントを参照してください。_
