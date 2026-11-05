import BrandLogo from "@/components/layout/brand-logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { LogOut, Menu, User, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";

function StudentViewCommonHeader({ resetCredentials, auth }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef(null);

  const dashboardPath = auth?.user?.role === "instructor" ? "/instructor" : "/home";
  const navLinks =
    auth?.user?.role === "instructor"
      ? [{ label: "Dashboard", to: dashboardPath }]
      : [
          { label: "Dashboard", to: dashboardPath },
          { label: "Courses", to: "/courses" },
          { label: "My Courses", to: "/student-courses" },
        ];
  const userName = auth?.user?.userName || "Account";
  const initials = (auth?.user?.userName || "U")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isActive = (to) =>
    to === "/courses"
      ? location.pathname === "/courses" || location.pathname.startsWith("/course/details")
      : location.pathname === to;

  function handleLogout() {
    resetCredentials();
    sessionStorage.clear();
    navigate("/");
  }

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
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    function handleOutsideClick(event) {
      if (headerRef.current && !headerRef.current.contains(event.target)) setMenuOpen(false);
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
          ? "border-[#E5E5E5] bg-white/90 backdrop-blur-xl"
          : "border-transparent bg-white/60 backdrop-blur-md"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 lg:px-8">
        <BrandLogo to={dashboardPath} />

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              aria-current={isActive(link.to) ? "page" : undefined}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium text-neutral-500 transition-colors hover:bg-[#0A0A0A]/5 hover:text-[#0A0A0A]",
                isActive(link.to) && "bg-[#0A0A0A]/5 text-[#0A0A0A]"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Account menu"
                className="flex items-center gap-2 rounded-full border border-[#E5E5E5] bg-white py-1 pl-1 pr-1 transition-colors hover:border-neutral-400 md:pr-3"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0A0A0A] text-xs font-bold text-white">
                  {initials}
                </span>
                <span className="hidden max-w-[120px] truncate text-sm font-medium text-[#171717] md:inline">
                  {userName}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl border-[#E5E5E5]">
              <DropdownMenuLabel className="font-normal">
                <p className="truncate text-sm font-semibold text-[#171717]">{userName}</p>
                {auth?.user?.userEmail ? (
                  <p className="truncate text-xs text-neutral-500">{auth.user.userEmail}</p>
                ) : null}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")} className="gap-2">
                <User className="h-4 w-4" aria-hidden="true" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="student-mobile-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {menuOpen ? (
        <nav
          id="student-mobile-nav"
          aria-label="Mobile"
          className="absolute inset-x-0 top-full border-y border-[#E5E5E5] bg-white px-4 pb-4 pt-2 shadow-lg md:hidden"
        >
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              aria-current={isActive(link.to) ? "page" : undefined}
              className={cn(
                "block rounded-lg px-3 py-2.5 text-sm font-semibold",
                isActive(link.to) ? "bg-[#0A0A0A]/[0.06] text-[#0A0A0A]" : "text-[#171717] hover:bg-neutral-100"
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 border-t border-[#E5E5E5] pt-2">
            <Link to="/profile" className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-[#171717] hover:bg-neutral-100">
              Profile
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-[#171717] hover:bg-neutral-100"
            >
              Log out
            </button>
          </div>
        </nav>
      ) : null}
    </header>
  );
}

export default StudentViewCommonHeader;
