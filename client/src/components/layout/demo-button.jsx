import { Button } from "@/components/ui/button";
import useDemoLogin from "@/hooks/use-demo-login";
import { cn } from "@/lib/utils";
import { Loader2, PlayCircle } from "lucide-react";

/** "Try demo" button: one-click sign-in to the shared demo student account. */
function DemoButton({ children = "Try demo", className, variant, size, showIcon = true }) {
  const { loginAsDemo, demoLoading } = useDemoLogin();

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={loginAsDemo}
      disabled={demoLoading}
      aria-busy={demoLoading}
      className={cn(!variant && "lms-btn-primary", className)}
    >
      {demoLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
      ) : showIcon ? (
        <PlayCircle className="mr-2 h-4 w-4" aria-hidden="true" />
      ) : null}
      {demoLoading ? "Signing in…" : children}
    </Button>
  );
}

export default DemoButton;
