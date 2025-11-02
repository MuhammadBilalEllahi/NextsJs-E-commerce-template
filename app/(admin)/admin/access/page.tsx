"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "Super Admin" | "Product Manager" | "Content Editor";
};
export default function AccessAdminPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([
    {
      id: "a1",
      name: "Super Admin",
      email: "admin@dehlimirch.com",
      role: "Super Admin",
    },
    {
      id: "a2",
      name: "Ayesha Khan",
      email: "ayesha@example.com",
      role: "Product Manager",
    },
  ]);
  const [draft, setDraft] = useState<Partial<AdminUser>>({
    name: "",
    email: "",
    role: "Content Editor",
  });
  const add = () => {
    if (!draft.name || !draft.email || !draft.role) return;
    setAdmins((prev) => [
      {
        id: "a" + Math.random().toString(36).slice(2, 7),
        name: draft.name!,
        email: draft.email!,
        role: draft.role as AdminUser["role"],
      },
      ...prev,
    ]);

    setDraft({ name: "", email: "", role: "Content Editor" });
  };
  const setRole = (id: string, role: AdminUser["role"]) =>
    setAdmins((prev) => prev.map((a) => (a.id === id ? { ...a, role } : a)));
  const remove = (id: string) =>
    setAdmins((prev) => prev.filter((a) => a.id !== id));
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Access Control</CardTitle>
          <CardDescription>Manage admin roles and permissions</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="rounded border p-3 grid md:grid-cols-[1fr_1fr_200px_auto] gap-2 bg-card">
            <Input
              placeholder="Name"
              value={draft.name ?? ""}
              onChange={(e) =>
                setDraft((d) => ({ ...d, name: e.target.value }))
              }
            />
            <Input
              type="email"
              placeholder="Email"
              value={draft.email ?? ""}
              onChange={(e) =>
                setDraft((d) => ({ ...d, email: e.target.value }))
              }
            />
            <select
              className="rounded border px-2 py-2 bg-transparent text-foreground"
              value={draft.role ?? "Content Editor"}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  role: e.target.value as AdminUser["role"],
                }))
              }
            >
              <option>Super Admin</option>
              <option>Product Manager</option>
              <option>Content Editor</option>
            </select>
            <Button className="bg-green-600 hover:bg-green-700" onClick={add}>
              Invite
            </Button>
          </div>
          <div className="overflow-x-auto rounded border">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Role</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((a) => (
                  <tr key={a.id} className="border-t">
                    <td className="p-3">{a.name}</td>
                    <td className="p-3">{a.email}</td>
                    <td className="p-3">
                      <select
                        className="rounded border bg-transparent px-2 py-1 text-foreground"
                        value={a.role}
                        onChange={(e) =>
                          setRole(a.id, e.target.value as AdminUser["role"])
                        }
                      >
                        <option>Super Admin</option>
                        <option>Product Manager</option>
                        <option>Content Editor</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <button
                        className="text-destructive hover:underline"
                        onClick={() => remove(a.id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
                {!admins.length && (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-4 text-center text-muted-foreground"
                    >
                      No admins
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground">
            Hook into your auth provider for real RBAC and activity logs.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
