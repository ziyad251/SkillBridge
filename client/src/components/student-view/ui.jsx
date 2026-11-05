import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState } from "react";

/* Shared building blocks for the logged-in student area.
   They mirror the landing page: white / #FAFAFA surfaces, near-black text,
   1px #E5E5E5 borders, rounded-2xl cards and pill-shaped buttons. */

export const btnPrimary = "lms-btn-primary rounded-full px-5 shadow-none";
export const btnSecondary =
  "rounded-full border-neutral-300 bg-white px-5 text-[#171717] shadow-none hover:border-neutral-400 hover:bg-neutral-50";

export function FadeIn({ children, className, delay = 0, as = "div" }) {
  const Component = motion[as];
  return (
    <Component
      className={className}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
    >
      {children}
    </Component>
  );
}

export function PageContainer({ children, className }) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl px-4 lg:px-8", className)}>{children}</div>
  );
}

export function Kicker({ children, className }) {
  return (
    <p className={cn("text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500", className)}>
      {children}
    </p>
  );
}

export function SectionHeader({ title, description, action, id }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h2 id={id} className="text-xl font-bold tracking-tight text-[#171717] sm:text-2xl">
          {title}
        </h2>
        {description ? <p className="mt-1 text-sm text-neutral-600">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Panel({ children, className, as: Component = "div", ...props }) {
  return (
    <Component
      className={cn("rounded-2xl border border-[#E5E5E5] bg-white", className)}
      {...props}
    >
      {children}
    </Component>
  );
}

export function ProgressBar({ value, className, label }) {
  const pct = Math.max(0, Math.min(100, Math.round(value || 0)));
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-label={label}
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-neutral-200", className)}
    >
      <div className="h-full rounded-full bg-[#0A0A0A] transition-all duration-500" style={{ width: `${pct}%` }} />
    </div>
  );
}

function initialsFrom(title) {
  const words = String(title || "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return "SB";
  return words
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/* 16:9 thumbnail; falls back to a neutral typographic placeholder when the
   course has no image or the image fails to load. */
export function CourseThumbnail({ src, title, className, imgClassName }) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  return (
    <div className={cn("relative aspect-video w-full overflow-hidden bg-[#F5F5F5]", className)}>
      {showImage ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className={cn("h-full w-full object-cover", imgClassName)}
        />
      ) : (
        <div
          aria-hidden="true"
          className="flex h-full w-full items-center justify-center text-3xl font-bold tracking-tight text-neutral-400"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {initialsFrom(title)}
        </div>
      )}
    </div>
  );
}

export function Tag({ children, className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-[#E5E5E5] bg-white px-2.5 py-0.5 text-xs font-medium text-neutral-600",
        className
      )}
    >
      {children}
    </span>
  );
}
