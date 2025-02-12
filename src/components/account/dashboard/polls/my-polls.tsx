"use client";
import capitalize from "@/lib/capitalize";
import { Poll } from "@/lib/types/polls";
import {
  ChevronDownIcon,
  EllipsisVerticalIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";
import {
  Button,
  Card,
  CardBody,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Pagination,
  Selection,
  SortDescriptor,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  ChangeEvent,
  FC,
  Key,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

const MyPolls: FC = () => {
  const [polls, setPolls] = useState<Array<Poll>>([]);
  const t = useTranslations("account.dashboard.polls.my_polls");
  const columns = [
    { name: t("table.question.title"), uid: "question", sortable: true },
    { name: t("table.startDate.title"), uid: "start_date", sortable: true },
    { name: t("table.endDate.title"), uid: "end_date", sortable: true },

    { name: t("table.createdAt.title"), uid: "created_at", sortable: true },
    { name: t("table.status.title"), uid: "status", sortable: false },
    { name: t("table.actions.title"), uid: "actions", sortable: false },
  ];

  const statusOptions = [
    { name: t("table.status.active.title"), uid: "active" },
    { name: t("table.status.inactive.title"), uid: "inactive" },
  ];

  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setDeleting(false);
    return;
    try {
      fetch(`/api/brokers`)
        .then((res) => res.json())
        .then((data) => setPolls(data.data));
    } catch (error) {
      console.error(error);
    }
  }, []);
  const [filterValue, setFilterValue] = useState("");
  const [visibleColumns, setVisibleColumns] = useState<Selection>(
    new Set(columns.map((column) => column.uid))
  );
  const [statusFilter, setStatusFilter] = useState<Selection>("all");
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "age",
    direction: "ascending",
  });

  const [page, setPage] = useState(1);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filtereItems = [...polls];

    if (hasSearchFilter) {
      filtereItems = filtereItems.filter((poll) =>
        poll.question.toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    if (
      statusFilter !== "all" &&
      Array.from(statusFilter).length !== statusOptions.length
    ) {
      filtereItems = filtereItems.filter((poll) =>
        Array.from(statusFilter).includes(
          poll.deletion_reason ? "active" : "inactive"
        )
      );
    }

    return filtereItems;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [polls, filterValue, statusFilter]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a: Poll, b: Poll) => {
      const first = a[sortDescriptor.column as keyof Poll] as number;
      const second = b[sortDescriptor.column as keyof Poll] as number;
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

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

        case "status":
          return <>status</>;
        case "actions":
          return (
            <div className="relative flex justify-end items-center gap-2">
              <Dropdown>
                <DropdownTrigger>
                  <Button isIconOnly size="sm" variant="light">
                    <EllipsisVerticalIcon className="text-default-300" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu disabledKeys={deleting ? ["delete"] : []}>
                  <DropdownItem key={"delete"}>Delete</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          );
        default:
          return cellValue !== undefined && typeof cellValue !== "object"
            ? cellValue
            : String(cellValue);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [polls]
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

  const onRowsPerPageChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setRowsPerPage(Number(e.target.value));
      setPage(1);
    },
    []
  );

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
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<ChevronDownIcon className="text-small size-4" />}
                  variant="flat"
                >
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
                <Button
                  endContent={
                    <ChevronDownIcon className="text-small  size-4" />
                  }
                  variant="flat"
                >
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
  }, [
    filterValue,
    statusFilter,
    visibleColumns,
    onSearchChange,
    onRowsPerPageChange,
    polls.length,
    hasSearchFilter,
  ]);

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
      <CardBody>
        <h2 className="text-xl font-medium text-default-700 text-start">
          {t("title")}
        </h2>
        <p className="text-default-500 mb-6 text-start">{t("description")}</p>
        <Table
          isHeaderSticky
          isStriped
          classNames={{
            wrapper: "max-h-[800px]",
          }}
          topContent={topContent}
          topContentPlacement="outside"
          bottomContent={bottomContent}
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
            items={sortedItems}
          >
            {(item) => (
              <TableRow key={item.id}>
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

export default MyPolls;
