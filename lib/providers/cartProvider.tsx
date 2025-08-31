"use client"

import { createContext, useContext, useEffect, useMemo, useReducer, useState } from "react"

export type CartItem = {
  id: string
  title: string
  price: number
  image?: string
  qty: number
  variantId?: string // Add variant ID to distinguish between variants
  variantLabel?: string // Add variant label for display
  productId: string // Keep original product ID for reference
}

type State = {
  items: CartItem[]
}

const actionTypes = {
  ADD: "ADD",
  REMOVE: "REMOVE",
  UPDATE_QTY: "UPDATE_QTY",
  CLEAR: "CLEAR",
  HYDRATE: "HYDRATE",
} as const

type Action =
  | { type: typeof actionTypes.ADD; payload: { item: Omit<CartItem, "qty">; qty: number } }
  | { type: typeof actionTypes.REMOVE; payload: { id: string } }
  | { type: typeof actionTypes.UPDATE_QTY; payload: { id: string; qty: number } }
  | { type: typeof actionTypes.CLEAR }
  | { type: typeof actionTypes.HYDRATE; payload: State }

const CartCtx = createContext<{
  items: CartItem[]
  add: (item: Omit<CartItem, "qty">, qty?: number) => void
  remove: (id: string) => void
  updateQty: (id: string, qty: number) => void
  clear: () => void
  count: number
  subtotal: number
  isAdding: boolean
}>({
  items: [],
  add: () => {},
  remove: () => {},
  updateQty: () => {},
  clear: () => {},
  count: 0,
  subtotal: 0,
  isAdding: false,
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
      return action.payload
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
          items: state.items.map((i) => {
            const existingUniqueId = i.variantId ? `${i.productId}-${i.variantId}` : i.productId
            return existingUniqueId === uniqueId ? { ...i, qty: i.qty + qty } : i
          }),
        }
      }
      return { items: [...state.items, { ...item, qty }] }
    }
    case actionTypes.REMOVE:
      return { items: state.items.filter((i) => i.id !== action.payload.id) }
    case actionTypes.UPDATE_QTY:
      return {
        items: state.items.map((i) => (i.id === action.payload.id ? { ...i, qty: Math.max(1, action.payload.qty) } : i)),
      }
    case actionTypes.CLEAR:
      return { items: [] }
    default:
      return state
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] })
  const [isHydrated, setIsHydrated] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  // hydrate
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const parsed = raw ? JSON.parse(raw) : null
      const items = normalizeStored(parsed)
      console.log("items", items)
      dispatch({ type: actionTypes.HYDRATE, payload: { items } })
      setIsHydrated(true)
    } catch (error) {
      console.error("Error hydrating cart:", error)
      dispatch({ type: actionTypes.HYDRATE, payload: { items: [] } })
      setIsHydrated(true)
    }
  }, [])

  // persist
  useEffect(() => {
    if (!isHydrated) return // Don't persist until hydration is complete
    try {
      const items = Array.isArray(state.items) ? state.items : []
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch (error) {
      console.error("Error persisting cart:", error)
    }
  }, [state.items, isHydrated])

  const add = (item: Omit<CartItem, "qty">, qty = 1) => {
    if (isAdding) return // Prevent duplicate additions
    setIsAdding(true)
    dispatch({ type: actionTypes.ADD, payload: { item, qty } })
    // Reset the flag after a short delay to prevent rapid clicks
    setTimeout(() => setIsAdding(false), 500)
  }
  
  const remove = (id: string) => dispatch({ type: actionTypes.REMOVE, payload: { id } })
  const updateQty = (id: string, qty: number) => dispatch({ type: actionTypes.UPDATE_QTY, payload: { id, qty } })
  const clear = () => dispatch({ type: actionTypes.CLEAR })

  const { count, subtotal } = useMemo(() => {
    const items = Array.isArray(state.items) ? state.items : []
    const c = items.reduce((sum, i) => sum + i.qty, 0)
    const s = items.reduce((sum, i) => sum + i.qty * i.price, 0)
    return { count: c, subtotal: s }
  }, [state.items])

  return (
    <CartCtx.Provider value={{ items: state.items, add, remove, updateQty, clear, count, subtotal, isAdding }}>
      {children}
    </CartCtx.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartCtx)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}
