import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import {
  Award,
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  Download,
  Loader2,
  Lock,
  Play,
  Plus,
  Search,
  Star,
  Video,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Drives a looping mini-animation. Returns a ref (attach it to the mock) and
 * the current step (0..count-1). The loop only runs while the mock is on
 * screen, and users who prefer reduced motion get the final, static state.
 */
export function useLoopStep(count, { interval = 1100, hold = 3, active = true } = {}) {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.3 });
  const reduced = useReducedMotion();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (reduced || !inView || !active) return undefined;
    const id = setInterval(() => setTick((t) => (t + 1) % (count + hold)), interval);
    return () => clearInterval(id);
  }, [reduced, inView, active, count, hold, interval]);

  useEffect(() => {
    if (active) setTick(0);
  }, [active]);

  const step = reduced ? count - 1 : Math.min(tick, count - 1);
  return [ref, step];
}

const pop = {
  initial: { opacity: 0, y: 8, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -6, scale: 0.96 },
  transition: { duration: 0.3, ease: "easeOut" },
};

export function MockFrame({ title, icon: Icon, badge, children, className, innerRef }) {
  return (
    <div
      ref={innerRef}
      aria-hidden="true"
      className={cn(
        "w-full select-none rounded-2xl border border-slate-200/80 bg-white p-4 text-left shadow-[0_8px_30px_-12px_rgba(15,23,42,0.18)]",
        className
      )}
    >
      {title ? (
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2 text-xs font-semibold text-slate-700">
            {Icon ? (
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#176B5F]/10 text-[#176B5F]">
                <Icon className="h-3.5 w-3.5" />
              </span>
            ) : null}
            <span className="truncate">{title}</span>
          </div>
          {badge}
        </div>
      ) : null}
      {children}
    </div>
  );
}

function Line({ className }) {
  return <div className={cn("h-2 rounded-full bg-slate-200", className)} />;
}

function ProgressBar({ value, className, barClassName }) {
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-slate-100", className)}>
      <motion.div
        className={cn("h-full rounded-full bg-[#176B5F]", barClassName)}
        initial={false}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
      />
    </div>
  );
}

/* ---------------------------------------------------------------- builder */

const BUILDER_LESSONS = ["Welcome & setup", "Core concepts", "Hands-on project"];

export function CourseBuilderMock({ className }) {
  const [ref, step] = useLoopStep(5);
  const published = step === 4;

  return (
    <MockFrame
      innerRef={ref}
      className={className}
      title="Course curriculum"
      icon={BookOpen}
      badge={
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors",
            published ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
          )}
        >
          {published ? "Published" : "Building"}
        </span>
      }
    >
      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {BUILDER_LESSONS.slice(0, Math.min(step, 3)).map((lesson, i) => (
            <motion.div
              key={lesson}
              {...pop}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white text-[10px] font-bold text-slate-500 shadow-sm">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-700">{lesson}</span>
              <Video className="h-3.5 w-3.5 shrink-0 text-[#176B5F]" />
            </motion.div>
          ))}
        </AnimatePresence>
        <div className="flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-2.5 py-2 text-xs font-medium text-slate-400">
          <Plus className="h-3.5 w-3.5" /> Add lecture
        </div>
      </div>
    </MockFrame>
  );
}

/* --------------------------------------------------------------- checkout */

export function CheckoutMock({ className, active = true }) {
  const [ref, step] = useLoopStep(3, { interval: 1400, hold: 2, active });

  return (
    <MockFrame innerRef={ref} className={className} title="Checkout" icon={Lock}>
      <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-2.5">
        <div className="h-10 w-14 shrink-0 rounded-md bg-gradient-to-br from-[#176B5F] to-[#2a9d8f]" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <Line className="w-4/5 bg-slate-300" />
          <Line className="w-1/2" />
        </div>
      </div>
      <div className="mt-3 h-10">
        <AnimatePresence mode="wait" initial={false}>
          {step < 2 ? (
            <motion.div
              key="pay"
              {...pop}
              className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#176B5F] text-xs font-semibold text-white"
            >
              {step === 1 ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Processing…
                </>
              ) : (
                "Pay with Razorpay"
              )}
            </motion.div>
          ) : (
            <motion.div
              key="done"
              {...pop}
              className="flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-50 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200"
            >
              <CheckCircle2 className="h-4 w-4" /> Payment successful
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <p className="mt-2 flex items-center justify-center gap-1 text-[10px] text-slate-400">
        <Lock className="h-3 w-3" /> Razorpay test mode
      </p>
    </MockFrame>
  );
}

/* ------------------------------------------------------------ video player */

const LECTURES = ["Introduction", "Building the layout", "Wiring the API"];

export function VideoProgressMock({ className, active = true }) {
  const [ref, step] = useLoopStep(4, { interval: 1200, active });
  const progress = [12, 45, 78, 100][step];

  return (
    <MockFrame innerRef={ref} className={className}>
      <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-slate-800 to-slate-900">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur">
          <Play className="ml-0.5 h-4 w-4 fill-white text-white" />
        </div>
        <div className="absolute inset-x-3 bottom-3">
          <ProgressBar value={progress} className="h-1 bg-white/20" barClassName="bg-white" />
        </div>
      </div>
      <ul className="mt-3 space-y-1.5">
        {LECTURES.map((lecture, i) => {
          const done = i < step;
          return (
            <li key={lecture} className="flex items-center gap-2 text-xs">
              <motion.span
                initial={false}
                animate={{ scale: done ? [1, 1.2, 1] : 1 }}
                className={cn(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                  done ? "bg-emerald-500 text-white" : "border border-slate-300"
                )}
              >
                {done ? <CheckCircle2 className="h-4 w-4" /> : null}
              </motion.span>
              <span className={cn("truncate", done ? "text-slate-400 line-through" : "text-slate-700")}>{lecture}</span>
            </li>
          );
        })}
      </ul>
    </MockFrame>
  );
}

/* ------------------------------------------------------------ certificate */

export function CertificateMock({ className, active = true }) {
  const [ref, step] = useLoopStep(5, { interval: 1000, active });
  const progress = [0, 40, 75, 100, 100][step];
  const issued = step === 4;

  return (
    <MockFrame innerRef={ref} className={className} title="Course progress" icon={Award}>
      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
        <span>Completed lectures</span>
        <span className="tabular-nums text-[#176B5F]">{progress}%</span>
      </div>
      <ProgressBar value={progress} className="mt-1.5" barClassName={progress === 100 ? "bg-emerald-500" : undefined} />
      <div className="mt-3 h-[76px]">
        <AnimatePresence mode="wait" initial={false}>
          {issued ? (
            <motion.div
              key="cert"
              {...pop}
              className="flex h-full items-center gap-3 rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-3"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                <BadgeCheck className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800">Certificate issued</p>
                <p className="mt-0.5 flex items-center gap-1 text-[10px] font-medium text-[#176B5F]">
                  <Download className="h-3 w-3" /> Download PDF
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div key="wait" {...pop} className="flex h-full flex-col justify-center gap-2 rounded-xl border border-dashed border-slate-200 p-3">
              <Line className="w-2/3" />
              <Line className="w-1/3" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MockFrame>
  );
}

/* ---------------------------------------------------------------- reviews */

export function ReviewsMock({ className }) {
  const [ref, step] = useLoopStep(6, { interval: 700, hold: 4 });
  const filled = Math.min(step, 4);
  const posted = step === 5;

  return (
    <MockFrame innerRef={ref} className={className} title="Rate this course" icon={Star}>
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.span key={i} initial={false} animate={{ scale: i === filled - 1 && !posted ? [1, 1.3, 1] : 1 }}>
            <Star
              className={cn(
                "h-5 w-5 transition-colors",
                i < filled ? "fill-amber-400 text-amber-400" : "text-slate-300"
              )}
            />
          </motion.span>
        ))}
      </div>
      <div className="mt-3 space-y-1.5 rounded-lg bg-slate-50 p-2.5">
        <Line className="w-full" />
        <Line className="w-4/5" />
        <Line className="w-2/5" />
      </div>
      <div className="mt-2 h-6">
        <AnimatePresence initial={false}>
          {posted ? (
            <motion.p {...pop} className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" /> Review posted
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    </MockFrame>
  );
}

/* ------------------------------------------------------ instructor dashboard */

const BARS = [45, 70, 55, 85, 65, 95];

export function InstructorDashboardMock({ className }) {
  const [ref, step] = useLoopStep(3, { interval: 1300, hold: 2 });

  return (
    <MockFrame innerRef={ref} className={className} title="Instructor dashboard" icon={BookOpen}>
      <div className="flex h-20 items-end gap-1.5 rounded-lg bg-slate-50 px-3 pb-2 pt-3">
        {BARS.map((h, i) => (
          <motion.div
            key={i}
            className="flex-1 rounded-t bg-[#176B5F]"
            style={{ opacity: 0.45 + i * 0.1 }}
            initial={false}
            animate={{ height: step === 0 ? "12%" : `${h}%` }}
            transition={{ duration: 0.6, delay: i * 0.05, ease: "easeOut" }}
          />
        ))}
      </div>
      <div className="mt-3 space-y-2">
        {[0, 1].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="h-6 w-6 shrink-0 rounded-full bg-gradient-to-br from-slate-200 to-slate-300" />
            <Line className={i === 0 ? "w-1/2" : "w-1/3"} />
          </div>
        ))}
      </div>
      <div className="mt-2 h-6">
        <AnimatePresence initial={false}>
          {step === 2 ? (
            <motion.p {...pop} className="flex items-center gap-1 text-xs font-semibold text-[#176B5F]">
              <CheckCircle2 className="h-3.5 w-3.5" /> New student enrolled
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    </MockFrame>
  );
}

/* ----------------------------------------------------------------- browse */

export function BrowseMock({ className, active = true }) {
  const [ref, step] = useLoopStep(4, { interval: 1000, active });
  const query = ["", "web", "web dev", "web dev"][step];

  return (
    <MockFrame innerRef={ref} className={className}>
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs">
        <Search className="h-3.5 w-3.5 text-slate-400" />
        <span className={query ? "text-slate-700" : "text-slate-400"}>{query || "Search courses"}</span>
        <span className="h-3.5 w-px animate-pulse bg-slate-400 motion-reduce:animate-none" />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            initial={false}
            animate={{ opacity: step >= 2 ? 1 : 0.35, y: step >= 2 ? 0 : 4 }}
            transition={{ duration: 0.35, delay: i * 0.08 }}
            className={cn(
              "rounded-lg border p-1.5 transition-shadow",
              step === 3 && i === 1 ? "border-[#176B5F] shadow-md ring-2 ring-[#176B5F]/20" : "border-slate-200"
            )}
          >
            <div
              className={cn(
                "aspect-video rounded-md",
                ["bg-gradient-to-br from-teal-200 to-teal-400", "bg-gradient-to-br from-[#176B5F] to-teal-500", "bg-gradient-to-br from-slate-200 to-slate-300"][i]
              )}
            />
            <Line className="mt-1.5 w-full bg-slate-300" />
            <Line className="mt-1 w-2/3" />
          </motion.div>
        ))}
      </div>
      <div className="mt-3 h-8">
        <AnimatePresence initial={false}>
          {step === 3 ? (
            <motion.div {...pop} className="flex h-8 items-center justify-center rounded-lg bg-[#176B5F] text-xs font-semibold text-white">
              View course details
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </MockFrame>
  );
}

/* ------------------------------------------------------------------- hero */

const HERO_LECTURES = ["Project setup", "Components & props", "State and effects", "Talking to an API"];

export function HeroDashboardMock() {
  const reduced = useReducedMotion();

  return (
    <MockFrame className="p-5">
      <div className="relative flex aspect-[16/8] items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#176B5F] via-[#1d7f71] to-[#2a9d8f]">
        <div className="absolute -right-6 -top-10 h-32 w-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-12 left-6 h-28 w-28 rounded-full bg-white/10" />
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg">
          <Play className="ml-0.5 h-5 w-5 fill-[#176B5F] text-[#176B5F]" />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="min-w-0 space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Now learning</p>
          <Line className="h-2.5 w-40 max-w-full bg-slate-300" />
        </div>
        <span className="shrink-0 rounded-full bg-[#176B5F]/10 px-2.5 py-1 text-[11px] font-semibold text-[#176B5F]">
          Lecture 3 of 4
        </span>
      </div>
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <motion.div
          className="h-full rounded-full bg-[#176B5F]"
          initial={{ width: reduced ? "72%" : "8%" }}
          animate={{ width: "72%" }}
          transition={{ duration: 1.6, delay: 0.4, ease: "easeOut" }}
        />
      </div>
      <ul className="mt-4 space-y-2">
        {HERO_LECTURES.map((lecture, i) => (
          <li key={lecture} className="flex items-center gap-2.5 text-xs">
            <span
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                i < 2 ? "bg-emerald-500 text-white" : i === 2 ? "bg-[#176B5F] text-white" : "border border-slate-300"
              )}
            >
              {i < 2 ? <CheckCircle2 className="h-5 w-5" /> : i === 2 ? <Play className="h-2.5 w-2.5 fill-white" /> : null}
            </span>
            <span className={cn("truncate", i === 2 ? "font-semibold text-slate-800" : "text-slate-500")}>{lecture}</span>
          </li>
        ))}
      </ul>
    </MockFrame>
  );
}
