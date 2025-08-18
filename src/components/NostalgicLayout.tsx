"use client";

import { useState, useEffect } from "react";
import Script from "next/script";
import { usePathname } from 'next/navigation';
import "../app/nostalgic.css";

interface NostalgicLayoutProps {
  children: React.ReactNode;
  serviceName: string;
  serviceIcon: string;
}

export default function NostalgicLayout({ children, serviceName, serviceIcon }: NostalgicLayoutProps) {
  const pathname = usePathname();
  const [currentPage, setCurrentPage] = useState("main");
  const [visitedPages, setVisitedPages] = useState<Set<string>>(new Set(["main"]));
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      setCurrentPage(hash);
      setVisitedPages(prev => new Set([...prev, hash]));
    } else {
      setCurrentPage("main");
    }
    
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash) {
        setCurrentPage(hash);
        setVisitedPages(prev => new Set([...prev, hash]));
      } else {
        setCurrentPage("main");
      }
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      const sidebar = document.querySelector('.nostalgic-sidebar-left');
      const menuButton = document.querySelector('.nostalgic-mobile-menu-button');
      
      if (isMobileSidebarOpen && sidebar && !sidebar.contains(target) && !menuButton?.contains(target)) {
        setIsMobileSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileSidebarOpen]);

  const getServicePath = () => {
    return pathname.split('/')[1] || '';
  };

  const currentService = getServicePath();

  return (
    <>
      <Script src="https://nostalgic.llll-ll.com/components/display.js" strategy="beforeInteractive" />
      <div className="nostalgic-main-frame">
        <button 
          className="nostalgic-mobile-menu-button"
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          aria-label="メニューを開く"
        >
          ☰
        </button>
        
        {isMobileSidebarOpen && <div className="nostalgic-mobile-overlay" onClick={() => setIsMobileSidebarOpen(false)} />}
        
        <div className={`nostalgic-sidebar-left ${isMobileSidebarOpen ? 'mobile-open' : ''}`}>
          <div className="nostalgic-title-bar" style={{ fontSize: "16px !important" }}>MENU</div>
          <p>
            <span>●</span>
            <a href="/" className="nostalgic-old-link" onClick={() => setIsMobileSidebarOpen(false)}>
              ホーム
            </a>
            <br />
            <span>●</span>
            <a href="/counter" className={currentService === 'counter' ? "nostalgic-old-link-visited" : "nostalgic-old-link"} onClick={() => setIsMobileSidebarOpen(false)}>
              📊 Nostalgic Counter
            </a>
            <br />
            {currentService === 'counter' && (
              <>
                <span style={{ marginLeft: "1em" }}>├ </span>
                {currentPage === "main" ? (
                  <span className="nostalgic-nav-active">トップ</span>
                ) : (
                  <a href="/counter" className="nostalgic-old-link" onClick={() => setIsMobileSidebarOpen(false)}>トップ</a>
                )}
                <br />
                <span style={{ marginLeft: "1em" }}>├ </span>
                {currentPage === "usage" ? (
                  <span className="nostalgic-nav-active">使い方</span>
                ) : (
                  <a href="/counter#usage" className="nostalgic-old-link" onClick={() => setIsMobileSidebarOpen(false)}>使い方</a>
                )}
                <br />
                <span style={{ marginLeft: "1em" }}>├ </span>
                {currentPage === "features" ? (
                  <span className="nostalgic-nav-active">機能一覧</span>
                ) : (
                  <a href="/counter#features" className="nostalgic-old-link" onClick={() => setIsMobileSidebarOpen(false)}>機能一覧</a>
                )}
                <br />
                <span style={{ marginLeft: "1em" }}>└ </span>
                {currentPage === "api" ? (
                  <span className="nostalgic-nav-active">API仕様</span>
                ) : (
                  <a href="/counter#api" className="nostalgic-old-link" onClick={() => setIsMobileSidebarOpen(false)}>API仕様</a>
                )}
                <br />
              </>
            )}
            <span>●</span>
            <a href="/like" className={currentService === 'like' ? "nostalgic-old-link-visited" : "nostalgic-old-link"} onClick={() => setIsMobileSidebarOpen(false)}>
              💖 Nostalgic Like
            </a>
            <br />
            {currentService === 'like' && (
              <>
                <span style={{ marginLeft: "1em" }}>├ </span>
                {currentPage === "main" ? (
                  <span className="nostalgic-nav-active">トップ</span>
                ) : (
                  <a href="/like" className="nostalgic-old-link" onClick={() => setIsMobileSidebarOpen(false)}>トップ</a>
                )}
                <br />
                <span style={{ marginLeft: "1em" }}>├ </span>
                {currentPage === "usage" ? (
                  <span className="nostalgic-nav-active">使い方</span>
                ) : (
                  <a href="/like#usage" className="nostalgic-old-link" onClick={() => setIsMobileSidebarOpen(false)}>使い方</a>
                )}
                <br />
                <span style={{ marginLeft: "1em" }}>├ </span>
                {currentPage === "features" ? (
                  <span className="nostalgic-nav-active">機能一覧</span>
                ) : (
                  <a href="/like#features" className="nostalgic-old-link" onClick={() => setIsMobileSidebarOpen(false)}>機能一覧</a>
                )}
                <br />
                <span style={{ marginLeft: "1em" }}>└ </span>
                {currentPage === "api" ? (
                  <span className="nostalgic-nav-active">API仕様</span>
                ) : (
                  <a href="/like#api" className="nostalgic-old-link" onClick={() => setIsMobileSidebarOpen(false)}>API仕様</a>
                )}
                <br />
              </>
            )}
            <span>●</span>
            <a href="/ranking" className={currentService === 'ranking' ? "nostalgic-old-link-visited" : "nostalgic-old-link"} onClick={() => setIsMobileSidebarOpen(false)}>
              🏆 Nostalgic Ranking
            </a>
            <br />
            {currentService === 'ranking' && (
              <>
                <span style={{ marginLeft: "1em" }}>├ </span>
                {currentPage === "main" ? (
                  <span className="nostalgic-nav-active">トップ</span>
                ) : (
                  <a href="/ranking" className="nostalgic-old-link" onClick={() => setIsMobileSidebarOpen(false)}>トップ</a>
                )}
                <br />
                <span style={{ marginLeft: "1em" }}>├ </span>
                {currentPage === "usage" ? (
                  <span className="nostalgic-nav-active">使い方</span>
                ) : (
                  <a href="/ranking#usage" className="nostalgic-old-link" onClick={() => setIsMobileSidebarOpen(false)}>使い方</a>
                )}
                <br />
                <span style={{ marginLeft: "1em" }}>├ </span>
                {currentPage === "features" ? (
                  <span className="nostalgic-nav-active">機能一覧</span>
                ) : (
                  <a href="/ranking#features" className="nostalgic-old-link" onClick={() => setIsMobileSidebarOpen(false)}>機能一覧</a>
                )}
                <br />
                <span style={{ marginLeft: "1em" }}>└ </span>
                {currentPage === "api" ? (
                  <span className="nostalgic-nav-active">API仕様</span>
                ) : (
                  <a href="/ranking#api" className="nostalgic-old-link" onClick={() => setIsMobileSidebarOpen(false)}>API仕様</a>
                )}
                <br />
              </>
            )}
            <span>●</span>
            <a href="/bbs" className={currentService === 'bbs' ? "nostalgic-old-link-visited" : "nostalgic-old-link"} onClick={() => setIsMobileSidebarOpen(false)}>
              💬 Nostalgic BBS
            </a>
            <br />
            {currentService === 'bbs' && (
              <>
                <span style={{ marginLeft: "1em" }}>├ </span>
                {currentPage === "main" ? (
                  <span className="nostalgic-nav-active">トップ</span>
                ) : (
                  <a href="/bbs" className="nostalgic-old-link" onClick={() => setIsMobileSidebarOpen(false)}>トップ</a>
                )}
                <br />
                <span style={{ marginLeft: "1em" }}>├ </span>
                {currentPage === "usage" ? (
                  <span className="nostalgic-nav-active">使い方</span>
                ) : (
                  <a href="/bbs#usage" className="nostalgic-old-link" onClick={() => setIsMobileSidebarOpen(false)}>使い方</a>
                )}
                <br />
                <span style={{ marginLeft: "1em" }}>├ </span>
                {currentPage === "features" ? (
                  <span className="nostalgic-nav-active">機能一覧</span>
                ) : (
                  <a href="/bbs#features" className="nostalgic-old-link" onClick={() => setIsMobileSidebarOpen(false)}>機能一覧</a>
                )}
                <br />
                <span style={{ marginLeft: "1em" }}>└ </span>
                {currentPage === "api" ? (
                  <span className="nostalgic-nav-active">API仕様</span>
                ) : (
                  <a href="/bbs#api" className="nostalgic-old-link" onClick={() => setIsMobileSidebarOpen(false)}>API仕様</a>
                )}
                <br />
              </>
            )}
            <span>●</span>
            <a href="/#about" className="nostalgic-old-link" onClick={() => setIsMobileSidebarOpen(false)}>
              このサイトについて
            </a>
          </p>
          <hr />
          <p>
            <b>◆リンク集◆</b>
          </p>
          <p>
            <span>●</span>
            <a
              href="https://mixi.social/@kako_jun"
              className="nostalgic-old-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              mixi2
            </a>
            <br />
            <span>●</span>
            <a
              href="https://github.com/kako-jun/nostalgic-counter"
              className="nostalgic-old-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <br />
            <span>●</span>
            <a href="https://llll-ll.com/" className="nostalgic-old-link" target="_blank" rel="noopener noreferrer">
              llll-ll.com
            </a>
            <br />
            <span style={{ marginLeft: "1em" }}>(作者のサイト)</span>
            <br />
            <span>●</span>
            <a href="https://x.com/kako_jun_42" className="nostalgic-old-link" target="_blank" rel="noopener noreferrer">
              Twitter
            </a>
            <br />
            <span>●</span>
            <a
              href="https://www.instagram.com/kako_jun_42"
              className="nostalgic-old-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram
            </a>
            <br />
            <span>●</span>
            <a href="https://zenn.dev/kako_jun" className="nostalgic-old-link" target="_blank" rel="noopener noreferrer">
              Zenn
            </a>
            <br />
            <span>●</span>
            <a href="https://note.com/kako_jun" className="nostalgic-old-link" target="_blank" rel="noopener noreferrer">
              note
            </a>
          </p>
          <p style={{ fontSize: "14px", color: "#ff0000" }}>
            <b>相互リンク募集中です！</b>
          </p>
          <div style={{ marginTop: "10px" }}>
            <img src="/nostalgic-counter-banner.webp" alt="Nostalgic Counter - 無料アクセスカウンター" style={{ display: "block" }} />
          </div>
          <hr />
          <div className="nostalgic-update-box">
            <p style={{ margin: "5px 0", textAlign: "center" }}>
              <b style={{ color: "#008000" }}>◆更新履歴◆</b>
            </p>
            <p style={{ margin: "5px 0" }}>
              <span style={{ color: "red" }}>NEW!</span>
              <br />
              ・2025/08/07
              <br />
              サービス開始！
              <br />
              （のび太の誕生日）
            </p>
            <p style={{ margin: "5px 0" }}>
              ・2025/06/10
              <br />
              アイデアが浮かぶ
            </p>
          </div>
          <p style={{ textAlign: "center", fontSize: "14px" }}>
            Netscape Navigator 4.2<span style={{ textDecoration: "line-through" }}>対応</span>
          </p>
        </div>

        <div className="nostalgic-content-area">
          {children}
        </div>

        <div
          style={{
            position: "fixed",
            bottom: "10px",
            right: "10px",
            fontSize: "12px",
            color: "#666666",
            backgroundColor: "transparent",
            padding: "5px 8px",
            fontStyle: "italic",
          }}
        >
          1997年風のデザインを再現しています
        </div>
      </div>
    </>
  );
}