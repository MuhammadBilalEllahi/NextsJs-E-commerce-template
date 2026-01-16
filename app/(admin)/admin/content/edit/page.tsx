"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { ArrowLeft, Save, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { fetchContentPageBySlug, updateContentPage } from "@/lib/api/admin/content";
import { UpdateContentPageData } from "@/types/types";

interface ContentPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

function EditContentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");

  const [contentPage, setContentPage] = useState<ContentPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const [formData, setFormData] = useState({
    slug: slug || "",
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

  useEffect(() => {
    if (slug) {
      setFormData((prev) => ({ ...prev, slug }));
      fetchContentPage();
    } else {
      setLoading(false);
    }
  }, [slug]);

  const fetchContentPage = async () => {
    try {
      const data = await fetchContentPageBySlug(slug as string);
      if (data) {
        setContentPage(data);
        setFormData({
          slug: slug || data.slug,
          title: data.title,
          content: data.content,
          metaTitle: data.metaTitle || "",
          metaDescription: data.metaDescription || "",
          isActive: data.isActive,
          parentSlug: data.parentSlug || "",
          sortOrder: data.sortOrder || 0,
          showInFooter: data.showInFooter || false,
          showInHeader: data.showInHeader || false,
        });
      } else {
        alert("Content page not found");
        router.push("/admin/content");
      }
    } catch (error) {
      console.error("Error fetching content page:", error);
      alert("Error loading content page");
      router.push("/admin/content");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    // Basic validation
    if (!formData.title.trim() || !formData.content.trim()) {
      alert("Please fill in all required fields (Title and Content)");
      return;
    }

    setIsSubmitting(true);

    try {
      await updateContentPage(slug as string, formData as UpdateContentPageData);
      setHasUnsavedChanges(false);
      alert("Content page updated successfully!");
      await fetchContentPage();
    } catch (error) {
      console.error("Error updating content page:", error);
      alert("An error occurred while updating the content page");
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (!contentPage) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Content Page Not Found</h1>
          <Link href="/admin/content">
            <Button>Back to Content Manager</Button>
          </Link>
        </div>
      </div>
    );
  }

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
              <h1 className="text-3xl font-bold">Edit Content Page</h1>
              <p className="text-gray-600">Editing: {contentPage.title}</p>
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
        {/* Edit Form */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Edit Content</CardTitle>
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
                    disabled={true}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    URL: /{formData.slug}
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
                    <Save className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Saving..." : "Save Changes"}
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
                      {formData.title}
                    </h1>
                    {formData.metaDescription && (
                      <p className="text-neutral-600 dark:text-neutral-400">
                        {formData.metaDescription}
                      </p>
                    )}
                  </div>

                  {/* Content Preview */}
                  <div className="bg-white dark:bg-neutral-900 rounded-xl p-8 border shadow-sm">
                    <div
                      className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto max-w-none"
                      dangerouslySetInnerHTML={{ __html: formData.content }}
                    />
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

export default function EditContentPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </div>
      }
    >
      <EditContentPageContent />
    </Suspense>
  );
}
