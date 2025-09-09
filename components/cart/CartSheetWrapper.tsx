"use client";
import { useCart } from "@/lib/providers/cartContext";

import { CartSheetUnTriggerable } from "./cart-sheet-notrigger";

export default function CartSheetWrapper() {
  const {
    openCartSheet,
    setOpenCartSheet,
    items,
    isHydrated,
    count,
    isAdding,
  } = useCart();
  console.log("openCartSheet", openCartSheet);

  return (
    <CartSheetUnTriggerable
      open={openCartSheet}
      onOpenChange={setOpenCartSheet}
    />
  );
}
