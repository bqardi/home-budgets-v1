import { createClient } from "@/lib/supabase/server";

/**
 * Get user claims from JWT token (fast, no DB call)
 * Use for non-critical checks like showing/hiding UI elements
 */
export async function getAuthUserClaims() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return data?.claims;
}

/**
 * Get full user object from database (slower, validates session)
 * Use for security-critical operations like protecting routes
 */
export async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
