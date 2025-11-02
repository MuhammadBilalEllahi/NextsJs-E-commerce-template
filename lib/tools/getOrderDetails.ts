/**
 * Get detailed order information for a user
 * @param userId - User ID
 * @param orderId - Optional specific order ID
 * @returns Order details or list of orders
 */
export default async function getOrderDetails(
  userId: string,
  orderId?: string
): Promise<any> {
  console.log(`[MCP Tool] getOrderDetails called - User: ${userId}, Order: ${orderId || "all"}`);
  
  // Mock order details
  const orders = [
    {
      orderId: orderId || "ORD-001",
      userId,
      items: [
        {
          name: "Red Chili Powder",
          quantity: 2,
          price: 299,
          total: 598,
        },
      ],
      subtotal: 598,
      shippingFee: 150,
      total: 748,
      status: "delivered",
      orderDate: "2024-10-15T10:00:00Z",
      deliveryDate: "2024-10-18T14:30:00Z",
    },
  ];

  const result = orderId
    ? orders.find((o) => o.orderId === orderId) || { error: "Order not found" }
    : { userId, orders, totalOrders: orders.length };

  console.log(`[MCP Tool] getOrderDetails returned ${orderId ? "single order" : `${orders.length} orders`}`);
  return result;
}

