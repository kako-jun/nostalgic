import DOMPurify from "dompurify";

/**
 * Sanitize SVG content to prevent XSS attacks.
 * Allows safe SVG elements while stripping scripts, event handlers, etc.
 */
export function sanitizeSVG(svgContent: string): string {
  return DOMPurify.sanitize(svgContent, {
    USE_PROFILES: { svg: true, svgFilters: true },
    ADD_TAGS: ["use"],
  });
}

/**
 * Sanitize HTML content to prevent XSS attacks.
 * Only allows basic formatting tags.
 */
export function sanitizeHTML(htmlContent: string): string {
  return DOMPurify.sanitize(htmlContent, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "br", "span", "code"],
    ALLOWED_ATTR: ["href", "target", "rel", "class"],
  });
}

/**
 * Sanitize HTML containing nostalgic web components.
 * Allows custom element tags (nostalgic-*) with safe attributes only.
 */
export function sanitizeWebComponent(htmlContent: string): string {
  return DOMPurify.sanitize(htmlContent, {
    ADD_TAGS: [
      "nostalgic-counter",
      "nostalgic-like",
      "nostalgic-ranking",
      "nostalgic-bbs",
      "nostalgic-yokoso",
    ],
    ALLOWED_ATTR: ["id", "theme", "limit", "type", "digits", "lang", "format", "icon"],
  });
}
