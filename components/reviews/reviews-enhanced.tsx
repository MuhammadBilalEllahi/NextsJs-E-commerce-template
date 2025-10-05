"use client";

import { useState, useEffect } from "react";
import {
  Star,
  ThumbsUp,
  CheckCircle,
  Loader2,
  Image as ImageIcon,
  Edit,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import {
  checkCanReview,
  submitReview,
  fetchProductReviews,
} from "@/lib/api/reviews/reviews";
import { Review } from "@/types";

interface ReviewsProps {
  productId: string;
  initialReviews?: Review[];
}

export function ReviewsEnhanced({
  productId,
  initialReviews = [],
}: ReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalReviews, setTotalReviews] = useState(initialReviews.length);
  const [canReview, setCanReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [existingReview, setExistingReview] = useState<Review | null>(null);

  // Fetch reviews from backend
  const fetchReviews = async (pageNum = 1, append = false) => {
    if (loading) return;

    setLoading(true);
    try {
      const data = await fetchProductReviews(productId, 5, pageNum);

      if (data.data) {
        if (append) {
          setReviews((prev) => [...prev, ...data.data]);
        } else {
          setReviews(data.data);
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

  // Check if user can review this product
  const checkCanReviewStatus = async () => {
    try {
      const data = await checkCanReview(productId);

      if (data.data) {
        setCanReview(data.canReview);
        setHasReviewed(data.hasReviewed);
        if (data.existingReview) {
          setExistingReview(data.existingReview);
        }
      }
    } catch (error) {
      console.error("Error checking review eligibility:", error);
    }
  };

  // Load more reviews
  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchReviews(nextPage, true);
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages((prev) => [...prev, ...files]);
  };

  // Remove image from form
  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit new review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmitting(true);
    try {
      const data = await submitReview({
        product: productId,
        rating,
        title: title.trim(),
        comment: comment.trim(),
        images,
      });

      if (data.data) {
        // Reset form
        setTitle("");
        setComment("");
        setRating(5);
        setImages([]);

        // Refresh reviews and check eligibility
        fetchReviews(1, false);
        checkCanReviewStatus();
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
    checkCanReviewStatus();
  }, [productId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Reviews Summary */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Customer Reviews</h3>
          <p className="text-sm text-muted-foreground">
            {totalReviews} review{totalReviews !== 1 ? "s" : ""}
          </p>
        </div>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <=
                    Math.round(
                      reviews.reduce((sum, r) => sum + r.rating, 0) /
                        reviews.length
                    )
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium">
              {reviews.length > 0
                ? (
                    reviews.reduce((sum, r) => sum + r.rating, 0) /
                    reviews.length
                  ).toFixed(1)
                : "0.0"}
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
                  {review.isEdited && (
                    <Badge variant="outline" className="text-xs">
                      <Edit className="h-3 w-3 mr-1" />
                      Edited
                    </Badge>
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
                    {formatDate(review.createdAt)}
                  </span>
                </div>
              </div>

              {review.title && (
                <h4 className="font-medium text-sm">{review.title}</h4>
              )}

              <p className="text-sm text-gray-700">{review.comment}</p>

              {review.images && review.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {review.images.map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden"
                    >
                      <Image
                        src={image as string}
                        alt={`Review image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {review.isEdited && review.editedAt && (
                <p className="text-xs text-muted-foreground">
                  Last edited: {formatDate(review.editedAt)}
                </p>
              )}

              <div className="flex items-center justify-between">
                <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-gray-700">
                  <ThumbsUp className="h-3 w-3" />
                  Helpful ({review.isHelpful || 0})
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
            <Button variant="outline" onClick={loadMore} disabled={loading}>
              Load More Reviews
            </Button>
          </div>
        )}
      </div>

      {/* Review Form */}
      <div className="border-t pt-6">
        {!canReview ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>You must complete a purchase before reviewing this product.</p>
          </div>
        ) : hasReviewed ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              You have already reviewed this product.
            </p>
            {existingReview && (
              <div className="bg-gray-50 rounded-lg p-4 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= existingReview.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(existingReview.createdAt)}
                  </span>
                  {existingReview.isEdited && (
                    <Badge variant="outline" className="text-xs">
                      <Edit className="h-3 w-3 mr-1" />
                      Edited
                    </Badge>
                  )}
                </div>
                {existingReview.title && (
                  <h4 className="font-medium text-sm mb-2">
                    {existingReview.title}
                  </h4>
                )}
                <p className="text-sm text-gray-700 mb-2">
                  {existingReview.comment}
                </p>
                {existingReview.images && existingReview.images.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {existingReview.images.map((image, index) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-lg overflow-hidden"
                      >
                        <Image
                          src={image as string}
                          alt={`Review image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <>
            <h4 className="font-medium mb-4">Write a Review</h4>
            <form onSubmit={handleSubmitReview} className="space-y-4">
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

              <div className="space-y-2">
                <Label htmlFor="images">Add Images (Optional)</Label>
                <Input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                />

                {images.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {images.map((file, index) => (
                      <div key={index} className="relative">
                        <Image
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          width={100}
                          height={100}
                          className="object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 p-0"
                          onClick={() => removeImage(index)}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
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
          </>
        )}
      </div>
    </div>
  );
}
