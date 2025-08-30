// Currency constants for the application
export const CURRENCY = {
  // Main currency symbol
  SYMBOL: "Rs.",
  
  // Currency name
  NAME: "Pakistani Rupee",
  
  // Currency code
  CODE: "PKR",
  
  // Decimal places
  DECIMAL_PLACES: 2,
  
  // Free shipping threshold
  FREE_SHIPPING_THRESHOLD: 50,
  
  // Standard shipping cost
  STANDARD_SHIPPING_COST: 4.99,
  
  // Loyalty program rate (coins per currency unit)
  LOYALTY_RATE: 1,
  
  // Loyalty discount threshold
  LOYALTY_DISCOUNT_THRESHOLD: 500,
  
  // Loyalty discount percentage
  LOYALTY_DISCOUNT_PERCENTAGE: 5,
} as const

// Helper function to format currency
export const formatCurrency = (amount: number): string => {
  return `${CURRENCY.SYMBOL} ${amount.toFixed(CURRENCY.DECIMAL_PLACES)}`
}

// Helper function to format price range
export const formatPriceRange = (min: number, max: number | string): string => {
  const maxDisplay = max === "Max" ? "Max" : formatCurrency(max as number)
  return `${CURRENCY.SYMBOL} ${min} – ${maxDisplay}`
}

// Helper function to check if order qualifies for free shipping
export const qualifiesForFreeShipping = (subtotal: number): boolean => {
  return subtotal >= CURRENCY.FREE_SHIPPING_THRESHOLD
}

// Helper function to calculate shipping cost
export const calculateShippingCost = (subtotal: number): number => {
  return qualifiesForFreeShipping(subtotal) ? 0 : CURRENCY.STANDARD_SHIPPING_COST
}

// Helper function to calculate total with shipping
export const calculateTotalWithShipping = (subtotal: number): number => {
  return subtotal + calculateShippingCost(subtotal)
}
