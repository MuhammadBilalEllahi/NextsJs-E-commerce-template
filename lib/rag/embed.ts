/**
 * RAG Embedding Module
 * Handles query embedding and similarity computation
 */

/**
 * Mock embedding function - converts text to vector
 * In production, replace with actual embedding model (e.g., OpenAI embeddings)
 */
export function embedQuery(query: string): number[] {
  // Mock embedding based on simple heuristics
  // In production, use actual embedding API
  const words = query.toLowerCase().split(/\s+/);

  // Create a simple 8-dimensional embedding based on word characteristics
  const embedding = [
    words.some((w) => w.includes("spice") || w.includes("masala")) ? 0.8 : 0.2,
    words.some((w) => w.includes("order") || w.includes("buy")) ? 0.7 : 0.3,
    words.some((w) => w.includes("ship") || w.includes("deliver")) ? 0.6 : 0.4,
    words.some((w) => w.includes("return") || w.includes("refund")) ? 0.5 : 0.3,
    words.some((w) => w.includes("price") || w.includes("cost")) ? 0.7 : 0.2,
    words.some((w) => w.includes("chili") || w.includes("pickle")) ? 0.9 : 0.1,
    words.some((w) => w.includes("track") || w.includes("status")) ? 0.8 : 0.2,
    words.length / 10, // Length factor
  ];

  return embedding;
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(vec1: number[], vec2: number[]): number {
  if (vec1.length !== vec2.length) {
    throw new Error("Vectors must have the same length");
  }

  const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
  const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
  const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));

  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0;
  }

  return dotProduct / (magnitude1 * magnitude2);
}

/**
 * Calculate Euclidean distance between two vectors
 */
export function euclideanDistance(vec1: number[], vec2: number[]): number {
  if (vec1.length !== vec2.length) {
    throw new Error("Vectors must have the same length");
  }

  const sumSquares = vec1.reduce((sum, val, i) => {
    const diff = val - vec2[i];
    return sum + diff * diff;
  }, 0);

  return Math.sqrt(sumSquares);
}

/**
 * Normalize a vector to unit length
 */
export function normalizeVector(vec: number[]): number[] {
  const magnitude = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
  if (magnitude === 0) return vec;
  return vec.map((val) => val / magnitude);
}
