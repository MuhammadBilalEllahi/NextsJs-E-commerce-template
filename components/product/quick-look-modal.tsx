"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Star, Truck, ShieldCheck, Minus, Plus, X } from "lucide-react";
import { ProductImages } from "@/components/product/product-images";
import { AddToWishlistButton } from "@/components/wishlist/wishlist-button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useCart } from "@/lib/providers/cartContext";
import type { Product } from "@/mock_data/mock-data";
import { formatCurrency } from "@/lib/constants/currency";

interface QuickLookModalProps {
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
    ingredients?: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export function QuickLookModal({
  product,
  isOpen,
  onClose,
}: QuickLookModalProps) {
  const [selectedVariant, setSelectedVariant] = useState<{
    _id: string;
    label: string;
    price: number;
    stock: number;
    isActive: boolean;
    isOutOfStock: boolean;
    images: string[];
  } | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isInitialized, setIsInitialized] = useState(false);
  const { add, isAdding } = useCart();

  // Set default variant if available
  useEffect(() => {
    if (product.variants && product.variants.length > 0) {
      const defaultVariant =
        product.variants.find((v) => v.isActive && !v.isOutOfStock) ||
        product.variants[0];
      if (defaultVariant) {
        setSelectedVariant({
          _id: defaultVariant._id,
          label: defaultVariant.label,
          price: defaultVariant.price || 0,
          stock: defaultVariant.stock || 0,
          isActive: defaultVariant.isActive || false,
          isOutOfStock: defaultVariant.isOutOfStock || false,
          images: defaultVariant.images || [],
        });
      }
    }
    setIsInitialized(true);
  }, [product.variants]);

  // Reset quantity when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
    }
  }, [isOpen]);

  // Get current price, stock, and images based on selected variant or product
  const currentPrice = selectedVariant?.price || product.price;
  const currentStock = selectedVariant?.stock || product.stock || 0;
  const currentImages =
    selectedVariant?.images && selectedVariant.images.length > 0
      ? selectedVariant.images
      : product.images;
  const hasVariants = product.variants && product.variants.length > 0;

  // Create mapping between images and variant labels
  const getVariantLabelsForImages = () => {
    const variantLabels: Array<{ imageIndex: number; label: string }> = [];

    if (selectedVariant?.images && selectedVariant.images.length > 0) {
      selectedVariant.images.forEach((_, index) => {
        variantLabels.push({
          imageIndex: index,
          label: selectedVariant.label,
        });
      });
    } else if (product.variants && product.variants.length > 0) {
      let imageIndex = 0;
      product.variants.forEach((variant) => {
        if (variant.images && variant.images.length > 0) {
          variant.images.forEach(() => {
            variantLabels.push({
              imageIndex: imageIndex,
              label: variant.label,
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
    if (variant.isOutOfStock || variant.stock <= 0) {
      return;
    }
    setSelectedVariant(variant);
    setQuantity(1);
  };

  // Handle quantity changes with stock validation
  const handleQuantityChange = (newQuantity: number) => {
    const maxQuantity = hasVariants
      ? selectedVariant?.stock || 0
      : product.stock || 0;
    const validQuantity = Math.max(1, Math.min(newQuantity, maxQuantity));
    setQuantity(validQuantity);
  };

  const handleAddToCart = () => {
    if (isAdding) return;

    if (hasVariants && !selectedVariant) return;

    if (hasVariants && selectedVariant) {
      add(
        {
          id: `${String(product.id)}-${selectedVariant._id}`,
          title: `${product.title} - ${selectedVariant.label}`,
          price: selectedVariant.price,
          image:
            (currentImages && currentImages[0]) ||
            (product.images && product.images[0]),
          variantId: selectedVariant._id,
          variantLabel: selectedVariant.label,
          productId: String(product.id),
          slug: product.slug,
          sku: selectedVariant.label,
        },
        quantity
      );
    } else {
      add(
        {
          id: String(product.id),
          title: product.title,
          price: product.price,
          image: product.images?.[0] || product.image || "/placeholder.svg",
          productId: String(product.id),
          slug: product.slug,
        },
        quantity
      );
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    onClose();
    window.location.href = "/checkout";
  };

  const subtotal = currentPrice * quantity;
  const isOutOfStock = currentStock <= 0;
  const isVariantRequired = hasVariants && !selectedVariant;

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-neutral-950 rounded-lg shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex flex-end items-end justify-end p-1 border-b">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="px-3 py-2">
            <div className="grid lg:grid-cols-2 gap-2">
              {/* Product Images */}
              <div>
                <ProductImages
                  images={currentImages}
                  title={product.title}
                  variantLabels={variantLabels}
                />
              </div>

              {/* Product Details */}
              <div className="">
                <div className="flex items-start justify-between gap-3">
                  <h1 className="text-xl font-bold line-clamp-2">
                    {product.title}
                  </h1>
                  <AddToWishlistButton
                    productId={String(product.id)}
                    variantId={selectedVariant?._id}
                  />
                </div>

                <div className="text-xl font-extrabold text-red-600">
                  {formatCurrency(currentPrice)}
                </div>

                {/* Stock Indicator */}
                <div className="text-sm">
                  {!isOutOfStock ? (
                    <span className="text-green-600">
                      In Stock: {currentStock} available
                    </span>
                  ) : (
                    <span className="text-red-600">Out of Stock</span>
                  )}
                </div>

                {/* Variant Selection */}
                {product.variants && product.variants.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                      Variants
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((variant) => {
                        const isSelected = selectedVariant?._id === variant._id;
                        const isAvailable =
                          variant.isActive &&
                          !variant.isOutOfStock &&
                          variant.stock &&
                          variant.stock > 0;

                        return (
                          <Button
                            key={variant._id}
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleVariantSelect(variant)}
                            disabled={!isAvailable}
                            className={`relative ${
                              !isAvailable ? "opacity-50" : ""
                            }`}
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
                <div>
                  <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                    Quantity
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border rounded-lg">
                      <button
                        onClick={() =>
                          handleQuantityChange(Math.max(1, quantity - 1))
                        }
                        className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-4 py-2 text-lg font-medium">
                        {quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(quantity + 1)}
                        className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        disabled={quantity >= currentStock}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
                      Subtotal:{" "}
                      <span className="font-semibold text-red-600">
                        {formatCurrency(subtotal)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    className="flex-1 bg-neutral-800 hover:bg-neutral-900 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 h-12"
                    onClick={handleAddToCart}
                    disabled={isAdding || isOutOfStock || isVariantRequired}
                  >
                    {isAdding
                      ? "Adding..."
                      : isVariantRequired
                      ? "Select Variant"
                      : isOutOfStock
                      ? "Out of Stock"
                      : "ADD TO CART"}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 h-12"
                    onClick={handleBuyNow}
                    disabled={isAdding || isOutOfStock || isVariantRequired}
                  >
                    {isAdding
                      ? "Processing..."
                      : isVariantRequired
                      ? "Select Variant"
                      : isOutOfStock
                      ? "Out of Stock"
                      : "BUY IT NOW"}
                  </Button>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Truck className="h-4 w-4 text-green-600" /> Fast Delivery
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ShieldCheck className="h-4 w-4 text-orange-500" /> Secure
                    Checkout
                  </div>
                </div>

                {/* Quick Product Details */}
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="product-details">
                    <AccordionTrigger className="text-left text-sm">
                      Product Details
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">
                        {product.description}
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  {product.ingredients && (
                    <AccordionItem value="ingredients">
                      <AccordionTrigger className="text-left text-sm">
                        Ingredients
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-sm text-neutral-700 dark:text-neutral-300">
                          {product.ingredients}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                </Accordion>

                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                  <span className="font-semibold">Refund policy:</span> Items
                  can be returned within 7 days if unopened.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
