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
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#176B5F] shadow-lg shadow-teal-900/20 transition-transform duration-200 group-hover:scale-105">
        <GraduationCap className="h-5 w-5 text-white" />
      </span>
      {showText ? (
        <span className="text-base md:text-lg">
          LMS<span className="text-[#E8755E]">Learn</span>
        </span>
      ) : null}
    </Link>
  );
}

export default BrandLogo;
