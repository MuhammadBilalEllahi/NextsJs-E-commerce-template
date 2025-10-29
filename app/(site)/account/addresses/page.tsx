"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CitySelect } from "@/components/ui/city-select";
import { getCountryOptions, getStateOptions, getCityOptions } from "@/lib/geo";
import { DEFAULT_COUNTRY, DEFAULT_STATE } from "@/lib/constants/site";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

import {
  Plus,
  Edit,
  Trash2,
  MapPin,
  Home,
  Building,
  CreditCard,
} from "lucide-react";
import { Address } from "@/types/types";

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Geo options and selections
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

  const [formData, setFormData] = useState({
    label: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "Punjab",
    country: "Pakistan",
    postalCode: "",
    phone: "",
    countryCode: "+92",
    isDefault: false,
    isBilling: false,
    isShipping: true,
  });

  // Fetch addresses
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/addresses");
      if (response.ok) {
        const data = await response.json();
        setAddresses(data.addresses || []);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // Initialize countries and select defaults by name
  useEffect(() => {
    let mounted = true;
    (async () => {
      const countries = await getCountryOptions();
      if (!mounted) return;
      setCountryOptions(countries);
      // Find default country code by label match
      const defCountry = countries.find(
        (c) =>
          c.label.toLowerCase() ===
          (DEFAULT_COUNTRY || formData.country).toLowerCase()
      );
      if (defCountry) {
        setSelectedCountryCode(defCountry.value);
        handleInputChange("country", defCountry.label);
      }
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
      // Auto-select default state by name
      const defState = states.find(
        (s) =>
          s.label.toLowerCase() ===
          (DEFAULT_STATE || formData.state).toLowerCase()
      );
      if (defState) {
        setSelectedStateCode(defState.value);
        handleInputChange("state", defState.label);
      } else {
        setSelectedStateCode("");
        handleInputChange("state", "");
      }
      // Reset city when country changes
      setCityOptions([]);
      handleInputChange("city", "");
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      label: "",
      firstName: "",
      lastName: "",
      address: "",
      city: "",
      state: "Punjab",
      country: "Pakistan",
      postalCode: "",
      phone: "",
      countryCode: "+92",
      isDefault: false,
      isBilling: false,
      isShipping: true,
    });
    setEditingAddress(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = editingAddress ? "/api/addresses" : "/api/addresses";
      const method = editingAddress ? "PUT" : "POST";

      const payload = editingAddress
        ? { id: (editingAddress as any).id, ...formData }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        resetForm();
        fetchAddresses();
        alert(
          editingAddress
            ? "Address updated successfully!"
            : "Address added successfully!"
        );
      } else {
        const error = await response.json();
        alert(error.error || "Failed to save address");
      }
    } catch (error) {
      console.error("Error saving address:", error);
      alert("Failed to save address. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (address: Address) => {
    setFormData({
      label: address.label,
      firstName: address.firstName,
      lastName: address.lastName,
      address: address.address,
      city: address.city,
      state: address.state,
      country: address.country,
      postalCode: address.postalCode,
      phone: address.phone,
      countryCode: address.countryCode,
      isDefault: address.isDefault,
      isBilling: address.isBilling,
      isShipping: address.isShipping,
    });
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      const response = await fetch(`/api/addresses?id=${addressId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchAddresses();
        alert("Address deleted successfully!");
      } else {
        alert("Failed to delete address");
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      alert("Failed to delete address. Please try again.");
    }
  };

  const getAddressIcon = (label: string) => {
    switch (label.toLowerCase()) {
      case "home":
        return <Home className="h-4 w-4" />;
      case "office":
        return <Building className="h-4 w-4" />;
      case "billing":
        return <CreditCard className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold mb-4">Loading Addresses...</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Please wait while we fetch your addresses.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Addresses</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Manage your shipping and billing addresses
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Address
        </Button>
      </div>

      {/* Address Form */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {editingAddress ? "Edit Address" : "Add New Address"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="label">Address Label</Label>
                  <Input
                    id="label"
                    required
                    placeholder="Home, Office, etc."
                    value={formData.label}
                    onChange={(e) => handleInputChange("label", e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isDefault"
                      checked={formData.isDefault}
                      onCheckedChange={(checked) =>
                        handleInputChange("isDefault", checked as boolean)
                      }
                    />
                    <Label htmlFor="isDefault">Default Address</Label>
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    required
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    required
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  required
                  placeholder="Street address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
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
                <div>
                  <Label>State/Province</Label>
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
                </div>
                <div>
                  <Label>City</Label>
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
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex">
                  <select
                    className="rounded-l border border-r-0 px-1 py-2 bg-transparent min-w-[80px] text-sm"
                    value={formData.countryCode}
                    onChange={(e) =>
                      handleInputChange("countryCode", e.target.value)
                    }
                  >
                    <option value="+92">🇵🇰 +92</option>
                  </select>
                  <Input
                    id="phone"
                    required
                    placeholder="3XX XXXXXXX"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="rounded-l-none border-l-0"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Address Type</Label>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isShipping"
                      checked={formData.isShipping}
                      onCheckedChange={(checked) =>
                        handleInputChange("isShipping", checked as boolean)
                      }
                    />
                    <Label htmlFor="isShipping">Shipping Address</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isBilling"
                      checked={formData.isBilling}
                      onCheckedChange={(checked) =>
                        handleInputChange("isBilling", checked as boolean)
                      }
                    />
                    <Label htmlFor="isBilling">Billing Address</Label>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting
                    ? "Saving..."
                    : editingAddress
                    ? "Update Address"
                    : "Add Address"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Address List */}
      {addresses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-6xl mb-4">📍</div>
            <h3 className="text-lg font-semibold mb-2">No addresses yet</h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Add your first address to get started with faster checkout.
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Address
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <Card key={(address as any).id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getAddressIcon(address.label)}
                    <CardTitle className="text-lg">{address.label}</CardTitle>
                    {address.isDefault && (
                      <Badge variant="secondary" className="text-xs">
                        Default
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(address)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete((address as any).id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p className="font-medium">
                    {address.firstName} {address.lastName}
                  </p>
                  <p>{address.address}</p>
                  <p>
                    {address.city}, {address.state} {address.postalCode}
                  </p>
                  <p>{address.country}</p>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {address.countryCode} {address.phone}
                  </p>
                </div>
                <div className="flex gap-2 mt-4">
                  {address.isShipping && (
                    <Badge variant="outline" className="text-xs">
                      Shipping
                    </Badge>
                  )}
                  {address.isBilling && (
                    <Badge variant="outline" className="text-xs">
                      Billing
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
