import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { courseCategories, courseLevelOptions } from "@/config";
import { CourseThumbnail, Tag } from "@/components/student-view/ui";

export function labelFor(options, id) {
  if (!id) return null;
  return options.find((option) => option.id === id)?.label || id;
}

function CourseCard({ course, onClick, className }) {
  // Only show a rating when the course data actually carries one.
  const rating = Number(course?.rating);
  const hasRating = Number.isFinite(rating) && rating > 0;
  const level = labelFor(courseLevelOptions, course?.level);
  const category = labelFor(courseCategories, course?.category);

  function handleKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick?.();
    }
  }

  return (
    <article
      role="link"
      tabIndex={0}
      aria-label={course?.title}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-[#E5E5E5] bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-400 focus-visible:ring-2 focus-visible:ring-[#0A0A0A] focus-visible:ring-offset-2",
        className
      )}
    >
      <CourseThumbnail src={course?.image} title={course?.title} className="border-b border-[#E5E5E5]" />
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 min-h-[2.75rem] text-[15px] font-semibold leading-snug tracking-tight text-[#171717]">
          {course?.title}
        </h3>
        <p className="mt-1 truncate text-sm text-neutral-500">
          {course?.instructorName || "Independent instructor"}
        </p>
        {level || category ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {level ? <Tag>{level}</Tag> : null}
            {category ? <Tag className="max-w-full truncate">{category}</Tag> : null}
          </div>
        ) : null}
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          {hasRating ? (
            <span className="flex items-center gap-1 text-sm font-medium text-[#171717]">
              <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
              {rating.toFixed(1)}
            </span>
          ) : (
            <span />
          )}
          <p className="font-bold text-[#0A0A0A]">${course?.pricing}</p>
        </div>
      </div>
    </article>
  );
}

export default CourseCard;
