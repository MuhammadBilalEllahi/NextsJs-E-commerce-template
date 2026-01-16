import Counter from "@/models/Counter";
import { ORDER_ID_PREFIX, REF_ID_PREFIX } from "@/lib/cacheConstants";

/**
 * Generate a sequential order ID using MongoDB counter
 * @param prefix - The prefix for the ID (e.g., "DM", "ORD")
 * @param padding - Number of digits to pad with zeros (default: 6)
 * @returns Promise<string> - The generated order ID
 */
export async function generateOrderId(
  prefix: string = ORDER_ID_PREFIX,
  padding: number = 6
): Promise<string> {
  const counter = await Counter.findOneAndUpdate(
    { id: "orderId" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  return prefix + counter.seq.toString().padStart(padding, "0");
}

/**
 * Generate a sequential reference ID using MongoDB counter
 * @param prefix - The prefix for the ID (e.g., "REF", "TRK")
 * @param padding - Number of digits to pad with zeros (default: 5)
 * @returns Promise<string> - The generated reference ID
 */
export async function generateRefId(
  prefix: string = REF_ID_PREFIX,
  padding: number = 5
): Promise<string> {
  const counter = await Counter.findOneAndUpdate(
    { id: "refId" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  return prefix + counter.seq.toString().padStart(padding, "0");
}

/**
 * Generate both order ID and reference ID in a single transaction
 * @param orderPrefix - The prefix for the order ID (default: "DM")
 * @param refPrefix - The prefix for the reference ID (default: "REF")
 * @returns Promise<{orderId: string, refId: string}>
 */
export async function generateOrderIds(
  orderPrefix: string = ORDER_ID_PREFIX,
  refPrefix: string = REF_ID_PREFIX
): Promise<{ orderId: string; refId: string }> {
  const [orderId, refId] = await Promise.all([
    generateOrderId(orderPrefix),
    generateRefId(refPrefix),
  ]);

  return { orderId, refId };
}
