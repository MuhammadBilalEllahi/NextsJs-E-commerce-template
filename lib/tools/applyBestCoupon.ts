/**
 * Find and apply the best available coupon for a user
 * @param userId - User ID
 * @param cartTotal - Current cart total
 * @returns Best coupon and discount details
 */
export default async function applyBestCoupon(
  userId: string,
  cartTotal: number
): Promise<any> {
  console.log(
    `[MCP Tool] applyBestCoupon called - User: ${userId}, Total: ${cartTotal}`
  );

  // Mock coupon selection
  const availableCoupons = [
    {
      code: "SPICE20",
      discount: 0.2,
      minPurchase: 500,
      maxDiscount: 200,
    },
    {
      code: "FLAT100",
      discount: 100,
      minPurchase: 800,
      maxDiscount: 100,
    },
  ];

  const bestCoupon = availableCoupons.find((c) => cartTotal >= c.minPurchase);

  const result = {
    success: !!bestCoupon,
    coupon: bestCoupon || null,
    discountAmount: bestCoupon
      ? Math.min(
          typeof bestCoupon.discount === "number"
            ? bestCoupon.discount
            : cartTotal * bestCoupon.discount,
          bestCoupon.maxDiscount
        )
      : 0,
    newTotal: bestCoupon
      ? cartTotal -
        Math.min(
          typeof bestCoupon.discount === "number"
            ? bestCoupon.discount
            : cartTotal * bestCoupon.discount,
          bestCoupon.maxDiscount
        )
      : cartTotal,
  };

  console.log(
    `[MCP Tool] applyBestCoupon ${
      result.success ? "applied" : "no eligible coupons"
    } - Discount: ${result.discountAmount}`
  );
  return result;
}
