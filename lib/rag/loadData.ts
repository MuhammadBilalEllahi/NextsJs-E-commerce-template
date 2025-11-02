/**
 * RAG Data Loading Module
 * Handles loading and preprocessing of vector data
 */

import fs from "fs";
import path from "path";

export interface RAGDocument {
  id: string;
  content: string;
  category: string;
  productId?: string;
  metadata: Record<string, any>;
  embedding: number[];
}

export interface RAGData {
  documents: RAGDocument[];
}

let cachedData: RAGData | null = null;

/**
 * Load RAG data from JSON file
 */
export async function loadRAGData(): Promise<RAGData> {
  if (cachedData) {
    return cachedData;
  }

  try {
    const dataPath = path.join(process.cwd(), "lib", "rag", "data.json");
    const fileContent = fs.readFileSync(dataPath, "utf-8");
    const data = JSON.parse(fileContent) as RAGData;

    cachedData = data;
    console.log(`[RAG] Loaded ${data.documents.length} documents`);

    return data;
  } catch (error) {
    console.error("[RAG] Error loading data:", error);
    // Return empty data structure as fallback
    return { documents: [] };
  }
}

/**
 * Get documents by category
 */
export async function getDocumentsByCategory(
  category: string
): Promise<RAGDocument[]> {
  const data = await loadRAGData();
  return data.documents.filter((doc) => doc.category === category);
}

/**
 * Get document by ID
 */
export async function getDocumentById(id: string): Promise<RAGDocument | null> {
  const data = await loadRAGData();
  return data.documents.find((doc) => doc.id === id) || null;
}

/**
 * Get all product documents
 */
export async function getProductDocuments(): Promise<RAGDocument[]> {
  return getDocumentsByCategory("products");
}

/**
 * Get all help documents
 */
export async function getHelpDocuments(): Promise<RAGDocument[]> {
  return getDocumentsByCategory("help");
}

/**
 * Preload data into cache (call on server startup)
 */
export async function preloadRAGData(): Promise<void> {
  await loadRAGData();
  console.log("[RAG] Data preloaded into cache");
}

/**
 * Clear cache (useful for testing or refreshing data)
 */
export function clearRAGCache(): void {
  cachedData = null;
  console.log("[RAG] Cache cleared");
}
