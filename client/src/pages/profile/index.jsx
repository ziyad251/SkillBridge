import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { btnPrimary, btnSecondary, FadeIn, Kicker, PageContainer, Panel } from "@/components/student-view/ui";
import { cn } from "@/lib/utils";
import { fetchProfileService } from "@/services";
import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function ProfilePage({ auth, resetCredentials, purchasedCoursesCount = 0 }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await fetchProfileService();
        if (data?.success) setProfile(data.data);
      } catch {
        // fall back to the session user below
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  function handleLogout() {
    resetCredentials();
    sessionStorage.clear();
    navigate("/");
  }

  const user = profile?.user || auth?.user;
  const isInstructor = user?.role === "instructor";
  const joinedDate = profile?.joinedDate
    ? new Date(profile.joinedDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const initials = (user?.userName || "U")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Real values only: enrollments come from the student-courses endpoint,
  // courses created from the profile endpoint.
  const stats = isInstructor
    ? [{ label: "Courses created", value: profile?.coursesCreated ?? null }]
    : [{ label: "Courses enrolled", value: purchasedCoursesCount }];

  const details = [
    { label: "Name", value: user?.userName },
    { label: "Email", value: user?.userEmail },
    { label: "Role", value: user?.role, className: "capitalize" },
    joinedDate ? { label: "Member since", value: joinedDate } : null,
  ].filter(Boolean);

  if (loading) {
    return (
      <div className="lms-page-shell">
        <PageContainer className="max-w-3xl pt-12">
          <Skeleton className="h-28 w-full rounded-2xl bg-neutral-100" />
          <Skeleton className="mt-4 h-48 w-full rounded-2xl bg-neutral-100" />
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="lms-page-shell pb-20">
      <PageContainer className="max-w-3xl pt-10 sm:pt-12">
        <FadeIn className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#0A0A0A] text-2xl font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0">
            <Kicker>Profile</Kicker>
            <h1 className="mt-1 truncate text-3xl font-bold tracking-tight text-[#171717]">{user?.userName}</h1>
            <p className="mt-1 truncate text-neutral-600">{user?.userEmail}</p>
          </div>
        </FadeIn>

        <FadeIn delay={0.05} className="mt-8">
          <dl className="grid grid-cols-1 divide-y divide-[#E5E5E5] rounded-2xl border border-[#E5E5E5] bg-white sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            {stats.map((stat) => (
              <div key={stat.label} className="px-6 py-5">
                <dt className="text-sm text-neutral-500">{stat.label}</dt>
                <dd className="mt-1 text-2xl font-bold tabular-nums text-[#171717]">{stat.value ?? "—"}</dd>
              </div>
            ))}
            <div className="flex items-center px-6 py-5">
              <Button
                className={cn(btnPrimary, "h-10 w-full sm:w-auto")}
                onClick={() => navigate(isInstructor ? "/instructor" : "/student-courses")}
              >
                {isInstructor ? "Go to dashboard" : "Go to my courses"}
              </Button>
            </div>
          </dl>
        </FadeIn>

        <FadeIn delay={0.1} className="mt-4">
          <Panel>
            <h2 className="border-b border-[#E5E5E5] px-6 py-4 font-semibold text-[#171717]">Account details</h2>
            <dl className="grid gap-x-6 gap-y-4 px-6 py-5 text-sm sm:grid-cols-2">
              {details.map((item) => (
                <div key={item.label} className="min-w-0">
                  <dt className="text-neutral-500">{item.label}</dt>
                  <dd className={cn("mt-0.5 truncate font-medium text-[#171717]", item.className)}>{item.value || "—"}</dd>
                </div>
              ))}
            </dl>
          </Panel>
        </FadeIn>

        <Button variant="outline" className={cn(btnSecondary, "mt-8 h-10 gap-2")} onClick={handleLogout}>
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Log out
        </Button>
      </PageContainer>
    </div>
  );
}

export default ProfilePage;
