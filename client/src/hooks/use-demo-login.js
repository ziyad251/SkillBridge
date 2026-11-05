import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DEMO_CREDENTIALS, useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";

/**
 * One-click demo login. Reuses the shared `loginWithCredentials` from the auth
 * context (same token storage + setAuth flow as the normal sign-in form).
 */
export default function useDemoLogin() {
  const { loginWithCredentials } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [demoLoading, setDemoLoading] = useState(false);

  async function loginAsDemo() {
    if (demoLoading) return;
    setDemoLoading(true);

    let success = false;
    try {
      const data = await loginWithCredentials(DEMO_CREDENTIALS);
      success = Boolean(data?.success);
    } catch {
      success = false;
    }

    setDemoLoading(false);

    if (success) {
      navigate("/home");
    } else {
      toast({
        variant: "destructive",
        title: "Demo account unavailable right now",
        description: "Please try again in a moment, or sign in with your own account.",
      });
    }
  }

  return { loginAsDemo, demoLoading };
}
