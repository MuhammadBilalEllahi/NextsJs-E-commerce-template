"use client"

import { createContext, useContext, useEffect, useMemo, useReducer, useState, useCallback } from "react"
import { useAuth } from "./authProvider"
import { getOrCreateGuestId, clearGuestId } from "@/lib/utils/uuid"

export type CartItem = {
  id: string
  title: string
  price: number
  image?: string
  qty: number
  variantId?: string
  variantLabel?: string
  productId: string
  slug: string
  sku?: string
}

type State = {
  items: CartItem[]
  isSyncing: boolean
  lastSynced: string | null
}

const actionTypes = {
  ADD: "ADD",
  REMOVE: "REMOVE",
  UPDATE_QTY: "UPDATE_QTY",
  CLEAR: "CLEAR",
  HYDRATE: "HYDRATE",
  SET_SYNCING: "SET_SYNCING",
  SET_SYNCED: "SET_SYNCED",
} as const

type Action =
  | { type: typeof actionTypes.ADD; payload: { item: Omit<CartItem, "qty">; qty: number } }
  | { type: typeof actionTypes.REMOVE; payload: { id: string } }
  | { type: typeof actionTypes.UPDATE_QTY; payload: { id: string; qty: number } }
  | { type: typeof actionTypes.CLEAR }
  | { type: typeof actionTypes.HYDRATE; payload: CartItem[] }
  | { type: typeof actionTypes.SET_SYNCING; payload: boolean }
  | { type: typeof actionTypes.SET_SYNCED }

const CartCtx = createContext<{
  items: CartItem[]
  add: (item: Omit<CartItem, "qty">, qty?: number) => Promise<void>
  remove: (id: string) => Promise<void>
  updateQty: (id: string, qty: number) => Promise<void>
  clear: () => Promise<void>
  count: number
  subtotal: number
  isAdding: boolean
  isSyncing: boolean
  refreshCart: () => Promise<void>
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
  refreshCart: async () => {},
})

const STORAGE_KEY = "dm-cart"

function normalizeStored(value: any): CartItem[] {
  if (!value) return []
  if (Array.isArray(value)) return value
  if (typeof value === "object" && Array.isArray(value.items)) return value.items
  return []
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case actionTypes.HYDRATE:
      return { ...state, items: action.payload }
    case actionTypes.SET_SYNCING:
      return { ...state, isSyncing: action.payload }
    case actionTypes.SET_SYNCED:
      return { ...state, isSyncing: false, lastSynced: new Date().toISOString() }
    case actionTypes.ADD: {
      const { item, qty = 1 } = action.payload
        // Create unique ID: productId + variantId (if exists)
        const uniqueId = item.variantId ? `${item.productId}-${item.variantId}` : item.productId
        
        // Find existing item using the unique ID
        const existing = state.items.find((i) => {
          const existingUniqueId = i.variantId ? `${i.productId}-${i.variantId}` : i.productId
          return existingUniqueId === uniqueId
        })
        
      if (existing) {
        return {
            ...state,
            items: state.items.map((i) => {
              const existingUniqueId = i.variantId ? `${i.productId}-${i.variantId}` : i.productId
              return existingUniqueId === uniqueId ? { ...i, qty: i.qty + qty } : i
            }),
          }
        }
        return { ...state, items: [...state.items, { ...item, qty }] }
    }
    case actionTypes.REMOVE:
        return { ...state, items: state.items.filter((i) => i.id !== action.payload.id) }
    case actionTypes.UPDATE_QTY:
      return {
          ...state,
        items: state.items.map((i) => (i.id === action.payload.id ? { ...i, qty: Math.max(1, action.payload.qty) } : i)),
      }
    case actionTypes.CLEAR:
        return { ...state, items: [] }
    default:
      return state
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [], isSyncing: false, lastSynced: null })
  const [isHydrated, setIsHydrated] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()

  // Get cart identifier (userId or guest UUID)
  const getCartIdentifier = useCallback(() => {
    // Wait for auth to be fully determined
    if (authLoading) {
      return { userId: null, sessionId: null }
    }
    
    if (isAuthenticated && user) {
      return { userId: user.id, sessionId: null }
    } else {
      const guestId = getOrCreateGuestId()
      return { userId: null, sessionId: guestId }
    }
  }, [isAuthenticated, user, authLoading])

  // Sync cart with backend
  const syncCartWithBackend = useCallback(async (items: CartItem[], operation: 'add' | 'update' | 'remove' | 'clear') => {
    const { userId, sessionId } = getCartIdentifier()
    
    // Don't sync if auth is still loading or if we don't have an identifier
    if (authLoading || (!userId && !sessionId)) {
      return
    }
    
    try {
      dispatch({ type: actionTypes.SET_SYNCING, payload: true })
      const params = new URLSearchParams()
      if (userId) params.append("userId", userId)
      if (sessionId) params.append("sessionId", sessionId)
      const response = await fetch(`/api/cart?${params.toString()}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(item => ({
            productId: item.productId,
            variantId: item.variantId || null,
            quantity: item.qty,
            priceSnapshot: item.price,
            label: item.variantLabel || null,
            slug: item.slug,
            sku: item.sku || null,
            title: item.title,
            image: item.image
          })),
          userId,
          sessionId
        }) as any,
      })

      if (!response.ok) {
        throw new Error("Failed to sync cart with backend")
      }

      dispatch({ type: actionTypes.SET_SYNCED })
    } catch (error) {
      console.error("Cart sync failed:", error)
      // Revert optimistic update on failure
      await refreshCart()
    }
  }, [getCartIdentifier, authLoading])

  // Refresh cart from backend
  const refreshCart = useCallback(async () => {
    const { userId, sessionId } = getCartIdentifier()
    
    // Don't refresh if auth is still loading or if we don't have an identifier
    if (authLoading || (!userId && !sessionId)) {
      return
    }
    
    try {
      const params = new URLSearchParams()
      if (userId) params.append("userId", userId)
      if (sessionId) params.append("sessionId", sessionId)
      
      const response = await fetch(`/api/cart?${params.toString()}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.cart && data.cart.items) {
          const items = data.cart.items.map((item: any) => ({
            id: item.variantId ? `${item.productId}-${item.variantId}` : item.productId,
            title: item.title || "Product",
            price: item.priceSnapshot,
            image: item.image,
            qty: item.quantity,
            variantId: item.variantId,
            variantLabel: item.label,
            productId: item.productId,
            slug: item.slug,
            sku: item.sku
          }))
          dispatch({ type: actionTypes.HYDRATE, payload: items })
        }
      }
    } catch (error) {
      console.error("Failed to refresh cart:", error)
    }
  }, [getCartIdentifier, authLoading])

  // Hydrate cart on mount and when auth state changes
  useEffect(() => {
    if (isHydrated && !authLoading) {
      refreshCart()
    }
  }, [isAuthenticated, user, isHydrated, authLoading, refreshCart])

  // Initial hydration from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const parsed = raw ? JSON.parse(raw) : null
      const items = normalizeStored(parsed)
      dispatch({ type: actionTypes.HYDRATE, payload: items })
      setIsHydrated(true)
    } catch (error) {
      console.error("Error hydrating cart:", error)
      dispatch({ type: actionTypes.HYDRATE, payload: [] })
      setIsHydrated(true)
    }
  }, [])

  // Persist to localStorage
  useEffect(() => {
    if (!isHydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items))
    } catch (error) {
      console.error("Error persisting cart:", error)
    }
  }, [state.items, isHydrated])

  // Sync with backend when items change
  useEffect(() => {
    if (!isHydrated || state.items.length === 0) return
    
    const timeoutId = setTimeout(() => {
      syncCartWithBackend(state.items, 'update')
    }, 1000) // Debounce sync

    return () => clearTimeout(timeoutId)
  }, [state.items, isHydrated, syncCartWithBackend])

  const add = async (item: Omit<CartItem, "qty">, qty = 1) => {
    if (isAdding) return
    
    setIsAdding(true)
    
    // Optimistic update
    dispatch({ type: actionTypes.ADD, payload: { item, qty } })
    
    // Sync with backend
    try {
      await syncCartWithBackend([...state.items, { ...item, qty }], 'add')
    } catch (error) {
      console.error("Failed to add item to backend:", error)
    } finally {
      setIsAdding(false)
    }
  }
  
  const remove = async (id: string) => {
    const newItems = state.items.filter(i => i.id !== id)
    
    // Optimistic update
    dispatch({ type: actionTypes.REMOVE, payload: { id } })
    
    // Sync with backend
    try {
      await syncCartWithBackend(newItems, 'remove')
    } catch (error) {
      console.error("Failed to remove item from backend:", error)
    }
  }
  
  const updateQty = async (id: string, qty: number) => {
    const newItems = state.items.map(i => i.id === id ? { ...i, qty: Math.max(1, qty) } : i)
    
    // Optimistic update
    dispatch({ type: actionTypes.UPDATE_QTY, payload: { id, qty } })
    
    // Sync with backend
    try {
      await syncCartWithBackend(newItems, 'update')
    } catch (error) {
      console.error("Failed to update item quantity in backend:", error)
    }
  }
  
  const clear = async () => {
    // Optimistic update
    dispatch({ type: actionTypes.CLEAR })
    
    // Sync with backend
    try {
      await syncCartWithBackend([], 'clear')
    } catch (error) {
      console.error("Failed to clear cart from backend:", error)
    }
  }

  const { count, subtotal } = useMemo(() => {
    const items = Array.isArray(state.items) ? state.items : []
    const c = items.reduce((sum, i) => sum + i.qty, 0)
    const s = items.reduce((sum, i) => sum + i.qty * i.price, 0)
    return { count: c, subtotal: s }
  }, [state.items])

  return (
    <CartCtx.Provider value={{ items: state.items, add, remove, updateQty, clear, count, subtotal, isAdding, isSyncing: state.isSyncing, refreshCart }}>
      {children}
    </CartCtx.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartCtx)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}
