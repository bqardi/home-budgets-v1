import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface Settings {
  id: string;
  user_id: string;
  currency: string;
  locale: string;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch user settings from the database
 * If no settings exist, creates a new default settings record
 *
 * @returns Settings object or null if error
 */
export async function getSettings(): Promise<Settings | null> {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    redirect("/auth/login");
  }

  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching settings:", error);
    return null;
  }

  if (!data) {
    const { data: newSettings, error: insertError } = await supabase
      .from("settings")
      .insert({
        user_id: userData.user.id,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating settings:", insertError);
      return null;
    }

    return newSettings;
  }

  return data;
}
