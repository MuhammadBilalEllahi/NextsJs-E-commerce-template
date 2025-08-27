"use client"

import { useState } from "react"
import { Star } from 'lucide-react'
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

export default function Reviews({
  productId = "",
  initialReviews = [] as { user: string; rating: number; text: string }[],
}) {
  const [reviews, setReviews] = useState(initialReviews)
  const [rating, setRating] = useState(5)
  const [text, setText] = useState("")

  return (
    <div className="container mx-auto px-0">
      <h2 className="text-xl font-semibold mb-4">Reviews</h2>
      <div className="space-y-3">
        {reviews.length === 0 && (
          <div className="text-sm text-neutral-600 dark:text-neutral-400">No reviews yet.</div>
        )}
        {reviews.map((r, i) => (
          <div key={i} className="rounded border p-3">
            <div className="flex items-center gap-2">
              <div className="font-medium">{r.user}</div>
              <Stars value={r.rating} />
            </div>
            <p className="text-sm">{r.text}</p>
          </div>
        ))}
      </div>
      <form
        className="mt-4 space-y-2"
        onSubmit={(e) => {
          e.preventDefault()
          if (!text) return
          setReviews((prev) => [...prev, { user: "Guest", rating, text }])
          setText("")
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">Your rating:</span>
          <Stars value={rating} onChange={setRating} interactive />
        </div>
        <Textarea placeholder="Share your thoughts..." value={text} onChange={(e) => setText(e.target.value)} />
        <Button className="bg-orange-600 hover:bg-orange-700">Submit Review</Button>
      </form>
    </div>
  )
}

function Stars({
  value,
  onChange,
  interactive = false,
}: {
  value: number
  onChange?: (v: number) => void
  interactive?: boolean
}) {
  return (
    <div className="inline-flex items-center">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type={interactive ? "button" : "button"}
          aria-label={`${i} star`}
          onClick={() => interactive && onChange?.(i)}
          className="p-0.5"
        >
          <Star className={`h-4 w-4 ${i <= value ? "text-yellow-500 fill-yellow-500" : "text-neutral-400"}`} />
        </button>
      ))}
    </div>
  )
}
