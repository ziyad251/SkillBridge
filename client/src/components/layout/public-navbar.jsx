import BrandLogo from "@/components/layout/brand-logo";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";

function PublicNavbar() {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        <BrandLogo to="/" />

        <nav className="hidden items-center gap-8 md:flex">
          <Link to="/" className="lms-nav-link">
            Home
          </Link>
          <Link to="/courses" className="lms-nav-link">
            Courses
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="hidden text-muted-foreground hover:text-foreground sm:inline-flex"
            onClick={() => navigate("/auth")}
          >
            Login
          </Button>
          <Button className="lms-btn-primary" onClick={() => navigate("/auth?tab=signup")}>
            Register
          </Button>
        </div>
      </div>
    </header>
  );
}

export default PublicNavbar;
