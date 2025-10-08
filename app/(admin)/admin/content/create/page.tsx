"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { ArrowLeft, Save, Eye, EyeOff, Plus } from "lucide-react";
import Link from "next/link";

export default function CreateContentPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const [formData, setFormData] = useState({
    slug: "",
    title: "",
    content: "",
    metaTitle: "",
    metaDescription: "",
    isActive: true,
    parentSlug: "",
    sortOrder: 0,
    showInFooter: false,
    showInHeader: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    // Basic validation
    if (
      !formData.slug.trim() ||
      !formData.title.trim() ||
      !formData.content.trim()
    ) {
      alert("Please fill in all required fields (Slug, Title, and Content)");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Content page created successfully!");
        router.push("/admin/content");
      } else {
        alert(data.error || "Failed to create content page");
      }
    } catch (error) {
      console.error("Error creating content page:", error);
      alert("An error occurred while creating the content page");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (
        !confirm("You have unsaved changes. Are you sure you want to go back?")
      ) {
        return;
      }
    }
    router.push("/admin/content");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/content">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Create New Content Page</h1>
              <p className="text-gray-600">Create a new dynamic content page</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Hide Preview
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Show Preview
                </>
              )}
            </Button>
          </div>
        </div>

        {hasUnsavedChanges && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ You have unsaved changes
            </p>
          </div>
        )}
      </div>

      <div
        className={`grid gap-6 ${
          showPreview ? "lg:grid-cols-2" : "lg:grid-cols-1"
        }`}
      >
        {/* Create Form */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Create Content</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleFormChange("slug", e.target.value)}
                    placeholder="privacy-policy"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    URL: /{formData.slug || "your-slug"}
                  </p>
                </div>

                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleFormChange("title", e.target.value)}
                    placeholder="Privacy Policy"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    value={formData.metaTitle}
                    onChange={(e) =>
                      handleFormChange("metaTitle", e.target.value)
                    }
                    placeholder="SEO title (optional)"
                  />
                </div>

                <div>
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    value={formData.metaDescription}
                    onChange={(e) =>
                      handleFormChange("metaDescription", e.target.value)
                    }
                    placeholder="SEO description (optional)"
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Content *</Label>
                  <div className="border rounded-lg">
                    <RichTextEditor
                      content={formData.content}
                      onChange={(content) =>
                        handleFormChange("content", content)
                      }
                      placeholder="Enter your content here..."
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Use the toolbar above to format your content. Changes are
                    not saved until you click the Save button.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="parentSlug">Parent Page</Label>
                    <Input
                      id="parentSlug"
                      value={formData.parentSlug}
                      onChange={(e) =>
                        handleFormChange("parentSlug", e.target.value)
                      }
                      placeholder="company, legal, support (optional)"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Leave empty for top-level pages
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="sortOrder">Sort Order</Label>
                    <Input
                      id="sortOrder"
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) =>
                        handleFormChange(
                          "sortOrder",
                          parseInt(e.target.value) || 0
                        )
                      }
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Lower numbers appear first
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) =>
                        handleFormChange("isActive", e.target.checked)
                      }
                      className="rounded"
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showInFooter"
                      checked={formData.showInFooter}
                      onChange={(e) =>
                        handleFormChange("showInFooter", e.target.checked)
                      }
                      className="rounded"
                    />
                    <Label htmlFor="showInFooter">Show in Footer</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showInHeader"
                      checked={formData.showInHeader}
                      onChange={(e) =>
                        handleFormChange("showInHeader", e.target.checked)
                      }
                      className="rounded"
                    />
                    <Label htmlFor="showInHeader">Show in Header</Label>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Creating..." : "Create Page"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        {showPreview && (
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
                <p className="text-sm text-gray-600">
                  This is how your page will appear to users
                </p>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-6 bg-white">
                  {/* Page Header */}
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">
                      {formData.title || "Your Page Title"}
                    </h1>
                    {formData.metaDescription && (
                      <p className="text-neutral-600 dark:text-neutral-400">
                        {formData.metaDescription}
                      </p>
                    )}
                  </div>

                  {/* Content Preview */}
                  <div className="bg-white dark:bg-neutral-900 rounded-xl p-8 border shadow-sm">
                    {formData.content ? (
                      <div
                        className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto max-w-none"
                        dangerouslySetInnerHTML={{ __html: formData.content }}
                      />
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        <p>Start typing your content to see the preview...</p>
                      </div>
                    )}
                  </div>

                  {/* Navigation */}
                  <div className="mt-8 text-center">
                    <Link href="/" className="text-primary hover:underline">
                      ← Back to Home
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
