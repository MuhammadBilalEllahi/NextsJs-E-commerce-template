"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  ChevronDown,
  ChevronRight,
  Undo2,
  Trash2,
  History,
  Package,
  Tag,
  Calendar,
  User,
  FileText,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ImportHistoryItem } from "@/types/types";
import {
  listImportHistories,
  undoImport,
} from "@/lib/api/admin/product/import-history";

interface ImportHistoryProps {
  onUndoComplete: () => void;
}

export default function ImportHistoryComponent({
  onUndoComplete,
}: ImportHistoryProps) {
  const [histories, setHistories] = useState<ImportHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [undoing, setUndoing] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchHistories = async () => {
    try {
      setLoading(true);
      const data = await listImportHistories(20);
      setHistories(data.histories);
    } catch (err: any) {
      setError(err.message || "Failed to fetch import history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistories();
  }, []);

  const toggleExpanded = (importId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(importId)) {
      newExpanded.delete(importId);
    } else {
      newExpanded.add(importId);
    }
    setExpandedItems(newExpanded);
  };

  const handleUndo = async (
    importId: string,
    type: "import" | "product" | "variant",
    id?: string
  ) => {
    try {
      setUndoing(`${importId}-${type}-${id || "all"}`);
      setError("");

      await undoImport({
        importId,
        productId: type === "product" ? id : undefined,
        variantId: type === "variant" ? id : undefined,
      });

      // Refresh histories
      await fetchHistories();
      onUndoComplete();
    } catch (err: any) {
      setError(err.message || "Failed to undo");
    } finally {
      setUndoing(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Import History
          </CardTitle>
          <CardDescription>
            View and manage your CSV import history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Import History
        </CardTitle>
        <CardDescription>
          View and manage your CSV import history. You can undo entire imports
          or individual products/variants.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {histories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No import history found</p>
            <p className="text-sm">Your CSV imports will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {histories.map((history) => (
              <Card
                key={history.importId}
                className="border-l-4 border-l-blue-500"
              >
                <Collapsible
                  open={expandedItems.has(history.importId)}
                  onOpenChange={() => toggleExpanded(history.importId)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="p-1">
                            {expandedItems.has(history.importId) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            {history.fileName}
                            {history.isUndone && (
                              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                UNDONE
                              </span>
                            )}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-4 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(history.importedAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {history.importedBy.name}
                            </span>
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!history.isUndone && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                disabled={undoing?.startsWith(history.importId)}
                              >
                                {undoing?.startsWith(history.importId) ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                ) : (
                                  <Undo2 className="h-4 w-4 mr-2" />
                                )}
                                Undo All
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Undo Entire Import
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete all products and
                                  variants from this import. This action cannot
                                  be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleUndo(history.importId, "import")
                                  }
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Undo Import
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">
                          {history.totalRows}
                        </div>
                        <div className="text-xs text-blue-800">Total Rows</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-lg font-bold text-green-600">
                          {history.productsCreated}
                        </div>
                        <div className="text-xs text-green-800">Products</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-lg font-bold text-purple-600">
                          {history.variantsCreated}
                        </div>
                        <div className="text-xs text-purple-800">Variants</div>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="text-lg font-bold text-red-600">
                          {history.errorCount}
                        </div>
                        <div className="text-xs text-red-800">Errors</div>
                      </div>
                    </div>
                  </CardHeader>

                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      {/* Error Details */}
                      {history.errorDetails &&
                        history.errorDetails.length > 0 && (
                          <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              <div className="font-semibold mb-2">
                                Import Errors:
                              </div>
                              <ul className="list-disc list-inside space-y-1">
                                {history.errorDetails.map((error, index) => (
                                  <li key={index} className="text-sm">
                                    {error}
                                  </li>
                                ))}
                              </ul>
                            </AlertDescription>
                          </Alert>
                        )}

                      {/* Products List */}
                      <div className="space-y-3">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          Products ({history.products.length})
                        </h4>
                        {history.products.map((product) => (
                          <Card key={product.productId} className="bg-gray-50">
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <div>
                                  <CardTitle className="text-base">
                                    {product.productName}
                                  </CardTitle>
                                  <CardDescription className="text-xs">
                                    Slug: {product.productSlug}
                                  </CardDescription>
                                </div>
                                {!history.isUndone && (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={undoing?.includes(
                                          product.productId
                                        )}
                                      >
                                        <Trash2 className="h-3 w-3 mr-1" />
                                        Undo Product
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>
                                          Undo Product
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This will permanently delete "
                                          {product.productName}" and all its
                                          variants. This action cannot be
                                          undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>
                                          Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() =>
                                            handleUndo(
                                              history.importId,
                                              "product",
                                              product.productId
                                            )
                                          }
                                          className="bg-red-600 hover:bg-red-700"
                                        >
                                          Undo Product
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="space-y-2">
                                <h5 className="text-sm font-medium flex items-center gap-1">
                                  <Tag className="h-3 w-3" />
                                  Variants ({product.variants.length})
                                </h5>
                                <div className="grid gap-2">
                                  {product.variants.map((variant) => (
                                    <div
                                      key={variant.variantId}
                                      className="flex items-center justify-between p-2 bg-white rounded border"
                                    >
                                      <div>
                                        <span className="font-medium text-sm">
                                          {variant.variantLabel}
                                        </span>
                                        <span className="text-xs text-muted-foreground ml-2">
                                          SKU: {variant.variantSku}
                                        </span>
                                      </div>
                                      {!history.isUndone && (
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              disabled={undoing?.includes(
                                                variant.variantId
                                              )}
                                            >
                                              <Trash2 className="h-3 w-3" />
                                            </Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>
                                                Undo Variant
                                              </AlertDialogTitle>
                                              <AlertDialogDescription>
                                                This will permanently delete
                                                variant "{variant.variantLabel}"
                                                (SKU: {variant.variantSku}).
                                                This action cannot be undone.
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel>
                                                Cancel
                                              </AlertDialogCancel>
                                              <AlertDialogAction
                                                onClick={() =>
                                                  handleUndo(
                                                    history.importId,
                                                    "variant",
                                                    variant.variantId
                                                  )
                                                }
                                                className="bg-red-600 hover:bg-red-700"
                                              >
                                                Undo Variant
                                              </AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      {/* Undone Info */}
                      {history.isUndone && (
                        <Alert className="mt-4">
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription>
                            This import was undone on{" "}
                            {formatDate(history.undoneAt!)} by{" "}
                            {history.undoneBy?.name}
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
