/**
 * Type definitions for AI Integration
 * MCP and RAG types
 */

// ===== MCP TOOL TYPES =====

export interface MCPToolParams {
  [key: string]: any;
}

export interface MCPToolResult {
  success?: boolean;
  data?: any;
  error?: string;
  [key: string]: any;
}

export interface MCPToolInvocation {
  tool: string;
  params: MCPToolParams;
  result: MCPToolResult;
  error?: string;
  timestamp?: string;
}

// ===== RAG TYPES =====

export interface RAGDocument {
  id: string;
  content: string;
  category: string;
  productId?: string;
  metadata: Record<string, any>;
  embedding: number[];
}

export interface RAGSearchResult {
  document: RAGDocument;
  score: number;
}

export interface RAGSearchResponse {
  query: string;
  results: RAGSearchResult[];
  topResult: RAGSearchResult | null;
  totalFound: number;
  searchTime: number;
}

// ===== ASSISTANT TYPES =====

export interface AssistantMessage {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: Date;
  toolInvocations?: MCPToolInvocation[];
  ragResults?: RAGSearchResponse;
  metadata?: AssistantMetadata;
}

export interface AssistantMetadata {
  processingTime: number;
  toolsUsed: string[];
  ragUsed: boolean;
  userId?: string;
  sessionId?: string;
}

export interface AssistantRequest {
  messages: AssistantMessage[];
  userId?: string;
  sessionId?: string;
  options?: {
    maxTokens?: number;
    temperature?: number;
    stream?: boolean;
  };
}

export interface AssistantResponse {
  success: boolean;
  message: string;
  toolInvocations?: MCPToolInvocation[];
  ragResults?: RAGSearchResponse;
  metadata?: AssistantMetadata;
  error?: string;
}

// ===== EMBEDDING TYPES =====

export interface EmbeddingVector {
  vector: number[];
  dimensions: number;
  model?: string;
}

export interface SimilarityResult {
  id: string;
  score: number;
  distance?: number;
}

// ===== LOGGING TYPES =====

export interface LogEntry {
  timestamp: string;
  level: "info" | "error" | "warn" | "debug";
  message: string;
  data?: any;
}

export interface MCPLogEntry extends LogEntry {
  toolName: string;
  params: any;
  result?: any;
  error?: any;
}

export interface RAGLogEntry extends LogEntry {
  query: string;
  resultsCount: number;
  searchTime: number;
  topResultId?: string;
}

export interface AssistantLogEntry extends LogEntry {
  userId: string;
  message: string;
  responseType: string;
  toolsUsed: string[];
}

// ===== NEW FEATURE TYPES =====

export interface SearchResult {
  id: string;
  name: string;
  price: number;
  description: string;
  relevanceScore: number;
  source: "keyword" | "semantic" | "hybrid";
  image?: string;
}

export interface HybridSearchResponse {
  success: boolean;
  products: SearchResult[];
  ragResults: {
    topResult: any;
    totalFound: number;
  };
  metadata: {
    keywordMatches: number;
    semanticMatches: number;
    hybridResults: number;
    searchTime: number;
  };
}

export interface UserBehaviorLog {
  timestamp: string;
  userId: string;
  action: "search" | "product_view" | "add_to_cart" | "checkout_start" | "purchase";
  data: Record<string, any>;
  sessionId?: string;
}

export interface UserBehaviorAnalytics {
  searches: UserBehaviorLog[];
  views: UserBehaviorLog[];
  carts: UserBehaviorLog[];
  checkouts: UserBehaviorLog[];
  purchases: UserBehaviorLog[];
  totalActions: number;
}

