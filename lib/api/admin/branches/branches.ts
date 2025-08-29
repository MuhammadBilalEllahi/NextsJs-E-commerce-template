import { useState } from "react";

const API_URL_BRANCHES = "/api/admin/branches";

export interface Branch {
  _id: string;
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
  isActive: boolean;
  logo: string;
  branchNumber: string;
  location: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  manager?: string;
  openingHours?: string;
  description?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  website?: string;
  whatsapp?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBranchData {
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
  branchNumber: string;
  location: string;
  city: string;
  state: string;
  country?: string;
  postalCode: string;
  manager?: string;
  openingHours?: string;
  description?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  website?: string;
  whatsapp?: string;
  isActive?: boolean;
  logo: File;
}

export interface UpdateBranchData extends Partial<CreateBranchData> {
  _id: string;
  logo?: File;
}

export interface BranchesResponse {
  branches: Branch[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface SearchParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

// Fetch all branches with search and pagination
export const fetchBranches = async (params: SearchParams = {}): Promise<BranchesResponse> => {
  try {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append("page", params.page.toString());
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.search) searchParams.append("search", params.search);
    if (params.isActive !== undefined) searchParams.append("isActive", params.isActive.toString());
    
    const response = await fetch(`${API_URL_BRANCHES}?${searchParams.toString()}`);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Failed to fetch branches" }));
      throw new Error(error.error || "Failed to fetch branches");
    }
    
    return await response.json();
  } catch (err: any) {
    console.error("Error fetching branches:", err);
    throw new Error(err.message || "Failed to fetch branches");
  }
};

// Create a new branch
export const createBranch = async (branchData: CreateBranchData): Promise<Branch> => {
  try {
    const formData = new FormData();
    
    // Append all fields
    formData.append("name", branchData.name);
    formData.append("address", branchData.address);
    formData.append("phoneNumber", branchData.phoneNumber);
    formData.append("email", branchData.email);
    formData.append("branchNumber", branchData.branchNumber);
    formData.append("location", branchData.location);
    formData.append("city", branchData.city);
    formData.append("state", branchData.state);
    formData.append("postalCode", branchData.postalCode);
    
    if (branchData.country) formData.append("country", branchData.country);
    if (branchData.manager) formData.append("manager", branchData.manager);
    if (branchData.openingHours) formData.append("openingHours", branchData.openingHours);
    if (branchData.description) formData.append("description", branchData.description);
    if (branchData.website) formData.append("website", branchData.website);
    if (branchData.whatsapp) formData.append("whatsapp", branchData.whatsapp);
    if (branchData.isActive !== undefined) formData.append("isActive", branchData.isActive.toString());
    
    // Handle coordinates
    if (branchData.coordinates) {
      formData.append("latitude", branchData.coordinates.latitude.toString());
      formData.append("longitude", branchData.coordinates.longitude.toString());
    }
    
    // Append logo file
    formData.append("logo", branchData.logo);
    
    const response = await fetch(API_URL_BRANCHES, {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Failed to create branch" }));
      throw new Error(error.error || "Failed to create branch");
    }
    
    const data = await response.json();
    return data.branch;
  } catch (err: any) {
    console.error("Error creating branch:", err);
    throw new Error(err.message || "Failed to create branch");
  }
};

// Update an existing branch
export const updateBranch = async (branchData: UpdateBranchData): Promise<Branch> => {
  try {
    const formData = new FormData();
    
    formData.append("id", branchData._id);
    
    // Append all fields that are provided
    if (branchData.name) formData.append("name", branchData.name);
    if (branchData.address) formData.append("address", branchData.address);
    if (branchData.phoneNumber) formData.append("phoneNumber", branchData.phoneNumber);
    if (branchData.email) formData.append("email", branchData.email);
    if (branchData.branchNumber) formData.append("branchNumber", branchData.branchNumber);
    if (branchData.location) formData.append("location", branchData.location);
    if (branchData.city) formData.append("city", branchData.city);
    if (branchData.state) formData.append("state", branchData.state);
    if (branchData.country) formData.append("country", branchData.country);
    if (branchData.postalCode) formData.append("postalCode", branchData.postalCode);
    if (branchData.manager !== undefined) formData.append("manager", branchData.manager);
    if (branchData.openingHours !== undefined) formData.append("openingHours", branchData.openingHours);
    if (branchData.description !== undefined) formData.append("description", branchData.description);
    if (branchData.website !== undefined) formData.append("website", branchData.website);
    if (branchData.whatsapp !== undefined) formData.append("whatsapp", branchData.whatsapp);
    if (branchData.isActive !== undefined) formData.append("isActive", branchData.isActive.toString());
    
    // Handle coordinates
    if (branchData.coordinates) {
      formData.append("latitude", branchData.coordinates.latitude.toString());
      formData.append("longitude", branchData.coordinates.longitude.toString());
    }
    
    // Append logo file if provided
    if (branchData.logo) {
      formData.append("logo", branchData.logo);
    }
    
    const response = await fetch(API_URL_BRANCHES, {
      method: "PUT",
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Failed to update branch" }));
      throw new Error(error.error || "Failed to update branch");
    }
    
    const data = await response.json();
    return data.branch;
  } catch (err: any) {
    console.error("Error updating branch:", err);
    throw new Error(err.message || "Failed to update branch");
  }
};

// Delete a branch
export const deleteBranch = async (branchId: string): Promise<void> => {
  try {
    const formData = new FormData();
    formData.append("id", branchId);
    
    const response = await fetch(API_URL_BRANCHES, {
      method: "DELETE",
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Failed to delete branch" }));
      throw new Error(error.error || "Failed to delete branch");
    }
  } catch (err: any) {
    console.error("Error deleting branch:", err);
    throw new Error(err.message || "Failed to delete branch");
  }
};

// Get a single branch by ID
export const fetchBranchById = async (branchId: string): Promise<Branch> => {
  try {
    const response = await fetch(`${API_URL_BRANCHES}?id=${branchId}`);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Failed to fetch branch" }));
      throw new Error(error.error || "Failed to fetch branch");
    }
    
    const data = await response.json();
    return data.branch;
  } catch (err: any) {
    console.error("Error fetching branch:", err);
    throw new Error(err.message || "Failed to fetch branch");
  }
};

// Custom hook for branches management
export const useBranches = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  const loadBranches = async (params: SearchParams = {}) => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchBranches(params);
      setBranches(data.branches);
      setPagination(data.pagination);
    } catch (err: any) {
      console.error("[useBranches] Error loading branches:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addBranch = async (branchData: CreateBranchData) => {
    try {
      const newBranch = await createBranch(branchData);
      setBranches(prev => [newBranch, ...prev]);
      return newBranch;
    } catch (err: any) {
      console.error("[useBranches] Error adding branch:", err);
      setError(err.message);
      throw err;
    }
  };

  const updateBranchInList = async (branchData: UpdateBranchData) => {
    try {
      const updatedBranch = await updateBranch(branchData);
      setBranches(prev => prev.map(branch => 
        branch._id === branchData._id ? updatedBranch : branch
      ));
      return updatedBranch;
    } catch (err: any) {
      console.error("[useBranches] Error updating branch:", err);
      setError(err.message);
      throw err;
    }
  };

  const removeBranch = async (branchId: string) => {
    try {
      await deleteBranch(branchId);
      setBranches(prev => prev.filter(branch => branch._id !== branchId));
    } catch (err: any) {
      console.error("[useBranches] Error removing branch:", err);
      setError(err.message);
      throw err;
    }
  };

  return {
    branches,
    loading,
    error,
    pagination,
    loadBranches,
    addBranch,
    updateBranchInList,
    removeBranch,
  };
};
