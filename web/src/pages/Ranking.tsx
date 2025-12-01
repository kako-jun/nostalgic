import { useState } from 'react'
import NostalgicSidebar from '../components/NostalgicSidebar'

export default function RankingPage() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  return (
    <div className="nostalgic-main-frame">
      <NostalgicSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        currentPage="features"
      />
      <div className="nostalgic-content-area">
        <button
          className="nostalgic-mobile-menu-button"
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        >
          ≡ MENU
        </button>
        <div className="nostalgic-title-bar">
          🏆 Nostalgic Ranking
        </div>
        <div className="nostalgic-section">
          <p>ランキングページ（準備中）</p>
        </div>
      </div>
    </div>
  )
}
