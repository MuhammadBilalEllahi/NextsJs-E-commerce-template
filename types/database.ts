// Database Types - MongoDB Document Types
// These types represent the actual structure of documents in MongoDB
// They use _id instead of id and include all MongoDB-specific fields

import { Document, Types } from "mongoose";

// ===== BASE DATABASE TYPES =====
export interface BaseDBDocument extends Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ===== USER DATABASE TYPES =====
export interface UserDB extends BaseDBDocument {
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  passwordHash: string;
  role: "customer" | "admin";
  phone?: string;
  city?: string;
  addresses: Array<{
    label?: string;
    firstName?: string;
    lastName?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    phone?: string;
    countryCode?: string;
    isDefault?: boolean;
  }>;
  wishlist: Types.ObjectId[];
  cart?: Types.ObjectId;
  isActive: boolean;
}

// ===== PRODUCT DATABASE TYPES =====
export interface ProductDB extends BaseDBDocument {
  name: string;
  slug: string;
  description?: string;
  ingredients?: string;
  price: number;
  stock: number;
  discount: number;
  categories: Types.ObjectId[];
  images: string[];
  isFeatured: boolean;
  isTopSelling: boolean;
  isNewArrival: boolean;
  isBestSelling: boolean;
  isSpecial: boolean;
  isGrocery: boolean;
  brand?: Types.ObjectId;
  variants: Types.ObjectId[];
  reviews: Types.ObjectId[];
  ratingAvg: number;
  reviewCount: number;
  isActive: boolean;
  isOutOfStock: boolean;
}

// ===== VARIANT DATABASE TYPES =====
export interface VariantDB extends BaseDBDocument {
  product: Types.ObjectId;
  sku: string;
  slug: string;
  label?: string;
  price: number;
  discount: number;
  stock: number;
  images: string[];
  isActive: boolean;
  isOutOfStock: boolean;
}

// ===== REVIEW DATABASE TYPES =====
export interface ReviewDB extends BaseDBDocument {
  product: Types.ObjectId;
  user: Types.ObjectId;
  rating: number;
  title: string;
  comment: string;
  isVerified: boolean;
  isHelpful: number;
  images: string[];
  isActive: boolean;
  isEdited: boolean;
  editedAt?: Date;
}

// ===== CATEGORY DATABASE TYPES =====
export interface CategoryDB extends BaseDBDocument {
  name: string;
  slug: string;
  parent?: Types.ObjectId;
  description?: string;
  image?: string;
  isActive: boolean;
}

// ===== BRAND DATABASE TYPES =====
export interface BrandDB extends BaseDBDocument {
  name: string;
  logo?: string;
  description?: string;
  isActive: boolean;
}

// ===== ORDER DATABASE TYPES =====
export interface OrderItemDB {
  productId: Types.ObjectId;
  variantId?: Types.ObjectId;
  productName: string;
  variantLabel?: string;
  quantity: number;
  price: number;
  image?: string;
  productSlug: string;
  variantSku?: string;
  totalPrice: number;
}

export interface OrderHistoryDB {
  status: string;
  changedAt: Date;
  changedBy: string;
  reason?: string;
}

export interface OrderDB extends BaseDBDocument {
  orderId: string;
  refId: string;
  tracking: string;
  user?: Types.ObjectId;
  contact: {
    email: string;
    phone: string;
    marketingOptIn?: boolean;
  };
  shippingAddress: {
    label?: string;
    firstName?: string;
    lastName?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    phone?: string;
    countryCode?: string;
    isDefault?: boolean;
  };
  billingAddress?: {
    label?: string;
    firstName?: string;
    lastName?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    phone?: string;
    countryCode?: string;
    isDefault?: boolean;
  };
  shippingMethod: "home_delivery" | "tcs";
  payment: {
    method: "cod";
    status: "pending" | "paid" | "failed";
    transactionId?: string;
  };
  items: OrderItemDB[];
  subtotal: number;
  shippingFee: number;
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  cancellationReason?: string;
  history: OrderHistoryDB[];
}

// ===== CART DATABASE TYPES =====
export interface CartItemDB {
  productId: Types.ObjectId;
  variantId?: Types.ObjectId;
  quantity: number;
  priceSnapshot: number;
  label?: string;
  sku?: string;
  title: string;
  slug: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartDB extends BaseDBDocument {
  user?: Types.ObjectId;
  uuidv4?: string;
  items: CartItemDB[];
  currency: string;
  version: number;
}

// ===== ADDRESS DATABASE TYPES =====
export interface AddressDB extends BaseDBDocument {
  user: Types.ObjectId;
  label: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  phone: string;
  countryCode: string;
  isDefault: boolean;
  isBilling: boolean;
  isShipping: boolean;
}

// ===== FAQ DATABASE TYPES =====
export interface FAQDB extends BaseDBDocument {
  question: string;
  answer: string;
  category:
    | "general"
    | "products"
    | "shipping"
    | "returns"
    | "payment"
    | "account";
  tags: string[];
  isActive: boolean;
  order: number;
  viewCount: number;
  helpfulCount: number;
}

// ===== BANNER DATABASE TYPES =====
export interface BannerDB extends BaseDBDocument {
  title?: string;
  description?: string;
  image: string;
  link?: string;
  isActive: boolean;
  expiresAt?: Date;
  showTitle: boolean;
  showLink: boolean;
  showDescription: boolean;
  mimeType?: string;
  timeout?: number;
}

// ===== BRANCH DATABASE TYPES =====
export interface BranchDB extends BaseDBDocument {
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
  isActive: boolean;
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
}

// ===== GLOBAL SETTINGS DATABASE TYPES =====
export interface GlobalSettingsDB extends BaseDBDocument {
  bannerScrollTime: number;
}

// ===== CONTENT PAGE DATABASE TYPES =====
export interface ContentPageDB extends BaseDBDocument {
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
}

// ===== BLOG DATABASE TYPES =====
export interface BlogDB extends BaseDBDocument {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  image?: string;
  tags: string[];
  isActive: boolean;
}

// ===== NOTIFICATION DATABASE TYPES =====
export interface NotificationDB extends BaseDBDocument {
  user: Types.ObjectId;
  type:
    | "order_status"
    | "order_shipped"
    | "order_delivered"
    | "order_cancelled"
    | "refund_approved"
    | "refund_rejected"
    | "promotion"
    | "general";
  title: string;
  message: string;
  isRead: boolean;
  orderId?: Types.ObjectId;
  metadata: Record<string, any>;
  readAt?: Date;
}

// ===== REFUND DATABASE TYPES =====
export interface RefundDB extends BaseDBDocument {
  order: Types.ObjectId;
  user: Types.ObjectId;
  product: Types.ObjectId;
  variant?: Types.ObjectId;
  quantity: number;
  amount: number;
  reason: string;
  status: "pending" | "approved" | "rejected" | "processing" | "completed";
  adminNotes?: string;
  customerNotes?: string;
  refundMethod: "original_payment" | "store_credit" | "bank_transfer";
  processedBy?: Types.ObjectId;
  processedAt?: Date;
  refundDurationLimit?: number;
}

// ===== WISHLIST DATABASE TYPES =====
export interface WishlistDB extends BaseDBDocument {
  user?: Types.ObjectId;
  sessionId?: string;
  productId: Types.ObjectId;
  variantId?: Types.ObjectId;
  addedAt: Date;
}

// ===== TCS ORDER DATABASE TYPES =====
export interface TCSTrackingHistoryDB {
  status: string;
  location: string;
  timestamp: Date;
  description: string;
  updatedBy: string;
}

export interface TCSOrderDB extends BaseDBDocument {
  order: Types.ObjectId;
  consignmentNumber?: string;
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
  tcsResponse: Record<string, any>;
  lastApiCall: string;
  apiErrors: string[];
  trackingHistory: TCSTrackingHistoryDB[];
  estimatedDelivery?: string;
  actualDelivery?: string;
  paymentStatus: "pending" | "collected" | "failed" | "refunded";
  paymentDetails: Record<string, any>;
  pickupStatus: "pending" | "scheduled" | "picked_up" | "failed";
  pickupDate?: string;
  pickupTime?: string;
}

// ===== CHAT INQUIRY DATABASE TYPES =====
export interface ChatMessageDB {
  sender: "user" | "admin" | "system";
  message: string;
  timestamp: Date;
  isRead?: boolean;
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    sessionId?: string;
    adminId?: string;
    adminName?: string;
  };
}

export interface ChatInquiryDB extends BaseDBDocument {
  sessionId: string;
  userId?: Types.ObjectId;
  name?: string;
  email?: string;
  phone?: string;
  status: "open" | "closed" | "pending" | "resolved";
  priority: "low" | "medium" | "high" | "urgent";
  category: "general" | "order" | "product" | "technical" | "billing" | "other";
  messages: ChatMessageDB[];
  lastMessageAt: Date;
  assignedTo?: Types.ObjectId;
  tags: string[];
  metadata: {
    userAgent?: string;
    ipAddress?: string;
    referrer?: string;
    currentPage?: string;
  };
  isActive: boolean;
}

// ===== CAREER DATABASE TYPES =====
export interface CareerDB extends BaseDBDocument {
  title: string;
  location: string;
  type: string;
  description?: string;
  isActive: boolean;
}

// ===== JOB APPLICATION DATABASE TYPES =====
export interface JobApplicationDB extends BaseDBDocument {
  job: Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  coverLetter?: string;
  status?: "pending" | "reviewed" | "shortlisted" | "rejected" | "hired";
  notes?: string;
}

// ===== MARKETING CAMPAIGN DATABASE TYPES =====
export interface MarketingCampaignDB extends BaseDBDocument {
  name: string;
  subject: string;
  content: string;
  template: string;
  status: "draft" | "scheduled" | "sending" | "sent" | "paused" | "cancelled";
  scheduledAt?: Date;
  sentAt?: Date;
  totalRecipients: number;
  sentCount: number;
  openedCount: number;
  clickedCount: number;
  bouncedCount: number;
  createdBy: Types.ObjectId;
}

// ===== MARKETING EMAIL DATABASE TYPES =====
export interface MarketingEmailDB extends BaseDBDocument {
  email: string;
  isActive: boolean;
  subscribedAt: Date;
  unsubscribedAt?: Date;
  unsubscribeToken: string;
  campaigns: Array<{
    campaignId: Types.ObjectId;
    campaignName: string;
    sent: boolean;
    sentAt?: Date;
    opened?: boolean;
    openedAt?: Date;
    clicked?: boolean;
    clickedAt?: Date;
    bounced?: boolean;
    bouncedAt?: Date;
    bouncedReason?: string;
  }>;
}

// ===== TESTIMONIAL DATABASE TYPES =====
export interface TestimonialDB extends BaseDBDocument {
  author: string;
  quote: string;
  isActive: boolean;
}

// ===== ABANDONED CART DATABASE TYPES =====
export interface AbandonedCartDB extends BaseDBDocument {
  uuidv4: string;
  userId?: Types.ObjectId;
  email: string;
  phone?: string;
  shippingAddress?: {
    fullName?: string;
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  cartItems: Array<{
    productVariantId: Types.ObjectId;
    name: string;
    price: number;
    qty: number;
  }>;
  status: "pending" | "abandoned" | "converted" | "expired";
  expiresAt?: Date;
}

// ===== SHIPPING METHOD DATABASE TYPES =====
export interface LocationDB {
  city: string;
  state: string;
  country: string;
  shippingFee: number;
  tcsFee: number;
  estimatedDays: number;
  isAvailable: boolean;
}

export interface ShippingMethodDB extends BaseDBDocument {
  name: string;
  type: "home_delivery" | "tcs" | "pickup";
  isActive: boolean;
  locations: LocationDB[];
  defaultShippingFee: number;
  defaultTcsFee: number;
  defaultEstimatedDays: number;
  freeShippingThreshold: number;
  description: string;
  restrictions: string[];
}

// ===== COUNTER DATABASE TYPES =====
export interface CounterDB extends BaseDBDocument {
  name: string;
  value: number;
}

// ===== RANDOM IMAGE DATABASE TYPES =====
export interface RandomImageDB extends BaseDBDocument {
  name: string;
  url: string;
  category: string;
  tags: string[];
  isActive: boolean;
  uploadedBy: Types.ObjectId;
  uploadedAt: Date;
}

// ===== IMPORT HISTORY DATABASE TYPES =====
export interface ImportHistoryDB extends BaseDBDocument {
  importId: string;
  fileName: string;
  importedBy: Types.ObjectId;
  importedAt: Date;
  totalRows: number;
  productsCreated: number;
  variantsCreated: number;
  successCount: number;
  errorCount: number;
  errorDetails: string[];
  products: Array<{
    productId: Types.ObjectId;
    productName: string;
    productSlug: string;
    variants: Array<{
      variantId: Types.ObjectId;
      variantSku: string;
      variantLabel: string;
    }>;
  }>;
  isUndone: boolean;
  undoneAt?: Date;
  undoneBy?: Types.ObjectId;
}

// ===== SCHEDULED JOB DATABASE TYPES =====
export interface ScheduledJobDB extends BaseDBDocument {
  type: string;
  payload: any;
  runAt: Date;
  status: "pending" | "done" | "failed";
}

// ===== RESERVATION DATABASE TYPES =====
export interface ReservationDB extends BaseDBDocument {
  user: Types.ObjectId;
  product: Types.ObjectId;
  variant?: Types.ObjectId;
  quantity: number;
  reservedUntil: Date;
  status: "active" | "expired" | "fulfilled" | "cancelled";
}

// ===== PASSWORD RESET TOKEN DATABASE TYPES =====
export interface PasswordResetTokenDB extends BaseDBDocument {
  userId: Types.ObjectId;
  token: string;
  expiresAt: Date;
  used: boolean;
}

// ===== BRAND PRODUCTS DATABASE TYPES =====
export interface BrandProductsDB extends BaseDBDocument {
  id: Types.ObjectId;
  products: Types.ObjectId[];
  productCount: number;
  updatedAt: Date;
}

// ===== CATEGORY PRODUCTS DATABASE TYPES =====
export interface CategoryProductsDB extends BaseDBDocument {
  id: Types.ObjectId;
  products: Types.ObjectId[];
  productCount: number;
  updatedAt: Date;
}
