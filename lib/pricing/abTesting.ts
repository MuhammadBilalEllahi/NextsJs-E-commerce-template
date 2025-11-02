/**
 * A/B Testing Engine for Pricing Optimization
 * Dynamic pricing with real-time testing
 */

export interface PriceVariant {
  id: string;
  price: number;
  discount: number;
  users: number;
  conversions: number;
  revenue: number;
  conversionRate: number;
}

export interface ABTest {
  productId: string;
  testId: string;
  startDate: string;
  status: "active" | "completed" | "paused";
  variants: PriceVariant[];
  winner?: string;
  confidence: number;
}

/**
 * Create A/B price test
 */
export async function createPriceTest(
  productId: string,
  currentPrice: number,
  testPrices: number[]
): Promise<ABTest> {
  console.log(`[A/B Testing] Creating price test for product: ${productId}`);

  const testId = `test_${Date.now()}`;
  const variants: PriceVariant[] = [
    {
      id: "control",
      price: currentPrice,
      discount: 0,
      users: 0,
      conversions: 0,
      revenue: 0,
      conversionRate: 0,
    },
    ...testPrices.map((price, index) => ({
      id: `variant_${index + 1}`,
      price,
      discount: ((currentPrice - price) / currentPrice) * 100,
      users: 0,
      conversions: 0,
      revenue: 0,
      conversionRate: 0,
    })),
  ];

  return {
    productId,
    testId,
    startDate: new Date().toISOString(),
    status: "active",
    variants,
    confidence: 0,
  };
}

/**
 * Get price for user (assigns variant)
 */
export function assignPriceVariant(test: ABTest, userId: string): PriceVariant {
  // Simple hash-based assignment for consistency
  const hash = userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const variantIndex = hash % test.variants.length;
  return test.variants[variantIndex];
}

/**
 * Record conversion
 */
export function recordConversion(
  test: ABTest,
  variantId: string,
  revenue: number
): ABTest {
  const variant = test.variants.find((v) => v.id === variantId);
  if (variant) {
    variant.conversions++;
    variant.revenue += revenue;
    variant.conversionRate = variant.users > 0 ? variant.conversions / variant.users : 0;
  }

  // Recalculate confidence
  test.confidence = calculateTestConfidence(test);

  return test;
}

/**
 * Calculate statistical confidence
 */
function calculateTestConfidence(test: ABTest): number {
  const control = test.variants[0];
  const variants = test.variants.slice(1);

  if (control.users < 30 || variants.some((v) => v.users < 30)) {
    return 0; // Need more data
  }

  // Simplified confidence calculation
  const maxRate = Math.max(...variants.map((v) => v.conversionRate));
  const improvement = (maxRate - control.conversionRate) / control.conversionRate;

  if (improvement > 0.1 && control.users > 100) {
    return 95; // High confidence
  } else if (improvement > 0.05 && control.users > 50) {
    return 80; // Medium confidence
  }

  return 50; // Low confidence
}

/**
 * Get winning variant
 */
export function getWinningVariant(test: ABTest): PriceVariant | null {
  if (test.confidence < 80) {
    return null; // Not enough confidence
  }

  const sortedByRevenue = [...test.variants].sort((a, b) => b.revenue - a.revenue);
  return sortedByRevenue[0];
}

/**
 * Mock A/B test data
 */
export async function getActivePriceTests(): Promise<ABTest[]> {
  return [
    {
      productId: "prod_001",
      testId: "test_001",
      startDate: "2024-11-01T00:00:00Z",
      status: "active",
      confidence: 85,
      variants: [
        {
          id: "control",
          price: 299,
          discount: 0,
          users: 150,
          conversions: 45,
          revenue: 13455,
          conversionRate: 0.3,
        },
        {
          id: "variant_1",
          price: 279,
          discount: 6.7,
          users: 145,
          conversions: 52,
          revenue: 14508,
          conversionRate: 0.36,
        },
        {
          id: "variant_2",
          price: 319,
          discount: -6.7,
          users: 148,
          conversions: 38,
          revenue: 12122,
          conversionRate: 0.26,
        },
      ],
      winner: "variant_1",
    },
    {
      productId: "prod_002",
      testId: "test_002",
      startDate: "2024-11-01T00:00:00Z",
      status: "active",
      confidence: 65,
      variants: [
        {
          id: "control",
          price: 399,
          discount: 0,
          users: 80,
          conversions: 24,
          revenue: 9576,
          conversionRate: 0.3,
        },
        {
          id: "variant_1",
          price: 379,
          discount: 5,
          users: 75,
          conversions: 26,
          revenue: 9854,
          conversionRate: 0.35,
        },
      ],
    },
  ];
}

/**
 * Get optimal price based on A/B test results
 */
export async function getOptimalPrice(productId: string): Promise<number | null> {
  const tests = await getActivePriceTests();
  const productTest = tests.find((t) => t.productId === productId);

  if (!productTest) {
    return null;
  }

  const winner = getWinningVariant(productTest);
  return winner ? winner.price : null;
}

