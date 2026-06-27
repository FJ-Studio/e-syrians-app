"use client";
import { fetchAllPages } from "@/lib/api/fetch-all-pages";
import { Verification } from "@/lib/types/account";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  SortDescriptor,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
  User,
} from "@heroui/react";
import { useTranslations } from "next-intl";
import { FC, Key, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

/**
 * Sent verifications — list of people the signed-in user has
 * verified, with an inline Cancel action per row.
 *
 * Symmetric with the mobile rebuild (see
 * docs/claude-design/screens/7.6-account/7.6.4-5-verifications.html):
 *   - Cancel is exposed only on this tab (the verifier is the only
 *     party with cancel rights at the backend — POST
 *     /users/verifications/{id}/cancel).
 *   - Cancelled rows are filtered out of the list. They give the
 *     user no remaining action and the strikethrough-plus-reason
 *     treatment we tried before looked broken next to the design
 *     spec. If we ever want a history view, that becomes a separate
 *     UI surface.
 *   - The Cancel button opens a confirmation modal first — never
 *     single-tap destructive.
 */
const VerificationsTable: FC = () => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Verification[]>([]);
  const t = useTranslations("account.dashboard.verifications.verifications-table");
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "date",
    direction: "descending",
  });

  // Confirm-cancel modal state. We carry the full target row so
  // the modal can show the name + avatar without an extra fetch.
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [target, setTarget] = useState<Verification | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const columns = [
    { name: t("name.title"), uid: "name", sortable: true },
    { name: t("date.title"), uid: "date", sortable: true },
    { name: t("table.actions.title"), uid: "actions", sortable: false },
  ];

  // Backend returns the paginated shape:
  //   { success, data: { verifications: [...], current_page, last_page, per_page, total } }
  // We walk ALL pages here — the Sent list filters cancelled
  // rows client-side, so with `per_page=25` and a user who
  // cancelled some sends and then verified more, active rows can
  // spill onto page 2. A page-1-only fetch silently hid them.
  // Sent volume is capped (verification.max=25 active per user;
  // historical including cancelled stays modest in practice), so
  // the eager walk is cheap.
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await fetchAllPages<Verification>("/api/account/verifications/verifications", "verifications");
      setItems(rows);
    } catch (err) {
      // fetchAllPages now throws on mid-walk failures (HTTP error
      // or invalid JSON on any page) instead of returning the
      // accumulated partial result. Surface the failure as a toast
      // so the user sees something happened — the table itself
      // falls back to its empty state, which is at least
      // honest about not having the data.
      console.error("verifications refresh failed", err);
      toast.error(t("cancelToast.error"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const rows = await fetchAllPages<Verification>("/api/account/verifications/verifications", "verifications");
        if (!cancelled) setItems(rows);
      } catch (err) {
        if (!cancelled) {
          console.error("verifications load failed", err);
          toast.error(t("cancelToast.error"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t]);

  // Active rows only — cancelled rows are noise on a list whose
  // purpose is "what can I still withdraw?".
  const activeItems = useMemo(() => items.filter((v) => !v.cancelled_at), [items]);

  const sortedItems = useMemo(() => {
    return [...activeItems].sort((a: Verification, b: Verification) => {
      let first;
      let second;
      if (sortDescriptor.column === "date") {
        first = a.created_at;
        second = b.created_at;
      } else if (sortDescriptor.column === "name") {
        first = `${a.user?.name} ${a.user?.surname}`;
        second = `${b.user?.name} ${b.user?.surname}`;
      } else {
        return 0;
      }
      const cmp = first < second ? -1 : first > second ? 1 : 0;
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, activeItems]);

  const handleConfirmCancel = useCallback(async () => {
    if (!target) return;
    setCancelling(true);
    try {
      const req = await fetch(`/api/account/verifications/${target.id}/cancel`, { method: "POST" });
      const body = await req.json().catch(() => ({ success: false }));
      if (req.ok && body.success) {
        toast.success(t("cancelToast.success"));
        await refresh();
        onOpenChange();
      } else {
        toast.error(t("cancelToast.error"));
      }
    } catch {
      toast.error(t("cancelToast.error"));
    } finally {
      setCancelling(false);
    }
  }, [target, refresh, t, onOpenChange]);

  const renderCell = useCallback(
    (item: Verification, columnKey: Key) => {
      const cellValue = item[columnKey as keyof Verification];
      switch (columnKey) {
        case "date":
          return (
            <>
              {new Date(item.created_at).toLocaleString("en-US", {
                hour: "numeric",
                minute: "numeric",
                hour12: true,
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })}
            </>
          );
        case "name":
          return (
            <User
              avatarProps={{
                src: item.user?.avatar,
                className: "min-w-10 min-h-10",
              }}
              name={`${item.user?.name} ${item.user?.surname}`}
            />
          );
        case "actions":
          return (
            <Button
              size="sm"
              variant="flat"
              color="danger"
              onPress={() => {
                setTarget(item);
                onOpen();
              }}
            >
              {t("actions.cancel")}
            </Button>
          );
        default:
          return cellValue !== undefined && typeof cellValue !== "object" ? cellValue : String(cellValue);
      }
    },
    [t, onOpen],
  );

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col items-start gap-1">
          <h3 className="text-default-700 text-lg font-medium">{t("title")}</h3>
          <p className="text-default-500 text-sm">{t("description")}</p>
        </CardHeader>
        <CardBody>
          <Table
            isHeaderSticky
            removeWrapper
            isStriped
            classNames={{
              wrapper: "max-h-[800px]",
            }}
            topContentPlacement="outside"
            sortDescriptor={sortDescriptor}
            onSortChange={setSortDescriptor}
          >
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn
                  key={column.uid}
                  align={column.uid === "actions" ? "end" : "start"}
                  allowsSorting={column.sortable}
                >
                  {column.name}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody
              items={sortedItems}
              isLoading={loading}
              loadingContent={<Spinner />}
              emptyContent={
                <div className="flex flex-col items-center justify-center gap-4 px-2 py-12">
                  <p>{t("noVerifications")}</p>
                </div>
              }
            >
              {(item) => (
                <TableRow key={item.id}>{(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}</TableRow>
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/*
        Confirm-cancel modal. Lives at component level so it stays
        mounted across the table's re-renders, and reads `target`
        for the name preview so the user can still recognise who
        they're about to uncertify after the row scrolled offscreen.
      */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur">
        <ModalContent>
          {(close) => (
            <>
              <ModalHeader className="flex flex-col gap-1">{t("cancelDialog.title")}</ModalHeader>
              <ModalBody>
                {target?.user ? (
                  <div className="mb-2">
                    <User
                      avatarProps={{
                        src: target.user.avatar,
                        className: "min-w-10 min-h-10",
                      }}
                      name={`${target.user.name} ${target.user.surname}`}
                    />
                  </div>
                ) : null}
                <p className="text-default-600 text-sm leading-6">{t("cancelDialog.body")}</p>
              </ModalBody>
              <ModalFooter>
                <Chip
                  // Status chip kept off the row so the table can stay
                  // narrow. Status is implicit (we only show active).
                  className="hidden"
                >
                  {t("status.active.title")}
                </Chip>
                <Button variant="light" onPress={close} isDisabled={cancelling}>
                  {t("cancelDialog.keep")}
                </Button>
                <Button color="danger" onPress={handleConfirmCancel} isLoading={cancelling}>
                  {t("cancelDialog.confirm")}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default VerificationsTable;
