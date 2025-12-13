import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";

async function UserDetails() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return JSON.stringify(data.claims, null, 2);
}

export default function ProtectedPage() {
  return (
    <div>
      <h2 className="font-bold text-2xl mb-4">Your user details</h2>
      <pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto">
        <Suspense>
          <UserDetails />
        </Suspense>
      </pre>
    </div>
  );
}
