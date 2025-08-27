"use client";

import { useState, useEffect, useRef } from "react";
import NostalgicLayout from "@/components/NostalgicLayout";
import { ServiceStructuredData, BreadcrumbStructuredData } from "@/components/StructuredData";
import ResponseDisplay from "@/components/ResponseDisplay";

export default function RankingPage() {
  const [currentPage, setCurrentPage] = useState("features");
  const [response, setResponse] = useState("");
  const [responseType, setResponseType] = useState<'json' | 'text' | 'svg'>('json');
  const [publicId, setPublicId] = useState("");
  const [mode, setMode] = useState("create");
  const [votingResults, setVotingResults] = useState<any[]>([]);
  const [votingMessage, setVotingMessage] = useState("");

  const urlRef = useRef<HTMLInputElement>(null);
  const tokenRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const scoreRef = useRef<HTMLInputElement>(null);
  const maxRef = useRef<HTMLInputElement>(null);
  const sortOrderRef = useRef<HTMLSelectElement>(null);
  const webhookUrlRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      setCurrentPage(hash);
    } else {
      setCurrentPage("features");
    }
    
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash) {
        setCurrentPage(hash);
      } else {
        setCurrentPage("features");
      }
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const url = urlRef.current?.value;
    const token = tokenRef.current?.value;
    const name = nameRef.current?.value;
    const score = scoreRef.current?.value;
    const max = maxRef.current?.value;
    const sortOrder = sortOrderRef.current?.value;
    const webhookUrl = webhookUrlRef.current?.value;

    let apiUrl = '';

    if (mode === "submit" || mode === "get") {
      // submitモードとgetモードでは公開IDを使用
      if (mode === "submit") {
        if (!publicId || !name || !score) return;
        apiUrl = `/api/ranking?action=submit&id=${encodeURIComponent(publicId)}&name=${encodeURIComponent(name)}&score=${score}`;
      } else if (mode === "get") {
        if (!publicId) return;
        apiUrl = `/api/ranking?action=get&id=${encodeURIComponent(publicId)}`;
      }
    } else {
      // その他のモードでは従来通りurl+tokenを使用
      if (!url || !token) return;
      apiUrl = `/api/ranking?action=${mode}&url=${encodeURIComponent(url)}&token=${encodeURIComponent(token)}`;
      
      if (mode === "create") {
        if (max) {
          apiUrl += `&max=${max}`;
        }
        if (sortOrder) {
          apiUrl += `&sortOrder=${sortOrder}`;
        }
      }
      if (mode === "update" && name && score) {
        apiUrl += `&name=${encodeURIComponent(name)}&score=${score}`;
      }
      
      if (mode === "updateSettings") {
        if (max) {
          apiUrl += `&max=${max}`;
        }
        if (sortOrder) {
          apiUrl += `&sortOrder=${sortOrder}`;
        }
        if (webhookUrl) {
          apiUrl += `&webhookUrl=${encodeURIComponent(webhookUrl)}`;
        }
      } else if (webhookUrl && (mode === "create" || mode === "update")) {
        apiUrl += `&webhookUrl=${encodeURIComponent(webhookUrl)}`;
      }
      if (mode === "remove" && name) {
        apiUrl += `&name=${encodeURIComponent(name)}`;
      }
    }

    try {
      const res = await fetch(apiUrl, { method: 'GET' });
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
      setResponseType('json'); // Always JSON for ranking

      if (data.id) {
        setPublicId(data.id);
      }
    } catch (error) {
      setResponse(`エラー: ${error}`);
      setResponseType('json');
    }
  };

  const voteForService = async (serviceName: string) => {
    try {
      const rankingId = "nostalgic-9c044ad0";
      
      // 現在のスコアを取得してインクリメント
      const getCurrentResponse = await fetch(`/api/ranking?action=get&id=${rankingId}`);
      let newScore = 1;
      if (getCurrentResponse.ok) {
        const currentData = await getCurrentResponse.json();
        console.log('Current ranking data:', currentData);
        const currentEntry = currentData.data?.entries?.find((entry: any) => entry.name === serviceName);
        console.log('Found current entry:', currentEntry);
        console.log('serviceName:', serviceName);
        console.log('currentEntry truthy?', !!currentEntry);
        if (currentEntry) {
          newScore = Number(currentEntry.score) + 1;
          console.log('New score will be:', newScore);
        } else {
          console.log('No existing entry found for:', serviceName);
          newScore = 1; // 新規エントリの場合は1から開始
        }
      } else {
        console.log('Failed to get current ranking');
        newScore = 1; // エラーの場合も1から開始
      }
      
      console.log('Submitting vote with score:', newScore);
      const voteResponse = await fetch(`/api/ranking?action=submit&id=${rankingId}&name=${encodeURIComponent(serviceName)}&score=${newScore}`);
      
      if (voteResponse.ok) {
        const voteData = await voteResponse.json();
        console.log('Vote response data:', voteData);
        setVotingMessage(`${serviceName}に投票しました！ありがとうございます 🎉`);
        setTimeout(() => setVotingMessage(''), 3000);
        // APIレスポンスから直接最新のランキングデータを取得して表示
        if (voteData.data && voteData.data.entries) {
          setVotingResults(voteData.data.entries.slice(0, 4));
        } else {
          // フォールバック: 少し遅延を入れてリロード
          setTimeout(() => loadVotingResults(), 100);
        }
      } else {
        setVotingMessage('投票に失敗しました。もう一度お試しください。');
      }
    } catch (error) {
      setVotingMessage('エラーが発生しました。');
      console.error('Vote error:', error);
    }
  };
  
  const loadVotingResults = async () => {
    try {
      const rankingId = "nostalgic-9c044ad0";
      
      const response = await fetch(`/api/ranking?action=get&id=${rankingId}&limit=4`);
      if (response.ok) {
        const data = await response.json();
        setVotingResults(data.entries || []);
      }
    } catch (error) {
      console.error('Failed to load voting results:', error);
    }
  };

  const renderContent = () => {
    switch (currentPage) {
      case "usage":
        return (
          <>
            <div className="nostalgic-title-bar">
              ★ Nostalgic Ranking ★
              <br />
              使い方
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆STEP 1: ランキング作成◆</b>
                </span>
              </p>
              <p>ブラウザのアドレスバーに以下のURLを入力してアクセスしてください。</p>
              <p
                style={{
                  backgroundColor: "#f0f0f0",
                  padding: "10px",
                  fontFamily: "monospace",
                  fontSize: "14px",
                  wordBreak: "break-all",
                }}
              >
                https://nostalgic.llll-ll.com/api/ranking?action=create&url=<span style={{ color: "#008000" }}>サイトURL</span>
                &token=<span style={{ color: "#008000" }}>オーナートークン</span>
              </p>
              <p>
                ※サイトURLには、ランキングを設置する予定のサイトを指定してください。「https://」から始まっている必要があります。
                <br />
                ※オーナートークンに、
                <span style={{ color: "#ff0000" }}>ほかのサイトでのパスワードを使い回さないでください</span>
                。（8-16文字）
              </p>
              <p>上記URLにアクセスすると、JSONで公開IDが返されます。この公開IDをSTEP 2で使用してください。</p>
              
              <hr style={{ margin: "20px 0", border: "1px dashed #ccc" }} />
              
              <p style={{ marginTop: "20px" }}>
                または、以下のフォームで簡単に作成できます。
              </p>
              
              <form onSubmit={handleSubmit} style={{ marginTop: "10px" }}>
                <input type="hidden" name="mode" value="create" />
                <p>
                  <b>サイトURL：</b>
                  <input
                    ref={urlRef}
                    type="url"
                    placeholder="https://example.com"
                    style={{
                      marginLeft: "10px",
                      width: "60%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px"
                    }}
                    required
                  />
                </p>

                <p>
                  <b>オーナートークン：</b>
                  <input
                    ref={tokenRef}
                    type="text"
                    placeholder="8-16文字"
                    style={{
                      marginLeft: "10px",
                      width: "30%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px"
                    }}
                    required
                  />
                </p>

                <p>
                  <b>最大エントリー数（オプション）：</b>
                  <input
                    ref={maxRef}
                    type="number"
                    min="1"
                    max="100"
                    placeholder="10"
                    style={{
                      marginLeft: "10px",
                      width: "20%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px"
                    }}
                  />
                </p>

                <p>
                  <b>ソート順（オプション）：</b>
                  <select
                    ref={sortOrderRef}
                    style={{
                      marginLeft: "10px",
                      width: "30%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px"
                    }}
                  >
                    <option value="desc">高い順（スコア系ゲーム用）</option>
                    <option value="asc">低い順（タイム系ゲーム用）</option>
                  </select>
                </p>

                <p>
                  <b>Webhook URL：</b>
                  <input
                    ref={webhookUrlRef}
                    type="url"
                    placeholder="https://hooks.slack.com/... (任意)"
                    style={{
                      marginLeft: "10px",
                      width: "60%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px"
                    }}
                  />
                </p>

                <p>
                  <button
                    type="button"
                    style={{
                      padding: "6px 16px",
                      backgroundColor: "#2196F3",
                      color: "white",
                      border: "2px outset #2196F3",
                      fontSize: "16px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      fontFamily: "inherit"
                    }}
                    onClick={(e) => {
                      setMode("create");
                      handleSubmit(e);
                    }}
                  >
                    ランキング作成
                  </button>
                </p>
              </form>

              <ResponseDisplay response={response} responseType={responseType} show={!!response} />
              {publicId && (
                <div
                  style={{
                    backgroundColor: "#ffffcc",
                    border: "2px solid #ff0000",
                    padding: "10px",
                    marginTop: "10px",
                    fontSize: "14px"
                  }}
                >
                  <b style={{ color: "#ff0000" }}>✨ 作成成功！</b>
                  <br />
                  あなたの公開ID：<span style={{ color: "#008000", fontWeight: "bold", fontSize: "16px", fontFamily: "monospace" }}>{publicId}</span>
                  <br />
                  <small>※この公開IDをSTEP 2で使用してください</small>
                </div>
              )}
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆STEP 2: ランキング表示◆</b>
                </span>
              </p>
              <p>ブラウザのアドレスバーに以下のURLを入力してアクセスしてください。</p>
              <p
                style={{
                  backgroundColor: "#f0f0f0",
                  padding: "10px",
                  fontFamily: "monospace",
                  fontSize: "14px",
                  wordBreak: "break-all",
                }}
              >
                https://nostalgic.llll-ll.com/api/ranking?action=get&id=<span style={{ color: "#008000" }}>公開ID</span>
              </p>
              <hr style={{ margin: "20px 0", border: "1px dashed #ccc" }} />
              
              <p>または、以下のフォームでランキングデータを取得できます。</p>
              
              <form onSubmit={handleSubmit} style={{ marginTop: "10px" }}>
                <p>
                  <b>公開ID：</b>
                  <span style={{ marginLeft: "10px", fontFamily: "monospace", fontSize: "16px", fontWeight: "bold", color: publicId ? "#008000" : "#999" }}>
                    {publicId || "STEP 1で作成後に表示されます"}
                  </span>
                  <button
                    type="button"
                    style={{
                      marginLeft: "10px",
                      padding: "4px 12px",
                      backgroundColor: "#4CAF50",
                      color: "white",
                      border: "2px outset #4CAF50",
                      fontSize: "16px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      fontFamily: "inherit"
                    }}
                    onClick={(e) => {
                      setMode("get");
                      handleSubmit(e);
                    }}
                  >
                    ランキング取得
                  </button>
                </p>
              </form>

              <ResponseDisplay response={response} responseType={responseType} show={!!response} />
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆STEP 3: ランキング埋め込み◆</b>
                </span>
              </p>
              <p>あなたのサイトのHTMLに以下のコードを追加してください。</p>
              <pre style={{ backgroundColor: "#f0f0f0", padding: "10px", overflow: "auto", fontSize: "14px", margin: "10px 0" }}>
                {`<script src="https://nostalgic.llll-ll.com/components/ranking.js"></script>
<nostalgic-ranking id="`}
                <span style={{ color: "#008000" }}>公開ID</span>
                {`" theme="`}
                <span style={{ color: "#008000" }}>light</span>
                {`"></nostalgic-ranking>`}
              </pre>
              
              <div className="nostalgic-section">
                <p>
                  <span className="nostalgic-section-title">
                    <b>◆theme デザインテーマ◆</b>
                  </span>
                </p>
                <p>
                  • <span style={{ color: "#008000" }}>light</span> - ライト（シンプル）
                  <br />• <span style={{ color: "#008000" }}>dark</span> - ダーク（青系）
                  <br />• <span style={{ color: "#008000" }}>kawaii</span> - カワイイ（黄系）
                </p>
              </div>

              <div className="nostalgic-section">
                <p>
                  <span className="nostalgic-section-title">
                    <b>◆TypeScript使用時の設定◆</b>
                  </span>
                </p>
                <p>TypeScriptプロジェクトでWeb Componentsを使用する場合、プロジェクトルートに <code>types.d.ts</code> ファイルを作成してください。</p>
                <pre style={{ backgroundColor: "#f0f0f0", padding: "10px", overflow: "auto", fontSize: "12px", margin: "10px 0" }}>
{`// types.d.ts
import 'react'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'nostalgic-ranking': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        id?: string;
        max?: string;
        theme?: 'light' | 'dark' | 'kawaii';
        limit?: string;
      };
    }
  }
}`}
                </pre>
                <p style={{ fontSize: "14px", color: "#666" }}>
                  ※この設定により、TypeScriptでWeb Componentsを使用してもビルドエラーが発生しません。
                </p>
              </div>

              {publicId && (
                <div className="nostalgic-section">
                  <p>
                    <span className="nostalgic-section-title">
                      <b>◆このように表示されます◆</b>
                    </span>
                  </p>
                  <div style={{ textAlign: "center", margin: "20px 0" }}>
                    <div style={{ backgroundColor: "#f0f0f0", border: "1px solid #ccc", padding: "15px", borderRadius: "4px" }}>
                      <p style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "15px" }}>REST APIデモ</p>
                      <div style={{ marginBottom: "15px" }}>
                        <p style={{ fontSize: "14px", marginBottom: "10px" }}>現在のランキングデータを取得：</p>
                        <button
                          onClick={async () => {
                            try {
                              const response = await fetch(`/api/ranking?action=get&id=${publicId}&limit=5`)
                              const data = await response.json()
                              const entries = data.entries || []
                              const rankingText = entries.length > 0 
                                ? entries.map((entry: any, index: number) => `${index + 1}位: ${entry.name} - ${entry.displayScore || entry.score}`).join('\n')
                                : 'まだエントリーがありません'
                              alert(`ランキング（上位5位）:\n${rankingText}`)
                            } catch (error) {
                              alert('エラーが発生しました')
                            }
                          }}
                          style={{
                            padding: "8px 16px",
                            backgroundColor: "#4CAF50",
                            color: "white",
                            border: "1px solid #45a049",
                            borderRadius: "3px",
                            cursor: "pointer",
                            fontSize: "14px"
                          }}
                        >
                          ランキング取得（API直接呼び出し）
                        </button>
                      </div>
                      <p style={{ fontSize: "12px", color: "#666" }}>
                        ※この例では、Web ComponentsではなくREST APIを直接使用してランキングデータを取得しています
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {publicId && (
                <div className="nostalgic-section">
                  <p>
                    <span className="nostalgic-section-title">
                      <b>◆このように表示されます◆</b>
                    </span>
                  </p>
                  <div style={{ textAlign: "center", margin: "20px 0" }}>
                    <div style={{ backgroundColor: "#fffacd", border: "2px solid #ffa500", padding: "20px", borderRadius: "4px" }}>
                      <p style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "15px" }}>◆デモ用ランキング◆</p>
                      <p style={{ marginBottom: "15px" }}>このデモページのランキング（実際に動作します）：</p>
                      
                      <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
                        <div>
                          <p style={{ fontSize: "14px", marginBottom: "10px", fontWeight: "bold" }}>Light</p>
                          <nostalgic-ranking id={publicId} theme="light" limit="5" />
                        </div>
                        
                        <div>
                          <p style={{ fontSize: "14px", marginBottom: "10px", fontWeight: "bold" }}>Dark</p>
                          <nostalgic-ranking id={publicId} theme="dark" limit="5" />
                        </div>
                        
                        <div>
                          <p style={{ fontSize: "14px", marginBottom: "10px", fontWeight: "bold" }}>Kawaii</p>
                          <nostalgic-ranking id={publicId} theme="kawaii" limit="5" />
                        </div>
                      </div>
                      
                      <p style={{ fontSize: "12px", color: "#666", marginTop: "15px" }}>
                        ※スコア投稿フォームからテストデータを送信してください！
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆公開IDを再確認したいときは？◆</b>
                </span>
              </p>
              <p>ブラウザのアドレスバーに以下のURLを入力してアクセスしてください。</p>
              <p
                style={{
                  backgroundColor: "#f0f0f0",
                  padding: "10px",
                  fontFamily: "monospace",
                  fontSize: "14px",
                  wordBreak: "break-all",
                }}
              >
                https://nostalgic.llll-ll.com/api/ranking?action=create&url=<span style={{ color: "#008000" }}>サイトURL</span>
                &token=<span style={{ color: "#008000" }}>オーナートークン</span>
              </p>
              <hr style={{ margin: "20px 0", border: "1px dashed #ccc" }} />
              
              <p>または、以下のフォームで確認できます。</p>
              
              <form onSubmit={handleSubmit} style={{ marginTop: "10px" }}>
                <p>
                  <b>サイトURL：</b>
                  <input
                    ref={urlRef}
                    type="url"
                    placeholder="https://example.com"
                    style={{
                      marginLeft: "10px",
                      width: "60%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px"
                    }}
                    required
                  />
                </p>

                <p>
                  <b>オーナートークン：</b>
                  <input
                    ref={tokenRef}
                    type="text"
                    placeholder="8-16文字"
                    style={{
                      marginLeft: "10px",
                      width: "30%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px"
                    }}
                    required
                  />
                  <button
                    type="button"
                    style={{
                      marginLeft: "10px",
                      padding: "4px 12px",
                      backgroundColor: "#2196F3",
                      color: "white",
                      border: "2px outset #2196F3",
                      fontSize: "16px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      fontFamily: "inherit"
                    }}
                    onClick={(e) => {
                      setMode("create");
                      handleSubmit(e);
                    }}
                  >
                    確認
                  </button>
                </p>
              </form>

              <ResponseDisplay response={response} responseType={responseType} show={!!response} />
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆スコアを送信したいときは？◆</b>
                </span>
              </p>
              <p>作成したランキングの公開IDを使用してスコアを送信できます。</p>
              <form onSubmit={handleSubmit} style={{ marginTop: "10px" }}>
                <input type="hidden" name="mode" value="submit" />
                <p>
                  <b>公開ID：</b>
                  <span style={{ marginLeft: "10px", fontFamily: "monospace", fontSize: "16px", fontWeight: "bold", color: publicId ? "#008000" : "#999" }}>
                    {publicId || "STEP 1で作成後に表示されます"}
                  </span>
                </p>

                <p>
                  <b>プレイヤー名：</b>
                  <input
                    ref={nameRef}
                    type="text"
                    placeholder="Player1"
                    style={{
                      marginLeft: "10px",
                      width: "30%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px"
                    }}
                    required
                  />
                </p>

                <p>
                  <b>スコア：</b>
                  <input
                    ref={scoreRef}
                    type="number"
                    min="0"
                    placeholder="1000"
                    style={{
                      marginLeft: "10px",
                      width: "20%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px"
                    }}
                    required
                  />
                  <button
                    type="button"
                    style={{
                      marginLeft: "10px",
                      padding: "4px 12px",
                      backgroundColor: "#2196F3",
                      color: "white",
                      border: "2px outset #2196F3",
                      fontSize: "16px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      fontFamily: "inherit"
                    }}
                    onClick={(e) => {
                      setMode("submit");
                      handleSubmit(e);
                    }}
                  >
                    スコア送信
                  </button>
                </p>
              </form>

              <ResponseDisplay response={response} responseType={responseType} show={!!response} />
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆スコアを更新したいときは？◆</b>
                </span>
              </p>
              <p>ブラウザのアドレスバーに以下のURLを入力してアクセスしてください。</p>
              <p
                style={{
                  backgroundColor: "#f0f0f0",
                  padding: "10px",
                  fontFamily: "monospace",
                  fontSize: "14px",
                  wordBreak: "break-all",
                }}
              >
                https://nostalgic.llll-ll.com/api/ranking?action=update&url=<span style={{ color: "#008000" }}>サイトURL</span>
                &token=<span style={{ color: "#008000" }}>オーナートークン</span>&name=<span style={{ color: "#008000" }}>プレイヤー名</span>&score=<span style={{ color: "#008000" }}>新スコア</span>
              </p>
              <hr style={{ margin: "20px 0", border: "1px dashed #ccc" }} />
              
              <p>または、以下のフォームで更新できます。</p>
              
              <form onSubmit={handleSubmit} style={{ marginTop: "10px" }}>
                <p>
                  <b>サイトURL：</b>
                  <input
                    ref={urlRef}
                    type="url"
                    placeholder="https://example.com"
                    style={{
                      marginLeft: "10px",
                      width: "60%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px"
                    }}
                    required
                  />
                </p>

                <p>
                  <b>オーナートークン：</b>
                  <input
                    ref={tokenRef}
                    type="text"
                    placeholder="8-16文字"
                    style={{
                      marginLeft: "10px",
                      width: "30%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px"
                    }}
                    required
                  />
                </p>

                <p>
                  <b>プレイヤー名：</b>
                  <input
                    ref={nameRef}
                    type="text"
                    placeholder="Player1"
                    style={{
                      marginLeft: "10px",
                      width: "30%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px"
                    }}
                    required
                  />
                </p>

                <p>
                  <b>新スコア：</b>
                  <input
                    ref={scoreRef}
                    type="number"
                    min="0"
                    placeholder="2000"
                    style={{
                      marginLeft: "10px",
                      width: "20%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px"
                    }}
                    required
                  />
                </p>

                <p>
                  <b>Webhook URL：</b>
                  <input
                    ref={webhookUrlRef}
                    type="url"
                    placeholder="https://hooks.slack.com/... (任意)"
                    style={{
                      marginLeft: "10px",
                      width: "60%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px"
                    }}
                  />
                </p>

                <p>
                  <button
                    type="button"
                    style={{
                      marginLeft: "10px",
                      padding: "4px 12px",
                      backgroundColor: "#2196F3",
                      color: "white",
                      border: "2px outset #2196F3",
                      fontSize: "16px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      fontFamily: "inherit"
                    }}
                    onClick={(e) => {
                      setMode("update");
                      handleSubmit(e);
                    }}
                  >
                    更新
                  </button>
                </p>
              </form>

              <ResponseDisplay response={response} responseType={responseType} show={!!response} />
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆スコアを削除したいときは？◆</b>
                </span>
              </p>
              <p>ブラウザのアドレスバーに以下のURLを入力してアクセスしてください。</p>
              <p
                style={{
                  backgroundColor: "#f0f0f0",
                  padding: "10px",
                  fontFamily: "monospace",
                  fontSize: "14px",
                  wordBreak: "break-all",
                }}
              >
                https://nostalgic.llll-ll.com/api/ranking?action=remove&url=<span style={{ color: "#008000" }}>サイトURL</span>
                &token=<span style={{ color: "#008000" }}>オーナートークン</span>&name=<span style={{ color: "#008000" }}>プレイヤー名</span>
              </p>
              <hr style={{ margin: "20px 0", border: "1px dashed #ccc" }} />
              
              <p>または、以下のフォームで削除できます。</p>
              
              <form onSubmit={handleSubmit} style={{ marginTop: "10px" }}>
                <p>
                  <b>サイトURL：</b>
                  <input
                    ref={urlRef}
                    type="url"
                    placeholder="https://example.com"
                    style={{
                      marginLeft: "10px",
                      width: "60%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px"
                    }}
                    required
                  />
                </p>

                <p>
                  <b>オーナートークン：</b>
                  <input
                    ref={tokenRef}
                    type="text"
                    placeholder="8-16文字"
                    style={{
                      marginLeft: "10px",
                      width: "30%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px"
                    }}
                    required
                  />
                </p>

                <p>
                  <b>削除するプレイヤー名：</b>
                  <input
                    ref={nameRef}
                    type="text"
                    placeholder="Player1"
                    style={{
                      marginLeft: "10px",
                      width: "30%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px"
                    }}
                    required
                  />
                  <button
                    type="button"
                    style={{
                      marginLeft: "10px",
                      padding: "4px 12px",
                      backgroundColor: "#F44336",
                      color: "white",
                      border: "2px outset #F44336",
                      fontSize: "16px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      fontFamily: "inherit"
                    }}
                    onClick={(e) => {
                      setMode("remove");
                      handleSubmit(e);
                    }}
                  >
                    削除
                  </button>
                </p>
              </form>

              <ResponseDisplay response={response} responseType={responseType} show={!!response} />
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆全エントリーをクリアしたいときは？◆</b>
                </span>
              </p>
              <p>ブラウザのアドレスバーに以下のURLを入力してアクセスしてください。</p>
              <p
                style={{
                  backgroundColor: "#f0f0f0",
                  padding: "10px",
                  fontFamily: "monospace",
                  fontSize: "14px",
                  wordBreak: "break-all",
                }}
              >
                https://nostalgic.llll-ll.com/api/ranking?action=clear&url=<span style={{ color: "#008000" }}>サイトURL</span>
                &token=<span style={{ color: "#008000" }}>オーナートークン</span>
              </p>
              <hr style={{ margin: "20px 0", border: "1px dashed #ccc" }} />
              
              <p>または、以下のフォームでクリアできます。</p>
              <p style={{ color: "#ff0000", fontWeight: "bold" }}>
                ※すべてのエントリーが削除されます。十分にご注意ください。
              </p>
              
              <form onSubmit={handleSubmit} style={{ marginTop: "10px" }}>
                <p>
                  <b>サイトURL：</b>
                  <input
                    ref={urlRef}
                    type="url"
                    placeholder="https://example.com"
                    style={{
                      marginLeft: "10px",
                      width: "60%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px"
                    }}
                    required
                  />
                </p>

                <p>
                  <b>オーナートークン：</b>
                  <input
                    ref={tokenRef}
                    type="text"
                    placeholder="8-16文字"
                    style={{
                      marginLeft: "10px",
                      width: "30%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px"
                    }}
                    required
                  />
                  <button
                    type="button"
                    style={{
                      marginLeft: "10px",
                      padding: "4px 12px",
                      backgroundColor: "#F44336",
                      color: "white",
                      border: "2px outset #F44336",
                      fontSize: "16px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      fontFamily: "inherit"
                    }}
                    onClick={(e) => {
                      setMode("clear");
                      handleSubmit(e);
                    }}
                  >
                    全削除
                  </button>
                </p>
              </form>

              <ResponseDisplay response={response} responseType={responseType} show={!!response} />
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆設定更新◆</b>
                </span>
              </p>
              <p>ランキングの設定を更新します。</p>
              
              <form onSubmit={handleSubmit} style={{ marginTop: "10px" }}>
                <p>
                  <b>サイトURL：</b>
                  <input
                    ref={urlRef}
                    type="url"
                    placeholder="https://example.com"
                    style={{
                      marginLeft: "10px",
                      width: "60%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px"
                    }}
                    required
                  />
                </p>

                <p>
                  <b>オーナートークン：</b>
                  <input
                    ref={tokenRef}
                    type="text"
                    placeholder="8-16文字"
                    style={{
                      marginLeft: "10px",
                      width: "30%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px"
                    }}
                    required
                  />
                </p>

                <p>
                  <b>最大エントリー数：</b>
                  <input
                    ref={maxRef}
                    type="number"
                    min="1"
                    max="1000"
                    placeholder="100"
                    style={{
                      marginLeft: "10px",
                      width: "20%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px"
                    }}
                  />
                </p>

                <p>
                  <b>ソート順：</b>
                  <select
                    ref={sortOrderRef}
                    style={{
                      marginLeft: "10px",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px"
                    }}
                  >
                    <option value="">変更しない</option>
                    <option value="desc">降順（高スコアが上）</option>
                    <option value="asc">昇順（低スコアが上）</option>
                  </select>
                </p>

                <p>
                  <b>Webhook URL：</b>
                  <input
                    ref={webhookUrlRef}
                    type="url"
                    placeholder="https://example.com/webhook (optional)"
                    style={{
                      marginLeft: "10px",
                      width: "60%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px"
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      marginLeft: "10px",
                      padding: "4px 12px",
                      backgroundColor: "#FF9800",
                      color: "white",
                      border: "2px outset #FF9800",
                      fontSize: "16px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      fontFamily: "inherit"
                    }}
                    onClick={(e) => {
                      setMode("updateSettings");
                      handleSubmit(e);
                    }}
                  >
                    設定更新
                  </button>
                </p>
              </form>

              <ResponseDisplay response={response} responseType={responseType} show={!!response} />
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆ランキングを削除したいときは？◆</b>
                </span>
              </p>
              <p>ブラウザのアドレスバーに以下のURLを入力してアクセスしてください。</p>
              <p
                style={{
                  backgroundColor: "#f0f0f0",
                  padding: "10px",
                  fontFamily: "monospace",
                  fontSize: "14px",
                  wordBreak: "break-all",
                }}
              >
                https://nostalgic.llll-ll.com/api/ranking?action=delete&url=<span style={{ color: "#008000" }}>サイトURL</span>
                &token=<span style={{ color: "#008000" }}>オーナートークン</span>
              </p>
              <hr style={{ margin: "20px 0", border: "1px dashed #ccc" }} />
              
              <p>または、以下のフォームで削除できます。</p>
              <p style={{ color: "#ff0000", fontWeight: "bold" }}>
                ※ランキングが完全に削除され復元できません。十分にご注意ください。
              </p>
              
              <form onSubmit={handleSubmit} style={{ marginTop: "10px" }}>
                <p>
                  <b>サイトURL：</b>
                  <input
                    ref={urlRef}
                    type="url"
                    placeholder="https://example.com"
                    style={{
                      marginLeft: "10px",
                      width: "60%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px"
                    }}
                    required
                  />
                </p>

                <p>
                  <b>オーナートークン：</b>
                  <input
                    ref={tokenRef}
                    type="text"
                    placeholder="8-16文字"
                    style={{
                      marginLeft: "10px",
                      width: "30%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px"
                    }}
                    required
                  />
                  <button
                    type="button"
                    style={{
                      marginLeft: "10px",
                      padding: "4px 12px",
                      backgroundColor: "#F44336",
                      color: "white",
                      border: "2px outset #F44336",
                      fontSize: "16px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      fontFamily: "inherit"
                    }}
                    onClick={(e) => {
                      setMode("delete");
                      handleSubmit(e);
                    }}
                  >
                    完全削除
                  </button>
                </p>
              </form>

              <ResponseDisplay response={response} responseType={responseType} show={!!response} />
            </div>

            <hr />

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆TypeScriptプロジェクトでの設定◆</b>
                </span>
              </p>
              <p>React/Next.jsなどのTypeScriptプロジェクトでWeb Componentsを使用する場合は、プロジェクトルートに`types.d.ts`ファイルを作成してください：</p>
              <pre
                style={{
                  backgroundColor: "#f0f0f0",
                  padding: "15px",
                  fontFamily: "monospace",
                  fontSize: "13px",
                  overflowX: "auto",
                  border: "1px solid #ccc",
                  borderRadius: "4px"
                }}
              >
{`// types.d.ts
import React from 'react'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'nostalgic-ranking': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        id?: string
        limit?: string
        theme?: 'light' | 'dark' | 'kawaii'
        format?: 'html' | 'json'
        url?: string
        token?: string
        'api-base'?: string
      }, HTMLElement>
    }
  }
}`}
              </pre>
              <p>これにより、TypeScriptビルドエラーを防ぐことができます。</p>
            </div>

            <p style={{ textAlign: "center" }}>
              これ以上の詳しい説明は{" "}
              <a href="https://github.com/kako-jun/nostalgic/blob/main/README_ja.md" className="nostalgic-old-link">
                【GitHub】
              </a>{" "}
              へ
            </p>
          </>
        );

      case "features":
        return (
          <>
            <div className="nostalgic-title-bar">
              ★ Nostalgic Ranking ★
              <br />
              機能一覧
            </div>

            <div className="nostalgic-marquee-box">
              <div className="nostalgic-marquee-text">
                🏆 究極のランキングシステム！ゲームスコア・人気投票・何でもランキング化できます！ 🏆
              </div>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆基本機能◆</b>
                </span>
              </p>
              <p>
                <span>●</span> Redis Sorted Setによる自動ソート
                <br />
                <span>●</span> スコア管理（submit/update/remove/clear）
                <br />
                <span>●</span> 最大エントリー数制限
                <br />
                <span>●</span> Web Componentsで簡単設置
              </p>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆利用シーン◆</b>
                </span>
              </p>
              <p>
                <span>●</span> ゲームの高得点ランキング
                <br />
                <span>●</span> 人気投票システム
                <br />
                <span>●</span> クイズの成績表
                <br />
                <span>●</span> コンテストの順位表
              </p>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆技術仕様◆</b>
                </span>
              </p>
              <p>
                • Next.js + Vercel でホスティング
                <br />
                • Redis Sorted Set で高速ソート
                <br />
                • 金・銀・銅メダル表示 🥇🥈🥉
                <br />• 必要なすべての要素が無料プランの範囲で動作するため、完全無料・広告なしを実現
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
      {/* 構造化データ */}
      <ServiceStructuredData 
        name="Nostalgic Ranking"
        description="懐かしいランキングサービス。Redis Sorted Setによる自動ソート、スコア管理機能付き。"
        url="https://nostalgic.llll-ll.com/ranking"
        serviceType="Ranking Service"
      />
      <BreadcrumbStructuredData 
        items={[
          { name: "Nostalgic", url: "https://nostalgic.llll-ll.com" },
          { name: "Ranking", url: "https://nostalgic.llll-ll.com/ranking" }
        ]}
      />
      
      <NostalgicLayout serviceName="Ranking" serviceIcon="🏆">
        {renderContent()}
      </NostalgicLayout>
    </>
  );
}