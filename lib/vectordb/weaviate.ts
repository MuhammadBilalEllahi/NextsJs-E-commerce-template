/**
 * Weaviate Vector Database Integration
 * Alternative to Pinecone with open-source option
 */

export interface WeaviateConfig {
  host?: string;
  apiKey?: string;
  scheme?: "http" | "https";
}

export interface WeaviateObject {
  id?: string;
  class: string;
  properties: {
    content: string;
    category: string;
    [key: string]: any;
  };
  vector?: number[];
}

/**
 * Weaviate Client
 */
export class WeaviateClient {
  private host: string;
  private apiKey?: string;
  private scheme: "http" | "https";
  private className: string = "Product";

  constructor(config: WeaviateConfig = {}) {
    this.host = config.host || process.env.WEAVIATE_HOST || "localhost:8080";
    this.apiKey = config.apiKey || process.env.WEAVIATE_API_KEY;
    this.scheme = config.scheme || (process.env.WEAVIATE_SCHEME as any) || "http";

    if (!this.host) {
      console.warn("⚠️ Weaviate not configured, using mock vector store");
    }
  }

  /**
   * Get base URL
   */
  private getBaseUrl(): string {
    return `${this.scheme}://${this.host}/v1`;
  }

  /**
   * Get request headers
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
    }

    return headers;
  }

  /**
   * Create schema (run once during setup)
   */
  async createSchema(): Promise<void> {
    if (!this.host) {
      console.log("[Mock] Would create Weaviate schema");
      return;
    }

    const schema = {
      class: this.className,
      description: "E-commerce product and help documents",
      vectorizer: "none", // We provide our own vectors
      properties: [
        {
          name: "content",
          dataType: ["text"],
          description: "The document content",
        },
        {
          name: "category",
          dataType: ["string"],
          description: "Document category (products/help)",
        },
        {
          name: "productId",
          dataType: ["string"],
          description: "Product ID if applicable",
        },
        {
          name: "metadata",
          dataType: ["object"],
          description: "Additional metadata",
        },
      ],
    };

    try {
      const response = await fetch(`${this.getBaseUrl()}/schema`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(schema),
      });

      if (!response.ok && response.status !== 422) {
        // 422 means class already exists
        throw new Error(`Weaviate schema error: ${response.statusText}`);
      }

      console.log(`✅ Weaviate schema created for class: ${this.className}`);
    } catch (error: any) {
      if (error.message.includes("already exists")) {
        console.log(`ℹ️ Weaviate schema already exists`);
      } else {
        console.error("Weaviate schema error:", error);
        throw error;
      }
    }
  }

  /**
   * Add objects to Weaviate
   */
  async addObjects(objects: WeaviateObject[]): Promise<void> {
    if (!this.host) {
      console.log("[Mock] Would add objects to Weaviate:", objects.length);
      return;
    }

    try {
      const batch = {
        objects: objects.map((obj) => ({
          class: this.className,
          properties: obj.properties,
          vector: obj.vector,
        })),
      };

      const response = await fetch(`${this.getBaseUrl()}/batch/objects`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(batch),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Weaviate batch error: ${JSON.stringify(error)}`);
      }

      console.log(`✅ Added ${objects.length} objects to Weaviate`);
    } catch (error: any) {
      console.error("Weaviate add error:", error);
      throw error;
    }
  }

  /**
   * Search by vector similarity
   */
  async search(
    queryVector: number[],
    limit: number = 10,
    filter?: Record<string, any>
  ): Promise<any[]> {
    if (!this.host) {
      console.log("[Mock] Would search Weaviate");
      return this.mockSearch(limit);
    }

    try {
      const query = {
        query: `{
          Get {
            ${this.className}(
              nearVector: {
                vector: [${queryVector.join(",")}]
              }
              limit: ${limit}
              ${filter ? `where: ${JSON.stringify(filter)}` : ""}
            ) {
              content
              category
              productId
              metadata
              _additional {
                distance
                id
              }
            }
          }
        }`,
      };

      const response = await fetch(`${this.getBaseUrl()}/graphql`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(query),
      });

      if (!response.ok) {
        throw new Error(`Weaviate search error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data?.Get?.[this.className] || [];
    } catch (error: any) {
      console.error("Weaviate search error:", error);
      return this.mockSearch(limit);
    }
  }

  /**
   * Delete objects by IDs
   */
  async delete(ids: string[]): Promise<void> {
    if (!this.host) {
      console.log("[Mock] Would delete objects:", ids);
      return;
    }

    try {
      for (const id of ids) {
        await fetch(`${this.getBaseUrl()}/objects/${id}`, {
          method: "DELETE",
          headers: this.getHeaders(),
        });
      }

      console.log(`✅ Deleted ${ids.length} objects from Weaviate`);
    } catch (error: any) {
      console.error("Weaviate delete error:", error);
      throw error;
    }
  }

  /**
   * Mock search for development
   */
  private mockSearch(limit: number): any[] {
    return Array.from({ length: Math.min(limit, 5) }, (_, i) => ({
      content: `Mock document ${i + 1}`,
      category: "products",
      _additional: {
        id: `doc_${String(i + 1).padStart(3, "0")}`,
        distance: 0.1 + i * 0.1,
      },
    }));
  }
}

/**
 * Singleton instance
 */
let weaviateClient: WeaviateClient | null = null;

/**
 * Get or create Weaviate client
 */
export function getWeaviateClient(config?: WeaviateConfig): WeaviateClient {
  if (!weaviateClient) {
    weaviateClient = new WeaviateClient(config);
  }
  return weaviateClient;
}

/**
 * Initialize Weaviate
 */
export async function initializeWeaviate(): Promise<WeaviateClient> {
  const client = getWeaviateClient();
  await client.createSchema();
  return client;
}

/**
 * Migrate local RAG data to Weaviate
 */
export async function migrateToWeaviate(): Promise<void> {
  console.log("🔄 Starting Weaviate migration...");

  const client = getWeaviateClient();
  await client.createSchema();

  // Load local RAG data
  const { loadRAGData } = await import("../rag/loadData");
  const ragData = await loadRAGData();

  // Convert to Weaviate format
  const objects: WeaviateObject[] = ragData.documents.map((doc) => ({
    class: "Product",
    properties: {
      content: doc.content,
      category: doc.category,
      productId: doc.metadata?.productId || "",
      metadata: doc.metadata,
    },
    vector: doc.embedding,
  }));

  // Add in batches of 100
  const batchSize = 100;
  for (let i = 0; i < objects.length; i += batchSize) {
    const batch = objects.slice(i, i + batchSize);
    await client.addObjects(batch);
    console.log(`✅ Migrated batch ${Math.floor(i / batchSize) + 1}`);
  }

  console.log(`🎉 Migration complete! Migrated ${objects.length} documents to Weaviate`);
}


