import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle2, MessageCircle } from 'lucide-react'

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ orderId?: string, refId?: string }> }) {
  const { orderId, refId } = await searchParams
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <CheckCircle2 className="mx-auto h-16 w-16 text-green-600" />
      <h1 className="mt-4 text-2xl font-bold">Order Confirmed</h1>
      <p className="mt-2 text-neutral-700 dark:text-neutral-300">
        Thank you! Your order {orderId ? `#${orderId}` : ""} has been placed.
      </p>
      {refId && (
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Reference ID: {refId}
        </p>
      )}
      <div className="mt-6 flex items-center justify-center gap-3">
        <Link href="/track-order">
          <Button className="bg-red-600 hover:bg-red-700">Track Order</Button>
        </Link>
        <a
          href={`https://wa.me/923001234567?text=${encodeURIComponent(`Hello Dehli Mirch, I need help with my order ${orderId ?? ""}.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-md border px-4 py-2"
        >
          <MessageCircle className="h-4 w-4" /> WhatsApp Support
        </a>
      </div>
      <Link href="/category/all" className="mt-6 block text-red-600 hover:underline">
        Continue shopping
      </Link>
    </div>
  )
}
