"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Package, Tag, Image as ImageIcon, Info, TrendingUp, Calendar, Hash } from "lucide-react"
import { formatCurrency } from "@/lib/constants/currency"

type Brand = { _id: string; name: string; description?: string; logo?: string }
type Category = { _id: string; name: string; parent?: { _id: string; name: string } | string | null; description?: string; image?: string }
type Variant = { 
  _id: string; 
  sku: string; 
  label: string; 
  price: number; 
  stock: number; 
  discount: number;
  images: string[];
  isActive: boolean;
  isOutOfStock: boolean;
}
type Product = {
  _id: string;
  name: string;
  description: string;
  ingredients?: string;
  price: number;
  stock: number;
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

interface ProductsViewAdminUIProps {
  product: Product;
  onClose: () => void;
  onEdit: () => void;
}

export default function ProductsViewAdminUI({ product, onClose, onEdit }: ProductsViewAdminUIProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const calculateDiscountedPrice = (price: number, discount: number) => {
    return price - (price * discount / 100)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={onClose}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Package className="h-5 w-5" />
              {product.name}
            </CardTitle>
            <CardDescription>Product details and information</CardDescription>
          </div>
          <Button 
            className="bg-blue-600 hover:bg-blue-700" 
            onClick={onEdit}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Product
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6">
        {/* Product Overview */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Images */}
          <div className="lg:col-span-1 space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Product Images
              </h3>
              {product.images && product.images.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {product.images.map((image, index) => (
                    <div 
                      key={index} 
                      className="relative cursor-pointer group"
                      onClick={() => setSelectedImage(image)}
                    >
                      <img 
                        src={image} 
                        alt={`Product image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border hover:border-blue-400 transition-colors"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg flex items-center justify-center">
                        <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium">
                          Click to view
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No images uploaded</p>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Quick Stats
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{product.variants?.length || 0}</div>
                  <div className="text-sm text-blue-600">Variants</div>
                </div>
                <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                                         {formatCurrency(product?.price || 0)}
                  </div>
                  <div className="text-sm text-green-600">Base Price</div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {product?.discount || 0}%
                  </div>
                  <div className="text-sm text-orange-600">Discount</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-950/20 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {product.categories?.length || 0}
                  </div>
                  <div className="text-sm text-purple-600">Categories</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Info className="h-5 w-5" />
                Basic Information
              </h3>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Product Name</label>
                  <p className="text-lg font-semibold">{product.name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">SKU/Slug</label>
                  <p className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    {product.slug}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Base Price</label>
                  <div className="flex items-center gap-2">
                                         <span className="text-lg font-semibold">{formatCurrency(product?.price || 0)}</span>
                    {product?.discount > 0 && (
                      <>
                        <span className="text-sm text-muted-foreground line-through">
                                                     {formatCurrency((product?.price || 0) + ((product?.price || 0) * (product?.discount || 0) / 100))}
                        </span>
                        <Badge variant="secondary" className="bg-red-100 text-red-800">
                          -{product?.discount}%
                        </Badge>
                      </>
                    )}
                  </div>
                  {product?.discount > 0 && (
                    <p className="text-sm text-green-600 font-medium">
                                             Final Price: {formatCurrency(calculateDiscountedPrice(product?.price || 0, product?.discount || 0))}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Stock</label>
                  <p className="text-lg font-semibold">{product.stock}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="flex items-center gap-2">
                    <Badge variant={product.isActive ? "default" : "secondary"}>
                      {product.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>

              {product.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {product.ingredients && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Ingredients</label>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {product.ingredients}
                  </p>
                </div>
              )}
            </div>

            {/* Brand & Categories */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Brand & Categories
              </h3>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Brand</label>
                  <p className="font-medium">
                    {product.brand?.name || "No brand assigned"}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Categories</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {product.categories && product.categories.length > 0 ? (
                      product.categories.map((category) => (
                        <Badge key={category._id} variant="outline">
                          {category.name}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-sm">No categories assigned</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timestamps
              </h3>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <p className="text-sm">{formatDate(product.createdAt)}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                  <p className="text-sm">{formatDate(product.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Variants Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Package className="h-5 w-5" />
            Product Variants
          </h3>
          
          {product.variants && product.variants.length > 0 ? (
            <div className="grid gap-4">
              {product.variants.map((variant, index) => (
                <div key={variant._id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium text-lg">
                        {variant.label || variant.sku || `Variant ${index + 1}`}
                      </h4>
                      <Badge variant="outline" className="font-mono">
                        {variant.sku}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={variant.isActive ? "default" : "secondary"}>
                        {variant.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {variant.isOutOfStock && (
                        <Badge variant="destructive">Out of Stock</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid sm:grid-cols-4 gap-4 mb-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Price</label>
                      <div className="flex items-center gap-2">
                                                 <span className="text-lg font-semibold">{formatCurrency(variant?.price || 0)}</span>
                        {variant?.discount > 0 && (
                          <>
                            <span className="text-sm text-muted-foreground line-through">
                              {formatCurrency((variant?.price || 0) + ((variant?.price || 0) * (variant?.discount || 0) / 100))}
                            </span>
                            <Badge variant="secondary" className="bg-red-100 text-red-800">
                              -{variant.discount}%
                            </Badge>
                          </>
                        )}
                      </div>
                      {variant.discount > 0 && (
                        <p className="text-sm text-green-600 font-medium">
                          Final: {formatCurrency(calculateDiscountedPrice(variant?.price || 0, variant?.discount || 0))}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Stock</label>
                      <p className="text-lg font-semibold">{variant.stock}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Stock</label>
                      <p className="text-lg font-semibold">{variant.stock}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Discount</label>
                      <p className="text-lg font-semibold">{variant.discount || 0}%</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${variant.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          <span className="text-sm">{variant.isActive ? 'Active' : 'Inactive'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${variant.isOutOfStock ? 'bg-red-500' : 'bg-green-500'}`}></div>
                          <span className="text-sm">{variant.isOutOfStock ? 'Out of Stock' : 'In Stock'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {variant.images && variant.images.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">Variant Images</label>
                      <div className="flex gap-2">
                        {variant.images.map((img, imgIndex) => (
                          <img 
                            key={imgIndex}
                            src={img} 
                            className="w-16 h-16 rounded object-cover border cursor-pointer hover:border-blue-400 transition-colors" 
                            alt={`Variant image ${imgIndex + 1}`}
                            onClick={() => setSelectedImage(img)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
              <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No variants created yet</p>
              <p className="text-sm">Create variants to offer different sizes, weights, or options</p>
            </div>
          )}
        </div>
      </CardContent>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img 
              src={selectedImage} 
              alt="Full size view"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white"
              onClick={() => setSelectedImage(null)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}

