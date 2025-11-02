# AI Integration Usage Examples

## Quick Start Guide

This document provides practical examples for using the AI integration features.

---

## 🎯 Common Use Cases

### 1. Product Search with AI

**Customer Query:** "I'm looking for spicy red chilies"

**AI Response:**
```
Based on what I found (confidence: 92.5%):

Red chili powder is made from dried red chillies ground into a fine powder. 
It adds heat and color to dishes. Available in various heat levels from mild 
to very hot.

Related information:
1. Kashmiri red chili is known for its vibrant color and mild heat...
2. Premium quality red chili powder at Rs. 299...
```

**Behind the scenes:**
- RAG searches vector database
- Returns top 3 matching documents
- Presents formatted response

---

### 2. Order Status Inquiry

**Customer Query:** "What's the status of my order?"

**Command:**
```
/tool getOrderStatus {"orderId":"ORD-12345"}
```

**Response:**
```json
{
  "orderId": "ORD-12345",
  "status": "shipped",
  "trackingNumber": "TCS1234567890",
  "currentLocation": "Lahore Distribution Center",
  "estimatedDelivery": "2024-11-05T14:30:00Z",
  "history": [...]
}
```

---

### 3. Smart Product Recommendations

**Scenario:** User adds Red Chili Powder to cart

**Tool Call:**
```typescript
const recommendations = await mcpTools.getRecommendations("user123");
```

**Result:**
```json
{
  "recommendations": [
    {
      "productId": "prod_rec_001",
      "name": "Turmeric Powder",
      "reason": "Often purchased together",
      "confidence": 0.89,
      "price": 250
    },
    {
      "productId": "prod_rec_002",
      "name": "Coriander Powder",
      "reason": "Complements your selection",
      "confidence": 0.76,
      "price": 200
    }
  ]
}
```

---

### 4. Complementary Products

**Scenario:** Show products that go well together

```typescript
import mcpTools from '@/lib/tools';

const complementary = await mcpTools.findComplementaryProducts("prod_001");

console.log(complementary.complementaryProducts);
// [
//   { name: "Turmeric Powder", matchScore: 0.94 },
//   { name: "Coriander Powder", matchScore: 0.88 },
//   { name: "Garam Masala", matchScore: 0.82 }
// ]
```

**UI Implementation:**
```tsx
<section className="mt-8">
  <h3>Frequently Bought Together</h3>
  <div className="grid grid-cols-3 gap-4">
    {complementary.complementaryProducts.map(product => (
      <ProductCard key={product.id} product={product} />
    ))}
  </div>
</section>
```

---

### 5. Cart Optimization with Coupons

**Scenario:** User has Rs. 650 in cart

```typescript
const cartTotal = 650;
const userId = "user123";

const coupon = await mcpTools.applyBestCoupon(userId, cartTotal);

if (coupon.success) {
  console.log(`Save Rs. ${coupon.discountAmount}!`);
  console.log(`Code: ${coupon.coupon.code}`);
  console.log(`New Total: Rs. ${coupon.newTotal}`);
}
```

**Output:**
```
Save Rs. 130!
Code: SPICE20
New Total: Rs. 520
```

---

### 6. Bundle Suggestions

**Scenario:** Suggest bundles based on cart contents

```typescript
const cartItems = ["prod_001", "prod_002", "prod_003"];
const bundles = await mcpTools.suggestBundles(cartItems);

console.log(`You could save Rs. ${bundles.potentialSavings}!`);
bundles.suggestedBundles.forEach(bundle => {
  console.log(`${bundle.name}: Rs. ${bundle.bundlePrice} (${bundle.savingsPercent}% off)`);
});
```

---

### 7. Help & Support Queries

**Customer Query:** "What's your shipping policy?"

**RAG Search:**
```typescript
import { searchHelp } from '@/lib/rag';

const results = await searchHelp("shipping policy", 3);
const answer = results.topResult.document.content;

console.log(answer);
// "Shipping policy: Free shipping on orders above Rs. 1000. 
//  Standard delivery takes 3-5 business days..."
```

---

### 8. Product Comparison

**Scenario:** Compare 3 spice products

```typescript
const productIds = ["prod_001", "prod_002", "prod_003"];
const comparison = await mcpTools.compareProducts(productIds);

console.log(comparison.comparisonMatrix);
// {
//   priceRange: [300, 400],
//   avgRating: 4.3,
//   bestValue: "prod_001"
// }
```

**UI Display:**
```tsx
<table>
  <thead>
    <tr>
      <th>Feature</th>
      {comparison.products.map(p => <th key={p.id}>{p.name}</th>)}
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Price</td>
      {comparison.products.map(p => <td key={p.id}>Rs. {p.price}</td>)}
    </tr>
    <tr>
      <td>Rating</td>
      {comparison.products.map(p => <td key={p.id}>{p.rating} ⭐</td>)}
    </tr>
  </tbody>
</table>
```

---

### 9. Admin: Low Stock Alert

**Admin Tool:**
```typescript
const lowStock = await mcpTools.getLowStockItems(10);

console.log(`${lowStock.criticalCount} items need immediate attention`);

lowStock.items.forEach(item => {
  if (item.urgency === "high") {
    console.log(`⚠️ ${item.name}: Only ${item.currentStock} left!`);
  }
});
```

**Admin Dashboard:**
```tsx
<Alert variant="destructive">
  <AlertTitle>Low Stock Alert</AlertTitle>
  <AlertDescription>
    {lowStock.criticalCount} products need immediate reordering
  </AlertDescription>
</Alert>
```

---

### 10. Admin: Price Optimization

**Scenario:** Optimize product pricing

```typescript
const suggestion = await mcpTools.suggestPriceChange("prod_001");

console.log(`Current: Rs. ${suggestion.currentPrice}`);
console.log(`Suggested: Rs. ${suggestion.suggestedPrice}`);
console.log(`Reason: ${suggestion.reasoning.marketTrend}`);
console.log(`Expected revenue increase: ${suggestion.projectedImpact.revenueIncrease}`);
```

---

### 11. Admin: Analytics Dashboard

**Get Sales Analytics:**
```typescript
const analytics = await mcpTools.getAnalytics("sales");

console.log(`Today: Rs. ${analytics.data.today}`);
console.log(`This Month: Rs. ${analytics.data.thisMonth}`);
console.log(`Growth: ${analytics.data.growth}`);
console.log(`Top Products:`, analytics.data.topProducts);
```

**Get Inventory Analytics:**
```typescript
const inventory = await mcpTools.getAnalytics("inventory");

console.log(`Total Products: ${inventory.data.totalProducts}`);
console.log(`Low Stock: ${inventory.data.lowStock}`);
console.log(`Out of Stock: ${inventory.data.outOfStock}`);
console.log(`Total Value: Rs. ${inventory.data.totalValue}`);
```

---

### 12. Query Expansion for Better Search

**Scenario:** Expand user's search query

```typescript
const expansion = await mcpTools.expandQuery("chili");

console.log("Original:", expansion.originalQuery);
console.log("Expanded:", expansion.expandedTerms);
// ["chili", "chili powder", "organic chili", "chili spice"]
console.log("Synonyms:", expansion.synonyms);
// ["masala", "seasoning", "blend"]
```

---

### 13. Return/Refund Initiation

**Customer Request:** "I want to return this product"

```typescript
const returnRequest = await mcpTools.initiateReturn(
  "ORD-12345",
  "prod_001",
  "Product not as expected"
);

console.log(`Return ID: ${returnRequest.returnId}`);
console.log(`Status: ${returnRequest.status}`);
console.log(`Refund Amount: Rs. ${returnRequest.estimatedRefundAmount}`);
console.log(`Instructions: ${returnRequest.returnInstructions}`);
```

---

### 14. User Profile Update

**Update user information:**
```typescript
const updated = await mcpTools.updateUserInfo("user123", {
  phone: "+92-300-9876543",
  address: "456 New St, Karachi"
});

console.log("Updated fields:", updated.updatedFields);
console.log("New phone:", updated.user.phone);
```

---

### 15. Fraud Detection

**Flag suspicious activity:**
```typescript
const flag = await mcpTools.flagUserActivity("user123", "suspicious");

console.log(`Flag ID: ${flag.flagId}`);
console.log(`Severity: ${flag.severity}`);
console.log("Actions:", flag.actions);
// [
//   "Account temporarily limited",
//   "Manual review required",
//   "Notification sent to admin"
// ]
```

---

## 🎨 Frontend Integration Examples

### Example 1: Product Page with AI Features

```tsx
'use client';

import { useState, useEffect } from 'react';
import mcpTools from '@/lib/tools';
import AIAssistant from '@/components/AIAssistant';

export default function ProductPage({ productId }: { productId: string }) {
  const [recommendations, setRecommendations] = useState([]);
  const [complementary, setComplementary] = useState([]);

  useEffect(() => {
    // Load AI-powered features
    async function loadAIFeatures() {
      const [recs, comps] = await Promise.all([
        mcpTools.getRecommendations(userId),
        mcpTools.findComplementaryProducts(productId),
      ]);
      
      setRecommendations(recs.recommendations);
      setComplementary(comps.complementaryProducts);
    }
    
    loadAIFeatures();
  }, [productId]);

  return (
    <div>
      {/* Product details */}
      
      {/* AI Recommendations */}
      <section className="mt-8">
        <h3>Recommended for You</h3>
        <ProductGrid products={recommendations} />
      </section>

      {/* Complementary Products */}
      <section className="mt-8">
        <h3>Frequently Bought Together</h3>
        <ProductGrid products={complementary} />
      </section>

      {/* AI Assistant */}
      <AIAssistant userId={userId} />
    </div>
  );
}
```

### Example 2: Cart Page with Smart Coupons

```tsx
'use client';

import { useState, useEffect } from 'react';
import mcpTools from '@/lib/tools';

export default function CartPage({ cart }: { cart: Cart }) {
  const [bestCoupon, setBestCoupon] = useState(null);
  const [bundles, setBundles] = useState([]);

  useEffect(() => {
    async function optimizeCart() {
      const cartTotal = cart.items.reduce((sum, item) => sum + item.total, 0);
      const cartItemIds = cart.items.map(item => item.productId);

      const [coupon, bundleSuggestions] = await Promise.all([
        mcpTools.applyBestCoupon(userId, cartTotal),
        mcpTools.suggestBundles(cartItemIds),
      ]);

      if (coupon.success) {
        setBestCoupon(coupon);
      }
      setBundles(bundleSuggestions.suggestedBundles);
    }

    optimizeCart();
  }, [cart]);

  return (
    <div>
      {/* Cart items */}

      {bestCoupon && (
        <Alert className="bg-green-50 border-green-200">
          <AlertTitle>🎉 Save Rs. {bestCoupon.discountAmount}!</AlertTitle>
          <AlertDescription>
            Apply code: <strong>{bestCoupon.coupon.code}</strong>
          </AlertDescription>
        </Alert>
      )}

      {bundles.length > 0 && (
        <section className="mt-4">
          <h4>💡 Bundle Deals</h4>
          {bundles.map(bundle => (
            <BundleCard key={bundle.id} bundle={bundle} />
          ))}
        </section>
      )}
    </div>
  );
}
```

### Example 3: Admin Dashboard

```tsx
'use client';

import { useState, useEffect } from 'react';
import mcpTools from '@/lib/tools';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState({});
  const [lowStock, setLowStock] = useState([]);

  useEffect(() => {
    async function loadDashboard() {
      const [sales, inventory, lowStockItems] = await Promise.all([
        mcpTools.getAnalytics('sales'),
        mcpTools.getAnalytics('inventory'),
        mcpTools.getLowStockItems(10),
      ]);

      setAnalytics({ sales: sales.data, inventory: inventory.data });
      setLowStock(lowStockItems.items);
    }

    loadDashboard();
  }, []);

  return (
    <div className="grid grid-cols-3 gap-4">
      <Card>
        <CardTitle>Sales Today</CardTitle>
        <CardContent>
          <p className="text-3xl">Rs. {analytics.sales?.today}</p>
          <p className="text-green-600">{analytics.sales?.growth}</p>
        </CardContent>
      </Card>

      <Card>
        <CardTitle>Inventory</CardTitle>
        <CardContent>
          <p>Total: {analytics.inventory?.totalProducts}</p>
          <p className="text-red-600">Low Stock: {analytics.inventory?.lowStock}</p>
        </CardContent>
      </Card>

      <Card>
        <CardTitle>Critical Items</CardTitle>
        <CardContent>
          {lowStock.slice(0, 5).map(item => (
            <div key={item.productId}>
              {item.name}: {item.currentStock} left
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 📱 Mobile App Integration (Future)

### React Native Example

```typescript
import { useEffect, useState } from 'react';

function ProductScreen({ productId }) {
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    fetch('/api/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{
          role: 'user',
          content: `/tool getRecommendations {"userId":"${userId}"}`
        }]
      })
    })
    .then(res => res.json())
    .then(data => {
      setRecommendations(data.toolInvocations[0].result.recommendations);
    });
  }, [productId]);

  return (
    <View>
      {/* Product UI */}
      <Text>Recommended for You</Text>
      {recommendations.map(rec => (
        <ProductCard key={rec.productId} product={rec} />
      ))}
    </View>
  );
}
```

---

## 🚀 Advanced Patterns

### 1. Chaining Multiple Tools

```typescript
async function smartCheckout(userId: string) {
  // 1. Get cart
  const cart = await getCart(userId);
  
  // 2. Apply best coupon
  const coupon = await mcpTools.applyBestCoupon(userId, cart.total);
  
  // 3. Suggest bundles
  const bundles = await mcpTools.suggestBundles(cart.itemIds);
  
  // 4. Process checkout
  const order = await mcpTools.checkout(userId);
  
  // 5. Log interaction
  await mcpTools.logChatInteraction(userId, "checkout", order);
  
  return { order, coupon, bundles };
}
```

### 2. Hybrid RAG + Tool Search

```typescript
async function intelligentSearch(query: string) {
  // Use RAG for semantic search
  const ragResults = await ragSearch(query, 5);
  
  // Use tool for structured search
  const toolResults = await mcpTools.searchProducts(query);
  
  // Merge and deduplicate
  const combined = mergeResults(ragResults, toolResults);
  
  return combined;
}
```

### 3. Contextual Recommendations

```typescript
async function getContextualRecommendations(userId: string, context: string) {
  const [userRecs, relatedDocs] = await Promise.all([
    mcpTools.getRecommendations(userId),
    searchProducts(context, 3),
  ]);
  
  // Merge based on context
  return smartMerge(userRecs, relatedDocs);
}
```

---

## 💡 Tips & Best Practices

1. **Cache Results**: Store frequently accessed data in Redis
2. **Batch Requests**: Combine multiple tool calls
3. **Error Handling**: Always handle tool failures gracefully
4. **Rate Limiting**: Implement rate limits on AI endpoints
5. **Monitoring**: Track tool usage and performance
6. **A/B Testing**: Test AI features with subsets of users

---

For more examples and documentation, see `docs/AI_INTEGRATION.md`.

