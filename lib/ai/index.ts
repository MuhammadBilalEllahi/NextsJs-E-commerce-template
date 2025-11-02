/**
 * AI Integration Index
 * Centralized exports for all AI features
 */

// MCP Tools
export * from "../tools";
export { default as mcpTools } from "../tools";

// RAG System
export * from "../rag";
export { default as RAG } from "../rag";

// Logging
export * from "../logging";
export { default as logger } from "../logging";

// Types
export * from "./types";

// Convenience exports
import mcpTools from "../tools";
import RAG from "../rag";
import logger from "../logging";

export const AI = {
  tools: mcpTools,
  rag: RAG,
  logger,
};

export default AI;

