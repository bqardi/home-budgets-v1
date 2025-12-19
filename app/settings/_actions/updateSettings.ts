"use server";

import { createClient } from "@/lib/supabase/server";
import { Settings } from "@/lib/data/settings";

/**
 * Server Action: Update user settings
 * This must be a separate server action file to avoid importing server-side code in client components
 *
 * Pattern:
 * - "use server" directive at the top
 * - Validates user is authenticated
 * - Only allows users to update their own settings
 * - Returns success/error response with type safety
 */
export async function updateSettingsAction(
  updates: Partial<Pick<Settings, "currency" | "locale">>
): Promise<{ success: boolean; data?: Settings; error?: string }> {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    return { success: false, error: "User not authenticated" };
  }

  const { data, error } = await supabase
    .from("settings")
    .update(updates)
    .eq("user_id", userData.user.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating settings:", error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}
