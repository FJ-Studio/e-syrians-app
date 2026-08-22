"use client";
import useServerError from "@/components/hooks/localization/server-errors";
import { generateToken } from "@/lib/recaptcha";
import { Audience } from "@/lib/types/audience";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@heroui/react";
import eyeIcon from "@iconify-icons/heroicons/eye";
import plusCircleIcon from "@iconify-icons/heroicons/plus-circle";
import trashIcon from "@iconify-icons/heroicons/trash";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { FC, Key, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface Pager {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

/**
 * /account/audiences — table of the signed-in user's audiences with
 * server-side pagination (the backend clamps per_page ∈ [1, 100]).
 *
 * Delete opens a confirm modal, forwards through the proxy with a
 * recaptcha token, and surfaces the 409 `audience_referenced_by_active_poll`
 * response — including offering the offending poll ids as links when
 * the response body includes `active_poll_ids`.
 */
const MyAudiences: FC = () => {
  const t = useTranslations("account.dashboard.audiences.my_audiences");
  const serverError = useServerError();

  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [pager, setPager] = useState<Pager>({ current_page: 1, last_page: 1, per_page: 20, total: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [fetchKey, setFetchKey] = useState(0);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [target, setTarget] = useState<Audience | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [conflictPollIds, setConflictPollIds] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/account/audiences?page=${page}&per_page=20`, {
          headers: { Accept: "application/json" },
        });
        const body = await res.json();
        if (cancelled) return;
        if (res.ok && body?.success) {
          setAudiences((body.data?.audiences as Audience[]) ?? []);
          setPager(body.data?.pagination as Pager);
        }
      } catch {
        // Fall through to the empty state.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page, fetchKey]);

  const refetch = useCallback(() => setFetchKey((k) => k + 1), []);

  const columns = useMemo(
    () => [
      { name: t("table.name.title"), uid: "name" },
      { name: t("table.entries.title"), uid: "entries" },
      { name: t("table.createdAt.title"), uid: "created_at" },
      { name: t("table.updatedAt.title"), uid: "updated_at" },
      { name: t("table.actions.title"), uid: "actions" },
    ],
    [t],
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!target) return;
    setDeleting(true);
    setConflictPollIds([]);
    try {
      const recaptcha_token = await generateToken("audience_delete");
      const req = await fetch(`/api/account/audiences/${target.uuid}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recaptcha_token }),
      });
      const body = await req.json().catch(() => ({ success: false }));
      if (req.ok && body.success) {
        toast.success(t("delete.success"));
        refetch();
        onOpenChange();
        setTarget(null);
      } else if (req.status === 409) {
        const ids = (body?.data?.active_poll_ids as string[] | undefined) ?? [];
        setConflictPollIds(ids);
        toast.error(serverError((body?.messages?.[0] as string) ?? "unknown_error"));
      } else {
        toast.error(serverError((body?.messages?.[0] as string) ?? "unknown_error"));
      }
    } catch {
      toast.error(t("delete.error"));
    } finally {
      setDeleting(false);
    }
  }, [target, t, serverError, refetch, onOpenChange]);

  const renderCell = useCallback(
    (audience: Audience, columnKey: Key) => {
      switch (columnKey) {
        case "name":
          return (
            <div className="flex flex-col">
              <Link
                href={`/account/audiences/${audience.uuid}`}
                className="text-default-700 hover:text-primary font-medium"
              >
                {audience.name}
              </Link>
              {audience.description ? (
                <span className="text-default-500 line-clamp-1 text-xs">{audience.description}</span>
              ) : null}
            </div>
          );
        case "entries":
          return (
            <span>
              {audience.entries_resolved_count} / {audience.entries_total_count}
            </span>
          );
        case "created_at":
          return <>{new Date(audience.created_at).toLocaleDateString()}</>;
        case "updated_at":
          return <>{new Date(audience.updated_at).toLocaleDateString()}</>;
        case "actions":
          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                as={Link}
                href={`/account/audiences/${audience.uuid}`}
                size="sm"
                variant="light"
                isIconOnly
                aria-label={t("table.actions.view")}
              >
                <Icon icon={eyeIcon} className="size-5" />
              </Button>
              <Button
                size="sm"
                variant="light"
                color="danger"
                isIconOnly
                aria-label={t("table.actions.delete")}
                onPress={() => {
                  setTarget(audience);
                  setConflictPollIds([]);
                  onOpen();
                }}
              >
                <Icon icon={trashIcon} className="size-5" />
              </Button>
            </div>
          );
        default:
          return null;
      }
    },
    [t, onOpen],
  );

  return (
    <>
      <Card>
        <CardHeader className="border-b-default-200 dark:border-b-default-100 bg-default-50 flex items-center justify-between border-b">
          <div className="flex flex-col gap-1">
            <h2 className="text-default-700 text-lg font-medium">{t("title")}</h2>
            <p className="text-default-500 text-sm">{t("description")}</p>
          </div>
          <Button
            as={Link}
            href="/account/audiences/new"
            color="primary"
            size="sm"
            startContent={<Icon icon={plusCircleIcon} className="size-5" />}
          >
            {t("emptyContent.add")}
          </Button>
        </CardHeader>
        <CardBody>
          <Table
            isHeaderSticky
            removeWrapper
            isStriped
            classNames={{ wrapper: "max-h-[800px]" }}
            bottomContent={
              pager.last_page > 1 ? (
                <div className="flex justify-center py-2">
                  <Pagination
                    isCompact
                    showShadow
                    color="primary"
                    page={page}
                    total={pager.last_page}
                    onChange={setPage}
                  />
                </div>
              ) : null
            }
          >
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn key={column.uid} align={column.uid === "actions" ? "end" : "start"}>
                  {column.name}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody
              items={audiences}
              isLoading={loading}
              loadingContent={<Spinner />}
              emptyContent={
                <div className="flex flex-col items-center gap-3">
                  <span>{t("emptyContent.title")}</span>
                  <Button
                    as={Link}
                    href="/account/audiences/new"
                    color="primary"
                    startContent={<Icon icon={plusCircleIcon} className="size-5" />}
                  >
                    {t("emptyContent.add")}
                  </Button>
                </div>
              }
            >
              {(item) => (
                <TableRow key={item.uuid}>
                  {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur">
        <ModalContent>
          {(close) => (
            <>
              <ModalHeader className="flex flex-col gap-1">{t("delete.title")}</ModalHeader>
              <ModalBody>
                <p className="text-default-600 text-sm leading-6">{t("delete.body", { name: target?.name ?? "" })}</p>
                {conflictPollIds.length > 0 ? (
                  <div className="border-warning-200 bg-warning-50 rounded-medium border p-3 text-sm">
                    <p className="text-warning-700 font-medium">{t("delete.conflictTitle")}</p>
                    <ul className="mt-2 list-disc space-y-1 ps-5">
                      {conflictPollIds.map((id) => (
                        <li key={id}>
                          <Link
                            className="text-primary underline"
                            href={`/polls/${id}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            /polls/{id}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={close} isDisabled={deleting}>
                  {t("delete.cancel")}
                </Button>
                <Button color="danger" onPress={handleConfirmDelete} isLoading={deleting}>
                  {t("delete.confirm")}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default MyAudiences;
