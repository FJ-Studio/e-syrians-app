"use client";
import { VoteLog } from "@/lib/types/polls";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Pagination,
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
import { FC, Key, useCallback, useMemo } from "react";
import usePollTable from "@/components/hooks/use-poll-table";

const MyVoting: FC = () => {
  const t = useTranslations("account.dashboard.polls.my_votes");
  const columns = [
    { name: t("table.question.title"), uid: "question", sortable: true },
    { name: t("table.answers.title"), uid: "answers", sortable: false },
    { name: t("table.date.title"), uid: "date", sortable: true },
  ];

  const {
    items,
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
  } = usePollTable<VoteLog>({
    fetchUrl: "/api/polls/vote",
    dataExtractor: (data) =>
      (data as { data: { data: VoteLog[] } }).data.data,
    lastPageExtractor: (data) =>
      (data as { data: { last_page: number } }).data.last_page ?? 1,
    searchField: (item) => item.question as string,
    sortableColumns: ["created_at", "question"],
  });

  const renderCell = useCallback(
    (vote: VoteLog, columnKey: Key) => {
      const cellValue = vote[columnKey as keyof VoteLog];
      switch (columnKey) {
        case "question":
          return (
            <Link
              title={vote.question}
              href={`/polls/${vote.poll_id}`}
              target="_blank"
            >
              {vote.question}
            </Link>
          );
        case "date":
          return (
            <>
              {new Date(vote.created_at).toLocaleString("en-US", {
                hour: "numeric",
                minute: "numeric",
                hour12: true,
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })}
            </>
          );
        case "answers":
          return vote.selected_options.join(", ");
        default:
          return cellValue !== undefined && typeof cellValue !== "object"
            ? cellValue
            : String(cellValue);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items]
  );

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder={t("search.title")}
            startContent={<MagnifyingGlassIcon className="size-4" />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
        </div>
      </div>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterValue, onSearchChange, items.length, hasSearchFilter]);

  const bottomContent = useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <Pagination
          isCompact
          showShadow
          color="primary"
          page={page}
          total={pages}
          onChange={setPage}
        />
        <div className="hidden sm:flex w-[30%] justify-end gap-2">
          <Button
            isDisabled={pages === 1}
            size="sm"
            variant="flat"
            onPress={onPreviousPage}
          >
            {t("previous.title")}
          </Button>
          <Button
            isDisabled={pages === 1}
            size="sm"
            variant="flat"
            onPress={onNextPage}
          >
            {t("next.title")}
          </Button>
        </div>
      </div>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, page, pages, hasSearchFilter]);

  return (
    <Card>
      <CardHeader className="flex flex-col items-start">
        <h2 className="text-xl font-medium text-default-700 text-start">
          {t("title")}
        </h2>
        <p className="text-default-500 text-start">{t("description")}</p>
      </CardHeader>
      <CardBody>
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
          <TableHeader columns={columns}>
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
              <div className="flex flex-col items-center gap-3"></div>
            }
            items={items}
            loadingContent={<Spinner />}
            isLoading={loading}
          >
            {(item) => (
              <TableRow key={item.poll_id}>
                {(columnKey) => (
                  <TableCell>{renderCell(item, columnKey)}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );
};

export default MyVoting;
