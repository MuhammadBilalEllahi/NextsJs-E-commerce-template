"use client";

import { useState, useEffect } from "react";
import { Star, Edit, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { fetchUserReviews, submitReview } from "@/lib/api/reviews/reviews";

interface Review {
  id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    images: string[];
  };
  rating: number;
  title: string;
  comment: string;
  images: string[];
  isVerified: boolean;
  isEdited: boolean;
  editedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function UserReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    title: "",
    comment: "",
    images: [] as File[],
  });

  // Fetch user reviews
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await fetchUserReviews();

      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // Handle edit review
  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setFormData({
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      images: [],
    });
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
    }));
  };

  // Remove image from form
  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Submit review update
  const handleSubmitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview || !formData.comment.trim()) return;

    setSubmitting(true);
    try {
      const data = await submitReview({
        product: editingReview.product.id,
        rating: formData.rating,
        title: formData.title,
        comment: formData.comment,
        images: formData.images,
        reviewId: editingReview.id,
      });

      if (data.success) {
        setEditingReview(null);
        setFormData({ rating: 5, title: "", comment: "", images: [] });
        fetchReviews(); // Refresh reviews
        alert("Review updated successfully!");
      } else {
        alert("Failed to update review: " + data.error);
      }
    } catch (error) {
      console.error("Error updating review:", error);
      alert("Failed to update review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingReview(null);
    setFormData({ rating: 5, title: "", comment: "", images: [] });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Reviews</h1>

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              You haven&apos;t written any reviews yet.
            </p>
            <Link href="/shop/all">
              <Button>Browse Products</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link href={`/product/${review.product.slug}`}>
                      <CardTitle className="text-lg hover:text-red-600 transition-colors">
                        {review.product.name}
                      </CardTitle>
                    </Link>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(review.createdAt)}
                      </span>
                      {review.isVerified && (
                        <Badge variant="secondary" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified Purchase
                        </Badge>
                      )}
                      {review.isEdited && (
                        <Badge variant="outline" className="text-xs">
                          Edited
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditReview(review)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                {review.title && (
                  <h4 className="font-medium mb-2">{review.title}</h4>
                )}

                <p className="text-gray-700 mb-4">{review.comment}</p>

                {review.images && review.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                    {review.images.map((image, index) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-lg overflow-hidden"
                      >
                        <Image
                          src={image}
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Review Modal */}
      {editingReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Edit Review</CardTitle>
              <p className="text-sm text-muted-foreground">
                Reviewing: {editingReview.product.name}
              </p>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmitUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rating">Rating</Label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, rating: star }))
                        }
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= formData.rating
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
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comment">Review</Label>
                  <Textarea
                    id="comment"
                    placeholder="Share your thoughts about this product..."
                    value={formData.comment}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        comment: e.target.value,
                      }))
                    }
                    rows={4}
                    maxLength={1000}
                    required
                  />
                  <div className="text-xs text-muted-foreground text-right">
                    {formData.comment.length}/1000
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

                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {formData.images.map((file, index) => (
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

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={submitting || !formData.comment.trim()}
                    className="flex-1"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Updating...
                      </>
                    ) : (
                      "Update Review"
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
