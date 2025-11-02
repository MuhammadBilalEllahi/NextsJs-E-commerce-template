/**
 * Test script for AI Integration
 * Run with: npx tsx scripts/test-ai-integration.ts
 */

import mcpTools from "../lib/tools";
import { ragSearch, searchProducts, searchHelp } from "../lib/rag";

async function testMCPTools() {
  console.log("\n🛠️  Testing MCP Tools...\n");

  try {
    // Test searchProducts
    console.log("1. Testing searchProducts...");
    const productResults = await mcpTools.searchProducts("chili");
    console.log(`✅ Found ${productResults.length} products`);

    // Test getRecommendations
    console.log("\n2. Testing getRecommendations...");
    const recommendations = await mcpTools.getRecommendations("user123");
    console.log(`✅ Generated ${recommendations.recommendations.length} recommendations`);

    // Test addToCart
    console.log("\n3. Testing addToCart...");
    const cartResult = await mcpTools.addToCart("user123", "prod_001", 2);
    console.log(`✅ Cart updated: ${cartResult.cart.itemCount} items`);

    // Test getAnalytics
    console.log("\n4. Testing getAnalytics...");
    const analytics = await mcpTools.getAnalytics("sales");
    console.log(`✅ Sales today: Rs. ${analytics.data.today}`);

    // Test getLowStockItems
    console.log("\n5. Testing getLowStockItems...");
    const lowStock = await mcpTools.getLowStockItems(5);
    console.log(`✅ Found ${lowStock.items.length} low stock items`);

    console.log("\n✅ All MCP Tools tests passed!\n");
  } catch (error) {
    console.error("❌ MCP Tools test failed:", error);
  }
}

async function testRAGSystem() {
  console.log("\n🔍 Testing RAG System...\n");

  try {
    // Test general search
    console.log("1. Testing ragSearch...");
    const results = await ragSearch("red chili powder", 3);
    console.log(`✅ Found ${results.totalFound} results in ${results.searchTime}ms`);
    if (results.topResult) {
      console.log(`   Top result: ${results.topResult.document.id} (score: ${results.topResult.score.toFixed(2)})`);
    }

    // Test product search
    console.log("\n2. Testing searchProducts...");
    const productResults = await searchProducts("spices", 5);
    console.log(`✅ Found ${productResults.totalFound} products`);

    // Test help search
    console.log("\n3. Testing searchHelp...");
    const helpResults = await searchHelp("shipping policy", 2);
    console.log(`✅ Found ${helpResults.totalFound} help articles`);
    if (helpResults.topResult) {
      console.log(`   Answer: ${helpResults.topResult.document.content.substring(0, 100)}...`);
    }

    console.log("\n✅ All RAG System tests passed!\n");
  } catch (error) {
    console.error("❌ RAG System test failed:", error);
  }
}

async function testIntegration() {
  console.log("🤖 AI Integration Test Suite\n");
  console.log("================================\n");

  await testMCPTools();
  await testRAGSystem();

  console.log("================================");
  console.log("\n🎉 All tests completed!\n");
  console.log("Next steps:");
  console.log("1. Start dev server: npm run dev");
  console.log("2. Test API: curl http://localhost:3000/api/assistant");
  console.log("3. Add <AIAssistant /> to a page");
  console.log("\nSee README_AI_INTEGRATION.md for more info.\n");
}

// Run tests
testIntegration().catch(console.error);

