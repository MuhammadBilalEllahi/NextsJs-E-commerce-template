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
  openingHours?: {
    monday: { open: string; close: string; isOpen: boolean };
    tuesday: { open: string; close: string; isOpen: boolean };
    wednesday: { open: string; close: string; isOpen: boolean };
    thursday: { open: string; close: string; isOpen: boolean };
    friday: { open: string; close: string; isOpen: boolean };
    saturday: { open: string; close: string; isOpen: boolean };
    sunday: { open: string; close: string; isOpen: boolean };
  };
  createdAt: string;
  updatedAt: string;
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

// Fetch all active branches for public use
export const fetchAllBranches = async (): Promise<Branch[]> => {
  try {
    const response = await fetch(`${API_URL_BRANCHES}?isActive=true&limit=100`);

    if (!response.ok) {
      throw new Error("Failed to fetch branches");
    }

    const data: BranchesResponse = await response.json();
    return data.branches;
  } catch (error) {
    console.error("Error fetching branches:", error);
    return [];
  }
};
