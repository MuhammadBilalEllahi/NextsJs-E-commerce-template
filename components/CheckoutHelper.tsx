"use client";

/**
 * AI-Powered Checkout Helper
 * Applies best coupons and optimizes checkout
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingDown, CheckCircle2 } from "lucide-react";
import mcpTools from "@/lib/tools";

interface CheckoutHelperProps {
  userId: string;
  cartTotal: number;
  cartItems: any[];
}

export default function CheckoutHelper({
  userId,
  cartTotal,
  cartItems,
}: CheckoutHelperProps) {
  const [bestCoupon, setBestCoupon] = useState<any>(null);
  const [bundles, setBundles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [appliedCoupon, setAppliedCoupon] = useState(false);

  useEffect(() => {
    async function optimizeCheckout() {
      if (cartTotal === 0) return;

      try {
        const cartItemIds = cartItems.map((item) => item.id || item.productId);

        const [couponResult, bundleResult] = await Promise.all([
          mcpTools.applyBestCoupon(userId, cartTotal),
          mcpTools.suggestBundles(cartItemIds),
        ]);

        if (couponResult.success) {
          setBestCoupon(couponResult);
        }
        setBundles(bundleResult.suggestedBundles || []);
      } catch (error) {
        console.error("Error optimizing checkout:", error);
      } finally {
        setLoading(false);
      }
    }

    optimizeCheckout();
  }, [userId, cartTotal, cartItems]);

  const handleApplyCoupon = () => {
    setAppliedCoupon(true);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Best Coupon Recommendation */}
      {bestCoupon && !appliedCoupon && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-green-600" />
              AI Optimized Savings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl font-bold text-green-700">
                  Save Rs. {bestCoupon.discountAmount}
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  Best coupon automatically selected: <strong>{bestCoupon.coupon.code}</strong>
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-green-600" />
            </div>

            <div className="bg-white p-3 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Original Total</p>
                  <p className="font-semibold text-lg">Rs. {cartTotal}</p>
                </div>
                <div>
                  <p className="text-gray-600">Optimized Total</p>
                  <p className="font-semibold text-lg text-green-600">
                    Rs. {bestCoupon.newTotal}
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleApplyCoupon}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Apply Coupon & Save Rs. {bestCoupon.discountAmount}
            </Button>
          </CardContent>
        </Card>
      )}

      {appliedCoupon && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            <div>
              <p className="font-semibold text-green-800">Coupon Applied!</p>
              <p className="text-sm text-gray-700">
                You're saving Rs. {bestCoupon.discountAmount} on this order
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bundle Suggestions */}
      {bundles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-red-600" />
              Bundle Deals (Extra Savings)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {bundles.slice(0, 2).map((bundle) => (
              <div
                key={bundle.id}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{bundle.name}</h4>
                  <span className="text-sm bg-red-100 text-red-700 px-2 py-1 rounded font-semibold">
                    Save {bundle.savingsPercent}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-gray-600">Bundle Price: </span>
                    <span className="font-bold text-red-600">
                      Rs. {bundle.bundlePrice}
                    </span>
                    <span className="line-through text-gray-400 ml-2">
                      Rs. {bundle.regularPrice}
                    </span>
                  </div>
                  <span className="text-green-600 font-semibold">
                    Save Rs. {bundle.savings}
                  </span>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3">
                  View Bundle
                </Button>
              </div>
            ))}
            {bundles.length > 2 && (
              <p className="text-sm text-center text-gray-600">
                +{bundles.length - 2} more bundle deals available
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* AI Optimization Summary */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-blue-900 mb-1">
                AI Checkout Optimization Active
              </p>
              <p className="text-gray-700">
                We've analyzed your cart and applied the best available savings.
                {bundles.length > 0 && (
                  <span>
                    {" "}
                    Check bundle deals above for additional {bundles[0].potentialSavings || 0}% savings!
                  </span>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

