'use client'

import { CartProvider, useCart } from "@/lib/providers/cartProvider"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Minus, Plus, Trash2 } from 'lucide-react'
import { formatCurrency, CURRENCY, calculateShippingCost, calculateTotalWithShipping } from "@/lib/constants/currency"
import { RootProviders } from "@/lib/providers/rootProvider"

export default function CartPage() {
  // Important: do NOT call useCart here. Wrap children with providers first.
  return (
    <RootProviders>
      <CartProvider>
      <CartContent />
      </CartProvider>
    </RootProviders>
  )
}

function CartContent() {
  const { items, remove, updateQty, subtotal,  clear } = useCart()
  console.log("CartContent - items:", items)
  console.log("CartContent - items length:", items.length)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
      {items.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <p className="mb-4">Your cart is empty.</p>
          <Link href="/category/all" className="text-red-600 underline">
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((it) => (
              <div key={it.id} className="flex items-center gap-4 rounded-lg border p-4">
                <img
                  src={it.image || "/placeholder.svg"}
                  alt={it.title}
                  className="h-20 w-20 rounded object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{it.title}</h3>
                    <button
                      aria-label={`Remove ${it.title}`}
                      onClick={() => remove(it.id)}
                      className="text-red-600 hover:underline inline-flex items-center gap-1"
                    >
                      <Trash2 className="h-4 w-4" /> Remove
                    </button>
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Quantity: {it.qty}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => updateQty(it.id, Math.max(1, it.qty - 1))}
                        className="h-8 w-8 inline-flex items-center justify-center rounded border"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-10 text-center">{it.qty}</span>
                      <button
                        onClick={() => updateQty(it.id, it.qty + 1)}
                        className="h-8 w-8 inline-flex items-center justify-center rounded border"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="font-semibold">{formatCurrency(it.price * it.qty)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <aside className="rounded-lg border p-4 h-fit">
            <h2 className="font-semibold mb-3">Order Summary</h2>
            <div className="flex items-center justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Estimated Delivery</span>
              <span>{formatCurrency(calculateShippingCost(subtotal))}</span>
            </div>
            {/* <div className="my-3">
              <label className="text-sm font-medium">Promo code</label>
              <div className="mt-2 flex gap-2">
                <Input defaultValue={promo ?? ""} placeholder="Enter code" id="promo" />
                <Button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById("promo") as HTMLInputElement | null
                    if (input?.value) applyPromo(input.value)
                  }}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Apply
                </Button>
              </div>
              {promo && <p className="mt-1 text-xs text-green-600">Applied: {promo}</p>}
            </div>
            <div className="flex items-center justify-between font-semibold">
              <span>Total</span>
              <span>
                $
                {(
                  subtotal +
                  (subtotal > 50 ? 0 : 4.99) -
                  (promo?.toLowerCase() === "HEAT10".toLowerCase() ? subtotal * 0.1 : 0)
                ).toFixed(2)}
              </span>
            </div> */}
            <Link href="/checkout">
              <Button className="mt-4 w-full bg-green-600 hover:bg-green-700">Checkout</Button>
            </Link>
            <button onClick={clear} className="mt-2 w-full text-sm text-neutral-600 hover:underline">
              Clear cart
            </button>
          </aside>
        </div>
      )}
    </div>
  )
}

// "use client"

// import { useCart } from "@/lib/cart-store"
// import { Button } from "@/components/ui/button"
// import Link from "next/link"
// import { Input } from "@/components/ui/input"
// import { Minus, Plus, Trash2 } from 'lucide-react'

// export default function CartPage() {
//   const { items, remove, updateQty, subtotal, applyPromo, promo, clear } = useCart()

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
//       {items.length === 0 ? (
//         <div className="rounded-lg border p-8 text-center">
//           <p className="mb-4">Your cart is empty.</p>
//           <Link href="/category/all" className="text-red-600 underline">
//             Continue shopping
//           </Link>
//         </div>
//       ) : (
//         <div className="grid lg:grid-cols-3 gap-8">
//           <div className="lg:col-span-2 space-y-4">
//             {items.map((it) => (
//               <div key={it.id} className="flex items-center gap-4 rounded-lg border p-4">
//                 <img
//                   src={it.image || "/placeholder.svg?height=80&width=80&query=product"}
//                   alt={it.title}
//                   className="h-20 w-20 rounded object-cover"
//                 />
//                 <div className="flex-1">
//                   <div className="flex items-center justify-between">
//                     <h3 className="font-medium">{it.title}</h3>
//                     <button
//                       aria-label={`Remove ${it.title}`}
//                       onClick={() => remove(it.id)}
//                       className="text-red-600 hover:underline inline-flex items-center gap-1"
//                     >
//                       <Trash2 className="h-4 w-4" /> Remove
//                     </button>
//                   </div>
//                   <p className="text-sm text-neutral-600 dark:text-neutral-400">{it.variant ?? "Default"}</p>
//                   <div className="mt-3 flex items-center justify-between">
//                     <div className="inline-flex items-center gap-2">
//                       <button
//                         onClick={() => updateQty(it.id, Math.max(1, it.qty - 1))}
//                         className="h-8 w-8 inline-flex items-center justify-center rounded border"
//                         aria-label="Decrease quantity"
//                       >
//                         <Minus className="h-4 w-4" />
//                       </button>
//                       <span className="w-10 text-center">{it.qty}</span>
//                       <button
//                         onClick={() => updateQty(it.id, it.qty + 1)}
//                         className="h-8 w-8 inline-flex items-center justify-center rounded border"
//                         aria-label="Increase quantity"
//                       >
//                         <Plus className="h-4 w-4" />
//                       </button>
//                     </div>
//                     <div className="font-semibold">${(it.price * it.qty).toFixed(2)}</div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//           <aside className="rounded-lg border p-4 h-fit">
//             <h2 className="font-semibold mb-3">Order Summary</h2>
//             <div className="flex items-center justify-between text-sm">
//               <span>Subtotal</span>
//               <span>${subtotal.toFixed(2)}</span>
//             </div>
//             <div className="flex items-center justify-between text-sm">
//               <span>Estimated Delivery</span>
//               <span>${subtotal > 50 ? "0.00" : "4.99"}</span>
//             </div>
//             <div className="my-3">
//               <label className="text-sm font-medium">Promo code</label>
//               <div className="mt-2 flex gap-2">
//                 <Input defaultValue={promo ?? ""} placeholder="Enter code" id="promo" />
//                 <Button
//                   type="button"
//                   onClick={() => {
//                     const input = document.getElementById("promo") as HTMLInputElement | null
//                     if (input?.value) applyPromo(input.value)
//                   }}
//                   className="bg-red-600 hover:bg-red-700"
//                 >
//                   Apply
//                 </Button>
//               </div>
//               {promo && <p className="mt-1 text-xs text-green-600">Applied: {promo}</p>}
//             </div>
//             <div className="flex items-center justify-between font-semibold">
//               <span>Total</span>
//               <span>
//                 $
//                 {(
//                   subtotal +
//                   (subtotal > 50 ? 0 : 4.99) -
//                   (promo?.toLowerCase() === "HEAT10".toLowerCase() ? subtotal * 0.1 : 0)
//                 ).toFixed(2)}
//               </span>
//             </div>
//             <Link href="/checkout">
//               <Button className="mt-4 w-full bg-green-600 hover:bg-green-700">Checkout</Button>
//             </Link>
//             <button onClick={clear} className="mt-2 w-full text-sm text-neutral-600 hover:underline">
//               Clear cart
//             </button>
//           </aside>
//         </div>
//       )}
//     </div>
//   )
// }
