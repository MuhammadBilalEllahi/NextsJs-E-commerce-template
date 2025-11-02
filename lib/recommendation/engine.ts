/**
 * Enhanced Personalized Recommendation Engine
 * Uses RAG embeddings + user purchase history
 */

import { cosineSimilarity } from "@/lib/rag/embed";
import { loadRAGData } from "@/lib/rag/loadData";
import mcpTools from "@/lib/tools";
import getUserPurchaseHistory from "@/lib/tools/getUserPurchaseHistory";

export interface EnhancedRecommendation {
  productId: string;
  name: string;
  price: number;
  category: string;
  score: number;
  reason: string;
  confidence: number;
  crossSellPotential: number;
}

/**
 * Generate enhanced personalized recommendations
 * Combines purchase history, embeddings, and complementary products
 */
export async function generateEnhancedRecommendations(
  userId: string,
  currentProductId?: string,
  limit: number = 10
): Promise<EnhancedRecommendation[]> {
  console.log(`[Recommendation Engine] Generating for user: ${userId}`);

  try {
    // Get user purchase history
    const history = await getUserPurchaseHistory(userId);
    
    // Calculate user preference embedding (average of purchase embeddings)
    const userEmbedding = calculateUserEmbedding(history.purchases);

    // Get RAG product data
    const ragData = await loadRAGData();
    const productDocs = ragData.documents.filter(doc => doc.category === "products");

    // Score products based on similarity to user preferences
    const scoredProducts = productDocs.map(doc => {
      const similarityScore = cosineSimilarity(userEmbedding, doc.embedding);
      
      // Check if product was already purchased
      const alreadyPurchased = history.purchases.some(
        p => p.productId === doc.productId || doc.id
      );

      // Calculate cross-sell potential
      const crossSellScore = calculateCrossSellScore(
        doc,
        history.purchases,
        history.preferredCategories
      );

      return {
        productId: doc.productId || doc.id,
        name: doc.metadata?.name || "Product",
        price: doc.metadata?.price || 0,
        category: doc.category,
        score: similarityScore * 0.6 + crossSellScore * 0.4, // Weighted score
        reason: generateRecommendationReason(similarityScore, crossSellScore, alreadyPurchased),
        confidence: similarityScore,
        crossSellPotential: crossSellScore,
        alreadyPurchased,
      };
    });

    // Filter out already purchased and sort by score
    const recommendations = scoredProducts
      .filter(p => !p.alreadyPurchased)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // If viewing a specific product, add complementary products
    if (currentProductId) {
      const complementary = await mcpTools.findComplementaryProducts(currentProductId);
      const complementaryProducts = complementary.complementaryProducts || [];

      // Merge with existing recommendations (boost complementary)
      complementaryProducts.forEach((comp: any) => {
        const existing = recommendations.find(r => r.productId === comp.id);
        if (existing) {
          existing.score *= 1.3; // Boost complementary products
          existing.reason = `Often bought with current product • ${existing.reason}`;
        }
      });

      recommendations.sort((a, b) => b.score - a.score);
    }

    console.log(`[Recommendation Engine] Generated ${recommendations.length} recommendations`);
    return recommendations;
  } catch (error) {
    console.error("[Recommendation Engine] Error:", error);
    return [];
  }
}

/**
 * Calculate average embedding from user purchases
 */
function calculateUserEmbedding(purchases: any[]): number[] {
  if (purchases.length === 0) {
    return [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5]; // Neutral embedding
  }

  const dimensions = purchases[0].embedding.length;
  const sumEmbedding = new Array(dimensions).fill(0);

  purchases.forEach(purchase => {
    purchase.embedding.forEach((val: number, idx: number) => {
      sumEmbedding[idx] += val * purchase.quantity; // Weight by quantity
    });
  });

  // Average and normalize
  return sumEmbedding.map(sum => sum / purchases.reduce((acc, p) => acc + p.quantity, 0));
}

/**
 * Calculate cross-sell potential
 */
function calculateCrossSellScore(
  product: any,
  purchases: any[],
  preferredCategories: string[]
): number {
  let score = 0.5; // Base score

  // Boost if in preferred category
  if (preferredCategories.includes(product.category)) {
    score += 0.2;
  }

  // Check category diversity
  const purchasedCategories = purchases.map(p => p.category);
  if (!purchasedCategories.includes(product.category)) {
    score += 0.1; // Encourage category diversity
  }

  // Price range similarity
  const avgPurchasePrice = purchases.reduce((sum, p) => sum + p.price, 0) / purchases.length;
  const priceDiff = Math.abs(product.metadata?.price - avgPurchasePrice) / avgPurchasePrice;
  if (priceDiff < 0.3) {
    score += 0.2; // Similar price range
  }

  return Math.min(score, 1.0);
}

/**
 * Generate human-readable recommendation reason
 */
function generateRecommendationReason(
  similarity: number,
  crossSell: number,
  purchased: boolean
): string {
  if (purchased) return "You've purchased this before";
  
  if (similarity > 0.8 && crossSell > 0.7) {
    return "Perfect match based on your taste";
  } else if (similarity > 0.8) {
    return "Based on your purchase history";
  } else if (crossSell > 0.7) {
    return "Customers like you also bought this";
  } else if (similarity > 0.6) {
    return "Similar to items you've enjoyed";
  } else {
    return "Popular in your favorite categories";
  }
}

/**
 * Get cross-sell suggestions for chat
 */
export async function getCrossSellPrompt(productId: string): Promise<string> {
  const complementary = await mcpTools.findComplementaryProducts(productId);
  const products = complementary.complementaryProducts || [];

  if (products.length === 0) {
    return "";
  }

  const productNames = products.slice(0, 3).map((p: any) => p.name).join(", ");
  return `💡 Customers who bought this also loved: ${productNames}. Would you like to add any of these to your cart?`;
}

