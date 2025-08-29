"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Branch } from "@/lib/api/admin/branches/branches"
import { 
  MapPin, 
  Phone, 
  Mail, 
  Building2, 
  User, 
  Clock, 
  Globe, 
  MessageCircle,
  Calendar,
  Navigation
} from "lucide-react"
import { Label } from "@/components/ui/label"

interface BranchViewModalProps {
  branch: Branch | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BranchViewModal({ branch, open, onOpenChange }: BranchViewModalProps) {
  if (!branch) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden border">
              <img
                src={branch.logo}
                alt={`${branch.name} logo`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.svg"
                }}
              />
            </div>
            <div>
              <div className="text-2xl font-bold">{branch.name}</div>
              <div className="text-sm text-muted-foreground">Branch #{branch.branchNumber}</div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Complete branch information and details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Basic Info */}
          <div className="flex items-center gap-4">
            <Badge variant={branch.isActive ? "default" : "secondary"}>
              {branch.isActive ? "Active" : "Inactive"}
            </Badge>
            <Badge variant="outline">
              {branch.location}
            </Badge>
            {branch.coordinates && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Navigation className="h-3 w-3" />
                Coordinates
              </Badge>
            )}
          </div>

          {/* Address Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Address Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Full Address</Label>
                  <p className="text-gray-900">{branch.address}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">City</Label>
                  <p className="text-gray-900">{branch.city}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">State</Label>
                  <p className="text-gray-900">{branch.state}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Country</Label>
                  <p className="text-gray-900">{branch.country}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">Postal Code</Label>
                  <p className="text-gray-900">{branch.postalCode}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">Location/Area</Label>
                  <p className="text-gray-900">{branch.location}</p>
                </div>
              </div>
            </div>

            {branch.coordinates && (
              <div className="pt-4 border-t">
                <Label className="text-sm font-medium text-gray-600">Coordinates</Label>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                    {branch.coordinates.latitude.toFixed(6)}
                  </span>
                  <span className="text-gray-400">,</span>
                  <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                    {branch.coordinates.longitude.toFixed(6)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Click coordinates to copy or view on map
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Contact Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Phone className="h-5 w-5 text-green-600" />
              Contact Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Phone Number</Label>
                  <p className="text-gray-900 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {branch.phoneNumber}
                  </p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">Email</Label>
                  <p className="text-gray-900 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <a 
                      href={`mailto:${branch.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {branch.email}
                    </a>
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                {branch.whatsapp && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">WhatsApp</Label>
                    <p className="text-gray-900 flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-green-600" />
                      {branch.whatsapp}
                    </p>
                  </div>
                )}
                
                {branch.website && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Website</Label>
                    <p className="text-gray-900 flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <a 
                        href={branch.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Visit Website
                      </a>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Building2 className="h-5 w-5 text-purple-600" />
              Additional Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                {branch.manager && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Manager</Label>
                    <p className="text-gray-900 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {branch.manager}
                    </p>
                  </div>
                )}
                
                {branch.openingHours && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Opening Hours</Label>
                    <div className="space-y-2">
                      {Object.entries(branch.openingHours).map(([day, hours]) => (
                        <div key={day} className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-900 capitalize">
                            {day}: {hours.isOpen ? `${hours.open} - ${hours.close}` : 'Closed'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                {branch.description && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Description</Label>
                    <p className="text-gray-900">{branch.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Timestamps */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-600" />
              Timestamps
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium text-gray-600">Created</Label>
                <p className="text-gray-900">{formatDate(branch.createdAt)}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-600">Last Updated</Label>
                <p className="text-gray-900">{formatDate(branch.updatedAt)}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pt-4 border-t">
            <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
            <div className="flex flex-wrap gap-2">
              {branch.phoneNumber && (
                <a
                  href={`tel:${branch.phoneNumber}`}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  Call Branch
                </a>
              )}
              
              {branch.email && (
                <a
                  href={`mailto:${branch.email}`}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  Send Email
                </a>
              )}
              
              {branch.whatsapp && (
                <a
                  href={`https://wa.me/${branch.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              )}
              
              {branch.coordinates && (
                <a
                  href={`https://www.google.com/maps?q=${branch.coordinates.latitude},${branch.coordinates.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <Navigation className="h-4 w-4" />
                  View on Map
                </a>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
