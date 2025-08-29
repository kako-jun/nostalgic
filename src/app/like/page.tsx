"use client";

import { useState, useEffect } from "react";
import NostalgicLayout from "@/components/NostalgicLayout";
import { ServiceStructuredData, BreadcrumbStructuredData } from "@/components/StructuredData";
import ResponseDisplay from "@/components/ResponseDisplay";
import ApiUrlDisplay, { GreenParam } from "@/components/ApiUrlDisplay";

export default function LikePage() {
  const [currentPage, setCurrentPage] = useState("features");
  const [publicId, setPublicId] = useState("");
  const [responseType, setResponseType] = useState<'json' | 'text' | 'svg'>('json');
  
  // 全フォーム共通のstate
  const [sharedUrl, setSharedUrl] = useState("");
  const [sharedToken, setSharedToken] = useState("");

  // URLとTokenはcontrolled componentsで管理するのでref不要
  
  // Webhook URLの状態管理用
  const [webhookUrl, setWebhookUrl] = useState("");
  
  // 表示フォームの選択値
  const [selectedFormat, setSelectedFormat] = useState("json");
  
  // 設定値
  const [setValue, setSetValue] = useState("");
  
  // 各フォーム用の独立したレスポンスstate
  const [createResponse, setCreateResponse] = useState("");
  const [displayResponse, setDisplayResponse] = useState("");
  const [toggleResponse, setToggleResponse] = useState("");
  const [getResponse, setGetResponse] = useState("");
  const [setValueResponse, setSetValueResponse] = useState("");
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

    let apiUrl = `/api/like?action=create&url=${encodeURIComponent(sharedUrl)}&token=${encodeURIComponent(sharedToken)}`;
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

    const apiUrl = `/api/like?action=display&id=${encodeURIComponent(publicId)}&format=${selectedFormat}`;
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

  const handleToggle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharedUrl || !sharedToken) return;

    const apiUrl = `/api/like?action=toggle&url=${encodeURIComponent(sharedUrl)}&token=${encodeURIComponent(sharedToken)}`;

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
      
      setToggleResponse(responseText);
    } catch (error) {
      setToggleResponse(`エラー: ${error}`);
    }
  };

  const handleGet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicId) return;

    const apiUrl = `/api/like?action=get&id=${encodeURIComponent(publicId)}`;

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
      
      setGetResponse(responseText);
    } catch (error) {
      setGetResponse(`エラー: ${error}`);
    }
  };

  const handleSet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharedUrl || !sharedToken || !setValue) return;

    const apiUrl = `/api/like?action=set&url=${encodeURIComponent(sharedUrl)}&token=${encodeURIComponent(sharedToken)}&value=${setValue}`;

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

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharedUrl || !sharedToken) return;

    const apiUrl = `/api/like?action=delete&url=${encodeURIComponent(sharedUrl)}&token=${encodeURIComponent(sharedToken)}`;

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

    let apiUrl = `/api/like?action=updateSettings&url=${encodeURIComponent(sharedUrl)}&token=${encodeURIComponent(sharedToken)}`;
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
              ★ Nostalgic Like ★
              <br />
              使い方
            </div>


            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆STEP 1: いいねボタン作成◆</b>
                </span>
              </p>
              <p>ブラウザのアドレスバーに以下のURLを入力してアクセスしてください。</p>
              <ApiUrlDisplay url={`https://nostalgic.llll-ll.com/api/like?action=create&url=${encodeURIComponent(sharedUrl || "サイトURL")}&token=${encodeURIComponent(sharedToken || "オーナートークン")}${webhookUrl ? `&webhookUrl=${encodeURIComponent(webhookUrl)}` : ""}`}>
                https://nostalgic.llll-ll.com/api/like?action=create&url=<GreenParam>{sharedUrl || "サイトURL"}</GreenParam>
                &token=<GreenParam>{sharedToken || "オーナートークン"}</GreenParam>
                {webhookUrl && <>&webhookUrl=<GreenParam>{encodeURIComponent(webhookUrl)}</GreenParam></>}
              </ApiUrlDisplay>
              <p>
                ※サイトURLには、いいねボタンを設置する予定のサイトを指定してください。「https://」から始まっている必要があります。
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
                  <b>◆STEP 2: いいね表示◆</b>
                </span>
              </p>
              <p>ブラウザのアドレスバーに以下のURLを入力してアクセスしてください。</p>
              <ApiUrlDisplay url={`https://nostalgic.llll-ll.com/api/like?action=display&id=${encodeURIComponent(publicId || "公開ID")}&format=${selectedFormat}`}>
                https://nostalgic.llll-ll.com/api/like?action=display&id=<GreenParam>{publicId || "公開ID"}</GreenParam>
                &format=<GreenParam>{selectedFormat}</GreenParam>
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
                    <option value="json">JSON</option>
                    <option value="text">テキスト</option>
                    <option value="svg">SVG画像</option>
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
                    表示データ取得
                  </button>
                </p>
              </form>

              <ResponseDisplay response={displayResponse} responseType={responseType} show={!!displayResponse} />
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆STEP 3: いいねボタン埋め込み◆</b>
                </span>
              </p>
              <p>あなたのサイトのHTMLに以下のコードを追加してください。</p>
              <pre style={{ backgroundColor: "#f0f0f0", padding: "10px", overflow: "auto", fontSize: "14px", margin: "10px 0" }}>
                {`<script src="https://nostalgic.llll-ll.com/components/like.js"></script>
<nostalgic-like id="`}
                <span style={{ color: "#008000" }}>公開ID</span>
                {`" theme="`}
                <span style={{ color: "#008000" }}>dark</span>
                {`" icon="`}
                <span style={{ color: "#008000" }}>heart</span>
                {`"></nostalgic-like>`}
              </pre>
              
              <div className="nostalgic-section">
                <p>
                  <span className="nostalgic-section-title">
                    <b>◆format 表示形式◆</b>
                  </span>
                </p>
                <p>
                  • <span style={{ color: "#008000" }}>interactive</span> - インタラクティブボタン（デフォルト）
                  <br />• <span style={{ color: "#008000" }}>text</span> - 数値のみ表示
                  <br />• <span style={{ color: "#008000" }}>image</span> - SVG画像形式
                </p>
              </div>

              <div className="nostalgic-section">
                <p>
                  <span className="nostalgic-section-title">
                    <b>◆theme デザインテーマ◆</b>
                  </span>
                </p>
                <p>
                  • <span style={{ color: "#008000" }}>light</span> - ライト（白系モノクロ）
                  <br />• <span style={{ color: "#008000" }}>dark</span> - ダーク（黒系モノクロ）
                  <br />• <span style={{ color: "#008000" }}>retro</span> - レトロ（古いコンピュータ画面風）
                  <br />• <span style={{ color: "#008000" }}>kawaii</span> - かわいい（ファンシー系）
                  <br />• <span style={{ color: "#008000" }}>mom</span> - Mother味（緑チェック模様）
                  <br />• <span style={{ color: "#008000" }}>final</span> - FF味（青系）
                </p>
              </div>

              <div className="nostalgic-section">
                <p>
                  <span className="nostalgic-section-title">
                    <b>◆icon アイコンタイプ◆</b>
                  </span>
                </p>
                <p>
                  • <span style={{ color: "#008000" }}>heart</span> - ハート（♥）
                  <br />• <span style={{ color: "#008000" }}>star</span> - スター（★）
                  <br />• <span style={{ color: "#008000" }}>thumb</span> - サムズアップ（👍）
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
      'nostalgic-like': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        id?: string;
        theme?: 'light' | 'dark' | 'retro' | 'kawaii' | 'mom' | 'final';
        icon?: 'heart' | 'star' | 'thumb';
      };
    }
  }
}`}
                </pre>
                <p style={{ fontSize: "14px", color: "#666" }}>
                  ※この設定により、TypeScriptでWeb Componentsを使用してもビルドエラーが発生しません。
                </p>
              </div>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆公開IDを再確認したいときは？◆</b>
                </span>
              </p>
              <p>ブラウザのアドレスバーに以下のURLを入力してアクセスしてください。</p>
              <ApiUrlDisplay url={`https://nostalgic.llll-ll.com/api/like?action=create&url=${encodeURIComponent(sharedUrl || "サイトURL")}&token=${encodeURIComponent(sharedToken || "オーナートークン")}${webhookUrl ? `&webhookUrl=${encodeURIComponent(webhookUrl)}` : ""}`}>
                https://nostalgic.llll-ll.com/api/like?action=create&url=<GreenParam>{sharedUrl || "サイトURL"}</GreenParam>
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
                  <b>◆いいねをトグルしたいときは？◆</b>
                </span>
              </p>
              <p>ブラウザのアドレスバーに以下のURLを入力してアクセスしてください。</p>
              <ApiUrlDisplay url={`https://nostalgic.llll-ll.com/api/like?action=toggle&url=${encodeURIComponent(sharedUrl || "サイトURL")}&token=${encodeURIComponent(sharedToken || "オーナートークン")}`}>
                https://nostalgic.llll-ll.com/api/like?action=toggle&url=<GreenParam>{sharedUrl || "サイトURL"}</GreenParam>
                &token=<GreenParam>{sharedToken || "オーナートークン"}</GreenParam>
              </ApiUrlDisplay>
              <hr style={{ margin: "20px 0", border: "1px dashed #ccc" }} />
              
              <p>または、以下のフォームでトグルできます。</p>
              
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
                    onClick={handleToggle}
                  >
                    いいねトグル
                  </button>
                </p>
              </form>

              <ResponseDisplay response={toggleResponse} responseType={responseType} show={!!toggleResponse} />
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆いいねデータを取得したいときは？◆</b>
                </span>
              </p>
              <p>ブラウザのアドレスバーに以下のURLを入力してアクセスしてください。</p>
              <ApiUrlDisplay url={`https://nostalgic.llll-ll.com/api/like?action=get&id=${encodeURIComponent(publicId || "公開ID")}`}>
                https://nostalgic.llll-ll.com/api/like?action=get&id=<GreenParam>{publicId || "公開ID"}</GreenParam>
              </ApiUrlDisplay>
              <hr style={{ margin: "20px 0", border: "1px dashed #ccc" }} />
              
              <p>または、以下のフォームで取得できます。</p>
              
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
                    onClick={handleGet}
                  >
                    データ取得
                  </button>
                </p>
              </form>

              <ResponseDisplay response={getResponse} responseType={responseType} show={!!getResponse} />
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆いいね数を設定したいときは？◆</b>
                </span>
              </p>
              <p>ブラウザのアドレスバーに以下のURLを入力してアクセスしてください。</p>
              <ApiUrlDisplay url={`https://nostalgic.llll-ll.com/api/like?action=set&url=${encodeURIComponent(sharedUrl || "サイトURL")}&token=${encodeURIComponent(sharedToken || "オーナートークン")}&value=${setValue || "数値"}`}>
                https://nostalgic.llll-ll.com/api/like?action=set&url=<GreenParam>{sharedUrl || "サイトURL"}</GreenParam>
                &token=<GreenParam>{sharedToken || "オーナートークン"}</GreenParam>&value=<GreenParam>{setValue || "数値"}</GreenParam>
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
                  <b>設定値：</b>
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
                    いいね数設定
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
              <p>いいねボタンの設定を更新します。</p>
              
              <p>ブラウザのアドレスバーに以下のURLを入力してアクセスしてください。</p>
              <ApiUrlDisplay url={`https://nostalgic.llll-ll.com/api/like?action=updateSettings&url=${encodeURIComponent(sharedUrl || "サイトURL")}&token=${encodeURIComponent(sharedToken || "オーナートークン")}${webhookUrl ? `&webhookUrl=${encodeURIComponent(webhookUrl)}` : ""}`}>
                https://nostalgic.llll-ll.com/api/like?action=updateSettings&url=<GreenParam>{sharedUrl || "サイトURL"}</GreenParam>
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
                  <b>◆いいねを削除したいときは？◆</b>
                </span>
              </p>
              <p>ブラウザのアドレスバーに以下のURLを入力してアクセスしてください。</p>
              <ApiUrlDisplay url={`https://nostalgic.llll-ll.com/api/like?action=delete&url=${encodeURIComponent(sharedUrl || "サイトURL")}&token=${encodeURIComponent(sharedToken || "オーナートークン")}`}>
                https://nostalgic.llll-ll.com/api/like?action=delete&url=<GreenParam>{sharedUrl || "サイトURL"}</GreenParam>
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


            {publicId && (
              <div className="nostalgic-section">
                <p>
                  <span style={{ color: "#ff8c00" }}>
                    <b>◆いいねボタン設置方法◆</b>
                  </span>
                </p>
                <p>公開ID: <span style={{ backgroundColor: "#ffff00", padding: "2px 4px", fontFamily: "monospace" }}>{publicId}</span></p>
                <p style={{ backgroundColor: "#f0f0f0", padding: "10px", fontFamily: "monospace", fontSize: "14px", wordBreak: "break-all" }}>
{`<script src="https://nostalgic.llll-ll.com/components/like.js"></script>
<nostalgic-like id="${publicId}" theme="dark" icon="heart"></nostalgic-like>`}
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
              ★ Nostalgic Like ★
              <br />
              機能一覧
            </div>

            <div className="nostalgic-marquee-box">
              <div className="nostalgic-marquee-text">
                懐かしのいいねボタンがここに復活！ハート・星・サムズアップのアイコンでサイトを盛り上げましょう！
              </div>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆基本機能◆</b>
                </span>
              </p>
              <p>
                <span>●</span> トグル型いいね・いいね取り消し機能
                <br />
                <span>●</span> 24時間ユーザー状態記憶
                <br />
                <span>●</span> 3種類のデザインテーマ
                <br />
                <span>●</span> 3種類のアイコン（ハート・星・サムズアップ）
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
                <span>●</span> いいね数の手動設定（リセットされても再開可能）
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
                • インタラクティブボタンで即座のフィードバック
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
        name="Nostalgic Like"
        description="懐かしいいいねボタンサービス。トグル型いいね・いいね取り消し機能、ユーザー状態管理、3種類のアイコンに対応。"
        url="https://nostalgic.llll-ll.com/like"
        serviceType="Web Like Service"
      />
      <BreadcrumbStructuredData 
        items={[
          { name: "Nostalgic", url: "https://nostalgic.llll-ll.com" },
          { name: "Like", url: "https://nostalgic.llll-ll.com/like" }
        ]}
      />
      
      <NostalgicLayout serviceName="Like" serviceIcon="💖">
        {renderContent()}
      </NostalgicLayout>
    </>
  );
}