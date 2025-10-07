// TCS API Service Layer
// This service handles all TCS API interactions
import {
  TCSCity,
  TCSOrigin,
  TCSCountry,
  TCSOrderRequest,
  TCSOrderResponse,
  TCSTrackingResponse,
  TCSCancelRequest,
  TCSPickupStatusResponse,
  TCSPaymentDetailsResponse,
} from "@/types";

class TCSService {
  private baseUrl: string;
  private clientId: string;

  constructor() {
    this.baseUrl =
      process.env.TCS_API_BASE_URL ||
      "https://api.tcscourier.com/sandbox/v1/cod";
    this.clientId =
      process.env.TCS_CLIENTid || "2b54b487-6039-4b97-a490-116f1b148495";
  }

  private async makeRequest<T>(
    endpoint: string,
    method: "GET" | "POST" | "PUT" = "GET",
    body?: any
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: HeadersInit = {
      "X-IBM-Client-Id": this.clientId,
      "Content-Type": "application/json",
    };

    const config: RequestInit = {
      method,
      headers,
    };

    if (body && method !== "GET") {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(
          `TCS API Error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("TCS API Request failed:", error);
      throw error;
    }
  }

  // Get all available cities
  async getCities(): Promise<TCSCity[]> {
    try {
      const response = await this.makeRequest<{ city: TCSCity[] }>("/cities");
      return response.city || [];
    } catch (error) {
      console.error("Failed to fetch TCS cities:", error);
      return [];
    }
  }

  // Get all available origins/stations
  async getOrigins(): Promise<TCSOrigin[]> {
    try {
      const response = await this.makeRequest<{ origin: TCSOrigin[] }>(
        "/origins"
      );
      return response.origin || [];
    } catch (error) {
      console.error("Failed to fetch TCS origins:", error);
      return [];
    }
  }

  // Get all available countries
  async getCountries(): Promise<TCSCountry[]> {
    try {
      const response = await this.makeRequest<{ country: TCSCountry[] }>(
        "/countries"
      );
      return response.country || [];
    } catch (error) {
      console.error("Failed to fetch TCS countries:", error);
      return [];
    }
  }

  // Create a new TCS order
  async createOrder(orderData: TCSOrderRequest): Promise<TCSOrderResponse> {
    try {
      const response = await this.makeRequest<TCSOrderResponse>(
        "/create-order",
        "POST",
        orderData
      );
      return response;
    } catch (error) {
      console.error("Failed to create TCS order:", error);
      throw error;
    }
  }

  // Track a TCS order
  async trackOrder(
    userName: string,
    password: string,
    referenceNo: string
  ): Promise<TCSTrackingResponse> {
    try {
      const params = new URLSearchParams({
        userName,
        password,
        referenceNo,
      });

      const response = await this.makeRequest<TCSTrackingResponse>(
        `/track-order?${params}`
      );
      return response;
    } catch (error) {
      console.error("Failed to track TCS order:", error);
      throw error;
    }
  }

  // Cancel a TCS order
  async cancelOrder(cancelData: TCSCancelRequest): Promise<TCSOrderResponse> {
    try {
      const response = await this.makeRequest<TCSOrderResponse>(
        "/cancel-order",
        "PUT",
        cancelData
      );
      return response;
    } catch (error) {
      console.error("Failed to cancel TCS order:", error);
      throw error;
    }
  }

  // Get pickup status
  async getPickupStatus(
    consignmentNumber: string
  ): Promise<TCSPickupStatusResponse> {
    try {
      const params = new URLSearchParams({
        consignmentNumber,
      });

      const response = await this.makeRequest<TCSPickupStatusResponse>(
        `/pickup-status?${params}`
      );
      return response;
    } catch (error) {
      console.error("Failed to get pickup status:", error);
      throw error;
    }
  }

  // Get payment details
  async getPaymentDetails(
    consignmentNumber: string
  ): Promise<TCSPaymentDetailsResponse> {
    try {
      const params = new URLSearchParams({
        consignmentNumber,
      });

      const response = await this.makeRequest<TCSPaymentDetailsResponse>(
        `/payment-details?${params}`
      );
      return response;
    } catch (error) {
      console.error("Failed to get payment details:", error);
      throw error;
    }
  }

  // Get payment invoice details
  async getPaymentInvoice(
    invoiceNumber: string
  ): Promise<TCSPaymentDetailsResponse> {
    try {
      const params = new URLSearchParams({
        invoiceNumber,
      });

      const response = await this.makeRequest<TCSPaymentDetailsResponse>(
        `/payment-invoice?${params}`
      );
      return response;
    } catch (error) {
      console.error("Failed to get payment invoice:", error);
      throw error;
    }
  }

  // Helper method to map our order data to TCS format
  mapOrderToTCSFormat(orderData: any): TCSOrderRequest {
    return {
      userName: process.env.TCS_USERNAME || "",
      password: process.env.TCS_PASSWORD || "",
      costCenterCode: process.env.TCS_COST_CENTER_CODE || "",
      consigneeName: `${orderData.shippingAddress.firstName} ${orderData.shippingAddress.lastName}`,
      consigneeAddress: orderData.shippingAddress.address,
      consigneeMobNo: orderData.shippingAddress.phone,
      consigneeEmail: orderData.contact.email,
      originCityName: process.env.TCS_ORIGIN_CITY_NAME || "", // Our shop location
      destinationCityName: orderData.shippingAddress.city,
      weight: this.calculateWeight(orderData.items),
      pieces: orderData.items.length,
      codAmount: orderData.total.toString(),
      customerReferenceNo: orderData.refId,
      services: "O", // Overnight service
      productDetails: this.generateProductDetails(orderData.items),
      fragile: "No", // Default to No, can be made configurable
      remarks: `Order #${orderData.orderId} - Dehli Mirch`,
      insuranceValue: 0,
    };
  }

  // Calculate total weight based on items
  private calculateWeight(items: any[]): number {
    // Default weight calculation - can be enhanced with actual product weights
    return Math.max(1, items.length * 0.5); // Minimum 1kg, 0.5kg per item
  }

  // Generate product details string
  private generateProductDetails(items: any[]): string {
    return items
      .map((item) => `${item.title} (${item.quantity} pcs)`)
      .join(", ");
  }

  // Helper method to determine if city is outside Lahore
  isOutsideLahore(cityName: string): boolean {
    const lahoreVariations = ["lahore", "lhr", "لاہور"];
    return !lahoreVariations.some((variation) =>
      cityName.toLowerCase().includes(variation.toLowerCase())
    );
  }

  // Helper method to get estimated delivery days
  getEstimatedDeliveryDays(cityName: string): number {
    if (!this.isOutsideLahore(cityName)) {
      return 1; // Same day for Lahore
    }

    // Different cities have different delivery times
    const cityDeliveryMap: { [key: string]: number } = {
      karachi: 2,
      islamabad: 2,
      rawalpindi: 2,
      faisalabad: 2,
      multan: 3,
      peshawar: 4,
      quetta: 5,
    };

    const cityKey = cityName.toLowerCase();
    for (const [city, days] of Object.entries(cityDeliveryMap)) {
      if (cityKey.includes(city)) {
        return days;
      }
    }

    return 5; // Default for other cities
  }
}

export const tcsService = new TCSService();
export default tcsService;
