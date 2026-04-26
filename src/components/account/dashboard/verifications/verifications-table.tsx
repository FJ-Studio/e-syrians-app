"use client";
import useVerificationCancelationReason from "@/components/hooks/localization/verification-cancelation-reason";
import { Verification } from "@/lib/types/account";
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  SortDescriptor,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  User,
} from "@heroui/react";
import { useTranslations } from "next-intl";
import { FC, Key, useCallback, useEffect, useMemo, useState } from "react";

const VerificationsTable: FC = () => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Verification[]>([]);
  const t = useTranslations("account.dashboard.verifications.verifications-table");
  const cancellationReasons = useVerificationCancelationReason();
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "date",
    direction: "descending",
  });
  const columns = [
    { name: t("name.title"), uid: "name", sortable: true },
    { name: t("date.title"), uid: "date", sortable: true },
    { name: t("table.status.title"), uid: "status", sortable: false },
    { name: t("table.notes.title"), uid: "notes", sortable: false },
  ];

  const getVerifiers = async () => {
    setLoading(true);
    const req = await fetch("/api/account/verifications/verifications");
    if (req.ok) {
      const data = await req.json();
      setItems(data.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    getVerifiers();
  }, []);

  const sortedItems = useMemo(() => {
    return [...items].sort((a: Verification, b: Verification) => {
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
  }, [sortDescriptor, items]);

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
        case "notes":
          if (!item.cancelled_at) {
            return <></>;
          }
          return <div className="min-w-36">{cancellationReasons(item.cancelation_payload?.reason ?? "")}</div>;
        case "status":
          return (
            <Chip variant="flat" size="sm" color={item.cancelled_at ? "danger" : "success"}>
              {item.cancelled_at ? t("status.cancelled.title") : t("status.active.title")}
            </Chip>
          );
        default:
          return cellValue !== undefined && typeof cellValue !== "object" ? cellValue : String(cellValue);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items],
  );

  return (
    <Card>
      <CardHeader>
        <h3 className="text-default-700 text-lg font-medium">{t("title")}</h3>
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
                align={column.uid === "actions" ? "center" : "start"}
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
  );
};

export default VerificationsTable;
