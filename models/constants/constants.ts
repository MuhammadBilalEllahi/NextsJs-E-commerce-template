export const MODELS = {
  COUNTER: "Counter",
  PRODUCT: "Product",
  USER: "User",
  VARIANT: "Variant",
  CATEGORY: "Category",
  CART: "Cart",
  RESERVATION: "Reservation",
  ORDER: "Order",
  ABANDONED_CART: "AbandonedCart",
  BRAND: "Brand",
  REVIEW: "Review",
  FAQ: "FAQ",
  BRAND_PRODUCTS: "BrandProducts",
  CATEGORY_PRODUCTS: "CategoryProducts",
  BANNER: "Banner",
  GLOBAL_SETTINGS: "GlobalSettings",
  BRANCH: "Branch",
  SHIPPING_METHOD: "ShippingMethod",
  SCHEDULED_JOBS: "ScheduledJob",
  WISHLIST: "Wishlist",
  NOTIFICATION: "Notification",
  ADDRESS: "Address",
  REFUND: "Refund",
  IMPORT_HISTORY: "ImportHistory",
  CONTENT_PAGE: "ContentPage",
  BLOG: "Blog",
  CAREER: "Career",
  CHAT_INQUIRY: "ChatInquiry",
  TESTIMONIAL: "Testimonial",
  JOB_APPLICATION: "JobApplication",
  MARKETING_EMAIL: "MarketingEmail",
  MARKETING_CAMPAIGN: "MarketingCampaign",
  PASSWORD_RESET_TOKEN: "PasswordResetToken",
  RANDOM_IMAGE: "RandomImage",
};

export const ORDER_TYPE = {
  HOME_DELIVERY: "home_delivery",
  TCS: "tcs",
  PICKUP: "pickup",
};

export const PAYMENT_TYPE = {
  COD: "cod",
};

export const ORDER_PAYMENT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
};

export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

export const RESERVATION_STATUS = {
  ACTIVE: "active",
  CONSUMED: "consumed",
  CANCELLED: "cancelled",
};

export const UserTypes = {
  CUSTOMER: "customer",
  ADMIN: "admin",
};

export const TCS_STATUS = {
  PENDING: "pending",
  CREATED: "created",
  PICKED_UP: "picked_up",
  IN_TRANSIT: "in_transit",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERED: "delivered",
  FAILED: "failed",
  CANCELLED: "cancelled",
};

export const TCS_PAYMENT_STATUS = {
  PENDING: "pending",
  COLLECTED: "collected",
  FAILED: "failed",
  REFUNDED: "refunded",
};

export const TCS_PICKUP_STATUS = {
  PENDING: "pending",
  SCHEDULED: "scheduled",
  PICKED_UP: "picked_up",
  FAILED: "failed",
};

export const ABANDONED_CART_STATUS = {
  PENDING: "pending",
  ABANDONED: "abandoned",
  CONVERTED: "converted",
  EXPIRED: "expired",
};