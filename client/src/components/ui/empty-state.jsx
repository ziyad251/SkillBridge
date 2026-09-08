import { cn } from "@/lib/utils";

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}) {
  return (
    <div
      className={cn(
        "col-span-full flex flex-col items-center justify-center rounded-lg border border-dashed border-border/80 bg-white/60 px-6 py-16 text-center",
        className
      )}
    >
      {Icon ? (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon className="h-7 w-7" />
        </div>
      ) : null}
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export default EmptyState;
