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
} from "lucide-react";
import { Branch } from "@/types";

interface BranchInfoProps {
  branches: Branch[];
}

export function BranchInfo({ branches }: BranchInfoProps) {
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

  const getWeekdayHours = (branch: Branch) => {
    const weekdays = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
    ] as const;
    const weekdayHours = weekdays.map((day) => branch.openingHours[day]);

    // Check if all weekdays have the same hours
    const firstDay = weekdayHours[0];
    const isUniform = weekdayHours.every(
      (day) =>
        day.isOpen === firstDay.isOpen &&
        day.open === firstDay.open &&
        day.close === firstDay.close
    );

    if (isUniform && firstDay.isOpen) {
      return `Mon-Fri: ${firstDay.open}-${firstDay.close}`;
    }

    return "See details for specific hours";
  };

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
      {branches.map((branch) => (
        <Card
          key={branch.id}
          className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg"
        >
          <CardHeader className="pb-3 lg:pb-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div className="flex items-center gap-2 lg:gap-3">
                {branch.logo && (
                  <img
                    src={branch.logo}
                    alt={branch.name}
                    className="w-10 h-10 lg:w-12 lg:h-12 object-contain rounded-lg ring-1 ring-gray-200 flex-shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <CardTitle className="text-base lg:text-lg group-hover:text-red-600 transition-colors truncate">
                    {branch.name}
                  </CardTitle>
                  <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">
                    Branch {branch.branchNumber}
                  </p>
                </div>
              </div>
              <Badge
                variant={isOpenNow(branch) ? "default" : "secondary"}
                className="w-fit sm:ml-auto"
              >
                {isOpenNow(branch) ? "Open" : "Closed"}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-3 lg:space-y-4">
            {/* Address */}
            <div className="flex items-start gap-2 lg:gap-3">
              <MapPin className="h-4 w-4 lg:h-5 lg:w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-medium text-xs lg:text-sm">Address</p>
                <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">
                  {branch.address}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {branch.city}, {branch.state}
                </p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 lg:gap-3">
                <Phone className="h-4 w-4 text-red-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs lg:text-sm font-medium">Phone</p>
                  <a
                    href={`tel:${branch.phoneNumber}`}
                    className="text-xs lg:text-sm text-red-600 hover:text-red-700 break-all"
                  >
                    {branch.phoneNumber}
                  </a>
                </div>
              </div>

              {branch.email && (
                <div className="flex items-center gap-2 lg:gap-3">
                  <Mail className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs lg:text-sm font-medium">Email</p>
                    <a
                      href={`mailto:${branch.email}`}
                      className="text-xs lg:text-sm text-red-600 hover:text-red-700 break-all"
                    >
                      {branch.email}
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Opening Hours */}
            <div className="flex items-start gap-2 lg:gap-3">
              <Clock className="h-4 w-4 lg:h-5 lg:w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-xs lg:text-sm mb-1">
                  Opening Hours
                </p>
                <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">
                  {getCurrentDayHours(branch)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {getWeekdayHours(branch)}
                </p>
              </div>
            </div>

            {/* Manager */}
            {branch.manager && (
              <div className="flex items-center gap-3">
                <Star className="h-4 w-4 text-red-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Manager</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {branch.manager}
                  </p>
                </div>
              </div>
            )}

            {/* Description */}
            {branch.description && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {branch.description}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                size="sm"
                onClick={() =>
                  window.open(`tel:${branch.phoneNumber}`, "_self")
                }
                className="flex-1"
              >
                <Phone className="h-4 w-4 mr-1" />
                Call
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(branch.location, "_blank")}
                className="flex-1"
              >
                <Navigation className="h-4 w-4 mr-1" />
                Directions
              </Button>
            </div>

            {/* WhatsApp */}
            {branch.whatsapp && (
              <div className="pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    window.open(`https://wa.me/${branch.whatsapp}`, "_blank")
                  }
                  className="w-full"
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
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
