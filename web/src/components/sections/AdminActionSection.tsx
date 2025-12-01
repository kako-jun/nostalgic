import ApiUrlDisplay from "../ApiUrlDisplay";
import ActionSection from "../sections/ActionSection";
import SimpleForm from "../forms/SimpleForm";
import InputField from "../forms/InputField";

interface AdminActionSectionProps {
  title: string;
  apiUrl: string;
  apiUrlDisplay: React.ReactNode;
  sharedUrl: string;
  setSharedUrl: (value: string) => void;
  sharedToken: string;
  setSharedToken: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  buttonText: string;
  response: string;
  description?: string;
  children?: React.ReactNode;
}

export default function AdminActionSection({
  title,
  apiUrl,
  apiUrlDisplay,
  sharedUrl,
  setSharedUrl,
  sharedToken,
  setSharedToken,
  onSubmit,
  buttonText,
  response,
  description,
  children,
}: AdminActionSectionProps) {
  return (
    <ActionSection title={title}>
      <p>{description || "ブラウザのアドレスバーに以下のURLを入力してアクセスしてください。"}</p>
      <ApiUrlDisplay url={apiUrl}>{apiUrlDisplay}</ApiUrlDisplay>
      <hr style={{ margin: "20px 0", border: "1px dashed #ccc" }} />

      <p>または、以下のフォームで実行できます。</p>

      <SimpleForm onSubmit={onSubmit} buttonText={buttonText} response={response}>
        <InputField
          label="サイトURL"
          value={sharedUrl}
          onChange={setSharedUrl}
          type="url"
          placeholder="https://example.com"
          required
        />
        <InputField
          label="オーナートークン"
          value={sharedToken}
          onChange={setSharedToken}
          placeholder="8-16文字"
          required
          width="30%"
        />
        {children}
      </SimpleForm>
    </ActionSection>
  );
}
