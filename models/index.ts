// Import all models to ensure they are registered with Mongoose
// Import dependencies before models that reference them
import "@/models/User";
import "@/models/Category";
import "@/models/Brand";
import "@/models/Variant";
import "@/models/Review";
import "@/models/Product";
import "@/models/FAQ";
import "@/models/Cart";
import "@/models/Order";
import "@/models/Address";
import "@/models/Reservation";
import "@/models/AbandonCartInfo";
import "@/models/BrandProducts";
import "@/models/CategoryProducts";
import "@/models/Banner";
import "@/models/Counter";
import "@/models/Wishlist";
import "@/models/Notification";
import "@/models/Refund";

// Export all models for convenience
export { default as User } from "@/models/User";
export { default as Product } from "@/models/Product";
export { default as Category } from "@/models/Category";
export { default as Brand } from "@/models/Brand";
export { default as Review } from "@/models/Review";
export { default as FAQ } from "@/models/FAQ";
export { default as Variant } from "@/models/Variant";
export { default as Cart } from "@/models/Cart";
export { default as Order } from "@/models/Order";
export { AddressSubSchema } from "@/models/Address";
export { default as Reservation } from "@/models/Reservation";
export { default as AbandonCartInfo } from "@/models/AbandonCartInfo";
export { default as BrandProducts } from "@/models/BrandProducts";
export { default as CategoryProducts } from "@/models/CategoryProducts";
export { default as Banner } from "@/models/Banner";
export { default as Counter } from "@/models/Counter";
export { default as Wishlist } from "@/models/Wishlist";
export { default as Notification } from "@/models/Notification";
export { default as Refund } from "@/models/Refund";
export { default as Address } from "@/models/Address";

// Export Zod schemas
export { brandZodSchema } from "@/models/Brand";
export { categorySchema } from "@/models/Category";
export { productZodSchema } from "@/models/Product";
export { variantZodSchema } from "@/models/Variant";
export { reviewZodSchema } from "@/models/Review";
export { zodBannerSchema } from "@/models/Banner";
export { wishlistZodSchema } from "@/models/Wishlist";
export { NotificationZodSchema } from "@/models/Notification";
export { RefundZodSchema } from "@/models/Refund";
export { AddressZodSchema, AddressSubZodSchema } from "@/models/Address";
