"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Coupon } from "@/types";

export default function PromotionsAdminPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [draft, setDraft] = useState<Coupon>({
    code: "",
    type: "percent",
    amount: 10,
  });
  const add = () => {
    if (!draft.code) return;
    setCoupons((prev) => [
      { ...draft, code: draft.code.toUpperCase() },
      ...prev,
    ]);
    setDraft({ code: "", type: "percent", amount: 10 });
  };
  const remove = (code: string) =>
    setCoupons((prev) => prev.filter((c) => c.code !== code));
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Promotions & Discounts</CardTitle>
          <CardDescription>Create and schedule discount codes</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid md:grid-cols-2 gap-3">
            <div className="rounded border p-3 grid gap-2">
              <div className="grid md:grid-cols-2 gap-2">
                <Input
                  placeholder="Code"
                  value={draft.code}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, code: e.target.value }))
                  }
                />
                <select
                  className="rounded border px-2"
                  value={draft.type}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      type: e.target.value as Coupon["type"],
                    }))
                  }
                >
                  <option value="percent">Percent</option>
                  <option value="fixed">Fixed</option>
                </select>
                <Input
                  type="number"
                  placeholder="Amount"
                  value={draft.amount}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, amount: Number(e.target.value) }))
                  }
                />
                <Input
                  placeholder="Restrict by category (optional)"
                  value={draft.restrict ?? ""}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, restrict: e.target.value }))
                  }
                />
                <Input
                  type="datetime-local"
                  value={draft.starts ?? ""}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, starts: e.target.value }))
                  }
                />
                <Input
                  type="datetime-local"
                  value={draft.ends ?? ""}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, ends: e.target.value }))
                  }
                />
              </div>
              <Button
                className="bg-green-600 hover:bg-green-700 w-fit"
                onClick={add}
              >
                Create Code
              </Button>
            </div>
            <div className="rounded border p-3">
              <h3 className="font-semibold mb-2">Active Codes</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-neutral-50 dark:bg-neutral-900/40">
                    <tr>
                      <th className="p-2 text-left">Code</th>
                      <th className="p-2 text-left">Type</th>
                      <th className="p-2 text-left">Amount</th>
                      <th className="p-2 text-left">Window</th>
                      <th className="p-2 text-left">Restrict</th>
                      <th className="p-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((c) => (
                      <tr key={c.code} className="border-t">
                        <td className="p-2">{c.code}</td>
                        <td className="p-2">{c.type}</td>
                        <td className="p-2">{c.amount}</td>
                        <td className="p-2">
                          {c.starts ? `${c.starts} → ${c.ends ?? ""}` : "—"}
                        </td>
                        <td className="p-2">{c.restrict ?? "—"}</td>
                        <td className="p-2">
                          <button
                            className="text-red-600 hover:underline"
                            onClick={() => remove(c.code)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!coupons.length && (
                      <tr>
                        <td
                          colSpan={6}
                          className="p-3 text-center text-neutral-500"
                        >
                          No coupons
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <p className="text-xs text-neutral-500">
            Restrict by user tiers (VIP, wholesale) by adding checks in your
            pricing logic.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
