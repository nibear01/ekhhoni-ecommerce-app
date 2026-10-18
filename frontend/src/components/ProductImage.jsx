import { Lotus } from "@/components/Lotus";
import { useI18n } from "@/i18n/i18n-context";

/**
 * Fills its (positioned) parent with the product photo, or a stitched lotus on kantha cloth
 * when the admin hasn't uploaded one yet.
 */
export function ProductImage({ src, alt = "", eager = false }) {
  const { t } = useI18n();

  if (!src) {
    return (
      <div className="photo-placeholder" role="img" aria-label={t("common.noPhoto")}>
        <Lotus />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
      decoding="async"
      className="size-full object-cover"
    />
  );
}
