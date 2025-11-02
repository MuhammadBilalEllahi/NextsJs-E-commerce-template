/**
 * Search products by query text
 * @param query - Search query string
 * @returns Array of matching products
 */
export default async function searchProducts(query: string): Promise<any> {
  console.log(`[MCP Tool] searchProducts called with query: ${query}`);

  // Mock implementation - in production, this would query MongoDB
  const mockResults = [
    {
      id: "prod_001",
      name: `Red Chili Powder (matched: ${query})`,
      price: 299,
      stock: 150,
      category: "Spices",
      description: "Premium quality red chili powder",
      relevanceScore: 0.95,
    },
    {
      id: "prod_002",
      name: `Garam Masala Mix`,
      price: 399,
      stock: 85,
      category: "Spices",
      description: "Authentic blend of spices",
      relevanceScore: 0.78,
    },
  ];

  console.log(`[MCP Tool] searchProducts found ${mockResults.length} results`);
  return mockResults;
}
