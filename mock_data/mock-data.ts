export type Category = { slug: string; title: string; image: string }

export type ShopLocations = {
  id: string,

  name: string,
  logo: string, // https image
  address: string, // normal addrsss
  phoneNumber: string, // pak number
  branchNumber: string, // 1,2,3
  location: string, // google maps
}
// AGP 4627
export const shopLocations: ShopLocations[] = [
  {
    id: "1",
    name: "Dehli Masala Jaat (1995) – College Road",
    logo: "https://www.dehlimirchmasalajaat.com/public/uploads/all/FcvSACK7Q0VEtrune9EDzARZHXkPlEDsoiTgbrXU.png",
    address: "17-B-1, Shop No. 4, Chowdry Chowk, College Road, Township, Lahore",
    phoneNumber: "0321-4375872",
    branchNumber: "1",
    location: "https://maps.app.goo.gl/Cz3unrgyfjQxsR3v5",
  },
  {
    id: "2",
    name: "Dehli Mirch Masala Jaat Since 1995 – PCSIR",
    logo: "https://www.dehlimirchmasalajaat.com/public/uploads/all/FcvSACK7Q0VEtrune9EDzARZHXkPlEDsoiTgbrXU.png",
    address: "145-B, PCSIR, Near Bervo Bakery, College Road, Lahore",
    phoneNumber: "0307-4023077",
    branchNumber: "2",
    location: "https://maps.app.goo.gl/rWP88sLx3trziMQt7",
  },
  {
    id: "3",
    name: "DEHLI mirch masala jaat 1995 – Wapda Town",
    logo: "https://www.dehlimirchmasalajaat.com/public/uploads/all/FcvSACK7Q0VEtrune9EDzARZHXkPlEDsoiTgbrXU.png",
    address: "335-K-2, Chashma Road, Near Jami Water, Rehmat Chowk, Wapda Town, Lahore",
    phoneNumber: "0300-7111898",
    branchNumber: "3",
    location: "https://maps.app.goo.gl/3Bccd3MY8XZJTYw5A",
  }
];

export type Product = {
  id: string
  slug: string
  title: string
  description?: string
  price: number
  brand?: string
  type?: string // "Powder" | "Whole" | "Mixes" | "Pickle" | "Snack"
  category?: string // "powder" | "whole" | "mixes" | "pickle" | "snack"
  spiceLevel?: number // 1-5
  rating?: number
  popularity?: number
  createdAt?: string
  image?: string
  tags?: string[]
}

export type Blog = { slug: string; title: string; excerpt: string; image: string; date?: string }
export type Testimonial = { name: string; rating: number; quote: string; avatar?: string }

// Categories
export const categories: Category[] = [
  { slug: "spices", title: "Spices", image: "/assorted-spices.png" },
  { slug: "masalas", title: "Masalas", image: "/assorted-masalas.png" },
  { slug: "pickles", title: "Pickles", image: "/jar-of-pickles.png" },
  { slug: "snacks", title: "Snacks", image: "/variety-of-snacks.png" },
  { slug: "gifts", title: "Gift Boxes", image: "/colorful-gift-box.png" },
]

// Blogs
export const blogs: Blog[] = [
  {
    slug: "balance-heat-and-flavor",
    title: "Balance Heat and Flavor in Curries",
    excerpt: "Spice is more than heat—learn to layer flavors like a pro.",
    image: "/spice-cooking.png",
    date: "2025-06-01",
  },
  {
    slug: "snacks-for-chai-time",
    title: "5 Quick Snacks for Chai Time",
    excerpt: "From chakri to namkeen mixtures, your chai deserves company.",
    image: "/chai-snacks.png",
    date: "2025-06-07",
  },
  {
    slug: "pickle-perfection",
    title: "Pickle Perfection: Ferment the Right Way",
    excerpt: "Crisp, tangy, and spicy—master the art of achar.",
    image: "/pickle-jar.png",
    date: "2025-06-15",
  },
]

// Testimonials (exported for HomeTestimonials)
export const testimonials: Testimonial[] = [
  { name: "Ayesha Khan", rating: 5, quote: "Authentic flavors, just like home.", avatar: "/avatar-woman.png" },
  { name: "Rahul Singh", rating: 4, quote: "Great packaging and quick delivery.", avatar: "/stylized-man-avatar.png" },
  { name: "Fatima Zahra", rating: 5, quote: "The garam masala is perfection." },
]

// Product dataset
const brands = ["Delhi Mirch", "Khana Khazana", "Masala Co", "Desi Choice"]
const types = ["Powder", "Whole", "Mixes", "Pickle", "Snack"]
const cats = ["powder", "whole", "mixes", "pickle", "snack"]

const sampleDescriptions = [
  "Aromatic and vibrant spice perfect for everyday cooking.",
  "Handpicked and sun-dried for rich flavor and color.",
  "Traditional blend crafted for authentic taste.",
  "Medium heat with bold aroma. Great for curries.",
  "Premium quality sourced from trusted farms.",
]

// Simple deterministic helpers to avoid randomness across renders
function seededPopularity(i: number) {
  return (i * 137 + 89) % 1000 // 0..999
}
function seededRating(i: number) {
  return Math.min(5, 3 + ((i % 20) / 20) * 2) // ~3..5
}

export const products: Product[] = Array.from({ length: 60 }).map((_, i) => {
  const brand = brands[i % brands.length]
  const type = types[i % types.length]
  const category = cats[i % cats.length]
  const price = Math.round(((i % 12) + 3 + (i % 5) * 0.7) * 2.5 * 100) / 100
  const spice = ((i % 5) + 1)
  const title = `${brand} ${type} ${i + 1}`
  return {
    id: `p-${i + 1}`,
    slug: `product-${i + 1}`,
    title,
    description: sampleDescriptions[i % sampleDescriptions.length],
    price,
    brand,
    type,
    category,
    spiceLevel: spice,
    rating: Math.round(seededRating(i) * 10) / 10,
    popularity: seededPopularity(i),
    createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    image: `/placeholder.svg?height=220&width=320&query=${encodeURIComponent(`${type} ${brand} spice product`)}`,
    tags: ["spice", "indian", category, type.toLowerCase()],
  }
})

// Home page helpers
export async function getFeaturedProducts(): Promise<Product[]> {
  return products.slice(0, 8)
}
export async function getFeaturedBlogs(): Promise<Blog[]> {
  return blogs.slice(0, 3)
}
export async function getCategories(): Promise<Category[]> {
  return categories
}

// Category page helper
export async function getAllProducts(): Promise<Product[]> {
  return products
}
