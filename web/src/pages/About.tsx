import NostalgicLayout from "../components/NostalgicLayout";
import { FooterDivider } from "../components/common";

export default function AboutPage() {
  return (
    <NostalgicLayout serviceName="About" serviceIcon="?">
      <div className="nostalgic-title-bar">★☆★ このサイトについて ★☆★</div>

      <div className="nostalgic-section">
        <p>
          <span className="nostalgic-section-title">
            <b>◆開発者より◆</b>
          </span>
        </p>
        <p>
          1990年代後半〜2000年代前半のホームページには、必ずと言っていいほど設置されていたという「アクセスカウンター」。
        </p>
        <p>「キリ番」のワクワク感を味わってみたくて、このサービスを作りました。</p>
      </div>

      <div className="nostalgic-section">
        <p>
          <span className="nostalgic-section-title">
            <b>◆技術について◆</b>
          </span>
        </p>
        <p>見た目はレトロですが、中身は最新技術を使っています。</p>
        <p>
          • Cloudflare Workers (Hono)
          <br />
          • Cloudflare D1 (SQLite)
          <br />
          • Vite + React
          <br />
          • Web Components
          <br />• SVG Graphics
        </p>
      </div>

      <div className="nostalgic-section">
        <p>
          <span className="nostalgic-section-title">
            <b>◆お問い合わせ◆</b>
          </span>
        </p>
        <p>
          バグ報告・機能要望は{" "}
          <a
            href="https://github.com/kako-jun/nostalgic-counter/issues"
            className="nostalgic-old-link"
          >
            GitHub Issues
          </a>{" "}
          まで！
        </p>
      </div>

      <FooterDivider />

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <img src="/footer.webp" alt="Footer" style={{ maxWidth: "100%", height: "auto" }} />
        <p style={{ marginTop: "10px", fontSize: "14px", color: "#666666" }}>Made in Kanazawa</p>
      </div>
    </NostalgicLayout>
  );
}
