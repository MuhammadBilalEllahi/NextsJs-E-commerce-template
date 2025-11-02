/**
 * Get current status of an order
 * @param orderId - Order ID to check
 * @returns Order status and tracking information
 */
export default async function getOrderStatus(orderId: string): Promise<any> {
  console.log(`[MCP Tool] getOrderStatus called for orderId: ${orderId}`);

  // Mock order status
  const orderStatus = {
    orderId,
    status: "shipped",
    trackingNumber: "TCS1234567890",
    currentLocation: "Lahore Distribution Center",
    estimatedDelivery: new Date(
      Date.now() + 2 * 24 * 60 * 60 * 1000
    ).toISOString(),
    history: [
      {
        status: "pending",
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        location: "Order Placed",
      },
      {
        status: "confirmed",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        location: "Processing Center",
      },
      {
        status: "shipped",
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        location: "In Transit",
      },
    ],
  };

  console.log(`[MCP Tool] getOrderStatus - Status: ${orderStatus.status}`);
  return orderStatus;
}
