import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchProfileService } from "@/services";
import {
  BookMarked,
  BookOpen,
  Calendar,
  LogOut,
  Mail,
  Shield,
  Trophy,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function ProfilePage({ auth, resetCredentials, purchasedCoursesCount = 0 }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usedFallback, setUsedFallback] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await fetchProfileService();
        if (data?.success) {
          setProfile(data.data);
        } else {
          setUsedFallback(true);
        }
      } catch {
        setUsedFallback(true);
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
  const joinedDate = profile?.joinedDate
    ? new Date(profile.joinedDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  const stats = {
    purchased: profile?.coursesPurchased ?? purchasedCoursesCount ?? 0,
    created: profile?.coursesCreated ?? (user?.role === "instructor" ? 0 : null),
    completed: usedFallback ? 0 : Math.max(0, (profile?.coursesPurchased ?? purchasedCoursesCount) - 0),
  };

  const initials = (user?.userName || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (loading) {
    return (
      <div className="lms-page-shell mx-auto max-w-4xl px-4 py-10 lg:px-8">
        <Skeleton className="mb-8 h-40 w-full rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="lms-page-shell">
      <div className="border-b border-border/50 bg-gradient-to-r from-[#4F46E5]/10 via-transparent to-[#7C3AED]/10">
        <div className="mx-auto max-w-4xl px-4 py-10 lg:px-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] text-2xl font-bold text-white shadow-xl shadow-indigo-500/30">
              {initials}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                {user?.userName}
              </h1>
              <p className="mt-1 flex items-center justify-center gap-2 text-muted-foreground sm:justify-start">
                <Mail className="h-4 w-4" />
                {user?.userEmail}
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <span className="inline-flex items-center gap-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium capitalize text-indigo-300">
                  <Shield className="h-3 w-3" />
                  {user?.role}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  Joined {joinedDate}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
        <h2 className="mb-4 text-lg font-semibold">Statistics</h2>
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="lms-stat-card">
            <div className="flex items-center gap-3">
              <BookMarked className="h-8 w-8 text-indigo-400" />
              <div>
                <p className="text-2xl font-bold">{stats.purchased}</p>
                <p className="text-sm text-muted-foreground">Courses Purchased</p>
              </div>
            </div>
          </div>
          {user?.role === "instructor" ? (
            <div className="lms-stat-card">
              <div className="flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-violet-400" />
                <div>
                  <p className="text-2xl font-bold">{stats.created ?? 0}</p>
                  <p className="text-sm text-muted-foreground">Courses Created</p>
                </div>
              </div>
            </div>
          ) : null}
          <div className="lms-stat-card">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-cyan-400" />
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-sm text-muted-foreground">Completed Courses</p>
              </div>
            </div>
          </div>
        </div>

        <Card className="border-border/60 bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4 text-indigo-400" />
              Account Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground">Name</p>
              <p className="font-medium">{user?.userName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium">{user?.userEmail}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Role</p>
              <p className="font-medium capitalize">{user?.role}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Member since</p>
              <p className="font-medium">{joinedDate}</p>
            </div>
          </CardContent>
        </Card>

        {usedFallback ? (
          <p className="mt-4 text-xs text-muted-foreground">
            Some statistics use local session data when profile API is unavailable.
          </p>
        ) : null}

        <Button
          variant="destructive"
          className="mt-8 gap-2"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}

export default ProfilePage;
