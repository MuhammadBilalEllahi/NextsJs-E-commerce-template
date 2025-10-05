"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  User,
  Building2,
} from "lucide-react";
import { useBranches } from "@/lib/api/admin/branches/branches";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { BranchCreateModal } from "@/components/admin/branches/branch-create-modal";
import { BranchEditModal } from "@/components/admin/branches/branch-edit-modal";
import { BranchViewModal } from "@/components/admin/branches/branch-view-modal";
import { Branch, CreateBranchData, UpdateBranchData } from "@/types";
export default function BranchesAdminPage() {
  const {
    branches,
    loading,
    error,
    pagination,
    loadBranches,
    addBranch,
    updateBranchInList,
    removeBranch,
  } = useBranches();

  const [searchTerm, setSearchTerm] = useState("");
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(
    undefined
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [viewingBranch, setViewingBranch] = useState<Branch | null>(null);
  const [deletingBranch, setDeletingBranch] = useState<Branch | null>(null);

  // Load branches on component mount and when filters change
  useEffect(() => {
    loadBranches({
      page: currentPage,
      limit: 10,
      search: searchTerm || undefined,
      isActive: isActiveFilter,
    });
  }, [currentPage, searchTerm, isActiveFilter]);

  // Handle search with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when searching
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle branch creation
  const handleCreateBranch = async (branchData: CreateBranchData) => {
    try {
      await addBranch(branchData);
      setShowCreateModal(false);
      // Reload branches to get updated list
      loadBranches({
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
        isActive: isActiveFilter,
      });
    } catch (error) {
      console.error("Failed to create branch:", error);
    }
  };

  // Handle branch update
  const handleUpdateBranch = async (branchData: UpdateBranchData) => {
    try {
      await updateBranchInList(branchData);
      setEditingBranch(null);
      // Reload branches to get updated list
      loadBranches({
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
        isActive: isActiveFilter,
      });
    } catch (error) {
      console.error("Failed to update branch:", error);
    }
  };

  // Handle branch deletion
  const handleDeleteBranch = async () => {
    if (!deletingBranch) return;

    try {
      await removeBranch(deletingBranch.id);
      setDeletingBranch(null);
      // Reload branches to get updated list
      loadBranches({
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
        isActive: isActiveFilter,
      });
    } catch (error) {
      console.error("Failed to delete branch:", error);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setIsActiveFilter(undefined);
    setCurrentPage(1);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading && branches.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading branches...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Branch Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage store locations, contact information, and branch details
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search branches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() =>
              setIsActiveFilter(
                isActiveFilter === undefined
                  ? true
                  : isActiveFilter === true
                  ? false
                  : undefined
              )
            }
            className="whitespace-nowrap"
          >
            <Filter className="h-4 w-4 mr-2" />
            {isActiveFilter === undefined
              ? "All"
              : isActiveFilter
              ? "Active"
              : "Inactive"}
          </Button>
          {(searchTerm || isActiveFilter !== undefined) && (
            <Button variant="outline" onClick={resetFilters}>
              Clear
            </Button>
          )}
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="whitespace-nowrap"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Branch
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Branches Grid */}
      {branches.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No branches found
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || isActiveFilter !== undefined
                  ? "Try adjusting your search or filters"
                  : "Get started by creating your first branch"}
              </p>
              {!searchTerm && isActiveFilter === undefined && (
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Branch
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {branches.map((branch) => (
            <Card key={branch.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Logo */}
                  <div className="flex-shrink-0">
                    <img
                      src={branch.logo}
                      alt={`${branch.name} logo`}
                      className="w-20 h-20 object-cover rounded-lg border"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.svg";
                      }}
                    />
                  </div>

                  {/* Branch Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {branch.name}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant={branch.isActive ? "default" : "secondary"}
                          >
                            {branch.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <Badge variant="outline">
                            #{branch.branchNumber}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewingBranch(branch)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingBranch(branch)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeletingBranch(branch)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>

                    {/* Contact & Location Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span className="truncate">{branch.address}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Building2 className="h-4 w-4" />
                          <span>
                            {branch.city}, {branch.state} {branch.postalCode}
                          </span>
                        </div>
                        {branch.coordinates && (
                          <div className="text-xs text-gray-500">
                            📍 {branch.coordinates.latitude?.toFixed(6)},{" "}
                            {branch.coordinates.longitude?.toFixed(6)}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="h-4 w-4" />
                          <span>{branch.phoneNumber}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="h-4 w-4" />
                          <span className="truncate">{branch.email}</span>
                        </div>
                        {branch.manager && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <User className="h-4 w-4" />
                            <span>Manager: {branch.manager}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        {branch.openingHours && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <div className="text-xs">
                              {Object.entries(branch.openingHours)
                                .filter(([_, hours]) => hours.isOpen)
                                .map(([day, hours]) => (
                                  <div key={day} className="capitalize">
                                    {day}: {hours.open} - {hours.close}
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                        {branch.website && (
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            <a
                              href={branch.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              Website
                            </a>
                          </div>
                        )}
                        {branch.whatsapp && (
                          <div className="flex items-center gap-2">
                            <span className="text-green-600">📱</span>
                            <span>{branch.whatsapp}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Timestamps */}
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Created: {formatDate(branch.createdAt)}</span>
                        <span>Updated: {formatDate(branch.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="mt-8 flex justify-center">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>

            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
              (page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  onClick={() => setCurrentPage(page)}
                  size="sm"
                >
                  {page}
                </Button>
              )
            )}

            <Button
              variant="outline"
              onClick={() =>
                setCurrentPage((prev) => Math.min(pagination.pages, prev + 1))
              }
              disabled={currentPage === pagination.pages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <BranchCreateModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={handleCreateBranch}
      />

      <BranchEditModal
        branch={editingBranch}
        open={!!editingBranch}
        onOpenChange={(open: boolean) => !open && setEditingBranch(null)}
        onSubmit={handleUpdateBranch}
      />

      <BranchViewModal
        branch={viewingBranch}
        open={!!viewingBranch}
        onOpenChange={(open: boolean) => !open && setViewingBranch(null)}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deletingBranch}
        onOpenChange={(open) => !open && setDeletingBranch(null)}
        title="Delete Branch"
        description={`Are you sure you want to delete "${deletingBranch?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteBranch}
        confirmText="Delete Branch"
        variant="destructive"
      />
    </div>
  );
}
