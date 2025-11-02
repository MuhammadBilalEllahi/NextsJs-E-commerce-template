"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Save, RotateCcw, Download, Upload } from "lucide-react";

interface LogoPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PackagingConfig {
  logo: LogoPosition;
  baseImage: string;
}

export default function PackagingAdminPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [logoPosition, setLogoPosition] = useState<LogoPosition>({
    x: 50,
    y: 100,
    width: 140,
    height: 100,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [baseImage, setBaseImage] = useState<string>(
    "https://www.dehlimirchmasalajaat.com/public/uploads/all/8fh5fEL5ia9Xse93GmKq2lZy0K1AW7G2bVokpoxt.jpg"
  );
  const [customBaseImage, setCustomBaseImage] = useState<File | null>(null);

  // Canvas dimensions
  const CANVAS_WIDTH = 240;
  const CANVAS_HEIGHT = 300;
  const HANDLE_SIZE = 8;

  // Load base image
  useEffect(() => {
    if (customBaseImage) {
      const reader = new FileReader();
      reader.onload = () => {
        setBaseImage(reader.result as string);
      };
      reader.readAsDataURL(customBaseImage);
    }
  }, [customBaseImage]);

  // Draw function
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw base image
    const baseImg = new Image();
    baseImg.crossOrigin = "anonymous";
    baseImg.src = baseImage;
    baseImg.onload = () => {
      ctx.drawImage(baseImg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw logo if exists
      if (file) {
        const logoImg = new Image();
        logoImg.crossOrigin = "anonymous";
        const reader = new FileReader();
        reader.onload = () => {
          logoImg.src = reader.result as string;
          logoImg.onload = () => {
            ctx.drawImage(
              logoImg,
              logoPosition.x,
              logoPosition.y,
              logoPosition.width,
              logoPosition.height
            );

            // Draw bounding box and handles
            drawBoundingBox(ctx);
          };
        };
        reader.readAsDataURL(file);
      }
    };
  }, [file, logoPosition, baseImage]);

  // Draw bounding box and resize handles
  const drawBoundingBox = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (!file) return;

      const { x, y, width, height } = logoPosition;

      // Bounding box
      ctx.strokeStyle = "#16a34a";
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.strokeRect(x, y, width, height);

      // Corner handles
      const handles = [
        { x: x, y: y, cursor: "nw-resize" }, // top-left
        { x: x + width, y: y, cursor: "ne-resize" }, // top-right
        { x: x + width, y: y + height, cursor: "se-resize" }, // bottom-right
        { x: x, y: y + height, cursor: "sw-resize" }, // bottom-left
      ];

      handles.forEach((handle) => {
        ctx.fillStyle = "#16a34a";
        ctx.fillRect(
          handle.x - HANDLE_SIZE / 2,
          handle.y - HANDLE_SIZE / 2,
          HANDLE_SIZE,
          HANDLE_SIZE
        );
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.strokeRect(
          handle.x - HANDLE_SIZE / 2,
          handle.y - HANDLE_SIZE / 2,
          HANDLE_SIZE,
          HANDLE_SIZE
        );
      });
    },
    [logoPosition, file]
  );

  // Mouse event handlers
  const getMousePos = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const getResizeHandle = useCallback(
    (x: number, y: number): string | null => {
      const { x: logoX, y: logoY, width, height } = logoPosition;

      const handles = [
        { x: logoX, y: logoY, name: "top-left" },
        { x: logoX + width, y: logoY, name: "top-right" },
        { x: logoX + width, y: logoY + height, name: "bottom-right" },
        { x: logoX, y: logoY + height, name: "bottom-left" },
      ];

      for (const handle of handles) {
        if (
          Math.abs(x - handle.x) <= HANDLE_SIZE &&
          Math.abs(y - handle.y) <= HANDLE_SIZE
        ) {
          return handle.name;
        }
      }
      return null;
    },
    [logoPosition]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const mousePos = getMousePos(e);
      const handle = getResizeHandle(mousePos.x, mousePos.y);

      if (handle) {
        // Start resizing
        setIsResizing(true);
        setResizeHandle(handle);
        setDragStart({ x: mousePos.x, y: mousePos.y });
      } else if (
        mousePos.x >= logoPosition.x &&
        mousePos.x <= logoPosition.x + logoPosition.width &&
        mousePos.y >= logoPosition.y &&
        mousePos.y <= logoPosition.y + logoPosition.height
      ) {
        // Start dragging
        setIsDragging(true);
        setDragStart({
          x: mousePos.x - logoPosition.x,
          y: mousePos.y - logoPosition.y,
        });
      }
    },
    [getMousePos, getResizeHandle, logoPosition]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!file) return;

      const mousePos = getMousePos(e);

      if (isDragging) {
        setLogoPosition((prev) => ({
          ...prev,
          x: mousePos.x - dragStart.x,
          y: mousePos.y - dragStart.y,
        }));
      } else if (isResizing && resizeHandle) {
        setLogoPosition((prev) => {
          const newPos = { ...prev };

          switch (resizeHandle) {
            case "top-left":
              newPos.width = prev.x + prev.width - mousePos.x;
              newPos.height = prev.y + prev.height - mousePos.y;
              newPos.x = mousePos.x;
              newPos.y = mousePos.y;
              break;
            case "top-right":
              newPos.width = mousePos.x - prev.x;
              newPos.height = prev.y + prev.height - mousePos.y;
              newPos.y = mousePos.y;
              break;
            case "bottom-right":
              newPos.width = mousePos.x - prev.x;
              newPos.height = mousePos.y - prev.y;
              break;
            case "bottom-left":
              newPos.width = prev.x + prev.width - mousePos.x;
              newPos.height = mousePos.y - prev.y;
              newPos.x = mousePos.x;
              break;
          }

          // Ensure minimum size
          newPos.width = Math.max(20, newPos.width);
          newPos.height = Math.max(20, newPos.height);

          return newPos;
        });
      }
    },
    [file, isDragging, isResizing, resizeHandle, dragStart, getMousePos]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  }, []);

  // Update canvas when logo position changes
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Reset logo position
  const resetLogoPosition = () => {
    setLogoPosition({
      x: 50,
      y: 100,
      width: 140,
      height: 100,
    });
  };

  // Save configuration
  const saveConfiguration = () => {
    const config: PackagingConfig = {
      logo: logoPosition,
      baseImage,
    };

    // Here you would typically send this to your API
    alert("Configuration saved! Check console for details.");
  };

  // Download canvas as image
  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "packaging-preview.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Packaging Design Admin</h1>
        <p className="text-muted-foreground mt-2">
          Upload and position logos on packaging templates
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Canvas Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Packaging Preview</CardTitle>
            <CardDescription>
              Drag the logo to reposition, use corner handles to resize
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="mx-auto rounded border-2 border-gray-200 bg-white cursor-move"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{
                  cursor:
                    isDragging || isResizing
                      ? "grabbing"
                      : file
                      ? "grab"
                      : "default",
                }}
              />

              {!file && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Upload className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Upload a logo to get started</p>
                  </div>
                </div>
              )}
            </div>

            {/* Logo Upload */}
            <div className="mt-4">
              <Label htmlFor="logo-upload">Upload Logo</Label>
              <Input
                id="logo-upload"
                type="file"
                accept="image/*"
                className="mt-2"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>

            {/* Base Image Upload */}
            <div className="mt-4">
              <Label htmlFor="base-upload">Custom Base Image (Optional)</Label>
              <Input
                id="base-upload"
                type="file"
                accept="image/*"
                className="mt-2"
                onChange={(e) =>
                  setCustomBaseImage(e.target.files?.[0] ?? null)
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave empty to use default packaging template
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Controls and Information */}
        <div className="space-y-6">
          {/* Logo Position Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Logo Position & Size</CardTitle>
              <CardDescription>
                Fine-tune logo placement and dimensions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="logo-x">X Position</Label>
                  <Input
                    id="logo-x"
                    type="number"
                    value={logoPosition.x}
                    onChange={(e) =>
                      setLogoPosition((prev) => ({
                        ...prev,
                        x: Number(e.target.value),
                      }))
                    }
                    min={0}
                    max={CANVAS_WIDTH}
                  />
                </div>
                <div>
                  <Label htmlFor="logo-y">Y Position</Label>
                  <Input
                    id="logo-y"
                    type="number"
                    value={logoPosition.y}
                    onChange={(e) =>
                      setLogoPosition((prev) => ({
                        ...prev,
                        y: Number(e.target.value),
                      }))
                    }
                    min={0}
                    max={CANVAS_HEIGHT}
                  />
                </div>
                <div>
                  <Label htmlFor="logo-width">Width</Label>
                  <Input
                    id="logo-width"
                    type="number"
                    value={logoPosition.width}
                    onChange={(e) =>
                      setLogoPosition((prev) => ({
                        ...prev,
                        width: Number(e.target.value),
                      }))
                    }
                    min={20}
                    max={CANVAS_WIDTH}
                  />
                </div>
                <div>
                  <Label htmlFor="logo-height">Height</Label>
                  <Input
                    id="logo-height"
                    type="number"
                    value={logoPosition.height}
                    onChange={(e) =>
                      setLogoPosition((prev) => ({
                        ...prev,
                        height: Number(e.target.value),
                      }))
                    }
                    min={20}
                    max={CANVAS_HEIGHT}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetLogoPosition}
                  className="flex-1"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Position
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadCanvas}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Current Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Current Configuration</CardTitle>
              <CardDescription>Logo position and size data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>X Position:</span>
                  <span className="font-mono">{logoPosition.x}px</span>
                </div>
                <div className="flex justify-between">
                  <span>Y Position:</span>
                  <span className="font-mono">{logoPosition.y}px</span>
                </div>
                <div className="flex justify-between">
                  <span>Width:</span>
                  <span className="font-mono">{logoPosition.width}px</span>
                </div>
                <div className="flex justify-between">
                  <span>Height:</span>
                  <span className="font-mono">{logoPosition.height}px</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between">
                  <span>Canvas Size:</span>
                  <span className="font-mono">
                    {CANVAS_WIDTH} × {CANVAS_HEIGHT}px
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button
            onClick={saveConfiguration}
            className="w-full h-12"
            disabled={!file}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Configuration
          </Button>
        </div>
      </div>
    </div>
  );
}
