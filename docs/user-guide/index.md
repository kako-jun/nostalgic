# Nostalgic ユーザーガイド

> 1990年代のWebツールを現代技術で復活。懐かしくて新しい体験を。

---

## はじめに

### [1. クイックスタート](./quick-start.md)

5分でNostalgicを使い始めましょう。

- デモページを開く
- 最初のカウンターを作る
- サイトに埋め込む

### [2. デモページの使い方](./demo-page.md)

APIを直接触らずに、すべての機能を試せます。

- サービスの作成・管理
- 各種操作（カウント、いいね、スコア送信、投稿など）
- 設定変更・削除

---

## サービス詳細

### [3. Counter（カウンター）](./services/counter.md)

昔懐かしいアクセスカウンター。複数期間の統計、SVG画像生成対応。

- 累計・今日・昨日・週間・月間カウント
- 6種類のテーマ（light/dark/retro/kawaii/mom/final）
- 1日1回重複防止

### [4. Like（いいね）](./services/like.md)

トグル型のいいねボタン。シンプルで使いやすい。

- いいね/取り消しのトグル動作
- ユーザー状態管理
- 1日1回制限

### [5. Ranking（ランキング）](./services/ranking.md)

スコアランキングボード。ゲームのハイスコア管理に最適。

- 自動ソート（昇順/降順）
- 最大エントリー数制限
- フォーマット済みスコア表示

### [6. BBS（掲示板）](./services/bbs.md)

メッセージボード。投稿者による編集・削除も可能。

- 投稿時のオプションフィールド（アイコン、セレクト）
- 投稿者/管理者による編集・削除
- IP+UserAgentによる投稿者認証

---

## カスタマイズ

### [7. GitHub README での使い方](./github-readme.md)

GitHub の README.md にサービスを埋め込む方法。

- Counter バッジ（訪問者数）
- Like ボタン（いいね）
- BBS 一覧（最新投稿）

### [8. テーマとスタイル](./customization.md)

Web Componentsのカスタマイズ方法。

- 6種類のテーマ
- 属性によるカスタマイズ
- サイトへの埋め込み方法

---

## APIリファレンス

### [9. API仕様](./api.md)

GET専用の統一アクション型API。URLバーから直接操作も可能。

- 全サービス共通のURLパターン
- 認証とセキュリティ
- Webhook連携

### [10. WebHook連携](./webhook.md)

Discord/Slack等への通知連携。

- 対応イベント（カウント増加、いいね、ランキング更新、BBS投稿）
- ペイロード形式
- 設定方法

---

## 開発者向け

- [開発者向けドキュメント](../development/) - デザイン哲学、将来計画、技術仕様

---

## リンク

- **デモサイト**: [https://nostalgic.llll-ll.com](https://nostalgic.llll-ll.com)
- **API**: [https://api.nostalgic.llll-ll.com](https://api.nostalgic.llll-ll.com)
- **リポジトリ**: [https://github.com/kako-jun/nostalgic](https://github.com/kako-jun/nostalgic)
