"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Upload, Download, AlertCircle, CheckCircle, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ImportResult } from "@/types/types";
import { importProductsCSV } from "@/lib/api/admin/product/import";

export default function CSVImportComponent({
  onImportComplete,
}: {
  onImportComplete?: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (
        selectedFile.type === "text/csv" ||
        selectedFile.name.endsWith(".csv")
      ) {
        setFile(selectedFile);
        setError("");
        setResult(null);
      } else {
        setError("Please select a valid CSV file");
        setFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a CSV file");
      return;
    }

    setIsUploading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("csvFile", file);
      const data = await importProductsCSV(formData);
      setResult(data.results);
      if (onImportComplete) {
        onImportComplete();
      }
    } catch (err: any) {
      setError(err.message || "Failed to upload CSV");
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `Product Name,Description,Ingredients,Price,Discount (%),Slug,Active,Out of Stock,Featured,Top Selling,New Arrival,Best Selling,Special,Brand,Categories,Images,Variant SKU,Variant Label,Variant Slug,Variant Price,Variant Discount (%),Variant Stock,Variant Active,Variant Out of Stock
Sample Product,"Sample product description","Sample ingredients",100,5,sample-product,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,Sample Brand,"Category1, Category2","modern-tech-product.png,placeholder.jpg",SAMPLE-SKU,100g,sample-product-100g,100,5,50,TRUE,FALSE`;

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products-template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const clearResults = () => {
    setResult(null);
    setError("");
    setFile(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Import Products from CSV
        </CardTitle>
        <CardDescription>
          Upload a CSV file to import products and their variants. Download the
          template to see the required format.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Download Template */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={downloadTemplate}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download Template
          </Button>
          <span className="text-sm text-muted-foreground">
            Use this template to format your CSV correctly
          </span>
        </div>

        {/* File Upload */}
        <div className="space-y-2">
          <Input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="cursor-pointer"
          />
          {file && (
            <div className="text-sm text-green-600 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Selected: {file.name}
            </div>
          )}
        </div>

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Import Products
            </>
          )}
        </Button>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results Display */}
        {result && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Import Results</h3>
              <Button variant="outline" size="sm" onClick={clearResults}>
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {result.totalProcessed}
                </div>
                <div className="text-sm text-blue-800">Total Rows</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {result.productsCreated}
                </div>
                <div className="text-sm text-green-800">Products Created</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {result.variantsCreated}
                </div>
                <div className="text-sm text-purple-800">Variants Created</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {result.errors}
                </div>
                <div className="text-sm text-red-800">Errors</div>
              </div>
            </div>

            {/* Error Details */}
            {result.errorDetails && result.errorDetails.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold mb-2">Error Details:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {result.errorDetails.map((error, index) => (
                      <li key={index} className="text-sm">
                        {error}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Success Message */}
            {result.success > 0 && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Successfully imported {result.success} products with{" "}
                  {result.variantsCreated} variants!
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="text-sm text-muted-foreground space-y-2">
          <h4 className="font-semibold">CSV Format Instructions:</h4>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Each row represents a product variant</li>
            <li>
              Products with the same name and slug will be grouped together
            </li>
            <li>
              Brands and categories will be created automatically if they don't
              exist
            </li>
            <li>Boolean values should be TRUE or FALSE</li>
            <li>
              Categories should be comma-separated (e.g., "Spices, Cooking
              Essentials")
            </li>
            <li>All prices should be numeric values</li>
            <li>
              Images can be comma-separated filenames (e.g.,
              "image1.png,image2.png") or left empty for automatic
              category-based image assignment
            </li>
            <li>
              Available images: whole-spices.png, spice-closeup.png,
              garam-masala.png, modern-tech-product.png, jar-of-pickles.png,
              chai-snacks.png, etc.
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
