"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X } from "lucide-react"
import { API_URL_CATEGORY_ADMIN } from "@/lib/api/admin/category/categories"
import { fetchCategories, createCategory, updateCategory } from "@/lib/api/admin/category/categories"
import { createBrand } from "@/lib/api/admin/brand/brand"

type Brand = { _id: string; name: string; description?: string; logo?: string }
type Category = { _id: string; name: string; parent?: { _id: string; name: string } | string | null; description?: string; image?: string }
type VariantDraft = { sku: string; label: string; price: number; stock: number; images: File[] }

export default function ProductsCreateAdminUI() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [variants, setVariants] = useState<VariantDraft[]>([])

  const [form, setForm] = useState({
    name: "",
    description: "",
    ingredients: "",
    price: 0,
    brand: "",
    categories: [] as string[],
    images: [] as File[],
    isActive: false,
    isOutOfStock: false
  })

  // modal state
  const [brandOpen, setBrandOpen] = useState(false)
  const [catOpen, setCatOpen] = useState(false)

  // --- fetch brands & categories ---
  useEffect(() => {
    async function load() {
      const [bRes, cRes] = await Promise.all([
        fetch("/api/admin/brand").then(r => r.json()),
        fetch(API_URL_CATEGORY_ADMIN).then(r => r.json()),
      ])
      setBrands(bRes.brands || [])
      setCategories(cRes.categories || [])
    }
    load()
  }, [])

  // ===== create PRODUCT =====
  const saveProduct = async () => {
    if (!form.name || !form.price || form.categories.length === 0) return

    const fd = new FormData()
    fd.append("name", form.name)
    fd.append("description", form.description)
    fd.append("ingredients", form.ingredients)
    fd.append("price", String(form.price))
    fd.append("isActive", String(form.isActive))
    fd.append("isOutOfStock", String(form.isOutOfStock))
    if (form.brand) fd.append("brand", form.brand)
    
    // Append each category individually
    form.categories.forEach(categoryId => {
      fd.append("categories", categoryId)
    })
    
    // Append all product images
    form.images.forEach((file, index) => {
      fd.append("images", file)
    })

    // send variants metadata and files
    fd.append("variants", JSON.stringify(variants.map(v => ({
      sku: v.sku, label: v.label, price: v.price, stock: v.stock
    }))))
    
    // Append all variant images
    variants.forEach((v, variantIndex) => {
      v.images.forEach((file, imageIndex) => {
        fd.append(`variantImages[${variantIndex}]`, file)
      })
    })

    const res = await fetch("/api/admin/product", { method: "POST", body: fd })
    if (!res.ok) {
      const err = await res.json().catch(() => null)
      alert(err?.error || "Failed to create product")
      return
    }
    alert("Product created ✅")
    // reset
    setForm({ name: "", description: "", ingredients: "", price: 0, brand: "", categories: [], images: [], isActive: false, isOutOfStock: false })
    setVariants([])
  }

  // ===== create BRAND (name, description, logo) =====
  const [brandDraft, setBrandDraft] = useState<{ name: string; description: string; logo?: File }>({ name: "", description: "" })
  const brandLogoPreview = useMemo(() => brandDraft.logo ? URL.createObjectURL(brandDraft.logo) : "", [brandDraft.logo])

  const handleBrandCreate = async () => {
    const data = {
      name: brandDraft.name,
      description: brandDraft.description,
      logo: brandDraft.logo as any
    }
    const created = await createBrand(data)
    setBrands(prev => [...prev, created])
    setForm(f => ({ ...f, brand: created._id }))
    setBrandOpen(false)
    setBrandDraft({ name: "", description: "" })
  }

  // ===== create CATEGORY (name, parent, description, image) =====
  const [catDraft, setCatDraft] = useState<{ name: string; parent?: string; description: string; image?: File }>({ name: "", description: "" })
  const catImagePreview = useMemo(() => catDraft.image ? URL.createObjectURL(catDraft.image) : "", [catDraft.image])

  const handleCreateCategory = async () => {
    if (!catDraft.name) return
    try {
      const categoryData: any = {
        name: catDraft.name,
        parent: catDraft.parent,
        description: catDraft.description,
      }
      
      if (catDraft.image) {
        categoryData.image = catDraft.image
      }

      const created = await createCategory(categoryData)

      setCategories(prev => [created, ...prev])
      setCatOpen(false)
      setCatDraft({ name: "", description: "" })
    } catch (err: any) {
      alert(err.message || "Failed to create category")
    }
  }

  // ===== CATEGORY SELECTION FUNCTIONS =====
  const [selectedCategoryId, setSelectedCategoryId] = useState("")

  const addCategory = () => {
    if (selectedCategoryId && !form.categories.includes(selectedCategoryId)) {
      setForm(f => ({
        ...f,
        categories: [...f.categories, selectedCategoryId]
      }))
      setSelectedCategoryId("") // Reset selection
    }
  }

  const removeCategory = (categoryId: string) => {
    setForm(f => ({
      ...f,
      categories: f.categories.filter(id => id !== categoryId)
    }))
  }

  // ===== PRODUCT IMAGE FUNCTIONS =====
  const addProductImages = (newFiles: FileList | null) => {
    if (!newFiles) return;
    
    const filesArray = Array.from(newFiles);
    setForm(f => ({
      ...f,
      images: [...f.images, ...filesArray]
    }));
  };

  const removeProductImage = (index: number) => {
    setForm(f => ({
      ...f,
      images: f.images.filter((_, i) => i !== index)
    }));
  };

  // ===== VARIANT FUNCTIONS =====
  const addVariant = () =>
    setVariants(v => [...v, { sku: "", label: "", price: 0, stock: 0, images: [] }])

  const removeVariant = (idx: number) =>
    setVariants(v => v.filter((_, i) => i !== idx))

  const addVariantImages = (variantIndex: number, newFiles: FileList | null) => {
    if (!newFiles) return;
    
    const filesArray = Array.from(newFiles);
    setVariants(prev => prev.map((v, i) => 
      i === variantIndex 
        ? { ...v, images: [...v.images, ...filesArray] }
        : v
    ));
  };

  const removeVariantImage = (variantIndex: number, imageIndex: number) => {
    setVariants(prev => prev.map((v, i) => 
      i === variantIndex 
        ? { ...v, images: v.images.filter((_, j) => j !== imageIndex) }
        : v
    ));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Management</CardTitle>
        <CardDescription>Create and manage products</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {/* core fields */}
        <Input placeholder="Product name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        <Textarea placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        <Textarea placeholder="Ingredients & Nutritional Info (optional)" value={form.ingredients} onChange={e => setForm(f => ({ ...f, ingredients: e.target.value }))} />
        <Input type="number" step="0.01" placeholder="Price" value={form.price || "" as any} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} />

        {/* Status toggles */}
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
              className="rounded"
            />
            <label htmlFor="isActive" className="text-sm font-medium">Product is active</label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isOutOfStock"
              checked={form.isOutOfStock}
              onChange={e => setForm(f => ({ ...f, isOutOfStock: e.target.checked }))}
              className="rounded"
            />
            <label htmlFor="isOutOfStock" className="text-sm font-medium">Product is out of stock</label>
          </div>
        </div>

        {/* Brand selector + modal */}
        <div className="flex items-center gap-2">
          <Select value={form.brand} onValueChange={val => setForm(f => ({ ...f, brand: val }))}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select brand" />
            </SelectTrigger>
            <SelectContent>
              {brands.map(b => <SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Dialog open={brandOpen} onOpenChange={setBrandOpen}>
            <DialogTrigger asChild>
              <Button size="icon" variant="outline"><Plus className="h-4 w-4" /></Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader><DialogTitle>New Brand</DialogTitle></DialogHeader>
              <div className="grid gap-3">
                <Input placeholder="Brand name" value={brandDraft.name} onChange={e => setBrandDraft(d => ({ ...d, name: e.target.value }))} />
                <Textarea placeholder="Description" value={brandDraft.description} onChange={e => setBrandDraft(d => ({ ...d, description: e.target.value }))} />
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Logo</label>
                  <Input type="file" accept="image/*" onChange={e => setBrandDraft(d => ({ ...d, logo: e.target.files?.[0] || undefined }))} />
                  {brandLogoPreview ? (
                    <div className="relative w-20 h-20">
                      <img src={brandLogoPreview} alt="logo preview" className="w-20 h-20 object-cover rounded-md border" />
                    </div>
                  ) : <span className="text-xs text-neutral-500">Optional</span>}
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setBrandOpen(false)}>Cancel</Button>
                  <Button className="bg-green-600 hover:bg-green-700" onClick={handleBrandCreate}>Save Brand</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Category selector + modal */}
        <div className="grid gap-2">
          <label className="text-sm font-medium">Categories</label>
          <div className="flex items-center gap-2">
            <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category to add" />
              </SelectTrigger>
              <SelectContent>
                {categories
                  .filter(c => !form.categories.includes(c._id))
                  .map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button 
              onClick={addCategory} 
              disabled={!selectedCategoryId}
              size="icon" 
              variant="outline"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Dialog open={catOpen} onOpenChange={setCatOpen}>
              <DialogTrigger asChild>
                <Button size="icon" variant="outline"><Plus className="h-4 w-4" /></Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[520px]">
                <DialogHeader><DialogTitle>New Category</DialogTitle></DialogHeader>
                <div className="grid gap-3">
                  <Input placeholder="Category name" value={catDraft.name} onChange={e => setCatDraft(d => ({ ...d, name: e.target.value }))} />
                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium">Parent (optional)</label>
                    <Select
                      value={catDraft.parent ?? "none"}
                      onValueChange={(val) =>
                        setCatDraft(d => ({ ...d, parent: val === "none" ? undefined : val }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="No parent" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No parent</SelectItem>
                        {categories.map(c => (
                          <SelectItem key={c._id} value={c._id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Textarea placeholder="Description" value={catDraft.description} onChange={e => setCatDraft(d => ({ ...d, description: e.target.value }))} />
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Image</label>
                    <Input type="file" accept="image/*" onChange={e => setCatDraft(d => ({ ...d, image: e.target.files?.[0] }))} />
                    {catImagePreview ? (
                      <img src={catImagePreview} alt="category preview" className="w-24 h-24 object-cover rounded-md border" />
                    ) : <span className="text-xs text-neutral-500">Optional</span>}
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setCatOpen(false)}>Cancel</Button>
                    <Button className="bg-green-600 hover:bg-green-700" onClick={handleCreateCategory}>Save Category</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Selected categories display */}
          {form.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {form.categories.map(categoryId => {
                const category = categories.find(c => c._id === categoryId);
                return (
                  <div
                    key={categoryId}
                    className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    <span>{category?.name || categoryId}</span>
                    <button
                      type="button"
                      onClick={() => removeCategory(categoryId)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Product images - UPDATED FOR MULTIPLE UPLOADS */}
        <div className="grid gap-2">
          <label className="text-sm font-medium">Product images</label>
          <Input 
            type="file" 
            multiple 
            accept="image/*" 
            onChange={e => addProductImages(e.target.files)}
          />
          {form.images.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {form.images.map((file, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={URL.createObjectURL(file)} 
                    className="w-16 h-16 rounded object-cover border" 
                    alt={`Product image ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeProductImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Variants - UPDATED FOR MULTIPLE IMAGE UPLOADS */}
        <div className="grid gap-2">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Variants</h4>
            <Button size="sm" variant="outline" onClick={addVariant}>+ Add Variant</Button>
          </div>
          {variants.map((v, variantIndex) => (
            <div key={variantIndex} className="grid gap-2 border p-3 rounded">
              <div className="grid sm:grid-cols-2 gap-2">
                <Input 
                  placeholder="SKU" 
                  value={v.sku} 
                  onChange={e => setVariants(prev => prev.map((x, j) => j === variantIndex ? { ...x, sku: e.target.value } : x))} 
                />
                <Input 
                  placeholder="Label" 
                  value={v.label} 
                  onChange={e => setVariants(prev => prev.map((x, j) => j === variantIndex ? { ...x, label: e.target.value } : x))} 
                />
                <Input 
                  type="number" 
                  step="0.01" 
                  placeholder="Price" 
                  value={v.price || "" as any} 
                  onChange={e => setVariants(prev => prev.map((x, j) => j === variantIndex ? { ...x, price: Number(e.target.value) } : x))} 
                />
                <Input 
                  type="number" 
                  placeholder="Stock" 
                  value={v.stock || "" as any} 
                  onChange={e => setVariants(prev => prev.map((x, j) => j === variantIndex ? { ...x, stock: Number(e.target.value) } : x))} 
                />
              </div>
              
              {/* Variant images - UPDATED FOR MULTIPLE UPLOADS */}
              <div className="grid gap-1.5">
                <label className="text-sm font-medium">Variant images</label>
                <Input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={e => addVariantImages(variantIndex, e.target.files)}
                />
                {v.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {v.images.map((file, imageIndex) => (
                      <div key={imageIndex} className="relative group">
                        <img 
                          src={URL.createObjectURL(file)} 
                          className="w-14 h-14 rounded object-cover border" 
                          alt={`Variant image ${imageIndex + 1}`}
                        />
                        <button
                          type="button"
                          onClick={() => removeVariantImage(variantIndex, imageIndex)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex justify-end">
                <Button size="icon" variant="ghost" onClick={() => removeVariant(variantIndex)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Button className="bg-green-600 hover:bg-green-700" onClick={saveProduct}>Save Product</Button>
      </CardContent>
    </Card>
  )
}