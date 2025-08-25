import FAQ from "@/models/FAQ";
import Review from "@/models/Review";
import Product from "@/models/Product";
import User from "@/models/User";
import dbConnect from "@/lib/mongodb";

async function seedData() {
  try {
    await dbConnect();
    console.log("Connected to database");

    // Create sample FAQs
    const faqs = [
      {
        question: "How should I store spices?",
        answer: "Store spices in a cool, dry place away from direct sunlight. Keep containers tightly sealed to maintain freshness and flavor. Avoid storing near heat sources like stoves or ovens.",
        category: "products",
        tags: ["storage", "spices", "freshness"],
        order: 1
      },
      {
        question: "What is the shelf life of your spices?",
        answer: "Our spices have a shelf life of 24 months when stored properly. Ground spices may lose potency over time, so we recommend using them within 12-18 months for best flavor.",
        category: "products",
        tags: ["shelf-life", "freshness", "quality"],
        order: 2
      },
      {
        question: "Are your products vegetarian?",
        answer: "Yes, all our spice products are 100% vegetarian and contain no animal products. We use only plant-based ingredients sourced from trusted farms.",
        category: "products",
        tags: ["vegetarian", "vegan", "ingredients"],
        order: 3
      },
      {
        question: "How long does shipping take?",
        answer: "Standard shipping takes 3-5 business days. Express shipping is available for 1-2 business days. We ship nationwide and provide tracking information for all orders.",
        category: "shipping",
        tags: ["delivery", "tracking", "express"],
        order: 1
      },
      {
        question: "What is your return policy?",
        answer: "We offer a 30-day return policy for unopened products. If you're not satisfied with your purchase, contact our customer service team for assistance.",
        category: "returns",
        tags: ["refunds", "customer-service", "satisfaction"],
        order: 1
      },
      {
        question: "Do you ship internationally?",
        answer: "Currently, we only ship within the United States. We're working on expanding our international shipping options in the future.",
        category: "shipping",
        tags: ["international", "usa", "expansion"],
        order: 2
      },
      {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and Apple Pay. All payments are processed securely through our payment partners.",
        category: "payment",
        tags: ["credit-cards", "paypal", "security"],
        order: 1
      },
      {
        question: "How can I track my order?",
        answer: "Once your order ships, you'll receive a confirmation email with tracking information. You can also track your order through your account dashboard on our website.",
        category: "shipping",
        tags: ["tracking", "orders", "dashboard"],
        order: 3
      }
    ];

    // Clear existing FAQs
    await FAQ.deleteMany({});
    console.log("Cleared existing FAQs");

    // Insert new FAQs
    const createdFaqs = await FAQ.insertMany(faqs);
    console.log(`Created ${createdFaqs.length} FAQs`);

    // Create sample reviews (if products exist)
    const products = await Product.find({}).limit(3);
    if (products.length > 0) {
      // Clear existing reviews
      await Review.deleteMany({});
      console.log("Cleared existing reviews");

      const reviews = [
        {
          product: products[0]._id,
          user: "64f1234567890abcdef12345", // Mock user ID
          rating: 5,
          title: "Excellent Quality",
          comment: "The spices are incredibly fresh and aromatic. I've been using them for months and the flavor is still amazing. Highly recommend!",
          isVerified: true,
          helpfulCount: 12
        },
        {
          product: products[0]._id,
          user: "64f1234567890abcdef12346", // Mock user ID
          rating: 4,
          title: "Great Value",
          comment: "Good quality spices at reasonable prices. The packaging keeps them fresh and the quantities are generous.",
          isVerified: true,
          helpfulCount: 8
        },
        {
          product: products[1]?._id || products[0]._id,
          user: "64f1234567890abcdef12347", // Mock user ID
          rating: 5,
          title: "Perfect for Indian Cooking",
          comment: "These spices have transformed my Indian cooking. The garam masala blend is perfectly balanced and authentic.",
          isVerified: true,
          helpfulCount: 15
        }
      ];

      const createdReviews = await Review.insertMany(reviews);
      console.log(`Created ${createdReviews.length} reviews`);

      // Update product review counts
      for (const product of products) {
        const reviewCount = await Review.countDocuments({ product: product._id });
        const avgRating = await Review.aggregate([
          { $match: { product: product._id } },
          { $group: { _id: null, avgRating: { $avg: "$rating" } } }
        ]);

        await Product.findByIdAndUpdate(product._id, {
          reviewCount,
          ratingAvg: avgRating[0]?.avgRating || 0
        });
      }
      console.log("Updated product review counts");
    }

    console.log("Seed data completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
}

seedData();

