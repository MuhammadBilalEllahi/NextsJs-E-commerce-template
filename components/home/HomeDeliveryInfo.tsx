"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Truck,
  MapPin,
  Clock,
  Shield,
  Phone,
  CheckCircle,
  Car,
  Package,
} from "lucide-react";
import Link from "next/link";

import { DeliveryInfo } from "@/types/types";

export function HomeDeliveryInfo() {
  const deliveryOptions: DeliveryInfo[] = [
    {
      type: "home_delivery",
      title: "Personal Delivery",
      description: "We deliver personally with our own vehicles",
      icon: <Car className="h-8 w-8 text-red-600" />,
      coverage: "All Lahore Areas",
      timeFrame: "Within Hours or Even Minutes",
      cost: "FREE on orders above Rs. 2000",
      features: [
        "Personal touch and care",
        "Direct communication with delivery team",
        "Same-day delivery available",
        "Cash on delivery accepted",
        "Package protection guaranteed",
      ],
      color:
        "bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700",
    },
    // {
    //   type: "tcs",
    //   title: "TCS Courier Service",
    //   description: "Nationwide delivery through TCS",
    //   icon: <Truck className="h-8 w-8 text-green-600" />,
    //   coverage: "All Pakistan",
    //   timeFrame: "1-5 Business Days",
    //   cost: "Rs. 80-300 (based on weight)",
    //   features: [
    //     "Nationwide coverage",
    //     "Secure packaging",
    //     "Tracking available",
    //     "Insurance included",
    //     "Professional handling",
    //   ],
    //   color:
    //     "bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700",
    // },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
          We Deliver To Your Doorstep
        </h2>
        <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
          Choose from our flexible delivery options designed to bring authentic
          South Asian flavors right to your home, whether you're in Lahore or
          anywhere in Pakistan.
        </p>
      </div>

      {/* Additional Info */}
      <div className="bg-white dark:bg-neutral-900 rounded-lg p-6 border border-gray-200 dark:border-neutral-700 shadow-sm">
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center p-4 rounded-lg bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700">
            <Shield className="h-8 w-8 text-green-600 dark:text-green-400 mb-2" />
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
              Secure Packaging
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              All items are carefully packaged to maintain freshness and quality
            </p>
          </div>

          <div className="flex flex-col items-center p-4 rounded-lg bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700">
            <Phone className="h-8 w-8 text-red-600 dark:text-red-400 mb-2" />
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
              24/7 Support
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Our customer service team is always ready to help you
            </p>
          </div>

          <div className="flex flex-col items-center p-4 rounded-lg bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400 mb-2" />
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
              Quality Guarantee
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              100% satisfaction guarantee on all our products
            </p>
          </div>
        </div>
      </div>

      {/* Branch Information */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
          Our Lahore Branches
        </h3>
        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
          We have 4 branches across Lahore to serve you better
        </p>
        <Link href="/branches">
          <Button className="bg-gradient-to-r from-red-600 to-green-600 hover:from-red-700 hover:to-green-700 text-white">
            <MapPin className="h-4 w-4 mr-2" />
            Find Our Branches
          </Button>
        </Link>
      </div>
    </div>
  );
}
