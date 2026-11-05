import BrandLogo from "@/components/layout/brand-logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import DemoButton from "@/components/layout/demo-button";
import { cn } from "@/lib/utils";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const NAV_LINKS = [
  { label: "How it works", to: { pathname: "/", hash: "#how-it-works" } },
  { label: "Features", to: { pathname: "/", hash: "#features" } },
  { label: "Courses", to: { pathname: "/courses" } },
];

function PublicNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef(null);

  const dashboardPath = auth?.user?.role === "instructor" ? "/instructor" : "/home";

  const isActive = (link) =>
    link.to.hash
      ? location.pathname === "/" && location.hash === link.to.hash
      : location.pathname === link.to.pathname;

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    function handleOutsideClick(event) {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    function handleEscape(event) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  return (
    <header
      ref={headerRef}
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-colors duration-200",
        scrolled || menuOpen
          ? "border-border/60 bg-white/90 backdrop-blur-xl"
          : "border-transparent bg-white/60 backdrop-blur-md"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 lg:px-8">
        <BrandLogo to="/" />

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              aria-current={isActive(link) ? "page" : undefined}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-[#176B5F]/5 hover:text-[#176B5F]",
                isActive(link) && "text-[#176B5F]"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {auth?.authenticate ? (
            <Button className="lms-btn-primary rounded-full px-5" onClick={() => navigate(dashboardPath)}>
              My dashboard
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                className="hidden rounded-full text-[#1B302D] sm:inline-flex"
                onClick={() => navigate("/auth")}
              >
                Log in
              </Button>
              <DemoButton className="hidden rounded-full px-5 sm:inline-flex" />
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {menuOpen ? (
        <nav id="mobile-nav" aria-label="Mobile" className="absolute inset-x-0 top-full border-y border-border/60 bg-white px-4 pb-4 pt-2 shadow-lg md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              aria-current={isActive(link) ? "page" : undefined}
              className={cn(
                "block rounded-lg px-3 py-2.5 text-sm font-semibold",
                isActive(link) ? "bg-[#176B5F]/10 text-[#176B5F]" : "text-[#1B302D] hover:bg-muted"
              )}
            >
              {link.label}
            </Link>
          ))}
          {!auth?.authenticate ? (
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border/60 pt-3 sm:hidden">
              <Button variant="outline" className="rounded-full" onClick={() => navigate("/auth")}>
                Log in
              </Button>
              <DemoButton className="w-full rounded-full" />
            </div>
          ) : null}
        </nav>
      ) : null}
    </header>
  );
}

export default PublicNavbar;
