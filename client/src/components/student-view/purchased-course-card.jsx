import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PlayCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { btnPrimary, btnSecondary, CourseThumbnail } from "./ui";

export function formatPurchaseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

/* Card for a course the student has bought. Data comes from the
   student-courses endpoint: courseId, title, instructorName, courseImage, dateOfPurchase. */
function PurchasedCourseCard({ course, className, showDetailsLink = false }) {
  const navigate = useNavigate();
  const enrolledOn = formatPurchaseDate(course?.dateOfPurchase);

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-[#E5E5E5] bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-400",
        className
      )}
    >
      <button
        type="button"
        onClick={() => navigate(`/course-progress/${course?.courseId}`)}
        className="block w-full text-left"
        aria-label={`Resume ${course?.title || "course"}`}
        tabIndex={-1}
      >
        <CourseThumbnail src={course?.courseImage} title={course?.title} className="border-b border-[#E5E5E5]" />
      </button>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 min-h-[2.75rem] text-[15px] font-semibold leading-snug tracking-tight text-[#171717]">
          {course?.title}
        </h3>
        <p className="mt-1 truncate text-sm text-neutral-500">{course?.instructorName}</p>
        {enrolledOn ? <p className="mt-1 text-xs text-neutral-400">Enrolled {enrolledOn}</p> : null}
        <div className="mt-auto flex gap-2 pt-4">
          <Button
            size="sm"
            className={cn(btnPrimary, "h-9 flex-1")}
            onClick={() => navigate(`/course-progress/${course?.courseId}`)}
          >
            <PlayCircle className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Resume
          </Button>
          {showDetailsLink ? (
            <Button
              size="sm"
              variant="outline"
              className={cn(btnSecondary, "h-9 px-4")}
              onClick={() => navigate(`/course/details/${course?.courseId}`)}
            >
              Details
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default PurchasedCourseCard;
