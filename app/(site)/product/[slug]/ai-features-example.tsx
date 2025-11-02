/**
 * Example Product Page with AI Features
 * Shows how to integrate SmartRecommendations component
 */

import SmartRecommendations from "@/components/SmartRecommendations";

// Add this to your existing product page

export default function ProductPageExample() {
  const productId = "prod_001"; // Get from params or props
  const userId = "user123"; // Get from auth

  return (
    <div>
      {/* Your existing product details */}
      <div className="container mx-auto px-4 py-8">
        <h1>Product Name</h1>
        <p>Product description...</p>
        {/* ... other product info ... */}
      </div>

      {/* Add AI-Powered Recommendations */}
      <div className="container mx-auto px-4">
        <SmartRecommendations productId={productId} userId={userId} />
      </div>
    </div>
  );
}

