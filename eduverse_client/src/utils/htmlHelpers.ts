/**
 * Utility functions for cleaning and safely handling HTML content,
 * removing clipboard comment artifacts (like <!--StartFragment-->, <!--EndFragment-->),
 * and stripping/formatting rich text for questions, answers, and summaries.
 */

/**
 * Removes HTML comments (e.g., <!--StartFragment-->, <!--EndFragment-->) and trims whitespace.
 */
export function cleanHtmlContent(content: string | null | undefined): string {
  if (!content || typeof content !== "string") return "";
  return content
    .replace(/<!--[\s\S]*?-->/gi, "")
    .trim();
}

/**
 * Checks whether content contains actual HTML tags after comments are stripped.
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
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}
