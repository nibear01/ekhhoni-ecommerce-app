import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MAX_QUANTITY } from "@/cart/cart-context";
import { useI18n } from "@/i18n/i18n-context";
import { cn } from "@/lib/utils";

export function QuantityStepper({ value, onChange, label, size = "default" }) {
  const { t, num } = useI18n();
  const large = size === "lg";

  return (
    <div
      className="inline-flex items-center rounded-full border border-input bg-card p-0.5"
      role="group"
      aria-label={label ?? t("common.quantity")}
    >
      <Button
        variant="ghost"
        size={large ? "icon" : "icon-sm"}
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
        aria-label={t("common.decrease")}
      >
        <Minus />
      </Button>
      <span
        className={cn("text-center font-semibold tabular-nums", large ? "w-9 text-base bn:text-lg" : "w-7 text-sm bn:text-base")}
        aria-live="polite"
      >
        {num(value)}
      </span>
      <Button
        variant="ghost"
        size={large ? "icon" : "icon-sm"}
        onClick={() => onChange(value + 1)}
        disabled={value >= MAX_QUANTITY}
        aria-label={t("common.increase")}
      >
        <Plus />
      </Button>
    </div>
  );
}
