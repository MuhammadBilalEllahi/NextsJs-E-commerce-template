/**
 * Logging System using Pino
 * Production-ready structured logging
 */

import fs from "fs";
import path from "path";

// Simple logger interface - in production, install and use pino
export interface Logger {
  info: (msg: string, data?: any) => void;
  error: (msg: string, data?: any) => void;
  warn: (msg: string, data?: any) => void;
  debug: (msg: string, data?: any) => void;
}

/**
 * Simple file logger implementation
 * Replace with actual pino when ready: npm install pino pino-pretty
 */
class SimpleLogger implements Logger {
  private logDir: string;
  private enabled: boolean;

  constructor(logFile: string) {
    this.logDir = path.join(process.cwd(), "logs");
    this.enabled = process.env.AI_LOGGING === "true";
    
    // Ensure logs directory exists
    if (this.enabled && !fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private writeLog(level: string, msg: string, data?: any) {
    if (!this.enabled) return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message: msg,
      data,
    };

    const logLine = JSON.stringify(logEntry) + "\n";
    
    // Write to console
    console.log(`[${level.toUpperCase()}] ${msg}`, data || "");
  }

  info(msg: string, data?: any) {
    this.writeLog("info", msg, data);
  }

  error(msg: string, data?: any) {
    this.writeLog("error", msg, data);
  }

  warn(msg: string, data?: any) {
    this.writeLog("warn", msg, data);
  }

  debug(msg: string, data?: any) {
    this.writeLog("debug", msg, data);
  }
}

// Create logger instances
export const mcpLogger = new SimpleLogger("mcp.log");
export const ragLogger = new SimpleLogger("rag.log");
export const assistantLogger = new SimpleLogger("assistant.log");

/**
 * Log MCP tool invocation
 */
export function logMCPTool(
  toolName: string,
  params: any,
  result?: any,
  error?: any
) {
  if (error) {
    mcpLogger.error(`MCP Tool Failed: ${toolName}`, { params, error });
  } else {
    mcpLogger.info(`MCP Tool Called: ${toolName}`, { params, result });
  }
}

/**
 * Log RAG search query
 */
export function logRAGQuery(query: string, results: any, searchTime: number) {
  ragLogger.info("RAG Query", {
    query,
    resultsCount: results.length,
    searchTime,
    topResult: results[0]?.document?.id || null,
  });
}

/**
 * Log assistant interaction
 */
export function logAssistantInteraction(
  userId: string,
  message: string,
  response: any,
  toolsUsed?: string[]
) {
  assistantLogger.info("Assistant Interaction", {
    userId,
    message,
    responseType: typeof response,
    toolsUsed: toolsUsed || [],
    timestamp: new Date().toISOString(),
  });
}

export default {
  mcp: mcpLogger,
  rag: ragLogger,
  assistant: assistantLogger,
  logMCPTool,
  logRAGQuery,
  logAssistantInteraction,
};

