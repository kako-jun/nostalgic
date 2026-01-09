# クイックスタート

> 5分でNostalgicを使い始めましょう。

---

## 1. デモサイトを開く

**[https://nostalgic.llll-ll.com](https://nostalgic.llll-ll.com)** にアクセスするだけで、すぐに使い始められます。

- インストール不要
- アカウント登録不要
- ブラウザで開くだけ

---

## 2. サービスを選ぶ

左のサイドバーから使いたいサービスを選びます。

| サービス    | 用途               |
| ----------- | ------------------ |
| **Counter** | アクセスカウンター |
| **Like**    | いいねボタン       |
| **Ranking** | スコアランキング   |
| **BBS**     | 掲示板             |

---

## 3. サービスを作成する

例として、カウンターを作成してみましょう。

1. **Counter** ページを開く
2. 「使い方」タブをクリック
3. 以下を入力：
   - **サイトURL**: あなたのサイトのURL（例：`https://example.com`）
   - **オーナートークン**: 管理用の秘密のパスワード（8-16文字）
4. 「作成」ボタンをクリック

成功すると、**公開ID**（例：`example-a7b9c3d4`）が表示されます。

---

## 4. サイトに埋め込む

公開IDを使って、あなたのサイトにカウンターを埋め込みます。

```html
<!-- Web Componentを読み込む -->
<script src="https://nostalgic.llll-ll.com/components/visit.js"></script>

<!-- カウンターを表示 -->
<nostalgic-counter id="example-a7b9c3d4" type="total" theme="dark"></nostalgic-counter>
```

これだけで、レトロなカウンターがサイトに表示されます！

---

## 5. 他のサービスも同様

Like、Ranking、BBSも同じ流れで使えます。

```html
<!-- いいねボタン -->
<script src="https://nostalgic.llll-ll.com/components/like.js"></script>
<nostalgic-like id="your-id" theme="kawaii"></nostalgic-like>

<!-- ランキング -->
<script src="https://nostalgic.llll-ll.com/components/ranking.js"></script>
<nostalgic-ranking id="your-id" limit="10" theme="final"></nostalgic-ranking>

<!-- 掲示板 -->
<script src="https://nostalgic.llll-ll.com/components/bbs.js"></script>
<nostalgic-bbs id="your-id" theme="retro"></nostalgic-bbs>
```

---

## 次のステップ

### デモページで全機能を試す

APIを直接触らずに、デモページからすべての操作ができます。

→ [デモページの使い方](./demo-page.md)

### 各サービスの詳細を学ぶ

- [Counter（カウンター）](./services/counter.md)
- [Like（いいね）](./services/like.md)
- [Ranking（ランキング）](./services/ranking.md)
- [BBS（掲示板）](./services/bbs.md)

### カスタマイズ

テーマや表示オプションを変更できます。

→ [テーマとスタイル](./customization.md)

---

## 困ったら

- **公開IDを忘れた**: 同じURL+トークンで「作成」を再実行すると、既存の公開IDが返されます
- **トークンを忘れた**: トークンは復元できません。新しいサービスを作成してください
- **エラーが出る**: APIレスポンスのエラーメッセージを確認してください
