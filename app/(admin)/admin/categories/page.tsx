"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  fetchCategories,
  createCategory,
  updateCategory,
} from "@/lib/api/admin/category/categories";
import Image from "next/image";

type Category = {
  id: string;
  name: string;
  parent?: { id: string; name: string };
  description?: string;
  image?: string;
  isActive?: boolean;
};

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [parent, setParent] = useState<string>("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | string | null>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(console.error);
  }, []);

  const openDialog = (cat?: Category) => {
    if (cat) {
      setEditing(cat);
      setName(cat.name);
      setParent(cat.parent?.id || "");
      setDescription(cat.description || "");
      setImage(cat.image || null);
      setIsActive(cat.isActive || false);
    } else {
      setEditing(null);
      setName("");
      setParent("");
      setDescription("");
      setImage(null);
      setIsActive(false);
    }
    setShowDialog(true);
  };

  const saveCategory = async () => {
    if (!name) return;
    try {
      let data: any = {
        name,
        parent: parent || undefined,
        description,
        isActive,
      };

      // handle image upload (if File object)
      if (image && image instanceof File) {
        data.image = image; // Pass File directly
      } else if (typeof image === "string") {
        data.image = image; // old URL
      }

      if (editing) {
        const updated = await updateCategory({ id: editing.id, ...data });
        setCategories((prev) =>
          prev.map((c) => (c.id === editing.id ? updated : c))
        );
      } else {
        const newCat = await createCategory(data);
        setCategories((prev) => [newCat, ...prev]);
      }

      setShowDialog(false);
      setEditing(null);
      setName("");
      setParent("");
      setDescription("");
      setImage(null);
      setIsActive(false);
    } catch (err: any) {
      console.error(err.message);
    }
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>Manage your categories</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => openDialog()}
            className="mb-4 bg-green-600 hover:bg-green-700"
          >
            Add Category
          </Button>

          {showDialog && (
            <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-md w-[400px] space-y-4">
                <h2 className="text-lg font-bold">
                  {editing ? "Edit Category" : "Add Category"}
                </h2>

                <Input
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />

                <select
                  value={parent}
                  onChange={(e) => setParent(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">No parent</option>
                  {categories
                    .filter((c) => !editing || c.id !== editing.id) // can't select itself
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>

                <Input
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium">
                    Category is active
                  </label>
                </div>

                <div>
                  <label className="block mb-1 font-medium">Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      e.target.files && setImage(e.target.files[0])
                    }
                  />
                  {image && typeof image === "string" && (
                    <Image
                      width={128}
                      height={128}
                      src={image || ""}
                      alt="preview"
                      className="mt-2 w-24 h-24 object-cover rounded"
                    />
                  )}
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={saveCategory}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {editing ? "Update" : "Save"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="overflow-x-auto rounded border mt-4">
            <table className="min-w-full text-sm">
              <thead className="bg-neutral-50 dark:bg-neutral-900/40">
                <tr>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Parent</th>
                  <th className="p-3 text-left">Description</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Image</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id} className="border-t">
                    <td className="p-3">{c.name}</td>
                    <td className="p-3">{c.parent?.name || "—"}</td>
                    <td className="p-3">{c.description || "—"}</td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          c.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {c.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-3">
                      {c.image ? (
                        <Image
                          width={128}
                          height={128}
                          src={c.image || ""}
                          alt={c.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="p-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDialog(c)}
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
                {!categories.length && (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-4 text-center text-neutral-500"
                    >
                      No categories
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
