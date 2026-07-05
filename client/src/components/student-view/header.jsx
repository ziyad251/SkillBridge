import BrandLogo from "@/components/layout/brand-logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BookOpen, LayoutDashboard, TvMinimalPlay, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";

function StudentViewCommonHeader({ resetCredentials, auth }) {
  const navigate = useNavigate();
  const dashboardPath = auth?.user?.role === "instructor" ? "/instructor" : "/home";
  const initials = (auth?.user?.userName || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  function handleLogout() {
    resetCredentials();
    sessionStorage.clear();
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        <div className="flex items-center gap-2 md:gap-6">
          <BrandLogo to={dashboardPath} />

          <nav className="hidden items-center gap-1 sm:flex">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(dashboardPath)}
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/courses")}
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <BookOpen className="h-4 w-4" />
              Courses
            </Button>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/student-courses")}
            className="gap-1.5 border-border/60"
          >
            <TvMinimalPlay className="h-4 w-4" />
            <span className="hidden sm:inline">My Courses</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-border/60 pl-1.5 pr-2 transition-all hover:border-indigo-500/40"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] text-xs font-bold text-white">
                  {initials}
                </span>
                <span className="hidden max-w-[120px] truncate md:inline">
                  {auth?.user?.userName || "Account"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate("/profile")} className="gap-2">
                <User className="h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default StudentViewCommonHeader;
