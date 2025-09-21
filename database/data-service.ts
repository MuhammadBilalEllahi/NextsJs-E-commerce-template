"use server";
// Import specific models for use
import Product from "@/models/Product";
import Category from "@/models/Category";
import Brand from "@/models/Brand";
import Review from "@/models/Review";
import FAQ from "@/models/FAQ";
import Variant from "@/models/Variant";
import dbConnect from "@/database/mongodb";
import RedisClient from "@/database/redisClient";
import Banner from "@/models/Banner";
import GlobalSettings from "@/models/GlobalSettings";
import {
  CACHE_EXPIRE_TIME,
  CACHE_BANNER_KEY,
  CACHE_BRANCH_KEY,
  CACHE_GLOBAL_SETTINGS_KEY,
  CACHE_CATEGORIES_KEY,
  CACHE_PRODUCTS_BY_CATEGORY_KEY,
} from "@/lib/cacheConstants";
import Branch from "@/models/Branches";
import ContentPage from "@/models/ContentPage";
import { ProductTypeVariant, Variant as VariantType } from "@/mock_data/data";

export async function getAllBranches() {
  try {
    await dbConnect();
    const cachedBranches = await RedisClient.get(CACHE_BRANCH_KEY);
    if (cachedBranches) {
      return JSON.parse(cachedBranches);
    }
    const branches = await Branch.find({ isActive: true }).lean();
    if (branches.length > 0) {
      await RedisClient.set(
        CACHE_BRANCH_KEY,
        JSON.stringify(branches),
        CACHE_EXPIRE_TIME
      );
    }
    return branches;
  } catch (error) {
    console.error("Error fetching branches:", error);
    return [];
  }
}

export async function getGlobalSettings() {
  try {
    await dbConnect();
    const cachedSettings = await RedisClient.get(CACHE_GLOBAL_SETTINGS_KEY);
    if (cachedSettings) {
      return JSON.parse(cachedSettings);
    }
    const globalSettings = await GlobalSettings.findOne({}).lean();
    if (globalSettings) {
      await RedisClient.set(
        CACHE_GLOBAL_SETTINGS_KEY,
        JSON.stringify(globalSettings),
        CACHE_EXPIRE_TIME
      );
    }
    return globalSettings;
  } catch (error) {
    console.error("Error fetching global settings:", error);
    return null;
  }
}

export async function getAllBanners() {
  try {
    await dbConnect();
    const cachedBanners = await RedisClient.get(CACHE_BANNER_KEY);
    if (cachedBanners) {
      return JSON.parse(cachedBanners);
    }
    const banners = await Banner.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();

    // Filter out expired banners
    const activeBanners = banners.filter((banner) => {
      if (banner.expiresAt) {
        const expiryDate = new Date(banner.expiresAt);
        const now = new Date();
        return expiryDate > now;
      }
      return true;
    });

    if (activeBanners.length > 0) {
      if ((await RedisClient.get(CACHE_BANNER_KEY)) !== null) {
        await RedisClient.del(CACHE_BANNER_KEY);
      }
      await RedisClient.set(
        CACHE_BANNER_KEY,
        JSON.stringify(activeBanners),
        CACHE_EXPIRE_TIME
      );
    }
    return activeBanners;
  } catch (error) {
    console.error("Error fetching banners:", error);
    return [];
  }
}

// getAllTopSellingProducts
export async function getAllTopSellingProducts(limit = 10, page = 1) {
  try {
    await dbConnect();
    const skip = (page - 1) * limit;

    const products = await Product.find({ isActive: true, isTopSelling: true })
      // .populate("brand", "name")
      // .populate("categories", "name")
      .populate({
        path: "variants",
        match: { isActive: true, isOutOfStock: false },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Product.countDocuments({
      isActive: true,
      isTopSelling: true,
    });
    console.log(
      "products in getAllTopSellingProducts",
      JSON.stringify(products, null, 2)
    );
    return {
      products: products.map((product) => ({
        id: String(product._id),
        slug: product.slug,
        title: product.name,
        description: product.description,
        price: product?.variants?.[0]?.price ?? product?.price ?? 0,
        images: product.images,
        image:
          product.images && product.images.length > 0
            ? product.images[0]
            : undefined,
        rating: product.ratingAvg,
        isTopSelling: product.isTopSelling,
        // ingredients: product.ingredients,
        instructions: "", // Can be added to product model later
        // category: product.categories?.[0]?.name || "spices",
        // brand: product.brand?.name || "Dehli Mirch",
        // stock: product.variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) || 0,
        tags: [], // Can be added to product model later
        variants: (product?.variants || [])
          .filter((variant: any) => variant.isActive) // Only show active variants
          .sort((a: any, b: any) => {
            // Sort: available first, then out-of-stock
            const aAvailable = !a.isOutOfStock && a.stock > 0;
            const bAvailable = !b.isOutOfStock && b.stock > 0;
            if (aAvailable && !bAvailable) return -1;
            if (!aAvailable && bAvailable) return 1;
            return 0;
          })
          .map((variant: any) => ({
            _id: String(variant._id),
            label: variant.label,
            price: variant.price,
            stock: variant.stock,
            isActive: variant.isActive,
            isOutOfStock: variant.isOutOfStock,
            images: variant.images || [],
          })),
        // reviews: product.reviews?.map(review => ({
        //   id: String(review._id),
        //   user: review.user?.name || "Anonymous",
        //   rating: review.rating,
        //   comment: review.comment,
        //   date: review.createdAt
        // })) || []
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching top selling products:", error);
    return { products: [], pagination: { page: 1, limit, total: 0, pages: 0 } };
  }
}
// getAllFeaturedProducts
export async function getAllFeaturedProducts(limit = 10, page = 1) {
  try {
    await dbConnect();
    const skip = (page - 1) * limit;

    const products = await Product.find({ isActive: true, isFeatured: true })
      // .populate("brand", "name")
      // .populate("categories", "name")
      .populate({
        path: "variants",
        match: { isActive: true, isOutOfStock: false },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Product.countDocuments({
      isActive: true,
      isFeatured: true,
    });
    console.log(
      "products in getAllFeaturedProducts",
      JSON.stringify(products, null, 2)
    );
    return {
      products: products.map((product) => ({
        id: String(product._id),
        slug: product.slug,
        title: product.name,
        description: product.description,
        price: product?.variants?.[0]?.price ?? product?.price ?? 0,
        images: product.images,
        image:
          product.images && product.images.length > 0
            ? product.images[0]
            : undefined,
        rating: product.ratingAvg,
        isFeatured: product.isFeatured,
        // ingredients: product.ingredients,
        instructions: "", // Can be added to product model later
        // category: product.categories?.[0]?.name || "spices",
        // brand: product.brand?.name || "Dehli Mirch",
        // stock: product.variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) || 0,
        tags: [], // Can be added to product model later
        variants: (product?.variants || [])
          .filter((variant: any) => variant.isActive) // Only show active variants
          .sort((a: any, b: any) => {
            // Sort: available first, then out-of-stock
            const aAvailable = !a.isOutOfStock && a.stock > 0;
            const bAvailable = !b.isOutOfStock && b.stock > 0;
            if (aAvailable && !bAvailable) return -1;
            if (!aAvailable && bAvailable) return 1;
            return 0;
          })
          .map((variant: any) => ({
            _id: String(variant._id),
            label: variant.label,
            price: variant.price,
            stock: variant.stock,
            isActive: variant.isActive,
            isOutOfStock: variant.isOutOfStock,
            images: variant.images || [],
          })),
        // reviews: product.reviews?.map(review => ({
        //   id: String(review._id),
        //   user: review.user?.name || "Anonymous",
        //   rating: review.rating,
        //   comment: review.comment,
        //   date: review.createdAt
        // })) || []
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return { products: [], pagination: { page: 1, limit, total: 0, pages: 0 } };
  }
}

export async function getAllNewArrivalsProducts(limit = 10, page = 1) {
  try {
    await dbConnect();
    const skip = (page - 1) * limit;

    const products = await Product.find({ isActive: true, isNewArrival: true })
      // .populate("brand", "name")
      // .populate("categories", "name")
      .populate({
        path: "variants",
        match: { isActive: true, isOutOfStock: false },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Product.countDocuments({
      isActive: true,
      isNewArrival: true,
    });
    // console.log("products in getAllNewArrivalsProducts", JSON.stringify(products, null, 2));
    return {
      products: products.map((product) => ({
        id: String(product._id),
        slug: product.slug,
        title: product.name,
        description: product.description,
        price: product?.variants?.[0]?.price ?? product?.price ?? 0,
        images: product.images,
        image:
          product.images && product.images.length > 0
            ? product.images[0]
            : undefined,
        rating: product.ratingAvg,
        isNewArrival: product.isNewArrival,
        // ingredients: product.ingredients,
        instructions: "", // Can be added to product model later
        // category: product.categories?.[0]?.name || "spices",
        // brand: product.brand?.name || "Dehli Mirch",
        // stock: product.variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) || 0,
        tags: [], // Can be added to product model later
        variants: (product?.variants || [])
          .filter((variant: any) => variant.isActive) // Only show active variants
          .sort((a: any, b: any) => {
            // Sort: available first, then out-of-stock
            const aAvailable = !a.isOutOfStock && a.stock > 0;
            const bAvailable = !b.isOutOfStock && b.stock > 0;
            if (aAvailable && !bAvailable) return -1;
            if (!aAvailable && bAvailable) return 1;
            return 0;
          })
          .map((variant: any) => ({
            _id: String(variant._id),
            label: variant.label,
            price: variant.price,
            stock: variant.stock,
            isActive: variant.isActive,
            isOutOfStock: variant.isOutOfStock,
            images: variant.images || [],
          })),
        // reviews: product.reviews?.map(review => ({
        //   id: String(review._id),
        //   user: review.user?.name || "Anonymous",
        //   rating: review.rating,
        //   comment: review.comment,
        //   date: review.createdAt
        // })) || []
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching new arrivals products:", error);
    return { products: [], pagination: { page: 1, limit, total: 0, pages: 0 } };
  }
}
// Product data functions
export async function getAllProducts() {
  try {
    await dbConnect();
    const products = await Product.find({ isActive: true, isOutOfStock: false })
      .populate("brand", "name")
      .populate("categories", "name")
      .populate({
        path: "variants",
        match: { isActive: true, isOutOfStock: false },
      })
      .sort({ createdAt: -1 })
      .lean();

    // console.log("products in getAllProducts", JSON.stringify(products, null, 2));

    return products.map((product) => ({
      id: String(product._id),
      slug: product.slug,
      title: product.name,
      description: product.description,
      price: product.price,
      images: product.images,
      rating: product.ratingAvg,
      ingredients: product.ingredients,
      instructions: "", // Can be added to product model later
      category: product.categories?.[0]?.name || "spices",
      brand: product.brand?.name || "Dehli Mirch",
      stock:
        product.variants?.reduce(
          (sum: number, v: any) => sum + (v.stock || 0),
          0
        ) || 0,
      tags: [], // Can be added to product model later
      variants: (product.variants || [])
        .filter((variant: any) => variant.isActive) // Only show active variants
        .sort((a: any, b: any) => {
          // Sort: available first, then out-of-stock
          const aAvailable = !a.isOutOfStock && a.stock > 0;
          const bAvailable = !b.isOutOfStock && b.stock > 0;
          if (aAvailable && !bAvailable) return -1;
          if (!aAvailable && bAvailable) return 1;
          return 0;
        })
        .map((variant: any) => ({
          _id: String(variant._id),
          label: variant.label,
          price: variant.price,
          stock: variant.stock,
          isActive: variant.isActive,
          isOutOfStock: variant.isOutOfStock,
          images: variant.images,
        })),
      reviews:
        product.reviews?.map((review: any) => ({
          id: String(review._id),
          user: review.user?.name || "Anonymous",
          rating: review.rating,
          comment: review.comment,
          date: review.createdAt,
        })) || [],
    }));
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

// getAllSpecialProducts
export async function getAllSpecialProducts(limit = 10, page = 1) {
  try {
    await dbConnect();
    const skip = (page - 1) * limit;

    const products = await Product.find({ isActive: true, isSpecial: true })
      .populate({
        path: "variants",
        match: { isActive: true, isOutOfStock: false },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Product.countDocuments({
      isActive: true,
      isSpecial: true,
    });
    console.log(
      "products in getAllSpecialProducts",
      JSON.stringify(products, null, 2)
    );
    return {
      products: products.map((product) => ({
        id: String(product._id),
        slug: product.slug,
        title: product.name,
        description: product.description,
        price: product?.variants?.[0]?.price ?? product?.price ?? 0,
        images: product.images,
        image:
          product.images && product.images.length > 0
            ? product.images[0]
            : undefined,
        rating: product.ratingAvg,
        isSpecial: product.isSpecial,
        // ingredients: product.ingredients,
        instructions: "", // Can be added to product model later
        // category: product.categories?.[0]?.name || "spices",
        // brand: product.brand?.name || "Dehli Mirch",
        // stock: product.variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) || 0,
        tags: [], // Can be added to product model later
        variants: (product?.variants || [])
          .filter((variant: any) => variant.isActive) // Only show active variants
          .sort((a: any, b: any) => {
            // Sort: available first, then out-of-stock
            const aAvailable = !a.isOutOfStock && a.stock > 0;
            const bAvailable = !b.isOutOfStock && b.stock > 0;
            if (aAvailable && !bAvailable) return -1;
            if (!aAvailable && bAvailable) return 1;
            return 0;
          })
          .map((variant: any) => ({
            _id: String(variant._id),
            label: variant.label,
            price: variant.price,
            stock: variant.stock,
            isActive: variant.isActive,
            isOutOfStock: variant.isOutOfStock,
            images: variant.images,
          })),
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching special products:", error);
    return { products: [], pagination: { page: 1, limit, total: 0, pages: 0 } };
  }
}

export async function getAllGroceryProducts(limit = 10, page = 1) {
  try {
    await dbConnect();
    const skip = (page - 1) * limit;

    const products = await Product.find({ isActive: true, isGrocery: true })
      .populate({
        path: "variants",
        match: { isActive: true, isOutOfStock: false },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Product.countDocuments({
      isActive: true,
      isGrocery: true,
    });
    console.log(
      "products in getAllGroceryProducts",
      JSON.stringify(products, null, 2)
    );
    return {
      products: products.map((product) => ({
        id: String(product._id),
        slug: product.slug,
        title: product.name,
        description: product.description,
        price: product?.variants?.[0]?.price ?? product?.price ?? 0,
        images: product.images,
        image:
          product.images && product.images.length > 0
            ? product.images[0]
            : undefined,
        rating: product.ratingAvg,
        isGrocery: product.isGrocery,
        // ingredients: product.ingredients,
        instructions: "", // Can be added to product model later
        // category: product.categories?.[0]?.name || "spices",
        // brand: product.brand?.name || "Dehli Mirch",
        // stock: product.variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) || 0,
        tags: [], // Can be added to product model later
        variants: (product?.variants || [])
          .filter((variant: any) => variant.isActive) // Only show active variants
          .sort((a: any, b: any) => {
            // Sort: available first, then out-of-stock
            const aAvailable = !a.isOutOfStock && a.stock > 0;
            const bAvailable = !b.isOutOfStock && b.stock > 0;
            if (aAvailable && !bAvailable) return -1;
            if (!aAvailable && bAvailable) return 1;
            return 0;
          })
          .map((variant: any) => ({
            _id: String(variant._id),
            label: variant.label,
            price: variant.price,
            stock: variant.stock,
            isActive: variant.isActive,
            isOutOfStock: variant.isOutOfStock,
            images: variant.images,
          })),
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching grocery products:", error);
    return { products: [], pagination: { page: 1, limit, total: 0, pages: 0 } };
  }
}

// getAllActiveBrands - sorted by product count (highest to lowest)
export async function getAllActiveBrands() {
  try {
    await dbConnect();

    // Get all active brands
    const brands = await Brand.find({ isActive: true }).lean();

    // Get product count for each brand and sort by product count
    const brandsWithProductCount = await Promise.all(
      brands.map(async (brand) => {
        const productCount = await Product.countDocuments({
          brand: brand._id,
          isActive: true,
          isOutOfStock: false,
        });

        return {
          id: String(brand._id),
          name: brand.name,
          description: brand.description,
          logo: brand.logo,
          isActive: brand.isActive,
          productCount,
        };
      })
    );

    // Sort by product count in descending order (highest to lowest)
    const sortedBrands = brandsWithProductCount.sort(
      (a, b) => b.productCount - a.productCount
    );

    // Return only the brand data without productCount (as requested)
    return sortedBrands.map(({ productCount, ...brand }) => brand);
  } catch (error) {
    console.error("Error fetching active brands:", error);
    return [];
  }
}

export async function getProductBySlug(slug: string) {
  try {
    await dbConnect();
    const product = await Product.findOne({ slug, isActive: true })
      .populate("brand", "name")
      .populate("categories", "name")
      .populate("variants")
      .lean<ProductTypeVariant>();
    // .lean();

    if (!product) return null;

    // Filter and sort variants: available first, then out-of-stock
    const availableVariants: VariantType[] = (product.variants || []).filter(
      (variant: any) =>
        variant.isActive && !variant.isOutOfStock && variant.stock > 0
    );

    const outOfStockVariants: VariantType[] = (product.variants || []).filter(
      (variant: any) =>
        variant.isActive && (variant.isOutOfStock || variant.stock <= 0)
    );

    // Combine: available first, then out-of-stock
    const sortedVariants = [...availableVariants, ...outOfStockVariants];

    return {
      id: String(product._id),
      slug: product.slug,
      title: product.name,
      description: product.description,
      price: product.price,
      images: product.images,
      rating: product.ratingAvg,
      ingredients: product.ingredients,
      instructions: "", // Can be added later
      category: product.categories?.[0]?.name || "spices",
      brand: product.brand?.name || "Dehli Mirch",
      stock: availableVariants.reduce(
        (sum: number, v: any) => sum + (v.stock || 0),
        0
      ),
      tags: [], // Can be added later
      variants: sortedVariants.map((variant: any) => ({
        _id: String(variant._id),
        label: variant.label,
        price: variant.price,
        stock: variant.stock,
        isActive: variant.isActive,
        isOutOfStock: variant.isOutOfStock,
        images: variant.images,
      })),
      reviews:
        product.reviews?.map((review: any) => ({
          id: String(review._id),
          user: review.user?.name || "Anonymous",
          rating: review.rating,
          comment: review.comment,
          date: review.createdAt,
        })) || [],
    };
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    return null;
  }
}

// Category data functions
export async function getAllCategories() {
  try {
    await dbConnect();

    // Check Redis cache first
    const cachedCategories = await RedisClient.get(CACHE_CATEGORIES_KEY);
    if (cachedCategories) {
      return JSON.parse(cachedCategories);
    }

    // Fetch from database if not in cache
    const categories = await Category.find({ isActive: true })
      .populate("parent", "name")
      .sort({ order: 1, name: 1 })
      .lean();

    const formattedCategories = categories.map((category) => ({
      id: String(category._id),
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      parent: category.parent
        ? {
            id: String(category.parent._id),
            name: category.parent.name,
          }
        : null,
      productCount: 0, // Can be populated later if needed
    }));

    // Cache the results for 10 hours
    if (formattedCategories.length > 0) {
      await RedisClient.set(
        CACHE_CATEGORIES_KEY,
        JSON.stringify(formattedCategories),
        CACHE_EXPIRE_TIME
      );
    }

    return formattedCategories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

// Brand data functions
export async function getAllBrands() {
  try {
    await dbConnect();
    const brands = await Brand.find({ isActive: true })
      .sort({ name: 1 })
      .lean();

    return brands.map((brand) => ({
      id: String(brand._id),
      name: brand.name,
      description: brand.description,
      logo: brand.logo,
    }));
  } catch (error) {
    console.error("Error fetching brands:", error);
    return [];
  }
}

// Review data functions
export async function getProductReviews(
  productId: string,
  limit = 10,
  page = 1
) {
  try {
    await dbConnect();
    const skip = (page - 1) * limit;

    const reviews = await Review.find({
      product: productId,
      isActive: true,
    })
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Review.countDocuments({
      product: productId,
      isActive: true,
    });

    return {
      reviews: reviews.map((review) => ({
        id: String(review._id),
        user: review.user?.name || "Anonymous",
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        date: review.createdAt,
        isVerified: review.isVerified,
        helpfulCount: review.helpfulCount,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    return { reviews: [], pagination: { page: 1, limit, total: 0, pages: 0 } };
  }
}

// Get products by brand
export async function getProductsByBrand(brandName: string, limit = 10) {
  try {
    await dbConnect();

    // First find the brand
    const brand = await Brand.findOne({
      name: brandName,
      isActive: true,
    }).lean();
    if (!brand) return [];

    // Find products for this brand
    const products = await Product.find({
      isActive: true,
      isOutOfStock: false,
      brand: (brand as any)._id,
    })
      .populate("brand", "name")
      .populate({
        path: "variants",
        match: { isActive: true, isOutOfStock: false },
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const formattedProducts = products.map((product) => ({
      id: String(product._id),
      slug: product.slug,
      title: product.name,
      description: product.description,
      price: product?.variants?.[0]?.price ?? product?.price ?? 0,
      images: product.images,
      image:
        product.images && product.images.length > 0
          ? product.images[0]
          : undefined,
      rating: product.ratingAvg,
      brand: product.brand?.name || "Dehli Mirch",
      variants: (product.variants || [])
        .filter((variant: any) => variant.isActive)
        .map((variant: any) => ({
          _id: String(variant._id),
          label: variant.label,
          price: variant.price,
          stock: variant.stock,
          isActive: variant.isActive,
          isOutOfStock: variant.isOutOfStock,
          images: variant.images,
        })),
    }));

    return formattedProducts;
  } catch (error) {
    console.error("Error fetching products by brand:", error);
    return [];
  }
}

// Get products by category
export async function getProductsByCategory(categorySlug: string, limit = 10) {
  try {
    await dbConnect();

    // Create cache key for this specific category and limit
    const cacheKey = `${CACHE_PRODUCTS_BY_CATEGORY_KEY}:${categorySlug}:${limit}`;

    // Check Redis cache first
    const cachedProducts = await RedisClient.get(cacheKey);
    if (cachedProducts) {
      return JSON.parse(cachedProducts);
    }

    // First find the category
    const category = await Category.findOne({
      slug: categorySlug,
      isActive: true,
    }).lean();
    if (!category) return [];

    // Find products in this category
    const products = await Product.find({
      isActive: true,
      isOutOfStock: false,
      categories: (category as any)._id,
    })
      .populate("brand", "name")
      .populate({
        path: "variants",
        match: { isActive: true, isOutOfStock: false },
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const formattedProducts = products.map((product) => ({
      id: String(product._id),
      slug: product.slug,
      title: product.name,
      price: product?.variants?.[0]?.price ?? product?.price ?? 0,
      images: product.images,
      image:
        product.images && product.images.length > 0
          ? product.images[0]
          : undefined,
      brand: product.brand?.name || "Dehli Mirch",
    }));

    // Cache the results for 2 hours (shorter than categories since products change more frequently)
    if (formattedProducts.length > 0) {
      await RedisClient.set(cacheKey, JSON.stringify(formattedProducts), 7200); // 2 hours
    }

    return formattedProducts;
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return [];
  }
}

// Get trending products (top selling + new arrivals)
export async function getTrendingProducts(limit = 6) {
  try {
    await dbConnect();

    // Get top selling products first
    const topSelling = await Product.find({
      isActive: true,
      isTopSelling: true,
      isOutOfStock: false,
    })
      .populate("brand", "name")
      .populate("categories", "name")
      .populate({
        path: "variants",
        match: { isActive: true, isOutOfStock: false },
      })
      .sort({ createdAt: -1 })
      .limit(Math.ceil(limit / 2))
      .lean();

    // Get new arrivals to fill remaining slots
    const remainingLimit = limit - topSelling.length;
    const newArrivals =
      remainingLimit > 0
        ? await Product.find({
            isActive: true,
            isNewArrival: true,
            isOutOfStock: false,
            _id: { $nin: topSelling.map((p) => p._id) }, // Exclude already selected products
          })
            .populate("brand", "name")
            .populate("categories", "name")
            .populate({
              path: "variants",
              match: { isActive: true, isOutOfStock: false },
            })
            .sort({ createdAt: -1 })
            .limit(remainingLimit)
            .lean()
        : [];

    // Combine and format products
    const allProducts = [...topSelling, ...newArrivals];

    return allProducts.map((product) => ({
      id: String(product._id),
      slug: product.slug,
      title: product.name,
      price: product?.variants?.[0]?.price ?? product?.price ?? 0,
      images: product.images,
      image:
        product.images && product.images.length > 0
          ? product.images[0]
          : undefined,
      brand: product.brand?.name || "Dehli Mirch",
      rating: product.ratingAvg || 0,
      reviewCount: product.reviewCount || 0,
      category: product.categories?.[0]?.name || "spices",
      isTopSelling: product.isTopSelling,
      isNewArrival: product.isNewArrival,
    }));
  } catch (error) {
    console.error("Error fetching trending products:", error);
    return [];
  }
}

// FAQ data functions
export async function getFAQs(category = "all", search = "") {
  try {
    await dbConnect();

    let query: any = { isActive: true };

    if (category && category !== "all") {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const faqs = await FAQ.find(query).sort({ order: 1, createdAt: -1 }).lean();

    return faqs.map((faq) => ({
      id: faq._id,
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      tags: faq.tags,
      helpfulCount: faq.helpfulCount,
    }));
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return [];
  }
}

// Content Page functions
export async function getContentPage(slug: string) {
  try {
    await dbConnect();
    const contentPage = await ContentPage.findOne({
      slug,
      isActive: true,
    }).lean();

    return contentPage;
  } catch (error) {
    console.error("Error fetching content page:", error);
    return null;
  }
}

export async function getAllContentPages() {
  try {
    await dbConnect();
    const contentPages = await ContentPage.find({ isActive: true })
      .sort({ updatedAt: -1 })
      .lean();

    return contentPages;
  } catch (error) {
    console.error("Error fetching content pages:", error);
    return [];
  }
}

// Testimonials (can be moved to a separate model later)
// export function getTestimonials() {
//   return [
//     { author: "Priya S.", quote: "The spices are incredibly fresh and aromatic." },
//     { author: "Rajesh K.", quote: "Best quality spices I've ever used in my cooking." },
//     { author: "Fatima Z.", quote: "Fast delivery and great packaging." },
//   ];
// }
