/**
 * OpenAI Embeddings Integration
 * Real embedding generation using OpenAI API
 */

export interface EmbeddingConfig {
  provider: "openai" | "cohere" | "mock";
  apiKey?: string;
  model?: string;
}

const DEFAULT_CONFIG: EmbeddingConfig = {
  provider: (process.env.EMBEDDING_PROVIDER as any) || "mock",
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.EMBEDDING_MODEL || "text-embedding-3-small",
};

/**
 * Generate embeddings using OpenAI API
 */
export async function generateOpenAIEmbedding(
  text: string,
  config: EmbeddingConfig = DEFAULT_CONFIG
): Promise<number[]> {
  if (!config.apiKey) {
    console.warn("⚠️ No OpenAI API key found, falling back to mock embeddings");
    return generateMockEmbedding(text);
  }

  try {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        input: text,
        model: config.model || "text-embedding-3-small",
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("OpenAI API error:", error);
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error: any) {
    console.error("Error generating OpenAI embedding:", error);
    console.log("Falling back to mock embeddings");
    return generateMockEmbedding(text);
  }
}

/**
 * Generate embeddings using Cohere API
 */
export async function generateCohereEmbedding(
  text: string,
  config: { apiKey?: string; model?: string } = {}
): Promise<number[]> {
  const apiKey = config.apiKey || process.env.COHERE_API_KEY;

  if (!apiKey) {
    console.warn("⚠️ No Cohere API key found, falling back to mock embeddings");
    return generateMockEmbedding(text);
  }

  try {
    const response = await fetch("https://api.cohere.ai/v1/embed", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        texts: [text],
        model: config.model || "embed-english-v3.0",
        input_type: "search_query",
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Cohere API error:", error);
      throw new Error(`Cohere API error: ${error.message || response.statusText}`);
    }

    const data = await response.json();
    return data.embeddings[0];
  } catch (error: any) {
    console.error("Error generating Cohere embedding:", error);
    console.log("Falling back to mock embeddings");
    return generateMockEmbedding(text);
  }
}

/**
 * Mock embedding generation (fallback)
 * Same as the original mock implementation
 */
export function generateMockEmbedding(text: string): number[] {
  const seed = text.length % 10;
  const embedding = Array(8)
    .fill(0)
    .map((_, i) => (i + seed) / 10 + Math.random() * 0.1);
  return embedding;
}

/**
 * Universal embedding function that routes to the configured provider
 */
export async function generateEmbedding(
  text: string,
  config: EmbeddingConfig = DEFAULT_CONFIG
): Promise<number[]> {
  console.log(`[Embeddings] Generating embedding using provider: ${config.provider}`);

  switch (config.provider) {
    case "openai":
      return generateOpenAIEmbedding(text, config);
    case "cohere":
      return generateCohereEmbedding(text, { apiKey: config.apiKey });
    case "mock":
    default:
      return generateMockEmbedding(text);
  }
}

/**
 * Batch embedding generation (more efficient for multiple texts)
 */
export async function generateBatchEmbeddings(
  texts: string[],
  config: EmbeddingConfig = DEFAULT_CONFIG
): Promise<number[][]> {
  if (config.provider === "mock") {
    return texts.map(generateMockEmbedding);
  }

  if (config.provider === "openai" && config.apiKey) {
    try {
      const response = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          input: texts,
          model: config.model || "text-embedding-3-small",
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data.map((item: any) => item.embedding);
    } catch (error) {
      console.error("Batch embedding error:", error);
      return texts.map(generateMockEmbedding);
    }
  }

  // Fallback: generate one by one
  const embeddings = await Promise.all(
    texts.map((text) => generateEmbedding(text, config))
  );
  return embeddings;
}

/**
 * Normalize embedding vector (for consistent similarity calculations)
 */
export function normalizeEmbedding(embedding: number[]): number[] {
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  if (magnitude === 0) return embedding;
  return embedding.map((val) => val / magnitude);
}

/**
 * Calculate cosine similarity between embeddings
 */
export function cosineSimilarity(vec1: number[], vec2: number[]): number {
  if (vec1.length !== vec2.length) {
    throw new Error("Vectors must be of the same length");
  }

  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    magnitude1 += vec1[i] * vec1[i];
    magnitude2 += vec2[i] * vec2[i];
  }

  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);

  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0;
  }

  return dotProduct / (magnitude1 * magnitude2);
}


