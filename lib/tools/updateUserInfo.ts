/**
 * Update user profile information
 * @param userId - User ID
 * @param fields - Object containing fields to update
 * @returns Updated user information
 */
export default async function updateUserInfo(
  userId: string,
  fields: Record<string, any>
): Promise<any> {
  console.log(`[MCP Tool] updateUserInfo called for userId: ${userId}`);

  // Mock user update
  const updatedUser = {
    success: true,
    userId,
    updatedFields: Object.keys(fields),
    user: {
      id: userId,
      name: fields.name || "Customer Name",
      email: fields.email || "customer@example.com",
      phone: fields.phone || "+92-300-1234567",
      address: fields.address || "123 Main St, Lahore",
      updatedAt: new Date().toISOString(),
    },
  };

  console.log(
    `[MCP Tool] updateUserInfo updated ${updatedUser.updatedFields.length} fields`
  );
  return updatedUser;
}
