import { GreenParam } from "../components/ApiUrlDisplay";

type FieldType = "text" | "url" | "number" | "select";

interface BBSFormSectionConfig {
  title: string;
  apiUrl: string;
  apiUrlDisplay: JSX.Element;
  fields: Array<{
    name: string;
    label: string;
    type: FieldType;
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
  }>;
  buttonText: string;
  onSubmit: (e: React.FormEvent) => void;
  response: string;
}

interface BBSFormParams {
  publicId: string;
  sharedUrl: string;
  sharedToken: string;
  postAuthor: string;
  postMessage: string;
  standardValue: string;
  incrementalValue: string;
  emoteValue: string;
  messageId: string;
  editAuthor: string;
  editMessage: string;
  editToken: string;
  editStandardValue: string;
  editIncrementalValue: string;
  editEmoteValue: string;
  setPostAuthor: (value: string) => void;
  setPostMessage: (value: string) => void;
  setStandardValue: (value: string) => void;
  setIncrementalValue: (value: string) => void;
  setEmoteValue: (value: string) => void;
  setMessageId: (value: string) => void;
  setEditAuthor: (value: string) => void;
  setEditMessage: (value: string) => void;
  setEditToken: (value: string) => void;
  setEditStandardValue: (value: string) => void;
  setEditIncrementalValue: (value: string) => void;
  setEditEmoteValue: (value: string) => void;
  handlePost: (e: React.FormEvent) => void;
  handleGet: (e: React.FormEvent) => void;
  handleUpdate: (e: React.FormEvent) => void;
  handleRemove: (e: React.FormEvent) => void;
  handleClear: (e: React.FormEvent) => void;
  handleDelete: (e: React.FormEvent) => void;
  handleUpdateSettings: (e: React.FormEvent) => void;
  handleEditMessageById: (e: React.FormEvent) => void;
  handleDeleteMessageById: (e: React.FormEvent) => void;
  postResponse: string;
  getResponse: string;
  updateResponse: string;
  removeResponse: string;
  clearResponse: string;
  deleteResponse: string;
  updateSettingsResponse: string;
}

export function getBBSFormSections(params: BBSFormParams): BBSFormSectionConfig[] {
  const {
    publicId,
    sharedUrl,
    sharedToken,
    postAuthor,
    postMessage,
    standardValue,
    incrementalValue,
    emoteValue,
    messageId,
    editAuthor,
    editMessage,
    editToken,
    editStandardValue,
    editIncrementalValue,
    editEmoteValue,
    setPostAuthor,
    setPostMessage,
    setStandardValue,
    setIncrementalValue,
    setEmoteValue,
    setMessageId,
    setEditAuthor,
    setEditMessage,
    setEditToken,
    setEditStandardValue,
    setEditIncrementalValue,
    setEditEmoteValue,
    handlePost,
    handleGet,
    handleUpdate,
    handleRemove,
    handleClear,
    handleDelete,
    handleUpdateSettings,
    handleEditMessageById,
    handleDeleteMessageById,
    postResponse,
    getResponse,
    updateResponse,
    removeResponse,
    clearResponse,
    deleteResponse,
    updateSettingsResponse,
  } = params;

  return [
    // 1. メッセージ投稿
    {
      title: "◆ メッセージ投稿 ◆",
      apiUrl: `/api/bbs?action=post&url=${encodeURIComponent(sharedUrl || "サイトURL")}&token=${encodeURIComponent(sharedToken || "オーナートークン")}&author=${encodeURIComponent(postAuthor || "投稿者名")}&message=${encodeURIComponent(postMessage || "メッセージ")}${standardValue ? `&standardValue=${encodeURIComponent(standardValue)}` : ""}${incrementalValue ? `&incrementalValue=${encodeURIComponent(incrementalValue)}` : ""}${emoteValue ? `&emoteValue=${encodeURIComponent(emoteValue)}` : ""}`,
      apiUrlDisplay: (
        <>
          https://nostalgic.llll-ll.com/api/bbs?action=post&url=
          <GreenParam>{sharedUrl || "サイトURL"}</GreenParam>
          &token=<GreenParam>{sharedToken || "オーナートークン"}</GreenParam>
          &author=<GreenParam>{postAuthor || "投稿者名"}</GreenParam>
          &message=<GreenParam>{postMessage || "メッセージ"}</GreenParam>
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
        </>
      ),
      fields: [
        {
          name: "postAuthor",
          label: "投稿者名",
          type: "text",
          placeholder: "投稿者名を入力",
          value: postAuthor,
          onChange: setPostAuthor,
        },
        {
          name: "postMessage",
          label: "メッセージ",
          type: "text",
          placeholder: "メッセージを入力",
          value: postMessage,
          onChange: setPostMessage,
        },
        {
          name: "standardValue",
          label: "標準セレクト値（任意）",
          type: "text",
          placeholder: "標準セレクト値",
          value: standardValue,
          onChange: setStandardValue,
        },
        {
          name: "incrementalValue",
          label: "増分セレクト値（任意）",
          type: "text",
          placeholder: "増分セレクト値",
          value: incrementalValue,
          onChange: setIncrementalValue,
        },
        {
          name: "emoteValue",
          label: "エモートセレクト値（任意）",
          type: "text",
          placeholder: "エモートセレクト値",
          value: emoteValue,
          onChange: setEmoteValue,
        },
      ],
      buttonText: "投稿",
      onSubmit: handlePost,
      response: postResponse,
    },

    // 2. BBS取得（Public ID使用）
    {
      title: "◆ BBS取得 ◆",
      apiUrl: `/api/bbs?action=get&id=${encodeURIComponent(publicId || "パブリックID")}`,
      apiUrlDisplay: (
        <>
          https://nostalgic.llll-ll.com/api/bbs?action=get&id=
          <GreenParam>{publicId || "パブリックID"}</GreenParam>
        </>
      ),
      fields: [],
      buttonText: "取得",
      onSubmit: handleGet,
      response: getResponse,
    },

    // 3. メッセージ編集（URL/Token使用）
    {
      title: "◆ メッセージ編集（URL/Token） ◆",
      apiUrl: `/api/bbs?action=editMessage&url=${encodeURIComponent(sharedUrl || "サイトURL")}&token=${encodeURIComponent(sharedToken || "オーナートークン")}&messageId=${messageId || "メッセージID"}&author=${encodeURIComponent(editAuthor || "投稿者名")}&message=${encodeURIComponent(editMessage || "新しいメッセージ")}${editStandardValue ? `&standardValue=${encodeURIComponent(editStandardValue)}` : ""}${editIncrementalValue ? `&incrementalValue=${encodeURIComponent(editIncrementalValue)}` : ""}${editEmoteValue ? `&emoteValue=${encodeURIComponent(editEmoteValue)}` : ""}`,
      apiUrlDisplay: (
        <>
          https://nostalgic.llll-ll.com/api/bbs?action=editMessage&url=
          <GreenParam>{sharedUrl || "サイトURL"}</GreenParam>
          &token=<GreenParam>{sharedToken || "オーナートークン"}</GreenParam>
          &messageId=<GreenParam>{messageId || "メッセージID"}</GreenParam>
          &author=<GreenParam>{editAuthor || "投稿者名"}</GreenParam>
          &message=<GreenParam>{editMessage || "新しいメッセージ"}</GreenParam>
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
        </>
      ),
      fields: [
        {
          name: "messageId",
          label: "メッセージID",
          type: "text",
          placeholder: "メッセージID",
          value: messageId,
          onChange: setMessageId,
        },
        {
          name: "editAuthor",
          label: "投稿者名",
          type: "text",
          placeholder: "投稿者名",
          value: editAuthor,
          onChange: setEditAuthor,
        },
        {
          name: "editMessage",
          label: "新しいメッセージ",
          type: "text",
          placeholder: "新しいメッセージ",
          value: editMessage,
          onChange: setEditMessage,
        },
        {
          name: "editStandardValue",
          label: "標準セレクト値（任意）",
          type: "text",
          placeholder: "標準セレクト値",
          value: editStandardValue,
          onChange: setEditStandardValue,
        },
        {
          name: "editIncrementalValue",
          label: "増分セレクト値（任意）",
          type: "text",
          placeholder: "増分セレクト値",
          value: editIncrementalValue,
          onChange: setEditIncrementalValue,
        },
        {
          name: "editEmoteValue",
          label: "エモートセレクト値（任意）",
          type: "text",
          placeholder: "エモートセレクト値",
          value: editEmoteValue,
          onChange: setEditEmoteValue,
        },
      ],
      buttonText: "編集",
      onSubmit: handleUpdate,
      response: updateResponse,
    },

    // 4. メッセージ削除（URL/Token使用）
    {
      title: "◆ メッセージ削除（URL/Token） ◆",
      apiUrl: `/api/bbs?action=deleteMessage&url=${encodeURIComponent(sharedUrl || "サイトURL")}&token=${encodeURIComponent(sharedToken || "オーナートークン")}&messageId=${messageId || "メッセージID"}`,
      apiUrlDisplay: (
        <>
          https://nostalgic.llll-ll.com/api/bbs?action=deleteMessage&url=
          <GreenParam>{sharedUrl || "サイトURL"}</GreenParam>
          &token=<GreenParam>{sharedToken || "オーナートークン"}</GreenParam>
          &messageId=<GreenParam>{messageId || "メッセージID"}</GreenParam>
        </>
      ),
      fields: [
        {
          name: "messageId",
          label: "メッセージID",
          type: "text",
          placeholder: "メッセージID",
          value: messageId,
          onChange: setMessageId,
        },
      ],
      buttonText: "削除",
      onSubmit: handleRemove,
      response: removeResponse,
    },

    // 5. メッセージ編集（Public ID + editToken使用）
    {
      title: "◆ メッセージ編集（Public ID） ◆",
      apiUrl: `/api/bbs?action=editMessageById&id=${encodeURIComponent(publicId || "パブリックID")}&messageId=${messageId || "メッセージID"}&author=${encodeURIComponent(editAuthor || "投稿者名")}&message=${encodeURIComponent(editMessage || "新しいメッセージ")}&editToken=${encodeURIComponent(editToken || "編集トークン")}${editStandardValue ? `&standardValue=${encodeURIComponent(editStandardValue)}` : ""}${editIncrementalValue ? `&incrementalValue=${encodeURIComponent(editIncrementalValue)}` : ""}${editEmoteValue ? `&emoteValue=${encodeURIComponent(editEmoteValue)}` : ""}`,
      apiUrlDisplay: (
        <>
          https://nostalgic.llll-ll.com/api/bbs?action=editMessageById&id=
          <GreenParam>{publicId || "パブリックID"}</GreenParam>
          &messageId=<GreenParam>{messageId || "メッセージID"}</GreenParam>
          &author=<GreenParam>{editAuthor || "投稿者名"}</GreenParam>
          &message=<GreenParam>{editMessage || "新しいメッセージ"}</GreenParam>
          &editToken=<GreenParam>{editToken || "編集トークン"}</GreenParam>
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
        </>
      ),
      fields: [
        {
          name: "messageId",
          label: "メッセージID",
          type: "text",
          placeholder: "メッセージID",
          value: messageId,
          onChange: setMessageId,
        },
        {
          name: "editAuthor",
          label: "投稿者名",
          type: "text",
          placeholder: "投稿者名",
          value: editAuthor,
          onChange: setEditAuthor,
        },
        {
          name: "editMessage",
          label: "新しいメッセージ",
          type: "text",
          placeholder: "新しいメッセージ",
          value: editMessage,
          onChange: setEditMessage,
        },
        {
          name: "editToken",
          label: "編集トークン",
          type: "text",
          placeholder: "編集トークン",
          value: editToken,
          onChange: setEditToken,
        },
        {
          name: "editStandardValue",
          label: "標準セレクト値（任意）",
          type: "text",
          placeholder: "標準セレクト値",
          value: editStandardValue,
          onChange: setEditStandardValue,
        },
        {
          name: "editIncrementalValue",
          label: "増分セレクト値（任意）",
          type: "text",
          placeholder: "増分セレクト値",
          value: editIncrementalValue,
          onChange: setEditIncrementalValue,
        },
        {
          name: "editEmoteValue",
          label: "エモートセレクト値（任意）",
          type: "text",
          placeholder: "エモートセレクト値",
          value: editEmoteValue,
          onChange: setEditEmoteValue,
        },
      ],
      buttonText: "編集",
      onSubmit: handleEditMessageById,
      response: updateResponse,
    },

    // 6. メッセージ削除（Public ID + editToken使用）
    {
      title: "◆ メッセージ削除（Public ID） ◆",
      apiUrl: `/api/bbs?action=deleteMessageById&id=${encodeURIComponent(publicId || "パブリックID")}&messageId=${messageId || "メッセージID"}&editToken=${encodeURIComponent(editToken || "編集トークン")}`,
      apiUrlDisplay: (
        <>
          https://nostalgic.llll-ll.com/api/bbs?action=deleteMessageById&id=
          <GreenParam>{publicId || "パブリックID"}</GreenParam>
          &messageId=<GreenParam>{messageId || "メッセージID"}</GreenParam>
          &editToken=<GreenParam>{editToken || "編集トークン"}</GreenParam>
        </>
      ),
      fields: [
        {
          name: "messageId",
          label: "メッセージID",
          type: "text",
          placeholder: "メッセージID",
          value: messageId,
          onChange: setMessageId,
        },
        {
          name: "editToken",
          label: "編集トークン",
          type: "text",
          placeholder: "編集トークン",
          value: editToken,
          onChange: setEditToken,
        },
      ],
      buttonText: "削除",
      onSubmit: handleDeleteMessageById,
      response: removeResponse,
    },

    // 7. 全メッセージ削除
    {
      title: "◆ 全メッセージ削除 ◆",
      apiUrl: `/api/bbs?action=clear&url=${encodeURIComponent(sharedUrl || "サイトURL")}&token=${encodeURIComponent(sharedToken || "オーナートークン")}`,
      apiUrlDisplay: (
        <>
          https://nostalgic.llll-ll.com/api/bbs?action=clear&url=
          <GreenParam>{sharedUrl || "サイトURL"}</GreenParam>
          &token=<GreenParam>{sharedToken || "オーナートークン"}</GreenParam>
        </>
      ),
      fields: [],
      buttonText: "全削除",
      onSubmit: handleClear,
      response: clearResponse,
    },

    // 8. BBS削除
    {
      title: "◆ BBS削除 ◆",
      apiUrl: `/api/bbs?action=delete&url=${encodeURIComponent(sharedUrl || "サイトURL")}&token=${encodeURIComponent(sharedToken || "オーナートークン")}`,
      apiUrlDisplay: (
        <>
          https://nostalgic.llll-ll.com/api/bbs?action=delete&url=
          <GreenParam>{sharedUrl || "サイトURL"}</GreenParam>
          &token=<GreenParam>{sharedToken || "オーナートークン"}</GreenParam>
        </>
      ),
      fields: [],
      buttonText: "削除",
      onSubmit: handleDelete,
      response: deleteResponse,
    },

    // 9. 設定更新
    {
      title: "◆ 設定更新 ◆",
      apiUrl: `/api/bbs?action=updateSettings&url=${encodeURIComponent(sharedUrl || "サイトURL")}&token=${encodeURIComponent(sharedToken || "オーナートークン")}`,
      apiUrlDisplay: (
        <>
          https://nostalgic.llll-ll.com/api/bbs?action=updateSettings&url=
          <GreenParam>{sharedUrl || "サイトURL"}</GreenParam>
          &token=<GreenParam>{sharedToken || "オーナートークン"}</GreenParam>
        </>
      ),
      fields: [],
      buttonText: "更新",
      onSubmit: handleUpdateSettings,
      response: updateSettingsResponse,
    },
  ];
}
