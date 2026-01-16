"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { CitySelect } from "@/components/ui/city-select";
import { getCountryOptions, getStateOptions, getCityOptions } from "@/lib/geo";
import { DEFAULT_COUNTRY, DEFAULT_STATE } from "@/lib/constants/site";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreateBranchData } from "@/types/types";
import {
  MapPin,
  Phone,
  Mail,
  Building2,
  User,
  Clock,
  Globe,
  MessageCircle,
} from "lucide-react";
import Image from "next/image";

interface BranchCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateBranchData) => Promise<void>;
}

export function BranchCreateModal({
  open,
  onOpenChange,
  onSubmit,
}: BranchCreateModalProps) {
  const [formData, setFormData] = useState<CreateBranchData>({
    name: "",
    address: "",
    phoneNumber: "",
    email: "",
    branchNumber: "",
    location: "",
    city: "",
    state: "",
    country: DEFAULT_COUNTRY,
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
    logo: null as any,
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Geo options for branch location
  const [countryOptions, setCountryOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [stateOptions, setStateOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [cityOptions, setCityOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>("");
  const [selectedStateCode, setSelectedStateCode] = useState<string>("");

  const handleInputChange = (
    field: keyof CreateBranchData,
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
          ...(typeof prev.openingHours?.[day] === "object" &&
          prev.openingHours[day] !== null
            ? prev.openingHours[day]
            : { open: "", close: "", isOpen: true }),
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
      setLogoPreview("");
      setFormData((prev) => ({ ...prev, logo: null as any }));
    }
  };

  // Initialize countries
  useEffect(() => {
    let mounted = true;
    (async () => {
      const countries = await getCountryOptions();
      if (!mounted) return;
      setCountryOptions(countries);
      const def = countries.find(
        (c) => c.label.toLowerCase() === DEFAULT_COUNTRY.toLowerCase()
      );
      if (def) setSelectedCountryCode(def.value);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Load states when country changes
  useEffect(() => {
    let mounted = true;
    if (!selectedCountryCode) {
      setStateOptions([]);
      setSelectedStateCode("");
      setCityOptions([]);
      return;
    }
    (async () => {
      const states = await getStateOptions(selectedCountryCode);
      if (!mounted) return;
      setStateOptions(states);
      const def = states.find(
        (s) => s.label.toLowerCase() === DEFAULT_STATE.toLowerCase()
      );
      if (def) setSelectedStateCode(def.value);
      setFormData((prev) => ({
        ...prev,
        country: countriesLabel(countryOptions, selectedCountryCode),
        state: def?.label || "",
      }));
    })();
    return () => {
      mounted = false;
    };
  }, [selectedCountryCode]);

  // Load cities when state changes
  useEffect(() => {
    let mounted = true;
    if (!selectedCountryCode || !selectedStateCode) {
      setCityOptions([]);
      return;
    }
    (async () => {
      const cities = await getCityOptions(
        selectedCountryCode,
        selectedStateCode
      );
      if (!mounted) return;
      setCityOptions(cities);
    })();
    return () => {
      mounted = false;
    };
  }, [selectedCountryCode, selectedStateCode]);

  const countriesLabel = (
    arr: { value: string; label: string }[],
    value: string
  ) => arr.find((a) => a.value === value)?.label || "";

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Branch name is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.phoneNumber.trim())
      newErrors.phoneNumber = "Phone number is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.branchNumber.trim())
      newErrors.branchNumber = "Branch number is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.postalCode?.trim())
      newErrors.postalCode = "Postal code is required";
    if (!logoFile) newErrors.logo = "Logo is required";

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
      // Reset form
      setFormData({
        name: "",
        address: "",
        phoneNumber: "",
        email: "",
        branchNumber: "",
        location: "",
        city: "",
        state: "",
        country: DEFAULT_COUNTRY,
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
        logo: null as any,
      });
      setLogoFile(null);
      setLogoPreview("");
      setErrors({});
    } catch (error) {
      console.error("Failed to create branch:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      phoneNumber: "",
      email: "",
      branchNumber: "",
      location: "",
      city: "",
      state: "",
      country: DEFAULT_COUNTRY,
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
      logo: null as any,
    });
    setLogoFile(null);
    setLogoPreview("");
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Branch</DialogTitle>
          <DialogDescription>
            Add a new store location with complete details
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
                <Label>Country</Label>
                <select
                  className="w-full h-10 px-3 py-2 rounded border bg-transparent text-sm"
                  value={selectedCountryCode}
                  onChange={(e) => setSelectedCountryCode(e.target.value)}
                  required
                >
                  <option value="">Select country</option>
                  {countryOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>State *</Label>
                <select
                  className="w-full h-10 px-3 py-2 rounded border bg-transparent text-sm"
                  value={selectedStateCode}
                  onChange={(e) => {
                    const code = e.target.value;
                    setSelectedStateCode(code);
                    const label =
                      stateOptions.find((s) => s.value === code)?.label || "";
                    handleInputChange("state", label);
                  }}
                  disabled={!stateOptions.length}
                  required
                >
                  <option value="">Select state/province</option>
                  {stateOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                {errors.state && (
                  <p className="text-sm text-red-500">{errors.state}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>City *</Label>
                <select
                  className="w-full h-10 px-3 py-2 rounded border bg-transparent text-sm"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  disabled={!cityOptions.length}
                  required
                >
                  <option value="">Select city</option>
                  {cityOptions.map((o) => (
                    <option key={o.value} value={o.label}>
                      {o.label}
                    </option>
                  ))}
                </select>
                {errors.city && (
                  <p className="text-sm text-red-500">{errors.city}</p>
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
          <div className="space-y-4 ">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Additional Information
            </h3>

            <div className="flex flex-col">
              <div className="space-y-2">
                <Label htmlFor="manager">Manager</Label>
                <Input
                  id="manager"
                  value={formData.manager}
                  onChange={(e) => handleInputChange("manager", e.target.value)}
                  placeholder="Enter manager name"
                />
              </div>

              <div className="space-y-2 w-full">
                <Label>Opening Hours</Label>
                <div className="space-y-3">
                  {Object.entries(formData.openingHours ?? {}).map(
                    ([day, hours]) => (
                      <div
                        key={day}
                        className="flex items-center gap-3 p-3 border rounded-lg w-full"
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
                              className="w-fit"
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
                              className="w-fit"
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
              <Label htmlFor="logo">Logo Image *</Label>
              <Input
                id="logo"
                type="file"
                accept="image/*"
                onChange={(e) => handleLogoChange(e.target.files?.[0] || null)}
                className={errors.logo ? "border-red-500" : ""}
              />
              {errors.logo && (
                <p className="text-sm text-red-500">{errors.logo}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Upload a logo image for the branch (JPG, PNG, GIF)
              </p>
            </div>

            {logoPreview && (
              <div className="space-y-2">
                <Label>Logo Preview</Label>
                <div className="w-32 h-32 border rounded-lg overflow-hidden">
                  <Image
                    width={128}
                    height={128}
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-full h-full object-cover"
                  />
                </div>
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
              Reset
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Branch"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
