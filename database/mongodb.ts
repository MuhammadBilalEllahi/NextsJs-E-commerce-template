// lib/mongodb.js
import mongoose from "mongoose";
import "@/models";

declare global {
  // eslint-disable-next-line no-var
  var mongoose: { conn: any; promise: any } | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

// Apply default schema options globally
mongoose.plugin((schema) => {
  schema.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => {
      ret.id = (ret._id as any).toString();
      delete ret._id;
    },
  });

  schema.set("toObject", {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => {
      ret.id = (ret._id as any).toString();
      delete ret._id;
    },
  });
});
/**
 * Cached connection for MongoDB.
 */
let cached: { conn: any; promise: any } = global.mongoose || {
  conn: null,
  promise: null,
};

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI as string)
      .then((mongoose) => {
        return mongoose;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
