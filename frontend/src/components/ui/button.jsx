import { Slot } from "radix-ui";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full border border-transparent font-semibold whitespace-nowrap transition-[background-color,color,border-color,box-shadow,transform] duration-200 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[18px]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[inset_0_1px_0_oklch(1_0_0/0.12),0_6px_18px_-8px_var(--shadow-ink)] hover:bg-primary-hover",
        sindoor: "bg-sindoor text-sindoor-foreground hover:bg-sindoor-hover",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        outline:
          "border-foreground/25 bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "text-foreground hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // for forest-green surfaces (hero, footer)
        cream: "bg-forest-foreground text-[oklch(0.31_0.062_160)] hover:bg-white",
        "line-cream":
          "border-forest-foreground/40 text-forest-foreground hover:bg-forest-foreground/10",
      },
      size: {
        default: "min-h-11 px-5 py-2 text-[15px] bn:text-[15.5px]",
        sm: "min-h-9 px-4 py-1.5 text-sm bn:text-[14.5px]",
        lg: "min-h-13 px-6 py-2.5 text-base bn:text-[16.5px]",
        icon: "size-11",
        "icon-sm": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({ className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button };
