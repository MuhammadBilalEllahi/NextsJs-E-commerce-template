/**
 * MCP Tools Index
 * Centralized export for all MCP tools
 */

import searchProducts from "./searchProducts";
import filterByEmbedding from "./filterByEmbedding";
import compareProducts from "./compareProducts";
import getRecommendations from "./getRecommendations";
import expandQuery from "./expandQuery";
import addToCart from "./addToCart";
import findComplementaryProducts from "./findComplementaryProducts";
import checkout from "./checkout";
import applyBestCoupon from "./applyBestCoupon";
import suggestBundles from "./suggestBundles";
import getOrderStatus from "./getOrderStatus";
import initiateReturn from "./initiateReturn";
import logChatInteraction from "./logChatInteraction";
import updateUserInfo from "./updateUserInfo";
import getOrderDetails from "./getOrderDetails";
import getLowStockItems from "./getLowStockItems";
import generateDescription from "./generateDescription";
import flagUserActivity from "./flagUserActivity";
import suggestPriceChange from "./suggestPriceChange";
import getAnalytics from "./getAnalytics";
import getUserPurchaseHistory from "./getUserPurchaseHistory";

export const mcpTools = {
  searchProducts,
  filterByEmbedding,
  compareProducts,
  getRecommendations,
  expandQuery,
  addToCart,
  findComplementaryProducts,
  checkout,
  applyBestCoupon,
  suggestBundles,
  getOrderStatus,
  initiateReturn,
  logChatInteraction,
  updateUserInfo,
  getOrderDetails,
  getLowStockItems,
  generateDescription,
  flagUserActivity,
  suggestPriceChange,
  getAnalytics,
  getUserPurchaseHistory,
};

export type MCPToolName = keyof typeof mcpTools;

export default mcpTools;

