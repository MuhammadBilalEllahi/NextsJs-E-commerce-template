"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";
import { Brand } from "@/types/types";
import Image from "next/image";

interface BrandDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  brand: Brand | null;
}

export default function BrandDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  brand,
}: BrandDeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error("Error deleting brand:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      onClose();
    }
  };

  if (!brand) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <DialogTitle>Delete Brand</DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to delete this brand? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              {brand.logo ? (
                <Image
                  width={128}
                  height={128}
                  src={brand.logo}
                  alt={brand.name}
                  className="w-12 h-12 rounded-lg object-cover border"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-sm font-medium">
                    {brand.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h3 className="font-semibold">{brand.name}</h3>
                <p className="text-sm text-gray-600">
                  {brand.description || "No description"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Brand"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
