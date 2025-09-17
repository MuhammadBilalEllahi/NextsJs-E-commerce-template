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
export const submitReview = async (reviewData: {
  product: string;
  rating: number;
  title: string;
  comment: string;
  images?: File[];
  reviewId?: string;
}) => {
  const formData = new FormData();
  formData.append("product", reviewData.product);
  formData.append("rating", reviewData.rating.toString());
  formData.append("title", reviewData.title);
  formData.append("comment", reviewData.comment);

  if (reviewData.reviewId) {
    formData.append("reviewId", reviewData.reviewId);
  }

  if (reviewData.images && reviewData.images.length > 0) {
    reviewData.images.forEach((file) => {
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
export const fetchUserReviews = async (limit = 10, page = 1) => {
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
) => {
  const res = await fetch(
    `${API_URL_REVIEWS}?productId=${productId}&limit=${limit}&page=${page}`
  );
  if (!res.ok) throw new Error("Failed to fetch product reviews");
  const data = await res.json();
  return data;
};
