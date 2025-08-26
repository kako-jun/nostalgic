"use client";

import { useState, useEffect, useRef } from "react";
import NostalgicLayout from "@/components/NostalgicLayout";
import { ServiceStructuredData, BreadcrumbStructuredData } from "@/components/StructuredData";

export default function CounterPage() {
  const [currentPage, setCurrentPage] = useState("features");
  const [response, setResponse] = useState("");
  const [publicId, setPublicId] = useState("");
  const [mode, setMode] = useState("create");

  const urlRef = useRef<HTMLInputElement>(null);
  const tokenRef = useRef<HTMLInputElement>(null);
  const valueRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);
  const formatRef = useRef<HTMLSelectElement>(null);
  
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
    const value = valueRef.current?.value;

    let apiUrl = '';

    if (mode === "increment") {
      // incrementモードでは公開IDを使用
      if (!publicId) return;
      apiUrl = `/api/visit?action=increment&id=${encodeURIComponent(publicId)}`;
    } else if (mode === "display") {
      // displayモードでは公開IDを使用
      if (!publicId) return;
      const type = selectRef.current?.value || "total";
      const format = formatRef.current?.value || "svg";
      apiUrl = `/api/visit?action=display&id=${encodeURIComponent(publicId)}&type=${type}&format=${format}`;
    } else {
      // その他のモードでは従来通りurl+tokenを使用
      if (!url || !token) return;
      apiUrl = `/api/visit?action=${mode}&url=${encodeURIComponent(url)}&token=${encodeURIComponent(token)}`;
      
      if (mode === "set" && value) {
        apiUrl += `&total=${value}`;
      }
    }

    try {
      const res = await fetch(apiUrl, { method: 'GET' });
      
      if (mode === "display" && formatRef.current?.value === "svg") {
        // SVGの場合はテキストとして取得
        const svgText = await res.text();
        setResponse(svgText);
      } else {
        const data = await res.json();
        setResponse(JSON.stringify(data, null, 2));

        if (data.id) {
          setPublicId(data.id);
        }
      }
    } catch (error) {
      setResponse(`エラー: ${error}`);
    }
  };

  const renderContent = () => {
    switch (currentPage) {
      case "usage":
        return (
          <>
            <div className="nostalgic-title-bar">
              ★ Nostalgic Counter ★
              <br />
              使い方
            </div>


            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆STEP 1: カウンター作成◆</b>
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
                https://nostalgic.llll-ll.com/api/visit?action=create&url=<span style={{ color: "#008000" }}>サイトURL</span>
                &token=<span style={{ color: "#008000" }}>オーナートークン</span>
              </p>
              <p>
                ※サイトURLには、カウンターを設置する予定のサイトを指定してください。「https://」から始まっている必要があります。
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
                  <button
                    type="submit"
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
                    作成
                  </button>
                </p>
              </form>

              {response && (
                <div className="nostalgic-section">
                  <p>
                    <span className="nostalgic-section-title">
                      <b>◆APIレスポンス◆</b>
                    </span>
                  </p>
                  <pre style={{ backgroundColor: "#000000", color: "#00ff00", padding: "10px", overflow: "auto", fontSize: "14px" }}>
                    {response}
                  </pre>
                </div>
              )}
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
                  <b>◆STEP 2: カウンター表示◆</b>
                </span>
              </p>
              <p>あなたのサイトのHTMLに以下のコードを追加してください。</p>
              <pre style={{ backgroundColor: "#f0f0f0", padding: "10px", overflow: "auto", fontSize: "14px", margin: "10px 0" }}>
                {`<script src="https://nostalgic.llll-ll.com/components/visit.js"></script>
<nostalgic-counter id="`}
                <span style={{ color: "#008000" }}>公開ID</span>
                {`" type="`}
                <span style={{ color: "#008000" }}>total</span>
                {`" theme="`}
                <span style={{ color: "#008000" }}>classic</span>
                {`"></nostalgic-counter>`}
              </pre>
              
              <div className="nostalgic-section">
                <p>
                  <span className="nostalgic-section-title">
                    <b>◆type 期間タイプ◆</b>
                  </span>
                </p>
                <p>
                  • <span style={{ color: "#008000" }}>total</span> - 累計訪問数
                  <br />• <span style={{ color: "#008000" }}>today</span> - 今日の訪問数
                  <br />• <span style={{ color: "#008000" }}>yesterday</span> - 昨日の訪問数
                  <br />• <span style={{ color: "#008000" }}>week</span> - 今週の訪問数
                  <br />• <span style={{ color: "#008000" }}>month</span> - 今月の訪問数
                </p>
              </div>

              <div className="nostalgic-section">
                <p>
                  <span className="nostalgic-section-title">
                    <b>◆theme デザインテーマ◆</b>
                  </span>
                </p>
                <p>
                  • <span style={{ color: "#008000" }}>classic</span> - クラシック（緑のデジタル）
                  <br />• <span style={{ color: "#008000" }}>modern</span> - モダン（青のデジタル）
                  <br />• <span style={{ color: "#008000" }}>retro</span> - レトロ（赤のドット）
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
      'nostalgic-counter': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        id?: string;
        type?: 'total' | 'today' | 'yesterday' | 'week' | 'month';
        theme?: 'light' | 'dark' | 'kawaii';
        digits?: string;
        scale?: string;
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
                    <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: "14px", marginBottom: "10px" }}>Light</p>
                        <img 
                          src={`/api/visit?action=display&id=${publicId}&type=total&theme=light`}
                          alt="Light Counter"
                          style={{ border: "1px solid #ccc" }}
                        />
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: "14px", marginBottom: "10px" }}>Dark</p>
                        <img 
                          src={`/api/visit?action=display&id=${publicId}&type=total&theme=dark`}
                          alt="Dark Counter"
                          style={{ border: "1px solid #ccc" }}
                        />
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: "14px", marginBottom: "10px" }}>Kawaii</p>
                        <img 
                          src={`/api/visit?action=display&id=${publicId}&type=total&theme=kawaii`}
                          alt="Kawaii Counter"
                          style={{ border: "1px solid #ccc" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆STEP 2: カウンター表示データ取得◆</b>
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
                https://nostalgic.llll-ll.com/api/visit?action=display&id=<span style={{ color: "#008000" }}>公開ID</span>
                &type=<span style={{ color: "#008000" }}>期間タイプ</span>&theme=<span style={{ color: "#008000" }}>テーマ</span>&format=<span style={{ color: "#008000" }}>形式</span>
              </p>
              <hr style={{ margin: "20px 0", border: "1px dashed #ccc" }} />
              
              <p>または、以下のフォームでデータを取得できます。</p>
              
              <form onSubmit={handleSubmit} style={{ marginTop: "10px" }}>
                <p>
                  <b>公開ID：</b>
                  <span style={{ marginLeft: "10px", fontFamily: "monospace", fontSize: "16px", fontWeight: "bold", color: publicId ? "#008000" : "#999" }}>
                    {publicId || "STEP 1で作成後に表示されます"}
                  </span>
                </p>

                <p>
                  <b>期間タイプ：</b>
                  <select
                    ref={selectRef}
                    style={{
                      marginLeft: "10px",
                      width: "30%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px"
                    }}
                  >
                    <option value="total">累計</option>
                    <option value="today">今日</option>
                    <option value="yesterday">昨日</option>
                    <option value="week">今週</option>
                    <option value="month">今月</option>
                  </select>
                </p>

                <p>
                  <b>形式：</b>
                  <select
                    ref={formatRef}
                    style={{
                      marginLeft: "10px",
                      width: "30%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px"
                    }}
                  >
                    <option value="svg">SVG画像</option>
                    <option value="text">テキスト</option>
                    <option value="json">JSON</option>
                  </select>
                  
                  {publicId && (
                    <button
                      type="submit"
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
                        setMode("display");
                        handleSubmit(e);
                      }}
                    >
                      表示データ取得
                    </button>
                  )}
                </p>
              </form>

              {response && (
                <div className="nostalgic-section">
                  <p>
                    <span className="nostalgic-section-title">
                      <b>◆APIレスポンス◆</b>
                    </span>
                  </p>
                  <pre style={{ backgroundColor: "#000000", color: "#00ff00", padding: "10px", overflow: "auto", fontSize: "14px" }}>
                    {response}
                  </pre>
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
                https://nostalgic.llll-ll.com/api/visit?action=create&url=<span style={{ color: "#008000" }}>サイトURL</span>
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
                    type="submit"
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
                    公開ID確認
                  </button>
                </p>
              </form>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆カウンター値を設定したいときは？◆</b>
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
                https://nostalgic.llll-ll.com/api/visit?action=set&url=<span style={{ color: "#008000" }}>サイトURL</span>
                &token=<span style={{ color: "#008000" }}>オーナートークン</span>&total=<span style={{ color: "#008000" }}>数値</span>
              </p>
              <hr style={{ margin: "20px 0", border: "1px dashed #ccc" }} />
              
              <p>または、以下のフォームで設定できます。</p>
              
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
                  <b>設定値：</b>
                  <input
                    ref={valueRef}
                    type="number"
                    min="0"
                    placeholder="0"
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
                    type="submit"
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
                      setMode("set");
                      handleSubmit(e);
                    }}
                  >
                    値設定
                  </button>
                </p>
              </form>

              {response && (
                <div className="nostalgic-section">
                  <p>
                    <span className="nostalgic-section-title">
                      <b>◆APIレスポンス◆</b>
                    </span>
                  </p>
                  <pre style={{ backgroundColor: "#000000", color: "#00ff00", padding: "10px", overflow: "auto", fontSize: "14px" }}>
                    {response}
                  </pre>
                </div>
              )}
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆カウンターを手動カウントアップしたいときは？◆</b>
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
                https://nostalgic.llll-ll.com/api/visit?action=increment&id=<span style={{ color: "#008000" }}>公開ID</span>
              </p>
              <hr style={{ margin: "20px 0", border: "1px dashed #ccc" }} />
              
              <p>または、以下のフォームでカウントアップできます。</p>
              <p style={{ color: "#666", fontSize: "14px" }}>
                ※Web Componentsを使用している場合は自動でカウントされるため、通常は不要です。
              </p>
              
              <form onSubmit={handleSubmit} style={{ marginTop: "10px" }}>
                <p>
                  <b>公開ID：</b>
                  <span style={{ marginLeft: "10px", fontFamily: "monospace", fontSize: "16px", fontWeight: "bold", color: publicId ? "#008000" : "#999" }}>
                    {publicId || "STEP 1で作成後に表示されます"}
                  </span>
                  {publicId && (
                    <button
                      type="submit"
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
                        setMode("increment");
                        handleSubmit(e);
                      }}
                    >
                      手動カウントアップ
                    </button>
                  )}
                </p>
              </form>

              {response && (
                <div className="nostalgic-section">
                  <p>
                    <span className="nostalgic-section-title">
                      <b>◆APIレスポンス◆</b>
                    </span>
                  </p>
                  <pre style={{ backgroundColor: "#000000", color: "#00ff00", padding: "10px", overflow: "auto", fontSize: "14px" }}>
                    {response}
                  </pre>
                </div>
              )}
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆カウンターを削除したいときは？◆</b>
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
                https://nostalgic.llll-ll.com/api/visit?action=delete&url=<span style={{ color: "#008000" }}>サイトURL</span>
                &token=<span style={{ color: "#008000" }}>オーナートークン</span>
              </p>
              <hr style={{ margin: "20px 0", border: "1px dashed #ccc" }} />
              
              <p>または、以下のフォームで削除できます。</p>
              <p style={{ color: "#ff0000", fontWeight: "bold" }}>
                ※削除すると復元できません。十分にご注意ください。
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
                    type="submit"
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
                    削除
                  </button>
                </p>
              </form>

              {response && (
                <div className="nostalgic-section">
                  <p>
                    <span className="nostalgic-section-title">
                      <b>◆APIレスポンス◆</b>
                    </span>
                  </p>
                  <pre style={{ backgroundColor: "#000000", color: "#00ff00", padding: "10px", overflow: "auto", fontSize: "14px" }}>
                    {response}
                  </pre>
                </div>
              )}
            </div>

            {publicId && (
              <div className="nostalgic-counter-section">
                <p>
                  <span style={{ color: "#ff8c00" }}>
                    <b>◆カウンター設置方法◆</b>
                  </span>
                </p>
                <p>公開ID: <span style={{ backgroundColor: "#ffff00", padding: "2px 4px", fontFamily: "monospace" }}>{publicId}</span></p>
                <p style={{ backgroundColor: "#f0f0f0", padding: "10px", fontFamily: "monospace", fontSize: "14px", wordBreak: "break-all" }}>
{`<script src="https://nostalgic.llll-ll.com/components/visit.js"></script>
<nostalgic-counter id="${publicId}" type="total" theme="dark"></nostalgic-counter>`}
                </p>
                <p>表示URL:</p>
                <p style={{ backgroundColor: "#f0f0f0", padding: "10px", fontFamily: "monospace", fontSize: "14px", wordBreak: "break-all" }}>
                  {`https://nostalgic.llll-ll.com/api/visit?action=display&id=${publicId}&type=total&theme=dark`}
                </p>
              </div>
            )}

            <hr />

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
              ★ Nostalgic Counter ★
              <br />
              機能一覧
            </div>

            <div className="nostalgic-marquee-box">
              <div className="nostalgic-marquee-text">
                懐かしのアクセスカウンターがここに復活！累計・今日・昨日・週間・月間のカウントを表示できます！
              </div>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆基本機能◆</b>
                </span>
              </p>
              <p>
                <span>●</span> 累計・日別・週別・月別カウント
                <br />
                <span>●</span> 24時間重複カウント防止
                <br />
                <span>●</span> 3種類のデザインテーマ
                <br />
                <span>●</span> Web Componentsで簡単設置
              </p>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆管理機能◆</b>
                </span>
              </p>
              <p>
                <span>●</span> バレてはいけない「オーナートークン」で安全管理
                <br />
                <span>●</span> バレてもかまわない「公開ID」で表示専用アクセス
                <br />
                <span>●</span> カウンター値の手動設定（
                <span style={{ textDecoration: "line-through" }}>訪問者数を水増し可能</span> リセットされても再開可能）
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
                • Redis でデータ保存
                <br />
                • SVG画像で美しい表示
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
        name="Nostalgic Counter"
        description="懐かしいアクセスカウンターサービス。24時間重複防止機能付き、累計・日別・週別・月別カウントに対応。"
        url="https://nostalgic.llll-ll.com/counter"
        serviceType="Web Counter Service"
      />
      <BreadcrumbStructuredData 
        items={[
          { name: "Nostalgic", url: "https://nostalgic.llll-ll.com" },
          { name: "Counter", url: "https://nostalgic.llll-ll.com/counter" }
        ]}
      />
      
      <NostalgicLayout serviceName="Counter" serviceIcon="📊">
        {renderContent()}
      </NostalgicLayout>
    </>
  );
}