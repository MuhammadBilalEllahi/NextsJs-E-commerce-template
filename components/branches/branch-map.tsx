"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Clock, ExternalLink } from "lucide-react";

interface Branch {
  _id: string;
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
  logo?: string;
  branchNumber: string;
  location: string;
  city: string;
  state: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  openingHours: {
    monday: { open: string; close: string; isOpen: boolean };
    tuesday: { open: string; close: string; isOpen: boolean };
    wednesday: { open: string; close: string; isOpen: boolean };
    thursday: { open: string; close: string; isOpen: boolean };
    friday: { open: string; close: string; isOpen: boolean };
    saturday: { open: string; close: string; isOpen: boolean };
    sunday: { open: string; close: string; isOpen: boolean };
  };
}

interface BranchMapProps {
  branches: Branch[];
}

export function BranchMap({ branches }: BranchMapProps) {
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Generate Google Maps embed URL with all branch locations
  const generateMapUrl = () => {
    if (!branches.length) return "";

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    // If no API key, use a simple Google Maps search URL
    if (!apiKey) {
      const searchQuery = branches.map((branch) => branch.address).join(" ");
      return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3403.0!2d74.3587!3d31.5204!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzHCsDMxJzEzLjQiTiA3NMKwMjEnMzEuMyJF!5e0!3m2!1sen!2s!4v1234567890123!5m2!1sen!2s&q=${encodeURIComponent(
        searchQuery
      )}`;
    }

    // If we have coordinates, use them for better accuracy
    const locations = branches
      .filter(
        (branch) =>
          branch.coordinates?.latitude && branch.coordinates?.longitude
      )
      .map(
        (branch) =>
          `${branch.coordinates!.latitude},${branch.coordinates!.longitude}`
      )
      .join("|");

    if (locations) {
      return `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=31.5204,74.3587&zoom=11&maptype=roadmap&markers=${locations}`;
    }

    // Fallback to Lahore center with search query
    const searchQuery = branches.map((branch) => branch.address).join("|");
    return `https://www.google.com/maps/embed/v1/search?key=${apiKey}&q=${encodeURIComponent(
      searchQuery
    )}&center=31.5204,74.3587&zoom=11`;
  };

  const getCurrentDayHours = (branch: Branch) => {
    const today = new Date()
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();

    // Map full day names to our openingHours keys
    const dayMapping: { [key: string]: keyof typeof branch.openingHours } = {
      monday: "monday",
      tuesday: "tuesday",
      wednesday: "wednesday",
      thursday: "thursday",
      friday: "friday",
      saturday: "saturday",
      sunday: "sunday",
    };

    const todayKey = dayMapping[today];
    const todayHours = todayKey ? branch.openingHours[todayKey] : null;

    if (!todayHours || !todayHours.isOpen) {
      return "Closed Today";
    }

    return `${todayHours.open} - ${todayHours.close}`;
  };

  const isOpenNow = (branch: Branch) => {
    const today = new Date()
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();

    // Map full day names to our openingHours keys
    const dayMapping: { [key: string]: keyof typeof branch.openingHours } = {
      monday: "monday",
      tuesday: "tuesday",
      wednesday: "wednesday",
      thursday: "thursday",
      friday: "friday",
      saturday: "saturday",
      sunday: "sunday",
    };

    const todayKey = dayMapping[today];
    const todayHours = todayKey ? branch.openingHours[todayKey] : null;

    if (!todayHours || !todayHours.isOpen) return false;

    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    const [openHour, openMin] = todayHours.open.split(":").map(Number);
    const [closeHour, closeMin] = todayHours.close.split(":").map(Number);

    const openTime = openHour * 100 + openMin;
    const closeTime = closeHour * 100 + closeMin;

    return currentTime >= openTime && currentTime <= closeTime;
  };

  useEffect(() => {
    // Set the first branch as selected by default
    if (branches.length > 0 && !selectedBranch) {
      setSelectedBranch(branches[0]);
    }
  }, [branches, selectedBranch]);

  if (!branches.length) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 dark:text-gray-600 mb-4">
          <MapPin className="h-12 w-12 mx-auto mb-2" />
          <p className="text-lg font-medium">No branches found</p>
          <p className="text-sm">Please check back later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
      {/* Branch List */}
      <div className="lg:col-span-1 order-2 lg:order-1">
        <div className="space-y-3 lg:space-y-4">
          {branches.map((branch) => (
            <Card
              key={branch._id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedBranch?._id === branch._id
                  ? "ring-2 ring-red-500 shadow-lg"
                  : "hover:ring-1 hover:ring-red-300"
              }`}
              onClick={() => setSelectedBranch(branch)}
            >
              <CardContent className="p-3 lg:p-4">
                <div className="flex items-start gap-2 lg:gap-3">
                  {branch.logo && (
                    <img
                      src={branch.logo}
                      alt={branch.name}
                      className="w-10 h-10 lg:w-12 lg:h-12 object-contain rounded-lg flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                      <h3 className="font-semibold text-base lg:text-lg truncate">
                        {branch.name}
                      </h3>
                      <Badge
                        variant={isOpenNow(branch) ? "default" : "secondary"}
                        className="text-xs w-fit"
                      >
                        {isOpenNow(branch) ? "Open" : "Closed"}
                      </Badge>
                    </div>
                    <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Branch {branch.branchNumber}
                    </p>
                    <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-500 truncate">
                      {branch.address}
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">
                        {getCurrentDayHours(branch)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Map and Branch Details */}
      <div className="lg:col-span-2 order-1 lg:order-2">
        <div className="space-y-4 lg:space-y-6">
          {/* Google Maps Embed */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative h-64 sm:h-80 lg:h-96 w-full">
                <iframe
                  src={generateMapUrl()}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Dehli Mirch Branches Map"
                  onLoad={() => setMapLoaded(true)}
                />
                {!mapLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Loading map...
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Selected Branch Details */}
          {selectedBranch && (
            <Card>
              <CardContent className="p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row items-start gap-3 lg:gap-4 mb-4 lg:mb-6">
                  {selectedBranch.logo && (
                    <img
                      src={selectedBranch.logo}
                      alt={selectedBranch.name}
                      className="w-12 h-12 lg:w-16 lg:h-16 object-contain rounded-lg flex-shrink-0 mx-auto sm:mx-0"
                    />
                  )}
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <h3 className="text-xl lg:text-2xl font-bold">
                        {selectedBranch.name}
                      </h3>
                      <Badge
                        variant={
                          isOpenNow(selectedBranch) ? "default" : "secondary"
                        }
                        className="w-fit mx-auto sm:mx-0"
                      >
                        {isOpenNow(selectedBranch) ? "Open Now" : "Closed"}
                      </Badge>
                    </div>
                    <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400">
                      Branch {selectedBranch.branchNumber} •{" "}
                      {selectedBranch.city}, {selectedBranch.state}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                  {/* Contact Information */}
                  <div className="space-y-3 lg:space-y-4">
                    <h4 className="font-semibold text-base lg:text-lg">
                      Contact Information
                    </h4>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-red-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Address</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {selectedBranch.address}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Phone className="h-5 w-5 text-red-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Phone</p>
                          <a
                            href={`tel:${selectedBranch.phoneNumber}`}
                            className="text-sm text-red-600 hover:text-red-700"
                          >
                            {selectedBranch.phoneNumber}
                          </a>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <ExternalLink className="h-5 w-5 text-red-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Get Directions</p>
                          <a
                            href={selectedBranch.location}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-red-600 hover:text-red-700"
                          >
                            View on Google Maps
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Opening Hours */}
                  <div className="space-y-3 lg:space-y-4">
                    <h4 className="font-semibold text-base lg:text-lg">
                      Opening Hours
                    </h4>

                    <div className="space-y-2">
                      {Object.entries(selectedBranch.openingHours).map(
                        ([day, hours]) => {
                          const today = new Date()
                            .toLocaleDateString("en-US", { weekday: "long" })
                            .toLowerCase();
                          const isToday = today === day;
                          return (
                            <div
                              key={day}
                              className={`flex justify-between items-center text-sm ${
                                isToday
                                  ? "font-semibold text-red-600"
                                  : "text-gray-600 dark:text-gray-400"
                              }`}
                            >
                              <span className="capitalize">{day}</span>
                              <span>
                                {hours.isOpen
                                  ? `${hours.open} - ${hours.close}`
                                  : "Closed"}
                              </span>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 lg:gap-3 mt-4 lg:mt-6">
                  <Button
                    onClick={() =>
                      window.open(`tel:${selectedBranch.phoneNumber}`, "_self")
                    }
                    className="flex-1 min-w-0"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call Now
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      window.open(selectedBranch.location, "_blank")
                    }
                    className="flex-1 min-w-0"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Get Directions
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
