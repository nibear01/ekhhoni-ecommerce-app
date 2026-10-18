import { useSearchParams } from "react-router";

/** ?category=&q=&sort= as state; defaults are left out of the URL to keep links clean */
export function useUrlFilters() {
  const [params, setParams] = useSearchParams();

  const filters = {
    category: params.get("category") ?? "",
    q: params.get("q") ?? "",
    sort: params.get("sort") ?? "newest",
  };

  function update(patch) {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(patch)) {
      if (!value || (key === "sort" && value === "newest")) next.delete(key);
      else next.set(key, value);
    }
    setParams(next, { replace: true, preventScrollReset: true });
  }

  return [filters, update];
}
