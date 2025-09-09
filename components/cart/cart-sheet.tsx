"use client"

import { useCart } from "@/lib/providers/cartContext"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Minus, Plus, Trash2, X } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { formatCurrency, calculateShippingCost, calculateTotalWithShipping } from "@/lib/constants/currency"

interface CartSheetProps {
  children: React.ReactNode
}

export function CartSheet({ children }: CartSheetProps) {
  const { items, remove, updateQty, subtotal, clear, isAdding } = useCart()

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md p-2">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>{items.length} items</span>
            {/* <X className="h-4 w-4" /> */}
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col h-full">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <div className="text-6xl mb-4">🛒</div>
              <p className="text-lg font-medium mb-2">Your cart is empty</p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                Add some delicious spices to get started!
              </p>
              <Link href="/category/all">
                <Button className="bg-green-600 hover:bg-green-700">
                  Start Shopping
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto py-4 space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 rounded-lg border p-3">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.title}
                      className="h-16 w-16 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-sm truncate">{item.title}</h3>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">Quantity: {item.qty}</p>
                        </div>
                        <button
                          aria-label={`Remove ${item.title}`}
                          onClick={() => remove(item.id)}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => updateQty(item.id, Math.max(1, item.qty - 1))}
                            className="h-6 w-6 inline-flex items-center justify-center rounded border text-xs"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-sm">{item.qty}</span>
                          <button
                            onClick={() => updateQty(item.id, item.qty + 1)}
                            className="h-6 w-6 inline-flex items-center justify-center rounded border text-xs"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="font-semibold text-sm">{formatCurrency(item.price * item.qty)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Shipping</span>
                    <span>{formatCurrency(calculateShippingCost(subtotal))}</span>
                  </div>
                  <div className="flex items-center justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatCurrency(calculateTotalWithShipping(subtotal))}</span>
                  </div>
                </div>
                
                <div className="space-y-6 mb-2">
                  <Link href="/checkout" className="w-full ">
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      Checkout
                    </Button>
                  </Link>
                  <Link href="/cart" className="w-full">
                    <Button variant="outline" className="w-full">
                      View Full Cart
                    </Button>
                  </Link>
                  <button 
                    onClick={clear} 
                    className="w-full text-sm text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 py-2"
                  >
                    Clear cart
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
