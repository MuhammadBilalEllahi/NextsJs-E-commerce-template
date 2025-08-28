"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit, Trash2, Eye, Plus, RefreshCw, Calendar, Link, Image as ImageIcon, Settings } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { API_URL_BANNER_ADMIN, purgeRedisCache } from "@/lib/api/admin/banner/banner"

interface Banner {
  _id: string;
  title: string;
  description: string;
  image: string;
  link: string;
  isActive: boolean;
  expiresAt: string;
  showTitle: boolean;
  showLink: boolean;
  showDescription: boolean;
  mimeType: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateBannerData {
  title: string;
  description: string;
  image: File | null;
  link: string;
  isActive: boolean;
  expiresAt: string;
  showTitle: boolean;
  showLink: boolean;
  showDescription: boolean;
}

export default function BannerAdminPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [viewingBanner, setViewingBanner] = useState<Banner | null>(null)
  const [purgingRedis, setPurgingRedis] = useState(false)

  // Fetch banners
  const fetchBanners = async () => {
    try {
      setLoading(true)
      const response = await fetch(API_URL_BANNER_ADMIN)
      if (!response.ok) {
        throw new Error("Failed to fetch banners")
      }
      const data = await response.json()
      setBanners(data.banners || [])
    } catch (err: any) {
      setError(err.message)
      console.error("Error fetching banners:", err)
    } finally {
      setLoading(false)
    }
  }

  // Purge Redis cache
  const handlePurgeRedisCache = async () => {
    try {
      setPurgingRedis(true)
      await purgeRedisCache()
      alert("Redis cache purged successfully!")
      await fetchBanners() // Refresh data
    } catch (err: any) {
      alert("Error purging Redis cache: " + err.message)
    } finally {
      setPurgingRedis(false)
    }
  }

  useEffect(() => {
    fetchBanners()
  }, [])

  // Delete banner
  const deleteBanner = async (bannerId: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return
    
    try {
      const response = await fetch(API_URL_BANNER_ADMIN, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: bannerId })
      })
      
      if (!response.ok) {
        throw new Error("Failed to delete banner")
      }
      
      await fetchBanners()
      alert("Banner deleted successfully")
    } catch (err: any) {
      alert("Error deleting banner: " + err.message)
    }
  }

  // View banner details
  const viewBanner = (banner: Banner) => {
    setViewingBanner(banner)
    setEditingBanner(null)
    setShowCreateForm(false)
  }

  // Edit banner
  const editBanner = (banner: Banner) => {
    setEditingBanner(banner)
    setViewingBanner(null)
    setShowCreateForm(false)
  }

  // Close all forms
  const closeAllForms = () => {
    setShowCreateForm(false)
    setEditingBanner(null)
    setViewingBanner(null)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Banner Management</CardTitle>
          <CardDescription>Loading banners...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Banner Management</CardTitle>
          <CardDescription>Error loading banners</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-red-500 p-4 bg-red-50 rounded-md">
            {error}
          </div>
          <Button onClick={fetchBanners} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Banner Management</CardTitle>
              <CardDescription>Create and manage promotional banners for your store</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={handlePurgeRedisCache}
                disabled={purgingRedis}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${purgingRedis ? 'animate-spin' : ''}`} />
                {purgingRedis ? "Purging..." : "Purge Redis"}
              </Button>
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => setShowCreateForm(!showCreateForm)}
              >
                <Plus className="h-4 w-4 mr-2" />
                {showCreateForm ? "Cancel" : "Add Banner"}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Create Banner Form */}
      {showCreateForm && (
        <BannerCreateForm 
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            fetchBanners()
            setShowCreateForm(false)
          }}
        />
      )}

      {/* Edit Banner Form */}
      {editingBanner && (
        <BannerEditForm
          banner={editingBanner}
          onClose={closeAllForms}
          onSuccess={() => {
            fetchBanners()
            closeAllForms()
          }}
        />
      )}

      {/* View Banner */}
      {viewingBanner && (
        <BannerViewForm
          banner={viewingBanner}
          onClose={closeAllForms}
          onEdit={() => editBanner(viewingBanner)}
        />
      )}

      {/* Banners Table */}
      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="border-b">
                  <tr className="bg-muted/50">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Banner</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Title</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Description</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Link</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Expires</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Settings</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {banners.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-muted-foreground">
                        No banners found. Create your first banner to get started.
                      </td>
                    </tr>
                  ) : (
                    banners.map((banner) => (
                      <tr key={banner._id} className="border-b hover:bg-muted/50">
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-3">
                            {banner.image ? (
                              <img
                                src={banner.image}
                                alt={banner.title}
                                className="h-16 w-24 rounded-md object-cover"
                              />
                            ) : (
                              <div className="h-16 w-24 rounded-md bg-gray-200 flex items-center justify-center">
                                <ImageIcon className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="font-medium">{banner.title}</div>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="text-sm text-muted-foreground line-clamp-2 max-w-xs">
                            {banner.description}
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="text-sm text-blue-600 truncate max-w-xs">
                            <a href={banner.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              {banner.link}
                            </a>
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            banner.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}>
                            {banner.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="text-sm">
                            {banner.expiresAt ? new Date(banner.expiresAt).toLocaleDateString() : "Never"}
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex flex-wrap gap-1">
                            {banner.showTitle && (
                              <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                                Title
                              </span>
                            )}
                            {banner.showDescription && (
                              <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                                Desc
                              </span>
                            )}
                            {banner.showLink && (
                              <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800">
                                Link
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => viewBanner(banner)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => editBanner(banner)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => deleteBanner(banner._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Banner Create Form Component
function BannerCreateForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState<CreateBannerData>({
    title: "",
    description: "",
    image: null,
    link: "",
    isActive: true,
    expiresAt: "",// new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    showTitle: true,
    showLink: true,
    showDescription: true
  })
  const [requiredLink, setRequiredLink] = useState(true);
  const [requiredTitle, setRequiredTitle] = useState(true);
  const [requiredDescription, setRequiredDescription] = useState(true);
  const [requiredExpire, setRequiredExpire] = useState(false);
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.description || !form.image || !form.link) {
      alert("Please fill in all required fields")
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("title", form.title)
      formData.append("description", form.description)
      formData.append("image", form.image)
      formData.append("link", form.link)
      formData.append("isActive", form.isActive.toString())
      formData.append("expiresAt", form.expiresAt)
      formData.append("showTitle", form.showTitle.toString())
      formData.append("showLink", form.showLink.toString())
      formData.append("showDescription", form.showDescription.toString())

      const response = await fetch(API_URL_BANNER_ADMIN, {
        method: "POST",
        body: formData
      })

      if (!response.ok) {
        const error = await response.json().catch(() => null)
        throw new Error(error?.error || "Failed to create banner")
      }

      alert("Banner created successfully!")
      onSuccess()
    } catch (err: any) {
      alert("Error creating banner: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Banner</CardTitle>
        <CardDescription>Add a new promotional banner to your store</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => {
                  setForm(f => ({ ...f, title: e.target.value }))
                  setRequiredTitle(e.target.value !== "")
                }}
                placeholder="Banner title"
                required={requiredTitle}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link">Link *</Label>
              <Input
                id="link"
                value={form.link}
                onChange={(e) => {
                  setForm(f => ({ ...f, link: e.target.value }))
                  setRequiredLink(e.target.value !== "")
                }}
                placeholder="https://example.com"
                required={requiredLink}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => {
                setForm(f => ({ ...f, description: e.target.value }))
                setRequiredDescription(e.target.value !== "")
              }}
              placeholder="Banner description"
              rows={3}
              required={requiredDescription}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Image *</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) => setForm(f => ({ ...f, image: e.target.files?.[0] || null }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiresAt">Expires At *</Label>
            <Input
              id="expiresAt"
              type="date"
              value={form.expiresAt}
              onChange={(e) => setForm(f => ({ ...f, expiresAt: e.target.value }))}
              required={requiredExpire}
            />
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Display Settings</h4>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={form.isActive}
                  onCheckedChange={(checked) => setForm(f => ({ ...f, isActive: checked as boolean }))}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showTitle"
                  checked={form.showTitle}
                  onCheckedChange={(checked) => setForm(f => ({ ...f, showTitle: checked as boolean }))}
                />
                <Label htmlFor="showTitle">Show Title</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showDescription"
                  checked={form.showDescription}
                  onCheckedChange={(checked) => setForm(f => ({ ...f, showDescription: checked as boolean }))}
                />
                <Label htmlFor="showDescription">Show Description</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showLink"
                  checked={form.showLink}
                  onCheckedChange={(checked) => {
                    setForm(f => ({ ...f, showLink: checked as boolean }))
                    setRequiredLink(checked as boolean)
                  }}
                />
                <Label htmlFor="showLink">Show Link</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="requiredExpire"
                  checked={requiredExpire}
                  onCheckedChange={(checked) => setRequiredExpire(checked as boolean)}
                />
                <Label htmlFor="requiredExpire">Required Expire</Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Banner"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// Banner Edit Form Component
function BannerEditForm({ banner, onClose, onSuccess }: { banner: Banner; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    title: banner.title,
    description: banner.description,
    link: banner.link,
    isActive: banner.isActive,
    expiresAt: new Date(banner.expiresAt).toISOString().split('T')[0],
    showTitle: banner.showTitle,
    showLink: banner.showLink,
    showDescription: banner.showDescription
  })
  const [newImage, setNewImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.description || !form.link) {
      alert("Please fill in all required fields")
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("_id", banner._id)
      formData.append("title", form.title)
      formData.append("description", form.description)
      formData.append("link", form.link)
      formData.append("isActive", form.isActive.toString())
      formData.append("expiresAt", form.expiresAt)
      formData.append("showTitle", form.showTitle.toString())
      formData.append("showLink", form.showLink.toString())
      formData.append("showDescription", form.showDescription.toString())
      
      if (newImage) {
        formData.append("image", newImage)
      }

      const response = await fetch(API_URL_BANNER_ADMIN, {
        method: "PUT",
        body: formData
      })

      if (!response.ok) {
        const error = await response.json().catch(() => null)
        throw new Error(error?.error || "Failed to update banner")
      }

      alert("Banner updated successfully!")
      onSuccess()
    } catch (err: any) {
      alert("Error updating banner: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Banner: {banner.title}</CardTitle>
        <CardDescription>Update banner details and settings</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={form.title}
                onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Banner title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-link">Link *</Label>
              <Input
                id="edit-link"
                value={form.link}
                onChange={(e) => setForm(f => ({ ...f, link: e.target.value }))}
                placeholder="https://example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description *</Label>
            <Textarea
              id="edit-description"
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Banner description"
              rows={3}
              required
            />
          </div>

          <div className="space-y-4">
            <Label>Current Image</Label>
            <div className="relative w-full h-64">
              <img
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover rounded-lg border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-image">Replace Image (Optional)</Label>
              <Input
                id="edit-image"
                type="file"
                accept="image/*"
                onChange={(e) => setNewImage(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-expiresAt">Expires At *</Label>
            <Input
              id="edit-expiresAt"
              type="date"
              value={form.expiresAt}
              onChange={(e) => setForm(f => ({ ...f, expiresAt: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Display Settings</h4>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-isActive"
                  checked={form.isActive}
                  onCheckedChange={(checked) => setForm(f => ({ ...f, isActive: checked as boolean }))}
                />
                <Label htmlFor="edit-isActive">Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-showTitle"
                  checked={form.showTitle}
                  onCheckedChange={(checked) => setForm(f => ({ ...f, showTitle: checked as boolean }))}
                />
                <Label htmlFor="edit-showTitle">Show Title</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-showDescription"
                  checked={form.showDescription}
                  onCheckedChange={(checked) => setForm(f => ({ ...f, showDescription: checked as boolean }))}
                />
                <Label htmlFor="edit-showDescription">Show Description</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-showLink"
                  checked={form.showLink}
                  onCheckedChange={(checked) => setForm(f => ({ ...f, showLink: checked as boolean }))}
                />
                <Label htmlFor="edit-showLink">Show Link</Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Banner"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// Banner View Component
function BannerViewForm({ banner, onClose, onEdit }: { banner: Banner; onClose: () => void; onEdit: () => void }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Banner Preview: {banner.title}</CardTitle>
            <CardDescription>Full banner display and information</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Full Banner Display */}
        <div className="space-y-4">
          <Label>Banner Preview (Full Width & Height)</Label>
          <div className="relative w-full h-screen border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
            <img
              src={banner.image}
              alt={banner.title}
              className="w-full h-full object-cover"
            />
            {/* Overlay with banner content */}
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <div className="text-center text-white max-w-2xl mx-4">
                {banner.showTitle && (
                  <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
                    {banner.title}
                  </h1>
                )}
                {banner.showDescription && (
                  <p className="text-lg md:text-xl mb-6 drop-shadow-lg">
                    {banner.description}
                  </p>
                )}
                {banner.showLink && (
                  <a
                    href={banner.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Learn More
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Banner Details */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Title</Label>
                <p className="font-medium">{banner.title}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                <p className="text-gray-700">{banner.description}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Link</Label>
                <a 
                  href={banner.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {banner.link}
                </a>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Settings & Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  banner.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}>
                  {banner.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-muted-foreground">Expires At</Label>
                <span className="text-sm">
                  {new Date(banner.expiresAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-muted-foreground">Show Title</Label>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  banner.showTitle ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                }`}>
                  {banner.showTitle ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-muted-foreground">Show Description</Label>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  banner.showDescription ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                }`}>
                  {banner.showDescription ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-muted-foreground">Show Link</Label>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  banner.showLink ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                }`}>
                  {banner.showLink ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Technical Information</h3>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Banner ID</Label>
              <p className="font-mono bg-gray-100 px-2 py-1 rounded">{banner._id}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">MIME Type</Label>
              <p className="font-mono bg-gray-100 px-2 py-1 rounded">{banner.mimeType || "Not specified"}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Created</Label>
              <p className="font-mono bg-gray-100 px-2 py-1 rounded">
                {new Date(banner.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
              <p className="font-mono bg-gray-100 px-2 py-1 rounded">
                {new Date(banner.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
