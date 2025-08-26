import 'react'

interface NostalgicRankingElement extends HTMLElement {
  loadRankingData(): void;
}

declare global {
  interface HTMLElementTagNameMap {
    'nostalgic-ranking': NostalgicRankingElement;
  }
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'nostalgic-counter': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        id?: string;
        type?: 'total' | 'today' | 'yesterday' | 'week' | 'month';
        theme?: 'light' | 'dark' | 'kawaii';
        digits?: string;
        scale?: string;
      };
      'nostalgic-like': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        id?: string;
        theme?: 'light' | 'dark' | 'kawaii';
      };
      'nostalgic-ranking': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        id?: string;
        max?: string;
        theme?: 'light' | 'dark' | 'kawaii';
        limit?: string;
        loadRankingData?: () => void;
      };
      'nostalgic-bbs': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        id?: string;
        max?: string;
        theme?: 'light' | 'dark' | 'kawaii';
      };
    }
  }
}