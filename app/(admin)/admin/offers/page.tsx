"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type Banner = { id: string; title: string; description: string }
type Coupon = { code: string; discount: number }

export default function OffersAdminPage() {
  const [banners, setBanners] = useState<Banner[]>([
    { id: "b1", title: "Summer Heat Sale", description: "Up to 30% off select items" },
  ])
  const [coupons, setCoupons] = useState<Coupon[]>([{ code: "HEAT10", discount: 10 }])

  const [bTitle, setBTitle] = useState("")
  const [bDesc, setBDesc] = useState("")
  const [cCode, setCCode] = useState("")
  const [cDisc, setCDisc] = useState<number | "">("")

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-semibold mb-3">Discount Banners</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {banners.map((b) => (
            <div key={b.id} className="rounded border p-4">
              <div className="font-medium">{b.title}</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">{b.description}</div>
              <button className="mt-2 text-red-600 hover:underline" onClick={() => setBanners((prev) => prev.filter((x) => x.id !== b.id))}>
                Remove
              </button>
            </div>
          ))}
          <div className="rounded border p-4">
            <div className="font-medium mb-2">Add Banner</div>
            <Input placeholder="Title" value={bTitle} onChange={(e) => setBTitle(e.target.value)} />
            <Textarea className="mt-2" placeholder="Description" value={bDesc} onChange={(e) => setBDesc(e.target.value)} />
            <Button
              className="mt-2 bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (!bTitle) return
                setBanners((prev) => [{ id: "b" + Date.now(), title: bTitle, description: bDesc }, ...prev])
                setBTitle("")
                setBDesc("")
              }}
            >
              Save Banner
            </Button>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Coupons</h2>
        <div className="overflow-x-auto rounded border">
          <table className="min-w-full text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-900/40">
              <tr>
                <th className="text-left p-3">Code</th>
                <th className="text-left p-3">Discount (%)</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.code} className="border-t">
                  <td className="p-3">{c.code}</td>
                  <td className="p-3">{c.discount}</td>
                  <td className="p-3">
                    <button className="text-red-600 hover:underline" onClick={() => setCoupons((prev) => prev.filter((x) => x.code !== c.code))}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-neutral-500">No coupons.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex gap-2">
          <Input placeholder="Code" value={cCode} onChange={(e) => setCCode(e.target.value)} />
          <Input type="number" placeholder="Discount %" value={cDisc} onChange={(e) => setCDisc(Number(e.target.value))} />
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={() => {
              if (!cCode || !cDisc) return
              setCoupons((prev) => [{ code: cCode.toUpperCase(), discount: Number(cDisc) }, ...prev])
              setCCode("")
              setCDisc("")
            }}
          >
            Add Coupon
          </Button>
        </div>
      </section>
      <p className="text-xs text-neutral-500">Note: Placeholder only; wire to your backend to persist offers.</p>
    </div>
  )
}
