"use client";
import useServerError from "@/components/hooks/localization/server-errors";
import { generateToken } from "@/lib/recaptcha";
import { Audience, AudienceEntry } from "@/lib/types/audience";
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
  Selection,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea,
  useDisclosure,
} from "@heroui/react";
import arrowPathIcon from "@iconify-icons/heroicons/arrow-path";
import pencilSquareIcon from "@iconify-icons/heroicons/pencil-square";
import plusCircleIcon from "@iconify-icons/heroicons/plus-circle";
import trashIcon from "@iconify-icons/heroicons/trash";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FC, Key, useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

interface AudienceDetailProps {
  audience: Audience;
}

/**
 * Detail page — renders the audience metadata, its entries table
 * (with bulk-remove + per-row delete), an "Add entries" section, a
 * manual "Refresh resolution" button, and a delete-audience action.
 *
 * TODO: surface an inline warning banner if the audience is
 * referenced by a poll inside its voting window. The current
 * `AudienceResource` shape doesn't expose that signal — extending it
 * server-side is out of scope for v1 — so we defer this to a
 * follow-up rather than derive it from a preflight DELETE.
 */
const AudienceDetail: FC<AudienceDetailProps> = ({ audience: initial }) => {
  const t = useTranslations("account.dashboard.audiences.detail");
  const serverError = useServerError();
  const router = useRouter();

  const [audience, setAudience] = useState<Audience>(initial);
  const [selected, setSelected] = useState<Selection>(new Set<string>());
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [bulkRemoving, setBulkRemoving] = useState(false);

  const [addingEntries, setAddingEntries] = useState(false);
  const [entriesDraft, setEntriesDraft] = useState("");

  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteChange } = useDisclosure();
  const [conflictPollIds, setConflictPollIds] = useState<string[]>([]);

  // Entry-removal confirmation. A single Modal serves both the
  // per-row trash icon and the bulk "Remove N selected" action —
  // `pendingRemoveIds` holds either 1 or N entry ids, and the
  // modal copy switches on the count via ICU plural. Nothing hits
  // the API until the user confirms.
  const { isOpen: isEntryDeleteOpen, onOpen: onEntryDeleteOpen, onOpenChange: onEntryDeleteChange } = useDisclosure();
  const [pendingRemoveIds, setPendingRemoveIds] = useState<number[]>([]);

  const entries: AudienceEntry[] = useMemo(() => audience.entries ?? [], [audience.entries]);

  const columns = useMemo(
    () => [
      { name: t("table.identifier"), uid: "identifier" },
      { name: t("table.type"), uid: "identifier_type" },
      { name: t("table.resolved"), uid: "resolved" },
      { name: t("table.createdAt"), uid: "created_at" },
      { name: t("table.actions"), uid: "actions" },
    ],
    [t],
  );

  const refreshResolution = useCallback(async () => {
    setRefreshing(true);
    try {
      const recaptcha_token = await generateToken("audience_resolve");
      const req = await fetch(`/api/account/audiences/${audience.uuid}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recaptcha_token }),
      });
      const body = await req.json();
      if (req.ok && body.success) {
        setAudience(body.data as Audience);
        setLastRefreshedAt(new Date().toISOString());
        toast.success(t("refresh.success"));
      } else {
        toast.error(serverError((body?.messages?.[0] as string) ?? "unknown_error"));
      }
    } catch {
      toast.error(t("refresh.error"));
    } finally {
      setRefreshing(false);
    }
  }, [audience.uuid, serverError, t]);

  const removeEntryIds = useCallback(
    async (ids: number[]): Promise<{ ok: number; failed: number }> => {
      if (ids.length === 0) return { ok: 0, failed: 0 };

      // Single-entry deletes still go through the per-id DELETE —
      // it's the simpler, well-worn path. Multi-entry deletes hit
      // the bulk endpoint so one user action = one HTTP request =
      // one recaptcha token = one throttle bucket entry. Fanning
      // out N parallel DELETEs (the old shape) multiplied every
      // per-request cost and produced partial-delete outcomes on
      // any transient failure.
      try {
        if (ids.length === 1) {
          const recaptcha_token = await generateToken("audience_entries_remove");
          const res = await fetch(`/api/account/audiences/${audience.uuid}/entries/${ids[0]}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ recaptcha_token }),
          });
          return res.ok ? { ok: 1, failed: 0 } : { ok: 0, failed: 1 };
        }

        const recaptcha_token = await generateToken("audience_entries_bulk_remove");
        const res = await fetch(`/api/account/audiences/${audience.uuid}/entries/bulk-remove`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ entry_ids: ids, recaptcha_token }),
        });
        const body = await res.json().catch(() => null);
        if (!res.ok || !body?.success) {
          return { ok: 0, failed: ids.length };
        }
        // Backend returns { removed_count: int }. Unknown ids are
        // silently ignored server-side, so "failed" here really
        // means "ids the server didn't recognise (already gone)"
        // rather than "network failure". Either way the UI reloads
        // from source so displayed state stays consistent.
        const removed = Number(body?.data?.removed_count ?? 0);
        return { ok: removed, failed: Math.max(0, ids.length - removed) };
      } catch {
        return { ok: 0, failed: ids.length };
      }
    },
    [audience.uuid],
  );

  const reloadAudience = useCallback(async () => {
    const res = await fetch(`/api/account/audiences/${audience.uuid}`, {
      headers: { Accept: "application/json" },
    });
    const body = await res.json();
    if (res.ok && body.success) {
      setAudience(body.data as Audience);
    }
  }, [audience.uuid]);

  // Stage a single entry for removal and open the confirm modal.
  // The delete itself happens in `confirmRemoveEntries` — nothing
  // hits the backend until the user clicks confirm.
  const removeOne = useCallback(
    (id: number) => {
      setPendingRemoveIds([id]);
      onEntryDeleteOpen();
    },
    [onEntryDeleteOpen],
  );

  // Stage the current bulk selection for removal and open the same
  // confirm modal. The modal copy pluralises on the pending count.
  const bulkRemove = useCallback(() => {
    const ids: number[] =
      selected === "all"
        ? entries.map((e) => e.id)
        : Array.from(selected as Set<string>)
            .map((v) => Number(v))
            .filter(Number.isFinite);
    if (ids.length === 0) return;
    setPendingRemoveIds(ids);
    onEntryDeleteOpen();
  }, [selected, entries, onEntryDeleteOpen]);

  const confirmRemoveEntries = useCallback(
    async (close: () => void) => {
      if (pendingRemoveIds.length === 0) return;
      const isBulk = pendingRemoveIds.length > 1;
      setBulkRemoving(true);
      try {
        const { ok, failed } = await removeEntryIds(pendingRemoveIds);
        if (isBulk) {
          if (failed === 0) {
            toast.success(t("bulk.removeSuccess", { count: ok }));
          } else {
            toast.error(t("bulk.removePartial", { ok, failed }));
          }
          setSelected(new Set<string>());
        } else if (ok === 1) {
          toast.success(t("entry.removeSuccess"));
        } else {
          toast.error(t("entry.removeError"));
        }
        await reloadAudience();
      } finally {
        setBulkRemoving(false);
        setPendingRemoveIds([]);
        close();
      }
    },
    [pendingRemoveIds, removeEntryIds, reloadAudience, t],
  );

  const submitAddEntries = useCallback(async () => {
    // Split textarea into trimmed, non-empty lines and let the
    // backend's per-entry validator surface any malformed rows.
    // Client-side filtering used to happen here (paired with a
    // live preview panel) but silently dropping "invalid-looking"
    // lines hid legitimate paste mistakes; deferring to the API
    // gives the user a real error message.
    const entriesToAdd = entriesDraft
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    if (entriesToAdd.length === 0) {
      toast.error(t("addEntries.emptyError"));
      return;
    }
    setAddingEntries(true);
    try {
      const recaptcha_token = await generateToken("audience_entries_add");
      const req = await fetch(`/api/account/audiences/${audience.uuid}/entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries: entriesToAdd, recaptcha_token }),
      });
      const body = await req.json();
      if (req.ok && body.success) {
        toast.success(t("addEntries.success"));
        setAudience(body.data as Audience);
        setEntriesDraft("");
      } else {
        toast.error(serverError((body?.messages?.[0] as string) ?? "unknown_error"));
      }
    } catch {
      toast.error(t("addEntries.error"));
    } finally {
      setAddingEntries(false);
    }
  }, [entriesDraft, audience.uuid, serverError, t]);

  const handleConfirmDelete = useCallback(async () => {
    setDeleting(true);
    setConflictPollIds([]);
    try {
      const recaptcha_token = await generateToken("audience_delete");
      const req = await fetch(`/api/account/audiences/${audience.uuid}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recaptcha_token }),
      });
      const body = await req.json();
      if (req.ok && body.success) {
        toast.success(t("delete.success"));
        router.push("/account/audiences");
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
  }, [audience.uuid, router, serverError, t]);

  const renderCell = useCallback(
    (entry: AudienceEntry, columnKey: Key) => {
      switch (columnKey) {
        case "identifier":
          return (
            <span className="text-default-700 break-all" dir="ltr">
              {entry.identifier}
            </span>
          );
        case "identifier_type":
          return (
            <Chip size="sm" variant="flat" color={entry.identifier_type === "email" ? "primary" : "secondary"}>
              {entry.identifier_type === "email" ? t("type.email") : t("type.national_id")}
            </Chip>
          );
        case "resolved":
          return (
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className={`inline-block size-2.5 rounded-full ${
                  entry.resolved ? "bg-success" : "border-default-300 border"
                }`}
              />
              <span className="text-default-500 text-xs">{entry.resolved ? t("resolved.yes") : t("resolved.no")}</span>
            </div>
          );
        case "created_at":
          return <>{new Date(entry.created_at).toLocaleDateString()}</>;
        case "actions":
          return (
            <div className="flex items-center justify-end">
              <Button
                size="sm"
                variant="light"
                color="danger"
                isIconOnly
                aria-label={t("entry.remove")}
                onPress={() => removeOne(entry.id)}
              >
                <Icon icon={trashIcon} className="size-5" />
              </Button>
            </div>
          );
        default:
          return null;
      }
    },
    [t, removeOne],
  );

  const selectedCount = selected === "all" ? entries.length : Array.from(selected as Set<string>).length;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="border-b-default-200 dark:border-b-default-100 bg-default-50 flex flex-col items-start gap-2 border-b sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-default-700 text-xl font-medium">{audience.name}</h2>
            {audience.description ? <p className="text-default-500 text-sm">{audience.description}</p> : null}
            <p className="text-default-400 text-xs">
              {t("meta.counts", {
                resolved: audience.entries_resolved_count,
                total: audience.entries_total_count,
              })}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              as={Link}
              href={`/account/audiences/${audience.uuid}/edit`}
              size="sm"
              variant="flat"
              startContent={<Icon icon={pencilSquareIcon} className="size-4" />}
            >
              {t("meta.edit")}
            </Button>
            <Button
              size="sm"
              variant="flat"
              onPress={refreshResolution}
              isLoading={refreshing}
              startContent={!refreshing ? <Icon icon={arrowPathIcon} className="size-4" /> : undefined}
            >
              {t("refresh.action")}
            </Button>
            <Button
              size="sm"
              variant="flat"
              color="danger"
              onPress={onDeleteOpen}
              startContent={<Icon icon={trashIcon} className="size-4" />}
            >
              {t("delete.action")}
            </Button>
          </div>
        </CardHeader>
        {lastRefreshedAt ? (
          <CardBody className="pb-0">
            <p className="text-default-400 text-xs">
              {t("refresh.lastRun", { at: new Date(lastRefreshedAt).toLocaleString() })}
            </p>
          </CardBody>
        ) : null}
        <CardBody>
          {selectedCount > 0 ? (
            <div className="border-default-200 bg-default-50 rounded-medium mb-3 flex items-center justify-between border px-3 py-2">
              <span className="text-default-700 text-sm">{t("bulk.selected", { count: selectedCount })}</span>
              <Button size="sm" color="danger" variant="flat" onPress={bulkRemove} isLoading={bulkRemoving}>
                {t("bulk.remove", { count: selectedCount })}
              </Button>
            </div>
          ) : null}
          <Table
            isHeaderSticky
            removeWrapper
            isStriped
            aria-label={t("table.aria")}
            selectionMode="multiple"
            selectedKeys={selected}
            onSelectionChange={setSelected}
            classNames={{ wrapper: "max-h-[800px]" }}
          >
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn key={column.uid} align={column.uid === "actions" ? "end" : "start"}>
                  {column.name}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody
              items={entries}
              loadingContent={<Spinner />}
              emptyContent={<span className="text-default-500 text-sm">{t("table.empty")}</span>}
            >
              {(item) => (
                <TableRow key={String(item.id)}>
                  {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="flex flex-col items-start gap-1">
          <h3 className="text-default-700 text-base font-medium">{t("addEntries.title")}</h3>
          <p className="text-default-500 text-sm">{t("addEntries.description")}</p>
        </CardHeader>
        <CardBody>
          <Textarea
            value={entriesDraft}
            onValueChange={setEntriesDraft}
            placeholder={t("addEntries.placeholder")}
            minRows={6}
          />
          <div className="mt-4">
            <Button
              color="primary"
              onPress={submitAddEntries}
              isLoading={addingEntries}
              startContent={!addingEntries ? <Icon icon={plusCircleIcon} className="size-5" /> : undefined}
            >
              {t("addEntries.submit")}
            </Button>
          </div>
        </CardBody>
      </Card>

      <Modal isOpen={isDeleteOpen} onOpenChange={onDeleteChange} backdrop="blur">
        <ModalContent>
          {(close) => (
            <>
              <ModalHeader className="flex flex-col gap-1">{t("delete.title")}</ModalHeader>
              <ModalBody>
                <p className="text-default-600 text-sm leading-6">{t("delete.body", { name: audience.name })}</p>
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

      {/*
        Entry-removal confirm modal. Shared by the per-row trash
        icon and the bulk "Remove N selected" button; copy pivots
        on `pendingRemoveIds.length` (ICU plural).
      */}
      <Modal isOpen={isEntryDeleteOpen} onOpenChange={onEntryDeleteChange} backdrop="blur">
        <ModalContent>
          {(close) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {t("entryConfirm.title", { count: pendingRemoveIds.length })}
              </ModalHeader>
              <ModalBody>
                <p className="text-default-600 text-sm leading-6">
                  {t("entryConfirm.body", { count: pendingRemoveIds.length })}
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={close} isDisabled={bulkRemoving}>
                  {t("entryConfirm.cancel")}
                </Button>
                <Button color="danger" onPress={() => confirmRemoveEntries(close)} isLoading={bulkRemoving}>
                  {t("entryConfirm.confirm", { count: pendingRemoveIds.length })}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default AudienceDetail;
