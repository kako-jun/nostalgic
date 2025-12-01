import { GreenParam } from "../components/ApiUrlDisplay";

export const getRankingFormSections = (
  sharedUrl: string,
  setSharedUrl: (v: string) => void,
  sharedToken: string,
  setSharedToken: (v: string) => void,
  publicId: string,
  setPublicId: (v: string) => void,
  submitName: string,
  setSubmitName: (v: string) => void,
  submitScore: string,
  setSubmitScore: (v: string) => void,
  submitDisplayScore: string,
  setSubmitDisplayScore: (v: string) => void,
  updateName: string,
  setUpdateName: (v: string) => void,
  updateScore: string,
  setUpdateScore: (v: string) => void,
  updateDisplayScore: string,
  setUpdateDisplayScore: (v: string) => void,
  removeName: string,
  setRemoveName: (v: string) => void,
  _webhookUrl: string,
  _setWebhookUrl: (v: string) => void,
  settingsTitle: string,
  setSettingsTitle: (v: string) => void,
  settingsMax: string,
  setSettingsMax: (v: string) => void,
  settingsSortOrder: string,
  setSettingsSortOrder: (v: string) => void,
  settingsWebhookUrl: string,
  setSettingsWebhookUrl: (v: string) => void,
  handlers: {
    handleSubmit: (e: React.FormEvent) => void;
    handleGet: (e: React.FormEvent) => void;
    handleUpdate: (e: React.FormEvent) => void;
    handleRemove: (e: React.FormEvent) => void;
    handleClear: (e: React.FormEvent) => void;
    handleUpdateSettings: (e: React.FormEvent) => void;
    handleDelete: (e: React.FormEvent) => void;
  },
  responses: {
    submitResponse: string;
    getResponse: string;
    updateResponse: string;
    removeResponse: string;
    clearResponse: string;
    updateSettingsResponse: string;
    deleteResponse: string;
  }
) => [
  // Submit
  {
    title: "◆STEP 2: スコア登録◆",
    apiUrl: `https://nostalgic.llll-ll.com/api/ranking?action=submit&id=${encodeURIComponent(publicId || "公開ID")}&name=${encodeURIComponent(submitName || "名前")}&score=${submitScore || "スコア"}${submitDisplayScore ? `&displayScore=${encodeURIComponent(submitDisplayScore)}` : ""}`,
    apiUrlDisplay: (
      <>
        https://nostalgic.llll-ll.com/api/ranking?action=submit&id=
        <GreenParam>{publicId || "公開ID"}</GreenParam>
        &name=<GreenParam>{submitName || "名前"}</GreenParam>&score=
        <GreenParam>{submitScore || "スコア"}</GreenParam>
        {submitDisplayScore && (
          <>
            &displayScore=<GreenParam>{submitDisplayScore}</GreenParam>
          </>
        )}
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
        required: true,
      },
      {
        name: "name",
        label: "名前",
        type: "text" as const,
        placeholder: "プレイヤー名",
        width: "40%",
        value: submitName,
        onChange: setSubmitName,
        required: true,
      },
      {
        name: "score",
        label: "スコア",
        type: "number" as const,
        placeholder: "0",
        width: "30%",
        value: submitScore,
        onChange: setSubmitScore,
        required: true,
      },
      {
        name: "displayScore",
        label: "表示スコア（オプション）",
        type: "text" as const,
        placeholder: "123,456点",
        width: "40%",
        value: submitDisplayScore,
        onChange: setSubmitDisplayScore,
      },
    ],
    buttonText: "スコア登録",
    onSubmit: handlers.handleSubmit,
    response: responses.submitResponse,
  },
  // Get
  {
    title: "◆ランキングデータを取得したいときは？◆",
    apiUrl: `https://nostalgic.llll-ll.com/api/ranking?action=get&id=${encodeURIComponent(publicId || "公開ID")}`,
    apiUrlDisplay: (
      <>
        https://nostalgic.llll-ll.com/api/ranking?action=get&id=
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
  // Update
  {
    title: "◆スコアを更新したいときは？◆",
    apiUrl: `https://nostalgic.llll-ll.com/api/ranking?action=update&url=${encodeURIComponent(sharedUrl || "サイトURL")}&token=${encodeURIComponent(sharedToken || "オーナートークン")}&name=${encodeURIComponent(updateName || "名前")}&score=${updateScore || "スコア"}${updateDisplayScore ? `&displayScore=${encodeURIComponent(updateDisplayScore)}` : ""}`,
    apiUrlDisplay: (
      <>
        https://nostalgic.llll-ll.com/api/ranking?action=update&url=
        <GreenParam>{sharedUrl || "サイトURL"}</GreenParam>
        &token=<GreenParam>{sharedToken || "オーナートークン"}</GreenParam>&name=
        <GreenParam>{updateName || "名前"}</GreenParam>&score=
        <GreenParam>{updateScore || "スコア"}</GreenParam>
        {updateDisplayScore && (
          <>
            &displayScore=<GreenParam>{updateDisplayScore}</GreenParam>
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
        name: "name",
        label: "名前",
        type: "text" as const,
        placeholder: "プレイヤー名",
        width: "40%",
        value: updateName,
        onChange: setUpdateName,
        required: true,
      },
      {
        name: "score",
        label: "スコア",
        type: "number" as const,
        placeholder: "0",
        width: "30%",
        value: updateScore,
        onChange: setUpdateScore,
        required: true,
      },
      {
        name: "displayScore",
        label: "表示スコア（オプション）",
        type: "text" as const,
        placeholder: "123,456点",
        width: "40%",
        value: updateDisplayScore,
        onChange: setUpdateDisplayScore,
      },
    ],
    buttonText: "スコア更新",
    onSubmit: handlers.handleUpdate,
    response: responses.updateResponse,
  },
  // Remove
  {
    title: "◆エントリを削除したいときは？◆",
    apiUrl: `https://nostalgic.llll-ll.com/api/ranking?action=remove&url=${encodeURIComponent(sharedUrl || "サイトURL")}&token=${encodeURIComponent(sharedToken || "オーナートークン")}&name=${encodeURIComponent(removeName || "名前")}`,
    apiUrlDisplay: (
      <>
        https://nostalgic.llll-ll.com/api/ranking?action=remove&url=
        <GreenParam>{sharedUrl || "サイトURL"}</GreenParam>
        &token=<GreenParam>{sharedToken || "オーナートークン"}</GreenParam>&name=
        <GreenParam>{removeName || "名前"}</GreenParam>
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
        name: "name",
        label: "名前",
        type: "text" as const,
        placeholder: "削除する名前",
        width: "40%",
        value: removeName,
        onChange: setRemoveName,
        required: true,
      },
    ],
    buttonText: "エントリ削除",
    buttonVariant: "warning" as const,
    onSubmit: handlers.handleRemove,
    response: responses.removeResponse,
  },
  // Clear
  {
    title: "◆全エントリをクリアしたいときは？◆",
    apiUrl: `https://nostalgic.llll-ll.com/api/ranking?action=clear&url=${encodeURIComponent(sharedUrl || "サイトURL")}&token=${encodeURIComponent(sharedToken || "オーナートークン")}`,
    apiUrlDisplay: (
      <>
        https://nostalgic.llll-ll.com/api/ranking?action=clear&url=
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
    buttonText: "全エントリクリア",
    buttonVariant: "warning" as const,
    onSubmit: handlers.handleClear,
    response: responses.clearResponse,
    warningMessage: (
      <p style={{ color: "#ff6600", fontWeight: "bold" }}>
        ※全てのランキングデータをクリアします。元に戻せません。
      </p>
    ),
  },
  // Update Settings
  {
    title: "◆設定更新◆",
    description: "ランキングの設定を更新します。",
    apiUrl: `https://nostalgic.llll-ll.com/api/ranking?action=updateSettings&url=${encodeURIComponent(sharedUrl || "サイトURL")}&token=${encodeURIComponent(sharedToken || "オーナートークン")}${settingsTitle ? `&title=${encodeURIComponent(settingsTitle)}` : ""}${settingsMax ? `&max=${settingsMax}` : ""}${settingsSortOrder ? `&sortOrder=${settingsSortOrder}` : ""}${settingsWebhookUrl ? `&webhookUrl=${encodeURIComponent(settingsWebhookUrl)}` : ""}`,
    apiUrlDisplay: (
      <>
        https://nostalgic.llll-ll.com/api/ranking?action=updateSettings&url=
        <GreenParam>{sharedUrl || "サイトURL"}</GreenParam>
        &token=<GreenParam>{sharedToken || "オーナートークン"}</GreenParam>
        {settingsTitle && (
          <>
            &title=<GreenParam>{settingsTitle}</GreenParam>
          </>
        )}
        {settingsMax && (
          <>
            &max=<GreenParam>{settingsMax}</GreenParam>
          </>
        )}
        {settingsSortOrder && (
          <>
            &sortOrder=<GreenParam>{settingsSortOrder}</GreenParam>
          </>
        )}
        {settingsWebhookUrl && (
          <>
            &webhookUrl=<GreenParam>{settingsWebhookUrl}</GreenParam>
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
        name: "title",
        label: "タイトル（オプション）",
        type: "text" as const,
        placeholder: "ハイスコアランキング",
        width: "60%",
        value: settingsTitle,
        onChange: setSettingsTitle,
      },
      {
        name: "max",
        label: "最大表示数（オプション）",
        type: "number" as const,
        placeholder: "10",
        width: "30%",
        value: settingsMax,
        onChange: setSettingsMax,
      },
      {
        name: "sortOrder",
        label: "ソート順（オプション）",
        type: "select" as const,
        width: "30%",
        value: settingsSortOrder,
        onChange: setSettingsSortOrder,
        options: [
          { value: "", label: "未設定" },
          { value: "desc", label: "降順（高い順）" },
          { value: "asc", label: "昇順（低い順）" },
        ],
      },
      {
        name: "webhook",
        label: "Webhook URL（オプション）",
        type: "url" as const,
        placeholder: "https://example.com/webhook",
        value: settingsWebhookUrl,
        onChange: setSettingsWebhookUrl,
      },
    ],
    buttonText: "設定更新",
    onSubmit: handlers.handleUpdateSettings,
    response: responses.updateSettingsResponse,
  },
  // Delete
  {
    title: "◆ランキングを削除したいときは？◆",
    apiUrl: `https://nostalgic.llll-ll.com/api/ranking?action=delete&url=${encodeURIComponent(sharedUrl || "サイトURL")}&token=${encodeURIComponent(sharedToken || "オーナートークン")}`,
    apiUrlDisplay: (
      <>
        https://nostalgic.llll-ll.com/api/ranking?action=delete&url=
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
