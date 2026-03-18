import { translateError } from "./errorTranslations";

export interface ApiCallOptions {
  onSuccess?: (data: unknown, publicId?: string) => void;
  onError?: (error: Error) => void;
}

/**
 * APIレスポンスのエラーメッセージを翻訳する
 */
function translateApiResponse(jsonResponse: Record<string, unknown>): Record<string, unknown> {
  if (jsonResponse.error && typeof jsonResponse.error === "string") {
    return {
      ...jsonResponse,
      error: translateError(jsonResponse.error),
    };
  }
  return jsonResponse;
}

/**
 * Determine if a request should use POST instead of GET.
 * This includes mutating operations AND any request containing a token
 * (to prevent token exposure in URLs/logs).
 */
function shouldUsePost(url: string): boolean {
  const urlObj = new URL(url, window.location.origin);
  const action = urlObj.searchParams.get("action");

  // Any request with a token must use POST to keep token out of URL
  if (urlObj.searchParams.has("token")) {
    return true;
  }

  const postActions = [
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
  ];
  return action !== null && postActions.includes(action);
}

/**
 * Extract body params from URL query string for POST requests.
 * Returns { cleanUrl, bodyParams } where cleanUrl has sensitive params removed
 * and bodyParams contains them as a JSON-serializable object.
 */
function extractBodyParams(url: string): { cleanUrl: string; bodyParams: Record<string, string> } {
  const urlObj = new URL(url, window.location.origin);
  const bodyParams: Record<string, string> = {};

  // Move all params except 'action' to body
  const paramsToMove: string[] = [];
  urlObj.searchParams.forEach((_value, key) => {
    if (key !== "action") {
      paramsToMove.push(key);
    }
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

export async function callApi(
  url: string,
  setResponse: (response: string) => void,
  setPublicId?: (id: string) => void,
  options?: ApiCallOptions
): Promise<void> {
  try {
    let res: Response;

    if (shouldUsePost(url)) {
      const { cleanUrl, bodyParams } = extractBodyParams(url);
      res = await fetch(cleanUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyParams),
      });
    } else {
      res = await fetch(url, { method: "GET" });
    }

    const contentType = res.headers.get("content-type");
    let responseText = "";

    if (contentType && contentType.includes("application/json")) {
      const jsonResponse = await res.json();
      // APIエラーを翻訳
      const translatedResponse = translateApiResponse(jsonResponse);
      responseText = JSON.stringify(translatedResponse, null, 2);

      // Extract public ID if available (support both jsonResponse.id and jsonResponse.data.id)
      const publicId = jsonResponse.id || jsonResponse.data?.id;
      if (setPublicId && publicId) {
        setPublicId(publicId);
      }

      if (options?.onSuccess) {
        options.onSuccess(jsonResponse, publicId);
      }
    } else {
      responseText = await res.text();
      if (options?.onSuccess) {
        options.onSuccess(responseText);
      }
    }

    setResponse(responseText);
  } catch (error) {
    const errorMessage = `エラー: ネットワークエラーが発生しました`;
    setResponse(errorMessage);
    if (options?.onError && error instanceof Error) {
      options.onError(error);
    }
  }
}

export async function callApiWithFormat(
  url: string,
  format: "json" | "text" | "image",
  setResponse: (response: string) => void,
  setResponseType: (type: "json" | "text" | "svg") => void,
  options?: ApiCallOptions
): Promise<void> {
  // "image" format returns SVG content, so we use "svg" internally for display
  setResponseType(format === "image" ? "svg" : format);

  try {
    let res: Response;

    if (shouldUsePost(url)) {
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

    if (format === "image") {
      responseText = await res.text();
    } else {
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const jsonResponse = await res.json();
        // APIエラーを翻訳
        const translatedResponse = translateApiResponse(jsonResponse);
        responseText = JSON.stringify(translatedResponse, null, 2);

        if (options?.onSuccess) {
          options.onSuccess(jsonResponse);
        }
      } else {
        responseText = await res.text();
        if (options?.onSuccess) {
          options.onSuccess(responseText);
        }
      }
    }

    setResponse(responseText);
  } catch (error) {
    const errorMessage = `エラー: ネットワークエラーが発生しました`;
    setResponse(errorMessage);
    if (options?.onError && error instanceof Error) {
      options.onError(error);
    }
  }
}
