import { useState } from "react";

const API_URL_PRODUCT_ADMIN = "/api/admin/product";

export interface Product {
  _id: string;
  name: string;
  description: string;
  ingredients?: string;
  price: number;
  stock: number;
  discount: number;
  brand: { _id: string; name: string };
  categories: { _id: string; name: string }[];
  images: string[];
  variants: any[];
  isActive: boolean;
  isOutOfStock: boolean;
  isFeatured: boolean;
  isTopSelling: boolean;
  isNewArrival: boolean;
  isBestSelling: boolean;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductData {
  name: string;
  description: string;
  ingredients?: string;
  price: number;
  stock: number;
  discount: number;
  brand: string;
  categories: string[];
  images: (string | File)[];
  slug?: string;
  variants: any[];
  isActive: boolean;
  isOutOfStock: boolean;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  _id: string;
  images?: (string | File)[];
}

// Fetch all products
export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const response = await fetch(API_URL_PRODUCT_ADMIN);
    // console.log("[fetchProducts] response:", response);
    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }
    const data = await response.json();
    
    // Add default values for missing fields
    const productsWithDefaults = (data.products || []).map((product: any) => ({
      ...product,
      isOutOfStock: product.isOutOfStock || false,
      isActive: product.isActive || false
    }));
    
    return productsWithDefaults;
  } catch (err: any) {
    console.error("Error fetching products:", err);
    throw new Error(err.message || "Failed to fetch products");
  }
};

// Create a new product
export const createProduct = async (productData: CreateProductData): Promise<Product> => {
  try {
    // console.log("[createProduct] productData:", productData);
    const formData = new FormData();
    if (productData.name) formData.append("name", productData.name);
    if (productData.description) formData.append("description", productData.description);
    if (productData.ingredients) formData.append("ingredients", productData.ingredients);
    if (productData.price) formData.append("price", productData.price.toString());
    if (productData.stock) formData.append("stock", productData.stock.toString());
    if (productData.discount) formData.append("discount", productData.discount.toString());
    if (productData.brand) formData.append("brand", productData.brand);
    if (productData.slug) formData.append("slug", productData.slug);
    // if (productData.categories) formData.append("categories", productData.categories.join(","));
    // if (productData.images) formData.append("images", productData.images.join(","));
    // if (productData.variants) formData.append("variants", productData.variants.join(","));
    if (productData.isActive) formData.append("isActive", productData.isActive.toString());
    if (productData.isOutOfStock) formData.append("isOutOfStock", productData.isOutOfStock.toString());

      if (productData.categories) {// Append each category individually
      productData.categories.forEach(categoryId => {
        formData.append("categories", categoryId)
      })
    }
    if (productData.images) {
      // Append all product images
      productData.images.forEach((file, index) => {
        formData.append("images", file)
      })
    }
          if (productData.variants) {
        // send variants metadata and files
        formData.append("variants", JSON.stringify(productData.variants.map(v => ({
          sku: v.sku, slug: v.slug, label: v.label, price: v.price, stock: v.stock || 0, discount: v.discount || 0
        }))))
        productData.variants.forEach((v, vi) => {
          v.images?.forEach((file: File, i: number) => {
            formData.append(`variantsImages[${vi}][images][${i}]`, file);
          });
        });
      }
    // console.log("[createProduct] formData:", formData);
    
    const response = await fetch(API_URL_PRODUCT_ADMIN, {
      method: "POST",
      // headers: {
      //   "Content-Type": "multipart/form-data",
      // },
      body: formData,
    });
    
    if (!response.ok) {
      console.error("[createProduct] response:", response);
      throw new Error("Failed to create product");
    }
    
    const data = await response.json();
    // console.log("[createProduct] data:", data);
    return data.product;
  } catch (err: any) {
    console.error("Error creating product:", err);
    throw new Error(err.message || "Failed to create product");
  }
};

// Delete a product
export const deleteProduct = async (productId: string): Promise<void> => {
  try {
    // console.log("[deleteProduct] productId:", productId);
    const response = await fetch(`${API_URL_PRODUCT_ADMIN}?id=${productId}`, {
      method: "DELETE",
    });
    
    if (!response.ok) {
      throw new Error("Failed to delete product");
    }
  } catch (err: any) {
    console.error("Error deleting product:", err);
    throw new Error(err.message || "Failed to delete product");
  }
};

// Get a single product by ID
export const fetchProductById = async (productId: string): Promise<Product> => {
  try {
    const response = await fetch(`${API_URL_PRODUCT_ADMIN}?id=${productId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch product");
    }
    
    const data = await response.json();
    return data.product;
  } catch (err: any) {
    console.error("Error fetching product:", err);
    throw new Error(err.message || "Failed to fetch product");
  }
};

// Custom hook for products management
export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchProducts();
      setProducts(data);
    } catch (err: any) {
      console.error("[useProducts] Error loading products:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (productData: CreateProductData) => {
    try {
      const newProduct = await createProduct(productData);
      setProducts((prev: Product[]) => [...prev, newProduct]);
      return newProduct;
    } catch (err: any) {
      console.error("[useProducts] Error adding product:", err);
      setError(err.message);
      throw err;
    }
  };

  const removeProduct = async (productId: string) => {
    try {
      await deleteProduct(productId);
      setProducts((prev: Product[]) => prev.filter((p: Product) => p._id !== productId));
    } catch (err: any) {
      console.error("[useProducts] Error removing product:", err);
      setError(err.message);
      throw err;
    }
  };

  return {
    products,
    loading,
    error,
    loadProducts,
    addProduct,
    removeProduct,
  };
};