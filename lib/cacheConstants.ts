// FRONTEND

import { ThemeName } from "./providers/themeProvider";
import { SITE_NAME_FULL } from "./constants/site";

// BACKEND
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



// Cache keys and expiry times
export const PRELOAD_CACHE_KEY = `${SITE_NAME_FULL}_preload_data`;
export const CACHE_EXPIRY_TIME = 30 * 60 * 1000; // 30 minutes


export const SESSION_TOKEN_KEY = "session-token";



export const THEME_STORAGE_KEY = "dm-color-theme";
export const THEME_CLASS_PREFIX = "theme-";
export const ALL_THEMES: ThemeName[] = ["classic", "emerald", "rose", "amber"];

export const WISHLIST_STORAGE_KEY = "dm-wishlist";

export const CHAT_BUS_EVENT_PREFIX = "chat:";


export const ORDER_ID_PREFIX = "DM";
export const REF_ID_PREFIX = "REF";

export const GUEST_CART_ID_STORAGE_KEY = "dm-guest-cart-id";