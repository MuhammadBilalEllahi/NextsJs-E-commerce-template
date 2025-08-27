
export type Blog = {
  slug: string
  title: string
  excerpt: string
  content: string
  image: string
  tags: string[]
}

export async function getAllBlogs(): Promise<Blog[]> {
  return demoBlogs
}

export async function getFeaturedBlogs(): Promise<Blog[]> {
  return demoBlogs.slice(0, 3)
}

export function getTestimonials() {
  return [
    { author: "Ayesha K.", quote: "Best masalas! Authentic flavor every time." },
    { author: "Rahul S.", quote: "Pickles are just like home. Love the heat!" },
    { author: "Fatima Z.", quote: "Fast delivery and great packaging." },
  ]
}



const demoBlogs: Blog[] = [
  {
    slug: "how-to-balance-heat-and-flavor",
    title: "How to Balance Heat and Flavor in Curries",
    excerpt: "Spice is more than heat—learn to layer flavors like a pro.",
    content:
      "Balancing heat and flavor starts with quality spices. Toast whole spices, grind fresh, and add heat in layers...",
    image: "/placeholder.svg?height=420&width=720",
    tags: ["Tips", "Spice Science"],
  },
  {
    slug: "5-quick-snacks-for-chai-time",
    title: "5 Quick Snacks for Chai Time",
    excerpt: "From chakri to namkeen mixtures, your chai deserves company.",
    content: "Chai time is sacred. Here are 5 snacks that complement your chai perfectly...",
    image: "/placeholder.svg?height=420&width=720",
    tags: ["Snacks", "Lifestyle"],
  },
  {
    slug: "pickle-perfection",
    title: "Pickle Perfection: Fermenting the Right Way",
    excerpt: "Crisp, tangy, and spicy—master the art of achar.",
    content: "Pickling is an art. Start with clean jars, sun-curing, and the right oil...",
    image: "/placeholder.svg?height=420&width=720",
    tags: ["Pickles", "How-To"],
  },
]



// Basic in-memory mock data for products and blogs.
// Swap these with your CMS/database queries later.

export type Review = {
  id: number
  user: string
  rating: number // 1-5
  comment: string
  date: string
}

export type Product = {
  id: number
  slug: string
  title: string
  description: string
  price: number
  images: string[]
  rating: number
  spiceLevel: number // 1-5
  vegetarian: boolean
  ingredients: string
  instructions: string
  category: string
  brand: string
  stock: number
  tags?: string[]
  reviews: Review[]
}

const products: Product[] = [
  {
    id: 1,
    slug: "product-1",
    title: "Kashmiri Mirch Powder",
    description:
      "Vibrant red Kashmiri chili powder known for rich color and medium heat. Perfect for curries, tikkas, and marinades.",
    price: 5.99,
    images: [
      "/kashmiri-mirch-main.png",
      "/placeholder-4ptcq.png",
      "/kashmiri-mirch-alt-2.png",
    ],
    rating: 4.6,
    spiceLevel: 3,
    vegetarian: true,
    ingredients: "100% Kashmiri red chili.",
    instructions:
      "Use 1-2 tsp for curries and gravies. Store in an airtight container away from moisture and sunlight.",
    category: "ground-spices",
    brand: "Delhi Mirch",
    stock: 124,
    tags: ["vegan", "gluten-free", "color-rich"],
    reviews: [
      {
        id: 101,
        user: "Ayesha",
        rating: 5,
        comment:
          "Beautiful color without too much heat. Gave my butter chicken that restaurant look!",
        date: "2025-05-21",
      },
      {
        id: 102,
        user: "Rohit",
        rating: 4,
        comment: "Great quality and aroma. Will buy again.",
        date: "2025-06-03",
      },
    ],
  },
  {
    id: 2,
    slug: "product-2",
    title: "Garam Masala Blend",
    description:
      "Classic North Indian garam masala with bold, aromatic notes. Finishing spice for curries and dals.",
    price: 4.49,
    images: [
      "/garam-masala-main.png",
      "/garam-masala-alt-1.png",
    ],
    rating: 4.7,
    spiceLevel: 2,
    vegetarian: true,
    ingredients:
      "Coriander, cumin, cinnamon, cloves, cardamom, black pepper, bay leaf, nutmeg.",
    instructions:
      "Add 1/2-1 tsp at the end of cooking for deep aroma. Store airtight.",
    category: "mixes",
    brand: "Delhi Mirch",
    stock: 82,
    tags: ["aromatic", "finishing-spice"],
    reviews: [
      {
        id: 201,
        user: "Samir",
        rating: 5,
        comment: "Perfectly balanced. Smells amazing!",
        date: "2025-04-17",
      },
    ],
  },
  {
    id: 3,
    slug: "product-3",
    title: "Whole Cumin Seeds (Jeera)",
    description:
      "Premium-grade whole cumin seeds with warm earthy flavor. Essential tempering spice.",
    price: 3.29,
    images: [
      "/cumin-seeds-main.png",
      "/cumin-seeds-alt-1.png",
    ],
    rating: 4.5,
    spiceLevel: 1,
    vegetarian: true,
    ingredients: "100% cumin seeds.",
    instructions:
      "Toast lightly in oil or ghee until aromatic. Store cool and dry.",
    category: "whole-spices",
    brand: "Delhi Mirch",
    stock: 210,
    tags: ["tempering", "pantry-basic"],
    reviews: [],
  },
  {
    id: 4,
    slug: "product-4",
    title: "Chaat Masala",
    description:
      "Tangy masala to sprinkle on fruits, chaats, salads, and snacks.",
    price: 2.99,
    images: [
      "/chaat-masala-main.png",
    ],
    rating: 4.3,
    spiceLevel: 2,
    vegetarian: true,
    ingredients: "Cumin, coriander, black salt, amchur, pepper, chili.",
    instructions: "Sprinkle to taste. Great on raita and chaats.",
    category: "mixes",
    brand: "Delhi Mirch",
    stock: 60,
    tags: ["tangy", "snacks"],
    reviews: [],
  },
  {
    id: 5,
    slug: "product-5",
    title: "Turmeric Powder",
    description:
      "Golden turmeric with warm flavor and vibrant color. Everyday essential.",
    price: 2.49,
    images: [
      "/vibrant-turmeric.png",
    ],
    rating: 4.8,
    spiceLevel: 1,
    vegetarian: true,
    ingredients: "100% turmeric.",
    instructions:
      "Use 1/4-1/2 tsp to color curries and rice. Avoid staining surfaces.",
    category: "ground-spices",
    brand: "Delhi Mirch",
    stock: 300,
    tags: ["daily", "color"],
    reviews: [],
  },
  {
    id: 6,
    slug: "product-6",
    title: "Mango Pickle (Achar)",
    description:
      "Spicy, tangy North Indian style mango pickle with robust masala.",
    price: 6.49,
    images: [
      "/mango-pickle-main.png",
      "/mango-pickle-alt.png",
    ],
    rating: 4.4,
    spiceLevel: 4,
    vegetarian: true,
    ingredients:
      "Raw mango, mustard oil, chili, fenugreek, fennel, salt, spices.",
    instructions:
      "Serve as a condiment with parathas and curries. Use clean dry spoon.",
    category: "condiments",
    brand: "Delhi Mirch",
    stock: 45,
    tags: ["tangy", "spicy"],
    reviews: [],
  },
]

// Async to mirror real data fetching
export async function getAllProducts(): Promise<Product[]> {
  return products
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  return products.find((p) => p.slug === slug)
}


export async function getFeaturedProducts() {
  return products.slice(0, 8)
}
