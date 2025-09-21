"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { type Product, type Category } from "@/mock_data/mock-data";
import { FiltersSidebar } from "@/components/shop/filters-sidebar";
import { MobileFiltersSheet } from "@/components/shop/mobile-filters-sheet";
import { ViewControls } from "@/components/shop/view-controls";

import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { ProductGrid } from "@/components/product/product-grid";
import { BottomNav } from "../main_comp/bottom-nav";

interface CategoryClientProps {
  slug: string;
  allProducts: Product[];
  categories: Category[];

  availableBrands: string[];
  searchParams: {
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
  };
}

export function CategoryClient({
  slug,
  allProducts = [],
  categories,

  availableBrands,
  searchParams: initialSearchParams,
}: CategoryClientProps) {
  const router = useRouter();
  const sp = useSearchParams();
  const [view, setView] = useState<
    "list" | "grid-2" | "grid-3" | "grid-4" | "single"
  >(
    (sp.get("view") as "list" | "grid-2" | "grid-3" | "grid-4" | "single") ||
      "grid-4"
  );
  const [itemsPerPage, setItemsPerPage] = useState<number>(
    Number(sp.get("itemsPerPage")) || 12
  );

  useEffect(() => {
    const v = sp.get("view");
    if (
      v === "list" ||
      v === "grid-2" ||
      v === "grid-3" ||
      v === "grid-4" ||
      v === "single"
    )
      setView(v);

    const items = Number(sp.get("itemsPerPage"));
    if (items && [12, 20, 24, 36, 48].includes(items)) setItemsPerPage(items);
  }, [sp]);

  // Use server-side filtered products directly
  const filtered = allProducts;

  const updateParam = useCallback(
    (key: string, value?: string | number | null) => {
      const params = new URLSearchParams(sp?.toString());
      if (
        value === undefined ||
        value === null ||
        value === "" ||
        value === "all"
      ) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
      router.replace(`?${params.toString()}`);
    },
    [sp, router]
  );

  const setParams = useCallback(
    (entries: Record<string, string | number | undefined | null>) => {
      const params = new URLSearchParams(sp?.toString());
      Object.entries(entries).forEach(([k, v]) => {
        if (v === undefined || v === null || v === "" || v === "all")
          params.delete(k);
        else params.set(k, String(v));
      });
      router.replace(`?${params.toString()}`);
    },
    [sp, router]
  );

  return (
    <main className="container mx-auto px-2 mb-10">
      <div className="mt-4 flex items-center gap-2 lg:hidden">
        <MobileFiltersSheet
          slug={slug}
          onApply={setParams}
          initial={{
            pmin: Number(sp.get("pmin") ?? 0),
            pmax: Number(sp.get("pmax") ?? 9999),
            brands: (sp.get("brands") || "").split(",").filter(Boolean),
            category: (sp.get("category") || "").split(",").filter(Boolean),
          }}
          categories={categories}
          availableBrands={availableBrands}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)] gap-6">
        <aside className="hidden lg:block">
          <FiltersSidebar
            slug={slug}
            initial={{
              pmin: Number(sp.get("pmin") ?? 0),
              pmax: Number(sp.get("pmax") ?? 9999),

              brands: (sp.get("brands") || "").split(",").filter(Boolean),
              category: (sp.get("category") || "").split(",").filter(Boolean),
            }}
            onApply={setParams}
            categories={categories}
            availableBrands={availableBrands}
          />
        </aside>

        <section className="min-w-0">
          <div className="mb-4">
            <ViewControls
              view={view}
              onViewChange={(newView) => {
                setView(newView);
                updateParam("view", newView);
              }}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={(newItemsPerPage) => {
                setItemsPerPage(newItemsPerPage);
                updateParam("itemsPerPage", newItemsPerPage);
              }}
              sortValue={(sp.get("sort") as any) || "popularity"}
              onSortChange={(v) => updateParam("sort", v)}
            />
          </div>

          <ProductGrid
            products={filtered}
            view={view}
            pageSize={itemsPerPage}
            enableInfinite={true}
          />
          {/* <BottomNav /> */}
        </section>
      </div>
    </main>
  );
}
