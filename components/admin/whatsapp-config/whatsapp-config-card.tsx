"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  CheckCircle,
  XCircle,
  AlertCircle,
  Copy,
} from "lucide-react";
import { getWhatsAppConfigStatus } from "@/lib/api/whatsapp/config";

export function WhatsAppConfigCard() {
  const [config, setConfig] = useState<{
    isConfigured: boolean;
    errors: string[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkConfiguration();
  }, []);

  const checkConfiguration = async () => {
    setIsLoading(true);
    try {
      const data = await getWhatsAppConfigStatus();
      setConfig(data as any);
    } catch (error) {
      console.error("Error checking WhatsApp configuration:", error);
      setConfig({
        isConfigured: false,
        errors: ["Failed to check configuration"],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard");
  };

  const envVars = [
    {
      name: "WHATSAPP_ACCESS_TOKEN",
      description: "Your WhatsApp Business API access token",
      required: true,
    },
    {
      name: "WHATSAPP_PHONE_NUMBERid",
      description: "Your WhatsApp Business phone number ID",
      required: true,
    },
    {
      name: "WHATSAPP_API_URL",
      description: "WhatsApp API base URL (optional, defaults to v18.0)",
      required: false,
    },
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            WhatsApp Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Configuration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Configuration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-4">
            {config?.isConfigured ? (
              <>
                <CheckCircle className="h-6 w-6 text-green-600" />
                <Badge
                  variant="default"
                  className="bg-green-100 text-green-800"
                >
                  Configured
                </Badge>
              </>
            ) : (
              <>
                <XCircle className="h-6 w-6 text-red-600" />
                <Badge variant="destructive">Not Configured</Badge>
              </>
            )}
          </div>

          {config?.errors && config.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800 mb-2">
                    Configuration Issues:
                  </h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {config.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <Button onClick={checkConfiguration} variant="outline" size="sm">
            Refresh Status
          </Button>
        </CardContent>
      </Card>

      {/* Environment Variables */}
      <Card>
        <CardHeader>
          <CardTitle>Required Environment Variables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {envVars.map((envVar) => (
              <div key={envVar.name} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono">
                      {envVar.name}
                    </code>
                    {envVar.required && (
                      <Badge variant="destructive" className="text-xs">
                        Required
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(envVar.name)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {envVar.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">
                1. Create WhatsApp Business API App
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                Go to{" "}
                <a
                  href="https://developers.facebook.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Facebook Developers
                </a>{" "}
                and create a new app or use an existing one.
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2">2. Add WhatsApp Business API</h4>
              <p className="text-gray-600 dark:text-gray-400">
                Add the WhatsApp Business API product to your app and configure
                it.
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2">3. Get Your Credentials</h4>
              <p className="text-gray-600 dark:text-gray-400">
                Get your access token from the WhatsApp API settings and your
                phone number ID from the WhatsApp Business phone numbers
                section.
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2">
                4. Add to Environment Variables
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                Add the required environment variables to your{" "}
                <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
                  .env
                </code>{" "}
                file and restart your application.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Test Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Once configured, WhatsApp notifications will be automatically sent
            when:
          </p>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <li>• A new order is placed (order confirmation)</li>
            <li>• Order status is updated by admin (status updates)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
