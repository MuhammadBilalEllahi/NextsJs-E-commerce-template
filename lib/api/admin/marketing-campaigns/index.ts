import {
  MarketingCampaign,
  CreateMarketingCampaignData,
  UpdateMarketingCampaignData,
} from "@/types/types";

const API_URL_MARKETING_CAMPAIGNS_ADMIN = "/api/admin/marketing-campaigns";

export async function fetchMarketingCampaigns(): Promise<MarketingCampaign[]> {
  const res = await fetch(API_URL_MARKETING_CAMPAIGNS_ADMIN, {
    cache: "no-store",
  });
  if (!res.ok) {
    const error = await res
      .json()
      .catch(() => ({ error: "Failed to fetch campaigns" }));
    throw new Error(error.error || "Failed to fetch campaigns");
  }
  const data = await res.json();
  return data.campaigns || [];
}

export async function createMarketingCampaign(
  campaignData: CreateMarketingCampaignData
): Promise<MarketingCampaign> {
  if (
    !campaignData.name ||
    !campaignData.type ||
    !campaignData.startDate ||
    !campaignData.endDate
  ) {
    throw new Error("Name, type, start date, and end date are required");
  }

  const res = await fetch(API_URL_MARKETING_CAMPAIGNS_ADMIN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(campaignData),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to create campaign");
  }
  return data.campaign;
}

export async function updateMarketingCampaign(
  campaignData: UpdateMarketingCampaignData
): Promise<MarketingCampaign> {
  if (
    !campaignData.id ||
    !campaignData.name ||
    !campaignData.type ||
    !campaignData.startDate ||
    !campaignData.endDate
  ) {
    throw new Error("ID, name, type, start date, and end date are required");
  }

  const res = await fetch(API_URL_MARKETING_CAMPAIGNS_ADMIN, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(campaignData),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to update campaign");
  }
  return data.campaign;
}

export async function deleteMarketingCampaign(id: string): Promise<void> {
  const res = await fetch(
    `${API_URL_MARKETING_CAMPAIGNS_ADMIN}?id=${encodeURIComponent(id)}`,
    { method: "DELETE" }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to delete campaign");
  }
}

export async function toggleMarketingCampaignStatus(
  id: string,
  isActive: boolean
): Promise<MarketingCampaign> {
  const res = await fetch(API_URL_MARKETING_CAMPAIGNS_ADMIN, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, isActive }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to update campaign status");
  }
  return data.campaign;
}
