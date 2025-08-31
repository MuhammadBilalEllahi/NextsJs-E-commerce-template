"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Star, Truck, ShieldCheck, Share2, SendHorizontal, Facebook, Twitter, ChevronDown, Minus, Plus } from 'lucide-react'
import Link from "next/link"
import { ProductImages } from "@/components/product/product-images"
import { AddToWishlistButton } from "@/components/wishlist/wishlist-button"
import { ReviewsEnhanced } from "@/components/reviews/reviews-enhanced2"
import { FAQEnhanced } from "@/components/faq/faq-enhanced"
import { YouMayAlsoLike } from "@/components/product/you-may-also-like"
import { RecentlyViewed } from "@/components/product/recently-viewed"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useCart } from "@/lib/providers/cartProvider"
import type { Product } from "@/mock_data/data"
import { formatCurrency } from "@/lib/constants/currency"

interface ProductDetailClientProps {
  product: Product & {
    variants?: Array<{
      _id: string;
      label: string;
      price: number;
      stock: number;
      isActive: boolean;
      isOutOfStock: boolean;
      images: string[];
    }>;
  }
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [selectedVariant, setSelectedVariant] = useState<{
    _id: string;
    label: string;
    price: number;
    stock: number;
    isActive: boolean;
    isOutOfStock: boolean;
    images: string[];
  } | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isInitialized, setIsInitialized] = useState(false)
  const { add, isAdding } = useCart()

  // Set default variant if available
  React.useEffect(() => {
    if (product.variants && product.variants.length > 0) {
      const defaultVariant = product.variants.find(v => v.isActive && !v.isOutOfStock) || product.variants[0];
      setSelectedVariant(defaultVariant);
    }
    setIsInitialized(true);
  }, [product.variants]);

  // Get current price, stock, and images based on selected variant or product
  const currentPrice = selectedVariant?.price || product.price;
  const currentStock = selectedVariant?.stock || product.stock || 0;
  const currentImages = selectedVariant?.images && selectedVariant.images.length > 0 ? selectedVariant.images : product.images;
  const hasVariants = product.variants && product.variants.length > 0;

  // Create mapping between images and variant labels
  const getVariantLabelsForImages = () => {
    const variantLabels: Array<{ imageIndex: number; label: string }> = [];

    if (selectedVariant?.images && selectedVariant.images.length > 0) {
      // If showing variant images, all images are from the selected variant
      selectedVariant.images.forEach((_, index) => {
        variantLabels.push({
          imageIndex: index,
          label: selectedVariant.label
        });
      });
    } else if (product.variants && product.variants.length > 0) {
      // If showing product images, check which images belong to which variants
      let imageIndex = 0;
      product.variants.forEach(variant => {
        if (variant.images && variant.images.length > 0) {
          variant.images.forEach(() => {
            variantLabels.push({
              imageIndex: imageIndex,
              label: variant.label
            });
            imageIndex++;
          });
        }
      });
    }

    return variantLabels;
  };

  const variantLabels = getVariantLabelsForImages();

  // Handle variant selection with validation
  const handleVariantSelect = (variant: any) => {
    // Don't allow selection of out-of-stock variants
    if (variant.isOutOfStock || variant.stock <= 0) {
      return;
    }
    setSelectedVariant(variant);
    // Reset quantity to 1 when changing variants
    setQuantity(1);
  };

  // Handle quantity changes with stock validation
  const handleQuantityChange = (newQuantity: number) => {
    const maxQuantity = hasVariants ? (selectedVariant?.stock || 0) : (product.stock || 0);
    const validQuantity = Math.max(1, Math.min(newQuantity, maxQuantity));
    setQuantity(validQuantity);
  };

  // Ensure we have valid data
  if (!product || !product.id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          Product not found or invalid data
        </div>
      </div>
    );
  }


  // console.log("product in ProductDetailClient", product);

  // Don't render until component is initialized
  if (!isInitialized) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="h-96 bg-neutral-200 animate-pulse rounded-lg"></div>
          <div className="space-y-4">
            <div className="h-8 bg-neutral-200 animate-pulse rounded"></div>
            <div className="h-6 bg-neutral-200 animate-pulse rounded"></div>
            <div className="h-12 bg-neutral-200 animate-pulse rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (isAdding) return;
    
    // For products with variants, require variant selection
    if (hasVariants && !selectedVariant) return;
    
    // For products with variants, use variant data
    if (hasVariants && selectedVariant) {
      add(
        {
          id: `${String(product.id)}-${selectedVariant._id}`, // Create unique ID for variant
          title: `${product.title} - ${selectedVariant.label}`,
          price: selectedVariant.price,
          image: currentImages[0] || product.images[0],
          variantId: selectedVariant._id,
          variantLabel: selectedVariant.label,
          productId: String(product.id),
        },
        quantity
      );
    } else {
      // For products without variants, use product data
      add(
        {
          id: String(product.id),
          title: product.title,
          price: product.price,
          image: product.images[0],
          productId: String(product.id),
        },
        quantity
      );
    }
  }

  const handleBuyNow = () => {
    handleAddToCart()
    // Redirect to checkout
    window.location.href = "/checkout"
  }

  const subtotal = currentPrice * quantity
  const isOutOfStock = currentStock <= 0;
  const isVariantRequired = hasVariants && !selectedVariant;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-2 gap-8">
        <ProductImages images={currentImages} title={product.title} variantLabels={variantLabels} />
        <div>
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl md:text-3xl font-bold">{product.title}</h1>
            <AddToWishlistButton productId={String(product.id)} />
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
            <div className="inline-flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>{product.rating.toFixed(1)}</span>
              <span className="opacity-70">({product.reviews.length})</span>
            </div>

          </div>

          <div className="mt-4 text-3xl font-extrabold text-red-600">
            {formatCurrency(currentPrice)}
            {selectedVariant && selectedVariant.price !== product.price && (
              <span className="text-lg text-neutral-500 line-through ml-2">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>

          {/* Stock Indicator */}
          <div className="mt-2 text-sm">
            {!isOutOfStock ? (
              <span className="text-green-600">
                In Stock: {currentStock} available
              </span>
            ) : (
              <span className="text-red-600">
                Out of Stock
              </span>
            )}
          </div>

          {/* Variant Price Info */}
          {selectedVariant && selectedVariant.price !== product.price && (
            <div className="mt-2 text-sm text-neutral-600">
              <span className="font-medium">{selectedVariant.label}:</span> {formatCurrency(selectedVariant.price)}
            </div>
          )}

          {/* Variant Selection */}
          {product.variants && product.variants.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Variants</h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => {
                  const isSelected = selectedVariant?._id === variant._id;
                  const isAvailable = variant.isActive && !variant.isOutOfStock && variant.stock > 0;

                  return (
                    <Button
                      key={variant._id}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleVariantSelect(variant)}
                      disabled={!isAvailable}
                      className={`relative ${!isAvailable ? 'opacity-50' : ''}`}
                    >
                      {variant.label}
                      {!isAvailable && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-0.5 bg-red-500 transform rotate-45"></div>
                        </div>
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Quantity</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => handleQuantityChange(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 py-2 text-lg font-medium">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  disabled={quantity >= currentStock}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                Subtotal: <span className="font-semibold text-red-600">{formatCurrency(subtotal)}</span>
              </div>
            </div>
            {currentStock > 0 && (
              <p className="text-xs text-neutral-500 mt-1">
                Maximum quantity: {currentStock}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3">
            <Button
              className="flex-1 bg-neutral-800 hover:bg-neutral-900 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 h-12"
              onClick={handleAddToCart}
              disabled={isAdding || isOutOfStock || isVariantRequired}
            >
              {isAdding ? "Adding..." :
                isVariantRequired ? "Select Variant" :
                  isOutOfStock ? "Out of Stock" :
                    "ADD TO CART"}
            </Button>
            <Button
              variant="outline"
              className="flex-1 h-12"
              onClick={handleBuyNow}
              disabled={isAdding || isOutOfStock || isVariantRequired}
            >
              {isAdding ? "Processing..." :
                isVariantRequired ? "Select Variant" :
                  isOutOfStock ? "Out of Stock" :
                    "BUY IT NOW"}
            </Button>
          </div>

          <Separator className="my-6" />

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Truck className="h-4 w-4 text-green-600" /> Fast Delivery
            </div>
            <div className="flex items-center gap-2 text-sm">
              <ShieldCheck className="h-4 w-4 text-orange-500" /> Secure Checkout
            </div>
          </div>

          {/* Accordion Sections */}
          <div className="mt-8">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="product-details">
                <AccordionTrigger className="text-left">
                  Product Details
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    {product.description}
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="ingredients">
                <AccordionTrigger className="text-left">
                  Ingredients
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    {product.ingredients}
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faqs">
                <AccordionTrigger className="text-left">
                  FAQs
                </AccordionTrigger>
                <AccordionContent>
                  <div className="max-h-96 overflow-y-auto">
                    <FAQEnhanced category="products" />
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="customer-reviews">
                <AccordionTrigger className="text-left">
                  Customer Reviews
                </AccordionTrigger>
                <AccordionContent>
                  <ReviewsEnhanced
                    productId={String(product.id)}
                    initialReviews={product.reviews.map(review => ({
                      id: String(review.id),
                      user: review.user,
                      rating: review.rating,
                      title: "",
                      comment: review.comment,
                      date: review.date
                    }))}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="quality-promise">
                <AccordionTrigger className="text-left">
                  Our Quality Promise
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <span>Premium quality ingredients sourced from trusted farms</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <span>No artificial preservatives or additives</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <span>Traditional recipes passed down through generations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <span>100% satisfaction guarantee</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="gap-2"
            >
              <Share2 className="h-4 w-4" /> Share
            </Button>
            <a
              className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                product.title
              )}&url=${encodeURIComponent(
                typeof window !== "undefined" ? window.location.href : ""
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Twitter className="h-4 w-4" /> Tweet
            </a>
            <a
              className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                typeof window !== "undefined" ? window.location.href : ""
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Facebook className="h-4 w-4" /> Share
            </a>
            <a
              className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
              href={`https://wa.me/?text=${encodeURIComponent(
                `${product.title} - ${typeof window !== "undefined" ? window.location.href : ""
                }`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <SendHorizontal className="h-4 w-4" /> WhatsApp
            </a>
          </div>

          <div className="mt-6 text-sm text-neutral-600 dark:text-neutral-400">
            <span className="font-semibold">Refund policy:</span>{" "}
            Items can be returned within 7 days if unopened.{" "}
            <Link href="/returns" className="text-green-700 underline">
              Read full policy
            </Link>
          </div>
        </div>
      </div>

      <section className="mt-12">
        <YouMayAlsoLike currentId={String(product.id)} />
      </section>

      <RecentlyViewed currentId={String(product.id)} />
    </div>
  )
}
