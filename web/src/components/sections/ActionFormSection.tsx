import ResponseDisplay from "../ResponseDisplay";

interface ActionFormSectionProps {
  title: string;
  children: React.ReactNode;
  response?: string;
  responseType?: "json" | "text" | "svg";
  showResponse?: boolean;
}

export default function ActionFormSection({
  title,
  children,
  response,
  responseType = "json",
  showResponse = true,
}: ActionFormSectionProps) {
  return (
    <div className="nostalgic-section">
      <p>
        <span className="nostalgic-section-title">
          <b>{title}</b>
        </span>
      </p>
      {children}
      {showResponse && response && (
        <ResponseDisplay response={response} responseType={responseType} />
      )}
    </div>
  );
}
