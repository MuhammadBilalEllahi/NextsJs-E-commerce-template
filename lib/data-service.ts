import Product from "@/models/Product";
import Category from "@/models/Category";
import Brand from "@/models/Brand";
import Review from "@/models/Review";
import FAQ from "@/models/FAQ";
import dbConnect from "@/lib/mongodb";

// Product data functions
export async function getAllProducts() {
  try {
    await dbConnect();
    const products = await Product.find({ isActive: true })
      .populate("brand", "name")
      .populate("categories", "name")
      .populate("variants")
      .populate("reviews")
      .sort({ createdAt: -1 })
      .lean();
    
    return products.map(product => ({
      id: product._id,
      slug: product.slug,
      title: product.name,
      description: product.description,
      price: product.price,
      images: product.images,
      rating: product.ratingAvg,
      spiceLevel: 3, // Default value, can be added to product model later
      vegetarian: true, // Default value, can be added to product model later
      ingredients: product.ingredients,
      instructions: "", // Can be added to product model later
      category: product.categories?.[0]?.name || "spices",
      brand: product.brand?.name || "Delhi Mirch",
      stock: product.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0,
      tags: [], // Can be added to product model later
      reviews: product.reviews?.map(review => ({
        id: review._id,
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
    const product = await Product.findOne({ slug, isActive: true })
      .populate("brand", "name")
      .populate("categories", "name")
      .populate("variants")
      .populate("reviews")
      .lean();
    
    if (!product) return null;
    
    return {
      id: product._id,
      slug: product.slug,
      title: product.name,
      description: product.description,
      price: product.price,
      images: product.images,
      rating: product.ratingAvg,
      spiceLevel: 3, // Default value
      vegetarian: true, // Default value
      ingredients: product.ingredients,
      instructions: "", // Can be added later
      category: product.categories?.[0]?.name || "spices",
      brand: product.brand?.name || "Delhi Mirch",
      stock: product.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0,
      tags: [], // Can be added later
      reviews: product.reviews?.map(review => ({
        id: review._id,
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
      id: category._id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      parent: category.parent ? {
        id: category.parent._id,
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
      id: brand._id,
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
        id: review._id,
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
export function getTestimonials() {
  return [
    { author: "Priya S.", quote: "The spices are incredibly fresh and aromatic." },
    { author: "Rajesh K.", quote: "Best quality spices I've ever used in my cooking." },
    { author: "Fatima Z.", quote: "Fast delivery and great packaging." },
  ];
}

