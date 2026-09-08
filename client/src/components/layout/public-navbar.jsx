import BrandLogo from "@/components/layout/brand-logo";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function PublicNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const isActive = (path) => location.pathname === path;
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (menuOpen && menuRef.current && !menuRef.current.contains(event.target)) {
        closeMenu();
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [menuOpen]);

  return (
    <header ref={menuRef} className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        <BrandLogo to="/" />

        <nav className="hidden items-center gap-8 md:flex">
          <Link to="/" className={`lms-nav-link ${isActive("/") ? "lms-nav-link-active" : ""}`}>
            Home
          </Link>
          <Link to="/courses" className={`lms-nav-link ${isActive("/courses") ? "lms-nav-link-active" : ""}`}>
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
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      {menuOpen ? (
        <nav className="border-t border-border/60 bg-white px-4 py-3 md:hidden">
          <Link onClick={closeMenu} to="/" className={`block rounded-md px-3 py-2 text-sm font-semibold ${isActive("/") ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}>Home</Link>
          <Link onClick={closeMenu} to="/courses" className={`mt-1 block rounded-md px-3 py-2 text-sm font-semibold ${isActive("/courses") ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}>Courses</Link>
        </nav>
      ) : null}
    </header>
  );
}

export default PublicNavbar;
