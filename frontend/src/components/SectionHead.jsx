import { cn } from "@/lib/utils";

/** eyebrow (dashed red rule or pulsing dot) + serif heading, with an optional right-hand slot */
export function SectionHead({ id, eyebrow, title, dot = false, children, className }) {
  return (
    <div className={cn("section-head", className)}>
      <div>
        <p className={cn("eyebrow", dot && "eyebrow-dot")}>
          {dot && <span className="bindu bindu-pulse bg-sindoor" aria-hidden="true" />}
          {eyebrow}
        </p>
        <h2 id={id} className="display h2">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}
