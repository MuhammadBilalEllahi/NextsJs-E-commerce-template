"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Eye, Power, PowerOff } from "lucide-react"
import { fetchBrands, createBrand, updateBrand, deleteBrand, toggleBrandStatus } from "@/lib/api/admin/brand/brand"
import BrandCreateModal from "@/components/admin/brand/brand-create-modal"
import BrandEditModal from "@/components/admin/brand/brand-edit-modal"
import BrandDeleteModal from "@/components/admin/brand/brand-delete-modal"

type Brand = {
  _id: string
  name: string
  description: string
  logo?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function BrandsAdminPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null)

  // Fetch brands on component mount
  useEffect(() => {
    loadBrands()
  }, [])

  const loadBrands = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchBrands()
      setBrands(data)
    } catch (error) {
      console.error("Failed to fetch brands:", error)
      setError("Failed to load brands. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBrand = async (brandData: { name: string; description: string; logo: File | null }) => {
    try {
      await createBrand(brandData)
      await loadBrands()
      setShowCreateModal(false)
    } catch (error) {
      console.error("Failed to create brand:", error)
    }
  }

  const handleEditBrand = async (brandData: { name: string; description: string; logo: File | null }) => {
    if (!selectedBrand) return
    
    try {
      await updateBrand(selectedBrand._id, brandData)
      await loadBrands()
      setShowEditModal(false)
      setSelectedBrand(null)
    } catch (error) {
      console.error("Failed to update brand:", error)
    }
  }

  const handleDeleteBrand = async () => {
    if (!selectedBrand) return
    
    try {
      await deleteBrand(selectedBrand._id)
      await loadBrands()
      setShowDeleteModal(false)
      setSelectedBrand(null)
    } catch (error) {
      console.error("Error deleting brand:", error)
    }
  }

  const handleToggleStatus = async (brandId: string, currentStatus: boolean) => {
    try {
      await toggleBrandStatus(brandId, !currentStatus)
      await loadBrands()
    } catch (error) {
      console.error("Error toggling brand status:", error)
    }
  }

  const openEditModal = (brand: Brand) => {
    setSelectedBrand(brand)
    setShowEditModal(true)
  }

  const openDeleteModal = (brand: Brand) => {
    setSelectedBrand(brand)
    setShowDeleteModal(true)
  }

  // Filter brands based on search query and status filter
  const filteredBrands = brands.filter(brand => {
    const matchesSearch = brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         brand.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = !statusFilter || 
                         (statusFilter === "active" && brand.isActive) ||
                         (statusFilter === "inactive" && !brand.isActive)
    
    return matchesSearch && matchesStatus
  })

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Brand Management</CardTitle>
              <CardDescription>Create, edit, and manage your product brands</CardDescription>
            </div>
            <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Brand
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          {/* Search and Filters */}
          <div className="grid md:grid-cols-[1fr_200px] gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select 
              className="rounded border px-3 py-2 bg-transparent text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>

          {/* Status Summary */}
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="default">Active</Badge>
              <span className="text-gray-600">{brands.filter(b => b.isActive).length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Inactive</Badge>
              <span className="text-gray-600">{brands.filter(b => !b.isActive).length}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Total:</span>
              <span className="font-medium">{brands.length}</span>
            </div>
          </div>

          {/* Brands Grid */}
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading brands...</div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-500 mb-4">{error}</div>
              <Button onClick={loadBrands} variant="outline">
                Try Again
              </Button>
            </div>
          ) : filteredBrands.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500">
                {searchQuery || statusFilter ? "No brands found matching your filters." : "No brands found. Create your first brand!"}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBrands.map((brand) => (
                <Card key={brand._id} className="relative group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {brand.logo ? (
                          <img
                            src={brand.logo}
                            alt={brand.name}
                            className="w-12 h-12 rounded-lg object-cover border"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                            <span className="text-gray-400 text-sm font-medium">
                              {brand.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-lg">{brand.name}</h3>
                          <Badge variant={brand.isActive ? "default" : "secondary"}>
                            {brand.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {brand.description || "No description provided"}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        Created: {new Date(brand.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Toggle Status Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(brand._id, brand.isActive)}
                          className={`h-8 w-8 p-0 ${
                            brand.isActive 
                              ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50" 
                              : "text-green-600 hover:text-green-700 hover:bg-green-50"
                          }`}
                          title={brand.isActive ? "Deactivate brand" : "Activate brand"}
                        >
                          {brand.isActive ? <PowerOff className="h-3 w-3" /> : <Power className="h-3 w-3" />}
                        </Button>
                        
                        {/* Edit Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(brand)}
                          className="h-8 w-8 p-0"
                          title="Edit brand"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        
                        {/* Delete Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteModal(brand)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          title="Delete brand"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <BrandCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateBrand}
      />

      <BrandEditModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedBrand(null)
        }}
        onSubmit={handleEditBrand}
        brand={selectedBrand}
      />

      <BrandDeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setSelectedBrand(null)
        }}
        onConfirm={handleDeleteBrand}
        brand={selectedBrand}
      />
    </div>
  )
}
