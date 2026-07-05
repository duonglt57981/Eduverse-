"use client";

import DOMPurify from "dompurify";

export function sanitizeHtml(html: string): string {
  if (!html) return "";

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "p",
      "br",
      "span",
      "div",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "s",
      "strike",
      "ul",
      "ol",
      "li",
      "blockquote",
      "pre",
      "code",
      "a",
      "img",
      "video",
      "source",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "iframe",
      "font",
      "sub",
      "sup",
      "hr",
      "section",
      "article",
      "header",
      "footer",
      "main",
      "aside",
      "nav",
      "figure",
      "figcaption",
    ],
    ALLOWED_ATTR: [
      "href",
      "src",
      "alt",
      "title",
      "width",
      "height",
      "style",
      "class",
      "target",
      "rel",
      "controls",
      "autoplay",
      "loop",
      "muted",
      "frameborder",
      "allowfullscreen",
      "name",
      "id",
      "colspan",
      "rowspan",
    ],
    ALLOW_DATA_ATTR: false,
    FORCE_BODY: false,
  });
}

interface RenderRichTextProps {
  html: string;
  className?: string;
}

export function RenderRichText({
  html,
  className = "rich-text-content",
}: RenderRichTextProps) {
  if (!html) return null;

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  );
}
