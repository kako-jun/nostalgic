export default function BBSFeaturesTab() {
  return (
    <>
      <div className="nostalgic-title-bar">
        ★ Nostalgic BBS ★
        <br />
        機能一覧
      </div>

      <div className="nostalgic-marquee-box">
        <div className="nostalgic-marquee-text">
          💬
          懐かしの掲示板！３種類のセレクト機能（純正・検索・エモート）・編集削除・ページネーション！昔の掲示板がここに復活！
          💬
        </div>
      </div>

      <div className="nostalgic-section">
        <p>
          <span className="nostalgic-section-title">
            <b>◆基本機能◆</b>
          </span>
        </p>
        <p>
          <span>●</span> メッセージ投稿・取得
          <br />
          <span>●</span> ３種類のセレクト機能（純正・検索・エモート）
          <br />
          <span>●</span> ユーザーカスタム設定対応
          <br />
          <span>●</span> Web Componentsで簡単設置
        </p>
      </div>

      <div className="nostalgic-section">
        <p>
          <span className="nostalgic-section-title">
            <b>◆管理機能◆</b>
          </span>
        </p>
        <p>
          <span>●</span> 投稿者による自分の投稿編集・削除
          <br />
          <span>●</span> ページネーション
          <br />
          <span>●</span> 最大メッセージ数制限
          <br />
          <span>●</span> 完全削除・クリア機能
        </p>
      </div>

      <div className="nostalgic-section">
        <p>
          <span className="nostalgic-section-title">
            <b>◆技術仕様◆</b>
          </span>
        </p>
        <p>
          <span>●</span>Cloudflare Workers でホスティング
          <br />
          <span>●</span>D1 (SQLite) でメッセージ保存
          <br />
          <span>●</span>純粋なGET、1990年代スタイル
          <br />
          <span>●</span>必要なすべての要素が無料プランの範囲で動作するため、完全無料・広告なしを実現
        </p>
      </div>
    </>
  );
}
