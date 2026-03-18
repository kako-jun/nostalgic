import { useState } from "react";

export type ResponseType = "json" | "text" | "svg";

/**
 * Mutating actions that must use POST instead of GET.
 * Tokens and sensitive data are sent in the request body, not URL.
 */
const MUTATING_ACTIONS = new Set([
  "create",
  "update",
  "set",
  "delete",
  "toggle",
  "post",
  "submit",
  "remove",
  "clear",
  "batchCreate",
  "batchGet",
]);

function isMutatingAction(url: string): boolean {
  const urlObj = new URL(url, window.location.origin);
  const action = urlObj.searchParams.get("action");
  return action !== null && MUTATING_ACTIONS.has(action);
}

/**
 * For POST requests, move all params except 'action' from URL to JSON body.
 */
function extractBodyParams(url: string): { cleanUrl: string; bodyParams: Record<string, string> } {
  const urlObj = new URL(url, window.location.origin);
  const bodyParams: Record<string, string> = {};
  const paramsToMove: string[] = [];

  urlObj.searchParams.forEach((_value, key) => {
    if (key !== "action") paramsToMove.push(key);
  });

  for (const key of paramsToMove) {
    const value = urlObj.searchParams.get(key);
    if (value !== null) {
      bodyParams[key] = value;
      urlObj.searchParams.delete(key);
    }
  }

  return { cleanUrl: urlObj.toString(), bodyParams };
}

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
      let res: Response;

      if (isMutatingAction(url)) {
        const { cleanUrl, bodyParams } = extractBodyParams(url);
        res = await fetch(cleanUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyParams),
        });
      } else {
        res = await fetch(url, { method: "GET" });
      }

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
