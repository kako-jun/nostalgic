export interface ApiCallOptions {
  onSuccess?: (data: unknown, publicId?: string) => void;
  onError?: (error: Error) => void;
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
      responseText = JSON.stringify(jsonResponse, null, 2);

      // Extract public ID if available
      if (setPublicId && jsonResponse.data?.id) {
        setPublicId(jsonResponse.data.id);
      }

      if (options?.onSuccess) {
        options.onSuccess(jsonResponse, jsonResponse.data?.id);
      }
    } else {
      responseText = await res.text();
      if (options?.onSuccess) {
        options.onSuccess(responseText);
      }
    }

    setResponse(responseText);
  } catch (error) {
    const errorMessage = `エラー: ${error}`;
    setResponse(errorMessage);
    if (options?.onError && error instanceof Error) {
      options.onError(error);
    }
  }
}

export async function callApiWithFormat(
  url: string,
  format: "json" | "text" | "svg",
  setResponse: (response: string) => void,
  setResponseType: (type: "json" | "text" | "svg") => void,
  options?: ApiCallOptions
): Promise<void> {
  setResponseType(format);

  try {
    const res = await fetch(url, { method: "GET" });
    let responseText = "";

    if (format === "svg") {
      responseText = await res.text();
    } else {
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const jsonResponse = await res.json();
        responseText = JSON.stringify(jsonResponse, null, 2);

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
    const errorMessage = `エラー: ${error}`;
    setResponse(errorMessage);
    if (options?.onError && error instanceof Error) {
      options.onError(error);
    }
  }
}
