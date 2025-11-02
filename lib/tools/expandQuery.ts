/**
 * Expand search query with synonyms and related terms
 * @param text - Original query text
 * @returns Expanded query with related terms
 */
export default async function expandQuery(text: string): Promise<any> {
  console.log(`[MCP Tool] expandQuery called with text: ${text}`);

  // Mock query expansion
  const expansion = {
    originalQuery: text,
    expandedTerms: [text, `${text} powder`, `organic ${text}`, `${text} spice`],
    synonyms: ["masala", "seasoning", "blend"],
    relatedCategories: ["Spices", "Condiments", "Seasonings"],
    confidence: 0.85,
  };

  console.log(
    `[MCP Tool] expandQuery expanded to ${expansion.expandedTerms.length} terms`
  );
  return expansion;
}
