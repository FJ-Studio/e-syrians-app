"use client";
import { SortDescriptor } from "@heroui/react";
import { useCallback, useEffect, useMemo, useState } from "react";

interface UsePollTableOptions<T> {
  fetchUrl: string;
  dataExtractor: (data: Record<string, unknown>) => T[];
  lastPageExtractor: (data: Record<string, unknown>) => number;
  searchField: (item: T) => string;
  sortableColumns: string[];
  defaultSortColumn?: string;
  defaultSortDirection?: "ascending" | "descending";
}

export default function usePollTable<T extends Record<string, unknown>>({
  fetchUrl,
  dataExtractor,
  lastPageExtractor,
  searchField,
  sortableColumns,
  defaultSortColumn = "created_at",
  defaultSortDirection = "descending",
}: UsePollTableOptions<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filterValue, setFilterValue] = useState("");
  const [fetchKey, setFetchKey] = useState(0);

  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: defaultSortColumn,
    direction: defaultSortDirection,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const req = await fetch(`${fetchUrl}?page=${page}`);
        const data = await req.json();
        if (req.status === 200 && !cancelled) {
          setItems(dataExtractor(data));
          setPages(lastPageExtractor(data));
        }
      } catch {
        // Error handled by loading state
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // dataExtractor and lastPageExtractor are inline arrows that change every
    // render — only re-fetch when fetchUrl or page actually change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, fetchUrl, fetchKey]);

  const refetch = useCallback(() => {
    setFetchKey((k) => k + 1);
  }, []);

  const hasSearchFilter = Boolean(filterValue);

  const filteredItems = useMemo(() => {
    if (!hasSearchFilter) return [...items];
    return [...items].filter((item) => searchField(item).toLowerCase().includes(filterValue.toLowerCase()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, filterValue]);

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a: T, b: T) => {
      if (!sortableColumns.includes(sortDescriptor.column as string)) {
        return 0;
      }
      const first = String(a[sortDescriptor.column as keyof T] ?? "");
      const second = String(b[sortDescriptor.column as keyof T] ?? "");
      const cmp = first < second ? -1 : first > second ? 1 : 0;
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortDescriptor, filteredItems]);

  const onNextPage = useCallback(() => {
    if (page < pages) setPage(page + 1);
  }, [page, pages]);

  const onPreviousPage = useCallback(() => {
    if (page > 1) setPage(page - 1);
  }, [page]);

  const onSearchChange = useCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  return {
    items: sortedItems,
    loading,
    page,
    pages,
    setPage,
    filterValue,
    hasSearchFilter,
    sortDescriptor,
    setSortDescriptor,
    onNextPage,
    onPreviousPage,
    onSearchChange,
    onClear,
    refetch,
  };
}
