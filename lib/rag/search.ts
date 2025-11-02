/**
 * RAG Search Module
 * Implements retrieval-augmented generation search functionality
 */

import { loadRAGData, RAGDocument } from "./loadData";
import { embedQuery, cosineSimilarity } from "./embed";

export interface SearchResult {
  document: RAGDocument;
  score: number;
}

export interface RAGSearchResponse {
  query: string;
  results: SearchResult[];
  topResult: SearchResult | null;
  totalFound: number;
  searchTime: number;
}

/**
 * Search documents using RAG (Retrieval-Augmented Generation)
 * @param query - Search query string
 * @param limit - Maximum number of results to return
 * @param category - Optional category filter
 * @returns Search results with relevance scores
 */
export async function ragSearch(
  query: string,
  limit: number = 5,
  category?: string
): Promise<RAGSearchResponse> {
  const startTime = Date.now();
  
  console.log(`[RAG Search] Query: "${query}", Limit: ${limit}, Category: ${category || "all"}`);

  // Get query embedding
  const queryEmbedding = embedQuery(query);
  console.log(`[RAG Search] Query embedding generated: ${queryEmbedding.length} dimensions`);

  // Load documents
  const data = await loadRAGData();
  let documents = data.documents;

  // Filter by category if specified
  if (category) {
    documents = documents.filter((doc) => doc.category === category);
    console.log(`[RAG Search] Filtered to ${documents.length} documents in category: ${category}`);
  }

  // Calculate similarity scores
  const results: SearchResult[] = documents
    .map((doc) => ({
      document: doc,
      score: cosineSimilarity(queryEmbedding, doc.embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  const searchTime = Date.now() - startTime;
  
  console.log(`[RAG Search] Found ${results.length} results in ${searchTime}ms`);
  
  return {
    query,
    results,
    topResult: results.length > 0 ? results[0] : null,
    totalFound: results.length,
    searchTime,
  };
}

/**
 * Search for products specifically
 */
export async function searchProducts(
  query: string,
  limit: number = 5
): Promise<RAGSearchResponse> {
  console.log(`[RAG] Searching products for: "${query}"`);
  return ragSearch(query, limit, "products");
}

/**
 * Search for help/FAQ content
 */
export async function searchHelp(
  query: string,
  limit: number = 3
): Promise<RAGSearchResponse> {
  console.log(`[RAG] Searching help content for: "${query}"`);
  return ragSearch(query, limit, "help");
}

/**
 * Hybrid search combining keyword and semantic search
 */
export async function hybridSearch(
  query: string,
  limit: number = 5
): Promise<RAGSearchResponse> {
  console.log(`[RAG] Performing hybrid search for: "${query}"`);
  
  // Perform semantic search
  const semanticResults = await ragSearch(query, limit);
  
  // In production, you could combine with keyword search (e.g., Elasticsearch)
  // and merge/rerank results
  
  return semanticResults;
}

/**
 * Get related documents for a given document
 */
export async function getRelatedDocuments(
  documentId: string,
  limit: number = 3
): Promise<SearchResult[]> {
  console.log(`[RAG] Finding related documents for: ${documentId}`);
  
  const data = await loadRAGData();
  const sourceDoc = data.documents.find((doc) => doc.id === documentId);
  
  if (!sourceDoc) {
    console.warn(`[RAG] Document not found: ${documentId}`);
    return [];
  }

  // Find similar documents
  const results: SearchResult[] = data.documents
    .filter((doc) => doc.id !== documentId) // Exclude source document
    .map((doc) => ({
      document: doc,
      score: cosineSimilarity(sourceDoc.embedding, doc.embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  console.log(`[RAG] Found ${results.length} related documents`);
  
  return results;
}

