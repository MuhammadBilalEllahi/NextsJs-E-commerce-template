# 🧪 Complete Testing Guide - All AI Features

## Quick Start Testing

### 1. Setup & Start

```bash
# Ensure environment is set
echo "AI_LOGGING=true" >> .env.local

# Install dependencies (if needed)
npm install

# Start development server
npm run dev
```

Server should start at: `http://localhost:3000`

---

## 🎯 Test Each Feature

### Feature 1: AI Product Search

**URL**: `http://localhost:3000/ai-search`

**Steps**:
1. Visit the AI Search page
2. Try these searches:
   - "red chili powder"
   - "organic spices"
   - "traditional masala"
3. Observe:
   - ✅ Search completes in < 200ms
   - ✅ Results appear with relevance scores
   - ✅ AI Insight box shows RAG results
   - ✅ "hybrid" source attribution

**CLI Test**:
```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query":"chili powder","userId":"test-user"}'
```

**Expected Output**:
```json
{
  "success": true,
  "products": [...],
  "ragResults": {...},
  "metadata": {
    "searchTime": 45
  }
}
```

---

### Feature 2: Smart Recommendations

**Location**: Add to any product page

**Test Code** (Create test page):
```tsx
// app/(site)/test-recommendations/page.tsx
"use client";
import SmartRecommendations from '@/components/SmartRecommendations';

export default function TestPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl mb-8">Testing Smart Recommendations</h1>
      <SmartRecommendations 
        productId="prod_001"
        userId="user123"
      />
    </div>
  );
}
```

**Steps**:
1. Visit `http://localhost:3000/test-recommendations`
2. Verify:
   - ✅ "Frequently Bought Together" section appears
   - ✅ Shows 3 complementary products
   - ✅ Each has match score percentage
   - ✅ "Recommended for You" section shows 4 items

---

### Feature 3: AI Description Generator (Admin)

**Test Code** (Create test page):
```tsx
// app/(admin)/admin/test-description/page.tsx
"use client";
import { useState } from 'react';
import AIDescriptionGenerator from '@/components/admin/AIDescriptionGenerator';

export default function TestPage() {
  const [desc, setDesc] = useState('');
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl mb-8">Testing AI Description Generator</h1>
      <AIDescriptionGenerator
        productId="prod_001"
        currentDescription="Basic description"
        onUpdate={setDesc}
      />
      {desc && (
        <div className="mt-4 p-4 border rounded">
          <h3 className="font-bold">Updated Description:</h3>
          <p>{desc}</p>
        </div>
      )}
    </div>
  );
}
```

**Steps**:
1. Visit test page
2. Click "Generate Description"
3. Verify:
   - ✅ Loading state shows
   - ✅ AI description appears in preview
   - ✅ Keywords are displayed
   - ✅ SEO data is shown
   - ✅ "Apply Description" button works

---

### Feature 4: Admin Analytics Dashboard

**URL**: `http://localhost:3000/admin/analytics`

**Steps**:
1. Visit the analytics page
2. Verify Dashboard Shows:
   - ✅ Today's Sales metric
   - ✅ Inventory count with low stock alert
   - ✅ Pending orders count
   - ✅ Average order value
3. Check Low Stock Section:
   - ✅ Lists low stock items
   - ✅ Shows urgency levels (high/medium)
   - ✅ "Optimize Price" button visible
4. Click "Optimize Price":
   - ✅ AI price suggestion appears
   - ✅ Shows current vs suggested price
   - ✅ Displays reasoning and projected impact

**CLI Test**:
```bash
# Test analytics API via assistant
curl -X POST http://localhost:3000/api/assistant \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{
      "role": "user",
      "content": "/tool getAnalytics {\"metricType\":\"sales\"}"
    }]
  }'
```

---

### Feature 5: Global AI Assistant

**Test**: Should be accessible from any page

**Steps**:
1. Add to your main layout (if not already):
```tsx
// app/(site)/layout.tsx
import AIAssistant from '@/components/AIAssistant';

export default function Layout({ children }) {
  return (
    <div>
      {children}
      <AIAssistant defaultMinimized={true} />
    </div>
  );
}
```

2. Visit any page
3. Verify:
   - ✅ Chat button appears bottom-right
   - ✅ Click opens chat interface
   - ✅ Can minimize/maximize
   - ✅ Can send messages
   - ✅ Try: "What spices do you have?"
   - ✅ Try: `/tool searchProducts {"query":"chili"}`

---

### Feature 6: AI-Powered Checkout Helper

**Test Code** (Create test page):
```tsx
// app/(site)/test-checkout/page.tsx
"use client";
import CheckoutHelper from '@/components/CheckoutHelper';

export default function TestPage() {
  const mockCart = [
    { id: 'prod_001', name: 'Red Chili', price: 299 },
    { id: 'prod_002', name: 'Garam Masala', price: 399 },
  ];
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl mb-8">Testing Checkout Helper</h1>
      <CheckoutHelper
        userId="user123"
        cartTotal={698}
        cartItems={mockCart}
      />
    </div>
  );
}
```

**Steps**:
1. Visit test page
2. Verify:
   - ✅ "AI Optimized Savings" card appears
   - ✅ Shows coupon code and discount amount
   - ✅ Displays original vs optimized total
   - ✅ Bundle deals section (if available)
   - ✅ Click "Apply Coupon" changes state

---

### Feature 7: Hybrid Search API

**CLI Tests**:

```bash
# Test 1: Basic search
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query":"red chili","userId":"test-user"}'

# Test 2: Different query
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query":"organic spices","userId":"test-user"}'

# Test 3: Get suggestions
curl http://localhost:3000/api/search
```

**Verify Response**:
```json
{
  "success": true,
  "products": [
    {
      "id": "...",
      "name": "...",
      "price": 299,
      "relevanceScore": 0.95,
      "source": "hybrid"
    }
  ],
  "ragResults": {
    "topResult": {...},
    "totalFound": 3
  },
  "metadata": {
    "keywordMatches": 2,
    "semanticMatches": 3,
    "hybridResults": 1,
    "searchTime": 45
  }
}
```

---

### Feature 8: Extended RAG FAQ

**Test via Assistant API**:

```bash
# Test 1: Return policy
curl -X POST http://localhost:3000/api/assistant \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{
      "role": "user",
      "content": "How do I return my order?"
    }],
    "userId": "test-user"
  }'

# Test 2: Shipping policy
curl -X POST http://localhost:3000/api/assistant \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{
      "role": "user",
      "content": "What are your shipping costs?"
    }],
    "userId": "test-user"
  }'

# Test 3: Contact support
curl -X POST http://localhost:3000/api/assistant \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{
      "role": "user",
      "content": "How do I contact support?"
    }],
    "userId": "test-user"
  }'

# Test 4: Bulk orders
curl -X POST http://localhost:3000/api/assistant \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{
      "role": "user",
      "content": "Can I order in bulk?"
    }],
    "userId": "test-user"
  }'
```

**Verify**:
- ✅ Each query returns relevant FAQ answer
- ✅ RAG confidence score > 70%
- ✅ Response matches FAQ content

---

### Feature 9: User Behavior Logging

**Test Code**:
```typescript
// In any component
import {
  logSearch,
  logProductView,
  logAddToCart,
  logCheckoutStart
} from '@/lib/logging/userBehavior';

// Log search
logSearch('user123', 'red chili powder', 5);

// Log product view
logProductView('user123', 'prod_001', 'Red Chili Powder');

// Log add to cart
logAddToCart('user123', 'prod_001', 2, 299);

// Log checkout
logCheckoutStart('user123', 598, 2);
```

**Verify Logs**:
```bash
# Check log file
cat logs/user-behavior.log

# Should see entries like:
# {"timestamp":"2024-11-02T...","userId":"user123","action":"search","data":{...}}
# {"timestamp":"2024-11-02T...","userId":"user123","action":"product_view","data":{...}}
```

**Test Analytics**:
```bash
# Create test endpoint (optional)
# GET /api/user/behavior/:userId

curl http://localhost:3000/api/user/behavior/user123
```

---

### Feature 10: Personalized User Dashboard

**URL**: `http://localhost:3000/user/dashboard`

**Steps**:
1. Visit the dashboard
2. Verify Sections:
   - ✅ Quick Stats (3 cards):
     - Total Orders
     - Recent Searches  
     - Recommendations
   - ✅ Recent Searches (with clickable tags)
   - ✅ AI Recommendations (4 product cards)
   - ✅ Recent Orders (3 orders)
3. Check Data:
   - ✅ Numbers make sense
   - ✅ Product cards have images
   - ✅ Match scores displayed
   - ✅ Order status badges show correct colors

---

## 🎯 Complete User Journey Test

Test all features in sequence:

```bash
# 1. Start server
npm run dev

# 2. Test AI Search
open http://localhost:3000/ai-search
# Search for: "red chili"

# 3. Test Hybrid Search API
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query":"garam masala","userId":"user123"}'

# 4. View recommendations test page
open http://localhost:3000/test-recommendations

# 5. Test admin analytics
open http://localhost:3000/admin/analytics

# 6. Test user dashboard
open http://localhost:3000/user/dashboard

# 7. Test checkout helper
open http://localhost:3000/test-checkout

# 8. Test FAQ via assistant
curl -X POST http://localhost:3000/api/assistant \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{
      "role": "user",
      "content": "What is your return policy?"
    }]
  }'

# 9. Check behavior logs
cat logs/user-behavior.log

# 10. Test all MCP tools
npm run test:ai
```

---

## 📊 Performance Benchmarks

Run these to check performance:

```bash
# Test search speed
time curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query":"test"}'

# Test assistant response time
time curl -X POST http://localhost:3000/api/assistant \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}]}'
```

**Expected Times**:
- Search API: < 150ms
- Assistant API: < 200ms
- RAG Query: < 50ms

---

## ✅ Final Checklist

- [ ] AI Search page loads and works
- [ ] Smart Recommendations component renders
- [ ] AI Description Generator creates descriptions
- [ ] Admin Analytics dashboard shows metrics
- [ ] Global AI Assistant is accessible
- [ ] Checkout Helper shows coupons
- [ ] Hybrid Search API returns results
- [ ] Extended FAQ answers questions
- [ ] User behavior logs are written
- [ ] User Dashboard displays data
- [ ] All API endpoints respond
- [ ] No console errors
- [ ] Mobile responsive
- [ ] TypeScript compiles without errors

---

## 🐛 Troubleshooting

### Issue: "Module not found"

```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### Issue: Logs not writing

```bash
# Check environment variable
echo $AI_LOGGING  # Should be "true"

# Create logs directory
mkdir -p logs
chmod 755 logs
```

### Issue: API returns 404

```bash
# Verify API route exists
ls -la app/api/search/route.ts
ls -la app/api/assistant/route.ts

# Restart server
npm run dev
```

### Issue: Components not rendering

```bash
# Check imports
# Verify component paths
# Check for TypeScript errors
npm run lint
```

---

## 🎉 Success Criteria

All tests pass if:

✅ **10/10 features** work as expected
✅ **All API endpoints** return valid data
✅ **Components render** without errors
✅ **Logs are written** (if enabled)
✅ **No TypeScript errors**
✅ **Performance** meets benchmarks
✅ **Mobile responsive**

---

## 📚 Next Steps

After testing:

1. **Review Documentation**:
   - `FEATURE_SUMMARY.md` - Overview
   - `docs/AI_EXTENDED_FEATURES.md` - Detailed docs
   - `README_AI_INTEGRATION.md` - Original features

2. **Integrate into Real Pages**:
   - Add `SmartRecommendations` to product pages
   - Add `CheckoutHelper` to checkout page
   - Add `AIAssistant` to main layout
   - Link to `/ai-search` from navigation

3. **Production Prep**:
   - Test with real data
   - Add authentication
   - Set up monitoring
   - Configure logging
   - Deploy!

---

*Last Updated: November 2, 2024*
*All 10 Features Ready for Production* ✅

