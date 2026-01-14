import { useState, useEffect } from "react";

import NostalgicSidebar from "../components/NostalgicSidebar";
import { FooterDivider } from "../components/common";

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState("home");
  const [visitedPages, setVisitedPages] = useState<Set<string>>(new Set(["home"]));
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [, setVotingResults] = useState<{ name: string; score: number }[]>([]);
  const [votingMessage, setVotingMessage] = useState("");

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

  const loadVotingResults = async () => {
    try {
      const rankingId = "nostalgic-5e577b5b";
      const response = await fetch(
        `https://api.nostalgic.llll-ll.com/ranking?action=get&id=${rankingId}&limit=4`
      );
      if (response.ok) {
        const data = await response.json();
        setVotingResults(data.data?.entries || []);
      }
    } catch (_error) {
      // エラーは無視
    }
  };

  useEffect(() => {
    // 初期ランキングデータを読み込み
    loadVotingResults();
  }, []);

  const voteForService = async (serviceName: string) => {
    try {
      const rankingId = "nostalgic-5e577b5b";

      // 現在の票数を取得
      const getCurrentResponse = await fetch(
        `https://api.nostalgic.llll-ll.com/ranking?action=get&id=${rankingId}`
      );
      let currentScore = 1;

      if (getCurrentResponse.ok) {
        const currentData = await getCurrentResponse.json();
        const currentEntry = currentData.data?.entries?.find(
          (entry: { name: string; score: number }) => entry.name === serviceName
        );
        if (currentEntry) {
          currentScore = currentEntry.score + 1;
        }
      }

      // 投票を送信
      const voteResponse = await fetch(
        `https://api.nostalgic.llll-ll.com/ranking?action=submit&id=${rankingId}&name=${encodeURIComponent(serviceName)}&score=${currentScore}`
      );

      if (voteResponse.ok) {
        setVotingMessage(`${serviceName}に投票しました！ありがとうございます 🎉`);
        setTimeout(() => setVotingMessage(""), 3000);

        // WebComponentsを再読み込み
        const rankingComponents = document.querySelectorAll("nostalgic-ranking");
        rankingComponents.forEach((component) => {
          const el = component as HTMLElement & { loadRankingData?: () => void };
          if (el.loadRankingData) {
            el.loadRankingData();
          }
        });
      } else {
        setVotingMessage("投票に失敗しました。もう一度お試しください。");
      }
    } catch (_error) {
      setVotingMessage("エラーが発生しました。");
    }
  };

  const renderContent = () => {
    switch (currentPage) {
      case "home":
        return (
          <>
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
              <p>
                昔のホームページによくあった懐かしいWebツール群を最新技術で復活させたサービスです。
              </p>
              <p>
                <span>●</span> 完全無料で利用可能
                <br />
                <span>●</span> 4つのサービス（Counter・Like・Ranking・BBS）
                <br />
                <span>●</span> 最新技術で高速・安定動作
              </p>
              <p>
                オープンソースプロジェクトです。こういうのがほしかった！と思った方は、ネタで設置してみてください。
              </p>

              <div style={{ textAlign: "center", margin: "20px 0" }}>
                <p style={{ marginBottom: "10px", fontWeight: "bold" }}>【サービス一覧】</p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      justifyContent: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <a
                      href="/counter"
                      className="nostalgic-old-link"
                      style={{
                        padding: "5px 10px",
                        border: "1px solid #666",
                        backgroundColor: "#f0f0f0",
                      }}
                    >
                      📊 Nostalgic Counter
                    </a>
                    <a
                      href="/like"
                      className="nostalgic-old-link"
                      style={{
                        padding: "5px 10px",
                        border: "1px solid #666",
                        backgroundColor: "#f0f0f0",
                      }}
                    >
                      💖 Nostalgic Like
                    </a>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      justifyContent: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <a
                      href="/ranking"
                      className="nostalgic-old-link"
                      style={{
                        padding: "5px 10px",
                        border: "1px solid #666",
                        backgroundColor: "#f0f0f0",
                      }}
                    >
                      🏆 Nostalgic Ranking
                    </a>
                    <a
                      href="/bbs"
                      className="nostalgic-old-link"
                      style={{
                        padding: "5px 10px",
                        border: "1px solid #666",
                        backgroundColor: "#f0f0f0",
                      }}
                    >
                      💬 Nostalgic BBS
                    </a>
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
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                  <p
                    style={{
                      fontSize: "20px",
                      fontWeight: "bold",
                      textAlign: "center",
                      margin: "0",
                    }}
                  >
                    ようこそ！
                    <br />
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "4px",
                      }}
                    >
                      <nostalgic-counter
                        id="nostalgic-b89803bb"
                        type="total"
                        theme="light"
                        format="image"
                      />
                      回も閲覧されました！
                    </span>
                  </p>
                </div>
                <div className="nostalgic-counter-item">
                  <b>今日</b>
                  <br />
                  <div style={{ marginTop: "10px" }}>
                    <nostalgic-counter
                      id="nostalgic-b89803bb"
                      type="today"
                      theme="dark"
                      digits="3"
                      format="image"
                    />
                  </div>
                </div>
                <div className="nostalgic-counter-item">
                  <b>昨日</b>
                  <br />
                  <div style={{ marginTop: "10px" }}>
                    <nostalgic-counter
                      id="nostalgic-b89803bb"
                      type="yesterday"
                      theme="dark"
                      digits="3"
                      format="image"
                    />
                  </div>
                </div>
                <div className="nostalgic-counter-item">
                  <b>今週</b>
                  <br />
                  <div style={{ marginTop: "10px" }}>
                    <nostalgic-counter
                      id="nostalgic-b89803bb"
                      type="week"
                      theme="retro"
                      digits="4"
                      format="image"
                    />
                  </div>
                </div>
                <div className="nostalgic-counter-item">
                  <b>今月</b>
                  <br />
                  <div style={{ marginTop: "10px" }}>
                    <nostalgic-counter
                      id="nostalgic-b89803bb"
                      type="month"
                      theme="retro"
                      digits="4"
                      format="image"
                    />
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "20px",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  marginTop: "20px",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "14px", marginBottom: "15px", fontWeight: "bold" }}>
                    Kawaii
                  </p>
                  <nostalgic-counter
                    id="nostalgic-b89803bb"
                    type="total"
                    theme="kawaii"
                    digits="5"
                    format="image"
                  />
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "14px", marginBottom: "15px", fontWeight: "bold" }}>
                    Mother味
                  </p>
                  <nostalgic-counter
                    id="nostalgic-b89803bb"
                    type="total"
                    theme="mom"
                    digits="5"
                    format="image"
                  />
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "14px", marginBottom: "15px", fontWeight: "bold" }}>FF味</p>
                  <nostalgic-counter
                    id="nostalgic-b89803bb"
                    type="total"
                    theme="final"
                    digits="5"
                    format="image"
                  />
                </div>
              </div>

              <div style={{ textAlign: "center", marginTop: "25px" }}>
                <p style={{ marginBottom: "15px", fontWeight: "bold" }}>【プレーンテキスト形式】</p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    alignItems: "center",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>総アクセス数:</span>
                    <nostalgic-counter id="nostalgic-b89803bb" type="total" format="text" />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>今日:</span>
                    <nostalgic-counter id="nostalgic-b89803bb" type="today" format="text" />
                  </div>
                </div>
              </div>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆いいねボタンのサンプル◆</b>
                </span>
              </p>
              <div style={{ textAlign: "center", margin: "20px 0" }}>
                <p style={{ marginBottom: "10px" }}>
                  このサイトが気に入ったら、いいねを押してください！
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                    alignItems: "center",
                  }}
                >
                  {/* Light Theme - 4 icons in a row */}
                  <div>
                    <p
                      style={{
                        fontSize: "14px",
                        marginBottom: "15px",
                        fontWeight: "bold",
                        textAlign: "center",
                      }}
                    >
                      Light{" "}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        gap: "15px",
                        justifyContent: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: "12px", marginBottom: "10px" }}>Heart</p>
                        <div
                          style={{
                            padding: "10px",
                            borderRadius: "4px",
                            minHeight: "40px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <nostalgic-like id="nostalgic-b89803bb" theme="light" icon="heart" />
                        </div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: "12px", marginBottom: "10px" }}>Star</p>
                        <div
                          style={{
                            padding: "10px",
                            borderRadius: "4px",
                            minHeight: "40px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <nostalgic-like id="nostalgic-b89803bb" theme="light" icon="star" />
                        </div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: "12px", marginBottom: "10px" }}>Thumb</p>
                        <div
                          style={{
                            padding: "10px",
                            borderRadius: "4px",
                            minHeight: "40px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <nostalgic-like id="nostalgic-b89803bb" theme="light" icon="thumb" />
                        </div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: "12px", marginBottom: "10px" }}>Peta</p>
                        <div
                          style={{
                            padding: "10px",
                            borderRadius: "4px",
                            minHeight: "40px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <nostalgic-like id="nostalgic-b89803bb" theme="light" icon="peta" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dark Theme - 4 icons in a row */}
                  <div>
                    <p
                      style={{
                        fontSize: "14px",
                        marginBottom: "15px",
                        fontWeight: "bold",
                        textAlign: "center",
                      }}
                    >
                      Dark{" "}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        gap: "15px",
                        justifyContent: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: "12px", marginBottom: "10px" }}>Heart</p>
                        <div
                          style={{
                            background:
                              "radial-gradient(ellipse, #666666 60%, rgba(102, 102, 102, 0.3) 100%)",
                            padding: "10px",
                            minHeight: "40px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <nostalgic-like id="nostalgic-b89803bb" theme="dark" icon="heart" />
                        </div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: "12px", marginBottom: "10px" }}>Star</p>
                        <div
                          style={{
                            background:
                              "radial-gradient(ellipse, #666666 60%, rgba(102, 102, 102, 0.3) 100%)",
                            padding: "10px",
                            minHeight: "40px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <nostalgic-like id="nostalgic-b89803bb" theme="dark" icon="star" />
                        </div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: "12px", marginBottom: "10px" }}>Thumb</p>
                        <div
                          style={{
                            background:
                              "radial-gradient(ellipse, #666666 60%, rgba(102, 102, 102, 0.3) 100%)",
                            padding: "10px",
                            minHeight: "40px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <nostalgic-like id="nostalgic-b89803bb" theme="dark" icon="thumb" />
                        </div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: "12px", marginBottom: "10px" }}>Peta</p>
                        <div
                          style={{
                            background:
                              "radial-gradient(ellipse, #666666 60%, rgba(102, 102, 102, 0.3) 100%)",
                            padding: "10px",
                            minHeight: "40px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <nostalgic-like id="nostalgic-b89803bb" theme="dark" icon="peta" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Retro Theme - 4 icons in a row */}
                  <div>
                    <p
                      style={{
                        fontSize: "14px",
                        marginBottom: "15px",
                        fontWeight: "bold",
                        textAlign: "center",
                      }}
                    >
                      Retro{" "}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        gap: "15px",
                        justifyContent: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: "12px", marginBottom: "10px" }}>Heart</p>
                        <div
                          style={{
                            background:
                              "radial-gradient(ellipse, #666666 60%, rgba(102, 102, 102, 0.3) 100%)",
                            padding: "10px",
                            minHeight: "40px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <nostalgic-like id="nostalgic-b89803bb" theme="retro" icon="heart" />
                        </div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: "12px", marginBottom: "10px" }}>Star</p>
                        <div
                          style={{
                            background:
                              "radial-gradient(ellipse, #666666 60%, rgba(102, 102, 102, 0.3) 100%)",
                            padding: "10px",
                            minHeight: "40px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <nostalgic-like id="nostalgic-b89803bb" theme="retro" icon="star" />
                        </div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: "12px", marginBottom: "10px" }}>Thumb</p>
                        <div
                          style={{
                            background:
                              "radial-gradient(ellipse, #666666 60%, rgba(102, 102, 102, 0.3) 100%)",
                            padding: "10px",
                            minHeight: "40px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <nostalgic-like id="nostalgic-b89803bb" theme="retro" icon="thumb" />
                        </div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: "12px", marginBottom: "10px" }}>Peta</p>
                        <div
                          style={{
                            background:
                              "radial-gradient(ellipse, #666666 60%, rgba(102, 102, 102, 0.3) 100%)",
                            padding: "10px",
                            minHeight: "40px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <nostalgic-like id="nostalgic-b89803bb" theme="retro" icon="peta" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Kawaii Theme - 4 icons in a row */}
                  <div>
                    <p
                      style={{
                        fontSize: "14px",
                        marginBottom: "15px",
                        fontWeight: "bold",
                        textAlign: "center",
                      }}
                    >
                      Kawaii{" "}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        gap: "15px",
                        justifyContent: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: "12px", marginBottom: "10px" }}>Heart</p>
                        <div
                          style={{
                            padding: "10px",
                            borderRadius: "4px",
                            minHeight: "40px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <nostalgic-like id="nostalgic-b89803bb" theme="kawaii" icon="heart" />
                        </div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: "12px", marginBottom: "10px" }}>Star</p>
                        <div
                          style={{
                            padding: "10px",
                            borderRadius: "4px",
                            minHeight: "40px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <nostalgic-like id="nostalgic-b89803bb" theme="kawaii" icon="star" />
                        </div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: "12px", marginBottom: "10px" }}>Thumb</p>
                        <div
                          style={{
                            padding: "10px",
                            borderRadius: "4px",
                            minHeight: "40px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <nostalgic-like id="nostalgic-b89803bb" theme="kawaii" icon="thumb" />
                        </div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: "12px", marginBottom: "10px" }}>Peta</p>
                        <div
                          style={{
                            padding: "10px",
                            borderRadius: "4px",
                            minHeight: "40px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <nostalgic-like id="nostalgic-b89803bb" theme="kawaii" icon="peta" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mother Theme - 4 icons in a row */}
                  <div>
                    <p
                      style={{
                        fontSize: "14px",
                        marginBottom: "15px",
                        fontWeight: "bold",
                        textAlign: "center",
                      }}
                    >
                      Mother味
                    </p>
                    <div
                      style={{
                        display: "flex",
                        gap: "15px",
                        justifyContent: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: "12px", marginBottom: "10px" }}>Heart</p>
                        <div
                          style={{
                            padding: "10px",
                            borderRadius: "4px",
                            minHeight: "40px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <nostalgic-like id="nostalgic-b89803bb" theme="mom" icon="heart" />
                        </div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: "12px", marginBottom: "10px" }}>Star</p>
                        <div
                          style={{
                            padding: "10px",
                            borderRadius: "4px",
                            minHeight: "40px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <nostalgic-like id="nostalgic-b89803bb" theme="mom" icon="star" />
                        </div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: "12px", marginBottom: "10px" }}>Thumb</p>
                        <div
                          style={{
                            padding: "10px",
                            borderRadius: "4px",
                            minHeight: "40px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <nostalgic-like id="nostalgic-b89803bb" theme="mom" icon="thumb" />
                        </div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: "12px", marginBottom: "10px" }}>Peta</p>
                        <div
                          style={{
                            padding: "10px",
                            borderRadius: "4px",
                            minHeight: "40px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <nostalgic-like id="nostalgic-b89803bb" theme="mom" icon="peta" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Final Theme - 4 icons in a row */}
                  <div>
                    <p
                      style={{
                        fontSize: "14px",
                        marginBottom: "15px",
                        fontWeight: "bold",
                        textAlign: "center",
                      }}
                    >
                      FF味
                    </p>
                    <div
                      style={{
                        display: "flex",
                        gap: "15px",
                        justifyContent: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: "12px", marginBottom: "10px" }}>Heart</p>
                        <div
                          style={{
                            background:
                              "radial-gradient(ellipse, #666666 60%, rgba(102, 102, 102, 0.3) 100%)",
                            padding: "10px",
                            minHeight: "40px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <nostalgic-like id="nostalgic-b89803bb" theme="final" icon="heart" />
                        </div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: "12px", marginBottom: "10px" }}>Star</p>
                        <div
                          style={{
                            background:
                              "radial-gradient(ellipse, #666666 60%, rgba(102, 102, 102, 0.3) 100%)",
                            padding: "10px",
                            minHeight: "40px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <nostalgic-like id="nostalgic-b89803bb" theme="final" icon="star" />
                        </div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: "12px", marginBottom: "10px" }}>Thumb</p>
                        <div
                          style={{
                            background:
                              "radial-gradient(ellipse, #666666 60%, rgba(102, 102, 102, 0.3) 100%)",
                            padding: "10px",
                            minHeight: "40px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <nostalgic-like id="nostalgic-b89803bb" theme="final" icon="thumb" />
                        </div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: "12px", marginBottom: "10px" }}>Peta</p>
                        <div
                          style={{
                            background:
                              "radial-gradient(ellipse, #666666 60%, rgba(102, 102, 102, 0.3) 100%)",
                            padding: "10px",
                            minHeight: "40px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <nostalgic-like id="nostalgic-b89803bb" theme="final" icon="peta" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ textAlign: "center", marginTop: "25px" }}>
                <p style={{ marginBottom: "15px", fontWeight: "bold" }}>【プレーンテキスト形式】</p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    alignItems: "center",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>いいね数:</span>
                    <nostalgic-like id="nostalgic-b89803bb" format="text" theme="kawaii" />
                    <span>（クリックでトグル）</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆ランキングのサンプル - Light◆</b>
                </span>
              </p>
              <p style={{ marginBottom: "10px", textAlign: "center" }}>
                どのサービスが一番人気か投票してみよう！
              </p>
              <div style={{ margin: "20px 0", textAlign: "center" }}>
                <nostalgic-ranking id="nostalgic-5e577b5b" theme="light" />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "10px",
                  margin: "15px 0",
                }}
              >
                <button
                  onClick={() => voteForService("Counter")}
                  style={{
                    padding: "15px",
                    backgroundColor: "#e3f2fd",
                    border: "2px solid #1976d2",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: "bold",
                    transition: "all 0.2s",
                    fontFamily: "inherit",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "#bbdefb";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "#e3f2fd";
                  }}
                >
                  📊 Counter
                  <br />
                  <small style={{ fontWeight: "normal" }}>アクセスカウンター</small>
                </button>

                <button
                  onClick={() => voteForService("Like")}
                  style={{
                    padding: "15px",
                    backgroundColor: "#fce4ec",
                    border: "2px solid #c2185b",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: "bold",
                    transition: "all 0.2s",
                    fontFamily: "inherit",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "#f8bbd9";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "#fce4ec";
                  }}
                >
                  💖 Like
                  <br />
                  <small style={{ fontWeight: "normal" }}>いいねボタン</small>
                </button>

                <button
                  onClick={() => voteForService("Ranking")}
                  style={{
                    padding: "15px",
                    backgroundColor: "#fff3e0",
                    border: "2px solid #f57c00",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: "bold",
                    transition: "all 0.2s",
                    fontFamily: "inherit",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "#ffe0b2";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "#fff3e0";
                  }}
                >
                  🏆 Ranking
                  <br />
                  <small style={{ fontWeight: "normal" }}>ランキングシステム</small>
                </button>

                <button
                  onClick={() => voteForService("BBS")}
                  style={{
                    padding: "15px",
                    backgroundColor: "#e8f5e8",
                    border: "2px solid #388e3c",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: "bold",
                    transition: "all 0.2s",
                    fontFamily: "inherit",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "#c8e6c9";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "#e8f5e8";
                  }}
                >
                  💬 BBS
                  <br />
                  <small style={{ fontWeight: "normal" }}>掲示板システム</small>
                </button>

                <button
                  onClick={() => voteForService("Yokoso")}
                  style={{
                    padding: "15px",
                    backgroundColor: "#fff8e1",
                    border: "2px solid #ffa000",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: "bold",
                    transition: "all 0.2s",
                    fontFamily: "inherit",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "#ffecb3";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "#fff8e1";
                  }}
                >
                  🐱 Yokoso
                  <br />
                  <small style={{ fontWeight: "normal" }}>招き猫メッセージ</small>
                </button>
              </div>

              {votingMessage && (
                <div
                  style={{
                    backgroundColor:
                      votingMessage.includes("失敗") || votingMessage.includes("エラー")
                        ? "#ffebee"
                        : "#e8f5e8",
                    color:
                      votingMessage.includes("失敗") || votingMessage.includes("エラー")
                        ? "#c62828"
                        : "#2e7d32",
                    border: `2px solid ${votingMessage.includes("失敗") || votingMessage.includes("エラー") ? "#ef5350" : "#4caf50"}`,
                    borderRadius: "8px",
                    padding: "10px",
                    margin: "10px 0",
                    textAlign: "center",
                    fontWeight: "bold",
                  }}
                >
                  {votingMessage}
                </div>
              )}
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆ランキングのサンプル - Dark◆</b>
                </span>
              </p>
              <p style={{ marginBottom: "10px", textAlign: "center" }}>
                ナンバークリックゲームのハイスコア（
                <a
                  href="https://llll-ll.com/easter-egg"
                  className="nostalgic-old-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  遊んでみる
                </a>
                ）
              </p>
              <div style={{ margin: "20px 0", textAlign: "center" }}>
                <div
                  style={{
                    background:
                      "radial-gradient(ellipse, #666666 60%, rgba(102, 102, 102, 0.3) 100%)",
                    padding: "10px",
                    display: "inline-block",
                    width: "fit-content",
                    maxWidth: "100%",
                  }}
                >
                  <nostalgic-ranking id="llll-ll-a235b610" theme="dark" />
                </div>
              </div>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆ランキングのサンプル - Retro◆</b>
                </span>
              </p>
              <p style={{ marginBottom: "10px", textAlign: "center" }}>
                名詞性別クイズのハイスコア（
                <a
                  href="https://noun-gender.llll-ll.com/quiz"
                  className="nostalgic-old-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  遊んでみる
                </a>
                ）
              </p>
              <div style={{ margin: "20px 0", textAlign: "center" }}>
                <div
                  style={{
                    background:
                      "radial-gradient(ellipse, #666666 60%, rgba(102, 102, 102, 0.3) 100%)",
                    padding: "10px",
                    display: "inline-block",
                    width: "fit-content",
                    maxWidth: "100%",
                  }}
                >
                  <nostalgic-ranking id="noun-gender-d0bb6d1f" theme="retro" />
                </div>
              </div>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆ランキングのサンプル - Kawaii◆</b>
                </span>
              </p>
              <p style={{ marginBottom: "10px", textAlign: "center" }}>
                Sasso 3分モード(Sprint)のハイスコア（
                <a
                  href="https://sasso.llll-ll.com"
                  className="nostalgic-old-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  遊んでみる
                </a>
                ）
              </p>
              <div style={{ margin: "20px 0", textAlign: "center" }}>
                <nostalgic-ranking id="sasso-5d582992" theme="kawaii" limit="5" />
              </div>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆ランキングのサンプル - Mother味◆</b>
                </span>
              </p>
              <div style={{ margin: "20px 0", textAlign: "center" }}>
                <nostalgic-ranking id="nostalgic-b89803bb" theme="mom" limit="5" />
              </div>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆ランキングのサンプル - FF味◆</b>
                </span>
              </p>
              <div style={{ margin: "20px 0", textAlign: "center" }}>
                <div
                  style={{
                    background:
                      "radial-gradient(ellipse, #666666 60%, rgba(102, 102, 102, 0.3) 100%)",
                    padding: "10px",
                    display: "inline-block",
                    width: "fit-content",
                    maxWidth: "100%",
                  }}
                >
                  <nostalgic-ranking id="nostalgic-b89803bb" theme="final" limit="5" />
                </div>
              </div>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆BBSのサンプル - Light◆</b>
                </span>
              </p>
              <div style={{ margin: "20px 0", textAlign: "center" }}>
                <p style={{ marginBottom: "20px" }}>訪問の記念に、足あとを残していってください！</p>
                <nostalgic-bbs id="nostalgic-1cc54837" theme="light" />
              </div>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆BBSのサンプル - Dark◆</b>
                </span>
              </p>
              <div style={{ margin: "20px 0", textAlign: "center" }}>
                <div
                  style={{
                    background:
                      "radial-gradient(ellipse, #666666 60%, rgba(102, 102, 102, 0.3) 100%)",
                    padding: "10px",
                    display: "inline-block",
                    width: "fit-content",
                    maxWidth: "100%",
                  }}
                >
                  <nostalgic-bbs id="nostalgic-4e2986a2" theme="dark" />
                </div>
              </div>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆BBSのサンプル - Retro◆</b>
                </span>
              </p>
              <div style={{ margin: "20px 0", textAlign: "center" }}>
                <div
                  style={{
                    background:
                      "radial-gradient(ellipse, #666666 60%, rgba(102, 102, 102, 0.3) 100%)",
                    padding: "10px",
                    display: "inline-block",
                    width: "fit-content",
                    maxWidth: "100%",
                  }}
                >
                  <nostalgic-bbs id="nostalgic-b89803bb" theme="retro" />
                </div>
              </div>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆BBSのサンプル - Kawaii◆</b>
                </span>
              </p>
              <div style={{ margin: "20px 0", textAlign: "center" }}>
                <nostalgic-bbs id="nostalgic-4e2986a2" theme="kawaii" />
              </div>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆BBSのサンプル - Mother味◆</b>
                </span>
              </p>
              <div style={{ margin: "20px 0", textAlign: "center" }}>
                <nostalgic-bbs id="nostalgic-b89803bb" theme="mom" />
              </div>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆BBSのサンプル - FF味◆</b>
                </span>
              </p>
              <div style={{ margin: "20px 0", textAlign: "center" }}>
                <div
                  style={{
                    background:
                      "radial-gradient(ellipse, #666666 60%, rgba(102, 102, 102, 0.3) 100%)",
                    padding: "10px",
                    display: "inline-block",
                    width: "fit-content",
                    maxWidth: "100%",
                  }}
                >
                  <nostalgic-bbs id="nostalgic-b89803bb" theme="final" />
                </div>
              </div>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆Yokosoのサンプル - バッジモード◆</b>
                </span>
              </p>
              <p style={{ marginBottom: "10px", textAlign: "center" }}>
                招き猫（Maneki-neko）がメッセージを喋ります！
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "20px",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  margin: "20px 0",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "12px", marginBottom: "5px" }}>Light</p>
                  <nostalgic-yokoso id="nostalgic-0f5ead1d" theme="light" />
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "12px", marginBottom: "5px" }}>Dark</p>
                  <div
                    style={{
                      background:
                        "radial-gradient(ellipse, #666666 60%, rgba(102, 102, 102, 0.3) 100%)",
                      padding: "10px",
                    }}
                  >
                    <nostalgic-yokoso id="nostalgic-0f5ead1d" theme="dark" />
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "12px", marginBottom: "5px" }}>Retro</p>
                  <div
                    style={{
                      background:
                        "radial-gradient(ellipse, #666666 60%, rgba(102, 102, 102, 0.3) 100%)",
                      padding: "10px",
                    }}
                  >
                    <nostalgic-yokoso id="nostalgic-0f5ead1d" theme="retro" />
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "20px",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  margin: "20px 0",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "12px", marginBottom: "5px" }}>Kawaii</p>
                  <nostalgic-yokoso id="nostalgic-0f5ead1d" theme="kawaii" />
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "12px", marginBottom: "5px" }}>Mother味</p>
                  <nostalgic-yokoso id="nostalgic-0f5ead1d" theme="mom" />
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "12px", marginBottom: "5px" }}>FF味</p>
                  <div
                    style={{
                      background:
                        "radial-gradient(ellipse, #666666 60%, rgba(102, 102, 102, 0.3) 100%)",
                      padding: "10px",
                    }}
                  >
                    <nostalgic-yokoso id="nostalgic-0f5ead1d" theme="final" />
                  </div>
                </div>
              </div>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆Yokosoのサンプル - カードモード◆</b>
                </span>
              </p>
              <p style={{ marginBottom: "10px", textAlign: "center" }}>
                長文メッセージ + アバター + 名前 + 日付
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "20px",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  margin: "20px 0",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "12px", marginBottom: "5px" }}>Light</p>
                  <nostalgic-yokoso id="nostalgic-11f690b3" theme="light" />
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "12px", marginBottom: "5px" }}>Dark</p>
                  <div
                    style={{
                      background:
                        "radial-gradient(ellipse, #666666 60%, rgba(102, 102, 102, 0.3) 100%)",
                      padding: "10px",
                    }}
                  >
                    <nostalgic-yokoso id="nostalgic-11f690b3" theme="dark" />
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "12px", marginBottom: "5px" }}>Retro</p>
                  <div
                    style={{
                      background:
                        "radial-gradient(ellipse, #666666 60%, rgba(102, 102, 102, 0.3) 100%)",
                      padding: "10px",
                    }}
                  >
                    <nostalgic-yokoso id="nostalgic-11f690b3" theme="retro" />
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "20px",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  margin: "20px 0",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "12px", marginBottom: "5px" }}>Kawaii</p>
                  <nostalgic-yokoso id="nostalgic-11f690b3" theme="kawaii" />
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "12px", marginBottom: "5px" }}>Mother味</p>
                  <nostalgic-yokoso id="nostalgic-11f690b3" theme="mom" />
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "12px", marginBottom: "5px" }}>FF味</p>
                  <div
                    style={{
                      background:
                        "radial-gradient(ellipse, #666666 60%, rgba(102, 102, 102, 0.3) 100%)",
                      padding: "10px",
                    }}
                  >
                    <nostalgic-yokoso id="nostalgic-11f690b3" theme="final" />
                  </div>
                </div>
              </div>
            </div>

            <FooterDivider />

            <p
              style={{
                textAlign: "center",
                fontSize: "20px",
                fontWeight: "bold",
                margin: "20px 0",
              }}
            >
              Sorry, This Homepage is Earthlings Only.
            </p>
          </>
        );

      case "about":
        return (
          <>
            <div className="nostalgic-title-bar">★☆★ このサイトについて ★☆★</div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆開発者より◆</b>
                </span>
              </p>
              <p>
                1990年代後半〜2000年代前半のホームページには、必ずと言っていいほど設置されていたという「アクセスカウンター」。
              </p>
              <p>「キリ番」のワクワク感を味わってみたくて、このサービスを作りました。</p>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆技術について◆</b>
                </span>
              </p>
              <p>見た目はレトロですが、中身は最新技術を使っています。</p>
              <p>
                • Cloudflare Workers
                <br />
                • D1 (SQLite)
                <br />
                • Hono
                <br />
                • Web Components
                <br />• SVG Graphics
              </p>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆お問い合わせ◆</b>
                </span>
              </p>
              <p>
                バグ報告・機能要望は{" "}
                <a
                  href="https://github.com/kako-jun/nostalgic/issues"
                  className="nostalgic-old-link"
                >
                  GitHub Issues
                </a>{" "}
                まで！
              </p>
            </div>

            <FooterDivider />

            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <img src="/footer.webp" alt="Footer" style={{ maxWidth: "100%", height: "auto" }} />
              <p style={{ marginTop: "10px", fontSize: "14px", color: "#666666" }}>
                Made in Kanazawa
              </p>
            </div>
          </>
        );

      default:
        return null;
    }
  };

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

        <div className="nostalgic-content-area">{renderContent()}</div>

        {/* フッター - 右下固定 */}
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
