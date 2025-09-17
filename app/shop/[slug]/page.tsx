import { RootProviders } from "@/lib/providers/rootProvider";
import { CategoryClient } from "@/components/shop/category-client";
import { getAllProducts, getAllCategories } from "@/database/data-service";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Category } from "@/mock_data/mock-data";

export const dynamic = "force-dynamic";

// Interface for database category data
interface DatabaseCategory extends Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  parent: { id: string; name: string } | null;
  productCount: number;
}

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    q?: string;
    pmin?: string;
    pmax?: string;
    type?: string;
    brands?: string;
    category?: string;
    sort?: string;
    view?: string;
    itemsPerPage?: string;
    page?: string;
  }>;
}

// Generate metadata for better SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  if (slug === "all") {
    return {
      title: "All Products | Dehli Mirch",
      description:
        "Explore our complete collection of authentic Indian spices, pickles, and snacks at Dehli Mirch.",
    };
  }

  const categories = await getAllCategories();
  const category = categories.find(
    (cat: Category) => cat.name.toLowerCase() === slug.toLowerCase()
  );

  if (!category) {
    return {
      title: "Category Not Found | Dehli Mirch",
    };
  }

  return {
    title: `${category.name} | Dehli Mirch`,
    description:
      category.description ||
      `Discover our premium ${category.name.toLowerCase()} collection at Dehli Mirch.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const searchParamsResolved = await searchParams;

  // Fetch all data on the server
  const [allProducts, allCategories] = await Promise.all([
    getAllProducts(),
    getAllCategories(),
  ]);

  // Validate category exists
  const category = allCategories.find(
    (cat: Category) => cat.name.toLowerCase() === slug.toLowerCase()
  );
  if (slug !== "all" && !category) {
    notFound();
  }

  // Get available filter options from ALL products (not filtered) to keep options visible

  const availableBrands = [
    ...new Set(
      allProducts
        .map((p) => {
          // Handle both string and nested brand structures
          const brandName =
            typeof p.brand === "string" ? p.brand : p.brand?.name;
          return brandName;
        })
        .filter(Boolean)
    ),
  ];

  // Server-side filtering and processing
  const filteredProducts = filterProductsOnServer(
    allProducts,
    slug,
    searchParamsResolved
  );

  return (
    <CategoryClient
      slug={slug}
      allProducts={filteredProducts}
      categories={allCategories as DatabaseCategory[]}
      availableBrands={availableBrands}
      searchParams={searchParamsResolved}
    />
  );
}

// Server-side filtering function
function filterProductsOnServer(
  allProducts: any[],
  slug: string,
  searchParams: any
) {
  let filtered = allProducts.slice();

  // Filter by category
  if (slug !== "all") {
    filtered = filtered.filter(
      (p) => p.category && p.category.toLowerCase() === slug.toLowerCase()
    );
  }

  // Apply search filters
  const q = (searchParams.q || "").toLowerCase();
  if (q) {
    const keys = ["title", "description", "brand", "type", "tags"];
    filtered = filtered.filter((p) =>
      keys.some((k) => {
        const val = Array.isArray((p as any)[k])
          ? (p as any)[k].join(" ")
          : String((p as any)[k] ?? "");
        return val.toLowerCase().includes(q);
      })
    );
  }

  // Apply price filters
  const pmin = Number(searchParams.pmin ?? 0);
  const pmax = Number(searchParams.pmax ?? 9999);
  filtered = filtered.filter((p) => p.price >= pmin && p.price <= pmax);

  // Apply type filter
  const type = searchParams.type || "";
  if (type) {
    filtered = filtered.filter(
      (p) => p.type && p.type.toLowerCase() === type.toLowerCase()
    );
  }

  // Apply brand filters - handle nested brand structure
  const brands = (searchParams.brands || "").split(",").filter(Boolean);
  if (brands.length) {
    const set = new Set(brands.map((b: string) => b.toLowerCase()));
    filtered = filtered.filter((p) => {
      // Handle both string and nested brand structures
      const brandName = typeof p.brand === "string" ? p.brand : p.brand?.name;
      return brandName && set.has(brandName.toLowerCase());
    });
  }

  // Apply category filters (for subcategory filtering)
  const category = (searchParams.category || "").split(",").filter(Boolean);
  if (category.length) {
    filtered = filtered.filter((p) => {
      return category.some((label: string) => {
        // This would need to be implemented based on your category structure
        return p.category && p.category.toLowerCase() === label.toLowerCase();
      });
    });
  }

  // Apply sorting
  const sort = searchParams.sort || "";
  switch (sort) {
    case "price-asc":
      filtered.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      filtered.sort((a, b) => b.price - a.price);
      break;
    case "popularity":
      filtered.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
      break;
    case "newest":
      filtered.sort(
        (a, b) =>
          new Date(b.createdAt ?? 0).getTime() -
          new Date(a.createdAt ?? 0).getTime()
      );
      break;
    case "rating":
      filtered.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      break;
    default:
      // Default sorting by popularity
      filtered.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
  }

  return filtered;
}
