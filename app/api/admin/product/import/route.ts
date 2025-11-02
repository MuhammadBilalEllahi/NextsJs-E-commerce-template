import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/database/mongodb";
import Product from "@/models/Product";
import Variant from "@/models/Variant";
import Brand from "@/models/Brand";
import Category from "@/models/Category";
import BrandProducts from "@/models/BrandProducts";
import CategoryProducts from "@/models/CategoryProducts";
import ImportHistory from "@/models/ImportHistory";
import { MODELS } from "@/models/constants/constants";
import { v4 as uuidv4 } from "uuid";

interface CSVRow {
  "Product Name": string;
  Description: string;
  Ingredients: string;
  Price: string;
  "Discount (%)": string;
  Slug: string;
  Active: string;
  "Out of Stock": string;
  Featured: string;
  "Top Selling": string;
  "New Arrival": string;
  "Best Selling": string;
  Special: string;
  Grocery: string;
  Brand: string;
  Categories: string;
  Images: string;
  "Variant SKU": string;
  "Variant Label": string;
  "Variant Slug": string;
  "Variant Price": string;
  "Variant Discount (%)": string;
  "Variant Stock": string;
  "Variant Active": string;
  "Variant Out of Stock": string;
}

function parseCSV(csvText: string): CSVRow[] {
  const lines = csvText.split("\n");
  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));

  const rows: CSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Simple CSV parsing (handles quoted fields)
    const values: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    if (values.length >= headers.length) {
      const row: any = {};
      headers.forEach((header, index) => {
        let value = values[index]?.replace(/"/g, "") || "";

        // Convert boolean strings
        if (
          [
            "Active",
            "Out of Stock",
            "Featured",
            "Top Selling",
            "New Arrival",
            "Best Selling",
            "Special",
            "Grocery",
            "Variant Active",
            "Variant Out of Stock",
          ].includes(header)
        ) {
          value = value.toUpperCase() === "TRUE" ? "true" : "false";
        }

        // Convert numeric strings
        if (
          [
            "Price",
            "Discount (%)",
            "Variant Price",
            "Variant Discount (%)",
            "Variant Stock",
          ].includes(header)
        ) {
          value = (parseFloat(value) || 0).toString();
        }

        row[header] = value;
      });

      rows.push(row as CSVRow);
    }
  }

  return rows;
}

async function findOrCreateBrand(brandName: string) {
  let brand = await Brand.findOne({ name: brandName });
  if (!brand) {
    brand = await Brand.create({
      name: brandName,
      description: `${brandName} brand`,
      isActive: true,
    });
  }
  return brand;
}

async function findOrCreateCategories(categoryNames: string[]) {
  const categories = [];

  for (const categoryName of categoryNames) {
    let category = await Category.findOne({ name: categoryName.trim() });
    if (!category) {
      category = await Category.create({
        name: categoryName.trim(),
        slug: categoryName.toLowerCase().replace(/\s+/g, "-").trim(),
        description: `${categoryName} category`,
        isActive: true,
      });
    }
    categories.push(category);
  }

  return categories;
}

function getRandomImagesForCategory(
  categoryName: string,
  imageString?: string
): string[] {
  // If images are provided in CSV, use them
  if (imageString && imageString.trim()) {
    return imageString
      .split(",")
      .map((img) => img.trim())
      .filter((img) => img);
  }

  // Category-based image mapping
  const categoryImageMap: { [key: string]: string[] } = {
    spices: [
      "whole-spices.png",
      "spice-closeup.png",
      "spice-texture.png",
      "garam-masala.png",
      "assorted-masalas.png",
      "spice-cooking.png",
    ],
    "cooking essentials": [
      "whole-spices.png",
      "spice-closeup.png",
      "spice-texture.png",
    ],
    "health products": [
      "spice-texture.png",
      "garam-masala.png",
      "mango-pickle-jar.png",
    ],
    rice: ["modern-tech-product.png"],
    staples: ["modern-tech-product.png"],
    lentils: ["modern-tech-product.png"],
    "masala blends": [
      "garam-masala.png",
      "assorted-masalas.png",
      "spice-cooking.png",
    ],
    dairy: ["jar-of-pickles.png", "mango-pickle-jar.png"],
    beverages: ["chai-snacks.png"],
    flour: ["modern-tech-product.png"],
    "south indian": ["assorted-masalas.png", "spice-cooking.png"],
    sweeteners: ["mango-pickle-jar.png", "jar-of-pickles.png"],
  };

  // Find matching category
  const lowerCategory = categoryName.toLowerCase();
  for (const [key, images] of Object.entries(categoryImageMap)) {
    if (lowerCategory.includes(key)) {
      // Return 1-2 random images from the category
      const shuffled = images.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, Math.min(2, shuffled.length));
    }
  }

  // Default fallback images
  const defaultImages = ["modern-tech-product.png", "placeholder.jpg"];
  return [defaultImages[Math.floor(Math.random() * defaultImages.length)]];
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const csvFile = formData.get("csvFile") as File;

    if (!csvFile) {
      return NextResponse.json(
        { error: "No CSV file provided" },
        { status: 400 }
      );
    }

    const csvText = await csvFile.text();
    const csvRows = parseCSV(csvText);

    if (csvRows.length === 0) {
      return NextResponse.json(
        { error: "No valid data found in CSV" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Generate unique import ID
    const importId = uuidv4();
    const fileName = csvFile.name;

    const results = {
      success: 0,
      errorCount: 0,
      productsCreated: 0,
      variantsCreated: 0,
      errorDetails: [] as string[],
      importedProducts: [] as {
        productId: string;
        productName: string;
        productSlug: string;
        variants: {
          variantId: string;
          variantSku: string;
          variantLabel: string;
        }[];
      }[],
    };

    // Group rows by product (same product name and slug)
    const productGroups = new Map<string, CSVRow[]>();

    for (const row of csvRows) {
      const key = `${row["Product Name"]}-${row.Slug}`;
      if (!productGroups.has(key)) {
        productGroups.set(key, []);
      }
      productGroups.get(key)!.push(row);
    }

    for (const [productKey, rows] of productGroups) {
      const firstRow = rows[0];
      try {
        // Find or create brand
        const brand = await findOrCreateBrand(firstRow.Brand);

        // Find or create categories
        const categoryNames = firstRow.Categories.split(",")
          .map((c) => c.trim())
          .filter((c) => c);
        const categories = await findOrCreateCategories(categoryNames);

        // Get images for the product
        const productImages = getRandomImagesForCategory(
          categoryNames[0] || "",
          firstRow.Images
        );

        // Check if product already exists
        let product = await Product.findOne({ slug: firstRow.Slug });

        if (product) {
          // Update existing product
          product.name = firstRow["Product Name"];
          product.description = firstRow.Description;
          product.ingredients = firstRow.Ingredients || "";
          product.price = parseFloat(firstRow.Price);
          product.discount = parseFloat(firstRow["Discount (%)"]);
          product.isActive = firstRow.Active === "true";
          product.isOutOfStock = firstRow["Out of Stock"] === "true";
          product.isFeatured = firstRow.Featured === "true";
          product.isTopSelling = firstRow["Top Selling"] === "true";
          product.isNewArrival = firstRow["New Arrival"] === "true";
          product.isBestSelling = firstRow["Best Selling"] === "true";
          product.isSpecial = firstRow.Special === "true";
          product.isGrocery = firstRow.Grocery === "true";
          product.brand = brand.id;
          product.categories = categories.map((c) => c.id);
          product.images = productImages;
          product.updatedAt = new Date();

          await product.save();
        } else {
          // Create new product
          product = await Product.create({
            name: firstRow["Product Name"],
            slug: firstRow.Slug,
            description: firstRow.Description,
            ingredients: firstRow.Ingredients || "",
            price: parseFloat(firstRow.Price),
            discount: parseFloat(firstRow["Discount (%)"]),
            isActive: firstRow.Active === "true",
            isOutOfStock: firstRow["Out of Stock"] === "true",
            isFeatured: firstRow.Featured === "true",
            isTopSelling: firstRow["Top Selling"] === "true",
            isNewArrival: firstRow["New Arrival"] === "true",
            isBestSelling: firstRow["Best Selling"] === "true",
            isSpecial: firstRow.Special === "true",
            isGrocery: firstRow.Grocery === "true",
            brand: brand.id,
            categories: categories.map((c) => c.id),
            images: productImages,
            variants: [],
            reviews: [],
            ratingAvg: 0,
            reviewCount: 0,
            stock: 0,
          });

          results.productsCreated++;
        }

        // Track variants for this product
        const productVariants: {
          variantId: string;
          variantSku: string;
          variantLabel: string;
        }[] = [];

        // Create/update variants
        for (const row of rows) {
          try {
            // Check if variant already exists
            let variant = await Variant.findOne({ sku: row["Variant SKU"] });

            if (variant) {
              // Update existing variant
              variant.label = row["Variant Label"];
              variant.slug = row["Variant Slug"];
              variant.price = parseFloat(row["Variant Price"]);
              variant.discount = parseFloat(row["Variant Discount (%)"]);
              variant.stock = parseFloat(row["Variant Stock"]);
              variant.isActive = row["Variant Active"] === "true";
              variant.isOutOfStock = row["Variant Out of Stock"] === "true";
              variant.updatedAt = new Date();

              await variant.save();
            } else {
              // Create new variant
              variant = await Variant.create({
                product: product.id,
                sku: row["Variant SKU"],
                slug: row["Variant Slug"],
                label: row["Variant Label"],
                price: parseFloat(row["Variant Price"]),
                discount: parseFloat(row["Variant Discount (%)"]),
                stock: parseFloat(row["Variant Stock"]),
                isActive: row["Variant Active"] === "true",
                isOutOfStock: row["Variant Out of Stock"] === "true",
                images: [],
              });

              results.variantsCreated++;
            }

            // Track variant for history
            productVariants.push({
              variantId: String(variant.id),
              variantSku: row["Variant SKU"],
              variantLabel: row["Variant Label"],
            });

            // Add variant to product if not already added
            if (!product.variants.includes(variant.id)) {
              product.variants.push(variant.id);
            }
          } catch (variantError: any) {
            results.errorCount++;
            results.errorDetails.push(
              `Variant ${row["Variant SKU"]}: ${variantError.message}`
            );
          }
        }

        // Track product for history
        results.importedProducts.push({
          productId: String(product.id),
          productName: firstRow["Product Name"],
          productSlug: firstRow.Slug,
          variants: productVariants,
        });

        // Update product with variants
        await product.save();

        // Update brand-products relationship
        await BrandProducts.findOneAndUpdate(
          { id: brand.id },
          {
            $addToSet: { products: product.id },
            $set: { updatedAt: new Date() },
          },
          { upsert: true }
        );

        // Update category-products relationships
        for (const category of categories) {
          await CategoryProducts.findOneAndUpdate(
            { id: category.id },
            {
              $addToSet: { products: product.id },
              $set: { updatedAt: new Date() },
            },
            { upsert: true }
          );
        }

        results.success++;
      } catch (productError: any) {
        results.errorCount++;
        results.errorDetails.push(
          `Product ${firstRow["Product Name"]}: ${productError.message}`
        );
      }
    }

    // Save import history
    try {
      await ImportHistory.create({
        importId,
        fileName,
        importedBy: session.user.id,
        totalRows: csvRows.length,
        productsCreated: results.productsCreated,
        variantsCreated: results.variantsCreated,
        successCount: results.success,
        errorCount: results.errorCount,
        errorDetails: results.errorDetails,
        products: results.importedProducts.map((p) => ({
          productId: p.productId,
          productName: p.productName,
          productSlug: p.productSlug,
          variants: p.variants.map((v) => ({
            variantId: v.variantId,
            variantSku: v.variantSku,
            variantLabel: v.variantLabel,
          })),
        })),
      });
    } catch (historyError: any) {
      console.error("Failed to save import history:", historyError);
      // Don't fail the entire import if history logging fails
    }

    return NextResponse.json({
      message: "CSV import completed",
      importId,
      results: {
        totalProcessed: csvRows.length,
        productsCreated: results.productsCreated,
        variantsCreated: results.variantsCreated,
        success: results.success,
        errors: results.errorCount,
        errorDetails: results.errorDetails,
      },
    });
  } catch (error: any) {
    console.error("CSV import error:", error);
    return NextResponse.json(
      { error: "Failed to import CSV", details: error.message },
      { status: 500 }
    );
  }
}
