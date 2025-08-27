import React from 'react'

// Custom element interfaces
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
      // Counter Web Component
      'nostalgic-counter': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        id?: string
        type?: 'total' | 'today' | 'yesterday' | 'week' | 'month'
        theme?: 'light' | 'dark' | 'kawaii'
        digits?: string
        format?: 'image' | 'text'
        'api-base'?: string
      }, HTMLElement>

      // Like Web Component
      'nostalgic-like': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        id?: string
        theme?: 'light' | 'dark' | 'kawaii'
        icon?: 'heart' | 'star' | 'thumb'
        format?: 'interactive' | 'image'
        'api-base'?: string
      }, HTMLElement>

      // Ranking Web Component
      'nostalgic-ranking': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        id?: string
        limit?: string
        theme?: 'light' | 'dark' | 'kawaii'
        format?: 'interactive'
        url?: string
        token?: string
        'api-base'?: string
        loadRankingData?: () => void
      }, HTMLElement>

      // BBS Web Component
      'nostalgic-bbs': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        id?: string
        page?: string
        theme?: 'light' | 'dark' | 'kawaii'
        format?: 'interactive'
        'show-header'?: 'true' | 'false'
        url?: string
        token?: string
        'api-base'?: string
      }, HTMLElement>
    }
  }
}