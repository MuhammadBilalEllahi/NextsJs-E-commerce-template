"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { CitySelect } from "@/components/ui/city-select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Branch, UpdateBranchData } from "@/types";
import {
  MapPin,
  Phone,
  Mail,
  Building2,
  User,
  Clock,
  Globe,
  MessageCircle,
  X,
} from "lucide-react";
import Image from "next/image";

interface BranchEditModalProps {
  branch: Branch | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UpdateBranchData) => Promise<void>;
}

export function BranchEditModal({
  branch,
  open,
  onOpenChange,
  onSubmit,
}: BranchEditModalProps) {
  const [formData, setFormData] = useState<UpdateBranchData>({
    id: "",
    name: "",
    address: "",
    phoneNumber: "",
    email: "",
    branchNumber: "",
    location: "",
    city: "",
    state: "",
    country: "Pakistan",
    postalCode: "",
    manager: "",
    openingHours: {
      monday: { open: "09:00", close: "18:00", isOpen: true },
      tuesday: { open: "09:00", close: "18:00", isOpen: true },
      wednesday: { open: "09:00", close: "18:00", isOpen: true },
      thursday: { open: "09:00", close: "18:00", isOpen: true },
      friday: { open: "09:00", close: "18:00", isOpen: true },
      saturday: { open: "09:00", close: "18:00", isOpen: true },
      sunday: { open: "09:00", close: "18:00", isOpen: true },
    },
    description: "",
    website: "",
    whatsapp: "",
    isActive: true,
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form data when branch changes
  useEffect(() => {
    if (branch) {
      setFormData({
        id: branch.id,
        name: branch.name,
        address: branch.address,
        phoneNumber: branch.phoneNumber,
        email: branch.email,
        branchNumber: branch.branchNumber,
        location: branch.location,
        city: branch.city,
        state: branch.state,
        country: branch.country,
        postalCode: branch.postalCode,
        manager: branch.manager || "",
        openingHours: branch.openingHours || {
          monday: { open: "09:00", close: "18:00", isOpen: true },
          tuesday: { open: "09:00", close: "18:00", isOpen: true },
          wednesday: { open: "09:00", close: "18:00", isOpen: true },
          thursday: { open: "09:00", close: "18:00", isOpen: true },
          friday: { open: "09:00", close: "18:00", isOpen: true },
          saturday: { open: "09:00", close: "18:00", isOpen: true },
          sunday: { open: "09:00", close: "18:00", isOpen: true },
        },
        description: branch.description || "",
        website: branch.website || "",
        whatsapp: branch.whatsapp || "",
        isActive: branch.isActive,
      });
      setLogoPreview(branch.logo || "");
      setLogoFile(null);
      setErrors({});
    }
  }, [branch]);

  const handleInputChange = (
    field: keyof UpdateBranchData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleOpeningHoursChange = (
    day: keyof typeof formData.openingHours,
    field: "open" | "close" | "isOpen",
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      openingHours: {
        ...(prev.openingHours ?? {}),
        [day]: {
          ...(prev.openingHours?.[day] ?? {
            open: "09:00",
            close: "18:00",
            isOpen: true,
          }),
          [field]: value,
        },
      },
    }));
  };

  const handleLogoChange = (file: File | null) => {
    setLogoFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setFormData((prev) => ({ ...prev, logo: file }));
    } else {
      // Keep existing logo if no new file is selected
      setFormData((prev) => ({ ...prev, logo: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) newErrors.name = "Branch name is required";
    if (!formData.address?.trim()) newErrors.address = "Address is required";
    if (!formData.phoneNumber?.trim())
      newErrors.phoneNumber = "Phone number is required";
    if (!formData.email?.trim()) newErrors.email = "Email is required";
    if (!formData.branchNumber?.trim())
      newErrors.branchNumber = "Branch number is required";
    if (!formData.location?.trim()) newErrors.location = "Location is required";
    if (!formData.city?.trim()) newErrors.city = "City is required";
    if (!formData.state?.trim()) newErrors.state = "State is required";
    if (!formData.postalCode?.trim())
      newErrors.postalCode = "Postal code is required";

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Website validation
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = "Website must start with http:// or https://";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      // Close modal on success
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update branch:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    if (branch) {
      setFormData({
        id: branch.id,
        name: branch.name,
        address: branch.address,
        phoneNumber: branch.phoneNumber,
        email: branch.email,
        branchNumber: branch.branchNumber,
        location: branch.location,
        city: branch.city,
        state: branch.state,
        country: branch.country,
        postalCode: branch.postalCode,
        manager: branch.manager || "",
        openingHours: branch.openingHours || {
          monday: { open: "09:00", close: "18:00", isOpen: true },
          tuesday: { open: "09:00", close: "18:00", isOpen: true },
          wednesday: { open: "09:00", close: "18:00", isOpen: true },
          thursday: { open: "09:00", close: "18:00", isOpen: true },
          friday: { open: "09:00", close: "18:00", isOpen: true },
          saturday: { open: "09:00", close: "18:00", isOpen: true },
          sunday: { open: "09:00", close: "18:00", isOpen: true },
        },
        description: branch.description || "",
        website: branch.website || "",
        whatsapp: branch.whatsapp || "",
        isActive: branch.isActive,
      });
      setLogoPreview(branch.logo || "");
      setLogoFile(null);
      setErrors({});
    }
  };

  if (!branch) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Branch: {branch.name}</DialogTitle>
          <DialogDescription>
            Update branch information and details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Branch Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter branch name"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="branchNumber">Branch Number *</Label>
              <Input
                id="branchNumber"
                value={formData.branchNumber}
                onChange={(e) =>
                  handleInputChange("branchNumber", e.target.value)
                }
                placeholder="e.g., BR001"
                className={errors.branchNumber ? "border-red-500" : ""}
              />
              {errors.branchNumber && (
                <p className="text-sm text-red-500">{errors.branchNumber}</p>
              )}
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Address Information
            </h3>

            <div className="space-y-2">
              <Label htmlFor="address">Full Address *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Enter complete address"
                rows={3}
                className={errors.address ? "border-red-500" : ""}
              />
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <CitySelect
                  value={formData.city ?? "Lahore"}
                  onChange={(value) => handleInputChange("city", value)}
                  placeholder="Select a city"
                />
                {errors.city && (
                  <p className="text-sm text-red-500">{errors.city}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  placeholder="Enter state"
                  className={errors.state ? "border-red-500" : ""}
                />
                {errors.state && (
                  <p className="text-sm text-red-500">{errors.state}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code *</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) =>
                    handleInputChange("postalCode", e.target.value)
                  }
                  placeholder="Enter postal code"
                  className={errors.postalCode ? "border-red-500" : ""}
                />
                {errors.postalCode && (
                  <p className="text-sm text-red-500">{errors.postalCode}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  placeholder="Enter country"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location/Area *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    handleInputChange("location", e.target.value)
                  }
                  placeholder="e.g., Downtown, Mall Area"
                  className={errors.location ? "border-red-500" : ""}
                />
                {errors.location && (
                  <p className="text-sm text-red-500">{errors.location}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contact Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    handleInputChange("phoneNumber", e.target.value)
                  }
                  placeholder="Enter phone number"
                  className={errors.phoneNumber ? "border-red-500" : ""}
                />
                {errors.phoneNumber && (
                  <p className="text-sm text-red-500">{errors.phoneNumber}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter email address"
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp Number</Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) =>
                    handleInputChange("whatsapp", e.target.value)
                  }
                  placeholder="Enter WhatsApp number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  placeholder="https://example.com"
                  className={errors.website ? "border-red-500" : ""}
                />
                {errors.website && (
                  <p className="text-sm text-red-500">{errors.website}</p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Additional Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="manager">Manager</Label>
                <Input
                  id="manager"
                  value={formData.manager}
                  onChange={(e) => handleInputChange("manager", e.target.value)}
                  placeholder="Enter manager name"
                />
              </div>

              <div className="space-y-2">
                <Label>Opening Hours</Label>
                <div className="space-y-3">
                  {Object.entries(formData.openingHours ?? {}).map(
                    ([day, hours]) => (
                      <div
                        key={day}
                        className="flex items-center gap-3 p-3 border rounded-lg"
                      >
                        <Checkbox
                          id={`${day}_isOpen`}
                          checked={hours.isOpen}
                          onCheckedChange={(checked) =>
                            handleOpeningHoursChange(
                              day as keyof typeof formData.openingHours,
                              "isOpen",
                              checked as boolean
                            )
                          }
                        />
                        <Label
                          htmlFor={`${day}_isOpen`}
                          className="w-20 capitalize font-medium"
                        >
                          {day}
                        </Label>
                        {hours.isOpen && (
                          <>
                            <Input
                              type="time"
                              value={hours.open}
                              onChange={(e) =>
                                handleOpeningHoursChange(
                                  day as keyof typeof formData.openingHours,
                                  "open",
                                  e.target.value
                                )
                              }
                              className="w-24"
                            />
                            <span className="text-muted-foreground">to</span>
                            <Input
                              type="time"
                              value={hours.close}
                              onChange={(e) =>
                                handleOpeningHoursChange(
                                  day as keyof typeof formData.openingHours,
                                  "close",
                                  e.target.value
                                )
                              }
                              className="w-24"
                            />
                          </>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Enter branch description"
                rows={3}
              />
            </div>
          </div>

          {/* Logo Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Branch Logo</h3>

            <div className="space-y-2">
              <Label htmlFor="logo">Update Logo (Optional)</Label>
              <Input
                id="logo"
                type="file"
                accept="image/*"
                onChange={(e) => handleLogoChange(e.target.files?.[0] || null)}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to keep the current logo
              </p>
            </div>

            {logoPreview && (
              <div className="space-y-2">
                <Label>Current Logo</Label>
                <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                  <Image
                    width={128}
                    height={128}
                    src={logoPreview}
                    alt="Branch logo"
                    className="w-full h-full object-cover"
                  />
                  {logoFile && (
                    <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                      <X className="h-3 w-3" />
                    </div>
                  )}
                </div>
                {logoFile && (
                  <p className="text-sm text-blue-600">New logo selected</p>
                )}
              </div>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                handleInputChange("isActive", checked as boolean)
              }
            />
            <Label htmlFor="isActive">Branch is active</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={resetForm}>
              Reset Changes
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Branch"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
