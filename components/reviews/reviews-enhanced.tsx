"use client"

import { useState, useEffect } from "react"
import { Star, ThumbsUp, CheckCircle, Loader2 } from 'lucide-react'
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Review {
  id: string;
  user: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  isVerified?: boolean;
  helpfulCount?: number;
}

interface ReviewsProps {
  productId: string;
  initialReviews?: Review[];
}

export function ReviewsEnhanced({ productId, initialReviews = [] }: ReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState("")
  const [comment, setComment] = useState("")
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [totalReviews, setTotalReviews] = useState(initialReviews.length)

  // Fetch reviews from backend
  const fetchReviews = async (pageNum = 1, append = false) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/reviews?productId=${productId}&page=${pageNum}&limit=5`);
      const data = await response.json();
      
      if (data.success) {
        if (append) {
          setReviews(prev => [...prev, ...data.reviews]);
        } else {
          setReviews(data.reviews);
        }
        setHasMore(data.pagination.page < data.pagination.pages);
        setTotalReviews(data.pagination.total);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load more reviews
  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchReviews(nextPage, true);
  };

  // Submit new review
  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !comment.trim()) return;
    
    setSubmitting(true);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product: productId,
          user: "64f1234567890abcdef12345", // This should come from auth context
          rating,
          title: title.trim(),
          comment: comment.trim(),
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        // Reset form
        setTitle("");
        setComment("");
        setRating(5);
        
        // Refresh reviews
        fetchReviews(1, false);
        setPage(1);
        
        alert("Review submitted successfully!");
      } else {
        alert("Failed to submit review: " + data.error);
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Load initial reviews if not provided
  useEffect(() => {
    if (initialReviews.length === 0) {
      fetchReviews(1, false);
    }
  }, [productId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Reviews Summary */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Customer Reviews</h3>
          <p className="text-sm text-muted-foreground">
            {totalReviews} review{totalReviews !== 1 ? 's' : ''}
          </p>
        </div>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= Math.round(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium">
              {reviews.length > 0 
                ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                : "0.0"
              }
            </span>
          </div>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 && !loading ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="font-medium">{review.user}</div>
                  {review.isVerified && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3 w-3 ${
                          star <= review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(review.date)}
                  </span>
                </div>
              </div>
              
              {review.title && (
                <h4 className="font-medium text-sm">{review.title}</h4>
              )}
              
              <p className="text-sm text-gray-700">{review.comment}</p>
              
              <div className="flex items-center justify-between">
                <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-gray-700">
                  <ThumbsUp className="h-3 w-3" />
                  Helpful ({review.helpfulCount || 0})
                </button>
              </div>
            </div>
          ))
        )}
        
        {loading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}
        
        {hasMore && !loading && (
          <div className="text-center">
            <Button
              variant="outline"
              onClick={loadMore}
              disabled={loading}
            >
              Load More Reviews
            </Button>
          </div>
        )}
      </div>

      {/* Review Form */}
      <div className="border-t pt-6">
        <h4 className="font-medium mb-4">Write a Review</h4>
        <form onSubmit={submitReview} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rating">Rating</Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="title">Review Title (Optional)</Label>
            <Input
              id="title"
              placeholder="Brief summary of your experience"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="comment">Review</Label>
            <Textarea
              id="comment"
              placeholder="Share your thoughts about this product..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={1000}
              required
            />
            <div className="text-xs text-muted-foreground text-right">
              {comment.length}/1000
            </div>
          </div>
          
          <Button
            type="submit"
            disabled={submitting || !comment.trim()}
            className="w-full"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              "Submit Review"
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
