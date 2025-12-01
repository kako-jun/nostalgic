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
      <NostalgicButton onClick={handleCopy} color="#c0c0c0">
        {copied ? "コピー済み" : "コピー"}
      </NostalgicButton>
    </div>
  );
}
