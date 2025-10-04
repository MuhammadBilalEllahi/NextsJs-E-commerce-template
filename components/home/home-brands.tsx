import Link from "next/link";

import { Brand } from "@/types";

export function HomeBrands({ brands }: { brands: Brand[] }) {
  // Don't render if no brands
  if (!brands || brands.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {brands.map((brand) => (
        <Link
          key={brand.id}
          href={`/shop/all?brands=${encodeURIComponent(brand.name)}`}
          className="group rounded-2xl border bg-white dark:bg-neutral-900 p-4 hover:shadow-md transition-shadow"
        >
          {brand.logo ? (
            <img
              src={brand.logo}
              alt={brand.name}
              className="mx-auto h-16 w-16 object-contain rounded-xl ring-1 ring-black/5"
            />
          ) : (
            <div className="mx-auto h-16 w-16 rounded-xl ring-1 ring-black/5 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <span className="text-gray-600 dark:text-gray-400 font-semibold text-lg">
                {brand.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="mt-3 text-center font-medium group-hover:text-red-600 text-sm">
            {brand.name}
          </div>
        </Link>
      ))}
    </div>
  );
}
