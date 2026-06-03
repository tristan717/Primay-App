import { db } from "@/utils/dbServer";

export async function logActivity({
  userId,
  userName,
  role,
  position,
  department,
  activityName,
  method,
  activityJson = {},
  ipAdd,
  fileUrl = null,
  fileName = null,
  fileType = null,
}) {
  try {
    const { error } = await db.from("activity_log").insert({
      activity_name: activityName,
      user_id: userId,
      user_name: userName,
      activity_json: activityJson,
      role,
      position,
      department,
      ip_add: ipAdd,
      method,
      file_url: fileUrl,
      file_name: fileName,
      file_type: fileType,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error logging activity:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error in logActivity:", error);
    return false;
  }
}