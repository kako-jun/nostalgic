import { ReactNode } from "react";
import ResponseDisplay from "../ResponseDisplay";
import NostalgicButton from "../NostalgicButton";

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
          <NostalgicButton onClick={onSubmit}>{buttonText}</NostalgicButton>
        </p>
      </form>

      {response && <ResponseDisplay response={response} responseType={responseType} show={true} />}
    </>
  );
}
