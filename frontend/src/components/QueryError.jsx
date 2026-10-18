import { Button } from "@/components/ui/button";
import { Lotus } from "@/components/Lotus";
import { useI18n } from "@/i18n/i18n-context";

export function QueryError({ message, onRetry }) {
  const { t } = useI18n();

  return (
    <div className="cloth-panel" role="alert">
      <Lotus />
      <p className="max-w-md text-muted-foreground">{message ?? t("common.loadError")}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          {t("common.retry")}
        </Button>
      )}
    </div>
  );
}
