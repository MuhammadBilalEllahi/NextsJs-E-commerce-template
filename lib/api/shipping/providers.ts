// Provider registry for shipping/courier integrations
import tcsService from "@/lib/api/tcs/tcsService";

export type ProviderAdapter = {
  slug: string; // e.g. "tcs"
  create: (payload: any) => Promise<{ tracking: string; raw: any }>;
  track: (payload: {
    userName: string;
    password: string;
    referenceNo: string;
  }) => Promise<any>;
  cancel: (payload: {
    userName: string;
    password: string;
    consignmentNumber: string;
  }) => Promise<any>;
  estimateDays?: (city: string) => number;
  mapFromOrder?: (order: any) => any;
};

const tcsAdapter: ProviderAdapter = {
  slug: "tcs",
  async create(payload: any) {
    const response = await tcsService.createOrder(payload);
    return { tracking: response.CN as string, raw: response };
  },
  async track({ userName, password, referenceNo }) {
    return tcsService.trackOrder(userName, password, referenceNo);
  },
  async cancel({ userName, password, consignmentNumber }) {
    return tcsService.cancelOrder({ userName, password, consignmentNumber });
  },
  estimateDays(city: string) {
    return tcsService.getEstimatedDeliveryDays(city);
  },
  mapFromOrder(order: any) {
    return tcsService.mapOrderToTCSFormat(order);
  },
};

export const providerRegistry: Record<string, ProviderAdapter> = {
  tcs: tcsAdapter,
  // Add more providers here, e.g. leopard, trax, dhl, etc.
};

export function getProvider(slug: string): ProviderAdapter | undefined {
  return providerRegistry[slug];
}

