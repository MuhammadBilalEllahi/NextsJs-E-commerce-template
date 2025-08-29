"use client"

import { Header } from "./header"
import type { Category } from "@/mock_data/mock-data"

export function HeaderWithCategories({ categories }: { categories: Category[] }) {
  return <Header categories={categories} />
}
