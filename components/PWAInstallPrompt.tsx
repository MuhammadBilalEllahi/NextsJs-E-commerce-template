"use client";

/**
 * PWA Install Prompt Component
 * Shows install banner for PWA
 */

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Download, Smartphone } from "lucide-react";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if user already dismissed or installed
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    const isInstalled = window.matchMedia("(display-mode: standalone)").matches;

    if (dismissed || isInstalled) {
      return;
    }

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Listen for beforeinstallprompt event (Android/Chrome)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // For iOS, show after 3 seconds
    if (iOS && !isInstalled) {
      setTimeout(() => setShowPrompt(true), 3000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("PWA installed");
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <Card className="border-2 border-blue-200 shadow-xl">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Smartphone className="h-5 w-5 text-blue-600" />
            </div>

            <div className="flex-1">
              <h3 className="font-bold text-sm mb-1">
                Install Dehli Mirch App
              </h3>
              <p className="text-xs text-gray-600 mb-3">
                {isIOS
                  ? "Tap Share icon, then 'Add to Home Screen' to install the app"
                  : "Install the app for faster access and offline support!"}
              </p>

              {!isIOS && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleInstall}
                    className="flex items-center gap-1"
                  >
                    <Download className="h-3 w-3" />
                    Install
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDismiss}
                  >
                    Later
                  </Button>
                </div>
              )}

              {isIOS && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleDismiss}>
                    Got it
                  </Button>
                </div>
              )}
            </div>

            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


