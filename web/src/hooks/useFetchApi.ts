import { useState } from "react";

export type ResponseType = "json" | "text" | "svg";

interface UseFetchApiReturn {
  response: string;
  responseType: ResponseType;
  isLoading: boolean;
  fetchApi: (url: string, expectedType?: ResponseType) => Promise<void>;
  setResponseType: (type: ResponseType) => void;
}

export default function useFetchApi(initialType: ResponseType = "json"): UseFetchApiReturn {
  const [response, setResponse] = useState("");
  const [responseType, setResponseType] = useState<ResponseType>(initialType);
  const [isLoading, setIsLoading] = useState(false);

  const fetchApi = async (url: string, expectedType?: ResponseType) => {
    setIsLoading(true);
    const typeToUse = expectedType || responseType;

    try {
      const res = await fetch(url, { method: "GET" });
      let responseText = "";

      if (typeToUse === "svg") {
        responseText = await res.text();
      } else {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const jsonResponse = await res.json();
          responseText = JSON.stringify(jsonResponse, null, 2);
        } else {
          responseText = await res.text();
        }
      }

      setResponse(responseText);
    } catch (error) {
      setResponse(`エラー: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return { response, responseType, isLoading, fetchApi, setResponseType };
}
