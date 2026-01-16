"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./authProvider";
import { getOrCreateGuestId } from "@/lib/utils/uuid";



import { WishlistItem, WishlistProviderItem } from "@/types/types";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "@/lib/api/wishlist";
import { WISHLIST_STORAGE_KEY } from "../cacheConstants";

type WishlistCtx = {
  ids: Set<string>;
  items: WishlistProviderItem[];
  has: (id: string) => boolean;
  toggle: (id: string, variantId?: string) => Promise<void>;
  clear: () => Promise<void>;
  isLoading: boolean;
  syncWithDatabase: () => Promise<void>;
};

const Ctx = createContext<WishlistCtx | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [items, setItems] = useState<WishlistProviderItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();

  // Load wishlist from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
      const storedItems = raw
        ? (JSON.parse(raw) as WishlistProviderItem[])
        : [];
      setItems(storedItems);
      setIds(new Set(storedItems.map((item) => item.productId)));
    } catch {
      setItems([]);
      setIds(new Set());
    }
  }, []);

  // Sync with database when user authenticates
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      syncWithDatabase();
    }
  }, [isAuthenticated, user?.id]);

  // Save to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  const syncWithDatabase = async () => {
    if (!isAuthenticated || !user?.id) return;

    setIsLoading(true);
    try {
      const data = await getWishlist();
      if (data.success) {
        const dbItems: WishlistProviderItem[] = data.wishlist.map(
          (item: any) => ({
            productId: item.productId,
            variantId: item.variantId,
            addedAt: item.addedAt,
          })
        );

        setItems(dbItems);
        setIds(new Set(dbItems.map((item) => item.productId)));
      }
    } catch (error) {
      console.error("Error syncing wishlist with database:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggle = async (productId: string, variantId?: string) => {
    setIsLoading(true);
    try {
      if (isAuthenticated && user?.id) {
        // For authenticated users, sync with database
        if (ids.has(productId)) {
          await removeFromWishlist(productId);
          setItems((prev) =>
            prev.filter((item) => item.productId !== productId)
          );
          setIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(productId);
            return newSet;
          });
        } else {
          await addToWishlist(productId, variantId);
          const newItem: WishlistProviderItem = {
            productId,
            variantId,
            addedAt: new Date().toISOString(),
          };
          setItems((prev) => [...prev, newItem]);
          setIds((prev) => new Set([...prev, productId]));
        }
      } else {
        // For guest users, sync with database using session ID
        const guestSessionId = getOrCreateGuestId();

        if (ids.has(productId)) {
          await removeFromWishlist(productId, guestSessionId);
          setItems((prev) =>
            prev.filter((item) => item.productId !== productId)
          );
          setIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(productId);
            return newSet;
          });
        } else {
          await addToWishlist(productId, variantId, guestSessionId);
          const newItem: WishlistProviderItem = {
            productId,
            variantId,
            addedAt: new Date().toISOString(),
          };
          setItems((prev) => [...prev, newItem]);
          setIds((prev) => new Set([...prev, productId]));
        }
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const clear = async () => {
    setIsLoading(true);
    try {
      if (isAuthenticated && user?.id) {
        // For authenticated users, clear from database
        for (const item of items) await removeFromWishlist(item.productId);
        setItems([]);
        setIds(new Set());
      } else {
        // For guest users, clear from database using session ID
        const guestSessionId = getOrCreateGuestId();
        for (const item of items)
          await removeFromWishlist(item.productId, guestSessionId);
        setItems([]);
        setIds(new Set());
      }
    } catch (error) {
      console.error("Error clearing wishlist:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = useMemo<WishlistCtx>(
    () => ({
      ids,
      items,
      has: (id: string) => ids.has(id),
      toggle,
      clear,
      isLoading,
      syncWithDatabase,
    }),
    [ids, items, isLoading, isAuthenticated, user?.id]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWishlist() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
