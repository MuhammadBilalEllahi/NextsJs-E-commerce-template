"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Plus, X, Edit, Eye, Save, ArrowLeft } from "lucide-react"
import { API_URL_CATEGORY_ADMIN } from "@/lib/api/admin/category/categories"
import { fetchCategories, createCategory, updateCategory } from "@/lib/api/admin/category/categories"
import { createBrand } from "@/lib/api/admin/brand/brand"

type Brand = { _id: string; name: string; description?: string; logo?: string }
type Category = { _id: string; name: string; parent?: { _id: string; name: string } | string | null; description?: string; image?: string }
type Variant = { 
  _id?: string; 
  sku: string; 
  label: string; 
  price: number; 
  stock: number; 
  discount: number;
  images: string[];
  isActive: boolean;
  isOutOfStock: boolean;
  newImages?: File[];
}
type Product = {
  _id: string;
  name: string;
  description: string;
  ingredients?: string;
  price: number;
  discount: number;
  brand: { _id: string; name: string };
  categories: { _id: string; name: string }[];
  images: string[];
  variants: Variant[];
  isActive: boolean;
  isOutOfStock: boolean;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

interface ProductsEditAdminUIProps {
  product: Product;
  onClose: () => void;
  onUpdate: () => void;
}

export default function ProductsEditAdminUI({ product, onClose, onUpdate }: ProductsEditAdminUIProps) {
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [variants, setVariants] = useState<Variant[]>([])
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    name: product.name,
    description: product.description,
    ingredients: product.ingredients || "",
    price: product.price,
    discount: product.discount || 0,
    brand: product.brand?._id || "",
    categories: product.categories?.map(c => c._id) || [],
    images: product.images || [],
    isActive: product.isActive || false,
    isOutOfStock: product.isOutOfStock || false,
    slug: product.slug
  } as {
    name: string;
    description: string;
    ingredients: string;
    price: number;
    discount: number;
    brand: string;
    categories: string[];
    images: (string | File)[];
    isActive: boolean;
    isOutOfStock: boolean;
    slug: string;
  })

  // modal state
  const [brandOpen, setBrandOpen] = useState(false)
  const [catOpen, setCatOpen] = useState(false)
  const [variantOpen, setVariantOpen] = useState(false)
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null)

  // Initialize variants from product
  useEffect(() => {
    setVariants(product.variants?.map(v => ({
      ...v,
      newImages: []
    })) || [])
  }, [product])

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

  // ===== UPDATE PRODUCT =====
  const updateProduct = async () => {
    if (!form.name || !form.price || form.categories.length === 0) {
      alert("Please fill in all required fields")
      return
    }

    setLoading(true)
    try {
      const fd = new FormData()
      fd.append("id", product._id)
      fd.append("name", form.name)
      fd.append("description", form.description)
      fd.append("ingredients", form.ingredients)
      fd.append("price", String(form.price))
      fd.append("discount", String(form.discount))
      fd.append("isActive", String(form.isActive))
      fd.append("isOutOfStock", String(form.isOutOfStock))
      if (form.brand) fd.append("brand", form.brand)
      
      // Append each category individually
      form.categories.forEach(categoryId => {
        fd.append("categories", categoryId)
      })
      
      // Append new product images if any
      form.images.forEach((image, index) => {
        if (typeof image === 'string') {
          fd.append("existingImages", image)
        } else {
          fd.append("images", image)
        }
      })

      const res = await fetch("/api/admin/product", { method: "PUT", body: fd })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.error || "Failed to update product")
      }
      
      alert("Product updated successfully ✅")
      onUpdate()
    } catch (err: any) {
      alert("Error updating product: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  // ===== VARIANT MANAGEMENT =====
  const addVariant = () => {
    setEditingVariant({
      sku: "",
      label: "",
      price: 0,
      stock: 0,
      discount: 0,
      images: [],
      isActive: true,
      isOutOfStock: false,
      newImages: []
    })
    setVariantOpen(true)
  }

  const editVariant = (variant: Variant) => {
    setEditingVariant({ ...variant, newImages: [] })
    setVariantOpen(true)
  }

  const saveVariant = async () => {
    if (!editingVariant || !editingVariant.sku || editingVariant.price <= 0) {
      alert("Please fill in all required fields")
      return
    }

    try {
      const fd = new FormData()
      
      if (editingVariant._id) {
        // Update existing variant
        fd.append("id", editingVariant._id)
        fd.append("isActive", String(editingVariant.isActive))
        fd.append("isOutOfStock", String(editingVariant.isOutOfStock))
        fd.append("stock", String(editingVariant.stock))
        fd.append("price", String(editingVariant.price))
        fd.append("discount", String(editingVariant.discount))
        fd.append("label", editingVariant.label)
        
        // Append new images if any
        editingVariant.newImages?.forEach(file => {
          fd.append("images", file)
        })
        
        const res = await fetch("/api/admin/variant", { method: "PUT", body: fd })
        if (!res.ok) throw new Error("Failed to update variant")
        
        const updatedVariant = await res.json()
        setVariants(prev => prev.map(v => 
          v._id === editingVariant._id ? { ...v, ...updatedVariant.variant } : v
        ))
      } else {
        // Create new variant
        fd.append("product", product._id)
        fd.append("sku", editingVariant.sku)
        fd.append("label", editingVariant.label)
        fd.append("price", String(editingVariant.price))
        fd.append("stock", String(editingVariant.stock))
        fd.append("discount", String(editingVariant.discount))
        fd.append("isActive", String(editingVariant.isActive))
        fd.append("isOutOfStock", String(editingVariant.isOutOfStock))
        
        // Append images if any
        editingVariant.newImages?.forEach(file => {
          fd.append("images", file)
        })
        
        const res = await fetch("/api/admin/variant", { method: "POST", body: fd })
        if (!res.ok) throw new Error("Failed to create variant")
        
        const newVariant = await res.json()
        setVariants(prev => [...prev, { ...newVariant.variant, newImages: [] }])
      }
      
      setVariantOpen(false)
      setEditingVariant(null)
      alert("Variant saved successfully ✅")
    } catch (err: any) {
      alert("Error saving variant: " + err.message)
    }
  }

  const deleteVariant = async (variantId: string) => {
    if (!confirm("Are you sure you want to delete this variant?")) return
    
    try {
      const fd = new FormData()
      fd.append("id", variantId)
      
      const res = await fetch("/api/admin/variant", { method: "DELETE", body: fd })
      if (!res.ok) throw new Error("Failed to delete variant")
      
      setVariants(prev => prev.filter(v => v._id !== variantId))
      alert("Variant deleted successfully ✅")
    } catch (err: any) {
      alert("Error deleting variant: " + err.message)
    }
  }

  // ===== create BRAND =====
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

  // ===== create CATEGORY =====
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={onClose}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              Edit Product: {product.name}
            </CardTitle>
            <CardDescription>Update product details, variants, and settings</CardDescription>
          </div>
          <Button 
            className="bg-green-600 hover:bg-green-700" 
            onClick={updateProduct}
            disabled={loading}
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6">
        {/* Core Product Fields */}
        <div className="grid gap-4">
          <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input 
                id="name"
                placeholder="Product name" 
                value={form.name} 
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">Base Price *</Label>
              <Input 
                id="price"
                type="number" 
                step="0.01" 
                placeholder="Price" 
                value={form.price || ""} 
                onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} 
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discount">Discount (%)</Label>
              <Input 
                id="discount"
                type="number" 
                min="0"
                max="100"
                step="0.01" 
                placeholder="0" 
                value={form.discount || ""} 
                onChange={e => setForm(f => ({ ...f, discount: Number(e.target.value) }))} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input 
                id="slug"
                placeholder="product-slug" 
                value={form.slug} 
                disabled
                className="bg-gray-50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description"
              placeholder="Product description..." 
              rows={4}
              value={form.description} 
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ingredients">Ingredients</Label>
            <Textarea 
              id="ingredients"
              placeholder="List of ingredients, nutritional information, etc..." 
              rows={3}
              value={form.ingredients} 
              onChange={e => setForm(f => ({ ...f, ingredients: e.target.value }))} 
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="isActive" 
              checked={form.isActive}
              onCheckedChange={(checked) => setForm(f => ({ ...f, isActive: checked as boolean }))}
            />
            <Label htmlFor="isActive">Product is active and visible to customers</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="isOutOfStock" 
              checked={form.isOutOfStock}
              onCheckedChange={(checked) => setForm(f => ({ ...f, isOutOfStock: checked as boolean }))}
            />
            <Label htmlFor="isOutOfStock">Product is out of stock</Label>
          </div>
        </div>

        {/* Brand and Categories */}
        <div className="grid gap-4">
          <h3 className="text-lg font-semibold border-b pb-2">Brand & Categories</h3>
          
          {/* Brand selector + modal */}
          <div className="flex items-center gap-2">
            <div className="flex-1 space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Select value={form.brand} onValueChange={val => setForm(f => ({ ...f, brand: val }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map(b => <SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {form.brand && (
              <Button 
                size="icon" 
                variant="outline" 
                onClick={() => setForm(f => ({ ...f, brand: "" }))}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
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
            <Label>Categories *</Label>
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
                      <Input type="file" accept="image/*" onChange={e => setCatDraft(d => ({ ...d, image: e.target.files?.[0] || undefined }))} />
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
        </div>

        {/* Product Images */}
        <div className="grid gap-4">
          <h3 className="text-lg font-semibold border-b pb-2">Product Images</h3>
          
          <div className="grid gap-2">
            <Label>Add new images</Label>
            <Input 
              type="file" 
              multiple 
              accept="image/*" 
              onChange={e => addProductImages(e.target.files)}
            />
          </div>
          
          {form.images.length > 0 && (
            <div className="grid gap-2">
              <Label>Current Images</Label>
              <div className="flex flex-wrap gap-2">
                {form.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={typeof image === 'string' ? image : URL.createObjectURL(image)} 
                      className="w-20 h-20 rounded object-cover border" 
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
            </div>
          )}
        </div>

        {/* Variants Management */}
        <div className="grid gap-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="text-lg font-semibold">Variants</h3>
            <Button size="sm" variant="outline" onClick={addVariant}>
              <Plus className="h-4 w-4 mr-2" />
              Add Variant
            </Button>
          </div>
          
          {variants.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No variants yet. Click "Add Variant" to create your first variant.
            </div>
          ) : (
            <div className="grid gap-4">
              {variants.map((variant, index) => (
                <div key={variant._id || index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">
                        {variant.label || variant.sku || `Variant ${index + 1}`}
                      </h4>
                      <span className="text-sm text-muted-foreground">({variant.sku})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => editVariant(variant)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => deleteVariant(variant._id!)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Price:</span> ${variant.price}
                    </div>
                    <div>
                      <span className="font-medium">Stock:</span> {variant.stock}
                    </div>
                    <div>
                      <span className="font-medium">Discount:</span> {variant.discount}%
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Checkbox 
                          checked={variant.isActive}
                          disabled
                        />
                        <span className="text-xs">Active</span>
                        <Checkbox 
                          checked={variant.isOutOfStock}
                          disabled
                        />
                        <span className="text-xs">Out of Stock</span>
                      </div>
                    </div>
                  </div>
                  
                  {variant.images.length > 0 && (
                    <div className="mt-3">
                      <span className="text-sm font-medium">Images:</span>
                      <div className="flex gap-2 mt-2">
                        {variant.images.map((img, imgIndex) => (
                          <img 
                            key={imgIndex}
                            src={img} 
                            className="w-12 h-12 rounded object-cover border" 
                            alt={`Variant image ${imgIndex + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      {/* Variant Edit/Create Modal */}
      <Dialog open={variantOpen} onOpenChange={setVariantOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingVariant?._id ? "Edit Variant" : "Create New Variant"}
            </DialogTitle>
          </DialogHeader>
          
          {editingVariant && (
            <div className="grid gap-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="variant-sku">SKU *</Label>
                  <Input 
                    id="variant-sku"
                    placeholder="SKU" 
                    value={editingVariant.sku} 
                    onChange={e => setEditingVariant(prev => prev ? { ...prev, sku: e.target.value } : prev)} 
                    disabled={!!editingVariant._id} // Can't change SKU for existing variants
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="variant-label">Label</Label>
                  <Input 
                    id="variant-label"
                    placeholder="e.g., 500g, 1kg" 
                    value={editingVariant.label} 
                    onChange={e => setEditingVariant(prev => prev ? { ...prev, label: e.target.value } : prev)} 
                  />
                </div>
              </div>
              
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="variant-price">Price *</Label>
                  <Input 
                    id="variant-price"
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    value={editingVariant.price || ""} 
                    onChange={e => setEditingVariant(prev => prev ? { ...prev, price: Number(e.target.value) } : prev)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="variant-stock">Stock</Label>
                  <Input 
                    id="variant-stock"
                    type="number" 
                    placeholder="0" 
                    value={editingVariant.stock || ""} 
                    onChange={e => setEditingVariant(prev => prev ? { ...prev, stock: Number(e.target.value) } : prev)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="variant-discount">Discount (%)</Label>
                  <Input 
                    id="variant-discount"
                    type="number" 
                    min="0"
                    max="100"
                    step="0.01" 
                    placeholder="0" 
                    value={editingVariant.discount || ""} 
                    onChange={e => setEditingVariant(prev => prev ? { ...prev, discount: Number(e.target.value) } : prev)} 
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="variant-active" 
                    checked={editingVariant.isActive}
                    onCheckedChange={(checked) => setEditingVariant(prev => prev ? { ...prev, isActive: checked as boolean } : prev)}
                  />
                  <Label htmlFor="variant-active">Active</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="variant-outofstock" 
                    checked={editingVariant.isOutOfStock}
                    onCheckedChange={(checked) => setEditingVariant(prev => prev ? { ...prev, isOutOfStock: checked as boolean } : prev)}
                  />
                  <Label htmlFor="variant-outofstock">Out of Stock</Label>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Variant Images</Label>
                <Input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={e => setEditingVariant(prev => prev ? { 
                    ...prev, 
                    newImages: Array.from(e.target.files || [])
                  } : prev)}
                />
                {editingVariant.newImages && editingVariant.newImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {editingVariant.newImages.map((file, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={URL.createObjectURL(file)} 
                          className="w-16 h-16 rounded object-cover border" 
                          alt={`New image ${index + 1}`}
                        />
                        <button
                          type="button"
                          onClick={() => setEditingVariant(prev => prev ? { 
                            ...prev, 
                            newImages: prev.newImages?.filter((_, i) => i !== index) 
                          } : prev)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setVariantOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-green-600 hover:bg-green-700" onClick={saveVariant}>
                  {editingVariant._id ? "Update Variant" : "Create Variant"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
