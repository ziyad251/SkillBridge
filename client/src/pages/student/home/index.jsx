import { courseCategories } from "@/config";
import banner from "../../../../public/banner-img.png";
import CourseCard from "@/components/ui/course-card";
import EmptyState from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Play, Sparkles, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import {
  checkCoursePurchaseInfoService,
  fetchStudentViewCourseListService,
} from "@/services";
import { useNavigate } from "react-router-dom";

function StudentHomePage({
  studentViewCoursesList,
  setStudentViewCoursesList,
  auth,
  studentBoughtCoursesList,
}) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  function handleNavigateToCoursesPage(getCurrentId) {
    sessionStorage.removeItem("filters");
    const currentFilter = {
      category: [getCurrentId],
    };

    sessionStorage.setItem("filters", JSON.stringify(currentFilter));

    navigate("/courses");
  }

  async function fetchAllStudentViewCourses() {
    setLoading(true);
    const response = await fetchStudentViewCourseListService();
    if (response?.success) setStudentViewCoursesList(response?.data);
    setLoading(false);
  }

  async function handleCourseNavigate(getCurrentCourseId) {
    const response = await checkCoursePurchaseInfoService(
      getCurrentCourseId,
      auth?.user?._id
    );

    if (response?.success) {
      if (response?.data) {
        navigate(`/course-progress/${getCurrentCourseId}`);
      } else {
        navigate(`/course/details/${getCurrentCourseId}`);
      }
    }
  }

  useEffect(() => {
    fetchAllStudentViewCourses();
  }, []);

  const purchasedCount = studentBoughtCoursesList?.length || 0;

  return (
    <div className="lms-page-shell">
      <section className="border-b border-border/50 bg-gradient-to-r from-[#4F46E5]/15 via-[#7C3AED]/10 to-transparent">
        <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
          <p className="mb-2 flex items-center gap-2 text-sm text-indigo-400">
            <Sparkles className="h-4 w-4" />
            Welcome back, {auth?.user?.userName || "Learner"}
          </p>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Your learning dashboard
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Pick up where you left off or discover something new.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="lms-stat-card">
              <p className="text-2xl font-bold text-indigo-400">{purchasedCount}</p>
              <p className="text-sm text-muted-foreground">Purchased Courses</p>
            </div>
            <div className="lms-stat-card">
              <p className="text-2xl font-bold text-violet-400">
                {studentViewCoursesList?.length || 0}
              </p>
              <p className="text-sm text-muted-foreground">Available Courses</p>
            </div>
            <div className="lms-stat-card">
              <p className="text-2xl font-bold text-cyan-400">
                <TrendingUp className="mb-1 inline h-5 w-5" />
                Active
              </p>
              <p className="text-sm text-muted-foreground">Learning Status</p>
            </div>
          </div>
        </div>
      </section>

      {studentBoughtCoursesList?.length > 0 ? (
        <section className="border-b border-border/50">
          <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
            <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold tracking-tight">
              <Play className="h-5 w-5 text-indigo-400" />
              Continue Learning
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {studentBoughtCoursesList.slice(0, 3).map((course) => (
                <div
                  key={course?.courseId}
                  onClick={() => navigate(`/course-progress/${course?.courseId}`)}
                  className="group cursor-pointer overflow-hidden rounded-xl border border-border/60 bg-card/80 shadow-sm transition-all duration-300 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/10"
                >
                  {course?.courseImage ? (
                    <img
                      src={course.courseImage}
                      alt=""
                      className="aspect-video w-full object-cover transition-transform group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="aspect-video bg-muted" />
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold group-hover:text-indigo-400">
                      {course?.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {course?.instructorName}
                    </p>
                    <Button className="mt-3 lms-btn-primary" size="sm">
                      Resume
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <div className="flex flex-col items-center gap-8 lg:flex-row">
          <div className="lg:w-1/2">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              Learning that gets you ahead
            </h2>
            <p className="mt-4 text-muted-foreground md:text-lg">
              Skills for your present and your future. Explore categories and featured courses.
            </p>
          </div>
          <div className="w-full lg:w-1/2">
            <img
              src={banner}
              width={600}
              height={400}
              alt="Learning"
              className="w-full rounded-2xl border border-border/50 object-cover shadow-xl shadow-indigo-500/10"
            />
          </div>
        </div>
      </section>

      <section className="border-y border-border/50 bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
          <h2 className="mb-6 text-2xl font-bold tracking-tight">Course Categories</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {courseCategories.map((categoryItem) => (
              <Button
                className="justify-start border-border/60 bg-card/50 transition-all hover:border-indigo-500/40 hover:bg-indigo-500/10"
                variant="outline"
                key={categoryItem.id}
                onClick={() => handleNavigateToCoursesPage(categoryItem.id)}
              >
                {categoryItem.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <h2 className="mb-6 text-2xl font-bold tracking-tight">Featured Courses</h2>
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] rounded-xl" />
            ))}
          </div>
        ) : studentViewCoursesList?.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {studentViewCoursesList.map((courseItem) => (
              <CourseCard
                key={courseItem?._id}
                course={courseItem}
                onClick={() => handleCourseNavigate(courseItem?._id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={BookOpen}
            title="No courses found"
            description="Check back soon — new courses are added regularly."
            action={
              <Button className="lms-btn-primary" onClick={() => navigate("/courses")}>
                Browse all courses
              </Button>
            }
          />
        )}
      </section>
    </div>
  );
}

export default StudentHomePage;
