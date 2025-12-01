# Nostalgic - 実装タスク

## ✅ 実装済みサービス

### 1. Counter Service ✅

- [x] **API実装**: `/api/visit`
  - [x] 作成（create）
  - [x] カウントアップ（increment）
  - [x] 値設定（set）
  - [x] 表示（display）- SVG、JSON、テキスト
  - [x] 削除（delete）
  - [x] 重複防止機能（1日1回、0時リセット）
  - [x] 日別統計の自動集計

### 2. Like Service ✅

- [x] **API実装**: `/api/like`
  - [x] 作成（create）
  - [x] いいね切り替え（toggle）
  - [x] 状態取得（get）
  - [x] 表示（display）
  - [x] 値設定（set）
  - [x] 削除（delete）
  - [x] ユーザー状態の日付境界まで保持

### 3. Ranking Service ✅

- [x] **API実装**: `/api/ranking`
  - [x] 作成（create）
  - [x] スコア送信（submit）
  - [x] スコア更新（update）
  - [x] エントリー削除（remove）
  - [x] ランキング取得（get）
  - [x] 表示（display）
  - [x] 全クリア（clear）
  - [x] 削除（delete）

### 4. BBS Service ✅

- [x] **API実装**: `/api/bbs`
  - [x] 作成（create）
  - [x] メッセージ投稿（post）
  - [x] メッセージ編集（editMessage, editMessageById）
  - [x] メッセージ削除（deleteMessage, deleteMessageById）
  - [x] メッセージ一覧（get）
  - [x] 表示（display）
  - [x] 全クリア（clear）
  - [x] 設定更新（updateSettings）
  - [x] 削除（delete）
  - [x] ページネーション
  - [x] カスタムドロップダウン・アイコン

### 5. Admin Service ✅

- [x] **API実装**: `/api/admin/cleanup`
  - [x] サービス削除（cleanup）
  - [x] 自動クリーンアップ（autoCleanup）
  - [x] URL指定削除（cleanupByUrl）

## 🚨 動作確認が必要なタスク

### 本番環境での動作確認

- [ ] **Counter Service**: 全アクションの動作確認
- [ ] **Like Service**: 全アクションの動作確認
- [ ] **Ranking Service**: 全アクションの動作確認
- [ ] **BBS Service**: 全アクションの動作確認
- [ ] **Web Components**: visit.js, like.js の動作確認

## ✅ 完了済み（DDD化・型安全化）

### アーキテクチャ大規模リファクタリング ✅

- [x] **ドメイン駆動設計（DDD）への移行**
  - [x] `/src/domain/` 構造の実装
  - [x] Result型パターンの導入
  - [x] Repository パターンの実装
  - [x] BaseService 抽象クラスの実装
  - [x] 各ドメインサービスの実装（Counter, Like, Ranking, BBS）
- [x] **100%型安全性の達成**
  - [x] 全ての `: any` 型注釈を除去
  - [x] 全ての型アサーション（as）を最小限に
  - [x] Zod による完全な実行時型検証
- [x] **統一スキーマアーキテクチャの導入**
  - [x] CommonSchemas と FieldSchemas の分離
  - [x] 各ドメインエンティティでのスキーマ一元管理
  - [x] API層でのスキーマ参照統一
- [x] **旧実装の完全削除**
  - [x] `/src/lib/services/` フォルダ削除
  - [x] 旧APIエンドポイント削除
  - [x] レガシーサポートコード削除

### 管理ツール実装 ✅

- [x] Redis Show改善（日別データの日付順ソート）
- [x] Service別データ表示（`npm run redis:service`）
- [x] サービス削除スクリプト（`npm run cleanup:service`）
- [x] データ修正スクリプト（`npm run redis:fix`）

### ドキュメント整備 ✅

- [x] `.claude/unified-schema-architecture.md` - 統一スキーマ設計
- [x] `.claude/redis-database-structure.md` - Redis構造仕様
- [x] `.claude/architecture.md` - DDDアーキテクチャ説明
- [x] `.claude/api-specification.md` - API仕様書
- [x] `.claude/webcomponents-defensive-programming.md` - WebComponents設計方針
- [x] `.claude/bbs-design.md` - BBS機能設計

## 📋 今後のタスク（優先度：最高）

### 静的サイト統合システム 🌟

- [ ] **画像バッジ機能実装**
  - [ ] Counter: 画像表示 = カウントアップ統合
  - [ ] Like: 画像表示 + クリック可能いいねボタン
  - [ ] Ranking: 画像でのランキング表示（リードオンリー）
  - [ ] BBS: 画像表示 + クリックマップによる完全BBS機能
- [ ] **革新的価値**
  - [ ] GitHub Pages完全対応
  - [ ] note・はてなブログ等での統計取得
  - [ ] `<img>` + `<a>` + `<map>` だけで現代機能実現

### BBSセレクト機能拡張 📝

- [ ] **3種類セレクト機能実装**
  - [ ] 純正セレクト: OS標準UI（サービス選択等）
  - [ ] インクリメンタル検索セレクト: 独自実装（国選択等）
  - [ ] エモートセレクト: 独自実装（ユーザー画像指定）
- [ ] **llll-ll.com共通サポートBBS**
  - [ ] 全アプリ統一サポート掲示板設置
  - [ ] 国旗・感情アイコン・サービス選択機能

### 6テーマシステム拡張 🎨

- [ ] **新テーマ3種追加**
  - [ ] mother2: マザー2風（オレンジ枠 + 黄緑斜めチェック）
  - [ ] ff: FF風青テーマ
  - [ ] fancy: ファンシー系テーマ
- [ ] **全4サービス対応**
  - [ ] Counter/Like/Ranking/BBS全対応
  - [ ] 統一CSS設計による一貫性

### カウンター画像化システム 🖼️

- [ ] **数字画像ベース実装**
  - [ ] `format="image"` 対応
  - [ ] `font` 属性（ff/dot）追加
  - [ ] 透明背景SVG数字素材（60ファイル）
  - [ ] テーマ別画像対応

## 📋 今後のタスク（優先度：高）

### 通知システム (Webhook) ✅

- [x] **Webhook機能実装**
  - [x] カウンター増加時の通知
  - [x] Like状態変更時の通知
  - [x] ランキング更新時の通知
  - [x] BBS書き込み時の通知
  - [x] Webhook URL設定・管理機能
  - [x] 通知ペイロード設計
  - [x] 簡易実装（リトライなし）
  - [x] デモページへのwebhookUrlフィールド追加
  - [x] APIドキュメントへの説明追加

### テーマシステム大幅改修 ✅

- [x] **新テーマ分類への移行**
  - [x] 現在のテーマ（classic/modern/retro）を廃止
  - [x] 新テーマ実装: light、dark、kawaii
  - [x] 全サービス（Counter/Like/Ranking/BBS）への適用
  - [x] Web Componentsテーマ対応
- [ ] **ホームページテーマサンプル展示**
  - [ ] 全テーマのサンプル表示
  - [ ] インタラクティブテーマ切り替え
  - [ ] テーマプレビュー機能

### カウンター表示改善 📊

- [ ] **Image形式カウンターの改修**
  - [ ] SVGテキストから画像ベースカウンターに変更
  - [ ] 数字画像アセットの作成
  - [ ] レトロ風ドット文字対応
  - [ ] テーマ別カウンター画像

### デモページ修正 🛠️

- [ ] **フォームボタン動作修正**
  - [ ] 動作しないボタンの特定・修正
  - [ ] 全デモページでの動作確認
  - [ ] エラーハンドリング改善

### Web Components の実装 ✅

- [x] Counter用Web Component (`/components/visit.js`) - 237行
- [x] Like用Web Component (`/components/like.js`) - 389行
- [x] Ranking用Web Component (`/components/ranking.js`) - 458行
- [x] BBS用Web Component (`/components/bbs.js`) - 748行

### パフォーマンス最適化

- [ ] Redis接続プーリング
- [ ] キャッシュ戦略の見直し
- [ ] バッチ処理の最適化

### セキュリティ強化

- [ ] レート制限の実装
- [ ] 入力検証の強化
- [ ] CORS設定の最適化

## 📚 優先度：低

### テストの追加

- [ ] ユニットテスト（各ドメインサービス）
- [ ] 統合テスト（APIエンドポイント）
- [ ] E2Eテスト（デモページ）

### 監視・ロギング

- [ ] エラー監視システム
- [ ] パフォーマンス監視
- [ ] 使用量ダッシュボード

## 🎨 新サービスアイデア

### Rate Service（評価サービス）

- 1〜5段階の星評価システム
- 1人1つの評価値を保存・更新可能

## 🚫 実装しないサービス

### Rate Service（レートサービス）について

- 通常のLikeとは異なり、1人が星5評価をしても、2人目がクリックしても10にはならない
- 評価の平均値表示や入力フィールドの複雑性を考慮し、現時点では実装しない
- Likeサービスでのアイコン切り替え機能で代替する

## 🧑‍💻 人間系タスク

### プロジェクト環境設定

- [ ] **本番環境テスト**: DDD化後の全機能確認
- [ ] **パフォーマンス測定**: 旧実装との比較
- [ ] **エラー監視設定**: Vercelでのエラー追跡

## 📝 技術的負債と改善点

### 発見された問題

- URL mappingのデータ不整合（ダブルクォーテーション有無）
- `counter:` プレフィックス付きURLキーの存在
- 異なる時期の実装による型の違い

### 今後の課題

- APIのバージョニング戦略
- マイグレーション戦略
- データ整合性チェックツール

## 🎯 現在の状態

### 完了

- [x] DDDアーキテクチャへの完全移行
- [x] 100%型安全性の達成
- [x] 統一スキーマアーキテクチャの導入
- [x] 全サービスのAPI実装
- [x] Result型によるエラーハンドリング統一
- [x] 管理ツール・スクリプトの整備
- [x] ドキュメントの整備

### 残タスク

- [ ] 本番環境での全サービス動作確認
- [ ] パフォーマンス最適化
- [ ] テストの追加

### 次のステップ

1. **ホームページテーマサンプル展示**（最優先）
2. **カウンター画像化対応**
3. **デモページフォーム修正**
4. 本番環境での動作確認
5. パフォーマンス測定と最適化
