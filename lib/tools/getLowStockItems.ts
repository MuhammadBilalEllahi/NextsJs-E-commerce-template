/**
 * Get products with low stock (admin tool)
 * @param limit - Maximum number of items to return
 * @returns List of low stock products
 */
export default async function getLowStockItems(
  limit: number = 10
): Promise<any> {
  console.log(`[MCP Tool] getLowStockItems called with limit: ${limit}`);

  // Mock low stock items
  const lowStockItems = [
    {
      productId: "prod_low_001",
      name: "Kashmiri Red Chili",
      currentStock: 5,
      reorderLevel: 20,
      urgency: "high",
      price: 450,
    },
    {
      productId: "prod_low_002",
      name: "Organic Turmeric",
      currentStock: 12,
      reorderLevel: 25,
      urgency: "medium",
      price: 350,
    },
    {
      productId: "prod_low_003",
      name: "Premium Garam Masala",
      currentStock: 8,
      reorderLevel: 15,
      urgency: "high",
      price: 499,
    },
  ].slice(0, limit);

  console.log(
    `[MCP Tool] getLowStockItems found ${lowStockItems.length} items`
  );
  return {
    items: lowStockItems,
    totalLowStock: lowStockItems.length,
    criticalCount: lowStockItems.filter((i) => i.urgency === "high").length,
  };
}
