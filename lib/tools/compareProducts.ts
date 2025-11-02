/**
 * Compare multiple products side-by-side
 * @param ids - Array of product IDs to compare
 * @returns Comparison data for products
 */
export default async function compareProducts(ids: string[]): Promise<any> {
  console.log(`[MCP Tool] compareProducts called with ids: ${ids.join(", ")}`);

  // Mock comparison data
  const comparison = {
    products: ids.map((id, index) => ({
      id,
      name: `Product ${index + 1}`,
      price: 300 + index * 50,
      rating: 4.5 - index * 0.2,
      stock: 100 - index * 10,
      features: [`Feature A`, `Feature B`, `Feature C`],
    })),
    comparisonMatrix: {
      priceRange: [300, 400],
      avgRating: 4.3,
      bestValue: ids[0],
    },
  };

  console.log(`[MCP Tool] compareProducts compared ${ids.length} products`);
  return comparison;
}
