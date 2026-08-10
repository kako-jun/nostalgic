import { Link } from "react-router-dom";

interface NostalgicSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  currentPage?: string;
  visitedPages?: Set<string>;
  onPageChange?: (page: string) => void;
}

export default function NostalgicSidebar({ isOpen = true, onClose }: NostalgicSidebarProps) {
  return (
    <aside className={`nostalgic-sidebar-left ${isOpen ? "mobile-open" : ""}`}>
      <div className="nostalgic-mobile-menu-title">GUESTBOOK</div>
      <p>
        <span className="nostalgic-blink">●</span>{" "}
        <Link to="/" onClick={onClose}>
          Guestbook
        </Link>
        <br />
        <span>●</span>{" "}
        <a href="https://benjiisworld.com/" onClick={onClose}>
          Back to benjii.home
        </a>
      </p>
      <p>
        <b>◆ Leave a message ◆</b>
        <br />
        Add your name, an optional website, and a note for Benjii.
      </p>
      <p className="nostalgic-update-box">
        <b>Guestbook powered by</b>
        <br />
        <a href="https://github.com/kako-jun/nostalgic" target="_blank" rel="noreferrer">
          Nostalgic
        </a>
      </p>
    </aside>
  );
}
