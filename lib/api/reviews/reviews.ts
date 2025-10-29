import { PaginatedResponse, Review } from "@/types/types";

export const API_URL_REVIEWS = "/api/reviews";
export const API_URL_REVIEWS_CAN_REVIEW = "/api/reviews/can-review";
export const API_URL_REVIEWS_USER = "/api/reviews/user";

// Check if user can review a product
export const checkCanReview = async (productId: string) => {
  const res = await fetch(
    `${API_URL_REVIEWS_CAN_REVIEW}?productId=${productId}`
  );
  if (!res.ok) throw new Error("Failed to check review eligibility");
  const data = await res.json();
  return data;
};

// Submit or update a review
export const submitReview = async (reviewData: any) => {
  const formData = new FormData();
  formData.append("product", reviewData.product.id);
  formData.append("rating", reviewData.rating.toString());
  formData.append("title", reviewData.title);
  formData.append("comment", reviewData.comment);

  if (reviewData.id) {
    formData.append("reviewId", reviewData.id);
  }

  if (reviewData.images && reviewData.images.length > 0) {
    reviewData.images.forEach((file: File | string) => {
      formData.append("images", file);
    });
  }

  const res = await fetch(API_URL_REVIEWS, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("API Error Response:", errorText);
    throw new Error(`Failed to submit review: ${res.status} ${errorText}`);
  }
  const data = await res.json();
  return data;
};

// Fetch user reviews
export const fetchUserReviews = async (
  limit = 10,
  page = 1
): Promise<PaginatedResponse<Review>> => {
  const res = await fetch(
    `${API_URL_REVIEWS_USER}?limit=${limit}&page=${page}`
  );
  if (!res.ok) throw new Error("Failed to fetch user reviews");
  const data = await res.json();
  return data;
};

// Fetch product reviews
export const fetchProductReviews = async (
  productId: string,
  limit = 10,
  page = 1
): Promise<PaginatedResponse<Review>> => {
  const res = await fetch(
    `${API_URL_REVIEWS}?productId=${productId}&limit=${limit}&page=${page}`
  );
  if (!res.ok) throw new Error("Failed to fetch product reviews");
  const data = await res.json();
  return data;
};
