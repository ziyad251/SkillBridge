import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import PurchasedCourseCard from "@/components/student-view/purchased-course-card";
import { btnPrimary, FadeIn, Kicker, PageContainer, Panel } from "@/components/student-view/ui";
import { cn } from "@/lib/utils";
import { fetchStudentBoughtCoursesService } from "@/services";
import { BookOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function StudentCoursesPage({
  auth,
  studentBoughtCoursesList,
  setStudentBoughtCoursesList,
}) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  async function fetchStudentBoughtCourses() {
    setLoading(true);
    try {
      const response = await fetchStudentBoughtCoursesService(auth?.user?._id);
      if (response?.success) {
        setStudentBoughtCoursesList(response?.data);
      }
    } catch (error) {
      console.error("Failed to load purchased courses:", error?.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStudentBoughtCourses();
  }, []);

  const count = studentBoughtCoursesList?.length || 0;

  return (
    <div className="lms-page-shell pb-20">
      <PageContainer className="pt-10 sm:pt-12">
        <FadeIn className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Kicker>Your library</Kicker>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#171717] sm:text-4xl">My courses</h1>
            <p className="mt-2 text-neutral-600">
              {count > 0
                ? `${count} ${count === 1 ? "course" : "courses"} enrolled. Resume any of them where you left off.`
                : "Courses you enroll in will show up here."}
            </p>
          </div>
          {count > 0 ? (
            <Button className={cn(btnPrimary, "h-10 self-start sm:self-auto")} onClick={() => navigate("/courses")}>
              Browse courses
            </Button>
          ) : null}
        </FadeIn>

        <div className="mt-8">
          {loading && count === 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="aspect-[4/5] rounded-2xl bg-neutral-100" />
              ))}
            </div>
          ) : count > 0 ? (
            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {studentBoughtCoursesList.map((course) => (
                <li key={course.courseId || course.id}>
                  <PurchasedCourseCard course={course} showDetailsLink />
                </li>
              ))}
            </ul>
          ) : (
            <Panel className="flex flex-col items-center px-6 py-16 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#E5E5E5] bg-[#FAFAFA]">
                <BookOpen className="h-5 w-5 text-[#0A0A0A]" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-xl font-bold tracking-tight text-[#171717]">No courses yet</h2>
              <p className="mt-2 max-w-sm text-sm text-neutral-600">
                Browse the catalogue and enroll in your first course to start learning.
              </p>
              <Button className={cn(btnPrimary, "mt-6 h-10")} onClick={() => navigate("/courses")}>
                Browse courses
              </Button>
            </Panel>
          )}
        </div>
      </PageContainer>
    </div>
  );
}

export default StudentCoursesPage;
