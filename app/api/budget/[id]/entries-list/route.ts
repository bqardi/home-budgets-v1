import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: budgetId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch entries with their amounts
    const { data: entries, error } = await supabase
      .from("entries")
      .select(
        `
        id,
        description,
        category_id,
        entry_type,
        created_at,
        entry_amounts (
          id,
          month,
          amount
        )
      `
      )
      .eq("budget_id", budgetId)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch entries" },
        { status: 500 }
      );
    }

    return NextResponse.json({ entries: entries || [] });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
