"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  useCallback,
} from "react";
import { useAuth } from "./authProvider";
import { getOrCreateGuestId, clearGuestId } from "@/lib/utils/uuid";
import { CartItem } from "@/types";

type State = {
  items: CartItem[];
  isSyncing: boolean;
  lastSynced: string | null;
};

export const CartActionTypes = {
  ADD: "ADD",
  REMOVE: "REMOVE",
  UPDATE_QTY: "UPDATE_QTY",
  CLEAR: "CLEAR",
  HYDRATE: "HYDRATE",
  SET_SYNCING: "SET_SYNCING",
  SET_SYNCED: "SET_SYNCED",
} as const;

type Action =
  | {
      type: typeof CartActionTypes.ADD;
      payload: { item: Omit<CartItem, "qty">; qty: number };
    }
  | { type: typeof CartActionTypes.REMOVE; payload: { id: string } }
  | {
      type: typeof CartActionTypes.UPDATE_QTY;
      payload: { id: string; qty: number };
    }
  | { type: typeof CartActionTypes.CLEAR }
  | { type: typeof CartActionTypes.HYDRATE; payload: CartItem[] }
  | { type: typeof CartActionTypes.SET_SYNCING; payload: boolean }
  | { type: typeof CartActionTypes.SET_SYNCED };

const CartCtx = createContext<{
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">, qty?: number) => Promise<void>;
  remove: (id: string) => Promise<void>;
  updateQty: (id: string, qty: number) => Promise<void>;
  clear: () => Promise<void>;
  count: number;
  subtotal: number;
  isAdding: boolean;
  isSyncing: boolean;
  refreshCart: () => Promise<void>;
  isHydrated: boolean;
  syncAll: () => Promise<void>;
  openCartSheet: boolean;
  setOpenCartSheet: React.Dispatch<React.SetStateAction<boolean>>;
}>({
  items: [],
  add: async () => {},
  remove: async () => {},
  updateQty: async () => {},
  clear: async () => {},
  count: 0,
  subtotal: 0,
  isAdding: false,
  isSyncing: false,
  isHydrated: false,
  refreshCart: async () => {},
  syncAll: async () => {},
  openCartSheet: false,
  setOpenCartSheet: () => {},
});

export const CART_STORAGE_KEY = "dm-cart";

function normalizeStored(value: any): CartItem[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "object" && Array.isArray(value.items))
    return value.items;
  return [];
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case CartActionTypes.HYDRATE:
      return { ...state, items: action.payload };
    case CartActionTypes.SET_SYNCING:
      return { ...state, isSyncing: action.payload };
    case CartActionTypes.SET_SYNCED:
      return {
        ...state,
        isSyncing: false,
        lastSynced: new Date().toISOString(),
      };
    // case CartActionTypes.ADD: {
    //   const { item, qty = 1 } = action.payload
    //     // Create unique ID: productId + variantId (if exists)
    //     const uniqueId = item.variantId ? `${item.productId}-${item.variantId}` : item.productId

    //     // Find existing item using the unique ID
    //     const existing = state.items.find((i) => {
    //       const existingUniqueId = i.variantId ? `${i.productId}-${i.variantId}` : i.productId
    //       return existingUniqueId === uniqueId
    //     })

    //   if (existing) {
    //     return {
    //         ...state,
    //         items: state.items.map((i) => {
    //           const existingUniqueId = i.variantId ? `${i.productId}-${i.variantId}` : i.productId
    //           return existingUniqueId === uniqueId ? { ...i, qty: i.qty + qty } : i
    //         }),
    //       }
    //     }
    //     return { ...state, items: [...state.items, { ...item, qty }] }
    // }
    case CartActionTypes.ADD: {
      const { item, qty = 1 } = action.payload;

      // Find existing item using the item's id (which should be properly constructed)
      const existing = state.items.find((i) => i.id === item.id);

      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.id === item.id ? { ...i, qty: i.qty + qty } : i
          ),
        };
      }

      return {
        ...state,
        items: [...state.items, { ...item, qty }],
      };
    }
    case CartActionTypes.REMOVE:
      return {
        ...state,
        items: state.items.filter((i) => i.id !== action.payload.id),
      };
    case CartActionTypes.UPDATE_QTY:
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.payload.id
            ? { ...i, qty: Math.max(1, action.payload.qty) }
            : i
        ),
      };
    case CartActionTypes.CLEAR:
      return { ...state, items: [] };
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    items: [],
    isSyncing: false,
    lastSynced: null,
  });
  const [isHydrated, setIsHydrated] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [openCartSheet, setOpenCartSheet] = useState<boolean>(false);

  // Get cart identifier (userId or guest UUID)
  const getCartIdentifier = useCallback(() => {
    // Wait for auth to be fully determined
    if (authLoading) {
      return { userId: null, sessionId: null };
    }

    if (isAuthenticated && user) {
      return { userId: user.id, sessionId: null };
    } else {
      const guestId = getOrCreateGuestId();
      return { userId: null, sessionId: guestId };
    }
  }, [isAuthenticated, user, authLoading]);

  // Sync cart with backend
  const syncCartWithBackend = useCallback(
    async (
      items: CartItem[],
      operation: "add" | "update" | "remove" | "clear"
    ) => {
      const { userId, sessionId } = getCartIdentifier();

      // Don't sync if auth is still loading or if we don't have an identifier
      if (authLoading || (!userId && !sessionId)) {
        return;
      }

      try {
        dispatch({ type: CartActionTypes.SET_SYNCING, payload: true });
        const params = new URLSearchParams();
        if (userId) params.append("userId", userId);
        if (sessionId) params.append("sessionId", sessionId);
        const response = await fetch(`/api/cart?${params.toString()}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: items.map((item) => {
              const mappedItem = {
                productId: item.productId,
                variantId: item.variantId || null,
                quantity: item.qty,
                priceSnapshot: item.price,
                label: item.variantLabel || null,
                slug: item.slug,
                sku: item.sku || null,
                name: item.name,
                image: item.image,
              };
              return mappedItem;
            }),
            userId,
            sessionId,
          }) as any,
        });

        if (!response.ok) {
          throw new Error("Failed to sync cart with backend");
        }

        dispatch({ type: CartActionTypes.SET_SYNCED });
      } catch (error) {
        console.error("Cart sync failed:", error);
        // Revert optimistic update on failure
        await refreshCart();
      }
    },
    [getCartIdentifier, authLoading]
  );

  const syncAll = async () => {
    try {
      await syncCartWithBackend(state.items, "update");
    } catch (error) {
      console.error("Failed to sync all cart items:", error);
    }
  };

  // Refresh cart from backend
  const refreshCart = useCallback(async () => {
    const { userId, sessionId } = getCartIdentifier();

    // Don't refresh if auth is still loading or if we don't have an identifier
    if (authLoading || (!userId && !sessionId)) {
      return;
    }

    try {
      const params = new URLSearchParams();
      if (userId) params.append("userId", userId);
      if (sessionId) params.append("sessionId", sessionId);

      const response = await fetch(`/api/cart?${params.toString()}`);

      if (response.ok) {
        const data = await response.json();
        if (data.cart && data.cart.items) {
          const items = data.cart.items.map((item: any) => ({
            id: item.variantId
              ? `${item.productId}-${item.variantId}`
              : item.productId,
            name: item.name || "Product",
            price: item.priceSnapshot,
            image: item.image,
            qty: item.quantity,
            variantId: item.variantId,
            variantLabel: item.label,
            productId: item.productId,
            slug: item.slug,
            sku: item.sku,
          }));
          dispatch({ type: CartActionTypes.HYDRATE, payload: items });
        }
      }
    } catch (error) {
      console.error("Failed to refresh cart:", error);
    }
  }, [getCartIdentifier, authLoading]);

  // Hydrate cart on mount and when auth state changes
  // useEffect(() => {
  //   if (isHydrated && !authLoading && user) {
  //     refreshCart()
  //   }
  // }, [isAuthenticated, user, isHydrated, authLoading])

  // Initial hydration from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      const items = normalizeStored(parsed);
      dispatch({ type: CartActionTypes.HYDRATE, payload: items });
      setIsHydrated(true);
    } catch (error) {
      console.error("Error hydrating cart:", error);
      dispatch({ type: CartActionTypes.HYDRATE, payload: [] });
      setIsHydrated(true);
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
    } catch (error) {
      console.error("Error persisting cart:", error);
    }
  }, [state.items, isHydrated]);

  const add = async (item: Omit<CartItem, "qty">, qty = 1) => {
    if (isAdding) return;

    setIsAdding(true);
    try {
      // Create a proper unique ID for the item
      const uniqueId = item.variantId
        ? `${item.productId}-${item.variantId}`
        : item.productId;

      // Create the complete cart item
      const cartItem = { ...item, qty, id: uniqueId };

      // Optimistic update - use a callback to ensure we have the latest state
      dispatch({ type: CartActionTypes.ADD, payload: { item: cartItem, qty } });

      // Delay 0.5s before opening
      setTimeout(() => {
        setOpenCartSheet(true);

        // Auto-close after 2s
        setTimeout(() => {
          setOpenCartSheet(false);
        }, 2000);
      }, 500);
    } catch (error) {
      console.error("Failed to add item:", error);
      // Revert on error by refreshing from source of truth
      await refreshCart();
    } finally {
      setIsAdding(false);
    }
  };
  const remove = async (id: string) => {
    const newItems = state.items.filter((i) => i.id !== id);

    // Optimistic update
    dispatch({ type: CartActionTypes.REMOVE, payload: { id } });

    // Sync with backend
    // try {
    //   await syncCartWithBackend(newItems, 'remove')
    // } catch (error) {
    //   console.error("Failed to remove item from backend:", error)
    // }
  };

  const updateQty = async (id: string, qty: number) => {
    const newItems = state.items.map((i) =>
      i.id === id ? { ...i, qty: Math.max(1, qty) } : i
    );

    // Optimistic update
    dispatch({ type: CartActionTypes.UPDATE_QTY, payload: { id, qty } });

    // Sync with backend
    // try {
    //   await syncCartWithBackend(newItems, 'update')
    // } catch (error) {
    //   console.error("Failed to update item quantity in backend:", error)
    // }
  };

  const clear = async () => {
    // Optimistic update
    dispatch({ type: CartActionTypes.CLEAR });

    // Sync with backend
    try {
      await syncCartWithBackend([], "clear");
    } catch (error) {
      console.error("Failed to clear cart from backend:", error);
    }
  };

  const { count, subtotal } = useMemo(() => {
    const items = Array.isArray(state.items) ? state.items : [];
    const c = items.reduce((sum, i) => sum + i.qty, 0);
    const s = items.reduce((sum, i) => sum + i.qty * i.price, 0);
    return { count: c, subtotal: s };
  }, [state.items, state.lastSynced]);

  return (
    <CartCtx.Provider
      value={{
        openCartSheet,
        setOpenCartSheet,
        items: state.items,
        isHydrated,
        add,
        remove,
        updateQty,
        clear,
        count,
        subtotal,
        isAdding,
        isSyncing: state.isSyncing,
        refreshCart,
        syncAll,
      }}
    >
      {children}
    </CartCtx.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
