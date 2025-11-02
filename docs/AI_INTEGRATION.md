# AI Integration Documentation

## Overview

This document describes the AI integration features in the Delhi Mirch e-commerce platform, including **MCP (Model Context Protocol)** tools and **RAG (Retrieval-Augmented Generation)** capabilities.

---

## 📁 Directory Structure

```
lib/
├── tools/                 # MCP Tools (20 tools)
│   ├── searchProducts.ts
│   ├── addToCart.ts
│   ├── getOrderStatus.ts
│   ├── ... (17 more)
│   └── index.ts
├── rag/                   # RAG System
│   ├── data.json         # Vector data store
│   ├── search.ts         # Search & retrieval
│   ├── embed.ts          # Embedding & similarity
│   ├── loadData.ts       # Data loading
│   └── index.ts
├── logging/               # Logging system
│   ├── logger.ts
│   └── index.ts
└── ai/
    └── types.ts          # Type definitions

app/api/
└── assistant/
    └── route.ts          # Assistant API endpoint

components/
└── AIAssistant.tsx       # Frontend chat component

logs/                     # Log files (created at runtime)
├── mcp.log
├── rag.log
└── assistant.log
```

---

## 🛠️ MCP Tools

### Available Tools (20 total)

#### **Product & Search Tools**

1. `searchProducts(query)` - Search products by text
2. `filterByEmbedding(category)` - Semantic filtering
3. `compareProducts(ids)` - Compare multiple products
4. `findComplementaryProducts(productId)` - Find related items

#### **Cart & Checkout Tools**

5. `addToCart(userId, productId, quantity)` - Add items to cart
6. `checkout(userId)` - Process checkout
7. `applyBestCoupon(userId, cartTotal)` - Apply optimal coupon
8. `suggestBundles(cartItems)` - Suggest product bundles

#### **Order Management Tools**

9. `getOrderStatus(orderId)` - Get order status
10. `getOrderDetails(userId, orderId?)` - Get order details
11. `initiateReturn(orderId, productId, reason)` - Start return

#### **User Management Tools**

12. `updateUserInfo(userId, fields)` - Update user profile
13. `flagUserActivity(userId, activityType)` - Flag suspicious activity

#### **Recommendation Tools**

14. `getRecommendations(userId)` - Get personalized recommendations
15. `expandQuery(text)` - Expand search queries

#### **Admin Tools**

16. `getLowStockItems(limit)` - Get low stock products
17. `generateDescription(productId)` - AI product descriptions
18. `suggestPriceChange(productId)` - Price optimization
19. `getAnalytics(metricType)` - Business analytics

#### **Logging Tools**

20. `logChatInteraction(userId, query, response?)` - Log interactions

### Using MCP Tools

#### From the API:

```typescript
import mcpTools from "@/lib/tools";

// Direct invocation
const results = await mcpTools.searchProducts("red chili");

// Dynamic invocation
const toolName = "addToCart";
const result = await mcpTools[toolName]("user123", "prod_001", 2);
```

#### From Chat Interface:

```
/tool searchProducts {"query":"spices"}
/tool addToCart {"userId":"user123","productId":"prod_001","quantity":2}
/tool getOrderStatus {"orderId":"ORD-12345"}
```

---

## 🔍 RAG System

### Overview

The RAG (Retrieval-Augmented Generation) system provides semantic search over products, help content, and policies using vector embeddings.

### Components

#### 1. **Data Store** (`lib/rag/data.json`)

Contains pre-embedded documents with:

- Product descriptions
- Help articles
- Policy information
- FAQ content

#### 2. **Embedding** (`lib/rag/embed.ts`)

Functions:

- `embedQuery(query)` - Convert text to vector
- `cosineSimilarity(vec1, vec2)` - Calculate similarity
- `euclideanDistance(vec1, vec2)` - Calculate distance
- `normalizeVector(vec)` - Normalize vectors

#### 3. **Search** (`lib/rag/search.ts`)

Functions:

- `ragSearch(query, limit, category?)` - General search
- `searchProducts(query, limit)` - Product-specific search
- `searchHelp(query, limit)` - Help content search
- `hybridSearch(query, limit)` - Combined search
- `getRelatedDocuments(documentId, limit)` - Find related content

#### 4. **Data Loading** (`lib/rag/loadData.ts`)

Functions:

- `loadRAGData()` - Load all documents
- `getDocumentsByCategory(category)` - Filter by category
- `getDocumentById(id)` - Get single document
- `preloadRAGData()` - Preload into cache

### Using RAG

```typescript
import { ragSearch, searchProducts, searchHelp } from "@/lib/rag";

// General search
const results = await ragSearch("red chili powder", 5);

// Product search
const products = await searchProducts("spices", 10);

// Help search
const help = await searchHelp("how to return", 3);

// Access results
console.log(results.topResult.document.content);
console.log(`Found ${results.totalFound} results in ${results.searchTime}ms`);
```

---

## 🌐 Assistant API

### Endpoint: `/api/assistant`

#### POST Request

```typescript
{
  "messages": [
    {
      "role": "user",
      "content": "What spices do you have?"
    }
  ],
  "userId": "user123",
  "sessionId": "session456"
}
```

#### Response

```typescript
{
  "success": true,
  "message": "Response text...",
  "toolInvocations": [
    {
      "tool": "searchProducts",
      "params": { "query": "spices" },
      "result": { ... }
    }
  ],
  "ragResults": {
    "query": "spices",
    "results": [...],
    "totalFound": 5,
    "searchTime": 45
  },
  "metadata": {
    "processingTime": 120,
    "toolsUsed": ["searchProducts"],
    "ragUsed": true
  }
}
```

#### GET Request (Health Check)

```bash
curl http://localhost:3000/api/assistant
```

Returns available tools and capabilities.

---

## 💬 Frontend Component

### Usage

```tsx
import AIAssistant from "@/components/AIAssistant";

export default function Page() {
  return (
    <div>
      {/* Your page content */}

      <AIAssistant
        userId="user123"
        sessionId="session456"
        defaultMinimized={false}
      />
    </div>
  );
}
```

### Features

- ✅ Real-time chat interface
- ✅ Tool invocation display
- ✅ RAG results indicator
- ✅ Minimize/maximize
- ✅ Floating button when hidden
- ✅ Processing time display
- ✅ Error handling

---

## 📝 Logging

### Configuration

Set environment variable:

```bash
AI_LOGGING=true
```

### Log Files

Logs are written to:

- `logs/mcp.log` - MCP tool invocations
- `logs/rag.log` - RAG queries
- `logs/assistant.log` - Assistant interactions

### Usage

```typescript
import {
  logMCPTool,
  logRAGQuery,
  logAssistantInteraction,
} from "@/lib/logging/logger";

// Log MCP tool
logMCPTool("searchProducts", { query: "spices" }, results);

// Log RAG query
logRAGQuery("red chili", results, 45);

// Log assistant interaction
logAssistantInteraction("user123", "What spices?", response, [
  "searchProducts",
]);
```

---

## 🔧 Configuration

### Environment Variables

Create `.env.local`:

```bash
# AI Integration
AI_LOGGING=true

# Optional: Future OpenAI integration
# OPENAI_API_KEY=sk-...
# OPENAI_MODEL=gpt-4

# Optional: Vector database
# PINECONE_API_KEY=...
# PINECONE_ENVIRONMENT=...
```

---

## 🚀 Production Deployment

### 1. Install Optional Dependencies

For production logging with Pino:

```bash
npm install pino pino-pretty
```

For real embeddings with OpenAI:

```bash
npm install openai
```

### 2. Replace Mock Implementations

#### Embeddings (`lib/rag/embed.ts`):

```typescript
import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function embedQuery(query: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: query,
  });
  return response.data[0].embedding;
}
```

#### Logging (`lib/logging/logger.ts`):

```typescript
import pino from "pino";

export const mcpLogger = pino({
  name: "mcp",
  transport: {
    target: "pino-pretty",
    options: { destination: "logs/mcp.log" },
  },
});
```

### 3. Vector Database Integration

Consider using:

- **Pinecone** - Managed vector DB
- **Weaviate** - Open source vector DB
- **Qdrant** - High-performance vector search
- **pgvector** - PostgreSQL extension

### 4. Scaling Considerations

- Cache RAG data in Redis
- Use queue system for tool invocations
- Rate limit assistant API
- Implement proper authentication
- Monitor token usage

---

## 📊 Testing

### Test MCP Tools

```bash
# Test via API
curl -X POST http://localhost:3000/api/assistant \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role":"user","content":"/tool searchProducts {\"query\":\"chili\"}"}],
    "userId": "test"
  }'
```

### Test RAG Search

```typescript
import { ragSearch } from "@/lib/rag";

const results = await ragSearch("red chili powder");
console.log(results);
```

### Test Frontend

1. Add `<AIAssistant />` to any page
2. Open the chat
3. Try queries:
   - "What spices do you have?"
   - "/tool getAnalytics {\"metricType\":\"sales\"}"
   - "How do I return a product?"

---

## 🎯 Next Steps

1. **Integrate Real AI Model**

   - Connect OpenAI API
   - Use Vercel AI SDK
   - Implement streaming responses

2. **Enhance RAG**

   - Add vector database (Pinecone/Weaviate)
   - Implement hybrid search
   - Add document re-ranking

3. **Add Authentication**

   - Secure assistant endpoint
   - User session management
   - Rate limiting

4. **Admin Dashboard**

   - View chat logs
   - Monitor tool usage
   - Analytics dashboard

5. **Mobile Support**
   - Responsive chat UI
   - Voice input
   - Push notifications

---

## 📚 Resources

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [RAG Explained](https://www.pinecone.io/learn/retrieval-augmented-generation/)
- [OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)

---

## 🐛 Troubleshooting

### Issue: Tools not working

- Check tool name in `/lib/tools/index.ts`
- Verify tool export is correct
- Check console logs for errors

### Issue: RAG returns no results

- Verify `lib/rag/data.json` exists
- Check embedding dimensions match
- Review query preprocessing

### Issue: Logs not writing

- Ensure `AI_LOGGING=true` in `.env.local`
- Check `logs/` directory permissions
- Verify file system access

---

## 📄 License

This AI integration is part of the Delhi Mirch e-commerce platform.

For questions or issues, contact the development team.
