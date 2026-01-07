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
      <form style={{ marginTop: "10px" }} onSubmit={onSubmit}>
        {children}
        <p>
          <NostalgicButton type="submit">{buttonText}</NostalgicButton>
        </p>
      </form>

      {response && <ResponseDisplay response={response} responseType={responseType} show={true} />}
    </>
  );
}
