"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Plus, Eye, Database } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ContentPage } from "@/types/types";

export default function ContentCreatorPage() {
  const router = useRouter();
  const [contentPages, setContentPages] = useState<ContentPage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContentPages = async () => {
    try {
      const response = await fetch("/api/admin/content");
      const data = await response.json();
      if (response.ok) {
        setContentPages(data);
      }
    } catch (error) {
      console.error("Error fetching content pages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContentPages();
  }, []);

  const handleDelete = async (slug: string) => {
    if (!confirm("Are you sure you want to delete this content page?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/content/${slug}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchContentPages();
        alert("Content page deleted successfully!");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete content page");
      }
    } catch (error) {
      console.error("Error deleting content page:", error);
      alert("An error occurred while deleting the content page");
    }
  };

  const applySeedData = async () => {
    if (
      !confirm(
        "This will create or update all default content pages. Continue?"
      )
    ) {
      return;
    }

    try {
      const response = await fetch("/api/admin/content/seed", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        await fetchContentPages();
        alert(
          `Seed data applied successfully!\nCreated: ${data.results.created}\nUpdated: ${data.results.updated}\nSkipped: ${data.results.skipped}`
        );
      } else {
        alert(data.error || "Failed to apply seed data");
      }
    } catch (error) {
      console.error("Error applying seed data:", error);
      alert("An error occurred while applying seed data");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Content Creator</h1>
        <p className="text-gray-600 mb-4">
          Manage dynamic content pages for your website
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">How to use:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>
              • Click "Apply Seed Data" to create default pages (FAQs, Terms,
              Privacy, etc.)
            </li>
            <li>• Click "New Page" to create custom content pages</li>
            <li>• Click "Edit" to modify existing pages with live preview</li>
            <li>• Click "View" to see how pages appear to users</li>
            <li>• Toggle "Active" status to show/hide pages from users</li>
          </ul>
        </div>
      </div>

      <div className="grid lg:grid-cols-1 gap-6">
        {/* Content Pages List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Content Pages</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" onClick={applySeedData}>
                  <Database className="h-4 w-4 mr-2" />
                  Apply Seed Data
                </Button>
                <Button onClick={() => router.push("/admin/content/create")}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Page
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {contentPages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Database className="h-12 w-12 mx-auto" />
                  </div>
                  <p className="text-gray-500 mb-2">No content pages found</p>
                  <p className="text-sm text-gray-400">
                    Click "Apply Seed Data" to create default pages or "New
                    Page" to create your own
                  </p>
                </div>
              ) : (
                contentPages.map((page) => (
                  <div
                    key={page._id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg truncate">
                            {page.title}
                          </h3>
                          <Badge
                            variant={page.isActive ? "default" : "secondary"}
                            className="flex-shrink-0"
                          >
                            {page.isActive ? "Live" : "Draft"}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">URL:</span> /
                            {page.slug}
                          </p>
                          {page.metaDescription && (
                            <p className="text-sm text-gray-500 line-clamp-2">
                              {page.metaDescription}
                            </p>
                          )}
                          <p className="text-xs text-gray-400">
                            Last updated:{" "}
                            {new Date(page.updatedAt).toLocaleDateString()} at{" "}
                            {new Date(page.updatedAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1 ml-4">
                        <Link href={`/${page.slug}`} target="_blank">
                          <Button variant="outline" size="sm" title="View Page">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(`/admin/content/edit?slug=${page.slug}`)
                          }
                          title="Edit Page"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(page.slug)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Delete Page"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
