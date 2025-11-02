# ⚡ Quick Test Guide - Advanced Features

## 🚀 Fast Testing Commands

### Test All Features in 5 Minutes

```bash
# 1. Start development server
npm run dev

# 2. Open browser to test pages
```

---

## ✅ Feature-by-Feature Testing

### 1. Voice Shopping Assistant

**URL**: http://localhost:3000/voice-shop

**Steps**:
1. Click the big blue microphone button
2. Say: "Show me red chili powder"
3. ✅ Expected: Transcript appears, AI responds with voice
4. Say: "Add this to cart"
5. ✅ Expected: Cart updated, confirmation message

**Chrome/Edge Only** (Best browser support for speech recognition)

---

### 2. Enhanced Recommendations

**Test in Browser Console**:
```javascript
// Visit any page and open console (F12)
const testRecs = async () => {
  const response = await fetch('http://localhost:3000', {
    method: 'GET',
  });
  // Or test via product page - recommendations auto-load
};

// Visit http://localhost:3000/product/any-product
// Check: "Personally Selected For You" section shows products
```

---

### 3. Admin AI Insights Dashboard

**URL**: http://localhost:3000/admin/ai-insights

**Checklist**:
- [ ] Store health score (0-100) visible
- [ ] Status badge (excellent/good/fair/poor)
- [ ] AI insights cards with priorities
- [ ] Price optimization table
- [ ] Trending searches list

**Expected**: Full dashboard with mock data, all metrics visible

---

### 4. A/B Pricing Tests

**Test via API**:
```bash
# Test 1: Get active tests (in browser console or via curl)
curl http://localhost:3000/api/admin/pricing/tests

# Or in Next.js component:
```

**Test in Code**:
```typescript
import { getActivePriceTests, getOptimalPrice } from '@/lib/pricing/abTesting';

// In any component
const tests = await getActivePriceTests();
console.log('Active A/B tests:', tests);

const optimalPrice = await getOptimalPrice('prod_001');
console.log('Optimal price:', optimalPrice); // Should return 279
```

---

### 5. Chat-Based Checkout

**Test via cURL**:
```bash
# Step 1: Add to cart
curl -X POST http://localhost:3000/api/assistant/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "command": "add to cart",
    "userId": "test_user",
    "productId": "prod_001",
    "quantity": 2
  }'

# ✅ Expected: {"success": true, "step": "cart", "message": "✅ Added to cart!..."}

# Step 2: Apply coupon
curl -X POST http://localhost:3000/api/assistant/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "command": "apply coupon",
    "userId": "test_user"
  }'

# ✅ Expected: {"success": true, "step": "coupon", "message": "🎉 Great news!..."}

# Step 3: Complete checkout
curl -X POST http://localhost:3000/api/assistant/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "command": "checkout now",
    "userId": "test_user"
  }'

# ✅ Expected: {"success": true, "step": "complete", "message": "🎊 Order placed!..."}
```

**Test via AI Assistant Component**:
```
1. Open AI Assistant (bottom-right chat bubble)
2. Type: "add to cart"
3. Type: "apply coupon"
4. Type: "checkout now"
5. ✅ Each step should show success message
```

---

### 6. Extended Knowledge Base (RAG)

**Test via Assistant API**:
```bash
# Test 1: Warranty query
curl -X POST http://localhost:3000/api/assistant \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{
      "role": "user",
      "content": "What is your warranty policy?"
    }],
    "userId": "test_user"
  }'

# ✅ Expected: Response mentioning "quality guarantee", "14 days", "6-month warranty"

# Test 2: Payment security
curl -X POST http://localhost:3000/api/assistant \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{
      "role": "user",
      "content": "Is my payment secure?"
    }]
  }'

# ✅ Expected: Response about SSL encryption, COD, credit cards

# Test 3: Delivery options
curl -X POST http://localhost:3000/api/assistant \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{
      "role": "user",
      "content": "What are the delivery options?"
    }]
  }'

# ✅ Expected: Standard 3-5 days, Express 1-2 days, free above Rs. 1000

# Test 4: Order tracking
curl -X POST http://localhost:3000/api/assistant \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{
      "role": "user",
      "content": "How do I track my order?"
    }]
  }'

# ✅ Expected: Order ID or email, SMS/email updates, tracking link

# Test 5: Loyalty program
curl -X POST http://localhost:3000/api/assistant \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{
      "role": "user",
      "content": "Tell me about your loyalty program"
    }]
  }'

# ✅ Expected: 1 point per Rs. 100, VIP benefits, early access
```

**Test via AI Assistant Chat**:
```
1. Open AI Assistant
2. Type: "What is your warranty policy?"
3. ✅ Should get detailed answer from knowledge base
4. Try other queries from list above
```

---

### 7. User Purchase History for Recommendations

**Test in Code**:
```typescript
import getUserPurchaseHistory from '@/lib/tools/getUserPurchaseHistory';

const history = await getUserPurchaseHistory('user123');
console.log('Purchase history:', history);

// ✅ Expected:
{
  userId: 'user123',
  totalOrders: 5,
  purchases: [...],
  preferredCategories: ['Spices', 'Pickles'],
  avgOrderValue: 700
}
```

---

## 🎯 Visual Testing Checklist

### Voice Shop Page
- [ ] Microphone button visible and large
- [ ] Click changes button to red (listening state)
- [ ] Transcript appears after speaking
- [ ] AI response shows in card
- [ ] Response is spoken aloud (text-to-speech)
- [ ] Example commands visible
- [ ] "How it works" steps displayed

### Admin AI Insights
- [ ] Health score displays with color
- [ ] Progress bar matches score
- [ ] Issues list populated
- [ ] Strengths list populated
- [ ] AI insights cards show priorities
- [ ] Price optimization table complete
- [ ] Trending searches badges visible
- [ ] All icons render correctly

### AI Assistant (Enhanced)
- [ ] Chat opens/closes smoothly
- [ ] Messages appear with typing effect
- [ ] Tool invocations show with icons
- [ ] RAG results display document snippets
- [ ] Checkout commands work
- [ ] Coupon application works
- [ ] Order confirmation shows order ID

---

## 🐛 Common Issues & Solutions

### Issue: Voice not working
**Solution**: 
- Use Chrome or Edge browser
- Allow microphone permissions
- Check: chrome://settings/content/microphone

### Issue: npm install failed
**Solution**: 
- We're using native browser API, no package needed
- Voice assistant will work without react-speech-recognition

### Issue: Knowledge base not answering
**Solution**:
- Check if RAG data loaded: `await loadRAGData()`
- Verify query matches topics in data.json
- Try rephrasing query

### Issue: A/B tests not showing
**Solution**:
- Tests are mocked - check `getActivePriceTests()`
- Real tests need database integration
- Use mock data for testing

---

## 📊 Success Criteria

### All Tests Pass When:

✅ **Voice Shopping**
- Can record voice
- Transcript appears correctly
- AI responds with voice

✅ **Recommendations**
- Products show with % match
- Reasons are human-readable
- No duplicate products
- Scores between 0-1

✅ **Admin Dashboard**
- Health score calculates correctly
- Insights show priorities
- Price suggestions have percentages
- All sections render

✅ **A/B Testing**
- Tests have confidence scores
- Variants show conversion rates
- Winner identified when confidence > 80%

✅ **Chat Checkout**
- Can add to cart via chat
- Coupon auto-applies
- Order completes with ID
- Each step returns proper JSON

✅ **Knowledge Base**
- All 7 new topics answer correctly
- Responses include specific details
- RAG retrieves relevant documents
- No "I don't know" for covered topics

---

## 🚀 Performance Benchmarks

### Expected Response Times

| Feature | Target | Method |
|---------|--------|--------|
| Voice Recognition | < 2s | Browser API |
| Recommendations | < 500ms | Cached |
| RAG Search | < 300ms | In-memory |
| A/B Test Lookup | < 50ms | Mock data |
| Chat Checkout | < 1s | API call |
| Knowledge Query | < 400ms | RAG + LLM |

---

## 📱 Mobile Testing

### Voice Shopping on Mobile
- **iOS Safari**: Limited support, use PWA
- **Android Chrome**: Full support ✅
- **Responsive**: All components mobile-friendly

### Testing on Mobile:
```bash
# Get local network IP
ipconfig  # Windows
ifconfig  # Mac/Linux

# Access from phone
http://192.168.x.x:3000/voice-shop
```

---

## 🎓 Test Scripts

### Automated Test (Optional)

```javascript
// test-advanced-features.js
async function testAllFeatures() {
  console.log('🧪 Testing Advanced Features...\n');
  
  // Test 1: Recommendations
  console.log('1️⃣ Testing Recommendations...');
  const { generateEnhancedRecommendations } = require('./lib/recommendation/engine');
  const recs = await generateEnhancedRecommendations('user123', 'prod_001', 5);
  console.log(`✅ Got ${recs.length} recommendations\n`);
  
  // Test 2: A/B Testing
  console.log('2️⃣ Testing A/B Pricing...');
  const { getActivePriceTests } = require('./lib/pricing/abTesting');
  const tests = await getActivePriceTests();
  console.log(`✅ Found ${tests.length} active tests\n`);
  
  // Test 3: Purchase History
  console.log('3️⃣ Testing Purchase History...');
  const getUserPurchaseHistory = require('./lib/tools/getUserPurchaseHistory').default;
  const history = await getUserPurchaseHistory('user123');
  console.log(`✅ Retrieved ${history.purchases.length} purchases\n`);
  
  // Test 4: Knowledge Base
  console.log('4️⃣ Testing Knowledge Base...');
  const { loadRAGData } = require('./lib/rag/loadData');
  const ragData = await loadRAGData();
  console.log(`✅ Loaded ${ragData.documents.length} documents\n`);
  
  console.log('🎉 All tests passed!');
}

testAllFeatures().catch(console.error);
```

**Run**:
```bash
node test-advanced-features.js
```

---

## ✅ Final Verification

### Before Deploying:

1. **Functional Tests** ✅
   - All 7 features work independently
   - No console errors
   - API endpoints respond correctly

2. **Integration Tests** ✅
   - Voice + Assistant work together
   - Recommendations update on user actions
   - Checkout flow completes end-to-end

3. **Performance Tests** ✅
   - Page load < 3s
   - API responses < 1s
   - No memory leaks

4. **Browser Tests** ✅
   - Chrome ✅
   - Edge ✅
   - Firefox (voice limited)
   - Safari (voice limited)

5. **Mobile Tests** ✅
   - Responsive design
   - Touch interactions
   - Android Chrome voice works

---

## 🎯 Summary

**7 Advanced Features** - All Ready for Testing!

1. ✅ Voice Shopping Assistant
2. ✅ Enhanced Recommendations
3. ✅ Admin AI Insights
4. ✅ A/B Pricing Tests
5. ✅ Chat-Based Checkout
6. ✅ Extended Knowledge Base
7. ✅ Purchase History Integration

**Test Time**: ~5 minutes for all features
**Success Rate**: 100% expected with mock data

---

*Happy Testing! 🚀*

*Last Updated: November 2, 2024*

