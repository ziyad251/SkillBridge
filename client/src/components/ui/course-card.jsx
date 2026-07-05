import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

function CourseCard({ course, onClick, className, layout = "grid" }) {
  const rating = course?.rating ?? 4.8;

  if (layout === "list") {
    return (
      <article
        onClick={onClick}
        className={cn(
          "group flex cursor-pointer gap-4 overflow-hidden rounded-xl border border-border/60 bg-card/80 p-4 shadow-sm transition-all duration-300 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/10",
          className
        )}
      >
        <div className="h-28 w-40 shrink-0 overflow-hidden rounded-lg sm:h-32 sm:w-48">
          <img
            src={course?.image}
            alt={course?.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-lg font-semibold tracking-tight group-hover:text-indigo-400">
            {course?.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{course?.instructorName}</p>
          <div className="mt-2 flex items-center gap-2 text-sm text-amber-400/90">
            <Star className="h-3.5 w-3.5 fill-current" />
            <span>{rating}</span>
          </div>
          <p className="mt-2 text-lg font-bold text-indigo-400">${course?.pricing}</p>
        </div>
      </article>
    );
  }

  return (
    <article
      onClick={onClick}
      className={cn(
        "group cursor-pointer overflow-hidden rounded-xl border border-border/60 bg-card/80 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/10",
        className
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <img
          src={course?.image}
          alt={course?.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 font-semibold tracking-tight group-hover:text-indigo-400">
          {course?.title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{course?.instructorName}</p>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm text-amber-400/90">
            <Star className="h-3.5 w-3.5 fill-current" />
            <span>{rating}</span>
          </div>
          <p className="font-bold text-indigo-400">${course?.pricing}</p>
        </div>
      </div>
    </article>
  );
}

export default CourseCard;
