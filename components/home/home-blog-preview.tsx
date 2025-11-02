"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import type { Blog } from "@/types/types";
import Image from "next/image";

export function HomeBlogPreview({ blogs }: { blogs: Blog[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!blogs || blogs.length === 0) return;
    // Ensure index is in range when blogs change
    setCurrentIndex((prev) => (prev >= blogs.length ? 0 : prev));
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % blogs.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [blogs.length]);

  if (!blogs || blogs.length === 0) {
    return null;
  }

  const featuredBlog = blogs[currentIndex];
  const otherBlogs = blogs
    .filter((_, index) => index !== currentIndex)
    .slice(0, 5);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">From our Blog</h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          Tips, recipes, and stories from the spice route.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left side - Large featured blog */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl overflow-hidden border shadow-sm">
          <Link href={`/blog/${featuredBlog?.slug}`} className="block">
            <div className="relative">
              <Image
                width={100}
                height={100}
                src={featuredBlog?.image || "/placeholder.svg"}
                alt={featuredBlog?.title}
                className="w-full h-64 object-cover"
              />
              <div className="absolute top-4 left-4 bg-black/60 text-white text-xs px-2 py-1 rounded">
                2 Min Read
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 text-sm text-primary mb-3">
                <span>🌿</span>
                <span>Health</span>
              </div>
              <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-200 mb-3">
                {featuredBlog?.title}
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 leading-relaxed">
                {featuredBlog?.excerpt}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  NOV 16, 2024
                </span>
                <span className="text-primary text-sm font-medium hover:underline">
                  Read More
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Right side - List of smaller blogs */}
        <div className="space-y-4">
          {otherBlogs.map((blog, index) => (
            <div
              key={blog.slug}
              className="bg-white dark:bg-neutral-900 rounded-xl border shadow-sm overflow-hidden"
            >
              <Link href={`/blog/${blog.slug}`} className="block">
                <div className="flex">
                  <div className="relative w-24 h-20 flex-shrink-0">
                    <Image
                      width={100}
                      height={100}
                      src={blog.image || "/placeholder.svg"}
                      alt={blog.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1 left-1 bg-black/60 text-white text-xs px-1 py-0.5 rounded text-[10px]">
                      2 Min Read
                    </div>
                  </div>
                  <div className="flex-1 p-4">
                    <h4 className="font-semibold text-sm text-neutral-800 dark:text-neutral-200 mb-2 line-clamp-2">
                      {blog.title}
                    </h4>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3 line-clamp-2 leading-relaxed">
                      {blog.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-primary">
                        <span>🌿</span>
                        <span>Health</span>
                      </div>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        NOV {13 - index}, 2024
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}

          <div className="pt-4">
            <Link
              href="/blog"
              className="text-primary hover:underline font-medium text-sm"
            >
              Explore all posts →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
