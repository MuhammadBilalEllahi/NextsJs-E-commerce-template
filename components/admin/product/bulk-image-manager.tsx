"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ImageIcon,
  Upload,
  Shuffle,
  Plus,
  Trash2,
  CheckSquare,
  Square,
  Loader2,
  X,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";

import { RandomImage } from "@/types";

interface BulkImageManagerProps {
  selectedProducts: string[];
  selectedVariants: string[];
  onComplete: () => void;
}

export default function BulkImageManager({
  selectedProducts,
  selectedVariants,
  onComplete,
}: BulkImageManagerProps) {
  const [images, setImages] = useState<RandomImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [operation, setOperation] = useState<"replace" | "add">("replace");
  const [category, setCategory] = useState("all");
  const [randomCount, setRandomCount] = useState(2);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadCategory, setUploadCategory] = useState("general");
  const [uploadTags, setUploadTags] = useState("");

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "spices", label: "Spices" },
    { value: "cooking-essentials", label: "Cooking Essentials" },
    { value: "health-products", label: "Health Products" },
    { value: "rice", label: "Rice" },
    { value: "staples", label: "Staples" },
    { value: "lentils", label: "Lentils" },
    { value: "masala-blends", label: "Masala Blends" },
    { value: "dairy", label: "Dairy" },
    { value: "beverages", label: "Beverages" },
    { value: "flour", label: "Flour" },
    { value: "south-indian", label: "South Indian" },
    { value: "sweeteners", label: "Sweeteners" },
    { value: "general", label: "General" },
  ];

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/random-images?category=${category}&limit=50`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch images");
      }

      setImages(data.images);
    } catch (err: any) {
      setError(err.message || "Failed to fetch images");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [category]);

  const handleImageSelect = (imageUrl: string) => {
    setSelectedImages((prev) =>
      prev.includes(imageUrl)
        ? prev.filter((url) => url !== imageUrl)
        : [...prev, imageUrl]
    );
  };

  const handleApplyImages = async (useRandom = false) => {
    if (!useRandom && selectedImages.length === 0) {
      setError("Please select at least one image");
      return;
    }

    if (selectedProducts.length === 0 && selectedVariants.length === 0) {
      setError("Please select at least one product or variant");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await fetch("/api/admin/product/bulk-images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productIds: selectedProducts,
          variantIds: selectedVariants,
          imageUrls: useRandom ? null : selectedImages,
          operation: useRandom ? "random" : operation,
          category: useRandom ? category : null,
          randomCount: useRandom ? randomCount : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to apply images");
      }

      setSuccess(
        `Images applied successfully! Updated ${data.results.productsUpdated} products and ${data.results.variantsUpdated} variants.`
      );
      setSelectedImages([]);
      onComplete();
    } catch (err: any) {
      setError(err.message || "Failed to apply images");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadImages = async () => {
    if (uploadFiles.length === 0) {
      setError("Please select files to upload");
      return;
    }

    try {
      setUploading(true);
      setError("");

      const formData = new FormData();
      uploadFiles.forEach((file) => {
        formData.append("images", file);
      });
      formData.append("category", uploadCategory);
      formData.append("tags", uploadTags);

      const response = await fetch("/api/admin/random-images", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload images");
      }

      setSuccess(`Successfully uploaded ${data.uploaded} images!`);
      setUploadFiles([]);
      setUploadCategory("general");
      setUploadTags("");
      setShowUploadDialog(false);
      fetchImages(); // Refresh images list
    } catch (err: any) {
      setError(err.message || "Failed to upload images");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      const response = await fetch(`/api/admin/random-images?id=${imageId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete image");
      }

      setSuccess("Image deleted successfully!");
      fetchImages(); // Refresh images list
    } catch (err: any) {
      setError(err.message || "Failed to delete image");
    }
  };

  const totalSelected = selectedProducts.length + selectedVariants.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Bulk Image Manager
        </CardTitle>
        <CardDescription>
          Apply images to {totalSelected} selected items (
          {selectedProducts.length} products, {selectedVariants.length}{" "}
          variants)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Operation Controls */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="replace"
                checked={operation === "replace"}
                onCheckedChange={() => setOperation("replace")}
              />
              <label htmlFor="replace" className="text-sm font-medium">
                Replace existing images
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="add"
                checked={operation === "add"}
                onCheckedChange={() => setOperation("add")}
              />
              <label htmlFor="add" className="text-sm font-medium">
                Add to existing images
              </label>
            </div>
          </div>

          {/* Quick Random Image Application */}
          <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Shuffle className="h-4 w-4" />
              <span className="font-medium">Quick Random Images:</span>
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              min="1"
              max="5"
              value={randomCount}
              onChange={(e) => setRandomCount(parseInt(e.target.value) || 2)}
              className="w-20"
            />
            <Button
              onClick={() => handleApplyImages(true)}
              disabled={loading || totalSelected === 0}
              variant="outline"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Shuffle className="h-4 w-4 mr-2" />
              )}
              Apply Random
            </Button>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Select Images</h3>
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Upload New Images
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Upload Random Images</DialogTitle>
                  <DialogDescription>
                    Upload images that can be used for products and variants
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) =>
                      setUploadFiles(Array.from(e.target.files || []))
                    }
                  />
                  <Select
                    value={uploadCategory}
                    onValueChange={setUploadCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.slice(1).map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Tags (comma-separated)"
                    value={uploadTags}
                    onChange={(e) => setUploadTags(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleUploadImages}
                    disabled={uploading || uploadFiles.length === 0}
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Upload
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {images.map((image) => (
                <div
                  key={image.id}
                  className={`relative border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                    selectedImages.includes(image.url)
                      ? "border-blue-500 ring-2 ring-blue-200"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleImageSelect(image.url)}
                >
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-24 object-cover"
                  />
                  <div className="absolute top-1 left-1">
                    {selectedImages.includes(image.url) ? (
                      <CheckSquare className="h-4 w-4 text-blue-600 bg-white rounded" />
                    ) : (
                      <Square className="h-4 w-4 text-gray-400 bg-white rounded" />
                    )}
                  </div>
                  <div className="absolute top-1 right-1">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Image</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this image? This
                            action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteImage(image.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  <div className="p-2 bg-white">
                    <p className="text-xs font-medium truncate">{image.name}</p>
                    <p className="text-xs text-gray-500">
                      {image.category.toString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Apply Selected Images */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-600">
            {selectedImages.length} image(s) selected
          </div>
          <Button
            onClick={() => handleApplyImages(false)}
            disabled={
              loading || selectedImages.length === 0 || totalSelected === 0
            }
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ImageIcon className="h-4 w-4 mr-2" />
            )}
            Apply Selected Images
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
