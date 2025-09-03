"use server"
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
import { CACHE_EXPIRE_TIME,CACHE_BANNER_KEY, CACHE_BRANCH_KEY, CACHE_GLOBAL_SETTINGS_KEY } from "@/lib/cacheConstants";  
import Branch from "@/models/Branches";
import {  ProductTypeVariant, Variant as VariantType } from "@/mock_data/data";


export async function getAllBranches(){
  try {
    await dbConnect();
    const cachedBranches = await RedisClient.get(CACHE_BRANCH_KEY);
    if(cachedBranches){
      return JSON.parse(cachedBranches);
    }
    const branches = await Branch.find({ isActive: true }).lean();
    if(branches.length > 0){
      await RedisClient.set(CACHE_BRANCH_KEY, JSON.stringify(branches), CACHE_EXPIRE_TIME);
    }
    return branches;
  } catch (error) {
    console.error("Error fetching branches:", error);
    return [];
  }
}

export async function getGlobalSettings(){
  try {
    await dbConnect();
    const cachedSettings = await RedisClient.get(CACHE_GLOBAL_SETTINGS_KEY);
    if(cachedSettings){
      return JSON.parse(cachedSettings);
    }
    const globalSettings = await GlobalSettings.findOne({}).lean();
    if(globalSettings){
      await RedisClient.set(CACHE_GLOBAL_SETTINGS_KEY, JSON.stringify(globalSettings), CACHE_EXPIRE_TIME);
    }
    return globalSettings;
  } catch (error) {
    console.error("Error fetching global settings:", error);
    return null;
  } 
}

export async function getAllBanners(){
  try {
    await dbConnect();
    const cachedBanners = await RedisClient.get(CACHE_BANNER_KEY);
    if(cachedBanners){
      return JSON.parse(cachedBanners);
    }
    const banners = await Banner.find({ isActive: true }).sort({ createdAt: -1 }).lean();
    
    // Filter out expired banners
    const activeBanners = banners.filter(banner => {
      if (banner.expiresAt) {
        const expiryDate = new Date(banner.expiresAt);
        const now = new Date();
        return expiryDate > now;
      }
      return true;
    });
    
    if(activeBanners.length > 0){
      if(await RedisClient.get(CACHE_BANNER_KEY) !== null){
        await RedisClient.del(CACHE_BANNER_KEY);
      }
      await RedisClient.set(CACHE_BANNER_KEY, JSON.stringify(activeBanners), CACHE_EXPIRE_TIME);
    }
    return activeBanners;
  } catch (error) {
    console.error("Error fetching banners:", error);
    return [];
  }
}

// getAllTopSellingProducts
export async function getAllTopSellingProducts() {
  try {
    await dbConnect();
    const products = await Product.find({ isActive: true, isTopSelling: true })
      // .populate("brand", "name")
      // .populate("categories", "name")
      .populate({path:"variants", match: {isActive: true, isOutOfStock: false}})
      .sort({ createdAt: -1 })
      .lean();
      // console.log("products in getAllTopSellingProducts", JSON.stringify(products, null, 2));
    return products.map(product => ({
      id: String(product._id),
      slug: product.slug,
      title: product.name,
      description: product.description,
      price: product?.variants?.[0]?.price ?? product?.price  ?? 0,
      images: product.images,
      image: product.images && product.images.length > 0 ? product.images[0] : undefined,
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
          images: variant.images || []
        })),
      // reviews: product.reviews?.map(review => ({
      //   id: String(review._id),
      //   user: review.user?.name || "Anonymous",
      //   rating: review.rating,
      //   comment: review.comment,
      //   date: review.createdAt
      // })) || []
    }));
  } catch (error) {
    console.error("Error fetching top selling products:", error);
    return [];
  }
}


export async function getAllNewArrivalsProducts() {
  try {
    await dbConnect();
    const products = await Product.find({ isActive: true, isNewArrival: true })
      // .populate("brand", "name")
      // .populate("categories", "name")
      .populate({path:"variants", match: {isActive: true, isOutOfStock: false}})
      .sort({ createdAt: -1 })
      .lean();
      // console.log("products in getAllNewArrivalsProducts", JSON.stringify(products, null, 2));
    return products.map(product => ({
      id: String(product._id),
      slug: product.slug,
      title: product.name,
      description: product.description,
      price: product?.variants?.[0]?.price ?? product?.price  ?? 0,
      images: product.images,
      image: product.images && product.images.length > 0 ? product.images[0] : undefined,
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
          images: variant.images || []
        })),
      // reviews: product.reviews?.map(review => ({
      //   id: String(review._id),
      //   user: review.user?.name || "Anonymous",
      //   rating: review.rating,
      //   comment: review.comment,
      //   date: review.createdAt
      // })) || []
    }));
  } catch (error) {
    console.error("Error fetching top selling products:", error);
    return [];
  }
}
// Product data functions
export async function getAllProducts() {
  try {
    await dbConnect();
    const products = await Product.find({ isActive: true, isOutOfStock: false })
      .populate("brand", "name")
      .populate("categories", "name")
      .populate({path:"variants", match: {isActive: true, isOutOfStock: false}})
      .sort({ createdAt: -1 })
      .lean();

    // console.log("products in getAllProducts", JSON.stringify(products, null, 2));
    
    return products.map(product => ({
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
      stock: product.variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) || 0,
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
          images: variant.images
        })),
      reviews: product.reviews?.map((review: any) => ({
        id: String(review._id),
        user: review.user?.name || "Anonymous",
        rating: review.rating,
        comment: review.comment,
        date: review.createdAt
      })) || []
    }));
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function getProductBySlug(slug: string) {
  try {
    await dbConnect();
    const product  = await Product.findOne({ slug, isActive: true })
      .populate("brand", "name")
      .populate("categories", "name")
      .populate("variants")
      .lean<ProductTypeVariant>(); 
      // .lean();
    
    if (!product) return null;
    
    // Filter and sort variants: available first, then out-of-stock
    const availableVariants: VariantType[]  = (product.variants || []).filter((variant: any) => 
      variant.isActive && !variant.isOutOfStock && variant.stock > 0
    );
    
    const outOfStockVariants: VariantType[]  = (product.variants || []).filter((variant: any) => 
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
      stock: availableVariants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0),
      tags: [], // Can be added later
      variants: sortedVariants.map((variant: any) => ({
        _id: String(variant._id),
        label: variant.label,
        price: variant.price,
        stock: variant.stock,
        isActive: variant.isActive,
        isOutOfStock: variant.isOutOfStock,
        images: variant.images
      })),
      reviews: product.reviews?.map((review: any) => ({
        id: String(review._id),
        user: review.user?.name || "Anonymous",
        rating: review.rating,
        comment: review.comment,
        date: review.createdAt
      })) || []
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
    const categories = await Category.find({ isActive: true })
      .populate("parent", "name")
      .sort({ order: 1, name: 1 })
      .lean();
    
         return categories.map(category => ({
       id: String(category._id),
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
             parent: category.parent ? {
         id: String(category.parent._id),
         name: category.parent.name
       } : null,
      productCount: 0 // Can be populated later if needed
    }));
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
    
         return brands.map(brand => ({
       id: String(brand._id),
      name: brand.name,
      description: brand.description,
      logo: brand.logo
    }));
  } catch (error) {
    console.error("Error fetching brands:", error);
    return [];
  }
}

// Review data functions
export async function getProductReviews(productId: string, limit = 10, page = 1) {
  try {
    await dbConnect();
    const skip = (page - 1) * limit;
    
    const reviews = await Review.find({ 
      product: productId, 
      isActive: true 
    })
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    const total = await Review.countDocuments({ 
      product: productId, 
      isActive: true 
    });
    
           return {
         reviews: reviews.map(review => ({
           id: String(review._id),
        user: review.user?.name || "Anonymous",
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        date: review.createdAt,
        isVerified: review.isVerified,
        helpfulCount: review.helpfulCount
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    return { reviews: [], pagination: { page: 1, limit, total: 0, pages: 0 } };
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
    
    const faqs = await FAQ.find(query)
      .sort({ order: 1, createdAt: -1 })
      .lean();
    
    return faqs.map(faq => ({
      id: faq._id,
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      tags: faq.tags,
      helpfulCount: faq.helpfulCount
    }));
  } catch (error) {
    console.error("Error fetching FAQs:", error);
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

