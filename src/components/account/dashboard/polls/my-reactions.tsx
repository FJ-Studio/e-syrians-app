"use client";
import { ReactionLog } from "@/lib/types/polls";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Input,
  Pagination,
  SortDescriptor,
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
import { FC, Key, useCallback, useEffect, useMemo, useState } from "react";

const MyReactions: FC = () => {
  const t = useTranslations("account.dashboard.polls.my_reactions");
  const [reactions, setReactions] = useState<Array<ReactionLog>>([]);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const columns = [
    { name: t("table.question.title"), uid: "question", sortable: true },
    { name: t("table.reaction.title"), uid: "reaction", sortable: false },
    { name: t("table.date.title"), uid: "date", sortable: true },
  ];

  const getMyVoting = async (page: number = 1) => {
    setLoading(true);
    try {
      const req = await fetch(`/api/polls/react?page=${page}`);
      const data = await req.json();
      if (req.status === 200) {
        setReactions(data.data.reactions);
        setPages(data.data.last_page ?? 1);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMyVoting(page);
  }, [page]);

  const [filterValue, setFilterValue] = useState("");

  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "created_at",
    direction: "descending",
  });

  const hasSearchFilter = Boolean(filterValue);

  const filteredItems = useMemo(() => {
    let filtereItems = [...reactions];

    if (hasSearchFilter) {
      filtereItems = filtereItems.filter((react) =>
        react.poll.question.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    return filtereItems;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reactions, filterValue]);
  const items = filteredItems;

  const sortedItems = useMemo(() => {
    return [...items].sort((a: ReactionLog, b: ReactionLog) => {
      if (
        sortDescriptor.column !== "created_at" &&
        sortDescriptor.column !== "question"
      ) {
        return 0;
      }
      const first = a[
        sortDescriptor.column as keyof ReactionLog
      ] as unknown as number;
      const second = b[
        sortDescriptor.column as keyof ReactionLog
      ] as unknown as number;
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = useCallback(
    (reaction: ReactionLog, columnKey: Key) => {
      const cellValue = reaction[columnKey as keyof ReactionLog];
      switch (columnKey) {
        case "question":
          return (
            <Link
              title={reaction.poll.question}
              href={`/polls/${reaction.poll_id}`}
              target="_blank"
            >
              {reaction.poll.question}
            </Link>
          );
        case "date":
          return (
            <>
              {new Date(reaction.created_at).toLocaleString("en-US", {
                hour: "numeric",
                minute: "numeric",
                hour12: true,
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })}
            </>
          );
        case "reaction":
          return (
            <Chip
              variant="flat"
              color={reaction.reaction === "down" ? "danger" : "success"}
            >
              {reaction.reaction === "up"
                ? t("table.reaction.up")
                : t("table.reaction.down")}
            </Chip>
          );
        default:
          return cellValue !== undefined && typeof cellValue !== "object"
            ? cellValue
            : String(cellValue);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [reactions]
  );

  const onNextPage = useCallback(() => {
    if (page < pages) {
      setPage(page + 1);
    }
  }, [page, pages]);

  const onPreviousPage = useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
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
  }, [filterValue, onSearchChange, reactions.length, hasSearchFilter]);

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
            items={sortedItems}
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

export default MyReactions;
