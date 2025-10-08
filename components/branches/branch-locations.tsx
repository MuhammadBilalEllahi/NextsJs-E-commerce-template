"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Phone,
  Clock,
  ExternalLink,
  Mail,
  Navigation,
  Star,
  Users,
} from "lucide-react";
import { Branch } from "@/types";

interface BranchLocationsProps {
  branches: Branch[];
}

export function BranchLocations({ branches }: BranchLocationsProps) {
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

  if (!branches.length) {
    return (
      <div className="text-center py-12">
        <div className="text-foreground dark:text-foreground/40 mb-4">
          <MapPin className="h-12 w-12 mx-auto mb-2" />
          <p className="text-lg font-medium">No branches found</p>
          <p className="text-sm">Please check back later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary Section */}
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-4">
          Visit Our <span className="text-primary">Branches</span>
        </h3>
        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
          Experience the authentic taste of premium spices at any of our{" "}
          {branches.length} branches across Karachi
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4 max-w-2xl mx-auto">
          <div className="bg-white dark:bg-neutral-800 p-3 lg:p-4 rounded-lg border">
            <div className="text-xl lg:text-2xl font-bold text-primary">
              {branches.length}
            </div>
            <div className="text-xs lg:text-sm text-foreground dark:text-foreground/40">
              Branches
            </div>
          </div>
          <div className="bg-white dark:bg-neutral-800 p-3 lg:p-4 rounded-lg border">
            <div className="text-xl lg:text-2xl font-bold text-primary">
              {branches.filter(isOpenNow).length}
            </div>
            <div className="text-xs lg:text-sm text-foreground dark:text-foreground/40">
              Open Now
            </div>
          </div>
          <div className="bg-white dark:bg-neutral-800 p-3 lg:p-4 rounded-lg border">
            <div className="text-xl lg:text-2xl font-bold text-primary">
              24/7
            </div>
            <div className="text-xs lg:text-sm text-foreground dark:text-foreground/40">
              Support
            </div>
          </div>
          <div className="bg-white dark:bg-neutral-800 p-3 lg:p-4 rounded-lg border">
            <div className="text-xl lg:text-2xl font-bold text-primary">
              Fresh
            </div>
            <div className="text-xs lg:text-sm text-foreground dark:text-foreground/40">
              Daily
            </div>
          </div>
        </div>
      </div>

      {/* Branch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        {branches.map((branch) => (
          <Card
            key={branch.id}
            className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg"
          >
            <CardHeader className="pb-3 lg:pb-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div className="flex items-center gap-3 lg:gap-4">
                  {branch.logo && (
                    <img
                      src={branch.logo}
                      alt={branch.name}
                      className="w-12 h-12 lg:w-16 lg:h-16 object-contain rounded-lg ring-1 ring-gray-200 flex-shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <CardTitle className="text-lg lg:text-xl group-hover:text-primary transition-colors">
                      {branch.name}
                    </CardTitle>
                    <p className="text-xs lg:text-sm text-foreground dark:text-foreground/40">
                      Branch {branch.branchNumber} • {branch.city},{" "}
                      {branch.state}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={isOpenNow(branch) ? "default" : "secondary"}
                  className="w-fit sm:ml-auto"
                >
                  {isOpenNow(branch) ? "Open Now" : "Closed"}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 lg:space-y-6">
              {/* Address */}
              <div className="flex items-start gap-2 lg:gap-3">
                <MapPin className="h-4 w-4 lg:h-5 lg:w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-sm lg:text-base">Address</p>
                  <p className="text-xs lg:text-sm text-foreground dark:text-foreground/40">
                    {branch.address}
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                <div className="flex items-center gap-2 lg:gap-3">
                  <Phone className="h-4 w-4 lg:h-5 lg:w-5 text-primary flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-xs lg:text-sm">Phone</p>
                    <a
                      href={`tel:${branch.phoneNumber}`}
                      className="text-xs lg:text-sm text-primary hover:text-primary break-all"
                    >
                      {branch.phoneNumber}
                    </a>
                  </div>
                </div>

                {branch.email && (
                  <div className="flex items-center gap-2 lg:gap-3">
                    <Mail className="h-4 w-4 lg:h-5 lg:w-5 text-primary flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-xs lg:text-sm">Email</p>
                      <a
                        href={`mailto:${branch.email}`}
                        className="text-xs lg:text-sm text-primary hover:text-primary break-all"
                      >
                        {branch.email}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Opening Hours */}
              <div className="flex items-start gap-2 lg:gap-3">
                <Clock className="h-4 w-4 lg:h-5 lg:w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm lg:text-base mb-2">
                    Opening Hours
                  </p>
                  <div className="grid grid-cols-2 gap-1 lg:gap-2 text-xs lg:text-sm">
                    {Object.entries(branch.openingHours).map(([day, hours]) => {
                      const today = new Date()
                        .toLocaleDateString("en-US", { weekday: "long" })
                        .toLowerCase();
                      const isToday = today === day;
                      return (
                        <div
                          key={day}
                          className={`flex justify-between items-center ${
                            isToday
                              ? "font-semibold text-primary"
                              : "text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          <span className="capitalize text-xs">
                            {day.slice(0, 3)}
                          </span>
                          <span className="text-xs">
                            {hours.isOpen
                              ? `${hours.open}-${hours.close}`
                              : "Closed"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Manager */}
              {branch.manager && (
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Manager</p>
                    <p className="text-sm text-foreground dark:text-foreground/40">
                      {branch.manager}
                    </p>
                  </div>
                </div>
              )}

              {/* Description */}
              {branch.description && (
                <div>
                  <p className="text-sm text-foreground dark:text-foreground/40">
                    {branch.description}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 lg:gap-3 pt-3 lg:pt-4 border-t">
                <Button
                  onClick={() =>
                    window.open(`tel:${branch.phoneNumber}`, "_self")
                  }
                  className="flex-1 min-w-0"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call Now
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open(branch.location, "_blank")}
                  className="flex-1 min-w-0"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Directions
                </Button>
                {branch.whatsapp && (
                  <Button
                    variant="outline"
                    onClick={() =>
                      window.open(`https://wa.me/${branch.whatsapp}`, "_blank")
                    }
                    className="flex-1 min-w-0"
                  >
                    <svg
                      className="h-4 w-4 mr-2"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                    </svg>
                    WhatsApp
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Call to Action */}
      <div className="text-center bg-white dark:bg-neutral-900 rounded-xl p-4 lg:p-8 border shadow-sm">
        <h3 className="text-xl lg:text-2xl font-bold mb-3 lg:mb-4">
          Can't Find What You're Looking For?
        </h3>
        <p className="text-sm lg:text-base text-foreground dark:text-foreground/40 mb-4 lg:mb-6">
          Contact us directly or visit any of our branches for personalized
          assistance
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 lg:gap-4">
          <Button
            onClick={() =>
              window.open(`tel:${branches[0]?.phoneNumber}`, "_self")
            }
            className="bg-gradient-to-r from-primary to-primary hover:from-primary/90 hover:to-primary/90"
          >
            <Phone className="h-4 w-4 mr-2" />
            Call Main Branch
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open("/contact", "_self")}
          >
            <Mail className="h-4 w-4 mr-2" />
            Contact Us
          </Button>
        </div>
      </div>
    </div>
  );
}
