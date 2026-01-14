export default function YokosoFeaturesTab() {
  return (
    <>
      <div className="nostalgic-title-bar">
        ★ Nostalgic Yokoso ★
        <br />
        機能一覧
      </div>

      <div className="nostalgic-marquee-box">
        <div className="nostalgic-marquee-text">
          招き猫がメッセージを喋る！ようこそ（Yokoso）で訪問者をおもてなし！縁起物としてもどうぞ！
        </div>
      </div>

      <div className="nostalgic-section">
        <p>
          <span className="nostalgic-section-title">
            <b>◆基本機能◆</b>
          </span>
        </p>
        <p>
          <span>●</span> 招き猫（Maneki-neko）がメッセージを喋る
          <br />
          <span>●</span> SVG画像: バッジ（20文字）/カード（140文字）、Web Component: カードのみ
          <br />
          <span>●</span> API経由でメッセージを動的更新
          <br />
          <span>●</span> GitHub READMEに埋め込み可能
          <br />
          <span>●</span> Web Componentsで簡単設置
        </p>
      </div>

      <div className="nostalgic-section">
        <p>
          <span className="nostalgic-section-title">
            <b>◆招き猫アバター◆</b>
          </span>
        </p>
        <p>
          <span>●</span> デフォルトは招き猫アイコン
          <br />
          <span>●</span> カードモードでは「Maneki」というデフォルト名
          <br />
          <span>●</span> 自分のアバター画像URLを設定可能
          <br />
          <span>●</span> プロジェクトの縁起物・マスコットとして活用できる
        </p>
      </div>

      <div className="nostalgic-section">
        <p>
          <span className="nostalgic-section-title">
            <b>◆管理機能◆</b>
          </span>
        </p>
        <p>
          <span>●</span> バレてはいけない「オーナートークン」で安全管理
          <br />
          <span>●</span> バレてもかまわない「公開ID」で表示専用アクセス
          <br />
          <span>●</span> メッセージ更新でREADME編集不要
        </p>
      </div>

      <div className="nostalgic-section">
        <p>
          <span className="nostalgic-section-title">
            <b>◆なぜ「Yokoso」？◆</b>
          </span>
        </p>
        <p>
          <span>●</span> <b>ようこそ（Yokoso）</b> = 日本語で「Welcome」
          <br />
          <span>●</span> <b>招き猫（Maneki-neko）</b> = 幸運を招く猫
          <br />
          <span>●</span> 世界中で認知されている日本文化のシンボル
          <br />
          <span>●</span> プロジェクトに幸運をもたらすお守りとして
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
          <span>●</span>D1 (SQLite) でデータ保存
          <br />
          <span>●</span>SVG画像生成でGitHub README対応
          <br />
          <span>●</span>必要なすべての要素が無料プランの範囲で動作するため、完全無料・広告なしを実現
        </p>
      </div>

      <div className="nostalgic-section">
        <p>
          <span className="nostalgic-section-title">
            <b>◆GitHubのREADMEに埋め込む◆</b>
          </span>
        </p>
        <p>
          GitHubのREADME.mdにも招き猫を埋め込めます！
          <br />
          <a href="/github" className="nostalgic-old-link">
            → 埋め込み方法はこちら
          </a>
        </p>
      </div>
    </>
  );
}
