# Environment Variables Template

Copy these variables to your `.env.local` file:

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/dehli_mirch

# AI Features
AI_LOGGING=true

# Embeddings Configuration
EMBEDDING_PROVIDER=mock  # Options: "openai", "cohere", "mock"
OPENAI_API_KEY=sk-...    # Get from https://platform.openai.com/api-keys
COHERE_API_KEY=...       # Get from https://dashboard.cohere.ai/api-keys
EMBEDDING_MODEL=text-embedding-3-small

# Vector Database - Pinecone
PINECONE_API_KEY=...            # Get from https://www.pinecone.io/
PINECONE_ENVIRONMENT=us-east1-gcp
PINECONE_INDEX=dehli-mirch

# Vector Database - Weaviate
WEAVIATE_HOST=localhost:8080    # Or cloud URL
WEAVIATE_API_KEY=...            # Optional, for cloud
WEAVIATE_SCHEME=http            # or "https"

# Authentication (if applicable)
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000

# Payment Gateway (future)
STRIPE_SECRET_KEY=...
STRIPE_PUBLISHABLE_KEY=...

# Email (future)
SENDGRID_API_KEY=...
EMAIL_FROM=noreply@dehlimirch.com

# Analytics (future)
GOOGLE_ANALYTICS_ID=...
SENTRY_DSN=...
```

## Quick Setup Options

### Option 1: Free Tier (Mock Everything)
```bash
EMBEDDING_PROVIDER=mock
AI_LOGGING=true
```

### Option 2: Real Embeddings Only
```bash
EMBEDDING_PROVIDER=openai
OPENAI_API_KEY=sk-proj-...
AI_LOGGING=true
```

### Option 3: Full Production
```bash
EMBEDDING_PROVIDER=openai
OPENAI_API_KEY=sk-proj-...
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=us-east1-gcp
PINECONE_INDEX=dehli-mirch
AI_LOGGING=true
```


