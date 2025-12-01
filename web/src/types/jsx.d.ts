// Web Components用のカスタム要素型定義
// カスタム要素は任意の属性を持てるため、Record<string, any>で拡張
declare namespace JSX {
  interface IntrinsicElements {
    "nostalgic-counter": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> &
      Record<string, any>;
    "nostalgic-like": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> &
      Record<string, any>;
    "nostalgic-ranking": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> &
      Record<string, any>;
    "nostalgic-bbs": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> &
      Record<string, any>;
  }
}
