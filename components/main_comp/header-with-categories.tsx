"use client";

import { getAllCategories } from "@/database/data-service";
import { Header } from "@/components/main_comp/header";
import { useEffect, useState } from "react";

export function HeaderWithCategories() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getAllCategories().then((data) => {
      console.debug("setCatgories", categories);
      setCategories(data as any);
    });
  }, []);

  return <Header categories={categories as any} />;
}
