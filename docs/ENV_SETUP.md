# Environment Variables Setup for AI Integration

## Create `.env.local` file in project root

```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017/dehli_mirch

# Redis (optional)
# REDIS_URL=redis://localhost:6379

# NextAuth
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# AI Integration
AI_LOGGING=true

# OpenAI (optional - for production embeddings)
# OPENAI_API_KEY=sk-...
# OPENAI_MODEL=gpt-4

# Vercel AI SDK (optional)
# AI_SDK_API_KEY=...

# Vector Database (optional - Pinecone example)
# PINECONE_API_KEY=...
# PINECONE_ENVIRONMENT=...
# PINECONE_INDEX=dehli-mirch-products

# Email Service
# RESEND_API_KEY=...

# AWS S3 (for images)
# AWS_ACCESS_KEY_ID=...
# AWS_SECRET_ACCESS_KEY=...
# AWS_REGION=...
# AWS_BUCKET_NAME=...

# TCS Courier (for shipping)
# TCS_USERNAME=...
# TCS_PASSWORD=...
# TCS_COST_CENTER_CODE=...

# Application Settings
NEXT_PUBLIC_APP_NAME=Delhi Mirch
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Feature Flags
NEXT_PUBLIC_ENABLE_AI_ASSISTANT=true
NEXT_PUBLIC_ENABLE_CHAT_SUPPORT=true
NEXT_PUBLIC_ENABLE_RECOMMENDATIONS=true
```

## Required Variables for AI Features

### Development (Minimum)
```bash
AI_LOGGING=true
```

### Production (Recommended)
```bash
AI_LOGGING=true
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=...
```

## Setup Instructions

1. Copy the template above
2. Create `.env.local` in project root
3. Fill in your actual values
4. Restart Next.js dev server

```bash
npm run dev
```

## Testing

Verify environment is loaded:
```bash
curl http://localhost:3000/api/assistant
```

Should return:
```json
{
  "success": true,
  "message": "AI Assistant API is running",
  "capabilities": {
    "tools": [...],
    "rag": true,
    "logging": true
  }
}
```

