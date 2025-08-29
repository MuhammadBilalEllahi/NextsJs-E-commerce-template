// "use client"

import { getAllCategories } from "@/database/data-service"
import { Header } from "@/components/main_comp/header"

export async function HeaderWithCategories() {
  const [categories] = await Promise.all([
    getAllCategories()
  ])

  return <Header categories={categories as any} />
}
