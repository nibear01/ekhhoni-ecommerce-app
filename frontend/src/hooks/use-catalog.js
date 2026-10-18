import { useMemo } from "react";
import { useProducts } from "@/hooks/use-products";
import { isNew } from "@/i18n/format";

const LATEST_FALLBACK = 8;

/**
 * Everything the storefront derives from the product list (newest first):
 * categories with counts and a cover photo, this week's arrivals, and the hero picks.
 */
export function useCatalog() {
  const query = useProducts();

  return useMemo(() => {
    const list = query.data ?? [];

    // hero: newest three photos, one per category
    const heroPicks = [];
    for (const p of list) {
      if (heroPicks.length === 3) break;
      if (p.imageUrl && !heroPicks.some((x) => x.category === p.category)) heroPicks.push(p);
    }

    // categories: name, count and the newest photo not already used in the hero
    const used = new Set(heroPicks.map((p) => p.id));
    const byName = new Map();
    for (const p of list) {
      const entry = byName.get(p.category) ?? { name: p.category, count: 0, imageUrl: null, fallback: null };
      entry.count += 1;
      if (p.imageUrl && !entry.imageUrl && !used.has(p.id)) entry.imageUrl = p.imageUrl;
      if (p.imageUrl && !entry.fallback) entry.fallback = p.imageUrl;
      byName.set(p.category, entry);
    }
    const categories = [...byName.values()]
      .map(({ fallback, ...c }) => ({ ...c, imageUrl: c.imageUrl ?? fallback }))
      .sort((a, b) => a.name.localeCompare(b.name));

    const fresh = list.filter((p) => isNew(p.createdAt));

    return {
      query,
      list,
      categories,
      fresh,
      // "New" falls back to the latest arrivals when nothing was added this week
      arrivals: fresh.length > 0 ? fresh : list.slice(0, LATEST_FALLBACK),
      heroPicks,
    };
  }, [query]);
}

export function categoryPath(name) {
  return `/categories/${encodeURIComponent(name)}`;
}
