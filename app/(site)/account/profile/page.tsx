"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CitySelect } from "@/components/ui/city-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/providers/authProvider";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AccountNavigation } from "@/components/account/account-navigation";
import { Save, User, Phone, MapPin, Edit, X } from "lucide-react";
import { UserTypes } from "@/models/constants/constants";
import { UserProfile } from "@/types/types";
import { getProfile, updateProfile } from "@/lib/api/account/profile";

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    city: "",
  });

  // Fetch user profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getProfile();
      setProfile(data.user);
      setFormData({
        firstName: data.user.firstName || "",
        lastName: data.user.lastName || "",
        phone: data.user.phone || "",
        city: data.user.city || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = await updateProfile(formData);
      setProfile(data.user);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsEditing(false);
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold mb-4">Loading Profile...</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Please wait while we fetch your profile information.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <AccountNavigation>
        <div>
          <div className="mb-6">
            <h1 className="text-2xl font-bold">My Profile</h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Manage your personal information and preferences
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Profile Information */}
            {isEditing ? (
              <Card>
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                  <X
                    className="absolute top-0 right-4 cursor-pointer"
                    onClick={() => setIsEditing(!isEditing)}
                  />
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          type="text"
                          value={formData.firstName}
                          onChange={(e) =>
                            handleInputChange("firstName", e.target.value)
                          }
                          placeholder="Enter your first name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          type="text"
                          value={formData.lastName}
                          onChange={(e) =>
                            handleInputChange("lastName", e.target.value)
                          }
                          placeholder="Enter your last name"
                        />
                      </div>
                    </div>

                    <div>
                      <Label
                        htmlFor="phone"
                        className="flex items-center gap-1"
                      >
                        <Phone className="h-4 w-4" />
                        Phone Number
                      </Label>
                      <div className="flex">
                        <select
                          className="rounded-l border border-r-0 px-1 py-2 bg-transparent min-w-[80px] text-sm"
                          value="+92"
                          disabled
                        >
                          <option value="+92">🇵🇰 +92</option>
                        </select>
                        <Input
                          id="phone"
                          placeholder="3XX XXXXXXX"
                          value={formData.phone}
                          onChange={(e) =>
                            handleInputChange("phone", e.target.value)
                          }
                          className="rounded-l-none border-l-0"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="city" className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        City
                      </Label>
                      <CitySelect
                        label=""
                        value={formData.city}
                        onChange={(value) => handleInputChange("city", value)}
                        placeholder="Select your city"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-2 ">
                    <User className="h-5 w-5" />
                    Account Information
                  </CardTitle>
                  <Edit
                    className="absolute top-0 right-4 cursor-pointer"
                    onClick={() => setIsEditing(!isEditing)}
                  />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        Email Address
                      </Label>
                      <p className="text-sm">{profile?.email}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        Email cannot be changed
                      </p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        Full Name
                      </Label>
                      <p className="text-sm">{profile?.name}</p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        Phone
                      </Label>
                      <p className="text-sm">{profile?.phone}</p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        Location
                      </Label>
                      <p className="text-sm">{profile?.city}</p>
                    </div>

                    {profile?.role === UserTypes.ADMIN && (
                      <div>
                        <Label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                          Account Type
                        </Label>
                        <p className="text-sm capitalize">{profile?.role}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        Member Since
                      </Label>
                      <p className="text-sm">
                        {profile?.createdAt
                          ? new Date(profile.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </AccountNavigation>
    </ProtectedRoute>
  );
}
