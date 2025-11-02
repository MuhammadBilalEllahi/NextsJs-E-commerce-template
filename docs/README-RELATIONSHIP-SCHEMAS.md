# Relationship Schemas and Enhanced Product Management

This document describes the new relationship schemas and enhanced features added to the Dehli Mirch e-commerce platform.

## New Schemas

### 1. BrandProducts Schema

- **Purpose**: Maintains a list of all products associated with each brand
- **Structure**:
  - `id`: References the Brand ID
  - `products`: Array of Product IDs
  - `productCount`: Auto-calculated count of products
  - `updatedAt`: Timestamp of last update

### 2. CategoryProducts Schema

- **Purpose**: Maintains a list of all products associated with each category
- **Structure**:
  - `id`: References the Category ID
  - `products`: Array of Product IDs
  - `productCount`: Auto-calculated count of products
  - `updatedAt`: Timestamp of last update

## Enhanced Features

### 1. Product-Level Status Controls

- **isActive**: Toggle product visibility to customers
- **isOutOfStock**: Mark entire product as out of stock
- Both fields can be edited in the product edit form

### 2. Brand Management

- **Remove Brand**: Users can now remove brands from products in edit mode
- **Brand Relationships**: Automatically maintained in BrandProducts schema
- **No Schema Changes**: Main Product and Brand schemas remain unchanged

### 3. Category Management

- **Category Relationships**: Automatically maintained in CategoryProducts schema
- **No Schema Changes**: Main Product and Category schemas remain unchanged

### 4. Variant Management

- **Enhanced Controls**: Edit isActive and isOutOfStock for individual variants
- **Image Management**: Add/remove images for variants
- **Better UX**: Improved variant editing interface

## Database Operations

### Creating Products

- Product is automatically added to BrandProducts and CategoryProducts schemas
- Relationships are maintained in real-time

### Updating Products

- Brand changes: Product is removed from old brand, added to new brand
- Category changes: Product is removed from old categories, added to new categories
- Status changes: isActive and isOutOfStock can be toggled

### Deleting Products

- Product is automatically removed from all relationship schemas
- Clean deletion with no orphaned references

## Initialization

To initialize the relationship schemas for existing data:

```bash
npm run init-schemas
```

This script will:

1. Connect to the database
2. Find all existing products
3. Create BrandProducts entries for products with brands
4. Create CategoryProducts entries for products with categories
5. Maintain data integrity

## Benefits

1. **Performance**: Faster queries for brand/category product lists
2. **Scalability**: No need to modify main schemas when relationships change
3. **Data Integrity**: Automatic cleanup of relationships
4. **Flexibility**: Easy to add/remove brands and categories
5. **User Experience**: Better product management interface

## API Endpoints

### Product Management

- `PUT /api/admin/product`: Updated to handle new fields and maintain relationships
- `POST /api/admin/product`: Updated to create relationships on creation
- `DELETE /api/admin/product`: Updated to clean up relationships on deletion

### Variant Management

- `PUT /api/admin/variant`: Enhanced to handle images and status fields
- `POST /api/admin/variant`: Creates variants with proper product references
- `DELETE /api/admin/variant`: Removes variants and updates product references

## Frontend Changes

### Product Edit Form

- Added "Remove Brand" button
- Added product-level isOutOfStock toggle
- Enhanced variant management interface
- Better image handling for variants

### Products Table

- Added Status column showing active/inactive and stock status
- Visual indicators for product status
- Improved variant count display

## Migration Notes

- Existing products will work without changes
- Run `npm run init-schemas` to populate relationship schemas
- No breaking changes to existing functionality
- Backward compatible with current data structure
