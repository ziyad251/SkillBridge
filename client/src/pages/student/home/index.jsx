import { courseCategories } from "@/config";
import CourseCard from "@/components/ui/course-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import PurchasedCourseCard from "@/components/student-view/purchased-course-card";
import {
  btnPrimary,
  btnSecondary,
  CourseThumbnail,
  FadeIn,
  Kicker,
  PageContainer,
  Panel,
  ProgressBar,
  SectionHeader,
} from "@/components/student-view/ui";
import { cn } from "@/lib/utils";
import { ArrowRight, BookOpen, PlayCircle } from "lucide-react";
import { useEffect, useState } from "react";
import {
  checkCoursePurchaseInfoService,
  fetchStudentViewCourseListService,
  getCurrentCourseProgressService,
} from "@/services";
import { Link, useNavigate } from "react-router-dom";

/* Reads real progress for the most recent course from the existing
   course-progress endpoint. Returns null when it can't be determined. */
function useCourseProgress(userId, courseId) {
  const [state, setState] = useState({ loading: Boolean(courseId), data: null });

  useEffect(() => {
    if (!userId || !courseId) {
      setState({ loading: false, data: null });
      return undefined;
    }
    let cancelled = false;
    setState({ loading: true, data: null });

    getCurrentCourseProgressService(userId, courseId)
      .then((response) => {
        if (cancelled) return;
        const data = response?.data;
        const curriculum = data?.courseDetails?.curriculum || [];
        if (!response?.success || !data?.isPurchased || curriculum.length === 0) {
          setState({ loading: false, data: null });
          return;
        }
        const viewed = curriculum.filter((lecture) =>
          (data?.progress || []).some((p) => p.lectureId === lecture._id && p.viewed)
        ).length;
        const total = curriculum.length;
        const percent = data?.completed ? 100 : Math.round((viewed / total) * 100);
        setState({ loading: false, data: { viewed: data?.completed ? total : viewed, total, percent } });
      })
      .catch(() => {
        if (!cancelled) setState({ loading: false, data: null });
      });

    return () => {
      cancelled = true;
    };
  }, [userId, courseId]);

  return state;
}

function ContinueLearning({ course, userId }) {
  const navigate = useNavigate();
  const { loading, data: progress } = useCourseProgress(userId, course?.courseId);
  const resume = () => navigate(`/course-progress/${course?.courseId}`);

  return (
    <Panel className="overflow-hidden">
      <div className="grid md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={resume}
          className="block border-b border-[#E5E5E5] md:border-b-0 md:border-r"
        >
          <CourseThumbnail src={course?.courseImage} title={course?.title} className="md:aspect-auto md:h-full md:min-h-[280px]" />
        </button>
        <div className="flex flex-col justify-center p-6 sm:p-8">
          <Kicker>Continue learning</Kicker>
          <h2 className="mt-3 line-clamp-2 text-2xl font-bold leading-tight tracking-tight text-[#171717] sm:text-[1.75rem]">
            {course?.title}
          </h2>
          {course?.instructorName ? (
            <p className="mt-2 text-sm text-neutral-500">by {course.instructorName}</p>
          ) : null}

          <div className="mt-6 min-h-[2.75rem]">
            {loading ? (
              <Skeleton className="h-10 w-full rounded-md bg-neutral-100" />
            ) : progress ? (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">
                    {progress.viewed} of {progress.total} lectures complete
                  </span>
                  <span className="font-semibold tabular-nums text-[#0A0A0A]">{progress.percent}%</span>
                </div>
                <ProgressBar value={progress.percent} className="mt-2" label="Course progress" />
              </>
            ) : null}
          </div>

          <div className="mt-6">
            <Button size="lg" className={cn(btnPrimary, "h-11 px-6")} onClick={resume}>
              <PlayCircle className="mr-2 h-4 w-4" aria-hidden="true" />
              Resume
            </Button>
          </div>
        </div>
      </div>
    </Panel>
  );
}

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
    try {
      const response = await fetchStudentViewCourseListService();
      if (response?.success) setStudentViewCoursesList(response?.data);
    } catch (error) {
      console.error("Failed to load courses:", error?.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
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

  const boughtCourses = studentBoughtCoursesList || [];
  const purchasedCount = boughtCourses.length;
  const latestCourse = boughtCourses[0];
  const otherCourses = boughtCourses.slice(1);
  const availableCount = studentViewCoursesList?.length || 0;
  const firstName = (auth?.user?.userName || "").trim().split(" ")[0];

  return (
    <div className="lms-page-shell pb-20">
      <PageContainer className="pt-10 sm:pt-12">
        {/* 1. Header row */}
        <FadeIn className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold tracking-tight text-[#171717] sm:text-4xl">
              Welcome back{firstName ? `, ${firstName}` : ""}
            </h1>
            <p className="mt-2 text-neutral-600">
              {purchasedCount > 0
                ? "Pick up where you left off, or find something new to learn."
                : "Find your first course and start learning."}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button className={cn(btnPrimary, "h-10")} onClick={() => navigate("/courses")}>
              Browse courses
            </Button>
            <Button variant="outline" className={cn(btnSecondary, "h-10")} onClick={() => navigate("/student-courses")}>
              My courses
            </Button>
          </div>
        </FadeIn>

        {/* 2. Continue learning */}
        <FadeIn delay={0.05} className="mt-8">
          {latestCourse ? (
            <ContinueLearning course={latestCourse} userId={auth?.user?._id} />
          ) : (
            <Panel className="flex flex-col items-center px-6 py-14 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#E5E5E5] bg-[#FAFAFA]">
                <BookOpen className="h-5 w-5 text-[#0A0A0A]" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-xl font-bold tracking-tight text-[#171717]">You haven&apos;t enrolled in a course yet</h2>
              <p className="mt-2 max-w-md text-sm text-neutral-600">
                Browse the catalogue, open a course to see its curriculum, and enroll to start tracking your progress.
              </p>
              <Button className={cn(btnPrimary, "mt-6 h-10")} onClick={() => navigate("/courses")}>
                Browse courses
              </Button>
            </Panel>
          )}
        </FadeIn>

        {/* 3. Stats strip — real values only */}
        <FadeIn delay={0.1} className="mt-4">
          <dl className="grid grid-cols-2 divide-x divide-[#E5E5E5] rounded-2xl border border-[#E5E5E5] bg-white">
            <div className="px-5 py-4 sm:px-6">
              <dt className="text-sm text-neutral-500">Courses enrolled</dt>
              <dd className="mt-1 text-2xl font-bold tabular-nums text-[#171717]">{purchasedCount}</dd>
            </div>
            <div className="px-5 py-4 sm:px-6">
              <dt className="text-sm text-neutral-500">Courses available</dt>
              <dd className="mt-1 text-2xl font-bold tabular-nums text-[#171717]">
                {loading ? <Skeleton className="mt-1 h-7 w-10 bg-neutral-100" /> : availableCount}
              </dd>
            </div>
          </dl>
        </FadeIn>

        {/* 4. Your courses row */}
        {otherCourses.length > 0 ? (
          <section aria-labelledby="your-courses" className="mt-14">
            <SectionHeader
              id="your-courses"
              title="Your courses"
              action={
                <Link to="/student-courses" className="inline-flex items-center gap-1 text-sm font-medium text-[#0A0A0A] hover:underline">
                  View all <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              }
            />
            <div className="-mx-4 overflow-x-auto px-4 pb-2 lg:-mx-8 lg:px-8">
              <ul className="flex snap-x snap-mandatory gap-4">
                {otherCourses.map((course) => (
                  <li key={course?.courseId} className="w-[260px] shrink-0 snap-start sm:w-[280px]">
                    <PurchasedCourseCard course={course} />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        {/* 5. Explore by category */}
        <section aria-labelledby="categories" className="mt-14">
          <SectionHeader id="categories" title="Explore by category" />
          <ul className="flex flex-wrap gap-2">
            {courseCategories.map((categoryItem) => (
              <li key={categoryItem.id}>
                <button
                  type="button"
                  onClick={() => handleNavigateToCoursesPage(categoryItem.id)}
                  className="rounded-full border border-[#E5E5E5] bg-white px-4 py-2 text-sm font-medium text-[#171717] transition-colors hover:border-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white"
                >
                  {categoryItem.label}
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* 6. Featured courses */}
        <section aria-labelledby="featured" className="mt-14">
          <SectionHeader
            id="featured"
            title="Featured courses"
            action={
              <Link to="/courses" className="inline-flex items-center gap-1 text-sm font-medium text-[#0A0A0A] hover:underline">
                See catalogue <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            }
          />
          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="aspect-[4/5] rounded-2xl bg-neutral-100" />
              ))}
            </div>
          ) : availableCount > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {studentViewCoursesList.slice(0, 8).map((courseItem) => (
                <CourseCard
                  key={courseItem?._id}
                  course={courseItem}
                  onClick={() => handleCourseNavigate(courseItem?._id)}
                />
              ))}
            </div>
          ) : (
            <Panel className="px-6 py-12 text-center">
              <p className="font-semibold text-[#171717]">No courses published yet</p>
              <p className="mt-1 text-sm text-neutral-600">Check back soon.</p>
            </Panel>
          )}
        </section>
      </PageContainer>
    </div>
  );
}

export default StudentHomePage;
