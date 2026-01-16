"use client";

import { useCart } from "@/lib/providers/cartContext";
import { useAuth } from "@/lib/providers/authProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { CitySelect } from "@/components/ui/city-select";
import { getCountryOptions, getStateOptions, getCityOptions } from "@/lib/geo";
import { DEFAULT_COUNTRY, DEFAULT_PHONE_CODE, DEFAULT_STATE, DEFAULT_CITY } from "@/lib/constants/site";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  HelpCircle,
  Lock,
  MapPin,
  Home,
  Building,
  CreditCard,
  Plus,
  Edit,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/constants/currency";
import Image from "next/image";
import { listAddresses, saveAddress } from "@/lib/api/account/addresses";
import { getShippingMethods } from "@/lib/api/shipping";
import { createCheckout } from "@/lib/api/checkout";

export default function CheckoutPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [buyNowItem, setBuyNowItem] = useState<any>(null);
  const [isBuyNow, setIsBuyNow] = useState(false);

  // Check for buy now on mount
  useEffect(() => {
    const buyNowParam = new URLSearchParams(window.location.search).get(
      "buyNow"
    );
    if (buyNowParam === "true") {
      const stored = sessionStorage.getItem("buyNowItem");
      if (stored) {
        try {
          const item = JSON.parse(stored);
          setBuyNowItem(item);
          setIsBuyNow(true);
        } catch (e) {
          console.error("Failed to parse buyNowItem:", e);
        }
      }
    }
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [shippingMethod, setShippingMethod] = useState("home_delivery");
  const [billingAddress, setBillingAddress] = useState("same");
  const [emailNewsletter, setEmailNewsletter] = useState(true);
  const [saveInfo, setSaveInfo] = useState(true);
  const { items, subtotal, clear, syncAll } = useCart();

  // Calculate items and subtotal based on buy now or cart
  const displayItems = isBuyNow && buyNowItem ? [buyNowItem] : items;
  const displaySubtotal =
    isBuyNow && buyNowItem ? buyNowItem.price * buyNowItem.qty : subtotal;

  // Address management states
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [addressMode, setAddressMode] = useState("manual"); // "saved" or "manual"
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    email: user?.email || "",
    phone: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postal: "",
    countryCode: DEFAULT_PHONE_CODE,
    phoneNumber: "",
  });

  // Billing address form data
  const [billingFormData, setBillingFormData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postal: "",
    countryCode: DEFAULT_PHONE_CODE,
    phoneNumber: "",
  });

  // Shipping methods and costs
  const [shippingMethods, setShippingMethods] = useState([]);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState(null);
  const [shippingFee, setShippingFee] = useState(0);
  const [tcsFee, setTcsFee] = useState(0);
  const [orderTotal, setOrderTotal] = useState(displaySubtotal);

  // Geo options and selections for shipping form
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

  // Geo options for billing when different
  const [billingCountryOptions, setBillingCountryOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [billingStateOptions, setBillingStateOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [billingCityOptions, setBillingCityOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [billingSelectedCountryCode, setBillingSelectedCountryCode] =
    useState<string>("");
  const [billingSelectedStateCode, setBillingSelectedStateCode] =
    useState<string>("");

  const syncCartBackend = async () => {
    await syncAll();
  };

  // Fetch saved addresses for authenticated users
  const fetchSavedAddresses = async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoadingAddresses(true);
      const data = await listAddresses();
      if (data) {
        setSavedAddresses(data.addresses || []);

        // Auto-select default address if available
        const defaultAddress = data.addresses?.find(
          (addr: any) => addr.isDefault
        );
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
          setAddressMode("saved");
          populateFormFromAddress(defaultAddress);
        }
      }
    } catch (error) {
      console.error("Failed to fetch saved addresses:", error);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  // Populate form data from selected address
  const populateFormFromAddress = (address: any) => {
    setFormData((prev) => ({
      ...prev,
      firstName: address.firstName,
      lastName: address.lastName,
      address: address.address,
      city: address.city,
      postal: address.postalCode || "",
      phoneNumber: address.phone.replace("+92", ""),
    }));
  };

  useEffect(() => {
    if (!isBuyNow) {
      syncCartBackend();
    }
    fetchSavedAddresses();
  }, [isAuthenticated, isBuyNow]);

  const fetchShippingMethods = async () => {
    try {
      const params = new URLSearchParams({
        city: formData.city,
        state: DEFAULT_STATE,
        country: DEFAULT_COUNTRY,
        subtotal: displaySubtotal.toString(),
      });

      const data = await getShippingMethods({
        city: formData.city,
        state: DEFAULT_STATE,
        country: DEFAULT_COUNTRY,
        subtotal: displaySubtotal,
      });
      if (data) {
        setShippingMethods(data.methods);

        // Auto-select appropriate shipping method
        const homeDelivery = data.methods.find(
          (m: any) => m.type === "home_delivery"
        );
        const tcs = data.methods.find((m: any) => m.type === "tcs");

        if (formData.city.toLowerCase() === DEFAULT_CITY.toLowerCase() && homeDelivery) {
          setSelectedShippingMethod(homeDelivery);
          setShippingFee(homeDelivery.shippingFee);
          setTcsFee(homeDelivery.tcsFee);
          setShippingMethod("home_delivery");
        } else if (tcs) {
          setSelectedShippingMethod(tcs);
          setShippingFee(tcs.shippingFee);
          setTcsFee(tcs.tcsFee);
          setShippingMethod("tcs");
        }
      }
    } catch (error) {
      console.error("Failed to fetch shipping methods:", error);
    }
  };

  // Calculate total with shipping fees
  useEffect(() => {
    setOrderTotal(displaySubtotal + shippingFee + tcsFee);
  }, [displaySubtotal, shippingFee, tcsFee]);

  // Fetch shipping methods when city changes
  useEffect(() => {
    if (formData.city) {
      fetchShippingMethods();
    }
  }, [formData.city]);

  // Set default city to Lahore if not set
  useEffect(() => {
    if (!formData.city) {
      setFormData((prev) => ({ ...prev, city: DEFAULT_CITY }));
    }
  }, []);

  // Initialize shipping countries and defaults
  useEffect(() => {
    let mounted = true;
    (async () => {
      const countries = await getCountryOptions();
      if (!mounted) return;
      setCountryOptions(countries);
      const defCountry = countries.find(
        (c) => c.label.toLowerCase() === DEFAULT_COUNTRY.toLowerCase()
      );
      if (defCountry) {
        setSelectedCountryCode(defCountry.value);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Load shipping states when country changes
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
      const defState = states.find(
        (s) => s.label.toLowerCase() === DEFAULT_STATE.toLowerCase()
      );
      if (defState) {
        setSelectedStateCode(defState.value);
      } else {
        setSelectedStateCode("");
      }
      setCityOptions([]);
      setFormData((prev) => ({ ...prev, state: defState?.label || "" }));
    })();
    return () => {
      mounted = false;
    };
  }, [selectedCountryCode]);

  // Load shipping cities when state changes
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

  // Initialize billing countries when different billing selected
  useEffect(() => {
    let mounted = true;
    if (billingAddress !== "different") return;
    (async () => {
      const countries = await getCountryOptions();
      if (!mounted) return;
      setBillingCountryOptions(countries);
      const defCountry = countries.find(
        (c) => c.label.toLowerCase() === DEFAULT_COUNTRY.toLowerCase()
      );
      if (defCountry) setBillingSelectedCountryCode(defCountry.value);
    })();
    return () => {
      mounted = false;
    };
  }, [billingAddress]);

  // Load billing states when billing country changes
  useEffect(() => {
    let mounted = true;
    if (!billingSelectedCountryCode) {
      setBillingStateOptions([]);
      setBillingSelectedStateCode("");
      setBillingCityOptions([]);
      return;
    }
    (async () => {
      const states = await getStateOptions(billingSelectedCountryCode);
      if (!mounted) return;
      setBillingStateOptions(states);
      const defState = states.find(
        (s) => s.label.toLowerCase() === DEFAULT_STATE.toLowerCase()
      );
      if (defState) setBillingSelectedStateCode(defState.value);
      setBillingCityOptions([]);
    })();
    return () => {
      mounted = false;
    };
  }, [billingSelectedCountryCode]);

  // Load billing cities when billing state changes
  useEffect(() => {
    let mounted = true;
    if (!billingSelectedCountryCode || !billingSelectedStateCode) {
      setBillingCityOptions([]);
      return;
    }
    (async () => {
      const cities = await getCityOptions(
        billingSelectedCountryCode,
        billingSelectedStateCode
      );
      if (!mounted) return;
      setBillingCityOptions(cities);
    })();
    return () => {
      mounted = false;
    };
  }, [billingSelectedCountryCode, billingSelectedStateCode]);

  // Update email when user data becomes available
  useEffect(() => {
    if (user?.email && user.email !== formData.email) {
      setFormData((prev) => ({ ...prev, email: user.email }));
    }
  }, [user?.email, formData.email]);

  // Auto-copy shipping address to billing when switching to different billing
  useEffect(() => {
    if (billingAddress === "different" && !billingFormData.firstName) {
      copyShippingToBilling();
    } else if (billingAddress === "same") {
      // Reset billing form when switching back to same as shipping
      setBillingFormData({
        firstName: "",
        lastName: "",
        address: "",
        city: "",
        postal: "",
        countryCode: DEFAULT_PHONE_CODE,
        phoneNumber: "",
      });
    }
  }, [billingAddress]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate billing address if different billing is selected
    if (billingAddress === "different") {
      if (
        !billingFormData.firstName ||
        !billingFormData.lastName ||
        !billingFormData.address ||
        !billingFormData.city
      ) {
        alert("Please fill in all required billing address fields");
        return;
      }
    }

    setIsSubmitting(true);

    // Save address if user is authenticated and wants to save info
    if (isAuthenticated && saveInfo && addressMode === "manual") {
      await saveNewAddress();
    }

    try {
      const orderData = {
        contact: {
          email: formData.email,
          phone: formData.countryCode + formData.phoneNumber,
          marketingOptIn: emailNewsletter,
        },
        shippingMethod: shippingMethod,
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postal,
          phone: formData.countryCode + formData.phoneNumber,
          country: "PK",
        },
        billingAddress:
          billingAddress === "same"
            ? null
            : {
                firstName: billingFormData.firstName || formData.firstName,
                lastName: billingFormData.lastName || formData.lastName,
                address: billingFormData.address || formData.address,
                city: billingFormData.city || formData.city,
                postalCode: billingFormData.postal || formData.postal,
                phone:
                  billingFormData.countryCode + billingFormData.phoneNumber ||
                  formData.countryCode + formData.phoneNumber,
                country: "PK",
              },
        items: displayItems.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          qty: item.qty,
          price: item.price,
          variantLabel: item.variantLabel,
        })),
        subtotal: displaySubtotal,
        shippingFee,
        total: orderTotal,
        userId: user?.id || null,
        sessionId: !user ? localStorage.getItem("dm-guest-id") : null,
      };

      try {
        const result = await createCheckout(orderData);
        if (!isBuyNow) {
          sessionStorage.removeItem("buyNowItem");
        } else {
          clear();
        }
        router.push(
          `/order/success?orderId=${result.orderId}&refId=${result.refId}`
        );
      } catch (e) {
        throw e;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Checkout failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (displayItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Checkout</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            Your cart is empty.
          </p>
          <Link href="/shop/all">
            <Button className="bg-green-600 hover:bg-green-700">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBillingInputChange = (field: string, value: string) => {
    setBillingFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Copy shipping address to billing address
  const copyShippingToBilling = () => {
    setBillingFormData({
      firstName: formData.firstName,
      lastName: formData.lastName,
      address: formData.address,
      city: formData.city,
      postal: formData.postal,
      countryCode: formData.countryCode,
      phoneNumber: formData.phoneNumber,
    });
  };

  // Handle address selection from saved addresses
  const handleAddressSelection = (addressId: string) => {
    setSelectedAddressId(addressId);
    const selectedAddress = savedAddresses.find(
      (addr: any) => addr.id === addressId
    );
    if (selectedAddress) {
      populateFormFromAddress(selectedAddress);
    }
  };

  // Save new address during checkout
  const saveNewAddress = async () => {
    if (!isAuthenticated || !saveInfo) return;

    try {
      const addressData = {
        label: "Home", // Default label
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: formData.address,
        city: formData.city,
        state: DEFAULT_STATE, // Default state
        country: DEFAULT_COUNTRY,
        postalCode: formData.postal,
        phone: formData.countryCode + formData.phoneNumber,
        countryCode: formData.countryCode,
        isDefault: savedAddresses.length === 0, // Set as default if it's the first address
        isShipping: true,
        isBilling: true,
      };

      await saveAddress(addressData);
      await fetchSavedAddresses();
    } catch (error) {
      console.error("Failed to save address:", error);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/cart"
              className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to cart
            </Link>
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-bold">Checkout</h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Complete your order
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Section */}
              <section className="bg-white dark:bg-neutral-800 rounded-lg border p-6">
                <h2 className="text-lg font-semibold mb-4">
                  Contact
                  {isAuthenticated && (
                    <span className="ml-2 text-sm font-normal text-neutral-600 dark:text-neutral-400">
                      (Logged in as {user?.email})
                    </span>
                  )}
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      disabled={isAuthenticated}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="newsletter"
                      checked={emailNewsletter}
                      onCheckedChange={(checked) =>
                        setEmailNewsletter(checked as boolean)
                      }
                    />
                    <Label htmlFor="newsletter" className="text-sm">
                      Email me with news and offers
                    </Label>
                  </div>
                </div>
              </section>

              {/* Delivery Section */}
              <section className="bg-white dark:bg-neutral-800 rounded-lg border p-6">
                <h2 className="text-lg font-semibold mb-4">Delivery</h2>

                {/* Address Selection for Authenticated Users */}
                {isAuthenticated && savedAddresses.length > 0 && (
                  <div className="mb-6 p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                    <div className=" flex items-center justify-between mb-3">
                      <h3 className="font-medium text-sm">Choose Address</h3>
                      <div className="flex gap-2">
                        <Link href="/account/addresses">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-xs"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            <p className="hidden sm:block">Manage</p>
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {addressMode === "saved" && (
                      <div className="space-y-2">
                        {isLoadingAddresses ? (
                          <div className="text-center py-4 text-sm text-neutral-600">
                            Loading addresses...
                          </div>
                        ) : (
                          <Select
                            value={selectedAddressId}
                            onValueChange={handleAddressSelection}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a saved address" />
                            </SelectTrigger>
                            <SelectContent>
                              {savedAddresses.map((address: any) => (
                                <SelectItem key={address.id} value={address.id}>
                                  <div className="flex items-center gap-2">
                                    {address.isDefault && (
                                      <span className="text-xs bg-green-100 text-green-800 px-1 rounded">
                                        Default
                                      </span>
                                    )}
                                    <span>{address.label}</span>
                                    {/* <span className="text-neutral-500">
                                      - {address.address}, {address.city}
                                    </span> */}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* No Saved Addresses Message */}
                {isAuthenticated && savedAddresses.length === 0 && (
                  <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <h3 className="font-medium text-sm text-blue-800 dark:text-blue-200">
                        No saved addresses yet
                      </h3>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                      You can save this address for future orders or manage your
                      addresses.
                    </p>
                    <div className="flex gap-2">
                      <Link href="/account/addresses">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Manage Addresses
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}

                {/* Manual Address Entry */}
                {
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First name</Label>
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
                      <Label htmlFor="lastName">Last name</Label>
                      <Input
                        id="lastName"
                        required
                        value={formData.lastName}
                        onChange={(e) =>
                          handleInputChange("lastName", e.target.value)
                        }
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        required
                        placeholder="Street address"
                        value={formData.address}
                        onChange={(e) =>
                          handleInputChange("address", e.target.value)
                        }
                      />
                    </div>
                    <div className="sm:col-span-2 grid sm:grid-cols-3 gap-4">
                      <div>
                        <Label>Country</Label>
                        <select
                          className="w-full h-10 px-3 py-2 rounded border bg-transparent text-sm"
                          value={selectedCountryCode}
                          onChange={(e) =>
                            setSelectedCountryCode(e.target.value)
                          }
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
                              stateOptions.find((s) => s.value === code)
                                ?.label || "";
                            setFormData((prev) => ({ ...prev, state: label }));
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
                          onChange={(e) =>
                            handleInputChange("city", e.target.value)
                          }
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
                      <Label htmlFor="postal">Postal code (optional)</Label>
                      <Input
                        id="postal"
                        value={formData.postal}
                        onChange={(e) =>
                          handleInputChange("postal", e.target.value)
                        }
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label
                        htmlFor="phone"
                        className="flex items-center gap-1"
                      >
                        Phone
                        <HelpCircle className="h-3 w-3" />
                      </Label>
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
                          value={formData.phoneNumber}
                          onChange={(e) =>
                            handleInputChange("phoneNumber", e.target.value)
                          }
                          className="rounded-l-none border-l-0"
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      {isAuthenticated && addressMode === "manual" && (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="saveInfo"
                            checked={saveInfo}
                            onCheckedChange={(checked) =>
                              setSaveInfo(checked as boolean)
                            }
                          />
                          <Label htmlFor="saveInfo" className="text-sm">
                            Save this information for next time
                          </Label>
                        </div>
                      )}
                    </div>
                  </div>
                }
              </section>

              {/* Shipping Method Section */}
              <section className="bg-white dark:bg-neutral-800 rounded-lg border p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping method
                </h2>
                {shippingMethods.length > 0 ? (
                  <RadioGroup
                    value={shippingMethod}
                    onValueChange={setShippingMethod}
                  >
                    {shippingMethods.map((method: any) => (
                      <div
                        key={method.id}
                        className="flex items-center justify-between p-3 border rounded-lg mb-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value={method.type}
                            id={method.type}
                            onChange={() => {
                              setSelectedShippingMethod(method);
                              setShippingFee(method.shippingFee);
                              setTcsFee(method.tcsFee);
                            }}
                          />
                          <div>
                            <Label
                              htmlFor={method.type}
                              className="font-medium"
                            >
                              {method.name}
                            </Label>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                              {method.estimatedDays} day
                              {method.estimatedDays > 1 ? "s" : ""} delivery
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {method.totalFee === 0 ? (
                            <span className="text-green-600 font-medium">
                              FREE
                            </span>
                          ) : (
                            <div>
                              <div className="font-medium">
                                {formatCurrency(method.totalFee)}
                              </div>
                              {method.tcsFee > 0 && (
                                <div className="text-xs text-neutral-600">
                                  +{formatCurrency(method.tcsFee)} TCS
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                ) : (
                  <div className="text-center py-4 text-neutral-600 dark:text-neutral-400">
                    Enter your city to see shipping options
                  </div>
                )}
              </section>

              {/* Payment Section */}
              <section className="bg-white dark:bg-neutral-800 rounded-lg border p-6">
                <h2 className="text-lg font-semibold mb-4">Payment</h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  All transactions are secure and encrypted.
                </p>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                >
                  <div className="p-3 border rounded-lg bg-neutral-50 dark:bg-neutral-700">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="font-medium">
                        Cash on Delivery (COD)
                      </Label>
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 ml-6">
                      Pay with cash when your order is delivered
                    </p>
                  </div>
                </RadioGroup>
              </section>

              {/* Billing Address Section */}
              <section className="bg-white dark:bg-neutral-800 rounded-lg border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Billing address</h2>
                  {billingAddress === "different" && (
                    <span className="text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                      Different from shipping
                    </span>
                  )}
                </div>
                <RadioGroup
                  value={billingAddress}
                  onValueChange={setBillingAddress}
                >
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="same" id="same" />
                      <Label htmlFor="same">Same as shipping address</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="different" id="different" />
                      <Label htmlFor="different">
                        Use a different billing address
                      </Label>
                    </div>
                  </div>
                </RadioGroup>

                {/* Different Billing Address Form */}
                {billingAddress === "different" && (
                  <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-md font-medium">
                        Billing Address Details
                      </h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={copyShippingToBilling}
                        className="text-xs"
                      >
                        Copy from shipping address
                      </Button>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="billingFirstName">First name</Label>
                        <Input
                          id="billingFirstName"
                          required
                          value={billingFormData.firstName}
                          onChange={(e) =>
                            handleBillingInputChange(
                              "firstName",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="billingLastName">Last name</Label>
                        <Input
                          id="billingLastName"
                          required
                          value={billingFormData.lastName}
                          onChange={(e) =>
                            handleBillingInputChange("lastName", e.target.value)
                          }
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label htmlFor="billingAddress">Address</Label>
                        <Input
                          id="billingAddress"
                          required
                          placeholder="Street address"
                          value={billingFormData.address}
                          onChange={(e) =>
                            handleBillingInputChange("address", e.target.value)
                          }
                        />
                      </div>
                      <div className="sm:col-span-2 grid sm:grid-cols-3 gap-4">
                        <div>
                          <Label>Country</Label>
                          <select
                            className="w-full h-10 px-3 py-2 rounded border bg-transparent text-sm"
                            value={billingSelectedCountryCode}
                            onChange={(e) =>
                              setBillingSelectedCountryCode(e.target.value)
                            }
                            required
                          >
                            <option value="">Select country</option>
                            {billingCountryOptions.map((o) => (
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
                            value={billingSelectedStateCode}
                            onChange={(e) => {
                              const code = e.target.value;
                              setBillingSelectedStateCode(code);
                              const label =
                                billingStateOptions.find(
                                  (s) => s.value === code
                                )?.label || "";
                              handleBillingInputChange("state", label);
                            }}
                            disabled={!billingStateOptions.length}
                            required
                          >
                            <option value="">Select state/province</option>
                            {billingStateOptions.map((o) => (
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
                            value={billingFormData.city}
                            onChange={(e) =>
                              handleBillingInputChange("city", e.target.value)
                            }
                            disabled={!billingCityOptions.length}
                            required
                          >
                            <option value="">Select city</option>
                            {billingCityOptions.map((o) => (
                              <option key={o.value} value={o.label}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="billingPostal">
                          Postal code (optional)
                        </Label>
                        <Input
                          id="billingPostal"
                          value={billingFormData.postal}
                          onChange={(e) =>
                            handleBillingInputChange("postal", e.target.value)
                          }
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label
                          htmlFor="billingPhone"
                          className="flex items-center gap-1"
                        >
                          Phone (optional)
                          <HelpCircle className="h-3 w-3" />
                        </Label>
                        <div className="flex">
                          <select
                            className="rounded-l border border-r-0 px-1 py-2 bg-transparent min-w-[80px] text-sm"
                            value={billingFormData.countryCode}
                            onChange={(e) =>
                              handleBillingInputChange(
                                "countryCode",
                                e.target.value
                              )
                            }
                          >
                            <option value="+92">🇵🇰 +92</option>
                          </select>
                          <Input
                            id="billingPhone"
                            placeholder="3XX XXXXXXX"
                            value={billingFormData.phoneNumber}
                            onChange={(e) =>
                              handleBillingInputChange(
                                "phoneNumber",
                                e.target.value
                              )
                            }
                            className="rounded-l-none border-l-0"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* Complete Order Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-neutral-800 hover:bg-neutral-900 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 h-12 text-lg"
              >
                {isSubmitting ? "Placing order..." : "Complete order"}
              </Button>

              {/* Footer Links */}
              <div className="flex flex-wrap gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                <Link href="/return-refund" className="hover:underline">
                  Refund policy
                </Link>
                <Link href="/shipping-policy" className="hover:underline">
                  Shipping
                </Link>
                <Link href="/privacy-policy" className="hover:underline">
                  Privacy policy
                </Link>
                <Link href="/terms-of-service" className="hover:underline">
                  Terms of service
                </Link>
                <Link href="/return-refund" className="hover:underline">
                  Cancellations
                </Link>
              </div>
            </form>
          </div>

          {/* Right Column - Order Summary */}
          <aside className="lg:col-span-1">
            <div className="bg-white dark:bg-neutral-800 rounded-lg border p-6 sticky top-8">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

              {/* Product List */}
              <div className="space-y-3 mb-6">
                {displayItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative">
                      <Image
                        width={128}
                        height={128}
                        src={item.image || "/placeholder.svg"}
                        alt={(item as any).title}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                      <div className="absolute -top-1 -right-1 h-5 w-5 bg-neutral-300 dark:bg-neutral-600 rounded-full flex items-center justify-center text-xs">
                        {item.qty}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">
                        {(item as any).title}
                      </h3>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">
                        Quantity: {item.qty}
                      </p>
                    </div>
                    <div className="text-sm font-medium">
                      {formatCurrency(item.price * item.qty)}
                    </div>
                  </div>
                ))}
                {displayItems.length > 3 && (
                  <div className="text-center py-2 text-sm text-neutral-600 dark:text-neutral-400">
                    Scroll for more items ↓
                  </div>
                )}
              </div>

              {/* Discount Code */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <Input
                    placeholder="Discount code or gift card"
                    className="flex-1"
                  />
                  <Button variant="outline" className="px-4">
                    Apply
                  </Button>
                </div>
              </div>

              {/* Order Totals */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span>Subtotal • {displayItems.length} items</span>
                  <span>{formatCurrency(displaySubtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    Shipping
                    <HelpCircle className="h-3 w-3" />
                  </span>
                  <span
                    className={
                      shippingFee === 0 ? "text-green-600 font-medium" : ""
                    }
                  >
                    {shippingFee === 0 ? "FREE" : formatCurrency(shippingFee)}
                  </span>
                </div>
                {tcsFee > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span>TCS Charges</span>
                    <span>{formatCurrency(tcsFee)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-lg font-bold border-t pt-3">
                  <span>Total</span>
                  <span>{formatCurrency(orderTotal)}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
