"use client";

import { AppNotification } from "@/lib/types/account";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Pagination,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import checkIcon from "@iconify-icons/heroicons/check";
import ellipsisIcon from "@iconify-icons/heroicons/ellipsis-vertical";
import trashIcon from "@iconify-icons/heroicons/trash";
import { Icon } from "@iconify/react";
import { useLocale, useTranslations } from "next-intl";
import { FC, Key, useCallback, useEffect, useState } from "react";

function relativeTime(dateStr: string, locale: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffSeconds = Math.round((date - now) / 1000);
  const absDiff = Math.abs(diffSeconds);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (absDiff < 60) return rtf.format(diffSeconds, "second");
  if (absDiff < 3600) return rtf.format(Math.round(diffSeconds / 60), "minute");
  if (absDiff < 86400) return rtf.format(Math.round(diffSeconds / 3600), "hour");
  if (absDiff < 2592000) return rtf.format(Math.round(diffSeconds / 86400), "day");
  if (absDiff < 31536000) return rtf.format(Math.round(diffSeconds / 2592000), "month");
  return rtf.format(Math.round(diffSeconds / 31536000), "year");
}

const NotificationsHistory: FC = () => {
  const t = useTranslations("account.dashboard.notifications");
  const locale = useLocale();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/account/notifications?page=${page}`);
        if (response.ok && !cancelled) {
          const result = await response.json();
          if (result.success && !cancelled) {
            setItems(result.data?.data ?? []);
            setTotalPages(result.data?.last_page ?? 1);
          }
        }
      } catch {
        // handled by empty state
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page]);

  const markAsRead = async (id: string) => {
    await fetch(`/api/account/notifications/${id}/mark-read`, { method: "POST" });
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)));
  };

  const markAllAsRead = async () => {
    await fetch("/api/account/notifications", { method: "POST", body: JSON.stringify({}) });
    setItems((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
  };

  const deleteNotification = async (id: string) => {
    await fetch(`/api/account/notifications/${id}/delete`, { method: "DELETE" });
    setItems((prev) => prev.filter((n) => n.id !== id));
  };

  const columns = [
    { name: t("history.columns.content"), uid: "content" },
    { name: t("history.columns.actions"), uid: "actions" },
  ];

  const hasUnread = items.some((n) => !n.read_at);

  const renderCell = useCallback(
    (item: AppNotification, columnKey: Key) => {
      switch (columnKey) {
        case "content":
          return (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                {!item.read_at && <span className="bg-primary inline-block h-2 w-2 flex-shrink-0 rounded-full" />}
                <span className={!item.read_at ? "font-medium" : "text-default-700"}>{item.data?.message ?? ""}</span>
              </div>
              <span className="text-default-400 text-xs">{relativeTime(item.created_at, locale)}</span>
            </div>
          );
        case "actions": {
          const menuItems = [];
          if (!item.read_at) {
            menuItems.push(
              <DropdownItem
                key="mark-read"
                startContent={<Icon icon={checkIcon} className="size-4" />}
                onPress={() => markAsRead(item.id)}
              >
                {t("history.markAsRead")}
              </DropdownItem>,
            );
          }
          menuItems.push(
            <DropdownItem
              key="delete"
              className="text-danger"
              color="danger"
              startContent={<Icon icon={trashIcon} className="size-4" />}
              onPress={() => deleteNotification(item.id)}
            >
              {t("history.delete")}
            </DropdownItem>,
          );
          return (
            <div className="flex justify-end">
              <Dropdown>
                <DropdownTrigger>
                  <Button isIconOnly size="sm" variant="light">
                    <Icon icon={ellipsisIcon} className="size-5" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label={t("history.columns.actions")}>{menuItems}</DropdownMenu>
              </Dropdown>
            </div>
          );
        }
        default:
          return null;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, locale],
  );

  return (
    <Card>
      <CardHeader className="border-b-default-200 dark:border-b-default-100 bg-default-50 flex items-center justify-between border-b">
        <h3 className="text-default-700 text-lg font-medium">{t("history.title")}</h3>
        {hasUnread && (
          <Button size="sm" variant="flat" onPress={markAllAsRead}>
            {t("history.markAllAsRead")}
          </Button>
        )}
      </CardHeader>
      <CardBody>
        <Table removeWrapper isStriped aria-label={t("history.title")}>
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn key={column.uid} align={column.uid === "actions" ? "end" : "start"}>
                {column.name}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody
            items={items}
            isLoading={loading}
            loadingContent={<Spinner />}
            emptyContent={
              <div className="flex flex-col items-center justify-center gap-4 px-2 py-12">
                <p className="text-default-500">{t("history.empty")}</p>
              </div>
            }
          >
            {(item) => (
              <TableRow key={item.id}>{(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}</TableRow>
            )}
          </TableBody>
        </Table>
        {totalPages > 1 && (
          <div className="flex justify-center pt-4">
            <Pagination total={totalPages} page={page} onChange={setPage} />
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default NotificationsHistory;
