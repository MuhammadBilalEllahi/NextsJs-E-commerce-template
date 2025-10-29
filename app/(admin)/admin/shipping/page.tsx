"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { ShippingMethod, Location } from "@/types/types";

export default function ShippingPage() {
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [editingMethod, setEditingMethod] = useState<ShippingMethod | null>(
    null
  );
  const [isAdding, setIsAdding] = useState(false);
  const [newMethod, setNewMethod] = useState<ShippingMethod>({
    name: "",
    type: "home_delivery",
    isActive: true,
    locations: [],
    defaultShippingFee: 0,
    defaultTcsFee: 0,
    defaultEstimatedDays: 1,
    freeShippingThreshold: 0,
    description: "",
    restrictions: [],
  });

  useEffect(() => {
    fetchShippingMethods();
  }, []);

  const fetchShippingMethods = async () => {
    try {
      const response = await fetch("/api/admin/shipping-methods");
      if (response.ok) {
        const data = await response.json();
        setMethods(data.methods);
      }
    } catch (error) {
      console.error("Failed to fetch shipping methods:", error);
    }
  };

  const handleSave = async (method: ShippingMethod) => {
    try {
      const url = (method as any).id
        ? `/api/admin/shipping-methods/${(method as any).id}`
        : "/api/admin/shipping-methods";
      const response = await fetch(url, {
        method: (method as any).id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(method),
      });

      if (response.ok) {
        await fetchShippingMethods();
        setEditingMethod(null);
        setIsAdding(false);
        setNewMethod({
          name: "",
          type: "home_delivery",
          isActive: true,
          locations: [],
          defaultShippingFee: 0,
          defaultTcsFee: 0,
          defaultEstimatedDays: 1,
          freeShippingThreshold: 0,
          description: "",
          restrictions: [],
        });
      }
    } catch (error) {
      console.error("Failed to save shipping method:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this shipping method?"))
      return;

    try {
      const response = await fetch(`/api/admin/shipping-methods/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchShippingMethods();
      }
    } catch (error) {
      console.error("Failed to delete shipping method:", error);
    }
  };

  const addLocation = (method: ShippingMethod) => {
    const newLocation: Location = {
      city: "",
      state: "Punjab",
      country: "Pakistan",
      shippingFee: 0,
      tcsFee: 0,
      estimatedDays: 1,
      isAvailable: true,
    };

    if (editingMethod) {
      setEditingMethod({
        ...editingMethod,
        locations: [...editingMethod.locations, newLocation],
      });
    } else {
      setNewMethod({
        ...newMethod,
        locations: [...newMethod.locations, newLocation],
      });
    }
  };

  const updateLocation = (
    method: ShippingMethod,
    index: number,
    field: keyof Location,
    value: any
  ) => {
    const updatedLocations = [...method.locations];
    updatedLocations[index] = { ...updatedLocations[index], [field]: value };

    if (editingMethod) {
      setEditingMethod({ ...editingMethod, locations: updatedLocations });
    } else {
      setNewMethod({ ...newMethod, locations: updatedLocations });
    }
  };

  const removeLocation = (method: ShippingMethod, index: number) => {
    const updatedLocations = method.locations.filter((_, i) => i !== index);

    if (editingMethod) {
      setEditingMethod({ ...editingMethod, locations: updatedLocations });
    } else {
      setNewMethod({ ...newMethod, locations: updatedLocations });
    }
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Shipping Methods Management</CardTitle>
          <CardDescription>
            Configure shipping methods, fees, and location-based pricing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setIsAdding(true)} className="mb-4">
            <Plus className="h-4 w-4 mr-2" />
            Add Shipping Method
          </Button>

          {/* Add/Edit Form */}
          {(isAdding || editingMethod) && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>
                  {editingMethod ? "Edit" : "Add"} Shipping Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={editingMethod?.name || newMethod.name}
                      onChange={(e) =>
                        editingMethod
                          ? setEditingMethod({
                              ...editingMethod,
                              name: e.target.value,
                            })
                          : setNewMethod({ ...newMethod, name: e.target.value })
                      }
                      placeholder="e.g., Home Delivery, TCS Express"
                    />
                  </div>
                  <div>
                    <Label>Type</Label>
                    <select
                      className="w-full rounded border px-3 py-2 bg-transparent"
                      value={editingMethod?.type || newMethod.type}
                      onChange={(e) =>
                        editingMethod
                          ? setEditingMethod({
                              ...editingMethod,
                              type: e.target.value as any,
                            })
                          : setNewMethod({
                              ...newMethod,
                              type: e.target.value as any,
                            })
                      }
                    >
                      <option value="home_delivery">Home Delivery</option>
                      <option value="tcs">TCS</option>
                      <option value="pickup">Pickup</option>
                    </select>
                  </div>
                  <div>
                    <Label>Default Shipping Fee</Label>
                    <Input
                      type="number"
                      value={
                        editingMethod?.defaultShippingFee ||
                        newMethod.defaultShippingFee
                      }
                      onChange={(e) =>
                        editingMethod
                          ? setEditingMethod({
                              ...editingMethod,
                              defaultShippingFee: parseFloat(e.target.value),
                            })
                          : setNewMethod({
                              ...newMethod,
                              defaultShippingFee: parseFloat(e.target.value),
                            })
                      }
                    />
                  </div>
                  <div>
                    <Label>Default TCS Fee</Label>
                    <Input
                      type="number"
                      value={
                        editingMethod?.defaultTcsFee || newMethod.defaultTcsFee
                      }
                      onChange={(e) =>
                        editingMethod
                          ? setEditingMethod({
                              ...editingMethod,
                              defaultTcsFee: parseFloat(e.target.value),
                            })
                          : setNewMethod({
                              ...newMethod,
                              defaultTcsFee: parseFloat(e.target.value),
                            })
                      }
                    />
                  </div>
                  <div>
                    <Label>Free Shipping Threshold</Label>
                    <Input
                      type="number"
                      value={
                        editingMethod?.defaultShippingFee ||
                        newMethod.freeShippingThreshold
                      }
                      onChange={(e) =>
                        editingMethod
                          ? setEditingMethod({
                              ...editingMethod,
                              freeShippingThreshold: parseFloat(e.target.value),
                            })
                          : setNewMethod({
                              ...newMethod,
                              freeShippingThreshold: parseFloat(e.target.value),
                            })
                      }
                      placeholder="0 for no free shipping"
                    />
                  </div>
                  <div>
                    <Label>Default Estimated Days</Label>
                    <Input
                      type="number"
                      value={
                        editingMethod?.defaultEstimatedDays ||
                        newMethod.defaultEstimatedDays
                      }
                      onChange={(e) =>
                        editingMethod
                          ? setEditingMethod({
                              ...editingMethod,
                              defaultEstimatedDays: parseInt(e.target.value),
                            })
                          : setNewMethod({
                              ...newMethod,
                              defaultEstimatedDays: parseInt(e.target.value),
                            })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={editingMethod?.description || newMethod.description}
                    onChange={(e) =>
                      editingMethod
                        ? setEditingMethod({
                            ...editingMethod,
                            description: e.target.value,
                          })
                        : setNewMethod({
                            ...newMethod,
                            description: e.target.value,
                          })
                    }
                    placeholder="Description of the shipping method"
                  />
                </div>

                {/* Locations */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Location-based Pricing</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addLocation(editingMethod || newMethod)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Location
                    </Button>
                  </div>

                  {(editingMethod?.locations || newMethod.locations).map(
                    (location, index) => (
                      <div key={index} className="border rounded-lg p-4 mb-2">
                        <div className="grid md:grid-cols-4 gap-2 mb-2">
                          <Input
                            placeholder="City"
                            value={location.city}
                            onChange={(e) =>
                              updateLocation(
                                editingMethod || newMethod,
                                index,
                                "city",
                                e.target.value
                              )
                            }
                          />
                          <Input
                            placeholder="State"
                            value={location.state}
                            onChange={(e) =>
                              updateLocation(
                                editingMethod || newMethod,
                                index,
                                "state",
                                e.target.value
                              )
                            }
                          />
                          <Input
                            type="number"
                            placeholder="Shipping Fee"
                            value={location.shippingFee}
                            onChange={(e) =>
                              updateLocation(
                                editingMethod || newMethod,
                                index,
                                "shippingFee",
                                parseFloat(e.target.value)
                              )
                            }
                          />
                          <Input
                            type="number"
                            placeholder="TCS Fee"
                            value={location.tcsFee}
                            onChange={(e) =>
                              updateLocation(
                                editingMethod || newMethod,
                                index,
                                "tcsFee",
                                parseFloat(e.target.value)
                              )
                            }
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            placeholder="Estimated Days"
                            value={location.estimatedDays}
                            onChange={(e) =>
                              updateLocation(
                                editingMethod || newMethod,
                                index,
                                "estimatedDays",
                                parseInt(e.target.value)
                              )
                            }
                            className="w-32"
                          />
                          <Checkbox
                            checked={location.isAvailable}
                            onCheckedChange={(checked) =>
                              updateLocation(
                                editingMethod || newMethod,
                                index,
                                "isAvailable",
                                checked
                              )
                            }
                          />
                          <Label className="text-sm">Available</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              removeLocation(editingMethod || newMethod, index)
                            }
                            className="ml-auto"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleSave(editingMethod || newMethod)}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingMethod(null);
                      setIsAdding(false);
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Existing Methods */}
          <div className="space-y-4">
            {methods.map((method) => (
              <Card key={(method as any).id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {method.name}
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            method.type === "home_delivery"
                              ? "bg-green-100 text-green-800"
                              : method.type === "tcs"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {method.type.replace("_", " ").toUpperCase()}
                        </span>
                        {!method.isActive && (
                          <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-800">
                            INACTIVE
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription>
                        Default:{" "}
                        {method.defaultShippingFee === 0
                          ? "FREE"
                          : `Rs. ${method.defaultShippingFee}`}{" "}
                        shipping
                        {method.defaultTcsFee > 0 &&
                          ` + Rs. ${method.defaultTcsFee} TCS`}
                        {method.freeShippingThreshold > 0 &&
                          ` • Free over Rs. ${method.freeShippingThreshold}`}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingMethod(method)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(method.id!)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {method.locations.length > 0 && (
                    <div className="mb-4">
                      <Label className="text-sm font-medium">
                        Location Pricing:
                      </Label>
                      <div className="grid md:grid-cols-3 gap-2 mt-2">
                        {method.locations.map((location, index) => (
                          <div
                            key={index}
                            className="text-sm p-2 border rounded"
                          >
                            <div className="font-medium">
                              {location.city}, {location.state}
                            </div>
                            <div>Shipping: Rs. {location.shippingFee}</div>
                            {location.tcsFee > 0 && (
                              <div>TCS: Rs. {location.tcsFee}</div>
                            )}
                            <div>
                              {location.estimatedDays} day
                              {location.estimatedDays > 1 ? "s" : ""}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {method.description && (
                    <p className="text-sm text-neutral-600">
                      {method.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
