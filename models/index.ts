// Import all models to ensure they are registered with Mongoose
// Import dependencies before models that reference them
import './User';
import './Category';
import './Brand';
import './Variant';
import './Review';
import './Product';
import './FAQ';
import './Cart';
import './Order';
import './Address';
import './Reservation';
import './AbandonCartInfo';
import './BrandProducts';
import './CategoryProducts';

// Export all models for convenience
export { default as User } from './User';
export { default as Product } from './Product';
export { default as Category } from './Category';
export { default as Brand } from './Brand';
export { default as Review } from './Review';
export { default as FAQ } from './FAQ';
export { default as Variant } from './Variant';
export { default as Cart } from './Cart';
export { default as Order } from './Order';
export { AddressSubSchema } from './Address';
export { default as Reservation } from './Reservation';
export { default as AbandonCartInfo } from './AbandonCartInfo';
export { default as BrandProducts } from './BrandProducts';
export { default as CategoryProducts } from './CategoryProducts';

// Export Zod schemas
export { brandZodSchema } from './Brand';
export { categorySchema } from './Category';
export { productZodSchema } from './Product';
export { variantZodSchema } from './Variant';
export { reviewZodSchema } from './Review';
