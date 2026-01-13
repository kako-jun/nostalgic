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

export async function callApi(
  url: string,
  setResponse: (response: string) => void,
  setPublicId?: (id: string) => void,
  options?: ApiCallOptions
): Promise<void> {
  try {
    const res = await fetch(url, { method: "GET" });
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
    const res = await fetch(url, { method: "GET" });
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
