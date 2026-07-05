import { GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

function BrandLogo({ to = "/", className, showText = true }) {
  return (
    <Link
      to={to}
      className={cn(
        "group flex items-center gap-2.5 font-extrabold tracking-tight transition-opacity hover:opacity-90",
        className
      )}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] shadow-lg shadow-indigo-500/30 transition-transform duration-200 group-hover:scale-105">
        <GraduationCap className="h-5 w-5 text-white" />
      </span>
      {showText ? (
        <span className="text-base md:text-lg">
          LMS<span className="text-indigo-400">Learn</span>
        </span>
      ) : null}
    </Link>
  );
}

export default BrandLogo;
