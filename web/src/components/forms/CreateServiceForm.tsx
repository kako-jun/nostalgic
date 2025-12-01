import FormField from "../forms/FormField";
import ActionFormSection from "../sections/ActionFormSection";

interface CreateServiceFormProps {
  sharedUrl: string;
  setSharedUrl: (value: string) => void;
  sharedToken: string;
  setSharedToken: (value: string) => void;
  webhookUrl?: string;
  setWebhookUrl?: (value: string) => void;
  additionalFields?: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  response: string;
  submitButtonText?: string;
}

export default function CreateServiceForm({
  sharedUrl,
  setSharedUrl,
  sharedToken,
  setSharedToken,
  webhookUrl,
  setWebhookUrl,
  additionalFields,
  onSubmit,
  response,
  submitButtonText = "作成",
}: CreateServiceFormProps) {
  return (
    <ActionFormSection title="サービス作成フォーム" response={response}>
      <form onSubmit={onSubmit}>
        <FormField
          label="サイトURL"
          value={sharedUrl}
          onChange={setSharedUrl}
          placeholder="https://example.com"
          required
        />
        <FormField
          label="オーナートークン"
          value={sharedToken}
          onChange={setSharedToken}
          placeholder="8-16文字"
          required
        />
        {setWebhookUrl !== undefined && webhookUrl !== undefined && (
          <FormField label="Webhook URL" value={webhookUrl} onChange={setWebhookUrl} />
        )}
        {additionalFields}
        <button type="submit">{submitButtonText}</button>
      </form>
    </ActionFormSection>
  );
}
