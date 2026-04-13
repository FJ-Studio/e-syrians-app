"use client";
import usePollTable from "@/components/hooks/use-poll-table";
import capitalize from "@/lib/capitalize";
import { generateToken } from "@/lib/recaptcha";
import { Poll } from "@/lib/types/polls";
import {
  ArrowTopRightOnSquareIcon,
  ChevronDownIcon,
  EllipsisVerticalIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";
import {
  Button,
  Card,
  CardBody,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Pagination,
  Selection,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { FC, Key, useCallback, useMemo, useState } from "react";

const MyPolls: FC = () => {
  const t = useTranslations("account.dashboard.polls.my_polls");
  const columns = [
    { name: t("table.question.title"), uid: "question", sortable: true },
    { name: t("table.startDate.title"), uid: "start_date", sortable: true },
    { name: t("table.endDate.title"), uid: "end_date", sortable: true },
    { name: t("table.createdAt.title"), uid: "created_at", sortable: true },
    { name: t("table.votes.title"), uid: "participants_count", sortable: true },
    { name: t("table.status.title"), uid: "status", sortable: false },
    { name: t("table.actions.title"), uid: "actions", sortable: false },
  ];

  const statusOptions = [
    { name: t("table.status.active.title"), uid: "active" },
    { name: t("table.status.inactive.title"), uid: "inactive" },
  ];

  const [deleting, setDeleting] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Selection>(new Set(columns.map((column) => column.uid)));
  const [statusFilter, setStatusFilter] = useState<Selection>("all");

  const {
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
  } = usePollTable<Poll>({
    fetchUrl: "/api/account/polls",
    dataExtractor: (data) => (data as { data: { polls: Poll[] } }).data.polls,
    lastPageExtractor: (data) => (data as { data: { last_page: number } }).data.last_page ?? 1,
    searchField: (item) => item.question,
    sortableColumns: ["question", "start_date", "end_date", "created_at", "participants_count"],
    defaultSortColumn: "age",
    defaultSortDirection: "ascending",
  });

  // Apply status filter on top of hook results
  const filteredByStatus = useMemo(() => {
    if (statusFilter === "all" || Array.from(statusFilter).length === statusOptions.length) {
      return sortedItems;
    }
    return sortedItems.filter((poll) => Array.from(statusFilter).includes(poll.deleted_at ? "inactive" : "active"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedItems, statusFilter]);

  const switchPollStatus = async (pollId: string, status: "1" | "0") => {
    setDeleting(true);
    try {
      const recaptcha_token = await generateToken("update_poll_status");
      const req = await fetch(`/api/account/polls/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, pollId, recaptcha_token }),
      });
      if (req.status === 200) {
        refetch();
      }
    } catch {
      // Error handled by loading state
    } finally {
      setDeleting(false);
    }
  };

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;
    return columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleColumns]);

  const renderCell = useCallback(
    (poll: Poll, columnKey: Key) => {
      const cellValue = poll[columnKey as keyof Poll];
      switch (columnKey) {
        case "question":
          return poll.question;
        case "start_date":
          return <>{new Date(poll.start_date).toLocaleDateString()}</>;
        case "end_date":
          return <>{new Date(poll.end_date).toLocaleDateString()}</>;
        case "created_at":
          return (
            <>
              {new Date(poll.created_at).toLocaleString("en-US", {
                hour: "numeric",
                minute: "numeric",
                hour12: true,
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })}
            </>
          );
        case "participants_count":
          return poll.votes_count;
        case "status":
          return (
            <Chip variant="flat" size="sm" color={poll.deleted_at ? "danger" : "success"}>
              {poll.deleted_at ? t("table.status.inactive.title") : t("table.status.active.title")}
            </Chip>
          );
        case "actions":
          return (
            <div className="relative flex items-center justify-end gap-2">
              <Dropdown>
                <DropdownTrigger>
                  <Button isIconOnly size="sm" variant="light">
                    <EllipsisVerticalIcon className="text-default-300 size-6" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu disabledKeys={deleting ? ["deactivate", "activate"] : []}>
                  {poll.deleted_at ? (
                    <>
                      <DropdownItem key={"activate"} onPress={() => switchPollStatus(poll.id, "1")}>
                        {t("table.actions.activate")}
                      </DropdownItem>
                    </>
                  ) : (
                    <>
                      <DropdownItem
                        key={"visit"}
                        onPress={() => {
                          window.open(`/polls/${poll.id}`, "_blank");
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span>{t("table.actions.visit")}</span>
                          <ArrowTopRightOnSquareIcon className="size-4" />
                        </div>
                      </DropdownItem>
                      <DropdownItem key={"deactivate"} onPress={() => switchPollStatus(poll.id, "0")}>
                        {t("table.actions.deactivate")}
                      </DropdownItem>
                    </>
                  )}
                </DropdownMenu>
              </Dropdown>
            </div>
          );
        default:
          return cellValue !== undefined && typeof cellValue !== "object" ? cellValue : String(cellValue);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filteredByStatus],
  );

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-3">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder={t("search.title")}
            startContent={<MagnifyingGlassIcon className="size-4" />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button endContent={<ChevronDownIcon className="text-small size-4" />} variant="flat">
                  {t("table.status.title")}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={statusFilter}
                selectionMode="multiple"
                onSelectionChange={setStatusFilter}
              >
                {statusOptions.map((status) => (
                  <DropdownItem key={status.uid} className="capitalize">
                    {capitalize(status.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button endContent={<ChevronDownIcon className="text-small size-4" />} variant="flat">
                  {t("table.columns.title")}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={setVisibleColumns}
              >
                {columns.map((column) => (
                  <DropdownItem key={column.uid} className="capitalize">
                    {capitalize(column.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </div>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterValue, statusFilter, visibleColumns, onSearchChange, filteredByStatus.length, hasSearchFilter]);

  const bottomContent = useMemo(() => {
    return (
      <div className="flex items-center justify-between px-2 py-2">
        <Pagination isCompact showShadow color="primary" page={page} total={pages} onChange={setPage} />
        <div className="hidden w-[30%] justify-end gap-2 sm:flex">
          <Button isDisabled={pages === 1} size="sm" variant="flat" onPress={onPreviousPage}>
            {t("previous.title")}
          </Button>
          <Button isDisabled={pages === 1} size="sm" variant="flat" onPress={onNextPage}>
            {t("next.title")}
          </Button>
        </div>
      </div>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredByStatus.length, page, pages, hasSearchFilter]);

  return (
    <Card>
      <CardBody>
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row">
          <div>
            <h2 className="text-default-700 text-start text-xl font-medium">{t("title")}</h2>
            <p className="text-default-500 text-start">{t("description")}</p>
          </div>
          <Button
            variant="solid"
            color="primary"
            as={Link}
            href="/account/polls/create"
            startContent={<PlusCircleIcon className="size-5" />}
          >
            {t("emptyContent.add")}
          </Button>
        </div>
        <Table
          isHeaderSticky
          isStriped
          classNames={{
            wrapper: "max-h-[800px]",
          }}
          topContent={topContent}
          topContentPlacement="outside"
          bottomContent={bottomContent}
          sortDescriptor={sortDescriptor}
          onSortChange={setSortDescriptor}
        >
          <TableHeader columns={headerColumns}>
            {(column) => (
              <TableColumn
                key={column.uid}
                align={column.uid === "actions" ? "center" : "start"}
                allowsSorting={column.sortable}
              >
                {column.name}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody
            emptyContent={
              <div className="flex flex-col items-center gap-3">
                <span>{t("emptyContent.title")}</span>
                <Button
                  variant="solid"
                  color="primary"
                  as={Link}
                  href="/account/polls/create"
                  startContent={<PlusCircleIcon className="size-5" />}
                >
                  {t("emptyContent.add")}
                </Button>
              </div>
            }
            items={filteredByStatus}
            loadingContent={<Spinner />}
            isLoading={loading}
          >
            {(item) => (
              <TableRow key={item.id}>{(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}</TableRow>
            )}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );
};

export default MyPolls;
