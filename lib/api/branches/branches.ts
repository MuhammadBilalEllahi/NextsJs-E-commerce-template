const API_URL_BRANCHES = "/api/admin/branches";

import { Branch, BranchesResponse } from "@/types";

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
