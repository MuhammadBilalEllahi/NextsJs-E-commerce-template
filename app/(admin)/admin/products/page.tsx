"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Edit,
  Trash2,
  Eye,
  Plus,
  Upload,
  History,
  ImageIcon,
} from "lucide-react";
import ProductsCreateAdminUI from "@/components/admin/product/products-create";
import ProductsEditAdminUI from "@/components/admin/product/products-edit";
import ProductsViewAdminUI from "@/components/admin/product/products-view";
import CSVImportComponent from "@/components/admin/product/csv-import";
import ImportHistoryComponent from "@/components/admin/product/import-history";
import BulkImageManager from "@/components/admin/product/bulk-image-manager";
import { useProducts, Product } from "@/lib/api/admin/product/products";

export default function ProductsTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showImportForm, setShowImportForm] = useState(false);
  const [showHistoryForm, setShowHistoryForm] = useState(false);
  const [showBulkImageForm, setShowBulkImageForm] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedVariants, setSelectedVariants] = useState<string[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  // Use the products service hook
  const { products, loading, error, loadProducts, removeProduct } =
    useProducts();

  useEffect(() => {
    loadProducts();
  }, []);

  // Delete product
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await removeProduct(productId);
      alert("Product deleted successfully");
    } catch (err: any) {
      alert("Error deleting product: " + err.message);
    }
  };

  // View product details
  const viewProduct = (product: Product) => {
    setViewingProduct(product);
    setEditingProduct(null);
    setShowCreateForm(false);
  };

  // Edit product
  const editProduct = (product: Product) => {
    setEditingProduct(product);
    setViewingProduct(null);
    setShowCreateForm(false);
  };

  // Close all forms
  const closeAllForms = () => {
    setShowCreateForm(false);
    setShowImportForm(false);
    setShowHistoryForm(false);
    setShowBulkImageForm(false);
    setEditingProduct(null);
    setViewingProduct(null);
    setSelectedProducts([]);
    setSelectedVariants([]);
  };

  // Filter products based on search term
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>Loading products...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>Error loading products</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-red-500 p-4 bg-red-50 rounded-md">{error}</div>
          <Button onClick={loadProducts} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Products Management</CardTitle>
        <CardDescription>
          View and manage all products in your store
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Search and Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Input
            placeholder="Search products by name, description, or brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowBulkImageForm(!showBulkImageForm)}
              disabled={
                selectedProducts.length === 0 && selectedVariants.length === 0
              }
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              {showBulkImageForm ? "Hide Images" : "Bulk Images"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowHistoryForm(!showHistoryForm)}
            >
              <History className="h-4 w-4 mr-2" />
              {showHistoryForm ? "Hide History" : "Import History"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowImportForm(!showImportForm)}
            >
              <Upload className="h-4 w-4 mr-2" />
              {showImportForm ? "Cancel Import" : "Import CSV"}
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              <Plus className="h-4 w-4 mr-2" />
              {showCreateForm ? "Cancel" : "Add Product"}
            </Button>
          </div>
        </div>

        {/* Product Creation Form */}
        {showCreateForm && <ProductsCreateAdminUI />}

        {/* CSV Import Form */}
        {showImportForm && (
          <CSVImportComponent
            onImportComplete={() => {
              loadProducts();
              setShowImportForm(false);
            }}
          />
        )}

        {/* Import History */}
        {showHistoryForm && (
          <ImportHistoryComponent
            onUndoComplete={() => {
              loadProducts(); // Refresh products after undo
            }}
          />
        )}

        {/* Bulk Image Manager */}
        {showBulkImageForm && (
          <BulkImageManager
            selectedProducts={selectedProducts}
            selectedVariants={selectedVariants}
            onComplete={() => {
              loadProducts(); // Refresh products after image update
              setSelectedProducts([]);
              setSelectedVariants([]);
            }}
          />
        )}

        {/* Right-side Sheet for View/Edit */}
        <Sheet
          open={!!editingProduct || !!viewingProduct}
          onOpenChange={(open) => {
            if (!open) closeAllForms();
          }}
        >
          <SheetContent
            side="right"
            className="w-full sm:max-w-[50vw] p-0 flex flex-col"
          >
            {editingProduct ? (
              <div className="h-full overflow-y-auto ">
                <ProductsEditAdminUI
                  product={editingProduct as any}
                  onClose={closeAllForms}
                  onUpdate={() => {
                    loadProducts();
                    closeAllForms();
                  }}
                />
              </div>
            ) : viewingProduct ? (
              <div className="h-full overflow-y-auto ">
                <ProductsViewAdminUI
                  product={viewingProduct as any}
                  onClose={closeAllForms}
                  onEdit={() => editProduct(viewingProduct)}
                />
              </div>
            ) : null}
          </SheetContent>
        </Sheet>

        {/* Selection Summary */}
        {(selectedProducts.length > 0 || selectedVariants.length > 0) && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="text-sm text-blue-800">
                <strong>
                  {selectedProducts.length + selectedVariants.length}
                </strong>{" "}
                items selected
                {selectedProducts.length > 0 && (
                  <span className="ml-2">
                    ({selectedProducts.length} products
                  </span>
                )}
                {selectedVariants.length > 0 && (
                  <span className="ml-1">
                    {selectedVariants.length} variants)
                  </span>
                )}
                {selectedProducts.length > 0 &&
                  selectedVariants.length === 0 && <span>)</span>}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedProducts([]);
                  setSelectedVariants([]);
                }}
              >
                Clear Selection
              </Button>
            </div>
          </div>
        )}

        {/* Products Table */}
        <div className="rounded-md border">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="border-b">
                <tr className="bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={
                        selectedProducts.length === filteredProducts.length &&
                        filteredProducts.length > 0
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProducts(
                            filteredProducts.map((p) => p.id)
                          );
                        } else {
                          setSelectedProducts([]);
                        }
                      }}
                      className="rounded"
                    />
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Product
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Brand
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Categories
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Price
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Special
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Grocery
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Variants
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Created
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="p-8 text-center text-muted-foreground"
                    >
                      {searchTerm
                        ? "No products found matching your search"
                        : "No products found"}
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-muted/50">
                      <td className="p-4 align-middle">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProducts((prev) => [
                                ...prev,
                                product.id,
                              ]);
                            } else {
                              setSelectedProducts((prev) =>
                                prev.filter((id) => id !== product.id)
                              );
                            }
                          }}
                          className="rounded"
                        />
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-3">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="h-10 w-10 rounded-md object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center">
                              <span className="text-xs text-gray-500">
                                No image
                              </span>
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {product.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        {product.brand?.name || "No brand"}
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex flex-wrap gap-1">
                          {product.categories &&
                          product.categories.length > 0 ? (
                            product.categories.slice(0, 2).map((category) => (
                              <span
                                key={category.id}
                                className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800"
                              >
                                {category.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              No categories
                            </span>
                          )}
                          {product.categories &&
                            product.categories.length > 2 && (
                              <span className="text-xs text-muted-foreground">
                                +{product.categories.length - 2} more
                              </span>
                            )}
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        Rs. {product.price.toFixed(2)}
                      </td>
                      <td className="p-4 align-middle">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            product.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.isActive ? "Active" : "Inactive"}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ml-2 ${
                            product.isOutOfStock
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {product.isOutOfStock ? "Out of Stock" : "In Stock"}
                        </span>
                      </td>
                      <td className="p-4 align-middle">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            product.isSpecial
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {product.isSpecial ? "Yes" : "No"}
                        </span>
                      </td>

                      <td className="p-4 align-middle">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            product.isGrocery
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {product.isGrocery ? "Yes" : "No"}
                        </span>
                      </td>

                      <td className="p-4 align-middle">
                        <div className="space-y-1">
                          {product.variants && product.variants.length > 0 ? (
                            product.variants.slice(0, 3).map((variant: any) => (
                              <div
                                key={variant.id}
                                className="flex items-center gap-2"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedVariants.includes(
                                    variant.id
                                  )}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedVariants((prev) => [
                                        ...prev,
                                        variant.id,
                                      ]);
                                    } else {
                                      setSelectedVariants((prev) =>
                                        prev.filter((id) => id !== variant.id)
                                      );
                                    }
                                  }}
                                  className="rounded h-3 w-3"
                                />
                                <span className="text-xs">
                                  {variant.label} - Rs. {variant.price}
                                </span>
                              </div>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              No variants
                            </span>
                          )}
                          {product.variants && product.variants.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{product.variants.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => viewProduct(product)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => editProduct(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination (optional) */}
        {filteredProducts.length > 0 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {filteredProducts.length} of {products.length} products
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
