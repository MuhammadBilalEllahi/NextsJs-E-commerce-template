/**
 * Get user purchase history for personalized recommendations
 * @param userId - User ID
 * @returns Purchase history with embeddings
 */
export default async function getUserPurchaseHistory(userId: string): Promise<any> {
  console.log(`[MCP Tool] getUserPurchaseHistory called for userId: ${userId}`);
  
  // Mock purchase history with embeddings
  const purchaseHistory = {
    userId,
    totalOrders: 5,
    totalSpent: 3500,
    purchases: [
      {
        productId: "prod_001",
        productName: "Red Chili Powder",
        category: "Spices",
        price: 299,
        quantity: 2,
        purchaseDate: "2024-10-15",
        embedding: [0.2, 0.5, 0.8, 0.3, 0.6, 0.1, 0.9, 0.4],
      },
      {
        productId: "prod_002",
        productName: "Garam Masala",
        category: "Spices",
        price: 399,
        quantity: 1,
        purchaseDate: "2024-10-20",
        embedding: [0.3, 0.4, 0.7, 0.5, 0.8, 0.2, 0.6, 0.3],
      },
      {
        productId: "prod_007",
        productName: "Mango Pickle",
        category: "Pickles",
        price: 350,
        quantity: 1,
        purchaseDate: "2024-10-25",
        embedding: [0.7, 0.3, 0.5, 0.4, 0.6, 0.9, 0.2, 0.8],
      },
    ],
    preferredCategories: ["Spices", "Pickles"],
    avgOrderValue: 700,
    lastPurchase: "2024-10-25",
  };

  console.log(`[MCP Tool] getUserPurchaseHistory found ${purchaseHistory.purchases.length} purchases`);
  return purchaseHistory;
}

