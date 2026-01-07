// Web Components用のカスタム要素型定義
declare namespace JSX {
  interface IntrinsicElements {
    "nostalgic-counter": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      id?: string;
      type?: "total" | "today" | "yesterday" | "week" | "month";
      theme?: "light" | "dark" | "retro" | "kawaii" | "mom" | "final";
      digits?: string;
      format?: "text" | "svg" | "image" | "json";
      "api-base"?: string;
    };
    "nostalgic-like": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      id?: string;
      url?: string;
      token?: string;
      theme?: "light" | "dark" | "retro" | "kawaii" | "mom" | "final";
      icon?: "heart" | "star" | "thumb" | "peta";
      format?: "interactive" | "text" | "image";
      "api-base"?: string;
    };
    "nostalgic-ranking": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      id?: string;
      url?: string;
      limit?: string;
      theme?: "light" | "dark" | "retro" | "kawaii" | "mom" | "final";
      "api-base"?: string;
    };
    "nostalgic-bbs": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      id?: string;
      url?: string;
      token?: string;
      theme?: "light" | "dark" | "retro" | "kawaii" | "mom" | "final";
      limit?: string;
      "api-base"?: string;
    };
  }
}
