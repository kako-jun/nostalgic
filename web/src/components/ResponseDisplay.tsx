interface ResponseDisplayProps {
  response: string;
  responseType: "json" | "text" | "svg" | "auto";
  show?: boolean;
}

export default function ResponseDisplay({
  response,
  responseType,
  show = true,
}: ResponseDisplayProps) {
  if (!response || !show) return null;

  const renderResponse = () => {
    switch (responseType) {
      case "svg":
        return (
          <div
            style={{
              textAlign: "center",
              padding: "10px",
              border: "1px solid #ccc",
              backgroundColor: "#f9f9f9",
            }}
          >
            <div dangerouslySetInnerHTML={{ __html: response }} />
          </div>
        );

      case "text":
        return (
          <div
            style={{ padding: "10px", fontSize: "18px", fontWeight: "bold", textAlign: "center" }}
          >
            {response}
          </div>
        );

      case "json":
      default:
        return (
          <pre
            style={{
              backgroundColor: "#000000",
              color: "#00ff00",
              padding: "10px",
              overflow: "auto",
              fontSize: "14px",
            }}
          >
            {response}
          </pre>
        );
    }
  };

  return (
    <div className="nostalgic-section">
      <p>
        <span className="nostalgic-section-title">
          <b>◆APIレスポンス◆</b>
        </span>
      </p>
      {renderResponse()}
    </div>
  );
}
