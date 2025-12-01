import { GreenParam } from "../components/ApiUrlDisplay";

export const getCounterFormSections = (
  sharedUrl: string,
  setSharedUrl: (v: string) => void,
  sharedToken: string,
  setSharedToken: (v: string) => void,
  publicId: string,
  setPublicId: (v: string) => void,
  webhookUrl: string,
  setWebhookUrl: (v: string) => void,
  selectedType: string,
  setSelectedType: (v: string) => void,
  selectedFormat: string,
  setSelectedFormat: (v: string) => void,
  handlers: {
    handleCreate: (e: React.FormEvent) => void;
    handleDisplay: (e: React.FormEvent) => void;
    handleIncrement: (e: React.FormEvent) => void;
    handleGet: (e: React.FormEvent) => void;
    handleClear: (e: React.FormEvent) => void;
    handleUpdateSettings: (e: React.FormEvent) => void;
    handleDelete: (e: React.FormEvent) => void;
  },
  responses: {
    createResponse: string;
    displayResponse: string;
    incrementResponse: string;
    getResponse: string;
    clearResponse: string;
    updateSettingsResponse: string;
    deleteResponse: string;
  },
  responseType: "json" | "text" | "svg"
) => [
  // Display
  {
    title: "◆STEP 2: 表示プレビュー◆",
    apiUrl: `https://nostalgic.llll-ll.com/api/visit?action=display&id=${encodeURIComponent(publicId || "公開ID")}&type=${selectedType}&format=${selectedFormat}`,
    apiUrlDisplay: (
      <>
        https://nostalgic.llll-ll.com/api/visit?action=display&id=
        <GreenParam>{publicId || "公開ID"}</GreenParam>
        &type=<GreenParam>{selectedType}</GreenParam>&format=
        <GreenParam>{selectedFormat}</GreenParam>
      </>
    ),
    fields: [
      {
        name: "publicId",
        label: "公開ID",
        type: "text" as const,
        placeholder: "STEP 1で作成後に表示されます",
        width: "40%",
        value: publicId,
        onChange: setPublicId,
      },
      {
        name: "type",
        label: "カウント方式",
        type: "select" as const,
        width: "30%",
        value: selectedType,
        onChange: setSelectedType,
        options: [
          { value: "page", label: "ページビュー" },
          { value: "unique", label: "ユニーク訪問者" },
        ],
      },
      {
        name: "format",
        label: "形式",
        type: "select" as const,
        width: "30%",
        value: selectedFormat,
        onChange: setSelectedFormat,
        options: [
          { value: "json", label: "JSON" },
          { value: "text", label: "テキスト" },
          { value: "svg", label: "SVG画像" },
        ],
      },
    ],
    buttonText: "表示データ取得",
    onSubmit: handlers.handleDisplay,
    response: responses.displayResponse,
    responseType,
  },
  // Increment
  {
    title: "◆カウントを増やしたいときは？◆",
    apiUrl: `https://nostalgic.llll-ll.com/api/visit?action=increment&url=${encodeURIComponent(sharedUrl || "サイトURL")}&token=${encodeURIComponent(sharedToken || "オーナートークン")}`,
    apiUrlDisplay: (
      <>
        https://nostalgic.llll-ll.com/api/visit?action=increment&url=
        <GreenParam>{sharedUrl || "サイトURL"}</GreenParam>
        &token=<GreenParam>{sharedToken || "オーナートークン"}</GreenParam>
      </>
    ),
    fields: [
      {
        name: "url",
        label: "サイトURL",
        type: "url" as const,
        placeholder: "https://example.com",
        required: true,
        value: sharedUrl,
        onChange: setSharedUrl,
      },
      {
        name: "token",
        label: "オーナートークン",
        type: "text" as const,
        placeholder: "8-16文字",
        required: true,
        width: "30%",
        value: sharedToken,
        onChange: setSharedToken,
      },
    ],
    buttonText: "カウント+1",
    onSubmit: handlers.handleIncrement,
    response: responses.incrementResponse,
  },
  // Get
  {
    title: "◆カウントデータを取得したいときは？◆",
    apiUrl: `https://nostalgic.llll-ll.com/api/visit?action=get&id=${encodeURIComponent(publicId || "公開ID")}`,
    apiUrlDisplay: (
      <>
        https://nostalgic.llll-ll.com/api/visit?action=get&id=
        <GreenParam>{publicId || "公開ID"}</GreenParam>
      </>
    ),
    fields: [
      {
        name: "publicId",
        label: "公開ID",
        type: "text" as const,
        placeholder: "STEP 1で作成後に表示されます",
        width: "40%",
        value: publicId,
        onChange: setPublicId,
      },
    ],
    buttonText: "データ取得",
    onSubmit: handlers.handleGet,
    response: responses.getResponse,
  },
  // Clear
  {
    title: "◆カウントをクリアしたいときは？◆",
    apiUrl: `https://nostalgic.llll-ll.com/api/visit?action=clear&url=${encodeURIComponent(sharedUrl || "サイトURL")}&token=${encodeURIComponent(sharedToken || "オーナートークン")}`,
    apiUrlDisplay: (
      <>
        https://nostalgic.llll-ll.com/api/visit?action=clear&url=
        <GreenParam>{sharedUrl || "サイトURL"}</GreenParam>
        &token=<GreenParam>{sharedToken || "オーナートークン"}</GreenParam>
      </>
    ),
    fields: [
      {
        name: "url",
        label: "サイトURL",
        type: "url" as const,
        placeholder: "https://example.com",
        required: true,
        value: sharedUrl,
        onChange: setSharedUrl,
      },
      {
        name: "token",
        label: "オーナートークン",
        type: "text" as const,
        placeholder: "8-16文字",
        required: true,
        width: "30%",
        value: sharedToken,
        onChange: setSharedToken,
      },
    ],
    buttonText: "カウントクリア",
    buttonColor: "#FF9800",
    onSubmit: handlers.handleClear,
    response: responses.clearResponse,
    warningMessage: (
      <p style={{ color: "#ff6600", fontWeight: "bold" }}>
        ※カウントをリセットします。元に戻せません。
      </p>
    ),
  },
  // Update Settings
  {
    title: "◆設定更新◆",
    description: "カウンターの設定を更新します。",
    apiUrl: `https://nostalgic.llll-ll.com/api/visit?action=updateSettings&url=${encodeURIComponent(sharedUrl || "サイトURL")}&token=${encodeURIComponent(sharedToken || "オーナートークン")}${webhookUrl ? `&webhookUrl=${encodeURIComponent(webhookUrl)}` : ""}`,
    apiUrlDisplay: (
      <>
        https://nostalgic.llll-ll.com/api/visit?action=updateSettings&url=
        <GreenParam>{sharedUrl || "サイトURL"}</GreenParam>
        &token=<GreenParam>{sharedToken || "オーナートークン"}</GreenParam>
        {webhookUrl && (
          <>
            &webhookUrl=<GreenParam>{webhookUrl}</GreenParam>
          </>
        )}
      </>
    ),
    fields: [
      {
        name: "url",
        label: "サイトURL",
        type: "url" as const,
        placeholder: "https://example.com",
        required: true,
        value: sharedUrl,
        onChange: setSharedUrl,
      },
      {
        name: "token",
        label: "オーナートークン",
        type: "text" as const,
        placeholder: "8-16文字",
        required: true,
        width: "30%",
        value: sharedToken,
        onChange: setSharedToken,
      },
      {
        name: "webhook",
        label: "Webhook URL（オプション）",
        type: "url" as const,
        placeholder: "https://example.com/webhook",
        value: webhookUrl,
        onChange: setWebhookUrl,
      },
    ],
    buttonText: "設定更新",
    onSubmit: handlers.handleUpdateSettings,
    response: responses.updateSettingsResponse,
  },
  // Delete
  {
    title: "◆カウンターを削除したいときは？◆",
    apiUrl: `https://nostalgic.llll-ll.com/api/visit?action=delete&url=${encodeURIComponent(sharedUrl || "サイトURL")}&token=${encodeURIComponent(sharedToken || "オーナートークン")}`,
    apiUrlDisplay: (
      <>
        https://nostalgic.llll-ll.com/api/visit?action=delete&url=
        <GreenParam>{sharedUrl || "サイトURL"}</GreenParam>
        &token=<GreenParam>{sharedToken || "オーナートークン"}</GreenParam>
      </>
    ),
    fields: [
      {
        name: "url",
        label: "サイトURL",
        type: "url" as const,
        placeholder: "https://example.com",
        required: true,
        value: sharedUrl,
        onChange: setSharedUrl,
      },
      {
        name: "token",
        label: "オーナートークン",
        type: "text" as const,
        placeholder: "8-16文字",
        required: true,
        width: "30%",
        value: sharedToken,
        onChange: setSharedToken,
      },
    ],
    buttonText: "削除",
    buttonColor: "#F44336",
    onSubmit: handlers.handleDelete,
    response: responses.deleteResponse,
    warningMessage: (
      <p style={{ color: "#ff0000", fontWeight: "bold" }}>
        ※削除すると復元できません。十分にご注意ください。
      </p>
    ),
  },
];
