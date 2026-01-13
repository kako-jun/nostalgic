export const counterEmbedConfig = {
  scriptUrl: "https://nostalgic.llll-ll.com/components/visit.js",
  componentName: "nostalgic-counter",
  attributes: [
    { name: "type", defaultValue: "total", description: "期間タイプ" },
    { name: "theme", defaultValue: "dark", description: "テーマ" },
  ],
  // プレビュー用設定（publicIdを使ってSVGを生成）
  preview: {
    themes: [
      { name: "Light", value: "light" },
      { name: "Dark", value: "dark" },
      { name: "Retro", value: "retro" },
      { name: "Kawaii", value: "kawaii" },
      { name: "Mom", value: "mom" },
      { name: "Final", value: "final" },
      { name: "Mahjong", value: "mahjong" },
      { name: "Segment", value: "segment" },
      { name: "Nixie", value: "nixie" },
      { name: "DotsF", value: "dots_f" },
    ],
    getUrl: (publicId: string, theme: string) =>
      `/api/visit?action=get&id=${publicId}&type=total&theme=${theme}&format=image`,
  },
  sections: [
    {
      title: "type 期間タイプ",
      options: [
        { value: "total", description: "累計訪問数" },
        { value: "today", description: "今日の訪問数" },
        { value: "yesterday", description: "昨日の訪問数" },
        { value: "week", description: "今週の訪問数" },
        { value: "month", description: "今月の訪問数" },
      ],
    },
    {
      title: "theme デザインテーマ",
      options: [
        { value: "light", description: "ライト（明るい背景）" },
        { value: "dark", description: "ダーク（暗い背景）" },
        { value: "retro", description: "レトロ（古いコンピュータ画面風）" },
        { value: "kawaii", description: "かわいい（ファンシー系）" },
        { value: "mom", description: "Mother味（緑チェック模様）" },
        { value: "final", description: "FF味（青系）" },
        { value: "mahjong", description: "麻雀牌風" },
        { value: "segment", description: "7セグメント風" },
        { value: "nixie", description: "ニキシー管風" },
        { value: "dots_f", description: "FF5味（青系）" },
      ],
    },
  ],
  typescriptType: `// types.d.ts
import 'react'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'nostalgic-counter': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        id?: string;
        type?: 'total' | 'today' | 'yesterday' | 'week' | 'month';
        theme?: 'light' | 'dark' | 'retro' | 'kawaii' | 'mom' | 'final' | 'mahjong' | 'segment' | 'nixie' | 'dots_f';
        digits?: string;
        scale?: string;
      };
    }
  }
}`,
};

export const likeEmbedConfig = {
  scriptUrl: "https://nostalgic.llll-ll.com/components/like.js",
  componentName: "nostalgic-like",
  attributes: [
    { name: "theme", defaultValue: "dark", description: "テーマ" },
    { name: "icon", defaultValue: "heart", description: "アイコン" },
  ],
  sections: [
    {
      title: "format 表示形式",
      options: [
        { value: "interactive", description: "インタラクティブボタン（デフォルト）" },
        { value: "text", description: "数値のみ表示" },
        { value: "image", description: "SVG画像形式" },
      ],
    },
    {
      title: "theme デザインテーマ",
      options: [
        { value: "light", description: "ライト（白系モノクロ）" },
        { value: "dark", description: "ダーク（黒系モノクロ）" },
        { value: "retro", description: "レトロ（古いコンピュータ画面風）" },
        { value: "kawaii", description: "かわいい（ファンシー系）" },
        { value: "mom", description: "Mother味（緑チェック模様）" },
        { value: "final", description: "FF味（青系）" },
      ],
    },
    {
      title: "icon アイコンタイプ",
      options: [
        { value: "heart", description: "ハート（♥）" },
        { value: "star", description: "スター（★）" },
        { value: "thumb", description: "サムズアップ（👍）" },
        { value: "peta", description: "肉球（🐾）" },
      ],
    },
  ],
  typescriptType: `// types.d.ts
import 'react'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'nostalgic-like': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        id?: string;
        theme?: 'light' | 'dark' | 'retro' | 'kawaii' | 'mom' | 'final';
        icon?: 'heart' | 'star' | 'thumb' | 'peta';
      };
    }
  }
}`,
};

export const rankingEmbedConfig = {
  scriptUrl: "https://nostalgic.llll-ll.com/components/ranking.js",
  componentName: "nostalgic-ranking",
  attributes: [{ name: "theme", defaultValue: "dark", description: "テーマ" }],
  // デモ用設定（publicIdを使ってWebComponentsでライブ表示）
  demo: {
    themes: [
      { name: "Light", value: "light" },
      { name: "Dark", value: "dark" },
      { name: "Retro", value: "retro" },
      { name: "Kawaii", value: "kawaii" },
      { name: "Mom", value: "mom" },
      { name: "Final", value: "final" },
    ],
    hint: "※スコア投稿フォームからテストデータを送信してください！",
  },
  sections: [
    {
      title: "theme デザインテーマ",
      options: [
        { value: "light", description: "ライト（明るい背景）" },
        { value: "dark", description: "ダーク（暗い背景）" },
        { value: "retro", description: "レトロ（古いコンピュータ画面風）" },
        { value: "kawaii", description: "かわいい（ファンシー系）" },
        { value: "mom", description: "Mother味（緑チェック模様）" },
        { value: "final", description: "FF味（青系）" },
      ],
    },
  ],
  typescriptType: `// types.d.ts
import 'react'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'nostalgic-ranking': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        id?: string;
        theme?: 'light' | 'dark' | 'retro' | 'kawaii' | 'mom' | 'final';
      };
    }
  }
}`,
};

export const bbsEmbedConfig = {
  scriptUrl: "https://nostalgic.llll-ll.com/components/bbs.js",
  componentName: "nostalgic-bbs",
  attributes: [{ name: "theme", defaultValue: "dark", description: "テーマ" }],
  // デモ用設定（publicIdを使ってWebComponentsでライブ表示）
  demo: {
    themes: [
      { name: "Light", value: "light" },
      { name: "Dark", value: "dark" },
      { name: "Retro", value: "retro" },
      { name: "Kawaii", value: "kawaii" },
      { name: "Mom", value: "mom" },
      { name: "Final", value: "final" },
    ],
    hint: "※メッセージ投稿フォームからテストデータを送信してください！",
  },
  sections: [
    {
      title: "theme デザインテーマ",
      options: [
        { value: "light", description: "ライト（明るい背景）" },
        { value: "dark", description: "ダーク（暗い背景）" },
        { value: "retro", description: "レトロ（古いコンピュータ画面風）" },
        { value: "kawaii", description: "かわいい（ファンシー系）" },
        { value: "mom", description: "Mother味（緑チェック模様）" },
        { value: "final", description: "FF味（青系）" },
      ],
    },
  ],
  typescriptType: `// types.d.ts
import 'react'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'nostalgic-bbs': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        id?: string;
        theme?: 'light' | 'dark' | 'retro' | 'kawaii' | 'mom' | 'final';
      };
    }
  }
}`,
};
