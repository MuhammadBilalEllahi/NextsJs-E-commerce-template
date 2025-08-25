import dbConnect from "../lib/mongodb";
import Product from "../models/Product";
import BrandProducts from "../models/BrandProducts";
import CategoryProducts from "../models/CategoryProducts";

async function initRelationshipSchemas() {
  try {
    await dbConnect();
    console.log("Connected to database");

    // Get all products
    const products = await Product.find({}).populate("brand categories");
    console.log(`Found ${products.length} products`);

    // Initialize brand products
    for (const product of products) {
      if (product.brand) {
        await BrandProducts.findByIdAndUpdate(
          product.brand,
          { $addToSet: { products: product._id } },
          { upsert: true }
        );
        console.log(`Added product ${product._id} to brand ${product.brand}`);
      }

      if (product.categories && product.categories.length > 0) {
        for (const category of product.categories) {
          await CategoryProducts.findByIdAndUpdate(
            category,
            { $addToSet: { products: product._id } },
            { upsert: true }
          );
          console.log(`Added product ${product._id} to category ${category}`);
        }
      }
    }

    console.log("Relationship schemas initialized successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error initializing relationship schemas:", error);
    process.exit(1);
  }
}

initRelationshipSchemas();
