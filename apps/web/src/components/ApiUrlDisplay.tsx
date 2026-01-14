import React from "react";
import NostalgicButton from "./NostalgicButton";

interface ApiUrlDisplayProps {
  url: string;
  children: React.ReactNode;
}

// ヘルパー関数：パラメータを緑色でハイライト
export const GreenParam = ({ children }: { children: React.ReactNode }) => (
  <span style={{ color: "#008000" }}>{children}</span>
);

// 文字列内の「公開ID」を緑色のspanに置き換えるヘルパー関数
export function highlightPublicId(text: string): React.ReactNode {
  const parts = text.split(/(公開ID)/);
  return parts.map((part, i) =>
    part === "公開ID" ? <GreenParam key={i}>公開ID</GreenParam> : part
  );
}

export default function ApiUrlDisplay({ url, children }: ApiUrlDisplayProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, 1500);
      })
      .catch(() => {
        alert("クリップボードへのコピーに失敗しました");
      });
  };

  return (
    <div
      style={{
        backgroundColor: "#f0f0f0",
        padding: "10px",
        fontFamily: "monospace",
        fontSize: "14px",
        wordBreak: "break-all",
      }}
    >
      <div style={{ marginBottom: "8px" }}>{children}</div>
      <NostalgicButton onClick={handleCopy} variant="secondary">
        {copied ? "コピー済み" : "コピー"}
      </NostalgicButton>
    </div>
  );
}
