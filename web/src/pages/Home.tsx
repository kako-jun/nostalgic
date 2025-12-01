import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import NostalgicSidebar from '../components/NostalgicSidebar'

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState('home')
  const [visitedPages, setVisitedPages] = useState<Set<string>>(new Set(['home']))
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      const sidebar = document.querySelector('.nostalgic-sidebar-left')
      const menuButton = document.querySelector('.nostalgic-mobile-menu-button')

      if (isMobileSidebarOpen && sidebar && !sidebar.contains(target) && !menuButton?.contains(target)) {
        setIsMobileSidebarOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMobileSidebarOpen])

  const handlePageChange = (page: string) => {
    setCurrentPage(page)
    setVisitedPages((prev) => new Set([...prev, page]))
  }

  return (
    <>
      <div className="nostalgic-main-frame">
        <NostalgicSidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          currentPage={currentPage}
          visitedPages={visitedPages}
          onPageChange={handlePageChange}
        />

        <div className="nostalgic-content-area">
          <button
            className="nostalgic-mobile-menu-button"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            aria-label="メニューを開く"
          >
            ≡ MENU
          </button>

          <div className="nostalgic-title-bar">
            ★☆★ Nostalgic ★☆★
            <br />
            懐かしいWebツール集
          </div>

          <div className="nostalgic-marquee-box">
            <div className="nostalgic-marquee-text">
              ようこそ！Nostalgicへ！昔懐かしいWebツール（カウンター・いいね・ランキング・BBS）を無料で提供しています！
            </div>
          </div>

          <div className="nostalgic-section">
            <p>
              <span className="nostalgic-section-title">
                <b>◆Nostalgicとは？◆</b>
              </span>
            </p>
            <p>昔のホームページによくあった懐かしいWebツール群を最新技術で復活させたサービスです。</p>
            <p>
              <span>●</span> 完全無料で利用可能
              <br />
              <span>●</span> 4つのサービス（Counter・Like・Ranking・BBS）
              <br />
              <span>●</span> 最新技術で高速・安定動作
            </p>
            <p>オープンソースプロジェクトです。こういうのがほしかった！と思った方は、ネタで設置してみてください。</p>

            <div style={{ textAlign: 'center', margin: '20px 0' }}>
              <p style={{ marginBottom: '10px', fontWeight: 'bold' }}>【サービス一覧】</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link
                    to="/counter"
                    className="nostalgic-old-link"
                    style={{ padding: '5px 10px', border: '1px solid #666', backgroundColor: '#f0f0f0' }}
                  >
                    📊 Nostalgic Counter
                  </Link>
                  <Link
                    to="/like"
                    className="nostalgic-old-link"
                    style={{ padding: '5px 10px', border: '1px solid #666', backgroundColor: '#f0f0f0' }}
                  >
                    💖 Nostalgic Like
                  </Link>
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link
                    to="/ranking"
                    className="nostalgic-old-link"
                    style={{ padding: '5px 10px', border: '1px solid #666', backgroundColor: '#f0f0f0' }}
                  >
                    🏆 Nostalgic Ranking
                  </Link>
                  <Link
                    to="/bbs"
                    className="nostalgic-old-link"
                    style={{ padding: '5px 10px', border: '1px solid #666', backgroundColor: '#f0f0f0' }}
                  >
                    💬 Nostalgic BBS
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="nostalgic-section">
            <p>
              <span className="nostalgic-section-title">
                <b>◆カウンターのサンプル◆</b>
              </span>
            </p>
            <div className="nostalgic-counter-section">
              <p style={{ textAlign: 'center' }}>（Web Componentsで表示）</p>
            </div>
          </div>

          <hr />
          <p style={{ textAlign: 'center', fontSize: '14px' }}>
            Copyright &copy; 2025 kako-jun. All rights reserved.
          </p>
        </div>
      </div>
    </>
  )
}
