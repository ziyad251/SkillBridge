import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import EmptyState from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchStudentBoughtCoursesService } from "@/services";
import { BookOpen, Watch } from "lucide-react";
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
    const response = await fetchStudentBoughtCoursesService(auth?.user?._id);
    if (response?.success) {
      setStudentBoughtCoursesList(response?.data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchStudentBoughtCourses();
  }, []);

  return (
    <div className="lms-page-shell mx-auto max-w-7xl overflow-x-hidden p-4 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
        <p className="mt-1 text-muted-foreground">
          Your purchased courses — continue learning anytime.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      ) : studentBoughtCoursesList?.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {studentBoughtCoursesList.map((course) => (
            <Card
              key={course.courseId || course.id}
              className="flex flex-col overflow-hidden border-border/60 bg-card/80 transition-all duration-300 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/10"
            >
              <CardContent className="flex-grow p-0">
                <div className="aspect-video overflow-hidden bg-muted">
                  <img
                    src={course?.courseImage}
                    alt={course?.title}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="line-clamp-2 font-bold">{course?.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {course?.instructorName}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button
                  onClick={() =>
                    navigate(`/course-progress/${course?.courseId}`)
                  }
                  className="lms-btn-primary w-full"
                >
                  <Watch className="mr-2 h-4 w-4" />
                  Start Watching
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No purchases yet"
          description="Browse the marketplace and enroll in your first course."
          action={
            <Button className="lms-btn-primary" onClick={() => navigate("/courses")}>
              Explore Courses
            </Button>
          }
        />
      )}
    </div>
  );
}

export default StudentCoursesPage;
