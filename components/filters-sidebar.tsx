"use client"

import { useEffect, useMemo, useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import type { Product } from "@/mock_data/mock-data"

const spiceOptions = [
  { key: "mild", label: "Mild (1–2)" },
  { key: "medium", label: "Medium (2–3)" },
  { key: "hot", label: "Hot (3–4)" },
  { key: "extra-hot", label: "Extra Hot (4–5)" },
]

export function FiltersSidebar({
  slug,
  allProducts,
  initial,
  onApply,
}: {
  slug: string
  allProducts: Product[]
  initial: { pmin: number; pmax: number; type: string; brands: string[]; spice: string[] }
  onApply: (entries: Record<string, string | number | undefined | null>) => void
}) {
  const [pmin, setPmin] = useState(initial.pmin)
  const [pmax, setPmax] = useState(initial.pmax)
  const [type, setType] = useState(initial.type)
  const [brands, setBrands] = useState<string[]>(initial.brands || [])
  const [spice, setSpice] = useState<string[]>(initial.spice || [])

  useEffect(() => {
    setPmin(initial.pmin)
    setPmax(initial.pmax)
    setType(initial.type)
    setBrands(initial.brands || [])
    setSpice(initial.spice || [])
  }, [initial.pmin, initial.pmax, initial.type, JSON.stringify(initial.brands), JSON.stringify(initial.spice)])

  const availableTypes = useMemo(() => {
    const set = new Set(allProducts.map((p) => p.type))
    return Array.from(set)
  }, [allProducts])

  const availableBrands = useMemo(() => {
    const set = new Set(allProducts.map((p) => p.brand))
    return Array.from(set)
  }, [allProducts])

  const apply = () => {
    onApply({
      pmin,
      pmax: pmax === 9999 ? undefined : pmax,
      type,
      brands: brands.length ? brands.join(",") : undefined,
      spice: spice.length ? spice.join(",") : undefined,
      page: undefined, // reset pagination
    })
  }

  const reset = () => {
    setPmin(0)
    setPmax(9999)
    setType("")
    setBrands([])
    setSpice([])
    onApply({ pmin: undefined, pmax: undefined, type: undefined, brands: undefined, spice: undefined, page: undefined })
  }

  const toggleBrand = (b: string) => {
    setBrands((prev) => (prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]))
  }

  const toggleSpice = (s: string) => {
    setSpice((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))
  }

  return (
    <div className="rounded-2xl border bg-white dark:bg-neutral-950 p-4 sticky top-4 h-fit">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Filters</h2>
      </div>
      <Accordion type="multiple" defaultValue={["price", "type", "brand", "spice"]} className="w-full">
        <AccordionItem value="price">
          <AccordionTrigger>Price</AccordionTrigger>
          <AccordionContent>
            <div className="px-1 py-2">
              <Slider
                defaultValue={[Math.min(0, pmin), Math.max(10, Math.min(9999, pmax))]}
                min={0}
                max={5000}
                step={10}
                onValueChange={(v) => {
                  setPmin(v[0] ?? 0)
                  setPmax(v[1] ?? 5000)
                }}
              />
              <div className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{`$${pmin} – $${pmax === 9999 ? "Max" : pmax}`}</div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="type">
          <AccordionTrigger>Product Type</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="type"
                  value=""
                  checked={type === ""}
                  onChange={() => setType("")}
                />
                <span className="text-sm">All</span>
              </label>
              {availableTypes.map((t) => (
                <label key={t} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="type"
                    value={t}
                    checked={type === t}
                    onChange={() => setType(t)}
                  />
                  <span className="text-sm">{t}</span>
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="brand">
          <AccordionTrigger>Brand</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 gap-2">
              {availableBrands.map((b) => (
                <label key={b} className="flex items-center gap-2">
                  <Checkbox
                    id={`brand-${b}`}
                    checked={brands.includes(b)}
                    onCheckedChange={() => toggleBrand(b)}
                  />
                  <Label htmlFor={`brand-${b}`} className="text-sm">
                    {b}
                  </Label>
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="spice">
          <AccordionTrigger>Spice Level</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 gap-2">
              {spiceOptions.map((s) => (
                <label key={s.key} className="flex items-center gap-2">
                  <Checkbox
                    id={`spice-${s.key}`}
                    checked={spice.includes(s.key)}
                    onCheckedChange={() => toggleSpice(s.key)}
                  />
                  <Label htmlFor={`spice-${s.key}`} className="text-sm">
                    {s.label}
                  </Label>
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="mt-4 flex gap-2">
        <Button className="bg-green-600 hover:bg-green-700 w-full" onClick={apply}>
          Apply Filters
        </Button>
      </div>
    </div>
  )
}
