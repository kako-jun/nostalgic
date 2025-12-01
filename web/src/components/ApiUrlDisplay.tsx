import React from "react";

interface ApiUrlDisplayProps {
  url: string;
  children: React.ReactNode;
}

// ヘルパー関数：パラメータを緑色でハイライト
export const GreenParam = ({ children }: { children: React.ReactNode }) => (
  <span style={{ color: "#008000" }}>{children}</span>
);

export default function ApiUrlDisplay({ url, children }: ApiUrlDisplayProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(url).then(() => {
      const btn = document.activeElement as HTMLButtonElement;
      if (btn) {
        const originalText = btn.textContent;
        btn.textContent = "コピー済み";
        setTimeout(() => { btn.textContent = originalText; }, 1500);
      }
    }).catch(() => {
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
      <div style={{ marginBottom: "8px" }}>
        {children}
      </div>
      <button
        type="button"
        onClick={handleCopy}
        style={{
          padding: "4px 12px",
          backgroundColor: "#c0c0c0",
          color: "#000000",
          border: "2px outset #c0c0c0",
          fontSize: "14px",
          fontWeight: "bold",
          cursor: "pointer",
          fontFamily: "inherit"
        }}
      >
        コピー
      </button>
    </div>
  );
}
