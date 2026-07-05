import PublicNavbar from "@/components/layout/public-navbar";
import { Button } from "@/components/ui/button";
import {
  Award,
  BarChart3,
  BookOpen,
  Cloud,
  CreditCard,
  GraduationCap,
  PlayCircle,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: BookOpen,
    title: "Course Marketplace",
    description: "Browse curated courses across categories and skill levels.",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description: "Purchase courses safely with integrated Razorpay checkout.",
  },
  {
    icon: Cloud,
    title: "Cloudinary Video Hosting",
    description: "Stream lecture videos with reliable cloud media delivery.",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description: "Track completed lectures and resume learning anytime.",
  },
  {
    icon: Users,
    title: "Instructor Dashboard",
    description: "Create courses, upload media, and manage enrolled students.",
  },
  {
    icon: Award,
    title: "Certificates",
    description: "Celebrate milestones as you complete each course.",
  },
];

const steps = [
  { step: "1", title: "Browse Courses", description: "Explore the marketplace and find your next skill." },
  { step: "2", title: "Purchase Course", description: "Checkout securely and unlock instant access." },
  { step: "3", title: "Learn & Track Progress", description: "Watch lessons and mark progress as you go." },
  { step: "4", title: "Earn Certificate", description: "Complete the curriculum and showcase your achievement." },
];

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="lms-page-shell lms-gradient-hero">
      <PublicNavbar />

      <section className="relative mx-auto max-w-7xl overflow-hidden px-4 py-24 text-center lg:px-8 lg:py-32">
        <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-indigo-500/20 blur-3xl" />

        <p className="relative mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-300">
          <Sparkles className="h-4 w-4" />
          Professional learning platform
        </p>

        <h1 className="relative text-4xl font-extrabold tracking-tight md:text-6xl lg:text-7xl">
          <span className="lms-gradient-text">LMS Platform</span>
        </h1>
        <p className="relative mx-auto mt-5 max-w-2xl text-lg text-muted-foreground md:text-xl">
          Learn. Teach. Grow.
        </p>

        <div className="relative mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button
            size="lg"
            className="lms-btn-primary h-12 px-8"
            onClick={() => navigate("/auth?tab=signup")}
          >
            Get Started
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-12 border-border/60 bg-white/5 px-8 backdrop-blur transition-all hover:border-indigo-500/40 hover:bg-white/10"
            onClick={() => navigate("/auth")}
          >
            Login
          </Button>
          <Button
            size="lg"
            variant="ghost"
            className="h-12 text-muted-foreground hover:text-foreground"
            onClick={() => navigate("/auth?tab=signup")}
          >
            Register
          </Button>
        </div>
      </section>

      <section className="border-y border-border/50 py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Everything you need to learn and teach
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              From course discovery to instructor analytics — built for students and educators.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((item) => (
              <div key={item.title} className="lms-glass-card p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-[#4F46E5]/30 to-[#7C3AED]/30">
                  <item.icon className="h-5 w-5 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <h2 className="text-center text-3xl font-bold tracking-tight">How It Works</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
            Four simple steps from browsing to certification
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((item) => (
              <div
                key={item.step}
                className="lms-glass-card p-6 text-center"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] text-sm font-bold text-white shadow-lg shadow-indigo-500/30">
                  {item.step}
                </span>
                <h3 className="mt-4 font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-indigo-500/20 py-16">
        <div className="absolute inset-0 bg-gradient-to-r from-[#4F46E5]/20 via-[#7C3AED]/15 to-[#06B6D4]/10" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 md:flex-row lg:px-8">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">Start building your skills today</h2>
            <p className="mt-2 text-muted-foreground">
              Join students and instructors on one unified platform.
            </p>
          </div>
          <Button
            size="lg"
            className="lms-btn-primary gap-2"
            onClick={() => navigate("/courses")}
          >
            <PlayCircle className="h-4 w-4" />
            Explore Courses
          </Button>
        </div>
      </section>

      <footer className="border-t border-border/50 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground md:flex-row lg:px-8">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-indigo-400" />
            <span>LMS Platform © {new Date().getFullYear()}</span>
          </div>
          <p className="flex items-center gap-2 text-center md:text-right">
            <Shield className="h-4 w-4 shrink-0" />
            Secure payments · Cloudinary media · Role-based access
          </p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
