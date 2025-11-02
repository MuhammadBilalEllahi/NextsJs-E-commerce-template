/**
 * User Behavior Logging Module
 * Tracks user interactions for analytics
 */

import fs from "fs";
import path from "path";

interface BehaviorLog {
  timestamp: string;
  userId: string;
  action: "search" | "product_view" | "add_to_cart" | "checkout_start" | "purchase";
  data: Record<string, any>;
  sessionId?: string;
}

/**
 * Log user behavior
 */
export function logUserBehavior(
  userId: string,
  action: BehaviorLog["action"],
  data: Record<string, any>,
  sessionId?: string
): void {
  if (process.env.AI_LOGGING !== "true") {
    return;
  }

  const logEntry: BehaviorLog = {
    timestamp: new Date().toISOString(),
    userId,
    action,
    data,
    sessionId,
  };

  const logLine = JSON.stringify(logEntry) + "\n";

  // Console log for development
  console.log(`[User Behavior] ${action}:`, data);

  // Write to file (server-side only)
  if (typeof window === "undefined") {
    try {
      const logsDir = path.join(process.cwd(), "logs");
      const logFile = path.join(logsDir, "user-behavior.log");

      // Ensure logs directory exists
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }

      // Append to log file
      fs.appendFileSync(logFile, logLine);
    } catch (error) {
      console.error("[User Behavior] Error writing log:", error);
    }
  }
}

/**
 * Log search query
 */
export function logSearch(
  userId: string,
  query: string,
  resultsCount: number,
  sessionId?: string
): void {
  logUserBehavior(
    userId,
    "search",
    {
      query,
      resultsCount,
      queryLength: query.length,
    },
    sessionId
  );
}

/**
 * Log product view
 */
export function logProductView(
  userId: string,
  productId: string,
  productName: string,
  sessionId?: string
): void {
  logUserBehavior(
    userId,
    "product_view",
    {
      productId,
      productName,
    },
    sessionId
  );
}

/**
 * Log add to cart
 */
export function logAddToCart(
  userId: string,
  productId: string,
  quantity: number,
  price: number,
  sessionId?: string
): void {
  logUserBehavior(
    userId,
    "add_to_cart",
    {
      productId,
      quantity,
      price,
      totalValue: price * quantity,
    },
    sessionId
  );
}

/**
 * Log checkout start
 */
export function logCheckoutStart(
  userId: string,
  cartTotal: number,
  itemCount: number,
  sessionId?: string
): void {
  logUserBehavior(
    userId,
    "checkout_start",
    {
      cartTotal,
      itemCount,
      avgItemValue: cartTotal / itemCount,
    },
    sessionId
  );
}

/**
 * Log purchase
 */
export function logPurchase(
  userId: string,
  orderId: string,
  total: number,
  itemCount: number,
  sessionId?: string
): void {
  logUserBehavior(
    userId,
    "purchase",
    {
      orderId,
      total,
      itemCount,
      avgItemValue: total / itemCount,
    },
    sessionId
  );
}

/**
 * Get user behavior analytics (read from logs)
 */
export function getUserBehaviorAnalytics(userId: string): any {
  if (typeof window !== "undefined") {
    return null;
  }

  try {
    const logFile = path.join(process.cwd(), "logs", "user-behavior.log");

    if (!fs.existsSync(logFile)) {
      return { searches: [], views: [], carts: [], checkouts: [], purchases: [] };
    }

    const logContent = fs.readFileSync(logFile, "utf-8");
    const lines = logContent.trim().split("\n");

    const userLogs = lines
      .filter((line) => line.trim())
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter((log) => log && log.userId === userId);

    return {
      searches: userLogs.filter((log) => log.action === "search"),
      views: userLogs.filter((log) => log.action === "product_view"),
      carts: userLogs.filter((log) => log.action === "add_to_cart"),
      checkouts: userLogs.filter((log) => log.action === "checkout_start"),
      purchases: userLogs.filter((log) => log.action === "purchase"),
      totalActions: userLogs.length,
    };
  } catch (error) {
    console.error("[User Behavior] Error reading analytics:", error);
    return null;
  }
}

