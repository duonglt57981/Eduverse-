/**
 * Utility functions for cleaning and safely handling HTML content,
 * removing clipboard comment artifacts (like <!--StartFragment-->, <!--EndFragment-->),
 * decoding HTML entities (&nbsp;, &amp;, &lt;, &gt;, etc.),
 * and stripping/formatting rich text for questions, answers, and summaries.
 */

/**
 * Decodes common HTML entities (&nbsp;, &amp;, &lt;, &gt;, &quot;, &#39;, &#160;, etc.)
 * into their corresponding characters and trims non-breaking spaces.
 */
export function decodeHtmlEntities(text: string | null | undefined): string {
  if (!text || typeof text !== "string") return "";
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&#160;/gi, " ")
    .replace(/&#xA0;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&hellip;/gi, "…")
    .replace(/&ndash;/gi, "–")
    .replace(/&mdash;/gi, "—");
}

/**
 * Removes HTML comments (e.g., <!--StartFragment-->, <!--EndFragment-->),
 * cleans leading/trailing &nbsp; and non-breaking space artifacts,
 * and decodes HTML entities if content does not contain HTML tags.
 */
export function cleanHtmlContent(content: string | null | undefined): string {
  if (!content || typeof content !== "string") return "";

  // 1. Remove HTML comments
  let cleaned = content.replace(/<!--[\s\S]*?-->/gi, "").trim();

  // 2. If it does not contain HTML tags, decode HTML entities and trim
  if (!/<[a-z][\s\S]*>/i.test(cleaned)) {
    return decodeHtmlEntities(cleaned).trim();
  }

  // 3. If it contains HTML tags, clean leading/trailing non-breaking spaces and whitespace
  cleaned = cleaned
    .replace(/^(?:&nbsp;|\s|&#160;|&#xA0;)+/gi, "")
    .replace(/(?:&nbsp;|\s|&#160;|&#xA0;)+$/gi, "")
    .replace(/(<[a-z1-6]+[^>]*>)(?:&nbsp;|\s|&#160;|&#xA0;)+/gi, "$1")
    .replace(/(?:&nbsp;|\s|&#160;|&#xA0;)+(<\/[a-z1-6]+>)/gi, "$1")
    .trim();

  return cleaned;
}

/**
 * Checks whether content contains actual HTML tags after comments and artifacts are stripped.
 */
export function isHtmlContent(content: string | null | undefined): boolean {
  if (!content || typeof content !== "string") return false;
  const cleaned = cleanHtmlContent(content);
  return /<[a-z][\s\S]*>/i.test(cleaned);
}

/**
 * Strips all HTML tags, HTML comments, and HTML entities, returning clean plain text.
 */
export function stripHtml(content: string | null | undefined): string {
  if (!content || typeof content !== "string") return "";
  return content
    .replace(/<!--[\s\S]*?-->/gi, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#160;/gi, " ")
    .replace(/&#xA0;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&hellip;/gi, "…")
    .replace(/&ndash;/gi, "–")
    .replace(/&mdash;/gi, "—")
    .replace(/\s+/g, " ")
    .trim();
}

