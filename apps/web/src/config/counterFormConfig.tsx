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
  selectedFormat: string,
  setSelectedFormat: (v: string) => void,
  setValue: string,
  setSetValue: (v: string) => void,
  handlers: {
    handleCreate: (e: React.FormEvent) => void;
    handleDisplay: (e: React.FormEvent) => void;
    handleIncrement: (e: React.FormEvent) => void;
    handleGet: (e: React.FormEvent) => void;
    handleSet: (e: React.FormEvent) => void;
    handleUpdateSettings: (e: React.FormEvent) => void;
    handleDelete: (e: React.FormEvent) => void;
  },
  responses: {
    createResponse: string;
    displayResponse: string;
    incrementResponse: string;
    getResponse: string;
    setResponse: string;
    updateSettingsResponse: string;
    deleteResponse: string;
  },
  responseType: "json" | "text" | "svg"
) => [
  // Display
  {
    title: "◆STEP 2: 表示プレビュー◆",
    apiUrl: `https://api.nostalgic.llll-ll.com/visit?action=get&id=${encodeURIComponent(publicId || "公開ID")}&type=total&format=${selectedFormat}`,
    apiUrlDisplay: (
      <>
        https://api.nostalgic.llll-ll.com/visit?action=get&id=
        <GreenParam>{publicId || "公開ID"}</GreenParam>
        &type=total&format=<GreenParam>{selectedFormat}</GreenParam>
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
  // Confirm Public ID
  {
    title: "◆公開IDを再確認したいときは？◆",
    apiUrl: `https://api.nostalgic.llll-ll.com/visit?action=create&url=${encodeURIComponent(sharedUrl || "サイトURL")}&token=${encodeURIComponent(sharedToken || "オーナートークン")}${webhookUrl ? `&webhookUrl=${encodeURIComponent(webhookUrl)}` : ""}`,
    apiUrlDisplay: (
      <>
        https://api.nostalgic.llll-ll.com/visit?action=create&url=
        <GreenParam>{sharedUrl || "サイトURL"}</GreenParam>
        &token=<GreenParam>{sharedToken || "オーナートークン"}</GreenParam>
        {webhookUrl && (
          <>
            &webhookUrl=<GreenParam>{encodeURIComponent(webhookUrl)}</GreenParam>
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
    ],
    buttonText: "公開ID確認",
    onSubmit: handlers.handleCreate,
    response: responses.createResponse,
  },
  // Increment
  {
    title: "◆カウントを増やしたいときは？◆",
    apiUrl: `https://api.nostalgic.llll-ll.com/visit?action=increment&id=${encodeURIComponent(publicId || "公開ID")}`,
    apiUrlDisplay: (
      <>
        https://api.nostalgic.llll-ll.com/visit?action=increment&id=
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
        required: true,
        value: publicId,
        onChange: setPublicId,
      },
    ],
    buttonText: "カウント+1",
    onSubmit: handlers.handleIncrement,
    response: responses.incrementResponse,
  },
  // Get
  {
    title: "◆カウントデータを取得したいときは？◆",
    apiUrl: `https://api.nostalgic.llll-ll.com/visit?action=get&id=${encodeURIComponent(publicId || "公開ID")}`,
    apiUrlDisplay: (
      <>
        https://api.nostalgic.llll-ll.com/visit?action=get&id=
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
  // Set
  {
    title: "◆カウント値を設定したいときは？◆",
    apiUrl: `https://api.nostalgic.llll-ll.com/visit?action=set&url=${encodeURIComponent(sharedUrl || "サイトURL")}&token=${encodeURIComponent(sharedToken || "オーナートークン")}&value=${setValue || "0"}`,
    apiUrlDisplay: (
      <>
        https://api.nostalgic.llll-ll.com/visit?action=set&url=
        <GreenParam>{sharedUrl || "サイトURL"}</GreenParam>
        &token=<GreenParam>{sharedToken || "オーナートークン"}</GreenParam>
        &value=<GreenParam>{setValue || "0"}</GreenParam>
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
        name: "value",
        label: "設定値",
        type: "number" as const,
        placeholder: "0",
        required: true,
        width: "20%",
        value: setValue,
        onChange: setSetValue,
      },
    ],
    buttonText: "値を設定",
    buttonVariant: "warning" as const,
    onSubmit: handlers.handleSet,
    response: responses.setResponse,
    warningMessage: (
      <p style={{ color: "#ff6600", fontWeight: "bold" }}>※カウント値を直接設定します。</p>
    ),
  },
  // Update Settings
  {
    title: "◆設定更新◆",
    description: "カウンターの設定を更新します。",
    apiUrl: `https://api.nostalgic.llll-ll.com/visit?action=update&url=${encodeURIComponent(sharedUrl || "サイトURL")}&token=${encodeURIComponent(sharedToken || "オーナートークン")}${webhookUrl ? `&webhookUrl=${encodeURIComponent(webhookUrl)}` : ""}`,
    apiUrlDisplay: (
      <>
        https://api.nostalgic.llll-ll.com/visit?action=update&url=
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
        label: "Webhook URL",
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
    apiUrl: `https://api.nostalgic.llll-ll.com/visit?action=delete&url=${encodeURIComponent(sharedUrl || "サイトURL")}&token=${encodeURIComponent(sharedToken || "オーナートークン")}`,
    apiUrlDisplay: (
      <>
        https://api.nostalgic.llll-ll.com/visit?action=delete&url=
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
    buttonVariant: "danger" as const,
    onSubmit: handlers.handleDelete,
    response: responses.deleteResponse,
    warningMessage: (
      <p style={{ color: "#ff0000", fontWeight: "bold" }}>
        ※削除すると復元できません。十分にご注意ください。
      </p>
    ),
  },
];
