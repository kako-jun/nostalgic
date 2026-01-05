import FormField from "../forms/FormField";
import TextAreaField from "../forms/TextAreaField";
import ActionFormSection from "../sections/ActionFormSection";

interface BBSPostFormProps {
  sharedUrl: string;
  setSharedUrl: (value: string) => void;
  sharedToken: string;
  setSharedToken: (value: string) => void;
  postAuthor: string;
  setPostAuthor: (value: string) => void;
  postMessage: string;
  setPostMessage: (value: string) => void;
  standardValue: string;
  setStandardValue: (value: string) => void;
  incrementalValue: string;
  setIncrementalValue: (value: string) => void;
  emoteValue: string;
  setEmoteValue: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  response: string;
}

export default function BBSPostForm(props: BBSPostFormProps) {
  return (
    <ActionFormSection title="投稿フォーム" response={props.response}>
      <form onSubmit={props.onSubmit}>
        <FormField
          label="サイトURL"
          value={props.sharedUrl}
          onChange={props.setSharedUrl}
          required
        />
        <FormField
          label="オーナートークン"
          value={props.sharedToken}
          onChange={props.setSharedToken}
          required
        />
        <FormField
          label="投稿者名"
          value={props.postAuthor}
          onChange={props.setPostAuthor}
          required
        />
        <TextAreaField
          label="メッセージ"
          value={props.postMessage}
          onChange={props.setPostMessage}
          required
        />
        <FormField
          label="標準セレクト値"
          value={props.standardValue}
          onChange={props.setStandardValue}
        />
        <FormField
          label="インクリメンタルセレクト値"
          value={props.incrementalValue}
          onChange={props.setIncrementalValue}
        />
        <FormField
          label="エモートセレクト値"
          value={props.emoteValue}
          onChange={props.setEmoteValue}
        />
        <button type="submit">投稿</button>
      </form>
    </ActionFormSection>
  );
}
