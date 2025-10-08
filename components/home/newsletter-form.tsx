"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [sent, setSent] = useState(false);
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 2500);
  };
  return (
    <form
      onSubmit={onSubmit}
      className={compact ? "flex gap-2" : "space-y-2 max-w-md"}
    >
      {!compact && (
        <div className="text-sm">Get offers and recipes in your inbox.</div>
      )}
      <div className={compact ? "flex gap-2 w-full" : "flex gap-2"}>
        <Input type="email" placeholder="you@example.com" required />
        <Button className="bg-primary hover:bg-primary/90">
          {sent ? "Subscribed" : "Subscribe"}
        </Button>
      </div>
    </form>
  );
}
