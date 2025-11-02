"use client";

/**
 * AI Description Generator Component
 * Generates product descriptions using MCP tools
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import mcpTools from "@/lib/tools";

interface AIDescriptionGeneratorProps {
  productId: string;
  currentDescription?: string;
  onUpdate?: (description: string) => void;
}

export default function AIDescriptionGenerator({
  productId,
  currentDescription,
  onUpdate,
}: AIDescriptionGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await mcpTools.generateDescription(productId);
      setGenerated(result);
      setShowPreview(true);
    } catch (error) {
      console.error("Error generating description:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (generated && onUpdate) {
      onUpdate(generated.generatedDescription);
      setShowPreview(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-red-600" />
          AI Description Generator
        </h3>
        <Button
          onClick={handleGenerate}
          disabled={loading}
          className="bg-red-600 hover:bg-red-700"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Description
            </>
          )}
        </Button>
      </div>

      {showPreview && generated && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-base">
              AI-Generated Description
              <span className="ml-2 text-sm text-gray-600">
                (Confidence: {(generated.confidence * 100).toFixed(0)}%)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white p-4 rounded-lg">
              <p className="text-gray-800 whitespace-pre-wrap">
                {generated.generatedDescription}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">Keywords</h4>
                <div className="flex flex-wrap gap-2">
                  {generated.keywords.map((keyword: string) => (
                    <span
                      key={keyword}
                      className="text-xs bg-white px-2 py-1 rounded border border-gray-200"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">SEO Data</h4>
                <p className="text-xs text-gray-600">
                  <strong>Title:</strong> {generated.seoTitle}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  <strong>Meta:</strong> {generated.seoDescription}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleApply}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Apply Description
              </Button>
              <Button
                onClick={() => setShowPreview(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentDescription && !showPreview && (
        <div className="text-sm text-gray-600">
          <p className="font-semibold mb-1">Current Description:</p>
          <p className="line-clamp-3">{currentDescription}</p>
        </div>
      )}
    </div>
  );
}

