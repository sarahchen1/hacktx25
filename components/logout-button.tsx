"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <Button
      onClick={logout}
      variant="outline"
      size="sm"
      className="border-red-300/30 text-red-200 hover:bg-red-300/10"
    >
      <LogOut className="h-4 w-4 mr-2" />
      Logout
    </Button>
  );
}
