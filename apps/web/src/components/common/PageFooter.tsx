import { Link } from "react-router-dom";
import FooterDivider from "./FooterDivider";

interface PageFooterProps {
  servicePath: string; // e.g., "counter", "like", "ranking", "bbs"
  currentPage: "features" | "usage";
}

export default function PageFooter({ servicePath, currentPage }: PageFooterProps) {
  const featuresPath = `/${servicePath}`;
  const usagePath = `/${servicePath}/usage`;

  return (
    <>
      <FooterDivider />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "10px 0",
        }}
      >
        <div>
          {currentPage === "usage" && (
            <Link to={featuresPath} className="nostalgic-old-link">
              ← 機能一覧へ
            </Link>
          )}
        </div>
        <div>
          {currentPage === "features" && (
            <Link to={usagePath} className="nostalgic-old-link">
              使い方へ →
            </Link>
          )}
        </div>
      </div>

      <p style={{ textAlign: "center" }}>
        これ以上の詳しい説明は{" "}
        <a
          href="https://github.com/kako-jun/nostalgic/blob/main/README_ja.md"
          className="nostalgic-old-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          【GitHub】
        </a>{" "}
        へ
      </p>
    </>
  );
}
