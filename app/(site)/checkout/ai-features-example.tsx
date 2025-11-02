/**
 * Example Checkout Page with AI Features
 * Shows how to integrate CheckoutHelper component
 */

import CheckoutHelper from "@/components/CheckoutHelper";

// Add this to your existing checkout page

export default function CheckoutPageExample() {
  // Mock data - replace with real cart data
  const userId = "user123"; // Get from auth
  const cartTotal = 1500; // Calculate from cart
  const cartItems = [
    { id: "prod_001", name: "Red Chili", price: 299, quantity: 2 },
    { id: "prod_002", name: "Garam Masala", price: 399, quantity: 1 },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Address, Payment, etc */}
        <div className="lg:col-span-2 space-y-6">
          {/* Your existing checkout form */}
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
            {/* Address form */}
          </div>

          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
            {/* Payment options */}
          </div>
        </div>

        {/* Right Column: Order Summary + AI Helper */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>Rs. {cartTotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Rs. 150</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span>Rs. {cartTotal + 150}</span>
              </div>
            </div>
          </div>

          {/* AI-Powered Checkout Helper */}
          <CheckoutHelper
            userId={userId}
            cartTotal={cartTotal}
            cartItems={cartItems}
          />
        </div>
      </div>
    </div>
  );
}

