"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"

const STORAGE_KEY = "dm-wishlist"

type WishlistCtx = {
  ids: Set<string>
  has: (id: string) => boolean
  toggle: (id: string) => void
  clear: () => void
}

const Ctx = createContext<WishlistCtx | null>(null)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const arr = raw ? (JSON.parse(raw) as string[]) : []
      setIds(new Set(Array.isArray(arr) ? arr : []))
    } catch {
      setIds(new Set())
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)))
    } catch {
      // ignore
    }
  }, [ids])

  const value = useMemo<WishlistCtx>(
    () => ({
      ids,
      has: (id: string) => ids.has(id),
      toggle: (id: string) =>
        setIds((prev) => {
          const n = new Set(prev)
          if (n.has(id)) n.delete(id)
          else n.add(id)
          return n
        }),
      clear: () => setIds(new Set()),
    }),
    [ids],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useWishlist() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider")
  return ctx
}
