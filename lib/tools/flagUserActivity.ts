/**
 * Flag unusual user activity for review
 * @param userId - User ID to flag
 * @param activityType - Type of activity detected
 * @returns Flag details
 */
export default async function flagUserActivity(
  userId: string,
  activityType: string = "suspicious"
): Promise<any> {
  console.log(
    `[MCP Tool] flagUserActivity called - User: ${userId}, Type: ${activityType}`
  );

  // Mock activity flagging
  const flag = {
    success: true,
    flagId: `FLAG-${Date.now()}`,
    userId,
    activityType,
    severity: activityType === "fraud" ? "high" : "medium",
    details: {
      detectedAt: new Date().toISOString(),
      reason: `Unusual ${activityType} activity detected`,
      requiresReview: true,
    },
    actions: [
      "Account temporarily limited",
      "Manual review required",
      "Notification sent to admin",
    ],
  };

  console.log(
    `[MCP Tool] flagUserActivity created flag - ID: ${flag.flagId}, Severity: ${flag.severity}`
  );
  return flag;
}
