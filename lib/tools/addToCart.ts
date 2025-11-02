/**
 * Add a product to user's shopping cart
 * @param userId - User ID
 * @param productId - Product ID to add
 * @param quantity - Quantity to add (default: 1)
 * @returns Updated cart information
 */
export default async function addToCart(
  userId: string,
  productId: string,
  quantity: number = 1
): Promise<any> {
  console.log(`[MCP Tool] addToCart called - User: ${userId}, Product: ${productId}, Qty: ${quantity}`);
  
  // Mock cart addition
  const result = {
    success: true,
    cart: {
      userId,
      items: [
        {
          productId,
          quantity,
          addedAt: new Date().toISOString(),
        },
      ],
      itemCount: quantity,
      subtotal: 299 * quantity,
    },
    message: "Product added to cart successfully",
  };

  console.log(`[MCP Tool] addToCart completed - Cart now has ${result.cart.itemCount} items`);
  return result;
}

