"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Category } from "@/types/types";
import { FiltersSidebar } from "@/components/shop/filters-sidebar";

export function MobileFiltersSheet({
  slug,
  initial,
  onApply,
  categories,
  availableBrands,
}: {
  slug: string;
  initial: { pmin: number; pmax: number; brands: string[]; category: string[] };
  onApply: (
    entries: Record<string, string | number | undefined | null>
  ) => void;
  categories: Category[];
  availableBrands: string[];
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const openListener = () => setOpen(true);
    const resetListener = () =>
      onApply({
        pmin: undefined,
        pmax: undefined,
        type: undefined,
        brands: undefined,
        category: undefined,
        page: undefined,
      });
    window.addEventListener("open-filters", openListener as any);
    window.addEventListener("reset-filters", resetListener as any);
    return () => {
      window.removeEventListener("open-filters", openListener as any);
      window.removeEventListener("reset-filters", resetListener as any);
    };
  }, [onApply]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {/* <Button variant="outline" size="sm" className="md:hidden">
          Open Filters
        </Button> */}
      </SheetTrigger>
      <SheetContent side="left" className="w-[90vw] sm:w-[420px] p-0">
        <SheetHeader className="p-4">
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className="p-4">
          <FiltersSidebar
            slug={slug}
            initial={initial}
            onApply={(e: any) => {
              onApply(e);
              setOpen(false);
            }}
            categories={categories as Category[]}
            availableBrands={availableBrands}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
