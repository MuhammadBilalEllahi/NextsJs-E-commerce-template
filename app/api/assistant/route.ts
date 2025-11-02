/**
 * AI Assistant API Route
 * Handles chat messages, MCP tool invocations, and RAG queries
 */

import { NextRequest, NextResponse } from "next/server";
import mcpTools, { MCPToolName } from "@/lib/tools";
import { ragSearch, searchProducts, searchHelp } from "@/lib/rag";
import { logAssistantInteraction, logMCPTool, logRAGQuery } from "@/lib/logging/logger";

export const runtime = "nodejs";

interface AssistantMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface AssistantRequest {
  messages: AssistantMessage[];
  userId?: string;
  sessionId?: string;
}

interface ToolInvocation {
  tool: string;
  params: any;
  result: any;
  error?: string;
}

interface AssistantResponse {
  success: boolean;
  message: string;
  toolInvocations?: ToolInvocation[];
  ragResults?: any;
  metadata?: {
    processingTime: number;
    toolsUsed: string[];
    ragUsed: boolean;
  };
  error?: string;
}

/**
 * Parse MCP tool command from message
 * Format: /tool toolName {"param":"value"}
 */
function parseToolCommand(message: string): { tool: string; params: any } | null {
  const toolMatch = message.match(/\/tool\s+(\w+)\s+({.*})/);
  if (toolMatch) {
    try {
      const [, toolName, paramsJson] = toolMatch;
      const params = JSON.parse(paramsJson);
      return { tool: toolName, params };
    } catch (error) {
      console.error("Error parsing tool command:", error);
      return null;
    }
  }
  return null;
}

/**
 * Detect if message is asking for help/information
 */
function isQueryMessage(message: string): boolean {
  const queryKeywords = [
    "what", "how", "when", "where", "why", "who",
    "tell me", "show me", "find", "search",
    "help", "explain", "describe"
  ];
  const lowerMessage = message.toLowerCase();
  return queryKeywords.some(keyword => lowerMessage.includes(keyword));
}

/**
 * Execute MCP tool
 */
async function executeTool(toolName: string, params: any): Promise<ToolInvocation> {
  console.log(`[Assistant] Executing tool: ${toolName}`);
  
  try {
    // Check if tool exists
    if (!(toolName in mcpTools)) {
      throw new Error(`Tool not found: ${toolName}`);
    }

    const tool = mcpTools[toolName as MCPToolName];
    const result = await tool(...Object.values(params));

    logMCPTool(toolName, params, result);

    return {
      tool: toolName,
      params,
      result,
    };
  } catch (error: any) {
    console.error(`[Assistant] Tool execution error:`, error);
    logMCPTool(toolName, params, null, error.message);

    return {
      tool: toolName,
      params,
      result: null,
      error: error.message || "Tool execution failed",
    };
  }
}

/**
 * Process message with RAG
 */
async function processRAGQuery(message: string) {
  console.log(`[Assistant] Processing RAG query: ${message}`);
  
  const startTime = Date.now();
  
  // Determine query type
  const isProductQuery = message.toLowerCase().includes("product") || 
                        message.toLowerCase().includes("spice") ||
                        message.toLowerCase().includes("buy");
  
  const isHelpQuery = message.toLowerCase().includes("how") ||
                      message.toLowerCase().includes("policy") ||
                      message.toLowerCase().includes("return") ||
                      message.toLowerCase().includes("shipping");

  let results;
  
  if (isProductQuery) {
    results = await searchProducts(message, 3);
  } else if (isHelpQuery) {
    results = await searchHelp(message, 3);
  } else {
    results = await ragSearch(message, 5);
  }

  const searchTime = Date.now() - startTime;
  logRAGQuery(message, results.results, searchTime);

  return results;
}

/**
 * Generate response based on RAG results
 */
function generateRAGResponse(ragResults: any): string {
  if (!ragResults.results || ragResults.results.length === 0) {
    return "I couldn't find specific information about that. Could you rephrase your question or be more specific?";
  }

  const topResult = ragResults.results[0];
  const doc = topResult.document;

  let response = `Based on what I found (confidence: ${(topResult.score * 100).toFixed(1)}%):\n\n`;
  response += doc.content;

  if (ragResults.results.length > 1) {
    response += "\n\nRelated information:\n";
    ragResults.results.slice(1, 3).forEach((result: any, index: number) => {
      response += `${index + 1}. ${result.document.content.substring(0, 100)}...\n`;
    });
  }

  return response;
}

/**
 * POST /api/assistant
 * Main assistant endpoint
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body: AssistantRequest = await request.json();
    const { messages, userId = "anonymous", sessionId } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: "No messages provided" },
        { status: 400 }
      );
    }

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== "user") {
      return NextResponse.json(
        { success: false, error: "Last message must be from user" },
        { status: 400 }
      );
    }

    const userMessage = lastMessage.content;
    console.log(`[Assistant] Processing message from ${userId}: ${userMessage}`);

    const toolInvocations: ToolInvocation[] = [];
    const toolsUsed: string[] = [];
    let ragResults = null;
    let responseMessage = "";

    // Check for tool command
    const toolCommand = parseToolCommand(userMessage);
    
    if (toolCommand) {
      // Execute MCP tool
      console.log(`[Assistant] Tool command detected: ${toolCommand.tool}`);
      const invocation = await executeTool(toolCommand.tool, toolCommand.params);
      toolInvocations.push(invocation);
      toolsUsed.push(toolCommand.tool);

      if (invocation.error) {
        responseMessage = `Error executing tool '${toolCommand.tool}': ${invocation.error}`;
      } else {
        responseMessage = `Tool '${toolCommand.tool}' executed successfully. Result: ${JSON.stringify(invocation.result, null, 2)}`;
      }
    } else if (isQueryMessage(userMessage)) {
      // Use RAG for informational queries
      console.log(`[Assistant] Query message detected, using RAG`);
      ragResults = await processRAGQuery(userMessage);
      responseMessage = generateRAGResponse(ragResults);
    } else {
      // General response
      responseMessage = "I'm your AI shopping assistant. You can:\n\n" +
        "• Ask questions about products or policies (e.g., 'What spices do you have?')\n" +
        "• Use tools with /tool command (e.g., '/tool searchProducts {\"query\":\"chili\"}')\n" +
        "• Get help with orders, shipping, and returns\n\n" +
        "How can I help you today?";
    }

    const processingTime = Date.now() - startTime;

    // Log interaction
    logAssistantInteraction(userId, userMessage, responseMessage, toolsUsed);

    const response: AssistantResponse = {
      success: true,
      message: responseMessage,
      toolInvocations: toolInvocations.length > 0 ? toolInvocations : undefined,
      ragResults: ragResults || undefined,
      metadata: {
        processingTime,
        toolsUsed,
        ragUsed: !!ragResults,
      },
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("[Assistant] Error processing request:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
        message: "I encountered an error processing your request. Please try again.",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/assistant
 * Health check and info endpoint
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "AI Assistant API is running",
    version: "1.0.0",
    capabilities: {
      tools: Object.keys(mcpTools),
      rag: true,
      logging: process.env.AI_LOGGING === "true",
    },
  });
}

