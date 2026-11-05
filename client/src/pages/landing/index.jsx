import BrandLogo from "@/components/layout/brand-logo";
import DemoButton from "@/components/layout/demo-button";
import PublicNavbar from "@/components/layout/public-navbar";
import {
  BrowseMock,
  CertificateMock,
  CheckoutMock,
  CourseBuilderMock,
  HeroDashboardMock,
  InstructorDashboardMock,
  ReviewsMock,
  VideoProgressMock,
} from "@/components/landing/mocks";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BookOpenCheck,
  Check,
  CheckCircle2,
  CreditCard,
  Github,
  GraduationCap,
  LayoutDashboard,
  ListVideo,
  PlayCircle,
  Presentation,
  Search,
  Star,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const GITHUB_URL = "https://github.com/ziyad251/SkillBridge";

const CAPABILITIES = [
  "Razorpay checkout",
  "Video lessons",
  "Progress tracking",
  "PDF certificates",
  "Ratings & reviews",
  "Instructor dashboard",
  "Cloudinary media uploads",
  "PostgreSQL backend",
];

const STEPS = [
  {
    title: "Browse courses",
    description: "Search the catalogue, filter by category and open any course to see its curriculum.",
    icon: Search,
    Mock: BrowseMock,
  },
  {
    title: "Enroll with Razorpay",
    description: "Check out securely. The payment is verified on the server before the course unlocks.",
    icon: CreditCard,
    Mock: CheckoutMock,
  },
  {
    title: "Learn with tracked progress",
    description: "Watch lectures in the built-in player. Every finished lecture is saved to your progress.",
    icon: ListVideo,
    Mock: VideoProgressMock,
  },
  {
    title: "Get your certificate",
    description: "Complete 100% of the course and download your PDF certificate.",
    icon: Award,
    Mock: CertificateMock,
  },
];

const FEATURES = [
  {
    icon: Presentation,
    title: "Course builder",
    description: "Instructors add course details, build a lecture-by-lecture curriculum and publish it in one step.",
    Mock: CourseBuilderMock,
  },
  {
    icon: CreditCard,
    title: "Secure checkout",
    description: "Razorpay payments with server-side signature verification before access is granted.",
    Mock: CheckoutMock,
  },
  {
    icon: PlayCircle,
    title: "Video player with progress",
    description: "Stream lectures and pick up where you left off; completed lectures are tracked for you.",
    Mock: VideoProgressMock,
  },
  {
    icon: Award,
    title: "Automatic certificate",
    description: "Hit 100% on a course and a PDF certificate is generated, ready to download.",
    Mock: CertificateMock,
  },
  {
    icon: Star,
    title: "Ratings & reviews",
    description: "Enrolled students can rate a course and leave a written review for others.",
    Mock: ReviewsMock,
  },
  {
    icon: LayoutDashboard,
    title: "Instructor dashboard",
    description: "See your courses, the students enrolled in them and your earnings in one place.",
    Mock: InstructorDashboardMock,
  },
];

const ROLES = [
  {
    title: "For students",
    icon: GraduationCap,
    intro: "Everything you need to go from browsing to certified.",
    points: [
      "Browse and filter the course catalogue",
      "Preview course details and curriculum before buying",
      "Pay securely with Razorpay checkout",
      "Stream video lectures and track your progress",
      "Download a PDF certificate when you finish",
      "Rate and review the courses you've taken",
    ],
  },
  {
    title: "For instructors",
    icon: Presentation,
    intro: "Tools to publish a course and see how it's doing.",
    points: [
      "Create courses with a step-by-step builder",
      "Upload lecture videos and images to Cloudinary",
      "Mark lectures as free previews",
      "Edit your courses after publishing",
      "See students enrolled in each course",
      "Track earnings from your instructor dashboard",
    ],
  },
];

const FAQS = [
  {
    q: "Is it free to try?",
    a: "Yes. Click “Try demo” and you're signed in to a shared demo student account (ziyad@gmail.com) in one click, no sign-up needed. You can also register your own free account.",
  },
  {
    q: "How do payments work?",
    a: "Checkout uses Razorpay in test mode, so no real money is ever charged. Use Razorpay's test payment details on the checkout screen. The server verifies the payment signature before unlocking the course.",
  },
  {
    q: "Do I get a certificate?",
    a: "Yes. Once you've completed every lecture in a course, a PDF certificate becomes available to download from the course progress page.",
  },
  {
    q: "Can I teach a course?",
    a: "SkillBridge has a separate instructor role with its own dashboard for creating courses, uploading lectures and seeing enrolled students. Public sign-up creates student accounts; instructor accounts are set up separately.",
  },
  {
    q: "What is it built with?",
    a: "React, Vite and Tailwind CSS on the frontend; a Node.js / Express API; a PostgreSQL database; Cloudinary for media and Razorpay for payments. The backend runs in Docker on AWS.",
  },
  {
    q: "Is the demo account shared?",
    a: "Yes. Everyone who clicks “Try demo” uses the same account, so you may see enrollments, progress or reviews left by earlier visitors. Register your own account if you want a clean slate.",
  },
];

/* --------------------------------------------------------------- helpers */

function Reveal({ children, className, delay = 0, as = "div" }) {
  const Component = motion[as];
  return (
    <Component
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay, ease: "easeOut" }}
    >
      {children}
    </Component>
  );
}

function SectionHeading({ kicker, title, description, id }) {
  return (
    <Reveal className="mx-auto max-w-2xl text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#0A0A0A]">{kicker}</p>
      <h2 id={id} className="mt-3 text-3xl font-bold tracking-tight text-[#171717] sm:text-4xl">
        {title}
      </h2>
      {description ? <p className="mt-4 text-base text-slate-600 sm:text-lg">{description}</p> : null}
    </Reveal>
  );
}

function FloatingBadge({ children, className, delay = 0, floatOffset = 6 }) {
  return (
    <motion.div
      aria-hidden="true"
      className={cn(
        "absolute z-10 flex items-center gap-2 whitespace-nowrap rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-[0_10px_30px_-10px_rgba(15,23,42,0.25)] sm:text-sm",
        className
      )}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1, y: [0, -floatOffset, 0] }}
      transition={{
        opacity: { duration: 0.4, delay },
        scale: { duration: 0.4, delay },
        y: { duration: 4, delay: delay + 0.4, repeat: Infinity, ease: "easeInOut" },
      }}
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------- sections */

function Hero() {
  const navigate = useNavigate();

  return (
    <section aria-labelledby="hero-title" className="relative">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_80%_20%,rgba(10,10,10,0.10),transparent),radial-gradient(ellipse_50%_40%_at_10%_0%,rgba(10,10,10,0.06),transparent)]"
      />
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-12 sm:pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:px-8 lg:pb-28 lg:pt-24">
        <div className="text-center lg:text-left">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 rounded-full border border-[#0A0A0A]/20 bg-[#0A0A0A]/5 px-3.5 py-1.5 text-xs font-semibold text-[#0A0A0A] sm:text-sm"
          >
            <BookOpenCheck className="h-4 w-4" aria-hidden="true" />
            A full-stack learning platform
          </motion.p>

          <motion.h1
            id="hero-title"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight text-[#171717] sm:text-5xl lg:text-[2.75rem] xl:text-[3.4rem]"
          >
            Learn job-ready skills.
            <br />
            <span className="text-[#0A0A0A]">Track every step.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="mx-auto mt-5 max-w-xl text-base text-slate-600 sm:text-lg lg:mx-0"
          >
            Browse courses, enroll with Razorpay, watch lessons with saved progress and earn a PDF
            certificate when you finish.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18 }}
            className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center lg:justify-start"
          >
            <Button
              size="lg"
              className="lms-btn-primary h-12 rounded-full px-7 text-base"
              onClick={() => navigate("/courses")}
            >
              Explore courses
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Button>
            <DemoButton
              variant="outline"
              size="lg"
              className="h-12 rounded-full border-slate-300 px-7 text-base text-[#171717]"
            >
              Try the demo (no sign-up)
            </DemoButton>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-slate-500 lg:justify-start"
          >
            {["One-click demo account", "Razorpay test mode", "Free to explore"].map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-[#0A0A0A]" aria-hidden="true" />
                {item}
              </li>
            ))}
          </motion.ul>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative mx-auto w-full max-w-[26rem] px-2 sm:px-8 lg:max-w-[30rem]"
        >
          <div
            aria-hidden="true"
            className="absolute inset-6 -z-10 rounded-[2rem] bg-[#0A0A0A]/10 blur-2xl"
          />
          <HeroDashboardMock />

          <FloatingBadge className="-left-1 top-6 sm:-left-4" delay={0.7}>
            <CheckCircle2 className="h-4 w-4 text-neutral-800" /> Lesson completed
          </FloatingBadge>
          <FloatingBadge className="-right-1 top-[46%] sm:-right-4" delay={1.0} floatOffset={8}>
            <TrendingUp className="h-4 w-4 text-[#0A0A0A]" /> Progress 72%
          </FloatingBadge>
          <FloatingBadge className="-bottom-5 left-4 sm:left-10" delay={1.3}>
            <BadgeCheck className="h-4 w-4 text-neutral-800" /> Certificate ready
          </FloatingBadge>
        </motion.div>
      </div>
    </section>
  );
}

function CapabilityMarquee() {
  const renderList = (hidden) => (
    <ul
      aria-hidden={hidden || undefined}
      className={cn("flex shrink-0 items-center", hidden && "motion-reduce:hidden")}
    >
      {CAPABILITIES.map((item) => (
        <li key={item} className="flex items-center whitespace-nowrap px-5 text-sm font-semibold text-slate-600 sm:text-base">
          <span className="mr-5 h-1.5 w-1.5 rounded-full bg-[#0A0A0A]/50" aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  );

  return (
    <section aria-label="Platform capabilities" className="border-y border-slate-200/80 bg-slate-50/70 py-5">
      <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] motion-reduce:[mask-image:none]">
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused] motion-reduce:w-full motion-reduce:animate-none motion-reduce:flex-wrap motion-reduce:justify-center">
          {renderList(false)}
          {renderList(true)}
        </div>
      </div>
    </section>
  );
}

const STEP_DURATION = 5000;

function HowItWorks() {
  const [active, setActive] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [hovering, setHovering] = useState(false);
  const reduced = useReducedMotion();
  const cycling = autoplay && !hovering && !reduced;

  useEffect(() => {
    if (!cycling) return undefined;
    const id = setTimeout(() => setActive((a) => (a + 1) % STEPS.length), STEP_DURATION);
    return () => clearTimeout(id);
  }, [active, cycling]);

  function selectStep(index) {
    setActive(index);
    setAutoplay(false);
  }

  const { Mock } = STEPS[active];

  return (
    <section id="how-it-works" aria-labelledby="how-title" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <SectionHeading
          id="how-title"
          kicker="How it works"
          title="From first click to certificate"
          description="Four steps, all live in the app today. Pick a step to see it in action."
        />

        <div
          className="mt-14 grid items-center gap-10 lg:grid-cols-2 lg:gap-16"
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          <ol className="space-y-3">
            {STEPS.map((step, index) => {
              const isActive = index === active;
              const Icon = step.icon;
              return (
                <li key={step.title}>
                  <button
                    type="button"
                    onClick={() => selectStep(index)}
                    aria-current={isActive ? "step" : undefined}
                    aria-controls="how-preview"
                    className={cn(
                      "group relative flex w-full gap-4 overflow-hidden rounded-2xl border p-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] focus-visible:ring-offset-2 sm:p-5",
                      isActive
                        ? "border-[#0A0A0A]/30 bg-white shadow-[0_10px_30px_-12px_rgba(10,10,10,0.35)]"
                        : "border-transparent hover:border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-colors",
                        isActive ? "bg-[#0A0A0A] text-white" : "bg-slate-100 text-slate-500 group-hover:text-[#0A0A0A]"
                      )}
                    >
                      {index + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2 font-semibold text-[#171717]">
                        <Icon className={cn("h-4 w-4", isActive ? "text-[#0A0A0A]" : "text-slate-400")} aria-hidden="true" />
                        {step.title}
                      </span>
                      <span className={cn("mt-1 block text-sm text-slate-600", !isActive && "hidden sm:block")}>
                        {step.description}
                      </span>
                    </span>
                    {isActive && cycling ? (
                      <motion.span
                        key={`bar-${active}`}
                        aria-hidden="true"
                        className="absolute bottom-0 left-0 h-0.5 bg-[#0A0A0A]"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: STEP_DURATION / 1000, ease: "linear" }}
                      />
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ol>

          <div
            id="how-preview"
            aria-live="polite"
            className="relative flex min-h-[340px] items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-[#0A0A0A]/10 via-[#0A0A0A]/5 to-slate-50 p-6 sm:min-h-[380px] sm:p-10"
          >
            <span className="sr-only">
              Step {active + 1}: {STEPS[active].title}
            </span>
            <div aria-hidden="true" className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#0A0A0A]/10" />
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.98 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="relative w-full max-w-sm"
              >
                <Mock />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" aria-labelledby="features-title" className="scroll-mt-20 bg-slate-50/70 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <SectionHeading
          id="features-title"
          kicker="Features"
          title="Built like a real product"
          description="Each card below is a small live preview of something you can actually do in SkillBridge."
        />

        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description, Mock }, index) => (
            <Reveal as="li" key={title} delay={(index % 3) * 0.08} className="flex">
              <article className="flex w-full flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-shadow duration-300 hover:shadow-[0_16px_40px_-16px_rgba(15,23,42,0.2)]">
                <div className="flex flex-1 items-center justify-center bg-gradient-to-b from-[#0A0A0A]/[0.06] to-transparent px-6 pb-4 pt-6">
                  <Mock className="max-w-[18rem]" />
                </div>
                <div className="p-6 pt-4">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0A0A0A]/10 text-[#0A0A0A]">
                      <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                    </span>
                    <h3 className="text-lg font-semibold text-[#171717]">{title}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{description}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

function RoleComparison() {
  return (
    <section aria-labelledby="roles-title" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <SectionHeading
          id="roles-title"
          kicker="Two sides, one platform"
          title="Made for learners and teachers"
        />
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {ROLES.map(({ title, icon: Icon, intro, points }, index) => (
            <Reveal
              key={title}
              delay={index * 0.1}
              className={cn(
                "rounded-3xl border p-7 sm:p-9",
                index === 0
                  ? "border-[#0A0A0A]/20 bg-[#0A0A0A] text-white"
                  : "border-slate-200 bg-white text-[#171717]"
              )}
            >
              <span
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-xl",
                  index === 0 ? "bg-white/15 text-white" : "bg-[#0A0A0A]/10 text-[#0A0A0A]"
                )}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className={cn("mt-5 text-2xl font-bold", index === 0 ? "text-white" : "text-[#171717]")}>{title}</h3>
              <p className={cn("mt-2 text-sm", index === 0 ? "text-white/80" : "text-slate-600")}>{intro}</p>
              <ul className="mt-6 space-y-3">
                {points.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-sm sm:text-base">
                    <span
                      className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                        index === 0 ? "bg-white text-[#0A0A0A]" : "bg-[#0A0A0A] text-white"
                      )}
                    >
                      <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                    </span>
                    <span className={index === 0 ? "text-white/95" : "text-slate-700"}>{point}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="scroll-mt-20 bg-slate-50/70 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 lg:px-8">
        <SectionHeading id="faq-title" kicker="FAQ" title="Questions, answered honestly" />
        <Reveal className="mt-12 rounded-3xl border border-slate-200/80 bg-white px-5 shadow-sm sm:px-8">
          <Accordion type="single" collapsible defaultValue="item-0">
            {FAQS.map((faq, index) => (
              <AccordionItem
                key={faq.q}
                value={`item-${index}`}
                className={index === FAQS.length - 1 ? "border-b-0" : "border-slate-200"}
              >
                <AccordionTrigger className="text-base text-[#171717]">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-[15px] leading-relaxed text-slate-600">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}

function FinalCta() {
  const navigate = useNavigate();

  return (
    <section aria-labelledby="cta-title" className="px-4 py-20 sm:py-24 lg:px-8">
      <Reveal className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-[#0A0A0A] px-6 py-14 text-center sm:px-12 sm:py-16">
        <div aria-hidden="true" className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10" />
        <div aria-hidden="true" className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-white/[0.07]" />
        <h2 id="cta-title" className="relative text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Start learning today
        </h2>
        <p className="relative mx-auto mt-4 max-w-xl text-base text-white/85 sm:text-lg">
          Jump straight in with the demo account, or create your own account in under a minute.
        </p>
        <div className="relative mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <DemoButton
            variant="secondary"
            size="lg"
            className="h-12 rounded-full bg-white px-7 text-base font-semibold text-[#0A0A0A] shadow-lg hover:bg-white/90 focus-visible:ring-white focus-visible:ring-offset-[#0A0A0A]"
          >
            Try the demo
          </DemoButton>
          <Button
            variant="ghost"
            size="lg"
            className="h-12 rounded-full border border-white/40 px-7 text-base text-white hover:bg-white/10 hover:text-white focus-visible:ring-white focus-visible:ring-offset-[#0A0A0A]"
            onClick={() => navigate("/auth?tab=signup")}
          >
            Create an account
          </Button>
        </div>
      </Reveal>
    </section>
  );
}

function Footer() {
  const links = [
    { label: "How it works", to: { pathname: "/", hash: "#how-it-works" } },
    { label: "Features", to: { pathname: "/", hash: "#features" } },
    { label: "FAQ", to: { pathname: "/", hash: "#faq" } },
    { label: "Courses", to: { pathname: "/courses" } },
    { label: "Log in", to: { pathname: "/auth" } },
  ];

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 md:flex-row md:items-start md:justify-between lg:px-8">
        <div className="max-w-xs">
          <BrandLogo to="/" />
          <p className="mt-3 text-sm text-slate-500">
            A full-stack learning management system, built as a portfolio project.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="grid grid-cols-2 gap-x-10 gap-y-3 text-sm sm:flex sm:flex-wrap sm:gap-x-8">
            {links.map((link) => (
              <li key={link.label}>
                <Link to={link.to} className="rounded text-slate-600 transition-colors hover:text-[#0A0A0A]">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-slate-100">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-slate-500 sm:flex-row lg:px-8">
          <p>
            Built by <span className="font-semibold text-slate-700">Mahammad Ziyad</span>
          </p>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded font-medium text-slate-600 transition-colors hover:text-[#0A0A0A]"
          >
            <Github className="h-4 w-4" aria-hidden="true" />
            ziyad251/SkillBridge
            <span className="sr-only">(opens GitHub in a new tab)</span>
          </a>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ page */

function LandingPage() {
  const location = useLocation();

  // Scroll to #section when arriving via a navbar/footer link (works from other routes too).
  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    const frame = requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ block: "start" });
    });
    return () => cancelAnimationFrame(frame);
  }, [location.hash, location.key]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen overflow-x-clip bg-white text-[#171717]">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:shadow-lg"
        >
          Skip to content
        </a>
        <PublicNavbar />
        <main id="main">
          <Hero />
          <CapabilityMarquee />
          <HowItWorks />
          <Features />
          <RoleComparison />
          <Faq />
          <FinalCta />
        </main>
        <Footer />
      </div>
    </MotionConfig>
  );
}

export default LandingPage;
