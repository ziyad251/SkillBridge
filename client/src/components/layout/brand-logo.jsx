import { GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

function BrandLogo({ to = "/", className, showText = true, tone = "dark" }) {
  const light = tone === "light";
  return (
    <Link
      to={to}
      aria-label="SkillBridge home"
      className={cn(
        "group flex items-center gap-2.5 rounded-md font-bold tracking-tight transition-opacity hover:opacity-90",
        className
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl shadow-md shadow-teal-900/20 transition-transform duration-200 group-hover:scale-105",
          light ? "bg-white" : "bg-[#176B5F]"
        )}
      >
        <GraduationCap className={cn("h-5 w-5", light ? "text-[#176B5F]" : "text-white")} aria-hidden="true" />
      </span>
      {showText ? (
        <span
          className={cn("text-base md:text-lg", light ? "text-white" : "text-[#1B302D]")}
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Skill<span className={light ? "text-teal-200" : "text-[#176B5F]"}>Bridge</span>
        </span>
      ) : null}
    </Link>
  );
}

export default BrandLogo;
