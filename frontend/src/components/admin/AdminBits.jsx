import { Lotus } from "@/components/Lotus";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function AdminPageHeader({ title, description, children }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="display text-[34px] bn:text-[30px] lg:text-[40px]">{title}</h1>
        {description && <p className="mt-1 text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

/** white card with optional title row */
export function Panel({ title, action, className, children }) {
  return (
    <section className={cn("rounded-[20px] border border-border bg-card", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 border-b border-dashed border-stitch px-5 py-4">
          {title && <h2 className="text-lg font-semibold">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

const TONES = {
  green: "bg-primary/12 text-primary",
  red: "bg-sindoor/12 text-sindoor",
  muted: "bg-muted text-muted-foreground",
  gold: "bg-zari/20 text-zari-ink",
};

export function StatusPill({ tone = "muted", children }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12.5px] font-semibold whitespace-nowrap bn:text-[13px]",
        TONES[tone],
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {children}
    </span>
  );
}

export function AdminEmpty({ title, hint, children }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
      <Lotus className="w-20 text-stitch" />
      <p className="text-lg font-semibold">{title}</p>
      {hint && <p className="max-w-sm text-muted-foreground">{hint}</p>}
      {children}
    </div>
  );
}

export function RowsSkeleton({ rows = 5 }) {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <Skeleton className="size-12 rounded-xl bg-kantha" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3 bg-kantha" />
            <Skeleton className="h-3 w-1/5 bg-kantha" />
          </div>
          <Skeleton className="h-5 w-16 bg-kantha" />
        </div>
      ))}
    </div>
  );
}
