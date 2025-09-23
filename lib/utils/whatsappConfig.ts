/**
 * WhatsApp Business API Configuration
 *
 * This file contains configuration utilities for WhatsApp Business API integration.
 * Make sure to set the following environment variables in your .env file:
 *
 * Required:
 * - WHATSAPP_ACCESS_TOKEN: Your WhatsApp Business API access token
 * - WHATSAPP_PHONE_NUMBER_ID: Your WhatsApp Business phone number ID
 *
 * Optional:
 * - WHATSAPP_API_URL: WhatsApp API base URL (defaults to v18.0)
 */

export interface WhatsAppConfig {
  accessToken: string;
  phoneNumberId: string;
  apiUrl: string;
  isConfigured: boolean;
}

export function getWhatsAppConfig(): WhatsAppConfig {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN || "";
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || "";
  const apiUrl =
    process.env.WHATSAPP_API_URL || "https://graph.facebook.com/v18.0";

  return {
    accessToken,
    phoneNumberId,
    apiUrl,
    isConfigured: !!(accessToken && phoneNumberId),
  };
}

export function validateWhatsAppConfig(): {
  isValid: boolean;
  errors: string[];
} {
  const config = getWhatsAppConfig();
  const errors: string[] = [];

  if (!config.accessToken) {
    errors.push("WHATSAPP_ACCESS_TOKEN is required");
  }

  if (!config.phoneNumberId) {
    errors.push("WHATSAPP_PHONE_NUMBER_ID is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Environment variables documentation for WhatsApp integration
 */
export const WHATSAPP_ENV_DOCS = `
# WhatsApp Business API Configuration
# Get these from your WhatsApp Business API setup

# Required: Your WhatsApp Business API access token
WHATSAPP_ACCESS_TOKEN=your_access_token_here

# Required: Your WhatsApp Business phone number ID
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here

# Optional: WhatsApp API base URL (defaults to v18.0)
WHATSAPP_API_URL=https://graph.facebook.com/v18.0

# How to get these values:
# 1. Go to https://developers.facebook.com/
# 2. Create a new app or use existing app
# 3. Add WhatsApp Business API product
# 4. Get your access token from the WhatsApp API settings
# 5. Get your phone number ID from the WhatsApp Business phone numbers section
`;

