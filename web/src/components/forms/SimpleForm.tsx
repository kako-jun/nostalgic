import { ReactNode } from "react";
import ResponseDisplay from "../ResponseDisplay";

interface SimpleFormProps {
  onSubmit: (e: React.FormEvent) => void;
  buttonText: string;
  children: ReactNode;
  response?: string;
  responseType?: "json" | "text" | "svg";
}

export default function SimpleForm({
  onSubmit,
  buttonText,
  children,
  response,
  responseType = "json",
}: SimpleFormProps) {
  return (
    <>
      <form style={{ marginTop: "10px" }}>
        {children}
        <p>
          <button
            type="button"
            style={{
              padding: "4px 12px",
              backgroundColor: "#2196F3",
              color: "white",
              border: "2px outset #2196F3",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
            onClick={onSubmit}
          >
            {buttonText}
          </button>
        </p>
      </form>

      {response && <ResponseDisplay response={response} responseType={responseType} show={true} />}
    </>
  );
}
