import { useState } from 'react'
import NostalgicSidebar from '../components/NostalgicSidebar'

export default function CounterPage() {
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
          📊 Nostalgic Counter
        </div>
        <div className="nostalgic-section">
          <p>カウンターページ（準備中）</p>
        </div>
      </div>
    </div>
  )
}
