"use client";
import { useCart } from "@/lib/providers/cartContext";

import { CartSheetUnTriggerable } from "./cart-sheet-notrigger";

export default function CartSheetWrapper() {
  const { openCartSheet, setOpenCartSheet } = useCart();

  return (
    <CartSheetUnTriggerable
      open={openCartSheet}
      onOpenChange={setOpenCartSheet}
    />
  );
}
