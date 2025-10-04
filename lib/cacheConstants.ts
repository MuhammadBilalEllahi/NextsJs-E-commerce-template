export const CACHE_BANNER_KEY = "banners";
export const CACHE_GLOBAL_SETTINGS_KEY = "global-settings";
export const CACHE_BRANCH_KEY = "branches";
export const CACHE_CATEGORIES_KEY = "categories";
export const CACHE_PRODUCTS_BY_CATEGORY_KEY = "products-by-category";
export const CACHE_CATEGORIES_WITH_CHILDREN_KEY = "categories-with-children";
export const CACHE_EXPIRE_TIME = 36000;
export const CACHE_CART_KEY = function (userId: string) {
  return `cart:${userId}`;
};
export const CACHE_CART_EXPIRE_TIME = {
  ONE_HOUR: 3600,
  ONE_DAY: 86400,
  ONE_WEEK: 604800,
  ONE_MONTH: 2592000,
  ONE_YEAR: 31536000,
};
