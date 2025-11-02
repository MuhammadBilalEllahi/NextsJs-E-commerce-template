# 🔌 Integration Guide - Add AI to Your Existing Pages

## Quick Integration Checklist

- [ ] Environment variables set up
- [ ] Dev server running
- [ ] API tested
- [ ] Component added to a page
- [ ] First chat interaction tested

---

## 1. Add to Homepage

```tsx
// app/(site)/page.tsx
import AIAssistant from '@/components/AIAssistant';

export default function HomePage() {
  return (
    <div>
      {/* Your existing homepage content */}
      <HeroSection />
      <FeaturedProducts />
      <Testimonials />
      
      {/* Add AI Assistant */}
      <AIAssistant defaultMinimized={true} />
    </div>
  );
}
```

---

## 2. Add to Product Page

```tsx
// app/(site)/product/page.tsx
'use client';

import { useState, useEffect } from 'react';
import AIAssistant from '@/components/AIAssistant';
import mcpTools from '@/lib/tools';

export default function ProductPage({ params }: { params: { slug: string } }) {
  const [recommendations, setRecommendations] = useState([]);
  const [complementary, setComplementary] = useState([]);

  useEffect(() => {
    // Load AI-powered features
    async function loadAI() {
      const [recs, comps] = await Promise.all([
        mcpTools.getRecommendations(userId),
        mcpTools.findComplementaryProducts(productId),
      ]);
      
      setRecommendations(recs.recommendations);
      setComplementary(comps.complementaryProducts);
    }
    
    loadAI();
  }, [productId]);

  return (
    <div>
      {/* Product details */}
      
      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <section className="mt-8">
          <h3 className="text-xl font-bold mb-4">Recommended for You</h3>
          <div className="grid grid-cols-4 gap-4">
            {recommendations.map((rec) => (
              <ProductCard key={rec.productId} product={rec} />
            ))}
          </div>
        </section>
      )}

      {/* Complementary Products */}
      {complementary.length > 0 && (
        <section className="mt-8">
          <h3 className="text-xl font-bold mb-4">Frequently Bought Together</h3>
          <div className="grid grid-cols-3 gap-4">
            {complementary.map((comp) => (
              <ProductCard key={comp.id} product={comp} />
            ))}
          </div>
        </section>
      )}

      {/* AI Assistant */}
      <AIAssistant />
    </div>
  );
}
```

---

## 3. Add to Cart Page

```tsx
// app/(site)/cart/page.tsx
'use client';

import { useState, useEffect } from 'react';
import AIAssistant from '@/components/AIAssistant';
import mcpTools from '@/lib/tools';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function CartPage() {
  const [bestCoupon, setBestCoupon] = useState(null);
  const [bundles, setBundles] = useState([]);
  const cart = useCart(); // Your existing cart hook

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

    if (cart.items.length > 0) {
      optimizeCart();
    }
  }, [cart.items]);

  return (
    <div>
      {/* Cart items */}

      {/* AI Coupon Suggestion */}
      {bestCoupon && (
        <Alert className="bg-green-50 border-green-200 mb-4">
          <AlertTitle className="text-green-800">
            🎉 Save Rs. {bestCoupon.discountAmount}!
          </AlertTitle>
          <AlertDescription className="text-green-700">
            Apply code: <strong className="font-mono">{bestCoupon.coupon.code}</strong>
          </AlertDescription>
        </Alert>
      )}

      {/* Bundle Suggestions */}
      {bundles.length > 0 && (
        <section className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-bold mb-2">💡 Bundle Deals</h4>
          {bundles.map(bundle => (
            <div key={bundle.id} className="mb-2 p-2 bg-white rounded">
              <p className="font-semibold">{bundle.name}</p>
              <p className="text-sm">
                Rs. {bundle.bundlePrice} 
                <span className="line-through text-gray-500 ml-2">
                  Rs. {bundle.regularPrice}
                </span>
                <span className="text-green-600 ml-2">
                  Save {bundle.savingsPercent}%
                </span>
              </p>
            </div>
          ))}
        </section>
      )}

      {/* AI Assistant */}
      <AIAssistant />
    </div>
  );
}
```

---

## 4. Add to Admin Dashboard

```tsx
// app/(admin)/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import mcpTools from '@/lib/tools';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<any>({});
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [sales, inventory, orders, lowStockItems] = await Promise.all([
          mcpTools.getAnalytics('sales'),
          mcpTools.getAnalytics('inventory'),
          mcpTools.getAnalytics('orders'),
          mcpTools.getLowStockItems(10),
        ]);

        setAnalytics({
          sales: sales.data,
          inventory: inventory.data,
          orders: orders.data,
        });
        setLowStock(lowStockItems.items);
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
    
    // Refresh every 5 minutes
    const interval = setInterval(loadDashboard, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">AI-Powered Dashboard</h1>

      {/* Critical Alerts */}
      {lowStock.filter(i => i.urgency === 'high').length > 0 && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>⚠️ Critical Stock Alert</AlertTitle>
          <AlertDescription>
            {lowStock.filter(i => i.urgency === 'high').length} products need immediate attention
          </AlertDescription>
        </Alert>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Today's Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              Rs. {analytics.sales?.today?.toLocaleString() || 0}
            </p>
            <p className="text-sm text-green-600">{analytics.sales?.growth || '+0%'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{analytics.inventory?.totalProducts || 0}</p>
            <p className="text-sm text-red-600">
              {analytics.inventory?.lowStock || 0} low stock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Pending Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{analytics.orders?.pending || 0}</p>
            <p className="text-sm text-gray-600">
              {analytics.orders?.shipped || 0} shipped today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Avg Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              Rs. {analytics.orders?.avgOrderValue || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Items */}
      <Card>
        <CardHeader>
          <CardTitle>Low Stock Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {lowStock.slice(0, 5).map(item => (
              <div 
                key={item.productId} 
                className="flex justify-between items-center p-2 bg-gray-50 rounded"
              >
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-600">
                    Stock: {item.currentStock} (Reorder at: {item.reorderLevel})
                  </p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  item.urgency === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {item.urgency}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 5. Add Search with AI

```tsx
// app/(site)/search/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { ragSearch } from '@/lib/rag';
import mcpTools from '@/lib/tools';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [ragResults, setRAGResults] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSearch() {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      // Combine traditional and AI search
      const [productResults, semanticResults] = await Promise.all([
        mcpTools.searchProducts(query),
        ragSearch(query, 5, 'products'),
      ]);

      setResults(productResults);
      setRAGResults(semanticResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
      {/* Search Input */}
      <div className="mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search products..."
          className="w-full px-4 py-2 border rounded-lg"
        />
        <button 
          onClick={handleSearch}
          className="mt-2 px-6 py-2 bg-red-600 text-white rounded-lg"
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* AI Insights */}
      {ragResults && ragResults.topResult && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-bold mb-2">🤖 AI Insight</h3>
          <p>{ragResults.topResult.document.content}</p>
          <p className="text-sm text-gray-600 mt-2">
            Confidence: {(ragResults.topResult.score * 100).toFixed(1)}%
          </p>
        </div>
      )}

      {/* Results */}
      <div className="grid grid-cols-4 gap-4">
        {results.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
```

---

## 6. Global Layout Integration

```tsx
// app/(site)/layout.tsx
import AIAssistant from '@/components/AIAssistant';
import { getServerSession } from 'next-auth';

export default async function SiteLayout({ children }) {
  const session = await getServerSession();

  return (
    <div>
      <Header />
      <main>{children}</main>
      <Footer />
      
      {/* Global AI Assistant - available on all pages */}
      {session?.user && (
        <AIAssistant 
          userId={session.user.id}
          defaultMinimized={true}
        />
      )}
    </div>
  );
}
```

---

## 7. Custom Hook for AI Features

```tsx
// lib/hooks/useAIFeatures.tsx
'use client';

import { useState, useEffect } from 'react';
import mcpTools from '@/lib/tools';

export function useProductRecommendations(userId: string, productId?: string) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const recs = await mcpTools.getRecommendations(userId);
        setRecommendations(recs.recommendations);
      } catch (error) {
        console.error('Error loading recommendations:', error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId, productId]);

  return { recommendations, loading };
}

export function useCartOptimization(userId: string, cartTotal: number) {
  const [coupon, setCoupon] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const result = await mcpTools.applyBestCoupon(userId, cartTotal);
        if (result.success) {
          setCoupon(result);
        }
      } catch (error) {
        console.error('Error optimizing cart:', error);
      } finally {
        setLoading(false);
      }
    }
    if (cartTotal > 0) {
      load();
    }
  }, [userId, cartTotal]);

  return { coupon, loading };
}
```

---

## 8. API Route for Custom Integration

```typescript
// app/api/products/ai-search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mcpTools from '@/lib/tools';
import { ragSearch } from '@/lib/rag';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    // Combine MCP tool and RAG
    const [toolResults, semanticResults] = await Promise.all([
      mcpTools.searchProducts(query),
      ragSearch(query, 5, 'products'),
    ]);

    return NextResponse.json({
      success: true,
      products: toolResults,
      semantic: semanticResults,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Search failed' },
      { status: 500 }
    );
  }
}
```

---

## 9. Server Component Integration

```tsx
// app/(site)/recommendations/page.tsx
import { getServerSession } from 'next-auth';
import mcpTools from '@/lib/tools';

export default async function RecommendationsPage() {
  const session = await getServerSession();
  
  // Server-side AI call
  const recommendations = await mcpTools.getRecommendations(session?.user?.id || 'guest');

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Recommended for You</h1>
      
      <div className="grid grid-cols-4 gap-4">
        {recommendations.recommendations.map((rec) => (
          <ProductCard key={rec.productId} product={rec} />
        ))}
      </div>
    </div>
  );
}
```

---

## 10. Mobile Responsive Integration

```tsx
// components/MobileAIAssistant.tsx
'use client';

import { useState } from 'react';
import AIAssistant from './AIAssistant';

export default function MobileAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile FAB Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 w-14 h-14 bg-red-600 text-white rounded-full shadow-lg md:hidden z-50"
      >
        🤖
      </button>

      {/* Fullscreen Mobile Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-white z-50 md:hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-bold">AI Assistant</h2>
            <button onClick={() => setIsOpen(false)}>✕</button>
          </div>
          <AIAssistant />
        </div>
      )}

      {/* Desktop Version */}
      <div className="hidden md:block">
        <AIAssistant />
      </div>
    </>
  );
}
```

---

## Testing Your Integration

### 1. Test API
```bash
curl http://localhost:3000/api/assistant
```

### 2. Test Component
Visit your page and click the chat icon

### 3. Test Features
- Try search queries
- Use tool commands
- Check recommendations
- Verify logging (if enabled)

---

## Troubleshooting

### Component not showing?
- Check if imported correctly
- Verify component is in the render tree
- Check console for errors

### API not responding?
- Verify dev server is running
- Check `/api/assistant` endpoint
- Review server logs

### Tools returning errors?
- Check tool name spelling
- Verify parameters match
- Review `lib/tools/index.ts`

---

## Best Practices

1. **Lazy Load** - Use dynamic imports for AI components
2. **Error Boundaries** - Wrap AI components in error boundaries
3. **Loading States** - Show loading indicators
4. **Caching** - Cache AI results when possible
5. **Analytics** - Track AI feature usage
6. **User Feedback** - Collect feedback on AI responses

---

For more examples, see `docs/AI_USAGE_EXAMPLES.md`

