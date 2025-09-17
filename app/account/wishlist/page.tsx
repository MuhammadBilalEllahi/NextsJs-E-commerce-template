"use client";

import { useWishlist } from "@/lib/providers/wishlistProvider";
import { useCart } from "@/lib/providers/cartContext";
import { useAuth } from "@/lib/providers/authProvider";
import { Button } from "@/components/ui/button";
import { Heart, Trash2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { products } from "@/mock_data/mock-data";
import { ProductCard } from "@/components/product/product-card";
import { YouMayAlsoLike } from "@/components/product/you-may-also-like";
import { RecentlyViewed } from "@/components/product/recently-viewed";

type WishlistItem = {
  id: string;
  productId: string;
  productSlug: string;
  productName: string;
  productImage: string;
  productPrice: number;
  variantId?: string;
  variantLabel?: string;
  isOutOfStock: boolean;
  availableStock: number;
  addedAt: string;
};

export default function WishlistPage() {
  const { ids, items, clear, isLoading } = useWishlist();
  const { add, remove, isAdding } = useCart();
  const { isAuthenticated } = useAuth();
  const [wishlistData, setWishlistData] = useState<WishlistItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Fetch wishlist data from database for authenticated users
  useEffect(() => {
    const fetchWishlistData = async () => {
      setIsLoadingData(true);
      try {
        if (isAuthenticated) {
          // Authenticated user - fetch from database
          const response = await fetch("/api/wishlist");
          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              setWishlistData(data.wishlist);
            }
          }
        } else {
          // Guest user - fetch from database using session ID
          const guestSessionId = localStorage.getItem("dm-guest-cart-id");
          if (guestSessionId) {
            const response = await fetch(
              `/api/wishlist?sessionId=${guestSessionId}`
            );
            if (response.ok) {
              const data = await response.json();
              if (data.success) {
                setWishlistData(data.wishlist);
              }
            }
          } else {
            // Fallback to mock data for guests without session
            const wishlistedProducts = products.filter((product) =>
              ids.has(product.id)
            );
            const mockWishlistData: WishlistItem[] = wishlistedProducts.map(
              (product) => ({
                id: product.id,
                productId: product.id,
                productSlug: product.slug,
                productName: product.title,
                productImage: product.image || "/placeholder.svg",
                productPrice: product.price,
                variantId: undefined,
                variantLabel: undefined,
                isOutOfStock: false, // Mock data doesn't have stock info
                availableStock: 10, // Mock stock
                addedAt: new Date().toISOString(),
              })
            );
            setWishlistData(mockWishlistData);
          }
        }
      } catch (error) {
        console.error("Error fetching wishlist data:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchWishlistData();
  }, [isAuthenticated, ids]);

  const handleAddToCart = (item: WishlistItem) => {
    if (isAdding) return;
    add(
      {
        id: item.productId,
        title: item.productName,
        price: item.productPrice,
        image: item.productImage,
        productId: item.productId,
        slug: item.productSlug,
        variantId: item.variantId,
      },
      1
    );
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    // This will be handled by the wishlist provider
    // The UI will update automatically through the provider
  };

  const handleClearAll = async () => {
    await clear();
    setWishlistData([]);
  };

  if (isLoadingData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold mb-4">Loading Wishlist...</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Please wait while we fetch your wishlist items.
          </p>
        </div>
      </div>
    );
  }

  if (wishlistData.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-4">💝</div>
          <h1 className="text-2xl font-bold mb-4">Your Wishlist is Empty</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            Start adding products to your wishlist to save them for later!
          </p>
          <Link href="/shop/all">
            <Button className="bg-green-600 hover:bg-green-700">
              Start Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">My Wishlist</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            {wishlistData.length} {wishlistData.length === 1 ? "item" : "items"}{" "}
            saved
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleClearAll}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Clear All
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlistData.map((item) => {
          // Convert WishlistItem to Product format for ProductCard
          const productForCard = {
            id: item.productId,
            slug: item.productSlug,
            title: item.productName,
            description: "", // WishlistItem doesn't have description
            price: item.productPrice,
            image: item.productImage,
            images: [item.productImage],
            variants: item.variantId
              ? [
                  {
                    _id: item.variantId,
                    label: item.variantLabel || "",
                    price: item.productPrice,
                    stock: item.availableStock,
                    isActive: true,
                    isOutOfStock: item.isOutOfStock,
                    images: [item.productImage],
                  },
                ]
              : [],
            isOutOfStock: item.isOutOfStock,
            stock: item.availableStock,
            rating: 4.5, // Default rating
            brand: "Dehli Mirch",
          };

          return <ProductCard key={item.id} product={productForCard} />;
        })}
      </div>

      <section className="mt-12" id="you-may-also-like">
        <YouMayAlsoLike currentId={String(wishlistData[0].id)} />
      </section>

      <RecentlyViewed currentId={String(wishlistData[0].id)} />
    </div>
  );
}
