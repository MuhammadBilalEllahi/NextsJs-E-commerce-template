# 🚀 Quick Start Guide - AI Integration

## 5-Minute Setup

### Step 1: Environment Setup (1 min)

Create `.env.local` in project root:

```bash
AI_LOGGING=true
MONGODB_URI=mongodb://localhost:27017/dehli_mirch
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
```

### Step 2: Start Development Server (1 min)

```bash
npm run dev
```

### Step 3: Test the API (1 min)

Open a new terminal and run:

```bash
# Test health check
curl http://localhost:3000/api/assistant

# Expected output:
# {
#   "success": true,
#   "message": "AI Assistant API is running",
#   "capabilities": {
#     "tools": [...20 tools...],
#     "rag": true,
#     "logging": true
#   }
# }
```

### Step 4: Test a Tool (1 min)

```bash
curl -X POST http://localhost:3000/api/assistant \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{
      "role": "user",
      "content": "/tool searchProducts {\"query\":\"chili\"}"
    }],
    "userId": "test-user"
  }'
```

### Step 5: Test RAG Search (1 min)

```bash
curl -X POST http://localhost:3000/api/assistant \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{
      "role": "user",
      "content": "What spices do you have?"
    }],
    "userId": "test-user"
  }'
```

---

## Add Chat to Your Page

### Option 1: Add to Any Page

```tsx
import AIAssistant from "@/components/AIAssistant";

export default function YourPage() {
  return (
    <div>
      <h1>Your Page Content</h1>

      {/* Add AI Assistant */}
      <AIAssistant userId="user123" />
    </div>
  );
}
```

### Option 2: Add to Layout (Global)

```tsx
// app/(site)/layout.tsx
import AIAssistant from "@/components/AIAssistant";

export default function SiteLayout({ children }) {
  return (
    <div>
      {children}

      {/* AI Assistant available on all pages */}
      <AIAssistant defaultMinimized={true} />
    </div>
  );
}
```

### Option 3: Conditional Rendering

```tsx
"use client";

import { useSession } from "next-auth/react";
import AIAssistant from "@/components/AIAssistant";

export default function ConditionalAssistant() {
  const { data: session } = useSession();

  // Only show to logged-in users
  if (!session?.user) return null;

  return <AIAssistant userId={session.user.id} />;
}
```

---

## Try These Examples

### 1. Search for Products

```
User: "Show me spicy products"
```

### 2. Get Help

```
User: "What's your shipping policy?"
```

### 3. Use a Tool

```
User: "/tool getAnalytics {"metricType":"sales"}"
```

### 4. Check Order Status

```
User: "/tool getOrderStatus {"orderId":"ORD-12345"}"
```

### 5. Get Recommendations

```
User: "/tool getRecommendations {"userId":"user123"}"
```

---

## What You Get

✅ **20 MCP Tools** ready to use
✅ **RAG System** with semantic search
✅ **Assistant API** at `/api/assistant`
✅ **Chat UI Component** ready to deploy
✅ **Logging System** with detailed logs
✅ **Full TypeScript** support
✅ **Production-ready** architecture

---

## Next Steps

1. **Read Full Docs:** See `README_AI_INTEGRATION.md`
2. **Usage Examples:** See `docs/AI_USAGE_EXAMPLES.md`
3. **Production Setup:** See `docs/AI_INTEGRATION.md`
4. **Environment Vars:** See `docs/ENV_SETUP.md`

---

## Need Help?

- Check logs in `logs/` directory (if `AI_LOGGING=true`)
- See troubleshooting in `docs/AI_INTEGRATION.md`
- Review example code in `docs/AI_USAGE_EXAMPLES.md`

---

## 🎉 You're Done!

Your AI integration is ready. Start building amazing features!

```tsx
import AI from "@/lib/ai";

// Use tools
const results = await AI.tools.searchProducts("spices");

// Use RAG
const ragResults = await AI.rag.search("shipping policy", 3);

// Log interactions
AI.logger.logAssistantInteraction("user123", "query", "response");
```

Happy coding! 🚀
