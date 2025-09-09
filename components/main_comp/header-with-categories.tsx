"use client"

import { getAllCategories } from "@/database/data-service"
import { Header } from "@/components/main_comp/header"
import { useEffect, useState } from "react";

export function HeaderWithCategories() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getAllCategories().then((data)=>{
      console.log("setCatgories", categories)
      setCategories(data as any)
    });
  }, []);
  // const [categories] = await Promise.all([
  //   getAllCategories()
  // ])

  return <Header categories={categories as any} />
}
