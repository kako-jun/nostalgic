import { useState } from "react";
import NostalgicLayout from "../components/NostalgicLayout";
import ResponseDisplay from "../components/ResponseDisplay";
import ApiUrlDisplay, { GreenParam } from "../components/ApiUrlDisplay";
import TabNavigation from "../components/TabNavigation";
import BBSFeaturesTab from "../components/bbs/BBSFeaturesTab";
import useHashNavigation from "../hooks/useHashNavigation";
import { callApi } from "../utils/apiHelpers";

const TABS = [
  { id: "features", label: "機能" },
  { id: "usage", label: "使い方" },
];

export default function BBSPage() {
  const [currentPage, setCurrentPage] = useState(() => {
    const hash = window.location.hash.slice(1);
    return hash || "features";
  });
  const [publicId, setPublicId] = useState("");

  // 全フォーム共通のstate
  const [sharedUrl, setSharedUrl] = useState("");
  const [sharedToken, setSharedToken] = useState("");

  // BBS特有の設定値
  const [webhookUrl, setWebhookUrl] = useState("");
  const [title, setTitle] = useState("");
  const [maxMessages, setMaxMessages] = useState("");
  const [messagesPerPage, setMessagesPerPage] = useState("");

  // 3種類のセレクト設定
  const [standardSelectLabel, setStandardSelectLabel] = useState("");
  const [standardSelectOptions, setStandardSelectOptions] = useState("");
  const [incrementalSelectLabel, setIncrementalSelectLabel] = useState("");
  const [incrementalSelectOptions, setIncrementalSelectOptions] = useState("");
  const [emoteSelectLabel, setEmoteSelectLabel] = useState("");
  const [emoteSelectOptions, setEmoteSelectOptions] = useState("");

  // 投稿フォーム用
  const [postAuthor, setPostAuthor] = useState("");
  const [postMessage, setPostMessage] = useState("");
  const [standardValue, setStandardValue] = useState("");
  const [incrementalValue, setIncrementalValue] = useState("");
  const [emoteValue, setEmoteValue] = useState("");

  // 編集・削除フォーム用
  const [messageId, setMessageId] = useState("");
  const [editAuthor, setEditAuthor] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [editToken, setEditToken] = useState("");
  const [editStandardValue, setEditStandardValue] = useState("");
  const [editIncrementalValue, setEditIncrementalValue] = useState("");
  const [editEmoteValue, setEditEmoteValue] = useState("");

  // 各フォーム用の独立したレスポンスstate
  const [createResponse, setCreateResponse] = useState("");
  const [postResponse, setPostResponse] = useState("");
  const [getResponse, setGetResponse] = useState("");
  const [updateResponse, setUpdateResponse] = useState("");
  const [removeResponse, setRemoveResponse] = useState("");
  const [clearResponse, setClearResponse] = useState("");
  const [deleteResponse, setDeleteResponse] = useState("");
  const [updateSettingsResponse, setUpdateSettingsResponse] = useState("");

  useHashNavigation(currentPage, setCurrentPage);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharedUrl || !sharedToken) return;

    let apiUrl = `/api/bbs?action=create&url=${encodeURIComponent(sharedUrl)}&token=${encodeURIComponent(sharedToken)}`;
    if (maxMessages) apiUrl += `&max=${maxMessages}`;
    if (messagesPerPage) apiUrl += `&perPage=${messagesPerPage}`;
    if (webhookUrl) apiUrl += `&webhookUrl=${encodeURIComponent(webhookUrl)}`;

    // 3種類のセレクト設定を追加
    if (standardSelectLabel && standardSelectOptions) {
      apiUrl += `&standardSelectLabel=${encodeURIComponent(standardSelectLabel)}`;
      apiUrl += `&standardSelectOptions=${encodeURIComponent(standardSelectOptions)}`;
    }
    if (incrementalSelectLabel && incrementalSelectOptions) {
      apiUrl += `&incrementalSelectLabel=${encodeURIComponent(incrementalSelectLabel)}`;
      apiUrl += `&incrementalSelectOptions=${encodeURIComponent(incrementalSelectOptions)}`;
    }
    if (emoteSelectLabel && emoteSelectOptions) {
      apiUrl += `&emoteSelectLabel=${encodeURIComponent(emoteSelectLabel)}`;
      apiUrl += `&emoteSelectOptions=${encodeURIComponent(emoteSelectOptions)}`;
    }

    await callApi(apiUrl, setCreateResponse, setPublicId);
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharedUrl || !sharedToken || !postAuthor || !postMessage) return;

    let apiUrl = `/api/bbs?action=post&url=${encodeURIComponent(sharedUrl)}&token=${encodeURIComponent(sharedToken)}&author=${encodeURIComponent(postAuthor)}&message=${encodeURIComponent(postMessage)}`;

    // セレクト値を追加
    if (standardValue) apiUrl += `&standardValue=${encodeURIComponent(standardValue)}`;
    if (incrementalValue) apiUrl += `&incrementalValue=${encodeURIComponent(incrementalValue)}`;
    if (emoteValue) apiUrl += `&emoteValue=${encodeURIComponent(emoteValue)}`;

    await callApi(apiUrl, setPostResponse);
  };

  const handleGet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicId) return;

    const apiUrl = `/api/bbs?action=get&id=${encodeURIComponent(publicId)}`;

    await callApi(apiUrl, setGetResponse);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharedUrl || !sharedToken || !messageId || !editAuthor || !editMessage) return;

    let apiUrl = `/api/bbs?action=editMessage&url=${encodeURIComponent(sharedUrl)}&token=${encodeURIComponent(sharedToken)}&messageId=${messageId}&author=${encodeURIComponent(editAuthor)}&message=${encodeURIComponent(editMessage)}`;

    // セレクト値を追加
    if (editStandardValue) apiUrl += `&standardValue=${encodeURIComponent(editStandardValue)}`;
    if (editIncrementalValue)
      apiUrl += `&incrementalValue=${encodeURIComponent(editIncrementalValue)}`;
    if (editEmoteValue) apiUrl += `&emoteValue=${encodeURIComponent(editEmoteValue)}`;

    await callApi(apiUrl, setUpdateResponse);
  };

  const handleRemove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharedUrl || !sharedToken || !messageId || !editAuthor) return;

    const apiUrl = `/api/bbs?action=deleteMessage&url=${encodeURIComponent(sharedUrl)}&token=${encodeURIComponent(sharedToken)}&messageId=${messageId}`;

    await callApi(apiUrl, setRemoveResponse);
  };

  const handleClear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharedUrl || !sharedToken) return;

    const apiUrl = `/api/bbs?action=clear&url=${encodeURIComponent(sharedUrl)}&token=${encodeURIComponent(sharedToken)}`;

    await callApi(apiUrl, setClearResponse);
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharedUrl || !sharedToken) return;

    const apiUrl = `/api/bbs?action=delete&url=${encodeURIComponent(sharedUrl)}&token=${encodeURIComponent(sharedToken)}`;

    await callApi(apiUrl, setDeleteResponse);
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharedUrl || !sharedToken) return;

    let apiUrl = `/api/bbs?action=updateSettings&url=${encodeURIComponent(sharedUrl)}&token=${encodeURIComponent(sharedToken)}`;
    if (title) apiUrl += `&title=${encodeURIComponent(title)}`;
    if (maxMessages) apiUrl += `&maxMessages=${maxMessages}`;
    if (messagesPerPage) apiUrl += `&messagesPerPage=${messagesPerPage}`;
    if (standardSelectLabel && standardSelectOptions) {
      apiUrl += `&standardSelectLabel=${encodeURIComponent(standardSelectLabel)}&standardSelectOptions=${encodeURIComponent(standardSelectOptions)}`;
    }
    if (incrementalSelectLabel && incrementalSelectOptions) {
      apiUrl += `&incrementalSelectLabel=${encodeURIComponent(incrementalSelectLabel)}&incrementalSelectOptions=${encodeURIComponent(incrementalSelectOptions)}`;
    }
    if (emoteSelectLabel && emoteSelectOptions) {
      apiUrl += `&emoteSelectLabel=${encodeURIComponent(emoteSelectLabel)}&emoteSelectOptions=${encodeURIComponent(emoteSelectOptions)}`;
    }
    if (webhookUrl) apiUrl += `&webhookUrl=${encodeURIComponent(webhookUrl)}`;

    await callApi(apiUrl, setUpdateSettingsResponse);
  };

  const handleEditMessageById = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharedUrl || !sharedToken || !messageId || !editAuthor || !editMessage || !editToken)
      return;

    let apiUrl = `/api/bbs?action=editMessageById&id=${encodeURIComponent(publicId)}&messageId=${messageId}&author=${encodeURIComponent(editAuthor)}&message=${encodeURIComponent(editMessage)}&editToken=${encodeURIComponent(editToken)}`;

    // セレクト値を追加
    if (editStandardValue) apiUrl += `&standardValue=${encodeURIComponent(editStandardValue)}`;
    if (editIncrementalValue)
      apiUrl += `&incrementalValue=${encodeURIComponent(editIncrementalValue)}`;
    if (editEmoteValue) apiUrl += `&emoteValue=${encodeURIComponent(editEmoteValue)}`;

    await callApi(apiUrl, setUpdateResponse);
  };

  const handleDeleteMessageById = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharedUrl || !sharedToken || !messageId || !editAuthor || !editToken) return;

    const apiUrl = `/api/bbs?action=deleteMessageById&id=${encodeURIComponent(publicId)}&messageId=${messageId}&editToken=${encodeURIComponent(editToken)}`;

    await callApi(apiUrl, setRemoveResponse);
  };

  const renderContent = () => {
    switch (currentPage) {
      case "usage":
        return (
          <>
            <div className="nostalgic-title-bar">
              ★ Nostalgic BBS ★
              <br />
              使い方
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆STEP 1: BBS作成◆</b>
                </span>
              </p>
              <p>ブラウザのアドレスバーに以下のURLを入力してアクセスしてください。</p>
              <ApiUrlDisplay
                url={`https://nostalgic.llll-ll.com/api/bbs?action=create&url=${encodeURIComponent(sharedUrl || "サイトURL")}&token=${encodeURIComponent(sharedToken || "オーナートークン")}${title ? `&title=${encodeURIComponent(title)}` : ""}${maxMessages ? `&max=${maxMessages}` : ""}${messagesPerPage ? `&perPage=${messagesPerPage}` : ""}${standardSelectLabel && standardSelectOptions ? `&standardSelectLabel=${encodeURIComponent(standardSelectLabel)}&standardSelectOptions=${encodeURIComponent(standardSelectOptions)}` : ""}${incrementalSelectLabel && incrementalSelectOptions ? `&incrementalSelectLabel=${encodeURIComponent(incrementalSelectLabel)}&incrementalSelectOptions=${encodeURIComponent(incrementalSelectOptions)}` : ""}${emoteSelectLabel && emoteSelectOptions ? `&emoteSelectLabel=${encodeURIComponent(emoteSelectLabel)}&emoteSelectOptions=${encodeURIComponent(emoteSelectOptions)}` : ""}${webhookUrl ? `&webhookUrl=${encodeURIComponent(webhookUrl)}` : ""}`}
              >
                https://nostalgic.llll-ll.com/api/bbs?action=create&url=
                <GreenParam>{sharedUrl || "サイトURL"}</GreenParam>
                &token=<GreenParam>{sharedToken || "オーナートークン"}</GreenParam>
                {title && (
                  <>
                    &title=<GreenParam>{title}</GreenParam>
                  </>
                )}
                {maxMessages && (
                  <>
                    &max=<GreenParam>{maxMessages}</GreenParam>
                  </>
                )}
                {messagesPerPage && (
                  <>
                    &perPage=<GreenParam>{messagesPerPage}</GreenParam>
                  </>
                )}
                {standardSelectLabel && standardSelectOptions && (
                  <>
                    &standardSelectLabel=<GreenParam>{standardSelectLabel}</GreenParam>
                    &standardSelectOptions=<GreenParam>{standardSelectOptions}</GreenParam>
                  </>
                )}
                {incrementalSelectLabel && incrementalSelectOptions && (
                  <>
                    &incrementalSelectLabel=<GreenParam>{incrementalSelectLabel}</GreenParam>
                    &incrementalSelectOptions=<GreenParam>{incrementalSelectOptions}</GreenParam>
                  </>
                )}
                {emoteSelectLabel && emoteSelectOptions && (
                  <>
                    &emoteSelectLabel=<GreenParam>{emoteSelectLabel}</GreenParam>
                    &emoteSelectOptions=<GreenParam>{emoteSelectOptions}</GreenParam>
                  </>
                )}
                {webhookUrl && (
                  <>
                    &webhookUrl=<GreenParam>{webhookUrl}</GreenParam>
                  </>
                )}
              </ApiUrlDisplay>
              <p>
                ※サイトURLには、BBSを設置する予定のサイトを指定してください。「https://」から始まっている必要があります。
                <br />
                ※オーナートークンに、
                <span style={{ color: "#ff0000" }}>
                  ほかのサイトでのパスワードを使い回さないでください
                </span>
                。（8-16文字）
              </p>
              <p>
                上記URLにアクセスすると、JSONで公開IDが返されます。この公開IDをSTEP
                2で使用してください。
              </p>

              <hr style={{ margin: "20px 0", border: "1px dashed #ccc" }} />

              <p style={{ marginTop: "20px" }}>または、以下のフォームで簡単に作成できます。</p>

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
                      fontSize: "16px",
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
                      fontSize: "16px",
                    }}
                    required
                  />
                </p>

                <p>
                  <b>BBSタイトル（オプション）：</b>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    type="text"
                    placeholder="マイBBS"
                    style={{
                      width: "40%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px",
                    }}
                  />
                </p>

                <p>
                  <b>最大メッセージ数（オプション）：</b>
                  <input
                    value={maxMessages}
                    onChange={(e) => setMaxMessages(e.target.value)}
                    type="number"
                    min="1"
                    max="1000"
                    placeholder="100"
                    style={{
                      width: "20%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px",
                    }}
                  />
                </p>

                <p>
                  <b>1ページあたりのメッセージ数（オプション）：</b>
                  <input
                    value={messagesPerPage}
                    onChange={(e) => setMessagesPerPage(e.target.value)}
                    type="number"
                    min="1"
                    max="100"
                    placeholder="10"
                    style={{
                      width: "20%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px",
                    }}
                  />
                </p>

                <p>
                  <b>純正セレクト設定（オプション）：</b>
                </p>
                <p style={{ marginLeft: "20px" }}>
                  <b>　ラベル：</b>
                  <input
                    value={standardSelectLabel}
                    onChange={(e) => setStandardSelectLabel(e.target.value)}
                    type="text"
                    placeholder="カテゴリ"
                    style={{
                      width: "30%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px",
                      marginLeft: "10px",
                    }}
                  />
                </p>
                <p style={{ marginLeft: "20px" }}>
                  <b>　選択肢：</b>
                  <input
                    value={standardSelectOptions}
                    onChange={(e) => setStandardSelectOptions(e.target.value)}
                    type="text"
                    placeholder="一般,質問,雑談,報告 (カンマ区切り)"
                    style={{
                      width: "60%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px",
                      marginLeft: "10px",
                    }}
                  />
                </p>

                <p>
                  <b>インクリメンタル検索セレクト設定（オプション）：</b>
                </p>
                <p style={{ marginLeft: "20px" }}>
                  <b>　ラベル：</b>
                  <input
                    value={incrementalSelectLabel}
                    onChange={(e) => setIncrementalSelectLabel(e.target.value)}
                    type="text"
                    placeholder="タグ"
                    style={{
                      width: "30%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px",
                      marginLeft: "10px",
                    }}
                  />
                </p>
                <p style={{ marginLeft: "20px" }}>
                  <b>　選択肢：</b>
                  <input
                    value={incrementalSelectOptions}
                    onChange={(e) => setIncrementalSelectOptions(e.target.value)}
                    type="text"
                    placeholder="JavaScript,TypeScript,React,Vue.js,Angular (カンマ区切り)"
                    style={{
                      width: "60%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px",
                      marginLeft: "10px",
                    }}
                  />
                </p>

                <p>
                  <b>エモートセレクト設定（オプション）：</b>
                </p>
                <p style={{ marginLeft: "20px" }}>
                  <b>　ラベル：</b>
                  <input
                    value={emoteSelectLabel}
                    onChange={(e) => setEmoteSelectLabel(e.target.value)}
                    type="text"
                    placeholder="感情"
                    style={{
                      width: "30%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px",
                      marginLeft: "10px",
                    }}
                  />
                </p>
                <p style={{ marginLeft: "20px" }}>
                  <b>　選択肢：</b>
                  <input
                    value={emoteSelectOptions}
                    onChange={(e) => setEmoteSelectOptions(e.target.value)}
                    type="text"
                    placeholder="😀,😢,😡,😐,🤔,😴,😋,😱 (カンマ区切り)"
                    style={{
                      width: "60%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px",
                      marginLeft: "10px",
                    }}
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
                      fontSize: "16px",
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
                      fontFamily: "inherit",
                    }}
                    onClick={handleCreate}
                  >
                    作成
                  </button>
                </p>
              </form>

              <ResponseDisplay
                response={createResponse}
                responseType="json"
                show={!!createResponse}
              />

              {publicId && (
                <div
                  style={{
                    backgroundColor: "#ffffcc",
                    border: "2px solid #ff0000",
                    padding: "10px",
                    marginTop: "10px",
                    fontSize: "14px",
                  }}
                >
                  <b style={{ color: "#ff0000" }}>✨ 作成成功！</b>
                  <br />
                  あなたの公開ID：
                  <span
                    style={{
                      color: "#008000",
                      fontWeight: "bold",
                      fontSize: "16px",
                      fontFamily: "monospace",
                    }}
                  >
                    {publicId}
                  </span>
                  <br />
                  <small>※この公開IDをSTEP 2で使用してください</small>
                </div>
              )}
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆STEP 2: BBS表示◆</b>
                </span>
              </p>
              <p>ブラウザのアドレスバーに以下のURLを入力してアクセスしてください。</p>
              <ApiUrlDisplay
                url={`https://nostalgic.llll-ll.com/api/bbs?action=get&id=${encodeURIComponent(publicId || "公開ID")}`}
              >
                https://nostalgic.llll-ll.com/api/bbs?action=get&id=
                <GreenParam>{publicId || "公開ID"}</GreenParam>
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
                      fontSize: "16px",
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
                      fontFamily: "inherit",
                    }}
                    onClick={handleGet}
                  >
                    メッセージ取得
                  </button>
                </p>
              </form>

              <ResponseDisplay response={getResponse} responseType="json" show={!!getResponse} />
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆STEP 3: BBS埋め込み◆</b>
                </span>
              </p>
              <p>あなたのサイトのHTMLに以下のコードを追加してください。</p>
              <pre
                style={{
                  backgroundColor: "#f0f0f0",
                  padding: "10px",
                  overflow: "auto",
                  fontSize: "14px",
                  margin: "10px 0",
                }}
              >
                {`<script src="https://nostalgic.llll-ll.com/components/bbs.js"></script>
<nostalgic-bbs id="`}
                <span style={{ color: "#008000" }}>{publicId || "公開ID"}</span>
                {`" theme="`}
                <span style={{ color: "#008000" }}>dark</span>
                {`"></nostalgic-bbs>`}
              </pre>

              <div className="nostalgic-section">
                <p>
                  <span className="nostalgic-section-title">
                    <b>◆theme デザインテーマ◆</b>
                  </span>
                </p>
                <p>
                  • <span style={{ color: "#008000" }}>light</span> - ライト（白系モノクロ）
                  <br />• <span style={{ color: "#008000" }}>dark</span> - ダーク（黒系モノクロ）
                  <br />• <span style={{ color: "#008000" }}>retro</span> -
                  レトロ（古いコンピュータ画面風）
                  <br />• <span style={{ color: "#008000" }}>kawaii</span> -
                  かわいい（ファンシー系）
                  <br />• <span style={{ color: "#008000" }}>mom</span> - Mother味（緑チェック模様）
                  <br />• <span style={{ color: "#008000" }}>final</span> - FF味（青系）
                </p>
              </div>

              <div className="nostalgic-section">
                <p>
                  <span className="nostalgic-section-title">
                    <b>◆TypeScript使用時の設定◆</b>
                  </span>
                </p>
                <p>
                  TypeScriptプロジェクトでWeb Componentsを使用する場合、プロジェクトルートに{" "}
                  <code>types.d.ts</code> ファイルを作成してください。
                </p>
                <pre
                  style={{
                    backgroundColor: "#f0f0f0",
                    padding: "10px",
                    overflow: "auto",
                    fontSize: "12px",
                    margin: "10px 0",
                  }}
                >
                  {`// types.d.ts
import 'react'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'nostalgic-bbs': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        id?: string;
        max?: string;
        theme?: 'light' | 'dark' | 'retro' | 'kawaii' | 'mom' | 'final';
        perPage?: string;
      };
    }
  }
}`}
                </pre>
                <p style={{ fontSize: "14px", color: "#666" }}>
                  ※この設定により、TypeScriptでWeb
                  Componentsを使用してもビルドエラーが発生しません。
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
                    <div
                      style={{
                        backgroundColor: "#f0f0f0",
                        border: "1px solid #ccc",
                        padding: "15px",
                        borderRadius: "4px",
                      }}
                    >
                      <p style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "15px" }}>
                        HTTPリクエストデモ
                      </p>
                      <div style={{ marginBottom: "15px" }}>
                        <p style={{ fontSize: "14px", marginBottom: "10px" }}>
                          BBSメッセージを取得：
                        </p>
                        <button
                          onClick={async () => {
                            try {
                              const response = await fetch(
                                `/api/bbs?action=get&id=${publicId}&page=1`
                              );
                              const data = await response.json();
                              const messages = data.data?.messages || [];
                              const messageText =
                                messages.length > 0
                                  ? messages
                                      .map(
                                        (msg: { author: string; message: string }) =>
                                          `${msg.author}: ${msg.message}`
                                      )
                                      .join("\n")
                                  : "まだメッセージがありません";
                              alert(`BBS メッセージ:\n${messageText}`);
                            } catch (_error) {
                              alert("エラーが発生しました");
                            }
                          }}
                          style={{
                            padding: "8px 16px",
                            backgroundColor: "#2196F3",
                            color: "white",
                            border: "1px solid #7B1FA2",
                            borderRadius: "3px",
                            cursor: "pointer",
                            fontSize: "14px",
                            marginRight: "10px",
                          }}
                        >
                          メッセージ取得
                        </button>
                        <button
                          onClick={async () => {
                            const author = prompt("お名前を入力してください:") || "匿名";
                            const message = prompt("メッセージを入力してください:");
                            if (!message) return;

                            try {
                              const response = await fetch(
                                `/api/bbs?action=post&id=${publicId}&author=${encodeURIComponent(author)}&message=${encodeURIComponent(message)}`
                              );
                              const data = await response.json();
                              alert(
                                data.success ? "メッセージを投稿しました！" : "エラーが発生しました"
                              );
                            } catch (_error) {
                              alert("エラーが発生しました");
                            }
                          }}
                          style={{
                            padding: "8px 16px",
                            backgroundColor: "#2196F3",
                            color: "white",
                            border: "1px solid #1976D2",
                            borderRadius: "3px",
                            cursor: "pointer",
                            fontSize: "14px",
                          }}
                        >
                          テスト投稿
                        </button>
                      </div>
                      <p style={{ fontSize: "12px", color: "#666" }}>
                        ※この例では、Web
                        ComponentsではなくHTTPリクエストを直接送信してBBSと連携しています
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
                    <div
                      style={{
                        backgroundColor: "#fffacd",
                        border: "2px solid #ffa500",
                        padding: "20px",
                        borderRadius: "4px",
                      }}
                    >
                      <p style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "15px" }}>
                        ◆デモ用BBS◆
                      </p>
                      <p style={{ marginBottom: "15px" }}>
                        このデモページのBBS（実際に動作します）：
                      </p>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                          gap: "20px",
                          justifyItems: "center",
                        }}
                      >
                        <div>
                          <p style={{ fontSize: "14px", marginBottom: "10px", fontWeight: "bold" }}>
                            Light
                          </p>
                          <nostalgic-bbs id={publicId} theme="light" />
                        </div>

                        <div>
                          <p style={{ fontSize: "14px", marginBottom: "10px", fontWeight: "bold" }}>
                            Dark
                          </p>
                          <nostalgic-bbs id={publicId} theme="dark" />
                        </div>

                        <div>
                          <p style={{ fontSize: "14px", marginBottom: "10px", fontWeight: "bold" }}>
                            Retro
                          </p>
                          <nostalgic-bbs id={publicId} theme="retro" />
                        </div>

                        <div>
                          <p style={{ fontSize: "14px", marginBottom: "10px", fontWeight: "bold" }}>
                            Kawaii
                          </p>
                          <nostalgic-bbs id={publicId} theme="kawaii" />
                        </div>

                        <div>
                          <p style={{ fontSize: "14px", marginBottom: "10px", fontWeight: "bold" }}>
                            Mother
                          </p>
                          <nostalgic-bbs id={publicId} theme="mom" />
                        </div>

                        <div>
                          <p style={{ fontSize: "14px", marginBottom: "10px", fontWeight: "bold" }}>
                            FF
                          </p>
                          <nostalgic-bbs id={publicId} theme="final" />
                        </div>
                      </div>

                      <p style={{ fontSize: "12px", color: "#666", marginTop: "15px" }}>
                        ※投稿フォームから実際にメッセージを投稿してください！
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
              <ApiUrlDisplay
                url={`https://nostalgic.llll-ll.com/api/bbs?action=create&url=${encodeURIComponent(sharedUrl || "サイトURL")}&token=${encodeURIComponent(sharedToken || "オーナートークン")}${title ? `&title=${encodeURIComponent(title)}` : ""}${messagesPerPage ? `&messagesPerPage=${messagesPerPage}` : ""}${maxMessages ? `&max=${maxMessages}` : ""}${standardSelectLabel ? `&standardSelectLabel=${encodeURIComponent(standardSelectLabel)}` : ""}${standardSelectOptions ? `&standardSelectOptions=${encodeURIComponent(standardSelectOptions)}` : ""}${incrementalSelectLabel ? `&incrementalSelectLabel=${encodeURIComponent(incrementalSelectLabel)}` : ""}${incrementalSelectOptions ? `&incrementalSelectOptions=${encodeURIComponent(incrementalSelectOptions)}` : ""}${emoteSelectLabel ? `&emoteSelectLabel=${encodeURIComponent(emoteSelectLabel)}` : ""}${emoteSelectOptions ? `&emoteSelectOptions=${encodeURIComponent(emoteSelectOptions)}` : ""}${webhookUrl ? `&webhookUrl=${encodeURIComponent(webhookUrl)}` : ""}`}
              >
                https://nostalgic.llll-ll.com/api/bbs?action=create&url=
                <GreenParam>{sharedUrl || "サイトURL"}</GreenParam>
                &token=<GreenParam>{sharedToken || "オーナートークン"}</GreenParam>
                {title && (
                  <>
                    &title=<GreenParam>{title}</GreenParam>
                  </>
                )}
                {messagesPerPage && (
                  <>
                    &messagesPerPage=<GreenParam>{messagesPerPage}</GreenParam>
                  </>
                )}
                {maxMessages && (
                  <>
                    &max=<GreenParam>{maxMessages}</GreenParam>
                  </>
                )}
                {standardSelectLabel && (
                  <>
                    &standardSelectLabel=<GreenParam>{standardSelectLabel}</GreenParam>
                  </>
                )}
                {standardSelectOptions && (
                  <>
                    &standardSelectOptions=<GreenParam>{standardSelectOptions}</GreenParam>
                  </>
                )}
                {incrementalSelectLabel && (
                  <>
                    &incrementalSelectLabel=<GreenParam>{incrementalSelectLabel}</GreenParam>
                  </>
                )}
                {incrementalSelectOptions && (
                  <>
                    &incrementalSelectOptions=<GreenParam>{incrementalSelectOptions}</GreenParam>
                  </>
                )}
                {emoteSelectLabel && (
                  <>
                    &emoteSelectLabel=<GreenParam>{emoteSelectLabel}</GreenParam>
                  </>
                )}
                {emoteSelectOptions && (
                  <>
                    &emoteSelectOptions=<GreenParam>{emoteSelectOptions}</GreenParam>
                  </>
                )}
                {webhookUrl && (
                  <>
                    &webhookUrl=<GreenParam>{webhookUrl}</GreenParam>
                  </>
                )}
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
                      fontSize: "16px",
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
                      fontSize: "16px",
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
                      fontFamily: "inherit",
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
                  <b>◆メッセージ投稿◆</b>
                </span>
              </p>
              <p>ブラウザのアドレスバーに以下のURLを入力してアクセスしてください。</p>
              <ApiUrlDisplay
                url={`https://nostalgic.llll-ll.com/api/bbs?action=post&url=${encodeURIComponent(sharedUrl || "サイトURL")}&token=${encodeURIComponent(sharedToken || "オーナートークン")}&author=${encodeURIComponent(postAuthor || "投稿者名")}&message=${encodeURIComponent(postMessage || "メッセージ")}${standardValue ? `&standardValue=${encodeURIComponent(standardValue)}` : ""}${incrementalValue ? `&incrementalValue=${encodeURIComponent(incrementalValue)}` : ""}${emoteValue ? `&emoteValue=${encodeURIComponent(emoteValue)}` : ""}`}
              >
                https://nostalgic.llll-ll.com/api/bbs?action=post&url=
                <GreenParam>{sharedUrl || "サイトURL"}</GreenParam>
                &token=<GreenParam>{sharedToken || "オーナートークン"}</GreenParam>&author=
                <GreenParam>{postAuthor || "投稿者名"}</GreenParam>&message=
                <GreenParam>{postMessage || "メッセージ"}</GreenParam>
                {standardValue && (
                  <>
                    &standardValue=<GreenParam>{standardValue}</GreenParam>
                  </>
                )}
                {incrementalValue && (
                  <>
                    &incrementalValue=<GreenParam>{incrementalValue}</GreenParam>
                  </>
                )}
                {emoteValue && (
                  <>
                    &emoteValue=<GreenParam>{emoteValue}</GreenParam>
                  </>
                )}
              </ApiUrlDisplay>
              <hr style={{ margin: "20px 0", border: "1px dashed #ccc" }} />

              <p>または、以下のフォームで投稿できます。</p>

              <form style={{ marginTop: "10px" }}>
                <p>
                  <b>サイトURL：</b>
                  <input
                    value={sharedUrl}
                    onChange={(e) => setSharedUrl(e.target.value)}
                    type="url"
                    placeholder="https://example.com"
                    style={{
                      width: "50%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px",
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
                      fontSize: "16px",
                    }}
                    required
                  />
                </p>

                <p>
                  <b>投稿者名：</b>
                  <input
                    value={postAuthor}
                    onChange={(e) => setPostAuthor(e.target.value)}
                    type="text"
                    placeholder="名無し"
                    style={{
                      width: "30%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px",
                    }}
                    required
                  />
                </p>

                <p>
                  <b>メッセージ：</b>
                </p>
                <p>
                  <textarea
                    value={postMessage}
                    onChange={(e) => setPostMessage(e.target.value)}
                    placeholder="メッセージを入力してください"
                    style={{
                      width: "80%",
                      height: "100px",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px",
                    }}
                    required
                  />
                </p>

                <p>
                  <b>純正セレクト（オプション）：</b>
                  <input
                    value={standardValue}
                    onChange={(e) => setStandardValue(e.target.value)}
                    type="text"
                    placeholder="カテゴリ値"
                    style={{
                      width: "30%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px",
                      marginLeft: "10px",
                    }}
                  />
                </p>

                <p>
                  <b>インクリメンタル検索セレクト（オプション）：</b>
                  <input
                    value={incrementalValue}
                    onChange={(e) => setIncrementalValue(e.target.value)}
                    type="text"
                    placeholder="タグ値"
                    style={{
                      width: "30%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px",
                      marginLeft: "10px",
                    }}
                  />
                </p>

                <p>
                  <b>エモートセレクト（オプション）：</b>
                  <input
                    value={emoteValue}
                    onChange={(e) => setEmoteValue(e.target.value)}
                    type="text"
                    placeholder="感情値（絵文字または画像URL）"
                    style={{
                      width: "40%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px",
                      marginLeft: "10px",
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
                      fontFamily: "inherit",
                    }}
                    onClick={handlePost}
                  >
                    投稿
                  </button>
                </p>
              </form>

              <ResponseDisplay response={postResponse} responseType="json" show={!!postResponse} />
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆投稿者が自分のメッセージを編集◆</b>
                </span>
              </p>
              <p>ブラウザのアドレスバーに以下のURLを入力してアクセスしてください。</p>
              <ApiUrlDisplay
                url={`https://nostalgic.llll-ll.com/api/bbs?action=editMessageById&id=${encodeURIComponent(publicId || "公開ID")}&messageId=${encodeURIComponent(messageId || "メッセージID")}&author=${encodeURIComponent(editAuthor || "投稿者名")}&message=${encodeURIComponent(editMessage || "新メッセージ")}&editToken=${encodeURIComponent(editToken || "編集トークン")}${editStandardValue ? `&standardValue=${encodeURIComponent(editStandardValue)}` : ""}${editIncrementalValue ? `&incrementalValue=${encodeURIComponent(editIncrementalValue)}` : ""}${editEmoteValue ? `&emoteValue=${encodeURIComponent(editEmoteValue)}` : ""}`}
              >
                https://nostalgic.llll-ll.com/api/bbs?action=editMessageById&id=
                <GreenParam>{publicId || "公開ID"}</GreenParam>&messageId=
                <GreenParam>{messageId || "メッセージID"}</GreenParam>&author=
                <GreenParam>{editAuthor || "投稿者名"}</GreenParam>&message=
                <GreenParam>{editMessage || "新メッセージ"}</GreenParam>&editToken=
                <GreenParam>{editToken || "編集トークン"}</GreenParam>
                {editStandardValue && (
                  <>
                    &standardValue=<GreenParam>{editStandardValue}</GreenParam>
                  </>
                )}
                {editIncrementalValue && (
                  <>
                    &incrementalValue=<GreenParam>{editIncrementalValue}</GreenParam>
                  </>
                )}
                {editEmoteValue && (
                  <>
                    &emoteValue=<GreenParam>{editEmoteValue}</GreenParam>
                  </>
                )}
              </ApiUrlDisplay>
              <hr style={{ margin: "20px 0", border: "1px dashed #ccc" }} />

              <p>または、以下のフォームで編集できます。</p>

              <form style={{ marginTop: "10px" }}>
                <p>
                  <b>サイトURL：</b>
                  <input
                    value={sharedUrl}
                    onChange={(e) => setSharedUrl(e.target.value)}
                    type="url"
                    placeholder="https://example.com"
                    style={{
                      width: "50%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px",
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
                      fontSize: "16px",
                    }}
                    required
                  />
                </p>

                <p>
                  <b>メッセージID：</b>
                  <input
                    value={messageId}
                    onChange={(e) => setMessageId(e.target.value)}
                    type="text"
                    placeholder="1"
                    style={{
                      width: "20%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px",
                    }}
                    required
                  />
                </p>

                <p>
                  <b>投稿者名：</b>
                  <input
                    value={editAuthor}
                    onChange={(e) => setEditAuthor(e.target.value)}
                    type="text"
                    placeholder="名無し"
                    style={{
                      width: "30%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px",
                    }}
                    required
                  />
                </p>

                <p>
                  <b>新メッセージ：</b>
                </p>
                <p>
                  <textarea
                    value={editMessage}
                    onChange={(e) => setEditMessage(e.target.value)}
                    placeholder="新しいメッセージを入力してください"
                    style={{
                      width: "80%",
                      height: "100px",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px",
                    }}
                    required
                  />
                </p>

                <p>
                  <b>純正セレクト（オプション）：</b>
                  <input
                    value={editStandardValue}
                    onChange={(e) => setEditStandardValue(e.target.value)}
                    type="text"
                    placeholder="カテゴリ値"
                    style={{
                      width: "30%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px",
                      marginLeft: "10px",
                    }}
                  />
                </p>

                <p>
                  <b>インクリメンタル検索セレクト（オプション）：</b>
                  <input
                    value={editIncrementalValue}
                    onChange={(e) => setEditIncrementalValue(e.target.value)}
                    type="text"
                    placeholder="タグ値"
                    style={{
                      width: "30%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px",
                      marginLeft: "10px",
                    }}
                  />
                </p>

                <p>
                  <b>エモートセレクト（オプション）：</b>
                  <input
                    value={editEmoteValue}
                    onChange={(e) => setEditEmoteValue(e.target.value)}
                    type="text"
                    placeholder="感情値（絵文字または画像URL）"
                    style={{
                      width: "40%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px",
                      marginLeft: "10px",
                    }}
                  />
                </p>

                <p>
                  <b>編集トークン：</b>
                  <input
                    value={editToken}
                    onChange={(e) => setEditToken(e.target.value)}
                    type="text"
                    placeholder="編集時に設定したトークン"
                    style={{
                      width: "40%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px",
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
                      fontFamily: "inherit",
                    }}
                    onClick={handleEditMessageById}
                  >
                    編集
                  </button>
                </p>
              </form>

              <ResponseDisplay
                response={updateResponse}
                responseType="json"
                show={!!updateResponse}
              />
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆投稿者が自分のメッセージを削除◆</b>
                </span>
              </p>
              <p>ブラウザのアドレスバーに以下のURLを入力してアクセスしてください。</p>
              <ApiUrlDisplay
                url={`https://nostalgic.llll-ll.com/api/bbs?action=deleteMessageById&id=${encodeURIComponent(publicId || "公開ID")}&messageId=${encodeURIComponent(messageId || "メッセージID")}&editToken=${encodeURIComponent(editToken || "編集トークン")}`}
              >
                https://nostalgic.llll-ll.com/api/bbs?action=deleteMessageById&id=
                <GreenParam>{publicId || "公開ID"}</GreenParam>&messageId=
                <GreenParam>{messageId || "メッセージID"}</GreenParam>&editToken=
                <GreenParam>{editToken || "編集トークン"}</GreenParam>
              </ApiUrlDisplay>
              <hr style={{ margin: "20px 0", border: "1px dashed #ccc" }} />

              <p>または、以下のフォームで削除できます。</p>

              <form style={{ marginTop: "10px" }}>
                <p>
                  <b>サイトURL：</b>
                  <input
                    value={sharedUrl}
                    onChange={(e) => setSharedUrl(e.target.value)}
                    type="url"
                    placeholder="https://example.com"
                    style={{
                      width: "50%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px",
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
                      fontSize: "16px",
                    }}
                    required
                  />
                </p>

                <p>
                  <b>メッセージID：</b>
                  <input
                    value={messageId}
                    onChange={(e) => setMessageId(e.target.value)}
                    type="text"
                    placeholder="1"
                    style={{
                      width: "20%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px",
                    }}
                    required
                  />
                </p>

                <p>
                  <b>投稿者名：</b>
                  <input
                    value={editAuthor}
                    onChange={(e) => setEditAuthor(e.target.value)}
                    type="text"
                    placeholder="名無し"
                    style={{
                      width: "30%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px",
                    }}
                    required
                  />
                </p>

                <p>
                  <b>編集トークン：</b>
                  <input
                    value={editToken}
                    onChange={(e) => setEditToken(e.target.value)}
                    type="text"
                    placeholder="編集時に設定したトークン"
                    style={{
                      width: "40%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px",
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
                      fontFamily: "inherit",
                    }}
                    onClick={handleDeleteMessageById}
                  >
                    削除
                  </button>
                </p>
              </form>

              <ResponseDisplay
                response={removeResponse}
                responseType="json"
                show={!!removeResponse}
              />
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆オーナーがメッセージを編集◆</b>
                </span>
              </p>
              <p>ブラウザのアドレスバーに以下のURLを入力してアクセスしてください。</p>
              <ApiUrlDisplay
                url={`https://nostalgic.llll-ll.com/api/bbs?action=editMessage&url=${encodeURIComponent(sharedUrl || "サイトURL")}&token=${encodeURIComponent(sharedToken || "オーナートークン")}&messageId=${encodeURIComponent(messageId || "メッセージID")}&author=${encodeURIComponent(editAuthor || "投稿者名")}&message=${encodeURIComponent(editMessage || "新メッセージ")}${editStandardValue ? `&standardValue=${encodeURIComponent(editStandardValue)}` : ""}${editIncrementalValue ? `&incrementalValue=${encodeURIComponent(editIncrementalValue)}` : ""}${editEmoteValue ? `&emoteValue=${encodeURIComponent(editEmoteValue)}` : ""}`}
              >
                https://nostalgic.llll-ll.com/api/bbs?action=editMessage&url=
                <GreenParam>{sharedUrl || "サイトURL"}</GreenParam>
                &token=<GreenParam>{sharedToken || "オーナートークン"}</GreenParam>&messageId=
                <GreenParam>{messageId || "メッセージID"}</GreenParam>&author=
                <GreenParam>{editAuthor || "投稿者名"}</GreenParam>&message=
                <GreenParam>{editMessage || "新メッセージ"}</GreenParam>
                {editStandardValue && (
                  <>
                    &standardValue=<GreenParam>{editStandardValue}</GreenParam>
                  </>
                )}
                {editIncrementalValue && (
                  <>
                    &incrementalValue=<GreenParam>{editIncrementalValue}</GreenParam>
                  </>
                )}
                {editEmoteValue && (
                  <>
                    &emoteValue=<GreenParam>{editEmoteValue}</GreenParam>
                  </>
                )}
              </ApiUrlDisplay>
              <hr style={{ margin: "20px 0", border: "1px dashed #ccc" }} />

              <p>または、以下のフォームで編集できます。</p>

              <form style={{ marginTop: "10px" }}>
                <p>
                  <b>サイトURL：</b>
                  <input
                    value={sharedUrl}
                    onChange={(e) => setSharedUrl(e.target.value)}
                    type="url"
                    placeholder="https://example.com"
                    style={{
                      width: "50%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px",
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
                      fontSize: "16px",
                    }}
                    required
                  />
                </p>

                <p>
                  <b>メッセージID：</b>
                  <input
                    value={messageId}
                    onChange={(e) => setMessageId(e.target.value)}
                    type="text"
                    placeholder="1"
                    style={{
                      width: "20%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px",
                    }}
                    required
                  />
                </p>

                <p>
                  <b>投稿者名：</b>
                  <input
                    value={editAuthor}
                    onChange={(e) => setEditAuthor(e.target.value)}
                    type="text"
                    placeholder="名無し"
                    style={{
                      width: "30%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px",
                    }}
                    required
                  />
                </p>

                <p>
                  <b>新しいメッセージ：</b>
                </p>
                <p>
                  <textarea
                    value={editMessage}
                    onChange={(e) => setEditMessage(e.target.value)}
                    placeholder="新しいメッセージを入力してください"
                    style={{
                      width: "80%",
                      height: "100px",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px",
                    }}
                    required
                  />
                </p>

                <p>
                  <b>純正セレクト（オプション）：</b>
                  <input
                    value={editStandardValue}
                    onChange={(e) => setEditStandardValue(e.target.value)}
                    type="text"
                    placeholder="カテゴリ値"
                    style={{
                      width: "30%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px",
                      marginLeft: "10px",
                    }}
                  />
                </p>

                <p>
                  <b>インクリメンタル検索セレクト（オプション）：</b>
                  <input
                    value={editIncrementalValue}
                    onChange={(e) => setEditIncrementalValue(e.target.value)}
                    type="text"
                    placeholder="タグ値"
                    style={{
                      width: "30%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px",
                      marginLeft: "10px",
                    }}
                  />
                </p>

                <p>
                  <b>エモートセレクト（オプション）：</b>
                  <input
                    value={editEmoteValue}
                    onChange={(e) => setEditEmoteValue(e.target.value)}
                    type="text"
                    placeholder="感情値（絵文字または画像URL）"
                    style={{
                      width: "40%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px",
                      marginLeft: "10px",
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
                      fontFamily: "inherit",
                    }}
                    onClick={handleUpdate}
                  >
                    編集
                  </button>
                </p>
              </form>

              <ResponseDisplay
                response={updateResponse}
                responseType="json"
                show={!!updateResponse}
              />
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆オーナーがメッセージを削除◆</b>
                </span>
              </p>
              <p>ブラウザのアドレスバーに以下のURLを入力してアクセスしてください。</p>
              <ApiUrlDisplay
                url={`https://nostalgic.llll-ll.com/api/bbs?action=deleteMessage&url=${encodeURIComponent(sharedUrl || "サイトURL")}&token=${encodeURIComponent(sharedToken || "オーナートークン")}&messageId=${encodeURIComponent(messageId || "メッセージID")}`}
              >
                https://nostalgic.llll-ll.com/api/bbs?action=deleteMessage&url=
                <GreenParam>{sharedUrl || "サイトURL"}</GreenParam>
                &token=<GreenParam>{sharedToken || "オーナートークン"}</GreenParam>&messageId=
                <GreenParam>{messageId || "メッセージID"}</GreenParam>
              </ApiUrlDisplay>
              <hr style={{ margin: "20px 0", border: "1px dashed #ccc" }} />

              <p>または、以下のフォームで削除できます。</p>

              <form style={{ marginTop: "10px" }}>
                <p>
                  <b>サイトURL：</b>
                  <input
                    value={sharedUrl}
                    onChange={(e) => setSharedUrl(e.target.value)}
                    type="url"
                    placeholder="https://example.com"
                    style={{
                      width: "50%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px",
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
                      fontSize: "16px",
                    }}
                    required
                  />
                </p>

                <p>
                  <b>メッセージID：</b>
                  <input
                    value={messageId}
                    onChange={(e) => setMessageId(e.target.value)}
                    type="text"
                    placeholder="1"
                    style={{
                      width: "20%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px",
                    }}
                    required
                  />
                </p>

                <p>
                  <b>投稿者名：</b>
                  <input
                    value={editAuthor}
                    onChange={(e) => setEditAuthor(e.target.value)}
                    type="text"
                    placeholder="名無し"
                    style={{
                      width: "30%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px",
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
                      fontFamily: "inherit",
                    }}
                    onClick={handleRemove}
                  >
                    削除
                  </button>
                </p>
              </form>

              <ResponseDisplay
                response={removeResponse}
                responseType="json"
                show={!!removeResponse}
              />
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆メッセージを全削除◆</b>
                </span>
              </p>
              <p>ブラウザのアドレスバーに以下のURLを入力してアクセスしてください。</p>
              <ApiUrlDisplay
                url={`https://nostalgic.llll-ll.com/api/bbs?action=clear&url=${encodeURIComponent(sharedUrl || "サイトURL")}&token=${encodeURIComponent(sharedToken || "オーナートークン")}`}
              >
                https://nostalgic.llll-ll.com/api/bbs?action=clear&url=
                <GreenParam>{sharedUrl || "サイトURL"}</GreenParam>
                &token=<GreenParam>{sharedToken || "オーナートークン"}</GreenParam>
              </ApiUrlDisplay>
              <hr style={{ margin: "20px 0", border: "1px dashed #ccc" }} />

              <p>または、以下のフォームでクリアできます。</p>
              <p style={{ color: "#ff0000", fontWeight: "bold" }}>
                ※全メッセージが削除されます。十分にご注意ください。
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
                      width: "50%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px",
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
                      fontSize: "16px",
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
                      fontFamily: "inherit",
                    }}
                    onClick={handleClear}
                  >
                    全削除
                  </button>
                </p>
              </form>

              <ResponseDisplay
                response={clearResponse}
                responseType="json"
                show={!!clearResponse}
              />
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆設定更新◆</b>
                </span>
              </p>
              <p>ブラウザのアドレスバーに以下のURLを入力してアクセスしてください。</p>
              <ApiUrlDisplay
                url={`https://nostalgic.llll-ll.com/api/bbs?action=updateSettings&url=${encodeURIComponent(sharedUrl || "サイトURL")}&token=${encodeURIComponent(sharedToken || "オーナートークン")}${title ? `&title=${encodeURIComponent(title)}` : ""}${maxMessages ? `&maxMessages=${maxMessages}` : ""}${messagesPerPage ? `&messagesPerPage=${messagesPerPage}` : ""}${standardSelectLabel && standardSelectOptions ? `&standardSelectLabel=${encodeURIComponent(standardSelectLabel)}&standardSelectOptions=${encodeURIComponent(standardSelectOptions)}` : ""}${incrementalSelectLabel && incrementalSelectOptions ? `&incrementalSelectLabel=${encodeURIComponent(incrementalSelectLabel)}&incrementalSelectOptions=${encodeURIComponent(incrementalSelectOptions)}` : ""}${emoteSelectLabel && emoteSelectOptions ? `&emoteSelectLabel=${encodeURIComponent(emoteSelectLabel)}&emoteSelectOptions=${encodeURIComponent(emoteSelectOptions)}` : ""}${webhookUrl ? `&webhookUrl=${encodeURIComponent(webhookUrl)}` : ""}`}
              >
                https://nostalgic.llll-ll.com/api/bbs?action=updateSettings&url=
                <GreenParam>{sharedUrl || "サイトURL"}</GreenParam>
                &token=<GreenParam>{sharedToken || "オーナートークン"}</GreenParam>
                {title && (
                  <>
                    &title=<GreenParam>{title}</GreenParam>
                  </>
                )}
                {maxMessages && (
                  <>
                    &maxMessages=<GreenParam>{maxMessages}</GreenParam>
                  </>
                )}
                {messagesPerPage && (
                  <>
                    &messagesPerPage=<GreenParam>{messagesPerPage}</GreenParam>
                  </>
                )}
                {standardSelectLabel && standardSelectOptions && (
                  <>
                    &standardSelectLabel=<GreenParam>{standardSelectLabel}</GreenParam>
                    &standardSelectOptions=<GreenParam>{standardSelectOptions}</GreenParam>
                  </>
                )}
                {incrementalSelectLabel && incrementalSelectOptions && (
                  <>
                    &incrementalSelectLabel=<GreenParam>{incrementalSelectLabel}</GreenParam>
                    &incrementalSelectOptions=<GreenParam>{incrementalSelectOptions}</GreenParam>
                  </>
                )}
                {emoteSelectLabel && emoteSelectOptions && (
                  <>
                    &emoteSelectLabel=<GreenParam>{emoteSelectLabel}</GreenParam>
                    &emoteSelectOptions=<GreenParam>{emoteSelectOptions}</GreenParam>
                  </>
                )}
                {webhookUrl && (
                  <>
                    &webhookUrl=<GreenParam>{webhookUrl}</GreenParam>
                  </>
                )}
              </ApiUrlDisplay>
              <hr style={{ margin: "20px 0", border: "1px dashed #ccc" }} />

              <p>または、以下のフォームで設定を更新できます。</p>

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
                      fontSize: "16px",
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
                      fontSize: "16px",
                    }}
                    required
                  />
                </p>

                <p>
                  <b>BBSタイトル（オプション）：</b>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    type="text"
                    placeholder="BBS"
                    style={{
                      width: "40%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px",
                    }}
                  />
                </p>

                <p>
                  <b>最大メッセージ数（オプション）：</b>
                  <input
                    value={maxMessages}
                    onChange={(e) => setMaxMessages(e.target.value)}
                    type="number"
                    min="1"
                    max="10000"
                    placeholder="1000"
                    style={{
                      width: "20%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px",
                    }}
                  />
                </p>

                <p>
                  <b>1ページあたりのメッセージ数（オプション）：</b>
                  <input
                    value={messagesPerPage}
                    onChange={(e) => setMessagesPerPage(e.target.value)}
                    type="number"
                    min="1"
                    max="100"
                    placeholder="10"
                    style={{
                      width: "20%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px",
                    }}
                  />
                </p>

                <p>
                  <b>純正セレクト設定（オプション）：</b>
                </p>
                <p style={{ marginLeft: "20px" }}>
                  <b>　ラベル：</b>
                  <input
                    value={standardSelectLabel}
                    onChange={(e) => setStandardSelectLabel(e.target.value)}
                    type="text"
                    placeholder="カテゴリ"
                    style={{
                      width: "30%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px",
                      marginLeft: "10px",
                    }}
                  />
                </p>
                <p style={{ marginLeft: "20px" }}>
                  <b>　選択肢：</b>
                  <input
                    value={standardSelectOptions}
                    onChange={(e) => setStandardSelectOptions(e.target.value)}
                    type="text"
                    placeholder="一般,質問,雑談,報告 (カンマ区切り)"
                    style={{
                      width: "60%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px",
                      marginLeft: "10px",
                    }}
                  />
                </p>

                <p>
                  <b>インクリメンタル検索セレクト設定（オプション）：</b>
                </p>
                <p style={{ marginLeft: "20px" }}>
                  <b>　ラベル：</b>
                  <input
                    value={incrementalSelectLabel}
                    onChange={(e) => setIncrementalSelectLabel(e.target.value)}
                    type="text"
                    placeholder="タグ"
                    style={{
                      width: "30%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px",
                      marginLeft: "10px",
                    }}
                  />
                </p>
                <p style={{ marginLeft: "20px" }}>
                  <b>　選択肢：</b>
                  <input
                    value={incrementalSelectOptions}
                    onChange={(e) => setIncrementalSelectOptions(e.target.value)}
                    type="text"
                    placeholder="JavaScript,TypeScript,React,Vue.js,Angular (カンマ区切り)"
                    style={{
                      width: "60%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px",
                      marginLeft: "10px",
                    }}
                  />
                </p>

                <p>
                  <b>エモートセレクト設定（オプション）：</b>
                </p>
                <p style={{ marginLeft: "20px" }}>
                  <b>　ラベル：</b>
                  <input
                    value={emoteSelectLabel}
                    onChange={(e) => setEmoteSelectLabel(e.target.value)}
                    type="text"
                    placeholder="感情"
                    style={{
                      width: "30%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px",
                      marginLeft: "10px",
                    }}
                  />
                </p>
                <p style={{ marginLeft: "20px" }}>
                  <b>　選択肢：</b>
                  <input
                    value={emoteSelectOptions}
                    onChange={(e) => setEmoteSelectOptions(e.target.value)}
                    type="text"
                    placeholder="😀,😢,😡,😐,🤔,😴,😋,😱 (カンマ区切り)"
                    style={{
                      width: "60%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px",
                      marginLeft: "10px",
                    }}
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
                      fontSize: "16px",
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
                      fontFamily: "inherit",
                    }}
                    onClick={handleUpdateSettings}
                  >
                    設定更新
                  </button>
                </p>
              </form>

              <ResponseDisplay
                response={updateSettingsResponse}
                responseType="json"
                show={!!updateSettingsResponse}
              />
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆BBSを削除◆</b>
                </span>
              </p>
              <p>ブラウザのアドレスバーに以下のURLを入力してアクセスしてください。</p>
              <ApiUrlDisplay
                url={`https://nostalgic.llll-ll.com/api/bbs?action=delete&url=${encodeURIComponent(sharedUrl || "サイトURL")}&token=${encodeURIComponent(sharedToken || "オーナートークン")}`}
              >
                https://nostalgic.llll-ll.com/api/bbs?action=delete&url=
                <GreenParam>{sharedUrl || "サイトURL"}</GreenParam>
                &token=<GreenParam>{sharedToken || "オーナートークン"}</GreenParam>
              </ApiUrlDisplay>
              <hr style={{ margin: "20px 0", border: "1px dashed #ccc" }} />

              <p>または、以下のフォームで削除できます。</p>
              <p style={{ color: "#ff0000", fontWeight: "bold" }}>
                ※BBSが完全に削除され復元できません。十分にご注意ください。
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
                      width: "50%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px",
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
                      fontSize: "16px",
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
                      fontFamily: "inherit",
                    }}
                    onClick={handleDelete}
                  >
                    完全削除
                  </button>
                </p>
              </form>

              <ResponseDisplay
                response={deleteResponse}
                responseType="json"
                show={!!deleteResponse}
              />
            </div>

            <hr />

            <p style={{ textAlign: "center" }}>
              これ以上の詳しい説明は{" "}
              <a
                href="https://github.com/kako-jun/nostalgic/blob/main/README_ja.md"
                className="nostalgic-old-link"
              >
                【GitHub】
              </a>{" "}
              へ
            </p>
          </>
        );

      case "features":
        return <BBSFeaturesTab />;

      default:
        return null;
    }
  };

  return (
    <NostalgicLayout serviceName="BBS" serviceIcon="💬">
      <TabNavigation tabs={TABS} currentTab={currentPage} onTabChange={setCurrentPage} />
      {renderContent()}
    </NostalgicLayout>
  );
}
