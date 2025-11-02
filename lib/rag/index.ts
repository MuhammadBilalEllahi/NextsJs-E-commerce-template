/**
 * RAG System Index
 * Main export for RAG functionality
 */

export * from "./search";
export * from "./embed";
export * from "./loadData";

import { ragSearch, searchProducts, searchHelp, hybridSearch } from "./search";
import { embedQuery, cosineSimilarity } from "./embed";
import { loadRAGData, preloadRAGData } from "./loadData";

export const RAG = {
  // Search functions
  search: ragSearch,
  searchProducts,
  searchHelp,
  hybridSearch,
  
  // Embedding functions
  embedQuery,
  cosineSimilarity,
  
  // Data loading
  loadData: loadRAGData,
  preloadData: preloadRAGData,
};

export default RAG;

