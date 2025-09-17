import Link from "next/link";
import { Category } from "@/mock_data/mock-data";

export function HomeCategories({ categories }: { categories: Category[] }) {
  console.log("categories in HomeCategories", categories);
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {categories.map((c) => (
        <Link
          key={c.slug}
          href={`/category/${c.slug}`}
          className="group inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-white dark:bg-neutral-900 hover:shadow-md transition-all duration-200 hover:scale-105"
        >
          {c.image && (
            <img
              src={c.image}
              alt={c.name}
              className="h-6 w-6 object-cover rounded-full ring-1 ring-black/5"
            />
          )}
          <span className="font-medium text-sm group-hover:text-red-600 transition-colors">
            {c.name}
          </span>
        </Link>
      ))}
    </div>
  );
}
