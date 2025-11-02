/**
 * Multi-language Translation System
 * Supports English and Urdu
 */

export type Language = "en" | "ur";

export interface Translation {
  [key: string]: string | Translation;
}

const translations: Record<Language, Translation> = {
  en: {
    common: {
      loading: "Loading...",
      error: "Error",
      success: "Success",
      cancel: "Cancel",
      confirm: "Confirm",
      save: "Save",
      delete: "Delete",
      edit: "Edit",
      search: "Search",
      filter: "Filter",
      sort: "Sort",
    },
    voice: {
      listening: "Listening... Speak now",
      processing: "Processing...",
      clickToSpeak: "Click to speak",
      voiceNotSupported: "Voice assistant not supported in this browser",
      tryChrome: "Try Chrome or Edge",
      youSaid: "You said:",
      assistant: "Assistant:",
      examples: {
        search: "Show me red chili powder",
        addCart: "Add garam masala to cart",
        orderStatus: "What's my order status?",
        recommend: "Recommend spicy products",
      },
    },
    products: {
      addToCart: "Add to Cart",
      buyNow: "Buy Now",
      outOfStock: "Out of Stock",
      inStock: "In Stock",
      price: "Price",
      description: "Description",
      reviews: "Reviews",
      rating: "Rating",
      categories: "Categories",
      featured: "Featured Products",
      newArrivals: "New Arrivals",
      bestsellers: "Bestsellers",
    },
    cart: {
      title: "Shopping Cart",
      empty: "Your cart is empty",
      subtotal: "Subtotal",
      shipping: "Shipping",
      tax: "Tax",
      total: "Total",
      checkout: "Proceed to Checkout",
      continueShopping: "Continue Shopping",
      removeItem: "Remove",
      updateQuantity: "Update",
    },
    checkout: {
      title: "Checkout",
      shippingAddress: "Shipping Address",
      paymentMethod: "Payment Method",
      orderSummary: "Order Summary",
      placeOrder: "Place Order",
      applyCoupon: "Apply Coupon",
      couponCode: "Coupon Code",
    },
    orders: {
      myOrders: "My Orders",
      orderNumber: "Order #",
      orderDate: "Order Date",
      status: "Status",
      total: "Total",
      trackOrder: "Track Order",
      viewDetails: "View Details",
      pending: "Pending",
      processing: "Processing",
      shipped: "Shipped",
      delivered: "Delivered",
      cancelled: "Cancelled",
    },
  },
  ur: {
    common: {
      loading: "لوڈ ہو رہا ہے...",
      error: "خرابی",
      success: "کامیابی",
      cancel: "منسوخ کریں",
      confirm: "تصدیق کریں",
      save: "محفوظ کریں",
      delete: "حذف کریں",
      edit: "ترمیم کریں",
      search: "تلاش کریں",
      filter: "فلٹر",
      sort: "ترتیب دیں",
    },
    voice: {
      listening: "سن رہا ہے... اب بولیں",
      processing: "کارروائی ہو رہی ہے...",
      clickToSpeak: "بولنے کے لیے کلک کریں",
      voiceNotSupported: "آواز کی معاون خدمت اس براؤزر میں دستیاب نہیں",
      tryChrome: "کروم یا ایج استعمال کریں",
      youSaid: "آپ نے کہا:",
      assistant: "معاون:",
      examples: {
        search: "مجھے لال مرچ دکھائیں",
        addCart: "گرم مصالحہ کارٹ میں ڈالیں",
        orderStatus: "میرے آرڈر کی حالت کیا ہے؟",
        recommend: "مسالے دار پروڈکٹس تجویز کریں",
      },
    },
    products: {
      addToCart: "کارٹ میں شامل کریں",
      buyNow: "ابھی خریدیں",
      outOfStock: "اسٹاک ختم",
      inStock: "دستیاب",
      price: "قیمت",
      description: "تفصیل",
      reviews: "جائزے",
      rating: "درجہ",
      categories: "زمرے",
      featured: "نمایاں مصنوعات",
      newArrivals: "نئی آمد",
      bestsellers: "سب سے زیادہ فروخت",
    },
    cart: {
      title: "شاپنگ کارٹ",
      empty: "آپ کی کارٹ خالی ہے",
      subtotal: "ذیلی کل",
      shipping: "ترسیل",
      tax: "ٹیکس",
      total: "کل",
      checkout: "چیک آؤٹ کریں",
      continueShopping: "خریداری جاری رکھیں",
      removeItem: "ہٹائیں",
      updateQuantity: "تبدیل کریں",
    },
    checkout: {
      title: "چیک آؤٹ",
      shippingAddress: "ترسیل کا پتہ",
      paymentMethod: "ادائیگی کا طریقہ",
      orderSummary: "آرڈر کا خلاصہ",
      placeOrder: "آرڈر دیں",
      applyCoupon: "کوپن استعمال کریں",
      couponCode: "کوپن کوڈ",
    },
    orders: {
      myOrders: "میرے آرڈرز",
      orderNumber: "آرڈر #",
      orderDate: "آرڈر کی تاریخ",
      status: "حالت",
      total: "کل",
      trackOrder: "آرڈر ٹریک کریں",
      viewDetails: "تفصیلات دیکھیں",
      pending: "زیر التواء",
      processing: "کارروائی میں",
      shipped: "بھیج دیا گیا",
      delivered: "پہنچا دیا گیا",
      cancelled: "منسوخ",
    },
  },
};

/**
 * Get translation by key
 */
export function t(
  key: string,
  language: Language = "en",
  params?: Record<string, string>
): string {
  const keys = key.split(".");
  let value: any = translations[language];

  for (const k of keys) {
    value = value?.[k];
    if (!value) break;
  }

  let result = value || key;

  // Replace parameters
  if (params) {
    Object.entries(params).forEach(([param, val]) => {
      result = result.replace(`{{${param}}}`, val);
    });
  }

  return result;
}

/**
 * Get all translations for a namespace
 */
export function getTranslations(
  namespace: string,
  language: Language = "en"
): Translation {
  const keys = namespace.split(".");
  let value: any = translations[language];

  for (const k of keys) {
    value = value?.[k];
    if (!value) return {};
  }

  return value;
}

/**
 * Check if browser language is Urdu
 */
export function detectLanguage(): Language {
  if (typeof window === "undefined") return "en";

  const browserLang = navigator.language;
  if (browserLang.startsWith("ur")) {
    return "ur";
  }

  return "en";
}

/**
 * Text direction based on language
 */
export function getTextDirection(language: Language): "ltr" | "rtl" {
  return language === "ur" ? "rtl" : "ltr";
}

/**
 * Format number based on language
 */
export function formatNumber(num: number, language: Language = "en"): string {
  if (language === "ur") {
    // Urdu-Indic numerals (optional)
    return new Intl.NumberFormat("ur-PK").format(num);
  }
  return new Intl.NumberFormat("en-PK").format(num);
}

/**
 * Format currency
 */
export function formatCurrency(
  amount: number,
  language: Language = "en"
): string {
  const formatted = new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
  }).format(amount);

  if (language === "ur") {
    return formatted.replace("PKR", "روپے");
  }

  return formatted.replace("PKR", "Rs.");
}


