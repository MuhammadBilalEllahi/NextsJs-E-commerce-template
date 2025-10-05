// Centralized Type Definitions
// This file consolidates all type definitions from across the codebase

// Re-export existing types
export * from "./types";
export * from "./next-auth";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "customer" | "admin";
}

export interface DeliveryInfo {
  type: "home_delivery" | "tcs";
  title: string;
  description: string;
  icon: React.ReactNode;
  coverage: string;
  timeFrame: string;
  cost: string;
  features: string[];
  color: string;
}
// ===== CONTENT PAGE TYPES =====
export interface ContentPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  isActive: boolean;
  parentSlug?: string;
  sortOrder: number;
  showInFooter: boolean;
  showInHeader: boolean;
  createdAt: string;
  updatedAt: string;
}

// ===== ORDER TYPES =====
export interface OrderItem {
  productName: string;
  variantLabel: string;
  quantity: number;
  price: number;
  image: string;
  productSlug: string;
  variantSku: string;
  totalPrice: number;
}

export interface Address {
  id: string;
  label: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone: string;
  countryCode: string;
  isDefault: boolean;
  isBilling: boolean;
  isShipping: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  orderId: string;
  refId: string;
  date: string;
  status: string;
  total: number;
  itemsCount: number;
  shippingMethod: string;
  shippingFee: number;
  tcsFee: number;
  payment: string;
  paymentStatus: string;
  tracking: string;
  cancellationReason: string;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  contact: Address;
}

export interface OrderHistory {
  status: string;
  changedAt: string;
  changedBy: string;
  reason: string;
}

export interface AdminOrder {
  id: string;
  orderId: string;
  refId: string;
  date: string;
  customer: string;
  email: string;
  total: number;
  itemsCount: number;
  shippingMethod: string;
  shippingFee: number;
  tcsFee: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  payment: "cod";
  paymentStatus: "pending" | "paid" | "failed";
  tracking: string;
  cancellationReason?: string;
  history: OrderHistory[];
  address: Address;
  billingAddress?: Address;
  items: OrderItem[];
}
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  helpfulCount: number;
}
export interface OrderDetails {
  id: string;
  orderId: string;
  refId: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  payment: {
    method: string;
    status: string;
    transactionId?: string;
  };
  contact: {
    email: string;
    phone: string;
  };
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postalCode: string;
    phone: string;
    country: string;
  };
  billingAddress?: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postalCode: string;
    phone: string;
    country: string;
  };
  items: Array<{
    productTitle: string;
    variantLabel: string;
    quantity: number;
    price: number;
    image: string;
    productSlug: string;
    variantSku: string;
    totalPrice: number;
  }>;
  subtotal: number;
  shippingFee: number;
  total: number;
  tracking?: string;
  cancellationReason?: string;
  history: Array<{
    status: string;
    changedAt: string;
    changedBy: string;
    reason: string;
  }>;
}

export interface VariantDraft {
  sku: string;
  slug: string;
  label: string;
  price: number;
  stock: number;
  discount: number;
  images: File[];
}

export interface Variant {
  id?: string;
  sku: string;
  slug: string;
  label: string;
  price: number;
  stock: number;
  discount: number;
  images: (string | File)[];
  isActive: boolean;
  isOutOfStock: boolean;
  newImages?: File[];
}
export interface VariantLabel {
  imageIndex: number;
  label: string;
}

// ===== ADMIN REFUND TYPES =====
export interface AdminRefund {
  id: string;
  order: {
    id: string;
    orderId: string;
    refId: string;
    createdAt: string;
    status: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
  product: {
    id: string;
    name: string;
    images: string[] | File[];
  };
  variant?: {
    id: string;
    label: string;
    sku: string;
  };
  quantity: number;
  amount: number;
  reason: string;
  status: string;
  customerNotes?: string;
  adminNotes?: string;
  refundDurationLimit?: number;
  refundMethod: string;
  processedBy?: {
    id: string;
    name: string;
    email: string;
  };
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ===== REFUND TYPES =====
// export interface Refund {
//   id: string;
//   order: string;
//   product: string;
//   variant?: string;
//   quantity: number;
//   amount: number;
//   reason: string;
//   status: "pending" | "approved" | "rejected" | "processed";
//   requestedAt: string;
//   processedAt?: string;
//   processedBy?: string;
//   notes?: string;
//   refundMethod: "original" | "store_credit";
//   trackingNumber?: string;
//   customerNotes?: string;
//   adminNotes?: string;
//   updatedAt: string;
// }

export interface Refund {
  id: string;
  order: {
    id: string;
    orderId: string;
    refId: string;
    createdAt: string;
    status: string;
  };
  product: {
    id: string;
    name: string;
    images: string[] | File[];
    slug: string;
  };
  variant?: {
    id: string;
    label: string;
    sku: string;
  };
  quantity: number;
  amount: number;
  reason: string;
  status: "pending" | "approved" | "rejected" | "processed";
  notes?: string;
  customerNotes?: string;
  adminNotes?: string;
  refundMethod: "original" | "store_credit";

  processedBy?: {
    id: string;
    name: string;
    email: string;
  };
  processedAt?: string;
  refundDurationLimit?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  code: string;
  type: string;
  amount: number;
  starts?: string;
  ends?: string;
  restrict?: string;
}

export interface Location {
  city: string;
  state: string;
  country: string;
  shippingFee: number;
  tcsFee: number;
  estimatedDays: number;
  isAvailable: boolean;
}

export interface ShippingMethod {
  id?: string;
  name: string;
  type: "home_delivery" | "tcs" | "pickup";
  isActive: boolean;
  locations: Location[];
  defaultShippingFee: number;
  defaultTcsFee: number;
  defaultEstimatedDays: number;
  freeShippingThreshold: number;
  description: string;
  restrictions: string[];
}
// ===== NOTIFICATION TYPES =====
export interface Notification {
  id: string;
  userId: string;
  type: "order" | "promotion" | "system" | "shipping" | "payment";
  title: string;
  message: string;
  metadata: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  orderId?: {
    id: string;
    orderId: string;
    refId: string;
    status: string;
  };
}

export interface Payment {
  id: string;
  method: string;
  status: string;
  amount: number;
  date: string;
  orderId: string;
}

// ===== PRODUCT TYPES =====
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  ingredients: string;
  price: number;
  stock: number;
  discount: number;
  categories: Category[] | string[];
  images: string[] | File[];
  isFeatured: boolean;
  isTopSelling: boolean;
  isNewArrival: boolean;
  isBestSelling: boolean;
  isSpecial: boolean;
  brand: Brand | string;
  variants: Variant[];
  reviews: Review[] | string;
  ratingAvg: number;
  reviewCount: number;
  isActive: boolean;
  isOutOfStock: boolean;
  createdAt: string;
  updatedAt: string;
  isGrocery: boolean;
}

export interface ProductListItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  images: string[];
  image?: string;
  brand: string;
  rating: number;
  reviewCount: number;
  category: string;
  isTopSelling: boolean;
  isNewArrival: boolean;
}

export interface CreateProductData {
  name: string;
  description: string;
  ingredients: string;
  price: number;
  stock: number;
  discount: number;
  categories: Category[] | string[];
  images: (string | File)[];
  brand: Brand | string;
  isFeatured: boolean;
  isTopSelling: boolean;
  isNewArrival: boolean;
  isBestSelling: boolean;
  isSpecial: boolean;
  isGrocery: boolean;
}
export interface RandomImage {
  id: string;
  name: string;
  url: string;
  category: Category | string;
  tags: string[];
  uploadedBy: {
    name: string;
    email: string;
  };
  uploadedAt: string;
}

// ===== BANNER TYPES =====
export interface Banner {
  id: string;
  title: string;
  description: string;
  link: string;
  image: string;
  isActive: boolean;
  expiresAt: string;
  showTitle: boolean;
  showDescription: boolean;
  showLink: boolean;
  timeout?: number;
  mimeType?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBannerData {
  title: string;
  description: string;
  link: string;
  image: File | null;
  isActive: boolean;
  expiresAt: string;
  showTitle: boolean;
  showDescription: boolean;
  showLink: boolean;
  timeout?: number;
}

export interface GlobalSettings {
  bannerScrollTime: number;
}

// ===== BRANCH TYPES =====
export interface Branch {
  id: string;
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
  logo?: string;
  branchNumber: string;
  location: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  manager?: string;
  openingHours: {
    monday: { open: string; close: string; isOpen: boolean };
    tuesday: { open: string; close: string; isOpen: boolean };
    wednesday: { open: string; close: string; isOpen: boolean };
    thursday: { open: string; close: string; isOpen: boolean };
    friday: { open: string; close: string; isOpen: boolean };
    saturday: { open: string; close: string; isOpen: boolean };
    sunday: { open: string; close: string; isOpen: boolean };
  };
  description?: string;
  coordinates?: {
    latitude?: number;
    longitude?: number;
  };
  website?: string;
  whatsapp?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ===== BRAND TYPES =====
export interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  website?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBrandData {
  name: string;
  description: string;
  logo?: File;
}

// ===== CATEGORY TYPES =====
export interface Category {
  id: string;
  name: string;
  slug: string;
  parent?: string;
  description: string;
  image?: string;
  isActive: boolean;
  createdAt: string;
}

// ===== CART TYPES =====

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image?: string;
  qty: number;
  variantId?: string;
  variantLabel?: string;
  productId: string;
  slug: string;
  sku?: string;
};
// ===== WISHLIST TYPES =====

export interface WishlistItem {
  id: string;
  type: "registered" | "guest";
  userId?: string;
  sessionId?: string;
  userName: string;
  userEmail: string;
  productId: string;
  productSlug: string;
  productName: string;
  productImage: string;
  productPrice: number;
  variantId?: string;
  variantLabel?: string;
  isOutOfStock: boolean;
  availableStock: number;
  addedAt: string;
}

export interface WishlistProviderItem {
  productId: string;
  variantId?: string;
  addedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// ===== REVIEW TYPES =====
export interface Review {
  id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    images: string[] | File[];
  };
  user: string;
  rating: number;
  title: string;
  comment: string;
  isVerified: boolean;
  isHelpful: number;
  images: string[] | File[];
  isActive: boolean;
  isEdited: boolean;
  editedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ===== TCS ORDER TYPES =====
export interface TCSOrderData {
  consignmentNumber: string;
  status: string;
  location: string;
  timestamp: string;
  description: string;
  updatedBy: string;
}

export interface TCSOrder {
  id: string;

  consignmentNumber: string;
  customerReferenceNo: string;
  userName: string;
  password: string;
  costCenterCode: string;
  tcsAccountNo: string;
  consigneeName: string;
  consigneeAddress: string;
  consigneeMobNo: string;
  consigneeEmail: string;
  consigneeLandLine: string;
  originCityName: string;
  destinationCityName: string;
  weight: number;
  pieces: number;
  codAmount: string;
  productDetails: string;
  fragile: string;
  remarks: string;
  insuranceValue: number;
  services: string;
  transactionType: number;
  vendorName: string;
  vendorAddressName: string;
  vendorAddressDistrict: string;
  vendorAddressCity: string;
  vendorAddressArea: string;
  vendorContactNo: string;
  bookingInfo: string;
  shippingType: string;
  dsFlag: string;
  carrierSlug: string;
  status:
    | "pending"
    | "created"
    | "picked_up"
    | "in_transit"
    | "out_for_delivery"
    | "delivered"
    | "failed"
    | "cancelled";
  tcsResponse: Record<string, unknown>;
  lastApiCall: string;
  apiErrors: string[];
  trackingHistory: TCSOrderData[];
  estimatedDelivery?: string;
  actualDelivery?: string;
  paymentStatus: "pending" | "collected" | "failed" | "refunded";
  paymentDetails: Record<string, unknown>;
  pickupStatus: "pending" | "scheduled" | "picked_up" | "failed";
  pickupDate?: string;
  pickupTime?: string;
  createdAt: string;
  updatedAt: string;
  order: Order;
}

export interface TCSTrackingHistory {
  status: string;
  location: string;
  timestamp: string;
  description: string;
  updatedBy: string;
}
// ===== EMAIL TYPES =====
export interface OrderEmailData {
  orderId: string;
  refId: string;
  email: string;
  customerName: string;
  items: Array<{
    title: string;
    variantLabel?: string;
    quantity: number;
    priceAtPurchase: number;
    image?: string;
  }>;
  subtotal: number;
  shippingFee: number;
  tcsFee?: number;
  total: number;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postalCode?: string;
    phone: string;
    country: string;
  };
  shippingMethod: string;
  paymentMethod: string;
  orderDate: string;
  estimatedDelivery?: string;
  status: string;
  tcsInfo?: {
    consignmentNumber: string;
    estimatedDelivery: string;
    isOutsideLahore: boolean;
  };
}

// ===== USER PROFILE TYPES =====
export interface UserProfile {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  city?: string;
  addresses: Address[];
  wishlist: string[];
  cart?: string;
  isActive: boolean;
  createdAt: string;
  role: string;
}

// ===== ANALYTICS TYPES =====
export interface AnalyticsData {
  revenueByMonth: Array<{
    month: string;
    total: number;
  }>;
  ordersByStatus: Array<{
    status: string;
    count: number;
  }>;
  topProducts: Array<{
    product: string;
    sales: number;
  }>;
  lowStockProducts: Array<{
    product: string;
    stock: number;
  }>;
  ordersTrend: Array<{
    date: string;
    count: number;
  }>;
  paymentStatus: Array<{
    status: string;
    count: number;
  }>;
  shippingSplit: Array<{
    method: string;
    count: number;
  }>;
  refunds: Array<{
    status: string;
    count: number;
    amount: number;
  }>;
  topCategories: Array<{
    category: string;
    sales: number;
  }>;
}

// ===== BLOG TYPES =====
export interface Blog {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  tags: string[];
}

export interface Testimonial {
  author: string;
  quote: string;
}

// ===== MOCK DATA TYPES (for backward compatibility) =====
export interface MockCategory {
  id: string;
  name: string;
  slug: string;
  parent: { id: string; name: string } | null;
  description: string;
  image: string;
  isActive: boolean;
  createdAt: string;
}

export interface ShopLocations {
  id: string;
  name: string;
  logo: string; // https image
  address: string; // normal address
  phoneNumber: string; // pak number
  branchNumber: string; // 1,2,3
  location: string; // google maps
}

export interface MockProduct {
  id: string;
  slug: string;
  title: string;
  description?: string;
  price: number;
  brand?: string;
  type?: string;
  category?: string;
  rating?: number;
  popularity?: number;
  createdAt?: string;
  image?: string;
  images?: string[] | File[]; // Array of product images
  tags?: string[] | string;
  variants?: Array<{
    id: string;
    label: string;
    price?: number;
    stock?: number;
    isActive?: boolean;
    isOutOfStock?: boolean;
    images?: string[] | File[];
  }>;
  isOutOfStock?: boolean;
  stock?: number;
}

export interface MockTestimonial {
  name: string;
  rating: number;
  quote: string;
  avatar?: string;
}

export interface MockReview {
  id: number;
  user: string;
  rating: number; // 1-5
  comment: string;
  date: string;
}

export interface MockVariant {
  id: string;
  label: string;
  price: number;
  stock: number;
  isActive: boolean;
  isOutOfStock: boolean;
  images: string[] | File[];
}

export interface MockCategories {
  id: string;
  name: string;
}

export interface MockBrand {
  id: string;
  name: string;
}

export interface ImportHistoryItem {
  id: string;
  importId: string;
  fileName: string;
  importedBy: {
    name: string;
    email: string;
  };
  importedAt: string;
  totalRows: number;
  productsCreated: number;
  variantsCreated: number;
  successCount: number;
  errorCount: number;
  errorDetails: string[];
  products: {
    productId: string;
    productName: string;
    productSlug: string;
    variants: {
      variantId: string;
      variantSku: string;
      variantLabel: string;
    }[];
  }[];
  isUndone: boolean;
  undoneAt?: string;
  undoneBy?: {
    name: string;
    email: string;
  };
}

export interface ImportResult {
  totalProcessed: number;
  productsCreated: number;
  variantsCreated: number;
  success: number;
  errors: number;
  errorDetails: string[];
}

export interface ProductTypeVariant {
  id: string | number;
  slug: string;
  name: string;
  description: string;
  price: number;
  images: string[] | File[];
  ratingAvg: number;
  ingredients: string;
  instructions: string;
  categories: MockCategories[];
  brand: MockBrand;
  stock: number;
  tags?: string[] | string;
  reviews: MockReview[];
  variants?: MockVariant[];
}

// ===== TRACKING TYPES =====
export interface OrderData {
  orderId: string;
  refId: string;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  tracking: string;
  cancellationReason?: string;
  history: Array<{
    status: string;
    changedAt: string;
    changedBy: string;
    reason: string;
  }>;
  createdAt: string;
  updatedAt: string;
  contact: {
    email: string;
    phone: string;
  };
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postalCode: string;
    phone: string;
    country: string;
  };
  shippingMethod: string;
  payment: {
    method: string;
    status: string;
  };
  items: Array<{
    productName: string;
    variantLabel: string;
    quantity: number;
    price: number;
    image: string;
    productSlug: string;
    variantSku: string;
    totalPrice: number;
  }>;
  subtotal: number;
  shippingFee: number;
  total: number;
}

export interface TCSOrderData {
  consignmentNumber: string;
  status: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  trackingHistory: Array<{
    status: string;
    location: string;
    timestamp: string;
    description: string;
    updatedBy: string;
  }>;
  pickupStatus: string;
  paymentStatus: string;
  weight: number;
  pieces: number;
  codAmount: string;
  originCityName: string;
  destinationCityName: string;
  services: string;
  fragile: string;
  remarks: string;
  lastApiCall: string;
}

export interface TrackingData {
  order: OrderData;
  tcsOrder: TCSOrderData | null;
  latestTracking: unknown;
  deliveryInfo: {
    isOutsideLahore: boolean;
    estimatedDays: number;
    deliveryDate: string;
    isDelivered: boolean;
  };
}

// ===== COMMON UTILITY TYPES =====
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed";
export type PaymentMethod = "cod" | "card" | "bank_transfer";
export type RefundStatus = "pending" | "approved" | "rejected" | "processed";
export type NotificationType =
  | "order"
  | "promotion"
  | "system"
  | "shipping"
  | "payment";

// ===== API RESPONSE TYPES =====
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ===== FORM TYPES =====
export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export interface NewsletterFormData {
  email: string;
}

// ===== SEARCH TYPES =====
export interface SearchFilters {
  query?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sortBy?: "name" | "price" | "rating" | "newest";
  sortOrder?: "asc" | "desc";
}

export interface SearchResult {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  total: number;
  page: number;
  limit: number;
}
export type Day =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface DayHours {
  open: string;
  close: string;
  isOpen: boolean;
}

export type OpeningHours = Record<Day, DayHours>;

export interface CreateBranchData {
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
  branchNumber: string;
  location: string;
  city: string;
  state: string;
  country?: string;
  postalCode?: string;
  manager?: string;
  openingHours?: {
    monday?: { open: string; close: string; isOpen: boolean };
    tuesday?: { open: string; close: string; isOpen: boolean };
    wednesday?: { open: string; close: string; isOpen: boolean };
    thursday?: { open: string; close: string; isOpen: boolean };
    friday?: { open: string; close: string; isOpen: boolean };
    saturday?: { open: string; close: string; isOpen: boolean };
    sunday?: { open: string; close: string; isOpen: boolean };
  };
  description?: string;
  coordinates?: {
    latitude?: number;
    longitude?: number;
  };
  website?: string;
  whatsapp?: string;
  isActive?: boolean;
  logo: File;
}

export interface UpdateBranchData extends Partial<CreateBranchData> {
  id: string;
  logo?: File;
}

export interface BranchesResponse {
  branches: Branch[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string;
  images?: (string | File)[];
}

export interface TCSCity {
  cityID: string;
  cityName: string;
  cityCode: string;
  area: string;
}

export interface TCSOrigin {
  areaID: string;
  areaName: string;
  areaCode: string;
  servedVia: string;
}

export interface TCSCountry {
  countryId: string;
  countryName: string;
}

export interface TCSOrderRequest {
  userName: string;
  password: string;
  costCenterCode: string;
  consigneeName: string;
  consigneeAddress: string;
  consigneeMobNo: string;
  consigneeEmail: string;
  originCityName: string;
  destinationCityName: string;
  weight: number;
  pieces: number;
  codAmount: string;
  customerReferenceNo?: string;
  services: string;
  productDetails?: string;
  fragile: string;
  remarks?: string;
  insuranceValue?: number;
}

export interface TCSOrderResponse {
  CN?: string;
  returnStatus?: {
    code: string;
    status: string;
    message: string;
    requestTime: string;
    responseTime: string;
  };
}

export interface TCSTrackingResponse {
  cnDetail?: Array<{
    consignmentNumber: string;
    customerRefernceNumber: string;
    consignee: string;
    consigneeAddress: string;
    consigneeContact: string;
    consigneeEmail: string;
    ShipmentPieces: string;
    ShipmentWeight: string;
    service: string;
    origin: string;
    destination: string;
    remarks: string;
    fragile: string;
    insuranceValue: string;
    destinationCountry: string;
    productDetail: string;
    codAmount: string;
  }>;
}

export interface TCSCancelRequest {
  userName: string;
  password: string;
  consignmentNumber: string;
}

export interface TCSPickupStatusResponse {
  returnStatus: {
    code: string;
    status: string;
    message: string;
    requestTime: string;
    responseTime: string;
  };
}

export interface TCSPaymentDetailsResponse {
  returnStatus: {
    code: string;
    status: string;
    message: string;
    requestTime: string;
    responseTime: string;
  };
}
