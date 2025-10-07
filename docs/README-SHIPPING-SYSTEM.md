# Shipping System Implementation

## Overview
This document describes the new shipping system implemented for the Dehli Mirch e-commerce platform, which includes location-based shipping fees, TCS courier integration, and admin management capabilities.

## Features

### 1. Location-Based Shipping
- **Home Delivery (Lahore)**: Free shipping within Lahore city limits
- **TCS Express**: For locations outside Lahore with configurable fees
- **Pickup**: Store pickup option (configurable)

### 2. Shipping Method Management
- Admin can create and manage shipping methods
- Set default fees and location-specific pricing
- Configure free shipping thresholds
- Manage estimated delivery times

### 3. Checkout Integration
- Automatic shipping method selection based on city
- Dynamic fee calculation
- Country code selection for phone numbers (Pakistan +92 default)
- Email auto-fill for logged-in users

## Database Schema

### ShippingMethod Model
```typescript
{
  name: string,                    // e.g., "Home Delivery", "TCS Express"
  type: "home_delivery" | "tcs" | "pickup",
  isActive: boolean,
  locations: [{
    city: string,                  // e.g., "Lahore", "Karachi"
    state: string,                 // e.g., "Punjab", "Sindh"
    country: string,               // Default: "Pakistan"
    shippingFee: number,           // Base shipping cost
    tcsFee: number,                // TCS courier charges
    estimatedDays: number,         // Delivery time estimate
    isAvailable: boolean           // Whether service is available
  }],
  defaultShippingFee: number,      // Default fee for unspecified locations
  defaultTcsFee: number,          // Default TCS fee
  defaultEstimatedDays: number,   // Default delivery time
  freeShippingThreshold: number,  // Order amount for free shipping
  description: string,             // Method description
  restrictions: string[]           // Service restrictions
}
```

### Order Model Updates
- Added `orderId` and `refId` fields
- Enhanced shipping method tracking
- Improved contact information structure

## API Endpoints

### Public APIs
- `GET /api/shipping-methods` - Get available shipping methods with costs
- `POST /api/checkout` - Process checkout and create order

### Admin APIs
- `GET /api/admin/shipping-methods` - List all shipping methods
- `POST /api/admin/shipping-methods` - Create new shipping method
- `PUT /api/admin/shipping-methods/[id]` - Update shipping method
- `DELETE /api/admin/shipping-methods/[id]` - Delete shipping method

## Checkout Flow

1. **User enters city** → System fetches available shipping methods
2. **Automatic selection**:
   - Lahore → Home Delivery (FREE)
   - Other cities → TCS Express (with fees)
3. **Fee calculation**:
   - Shipping fee + TCS fee = Total shipping cost
   - Free shipping if order amount exceeds threshold
4. **Order creation** with unique `orderId` and `refId`

## Admin Management

### Shipping Methods Page (`/admin/shipping`)
- Add/Edit/Delete shipping methods
- Configure location-based pricing
- Set default fees and thresholds
- Manage delivery time estimates

### Orders Page (`/admin/orders`)
- View order ID and reference ID
- Track shipping method and fees
- Export detailed order data

## Configuration Examples

### Home Delivery (Lahore)
```json
{
  "name": "Home Delivery",
  "type": "home_delivery",
  "locations": [{
    "city": "Lahore",
    "shippingFee": 0,
    "tcsFee": 0,
    "estimatedDays": 1
  }],
  "defaultShippingFee": 0,
  "freeShippingThreshold": 0
}
```

### TCS Express (Other Cities)
```json
{
  "name": "TCS Express",
  "type": "tcs",
  "locations": [{
    "city": "Karachi",
    "shippingFee": 200,
    "tcsFee": 100,
    "estimatedDays": 2
  }],
  "defaultShippingFee": 300,
  "defaultTcsFee": 200,
  "freeShippingThreshold": 1000
}
```

## Testing

### Sample Data
Use the sample shipping methods in `mock_data/shipping-sample.ts` for testing:
- Home Delivery for Lahore
- TCS Express for other major cities
- Various fee configurations

### Test Scenarios
1. **Lahore checkout** → Should show free home delivery
2. **Karachi checkout** → Should show TCS with fees
3. **Admin shipping management** → CRUD operations
4. **Order creation** → Verify orderId and refId generation

## Future Enhancements

1. **Real-time tracking** integration with TCS API
2. **Multiple courier options** (TCS, M&P, etc.)
3. **Zone-based pricing** for better granularity
4. **Delivery time slots** for home delivery
5. **Shipping insurance** options
6. **International shipping** support

## Notes

- All payments are Cash on Delivery (COD) only
- JazzCash and Easypaisa options removed
- Email is auto-filled for logged-in users
- Phone numbers default to Pakistan (+92) country code
- Shipping fees are calculated dynamically based on location
- TCS fees are separate from base shipping costs

