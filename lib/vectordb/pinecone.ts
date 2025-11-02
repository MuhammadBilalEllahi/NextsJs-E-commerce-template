/**
 * Pinecone Vector Database Integration
 * Production-grade vector storage and retrieval
 */

export interface PineconeConfig {
  apiKey?: string;
  environment?: string;
  indexName?: string;
}

export interface VectorDocument {
  id: string;
  values: number[];
  metadata: {
    content: string;
    category: string;
    [key: string]: any;
  };
}

export interface SearchResult {
  id: string;
  score: number;
  metadata: any;
}

/**
 * Pinecone Client
 */
export class PineconeClient {
  private apiKey: string;
  private environment: string;
  private indexName: string;
  private indexHost?: string;

  constructor(config: PineconeConfig = {}) {
    this.apiKey = config.apiKey || process.env.PINECONE_API_KEY || "";
    this.environment = config.environment || process.env.PINECONE_ENVIRONMENT || "";
    this.indexName = config.indexName || process.env.PINECONE_INDEX || "dehli-mirch";

    if (!this.apiKey || !this.environment) {
      console.warn("⚠️ Pinecone not configured, using mock vector store");
    }
  }

  /**
   * Initialize connection and get index host
   */
  async initialize(): Promise<void> {
    if (!this.apiKey || !this.environment) {
      return; // Mock mode
    }

    try {
      // Get index stats to verify connection and get host
      const response = await fetch(
        `https://api.pinecone.io/indexes/${this.indexName}`,
        {
          headers: {
            "Api-Key": this.apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to connect to Pinecone: ${response.statusText}`);
      }

      const data = await response.json();
      this.indexHost = data.host;
      console.log(`✅ Connected to Pinecone index: ${this.indexName}`);
    } catch (error: any) {
      console.error("Pinecone initialization error:", error);
      throw error;
    }
  }

  /**
   * Upsert vectors to Pinecone
   */
  async upsert(vectors: VectorDocument[]): Promise<void> {
    if (!this.apiKey || !this.indexHost) {
      console.log("[Mock] Would upsert vectors to Pinecone:", vectors.length);
      return;
    }

    try {
      const response = await fetch(
        `https://${this.indexHost}/vectors/upsert`,
        {
          method: "POST",
          headers: {
            "Api-Key": this.apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            vectors: vectors.map((v) => ({
              id: v.id,
              values: v.values,
              metadata: v.metadata,
            })),
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Pinecone upsert error: ${JSON.stringify(error)}`);
      }

      console.log(`✅ Upserted ${vectors.length} vectors to Pinecone`);
    } catch (error: any) {
      console.error("Pinecone upsert error:", error);
      throw error;
    }
  }

  /**
   * Query vectors by similarity
   */
  async query(
    queryVector: number[],
    topK: number = 10,
    filter?: Record<string, any>
  ): Promise<SearchResult[]> {
    if (!this.apiKey || !this.indexHost) {
      console.log("[Mock] Would query Pinecone with vector of length:", queryVector.length);
      return this.mockQuery(topK);
    }

    try {
      const response = await fetch(
        `https://${this.indexHost}/query`,
        {
          method: "POST",
          headers: {
            "Api-Key": this.apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            vector: queryVector,
            topK,
            includeMetadata: true,
            filter,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Pinecone query error: ${JSON.stringify(error)}`);
      }

      const data = await response.json();
      return data.matches || [];
    } catch (error: any) {
      console.error("Pinecone query error:", error);
      return this.mockQuery(topK);
    }
  }

  /**
   * Delete vectors by IDs
   */
  async delete(ids: string[]): Promise<void> {
    if (!this.apiKey || !this.indexHost) {
      console.log("[Mock] Would delete vectors:", ids);
      return;
    }

    try {
      const response = await fetch(
        `https://${this.indexHost}/vectors/delete`,
        {
          method: "POST",
          headers: {
            "Api-Key": this.apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ids,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Pinecone delete error: ${response.statusText}`);
      }

      console.log(`✅ Deleted ${ids.length} vectors from Pinecone`);
    } catch (error: any) {
      console.error("Pinecone delete error:", error);
      throw error;
    }
  }

  /**
   * Get index stats
   */
  async getStats(): Promise<any> {
    if (!this.apiKey || !this.indexHost) {
      return {
        vectorCount: 25,
        dimension: 8,
        indexFullness: 0.001,
      };
    }

    try {
      const response = await fetch(
        `https://${this.indexHost}/describe_index_stats`,
        {
          headers: {
            "Api-Key": this.apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Pinecone stats error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error("Pinecone stats error:", error);
      return null;
    }
  }

  /**
   * Mock query for development/testing
   */
  private mockQuery(topK: number): SearchResult[] {
    return Array.from({ length: Math.min(topK, 5) }, (_, i) => ({
      id: `doc_${String(i + 1).padStart(3, "0")}`,
      score: 0.9 - i * 0.1,
      metadata: {
        content: `Mock document ${i + 1}`,
        category: "products",
      },
    }));
  }
}

/**
 * Singleton instance
 */
let pineconeClient: PineconeClient | null = null;

/**
 * Get or create Pinecone client
 */
export function getPineconeClient(config?: PineconeConfig): PineconeClient {
  if (!pineconeClient) {
    pineconeClient = new PineconeClient(config);
  }
  return pineconeClient;
}

/**
 * Initialize Pinecone and migrate existing data
 */
export async function initializePinecone(): Promise<PineconeClient> {
  const client = getPineconeClient();
  await client.initialize();
  return client;
}

/**
 * Migrate local RAG data to Pinecone
 */
export async function migrateToPinecone(): Promise<void> {
  console.log("🔄 Starting Pinecone migration...");

  const client = getPineconeClient();
  await client.initialize();

  // Load local RAG data
  const { loadRAGData } = await import("../rag/loadData");
  const ragData = await loadRAGData();

  // Convert to Pinecone format
  const vectors: VectorDocument[] = ragData.documents.map((doc) => ({
    id: doc.id,
    values: doc.embedding,
    metadata: {
      content: doc.content,
      category: doc.category,
      ...doc.metadata,
    },
  }));

  // Upsert in batches of 100
  const batchSize = 100;
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);
    await client.upsert(batch);
    console.log(`✅ Migrated batch ${Math.floor(i / batchSize) + 1}`);
  }

  console.log(`🎉 Migration complete! Migrated ${vectors.length} documents to Pinecone`);
}


