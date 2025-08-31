"use client"

import { Slider } from "@/components/ui/slider"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

const brands = ["Dehli Mirch", "Khana Khazana", "Masala Co", "Desi Choice"]
const types = ["Powder", "Whole", "Pickle", "Snack"]

export function FiltersBar() {
  const router = useRouter()
  const sp = useSearchParams()
  const [price, setPrice] = useState<number[]>([0, 50])
  const [brand, setBrand] = useState("")
  const [type, setType] = useState("")
  const [spice, setSpice] = useState("")

  useEffect(() => {
    const pmin = Number(sp.get("pmin") ?? 0)
    const pmax = Number(sp.get("pmax") ?? 50)
    setPrice([pmin, pmax])
    setBrand(String(sp.get("brand") ?? ""))
    setType(String(sp.get("type") ?? ""))
    setSpice(String(sp.get("spice") ?? ""))
  }, [])

  const update = (updates: Record<string, string | number | undefined>) => {
    const q = new URLSearchParams(sp?.toString())
    Object.entries(updates).forEach(([k, v]) => {
      if (v === undefined || v === "" || v === "all") q.delete(k)
      else q.set(k, String(v))
    })
    router.replace(`?${q.toString()}`)
  }

  return (
    <div className="rounded-lg border p-4 mb-6">
      <div className="grid sm:grid-cols-4 gap-4 items-center">
        <div>
          <div className="text-sm font-medium">Price</div>
          <div className="mt-2">
            <Slider
              defaultValue={price}
              min={0}
              max={100}
              step={5}
              onValueCommit={(v) => {
                setPrice(v)
                update({ pmin: v[0], pmax: v[1] })
              }}
            />
            <div className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
              ${price[0]} – ${price[1]}
            </div>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Type</label>
          <select
            className="mt-2 w-full rounded border bg-transparent p-2 text-sm"
            value={type}
            onChange={(e) => {
              setType(e.target.value)
              update({ type: e.target.value })
            }}
          >
            <option value="">All</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Brand</label>
          <select
            className="mt-2 w-full rounded border bg-transparent p-2 text-sm"
            value={brand}
            onChange={(e) => {
              setBrand(e.target.value)
              update({ brand: e.target.value })
            }}
          >
            <option value="">All</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Spice level</label>
          <select
            className="mt-2 w-full rounded border bg-transparent p-2 text-sm"
            value={spice}
            onChange={(e) => {
              setSpice(e.target.value)
              update({ spice: e.target.value })
            }}
          >
            <option value="">All</option>
            {[1, 2, 3, 4, 5].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
