// Web Components用のカスタム要素型定義
// カスタム要素は任意の属性を持てるため、Record<string, unknown>で拡張
declare namespace JSX {
  interface IntrinsicElements {
    "nostalgic-counter": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> &
      Record<string, unknown>;
    "nostalgic-like": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> &
      Record<string, unknown>;
    "nostalgic-ranking": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> &
      Record<string, unknown>;
    "nostalgic-bbs": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> &
      Record<string, unknown>;
  }
}
