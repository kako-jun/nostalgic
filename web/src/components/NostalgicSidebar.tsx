import { useLocation, Link } from "react-router-dom";

interface NostalgicSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  currentPage?: string;
  visitedPages?: Set<string>;
  onPageChange?: (page: string) => void;
}

export default function NostalgicSidebar({
  isOpen = true,
  onClose,
  currentPage = "home",
  visitedPages = new Set(["home"]),
  onPageChange,
}: NostalgicSidebarProps) {
  const location = useLocation();
  const currentService = location.pathname.split("/")[1] || "";

  const handlePageClick = (page: string) => {
    if (onPageChange) {
      onPageChange(page);
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className={`nostalgic-sidebar-left ${isOpen ? "mobile-open" : ""}`}>
      <div
        className="nostalgic-mobile-menu-title"
        style={{
          fontSize: "20px",
          margin: "0 -10px 10px -10px",
          height: "67px",
          background: "rgb(204, 255, 204)",
          color: "black",
          fontWeight: "bold",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: "3px double #808080",
          cursor: "pointer",
        }}
        onClick={() => {
          window.location.href = "/";
        }}
      >
        MENU
      </div>
      <p>
        {location.pathname === "/" && currentPage === "home" ? (
          <>
            <span className="nostalgic-blink">●</span>
            <span className="nostalgic-nav-active">ホーム</span>
          </>
        ) : (
          <>
            <span>●</span>
            {location.pathname === "/" ? (
              <a
                href="#"
                className={
                  visitedPages.has("home") ? "nostalgic-old-link-visited" : "nostalgic-old-link"
                }
                onClick={(e) => {
                  e.preventDefault();
                  handlePageClick("home");
                }}
              >
                ホーム
              </a>
            ) : (
              <Link to="/" className="nostalgic-old-link" onClick={() => onClose?.()}>
                ホーム
              </Link>
            )}
          </>
        )}
        <br />
        <span>●</span>
        <Link
          to="/counter"
          className={
            currentService === "counter" ? "nostalgic-old-link-visited" : "nostalgic-old-link"
          }
          onClick={() => onClose?.()}
        >
          Nostalgic Counter
        </Link>
        <br />
        <>
          <span style={{ marginLeft: "1em" }}>├</span>
          {currentService === "counter" && location.pathname === "/counter" ? (
            <span className="nostalgic-nav-active">機能一覧</span>
          ) : (
            <Link to="/counter" className="nostalgic-old-link" onClick={() => onClose?.()}>
              機能一覧
            </Link>
          )}
          <br />
          <span style={{ marginLeft: "1em" }}>└</span>
          {currentService === "counter" && location.pathname === "/counter/usage" ? (
            <span className="nostalgic-nav-active">使い方</span>
          ) : (
            <Link to="/counter/usage" className="nostalgic-old-link" onClick={() => onClose?.()}>
              使い方
            </Link>
          )}
          <br />
        </>
        <span>●</span>
        <Link
          to="/like"
          className={
            currentService === "like" ? "nostalgic-old-link-visited" : "nostalgic-old-link"
          }
          onClick={() => onClose?.()}
        >
          Nostalgic Like
        </Link>
        <br />
        <>
          <span style={{ marginLeft: "1em" }}>├</span>
          {currentService === "like" && location.pathname === "/like" ? (
            <span className="nostalgic-nav-active">機能一覧</span>
          ) : (
            <Link to="/like" className="nostalgic-old-link" onClick={() => onClose?.()}>
              機能一覧
            </Link>
          )}
          <br />
          <span style={{ marginLeft: "1em" }}>└</span>
          {currentService === "like" && location.pathname === "/like/usage" ? (
            <span className="nostalgic-nav-active">使い方</span>
          ) : (
            <Link to="/like/usage" className="nostalgic-old-link" onClick={() => onClose?.()}>
              使い方
            </Link>
          )}
          <br />
        </>
        <span>●</span>
        <Link
          to="/ranking"
          className={
            currentService === "ranking" ? "nostalgic-old-link-visited" : "nostalgic-old-link"
          }
          onClick={() => onClose?.()}
        >
          Nostalgic Ranking
        </Link>
        <br />
        <>
          <span style={{ marginLeft: "1em" }}>├</span>
          {currentService === "ranking" && location.pathname === "/ranking" ? (
            <span className="nostalgic-nav-active">機能一覧</span>
          ) : (
            <Link to="/ranking" className="nostalgic-old-link" onClick={() => onClose?.()}>
              機能一覧
            </Link>
          )}
          <br />
          <span style={{ marginLeft: "1em" }}>└</span>
          {currentService === "ranking" && location.pathname === "/ranking/usage" ? (
            <span className="nostalgic-nav-active">使い方</span>
          ) : (
            <Link to="/ranking/usage" className="nostalgic-old-link" onClick={() => onClose?.()}>
              使い方
            </Link>
          )}
          <br />
        </>
        <span>●</span>
        <Link
          to="/bbs"
          className={currentService === "bbs" ? "nostalgic-old-link-visited" : "nostalgic-old-link"}
          onClick={() => onClose?.()}
        >
          Nostalgic BBS
        </Link>
        <br />
        <>
          <span style={{ marginLeft: "1em" }}>├</span>
          {currentService === "bbs" && location.pathname === "/bbs" ? (
            <span className="nostalgic-nav-active">機能一覧</span>
          ) : (
            <Link to="/bbs" className="nostalgic-old-link" onClick={() => onClose?.()}>
              機能一覧
            </Link>
          )}
          <br />
          <span style={{ marginLeft: "1em" }}>└</span>
          {currentService === "bbs" && location.pathname === "/bbs/usage" ? (
            <span className="nostalgic-nav-active">使い方</span>
          ) : (
            <Link to="/bbs/usage" className="nostalgic-old-link" onClick={() => onClose?.()}>
              使い方
            </Link>
          )}
          <br />
        </>
        {location.pathname === "/" && currentPage === "about" ? (
          <>
            <span className="nostalgic-blink">●</span>
            <span className="nostalgic-nav-active">このサイトについて</span>
          </>
        ) : (
          <>
            <span>●</span>
            {location.pathname === "/" ? (
              <a
                href="#"
                className={
                  visitedPages.has("about") ? "nostalgic-old-link-visited" : "nostalgic-old-link"
                }
                onClick={(e) => {
                  e.preventDefault();
                  handlePageClick("about");
                }}
              >
                このサイトについて
              </a>
            ) : (
              <Link to="/about" className="nostalgic-old-link" onClick={() => onClose?.()}>
                このサイトについて
              </Link>
            )}
          </>
        )}
      </p>
      <hr />
      <p>
        <b>◆リンク集◆</b>
      </p>
      <p>
        <span style={{ marginLeft: "0.5em" }}>●</span>
        <a
          href="https://mixi.social/@kako_jun"
          className="nostalgic-old-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          mixi2
        </a>
        <br />
        <span style={{ marginLeft: "0.5em" }}>●</span>
        <a
          href="https://github.com/kako-jun/nostalgic-counter"
          className="nostalgic-old-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        <br />
        <span style={{ marginLeft: "0.5em" }}>●</span>
        <a
          href="https://llll-ll.com/"
          className="nostalgic-old-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          llll-ll.com
        </a>
        <br />
        <span style={{ marginLeft: "1.5em" }}>(作者のサイト)</span>
        <br />
        <span style={{ marginLeft: "0.5em" }}>●</span>
        <a
          href="https://x.com/kako_jun_42"
          className="nostalgic-old-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          Twitter
        </a>
        <br />
        <span style={{ marginLeft: "0.5em" }}>●</span>
        <a
          href="https://www.instagram.com/kako_jun_42"
          className="nostalgic-old-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          Instagram
        </a>
        <br />
        <span style={{ marginLeft: "0.5em" }}>●</span>
        <a
          href="https://zenn.dev/kako_jun"
          className="nostalgic-old-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          Zenn
        </a>
        <br />
        <span style={{ marginLeft: "0.5em" }}>●</span>
        <a
          href="https://note.com/kako_jun"
          className="nostalgic-old-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          note
        </a>
      </p>
      <p style={{ fontSize: "14px", color: "#ff0000" }}>
        <b>相互リンク募集中です！</b>
      </p>
      <div style={{ marginTop: "10px" }}>
        <img src="/nostalgic-banner.webp" alt="Nostalgic" style={{ display: "block" }} />
      </div>
      <hr />
      <div className="nostalgic-update-box">
        <p style={{ margin: "5px 0", textAlign: "center" }}>
          <b style={{ color: "#008000" }}>◆更新履歴◆</b>
        </p>
        <p style={{ margin: "5px 0" }}>
          ・2025/08/07
          <span
            style={{ color: "red", border: "2px solid red", padding: "1px 2px", marginLeft: "5px" }}
          >
            NEW!
          </span>
          <br />
          <span style={{ marginLeft: "0.5em" }}>サービス開始！</span>
          <br />
          <span style={{ marginLeft: "0.5em" }}>（のび太の誕生日）</span>
        </p>
        <p style={{ margin: "5px 0" }}>
          ・2025/06/10
          <br />
          <span style={{ marginLeft: "0.5em" }}>アイデアが浮かぶ</span>
        </p>
      </div>
      <p style={{ textAlign: "center", fontSize: "14px" }}>
        Netscape Navigator 4.2<span style={{ textDecoration: "line-through" }}>対応</span>
      </p>
    </div>
  );
}
