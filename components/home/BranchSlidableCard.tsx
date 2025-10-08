"use client";

import React from "react";
import { ExternalLink, PhoneIcon } from "lucide-react";
import Link from "next/link";
import { Branch } from "@/types";
import Image from "next/image";
export default function StackedCards({ branches }: { branches: Branch[] }) {
  return (
    <div className="w-full ">
      {/* Stacked cards section */}
      <div className="relative h-[200vh]">
        {branches.map((c, i) => (
          <div
            key={c.id}
            className="sticky  mx-4 my-2 rounded-2xl border bg-white dark:bg-neutral-900 p-6 shadow-lg transition-all duration-200"
            style={{
              top: `${20 + i * 7}%`,
              zIndex: branches.length + i, // last one on top
            }}
          >
            {/* Logo */}
            <Image
              width={100}
              height={100}
              src={c.logo || "/placeholder.svg"}
              alt={c.name}
              className="mx-auto h-24 w-24 object-contain rounded-xl ring-1 ring-black/5"
            />

            {/* Branch badge */}
            <div className="absolute top-4 right-4 z-10">
              <span className="bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                Branch {c.branchNumber}
              </span>
            </div>

            {/* Title */}
            <div className="mt-4 text-center font-semibold text-lg group-hover:text-primary">
              {c.name}
            </div>

            {/* Address + link */}
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center px-3">
              {c.address}
              <Link
                className="inline-flex items-center text-primary hover:text-primary pt-1"
                href={c.location}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink size={15} className="mx-0.5 inline-block" />
              </Link>
            </p>

            {/* Phone */}
            <a
              href={`tel:${c.phoneNumber}`}
              className="flex mt-2 text-sm text-gray-800 dark:text-gray-300 justify-center"
            >
              <PhoneIcon size={15} className="m-0.5 inline-block" />{" "}
              {c.phoneNumber}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
