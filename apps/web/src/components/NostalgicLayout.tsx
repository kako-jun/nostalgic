import { useState, useEffect } from "react";
import NostalgicSidebar from "./NostalgicSidebar";

interface NostalgicLayoutProps {
  children: React.ReactNode;
  serviceName?: string;
  serviceIcon?: string;
}

export default function NostalgicLayout({ children }: NostalgicLayoutProps) {
  const [currentPage, setCurrentPage] = useState(() => {
    const hash = window.location.hash.slice(1);
    return hash || "main";
  });
  const [visitedPages, setVisitedPages] = useState<Set<string>>(() => {
    const hash = window.location.hash.slice(1);
    return new Set(hash ? ["main", hash] : ["main"]);
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash) {
        setCurrentPage(hash);
        setVisitedPages((prev) => new Set([...prev, hash]));
      } else {
        setCurrentPage("main");
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      const sidebar = document.querySelector(".nostalgic-sidebar-left");
      const menuButton = document.querySelector(".nostalgic-mobile-menu-button");

      if (
        isMobileSidebarOpen &&
        sidebar &&
        !sidebar.contains(target) &&
        !menuButton?.contains(target)
      ) {
        setIsMobileSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileSidebarOpen]);

  return (
    <>
      <div className="nostalgic-main-frame">
        <button
          className="nostalgic-mobile-menu-button"
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          aria-label="メニューを開く"
        >
          ☰
        </button>

        {isMobileSidebarOpen && (
          <div className="nostalgic-mobile-overlay" onClick={() => setIsMobileSidebarOpen(false)} />
        )}

        <NostalgicSidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          currentPage={currentPage}
          visitedPages={visitedPages}
          onPageChange={(page) => {
            setCurrentPage(page);
            setVisitedPages((prev) => new Set([...prev, page]));
          }}
        />

        <div className="nostalgic-content-area">{children}</div>

        <div
          style={{
            position: "fixed",
            bottom: "10px",
            right: "20px",
            fontSize: "12px",
            color: "#666666",
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            padding: "5px 8px",
            fontStyle: "italic",
            borderRadius: "4px",
          }}
        >
          1997年風のデザインを再現しています
        </div>
      </div>
    </>
  );
}
