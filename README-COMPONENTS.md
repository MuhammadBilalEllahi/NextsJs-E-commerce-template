# Component Structure and Enhanced Features

## Overview
This project has been restructured to better organize components and implement real backend data fetching for reviews and FAQs.

## Component Organization

### Product Components (`/components/product/`)
- `product-detail-client.tsx` - Main product detail page component
- `product-card.tsx` - Individual product card component
- `product-grid.tsx` - Grid layout for multiple products
- `product-images.tsx` - Product image gallery component
- `product-carousel.tsx` - Product carousel/slider component
- `index.ts` - Export file for clean imports

### Review Components (`/components/reviews/`)
- `reviews-enhanced.tsx` - Enhanced reviews component with backend integration
- `reviews.tsx` - Original simple reviews component
- `index.ts` - Export file for clean imports

### FAQ Components (`/components/faq/`)
- `faq-enhanced.tsx` - Enhanced FAQ component with search and categories
- `index.ts` - Export file for clean imports

## New Features Implemented

### 1. Enhanced Reviews System
- **Real-time data fetching** from backend API
- **Pagination support** with load more functionality
- **Review submission** with rating, title, and comment
- **Verified purchase badges** for authenticated users
- **Helpful votes tracking**
- **Responsive design** with proper loading states

**Usage:**
```tsx
import { ReviewsEnhanced } from "@/components/reviews";

<ReviewsEnhanced 
  productId="product-id-here"
  initialReviews={[]} // Optional initial reviews
/>
```

### 2. Enhanced FAQ System
- **Category-based filtering** (general, products, shipping, returns, payment, account)
- **Search functionality** with text search across questions and answers
- **Expandable/collapsible** FAQ items
- **Tag system** for better organization
- **Helpful tracking** for user feedback

**Usage:**
```tsx
import { FAQEnhanced } from "@/components/faq";

<FAQEnhanced 
  category="products" // Optional: filter by category
  productId="optional-product-id" // Optional: product-specific FAQs
/>
```

### 3. Backend Models
- **Review Model** - Stores customer reviews with validation
- **FAQ Model** - Stores frequently asked questions with categories and tags
- **Updated Product Model** - Now includes reviews relationship

### 4. API Endpoints
- `/api/reviews` - GET (fetch reviews) and POST (create review)
- `/api/faqs` - GET (fetch FAQs with filtering and search)

## Data Service Layer

The `lib/data-service.ts` file provides a clean interface for fetching data from the backend:

```tsx
import { 
  getAllProducts, 
  getProductBySlug, 
  getProductReviews, 
  getFAQs 
} from "@/lib/data-service";

// Fetch products with populated data
const products = await getAllProducts();

// Fetch single product by slug
const product = await getProductBySlug("product-slug");

// Fetch product reviews with pagination
const reviews = await getProductReviews("product-id", 10, 1);

// Fetch FAQs by category
const faqs = await getFAQs("products", "search-term");
```

## Database Schema Updates

### Review Schema
```typescript
{
  product: ObjectId,      // Reference to product
  user: ObjectId,         // Reference to user
  rating: Number,         // 1-5 rating
  title: String,          // Review title
  comment: String,        // Review content
  isVerified: Boolean,    // Verified purchase
  isHelpful: Number,      // Helpful votes count
  images: [String],       // Optional review images
  isActive: Boolean,      // Review visibility
  createdAt: Date,
  updatedAt: Date
}
```

### FAQ Schema
```typescript
{
  question: String,        // FAQ question
  answer: String,         // FAQ answer
  category: String,       // Category enum
  tags: [String],         // Search tags
  isActive: Boolean,      // FAQ visibility
  order: Number,          // Display order
  viewCount: Number,      // View tracking
  helpfulCount: Number,   // Helpful tracking
  createdAt: Date,
  updatedAt: Date
}
```

## Seeding Data

To populate the database with sample FAQs and reviews, run:

```bash
# Create the scripts directory if it doesn't exist
mkdir -p scripts

# Run the seed script
npx tsx scripts/seed-data.ts
```

This will create:
- 8 sample FAQs across different categories
- 3 sample reviews for existing products
- Update product review counts and ratings

## Import Patterns

### Clean Imports (Recommended)
```tsx
import { ProductDetailClient } from "@/components/product";
import { ReviewsEnhanced } from "@/components/reviews";
import { FAQEnhanced } from "@/components/faq";
```

### Direct Imports (Alternative)
```tsx
import { ProductDetailClient } from "@/components/product/product-detail-client";
import { ReviewsEnhanced } from "@/components/reviews/reviews-enhanced";
import { FAQEnhanced } from "@/components/faq/faq-enhanced";
```

## Migration Notes

### From Old Structure
1. **Update imports** to use new component paths
2. **Replace Reviews component** with ReviewsEnhanced for backend integration
3. **Replace static FAQ content** with FAQEnhanced component
4. **Update data fetching** to use data-service instead of mock data

### Breaking Changes
- Component file locations have changed
- Reviews component API has changed (new props structure)
- FAQ content is now dynamic from backend

## Future Enhancements

### Planned Features
- **Review moderation** system for admins
- **Review helpfulness voting** functionality
- **FAQ analytics** and popularity tracking
- **Product-specific FAQ** associations
- **Review image uploads** support
- **Review response** system for customer service

### Technical Improvements
- **Caching layer** for frequently accessed data
- **Real-time updates** using WebSockets
- **Advanced search** with Elasticsearch
- **Review sentiment analysis** using AI
- **Automated FAQ suggestions** based on customer queries

## Troubleshooting

### Common Issues
1. **Import errors** - Ensure you're using the new component paths
2. **Database connection** - Check MongoDB connection string
3. **API errors** - Verify API endpoints are accessible
4. **Component props** - Check that required props are provided

### Debug Mode
Enable debug logging by setting environment variables:
```bash
DEBUG=true
NODE_ENV=development
```

## Contributing

When adding new components:
1. **Place in appropriate folder** based on functionality
2. **Update index.ts** files for clean exports
3. **Add TypeScript interfaces** for props
4. **Include error handling** and loading states
5. **Add JSDoc comments** for complex functions
6. **Update this README** with new component information









