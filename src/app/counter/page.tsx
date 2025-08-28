"use client";

import { useState, useEffect } from "react";
import NostalgicLayout from "@/components/NostalgicLayout";
import { ServiceStructuredData, BreadcrumbStructuredData } from "@/components/StructuredData";
import ResponseDisplay from "@/components/ResponseDisplay";
import ApiUrlDisplay, { GreenParam } from "@/components/ApiUrlDisplay";

export default function CounterPage() {
  const [currentPage, setCurrentPage] = useState("features");
  const [response, setResponse] = useState("");
  const [publicId, setPublicId] = useState("");
  const [responseType, setResponseType] = useState<'json' | 'text' | 'svg'>('json');
  
  // 全フォーム共通のstate
  const [sharedUrl, setSharedUrl] = useState("");
  const [sharedToken, setSharedToken] = useState("");

  // URLとTokenはcontrolled componentsで管理するのでref不要
  
  // Webhook URLの状態管理用
  const [webhookUrl, setWebhookUrl] = useState("");
  
  // 表示フォームの選択値
  const [selectedType, setSelectedType] = useState("total");
  const [selectedFormat, setSelectedFormat] = useState("svg");
  
  // 設定値
  const [setValue, setSetValue] = useState("");
  
  // 各フォーム用の独立したレスポンスstate
  const [createResponse, setCreateResponse] = useState("");
  const [displayResponse, setDisplayResponse] = useState("");
  const [setValueResponse, setSetValueResponse] = useState("");
  const [incrementResponse, setIncrementResponse] = useState("");
  const [deleteResponse, setDeleteResponse] = useState("");
  const [updateSettingsResponse, setUpdateSettingsResponse] = useState("");
  
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharedUrl || !sharedToken) return;

    let apiUrl = `/api/visit?action=create&url=${encodeURIComponent(sharedUrl)}&token=${encodeURIComponent(sharedToken)}`;
    if (webhookUrl) {
      apiUrl += `&webhookUrl=${encodeURIComponent(webhookUrl)}`;
    }

    try {
      const res = await fetch(apiUrl, { method: 'GET' });
      const contentType = res.headers.get('content-type');
      let responseText = '';
      
      if (contentType && contentType.includes('application/json')) {
        const jsonResponse = await res.json();
        responseText = JSON.stringify(jsonResponse, null, 2);
        if (jsonResponse.data?.id) {
          setPublicId(jsonResponse.data.id);
        }
      } else {
        responseText = await res.text();
      }
      
      setCreateResponse(responseText);
    } catch (error) {
      setCreateResponse(`エラー: ${error}`);
    }
  };

  const handleDisplay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicId) return;

    const apiUrl = `/api/visit?action=display&id=${encodeURIComponent(publicId)}&type=${selectedType}&format=${selectedFormat}`;
    setResponseType(selectedFormat as 'json' | 'text' | 'svg');

    try {
      const res = await fetch(apiUrl, { method: 'GET' });
      let responseText = '';
      
      if (selectedFormat === "svg") {
        responseText = await res.text();
      } else {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const jsonResponse = await res.json();
          responseText = JSON.stringify(jsonResponse, null, 2);
        } else {
          responseText = await res.text();
        }
      }
      
      setDisplayResponse(responseText);
    } catch (error) {
      setDisplayResponse(`エラー: ${error}`);
    }
  };

  const handleSet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharedUrl || !sharedToken || !setValue) return;

    const apiUrl = `/api/visit?action=set&url=${encodeURIComponent(sharedUrl)}&token=${encodeURIComponent(sharedToken)}&total=${setValue}`;

    try {
      const res = await fetch(apiUrl, { method: 'GET' });
      const contentType = res.headers.get('content-type');
      let responseText = '';
      
      if (contentType && contentType.includes('application/json')) {
        const jsonResponse = await res.json();
        responseText = JSON.stringify(jsonResponse, null, 2);
      } else {
        responseText = await res.text();
      }
      
      setSetValueResponse(responseText);
    } catch (error) {
      setSetValueResponse(`エラー: ${error}`);
    }
  };

  const handleIncrement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicId) return;

    const apiUrl = `/api/visit?action=increment&id=${encodeURIComponent(publicId)}`;

    try {
      const res = await fetch(apiUrl, { method: 'GET' });
      const contentType = res.headers.get('content-type');
      let responseText = '';
      
      if (contentType && contentType.includes('application/json')) {
        const jsonResponse = await res.json();
        responseText = JSON.stringify(jsonResponse, null, 2);
      } else {
        responseText = await res.text();
      }
      
      setIncrementResponse(responseText);
    } catch (error) {
      setIncrementResponse(`エラー: ${error}`);
    }
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharedUrl || !sharedToken) return;

    const apiUrl = `/api/visit?action=delete&url=${encodeURIComponent(sharedUrl)}&token=${encodeURIComponent(sharedToken)}`;

    try {
      const res = await fetch(apiUrl, { method: 'GET' });
      const contentType = res.headers.get('content-type');
      let responseText = '';
      
      if (contentType && contentType.includes('application/json')) {
        const jsonResponse = await res.json();
        responseText = JSON.stringify(jsonResponse, null, 2);
      } else {
        responseText = await res.text();
      }
      
      setDeleteResponse(responseText);
    } catch (error) {
      setDeleteResponse(`エラー: ${error}`);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharedUrl || !sharedToken) return;

    let apiUrl = `/api/visit?action=updateSettings&url=${encodeURIComponent(sharedUrl)}&token=${encodeURIComponent(sharedToken)}`;
    if (webhookUrl) {
      apiUrl += `&webhookUrl=${encodeURIComponent(webhookUrl)}`;
    }

    try {
      const res = await fetch(apiUrl, { method: 'GET' });
      const contentType = res.headers.get('content-type');
      let responseText = '';
      
      if (contentType && contentType.includes('application/json')) {
        const jsonResponse = await res.json();
        responseText = JSON.stringify(jsonResponse, null, 2);
      } else {
        responseText = await res.text();
      }
      
      setUpdateSettingsResponse(responseText);
    } catch (error) {
      setUpdateSettingsResponse(`エラー: ${error}`);
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
              <ApiUrlDisplay url={`https://nostalgic.llll-ll.com/api/visit?action=create&url=${encodeURIComponent(sharedUrl || "サイトURL")}&token=${encodeURIComponent(sharedToken || "オーナートークン")}${webhookUrl ? `&webhookUrl=${encodeURIComponent(webhookUrl)}` : ""}`}>
                https://nostalgic.llll-ll.com/api/visit?action=create&url=<GreenParam>{sharedUrl || "サイトURL"}</GreenParam>
                &token=<GreenParam>{sharedToken || "オーナートークン"}</GreenParam>
                {webhookUrl && <>&webhookUrl=<GreenParam>{encodeURIComponent(webhookUrl)}</GreenParam></>}
              </ApiUrlDisplay>
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
              
              <form style={{ marginTop: "10px" }}>
                <p>
                  <b>サイトURL：</b>
                  <input
                    value={sharedUrl}
                    onChange={(e) => setSharedUrl(e.target.value)}
                    type="url"
                    placeholder="https://example.com"
                    style={{
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
                    value={sharedToken}
                    onChange={(e) => setSharedToken(e.target.value)}
                    type="text"
                    placeholder="8-16文字"
                    style={{
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
                  <b>Webhook URL（オプション）：</b>
                  <input
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    type="url"
                    placeholder="https://hooks.slack.com/services/..."
                    style={{
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
                      padding: "4px 12px",
                      backgroundColor: "#2196F3",
                      color: "white",
                      border: "2px outset #2196F3",
                      fontSize: "16px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      fontFamily: "inherit"
                    }}
                    onClick={handleCreate}
                  >
                    作成
                  </button>
                </p>
              </form>

              <ResponseDisplay response={createResponse} responseType={responseType} show={!!createResponse} />
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆STEP 2: 表示プレビュー◆</b>
                </span>
              </p>
              <p>ブラウザのアドレスバーに以下のURLを入力してアクセスしてください。</p>
              <ApiUrlDisplay url={`https://nostalgic.llll-ll.com/api/visit?action=display&id=${encodeURIComponent(publicId || "公開ID")}&type=${selectedType}&format=${selectedFormat}`}>
                https://nostalgic.llll-ll.com/api/visit?action=display&id=<GreenParam>{publicId || "公開ID"}</GreenParam>
                &type=<GreenParam>{selectedType}</GreenParam>&format=<GreenParam>{selectedFormat}</GreenParam>
              </ApiUrlDisplay>
              <hr style={{ margin: "20px 0", border: "1px dashed #ccc" }} />
              
              <p>または、以下のフォームでデータを取得できます。</p>
              
              <form style={{ marginTop: "10px" }}>
                <p>
                  <b>公開ID：</b>
                  <input
                    value={publicId}
                    onChange={(e) => setPublicId(e.target.value)}
                    type="text"
                    placeholder="STEP 1で作成後に表示されます"
                    style={{
                      width: "40%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "monospace",
                      fontSize: "16px"
                    }}
                  />
                </p>

                <p>
                  <b>期間タイプ：</b>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    style={{
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
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    style={{
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
                </p>
                <p>
                  <button
                    type="button"
                    style={{
                        padding: "4px 12px",
                      backgroundColor: "#2196F3",
                      color: "white",
                      border: "2px outset #2196F3",
                      fontSize: "16px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      fontFamily: "inherit"
                    }}
                    onClick={handleDisplay}
                  >
                    表示プレビュー
                  </button>
                </p>
              </form>

              <ResponseDisplay response={displayResponse} responseType={responseType} show={!!displayResponse} />
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆STEP 3: カウンター埋め込み◆</b>
                </span>
              </p>
              <p>あなたのサイトのHTMLに以下のコードを追加してください。</p>
              
              {publicId ? (
                <div>
                  <p><b>埋め込みコード:</b></p>
                  <pre style={{ backgroundColor: "#f0f0f0", padding: "10px", overflow: "auto", fontSize: "14px", margin: "10px 0" }}>
{`<script src="https://nostalgic.llll-ll.com/components/visit.js"></script>
<nostalgic-counter id="`}<span style={{ color: "#00AA00" }}>{publicId}</span>{`" type="total" theme="dark"></nostalgic-counter>`}
                  </pre>
                  
                  <p><b>表示URL:</b></p>
                  <pre style={{ backgroundColor: "#f0f0f0", padding: "10px", overflow: "auto", fontSize: "14px", margin: "10px 0" }}>
{`https://nostalgic.llll-ll.com/api/visit?action=display&id=`}<span style={{ color: "#00AA00" }}>{publicId}</span>{`&type=total&theme=dark`}
                  </pre>
                  
                </div>
              ) : (
                <pre style={{ backgroundColor: "#f0f0f0", padding: "10px", overflow: "auto", fontSize: "14px", margin: "10px 0" }}>
                  {`<script src="https://nostalgic.llll-ll.com/components/visit.js"></script>
<nostalgic-counter id="`}
                  <span style={{ color: "#008000" }}>公開ID</span>
                  {`" type="`}
                  <span style={{ color: "#008000" }}>total</span>
                  {`" theme="`}
                  <span style={{ color: "#008000" }}>dark</span>
                  {`"></nostalgic-counter>`}
                </pre>
              )}
              
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
                  • <span style={{ color: "#008000" }}>light</span> - ライトテーマ（明るい背景）
                  <br />• <span style={{ color: "#008000" }}>dark</span> - ダークテーマ（暗い背景）
                  <br />• <span style={{ color: "#008000" }}>kawaii</span> - かわいいテーマ（ピンク系）
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

              <div className="nostalgic-section">
                <p>
                  <span className="nostalgic-section-title">
                    <b>◆このように表示されます◆</b>
                  </span>
                </p>
                {publicId ? (
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
                ) : (
                  <div style={{ textAlign: "center", margin: "20px 0", padding: "20px", backgroundColor: "#f5f5f5", border: "1px solid #ddd" }}>
                    <p style={{ fontSize: "14px", color: "#666" }}>
                      カウンターを作成すると、ここにプレビューが表示されます
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆公開IDを再確認したいときは？◆</b>
                </span>
              </p>
              <p>ブラウザのアドレスバーに以下のURLを入力してアクセスしてください。</p>
              <ApiUrlDisplay url={`https://nostalgic.llll-ll.com/api/visit?action=create&url=${encodeURIComponent(sharedUrl || "サイトURL")}&token=${encodeURIComponent(sharedToken || "オーナートークン")}${webhookUrl ? `&webhookUrl=${encodeURIComponent(webhookUrl)}` : ""}`}>
                https://nostalgic.llll-ll.com/api/visit?action=create&url=<GreenParam>{sharedUrl || "サイトURL"}</GreenParam>
                &token=<GreenParam>{sharedToken || "オーナートークン"}</GreenParam>
                {webhookUrl && <>&webhookUrl=<GreenParam>{encodeURIComponent(webhookUrl)}</GreenParam></>}
              </ApiUrlDisplay>
              <hr style={{ margin: "20px 0", border: "1px dashed #ccc" }} />
              
              <p>または、以下のフォームで確認できます。</p>
              
              <form style={{ marginTop: "10px" }}>
                <p>
                  <b>サイトURL：</b>
                  <input
                    value={sharedUrl}
                    onChange={(e) => setSharedUrl(e.target.value)}
                    type="url"
                    placeholder="https://example.com"
                    style={{
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
                    value={sharedToken}
                    onChange={(e) => setSharedToken(e.target.value)}
                    type="text"
                    placeholder="8-16文字"
                    style={{
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
                  <button
                    type="button"
                    style={{
                      padding: "4px 12px",
                      backgroundColor: "#2196F3",
                      color: "white",
                      border: "2px outset #2196F3",
                      fontSize: "16px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      fontFamily: "inherit"
                    }}
                    onClick={handleCreate}
                  >
                    公開ID確認
                  </button>
                </p>
              </form>
            </div>


            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆カウンターを手動カウントアップしたいときは？◆</b>
                </span>
              </p>
              <p>ブラウザのアドレスバーに以下のURLを入力してアクセスしてください。</p>
              <ApiUrlDisplay url={`https://nostalgic.llll-ll.com/api/visit?action=increment&id=${encodeURIComponent(publicId || "公開ID")}`}>
                https://nostalgic.llll-ll.com/api/visit?action=increment&id=<GreenParam>{publicId || "公開ID"}</GreenParam>
              </ApiUrlDisplay>
              <hr style={{ margin: "20px 0", border: "1px dashed #ccc" }} />
              
              <p>または、以下のフォームでカウントアップできます。</p>
              <p style={{ color: "#666", fontSize: "14px" }}>
                ※Web Componentsを使用している場合は自動でカウントされるため、通常は不要です。
              </p>
              
              <form style={{ marginTop: "10px" }}>
                <p>
                  <b>公開ID：</b>
                  <input
                    value={publicId}
                    onChange={(e) => setPublicId(e.target.value)}
                    type="text"
                    placeholder="STEP 1で作成後に表示されます"
                    style={{
                      width: "40%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "monospace",
                      fontSize: "16px"
                    }}
                  />
                </p>
                
                
                <p>
                  <button
                    type="button"
                    style={{
                      padding: "4px 12px",
                      backgroundColor: "#2196F3",
                      color: "white",
                      border: "2px outset #2196F3",
                      fontSize: "16px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      fontFamily: "inherit"
                    }}
                    onClick={handleIncrement}
                  >
                    手動カウントアップ
                  </button>
                </p>
              </form>

              <ResponseDisplay response={incrementResponse} responseType={responseType} show={!!incrementResponse} />
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆カウンター値を設定したいときは？◆</b>
                </span>
              </p>
              <p>ブラウザのアドレスバーに以下のURLを入力してアクセスしてください。</p>
              <ApiUrlDisplay url={`https://nostalgic.llll-ll.com/api/visit?action=set&url=${encodeURIComponent(sharedUrl || "サイトURL")}&token=${encodeURIComponent(sharedToken || "オーナートークン")}&total=${setValue || "数値"}`}>
                https://nostalgic.llll-ll.com/api/visit?action=set&url=<GreenParam>{sharedUrl || "サイトURL"}</GreenParam>
                &token=<GreenParam>{sharedToken || "オーナートークン"}</GreenParam>&total=<GreenParam>{setValue || "数値"}</GreenParam>
              </ApiUrlDisplay>
              <hr style={{ margin: "20px 0", border: "1px dashed #ccc" }} />
              
              <p>または、以下のフォームで設定できます。</p>
              
              <form style={{ marginTop: "10px" }}>
                <p>
                  <b>サイトURL：</b>
                  <input
                    value={sharedUrl}
                    onChange={(e) => setSharedUrl(e.target.value)}
                    type="url"
                    placeholder="https://example.com"
                    style={{
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
                    value={sharedToken}
                    onChange={(e) => setSharedToken(e.target.value)}
                    type="text"
                    placeholder="8-16文字"
                    style={{
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
                  <b>数値：</b>
                  <input
                    value={setValue}
                    onChange={(e) => setSetValue(e.target.value)}
                    type="number"
                    min="0"
                    placeholder="0"
                    style={{
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
                  <b>Webhook URL（オプション）：</b>
                  <input
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    type="url"
                    placeholder="https://hooks.slack.com/services/..."
                    style={{
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
                      padding: "4px 12px",
                      backgroundColor: "#2196F3",
                      color: "white",
                      border: "2px outset #2196F3",
                      fontSize: "16px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      fontFamily: "inherit"
                    }}
                    onClick={handleSet}
                  >
                    値設定
                  </button>
                </p>
              </form>

              <ResponseDisplay response={setValueResponse} responseType={responseType} show={!!setValueResponse} />
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆設定更新◆</b>
                </span>
              </p>
              <p>カウンターの設定を更新します。</p>
              
              <p>ブラウザのアドレスバーに以下のURLを入力してアクセスしてください。</p>
              <ApiUrlDisplay url={`https://nostalgic.llll-ll.com/api/visit?action=updateSettings&url=${encodeURIComponent(sharedUrl || "サイトURL")}&token=${encodeURIComponent(sharedToken || "オーナートークン")}${webhookUrl ? `&webhookUrl=${encodeURIComponent(webhookUrl)}` : ""}`}>
                https://nostalgic.llll-ll.com/api/visit?action=updateSettings&url=<GreenParam>{sharedUrl || "サイトURL"}</GreenParam>
                &token=<GreenParam>{sharedToken || "オーナートークン"}</GreenParam>
                {webhookUrl && <>&webhookUrl=<GreenParam>{webhookUrl}</GreenParam></>}
              </ApiUrlDisplay>
              <hr style={{ margin: "20px 0", border: "1px dashed #ccc" }} />
              
              <p>または、以下のフォームで更新できます。</p>
              
              <form style={{ marginTop: "10px" }}>
                <p>
                  <b>サイトURL：</b>
                  <input
                    value={sharedUrl}
                    onChange={(e) => setSharedUrl(e.target.value)}
                    type="url"
                    placeholder="https://example.com"
                    style={{
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
                    value={sharedToken}
                    onChange={(e) => setSharedToken(e.target.value)}
                    type="text"
                    placeholder="8-16文字"
                    style={{
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
                  <b>Webhook URL（オプション）：</b>
                  <input
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    type="url"
                    placeholder="https://example.com/webhook"
                    style={{
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
                      padding: "4px 12px",
                      backgroundColor: "#2196F3",
                      color: "white",
                      border: "2px outset #2196F3",
                      fontSize: "16px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      fontFamily: "inherit"
                    }}
                    onClick={handleUpdateSettings}
                  >
                    設定更新
                  </button>
                </p>
              </form>

              <ResponseDisplay response={updateSettingsResponse} responseType={responseType} show={!!updateSettingsResponse} />
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆カウンターを削除したいときは？◆</b>
                </span>
              </p>
              <p>ブラウザのアドレスバーに以下のURLを入力してアクセスしてください。</p>
              <ApiUrlDisplay url={`https://nostalgic.llll-ll.com/api/visit?action=delete&url=${encodeURIComponent(sharedUrl || "サイトURL")}&token=${encodeURIComponent(sharedToken || "オーナートークン")}`}>
                https://nostalgic.llll-ll.com/api/visit?action=delete&url=<GreenParam>{sharedUrl || "サイトURL"}</GreenParam>
                &token=<GreenParam>{sharedToken || "オーナートークン"}</GreenParam>
              </ApiUrlDisplay>
              <hr style={{ margin: "20px 0", border: "1px dashed #ccc" }} />
              
              <p>または、以下のフォームで削除できます。</p>
              <p style={{ color: "#ff0000", fontWeight: "bold" }}>
                ※削除すると復元できません。十分にご注意ください。
              </p>
              
              <form style={{ marginTop: "10px" }}>
                <p>
                  <b>サイトURL：</b>
                  <input
                    value={sharedUrl}
                    onChange={(e) => setSharedUrl(e.target.value)}
                    type="url"
                    placeholder="https://example.com"
                    style={{
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
                    value={sharedToken}
                    onChange={(e) => setSharedToken(e.target.value)}
                    type="text"
                    placeholder="8-16文字"
                    style={{
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
                  <button
                    type="button"
                    style={{
                      padding: "4px 12px",
                      backgroundColor: "#F44336",
                      color: "white",
                      border: "2px outset #F44336",
                      fontSize: "16px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      fontFamily: "inherit"
                    }}
                    onClick={handleDelete}
                  >
                    削除
                  </button>
                </p>
              </form>

              <ResponseDisplay response={deleteResponse} responseType={responseType} show={!!deleteResponse} />
            </div>

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

            <p style={{ textAlign: "center", marginTop: "30px" }}>
              <a href="#usage" className="nostalgic-old-link">
                【使い方】へ
              </a>
            </p>

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