# Change Log v1: Dynamic Courier Provider System

## Overview

Refactored the order management system to eliminate multiple order schemas and implement a dynamic courier provider system. This allows customers to choose from multiple courier services (TCS, Leopard, Trax, DHL, etc.) dynamically without hardcoded provider-specific logic.

## Completed Changes

### 1. Schema Consolidation ✅

- **Removed**: Standalone `TCSOrder` schema (`models/TCSOrder.ts`)
- **Updated**: `Order` schema to embed courier information as a subdocument
- **Added**: `courier` field in `OrderSchema` with provider-agnostic structure
- **Removed**: `MODELS.TCS_ORDER` constant from `models/constants.ts`

### 2. Type System Updates ✅

- **Removed**: `TCSOrder` interface from `types/index.ts`
- **Removed**: `TCSOrderDB` and `TCSTrackingHistoryDB` from `types/database.ts`
- **Updated**: `Order` interface to include `courier` field
- **Retained**: `TCSOrderData` interface for backward compatibility (now represents courier subdocument structure)

### 3. Dynamic Provider Registry ✅

- **Created**: `lib/api/shipping/providers.ts` with provider adapter pattern
- **Added**: `ProviderAdapter` type for standardized courier integration
- **Implemented**: TCS adapter wrapping existing `tcsService`
- **Added**: `getProvider()` function for dynamic provider selection

### 4. Checkout Process Refactoring ✅

- **Updated**: `app/api/checkout/route.ts` to use provider registry
- **Changed**: From hardcoded TCS logic to dynamic provider selection based on `shippingMethod`
- **Improved**: Error handling and logging for provider-agnostic operations
- **Maintained**: Stock management and WhatsApp notification functionality

### 5. Order Schema Flexibility ✅

- **Removed**: Enum restriction on `Order.shippingMethod`
- **Enabled**: Dynamic provider slugs (e.g., "tcs", "leopard", "trax", "dhl")
- **Maintained**: Backward compatibility with existing orders

### 6. API Route Updates ✅

- **Updated**: `app/api/tcs-tracking/route.ts` to work with embedded courier data
- **Updated**: `app/api/admin/tcs-orders/route.ts` to query `Order` model with courier filters
- **Updated**: `app/api/admin/tcs-orders/[id]/route.ts` to operate on courier subdocument
- **Maintained**: All existing functionality while using unified data structure

### 7. UI Component Updates ✅

- **Updated**: `components/admin/tcs-orders/tcs-orders-management.tsx` to display courier data from `Order.courier`
- **Updated**: `app/(site)/track-order/page.tsx` to work with unified tracking API
- **Maintained**: All existing UI functionality and user experience

## Pending Tasks

### 1. Generic Tracking Endpoint 🔄

- **Status**: In Progress
- **Task**: Replace TCS-specific tracking API with generic provider-agnostic endpoint
- **Files**:
  - Create `app/api/shipping-tracking/route.ts`
  - Update `app/(site)/track-order/page.tsx` to use new endpoint
- **Benefit**: Single tracking endpoint that routes to appropriate provider

### 2. Additional Provider Adapters 📋

- **Status**: Pending
- **Task**: Implement adapters for other courier services
- **Providers Needed**: Leopard, Trax, DHL, etc.
- **Files**:
  - Create `lib/api/leopard/leopardService.ts`
  - Create `lib/api/trax/traxService.ts`
  - Create `lib/api/dhl/dhlService.ts`
  - Update `lib/api/shipping/providers.ts` to include new adapters

### 3. Customer Courier Selection UI 📋

- **Status**: Pending
- **Task**: Add courier selection interface at checkout
- **Requirements**:
  - Fetch available couriers from shipping methods API
  - Display courier options with pricing and delivery estimates
  - Pass selected courier slug to checkout process
- **Files**:
  - Update checkout components
  - Create courier selection component

### 4. Admin Panel Provider Management 📋

- **Status**: Pending
- **Task**: Update admin panel to handle multiple courier providers
- **Requirements**:
  - Generic courier orders management (not just TCS)
  - Provider-specific configuration pages
  - Unified tracking and status management
- **Files**:
  - Update `components/admin/tcs-orders/` to be provider-agnostic
  - Create provider configuration components

### 5. Legacy Code Cleanup 📋

- **Status**: Pending
- **Task**: Remove TCS-specific references and consolidate remaining code
- **Files**:
  - Remove `lib/api/tcs/tcsService.ts` (after creating generic service layer)
  - Update remaining TCS-specific imports
  - Clean up unused constants and types

### 6. Testing and Validation 📋

- **Status**: Pending
- **Task**: Comprehensive testing of the new provider system
- **Requirements**:
  - Test checkout with different courier providers
  - Validate tracking functionality across providers
  - Test admin panel operations
  - Verify backward compatibility with existing orders

## Technical Architecture

### Provider Adapter Pattern

```typescript
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
```

### Data Flow

1. Customer selects courier at checkout
2. `shippingMethod` contains provider slug (e.g., "tcs", "leopard")
3. Checkout uses `getProvider(shippingMethod)` to get appropriate adapter
4. Provider adapter handles API calls and data transformation
5. Courier data is embedded in `Order.courier` subdocument
6. Tracking and management use unified data structure

## Benefits Achieved

1. **Scalability**: Easy to add new courier providers without schema changes
2. **Maintainability**: Single order schema reduces complexity
3. **Flexibility**: Customers can choose from multiple courier options
4. **Consistency**: Unified data structure across all operations
5. **Backward Compatibility**: Existing orders continue to work

## Migration Notes

- Existing TCS orders will continue to work with `courier.provider: "tcs"`
- No data migration required due to embedded courier structure
- API endpoints maintain backward compatibility
- UI components gracefully handle both old and new data structures

## Next Steps

1. Complete generic tracking endpoint implementation
2. Add additional courier provider adapters
3. Implement customer courier selection UI
4. Update admin panel for multi-provider management
5. Conduct comprehensive testing and validation

