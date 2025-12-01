import FormField from "../forms/FormField";
import ActionFormSection from "../sections/ActionFormSection";

interface BBSGetFormProps {
  publicId: string;
  setPublicId: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  response: string;
}

export default function BBSGetForm({ publicId, setPublicId, onSubmit, response }: BBSGetFormProps) {
  return (
    <ActionFormSection title="取得フォーム" response={response}>
      <form onSubmit={onSubmit}>
        <FormField label="公開ID" value={publicId} onChange={setPublicId} required />
        <button type="submit">取得</button>
      </form>
    </ActionFormSection>
  );
}
