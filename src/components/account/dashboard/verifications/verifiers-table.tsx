"use client";
import useVerificationCancelationReason from "@/components/hooks/localization/verification-cancelation-reason";
import { ibm } from "@/lib/fonts/fonts";
import { ESUser, Verification } from "@/lib/types/account";
import { getUrl } from "@/lib/user";
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Snippet,
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
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { FC, Key, useCallback, useEffect, useMemo, useState } from "react";

const VerifiersTable: FC = () => {
  const session = useSession();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Verification[]>([]);
  const t = useTranslations("account.dashboard.verifications.verifiers-table");
  const cancellationReasons = useVerificationCancelationReason();
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "date",
    direction: "descending",
  });

  useEffect(() => {
    console.log("sortDescriptor", sortDescriptor);
  }, [sortDescriptor]);

  const columns = [
    { name: t("name.title"), uid: "name", sortable: true },
    { name: t("date.title"), uid: "date", sortable: true },
    { name: t("table.status.title"), uid: "status", sortable: false },
    { name: t("table.notes.title"), uid: "notes", sortable: false },
  ];

  const getVerifiers = async () => {
    setLoading(true);
    const req = await fetch("/api/account/verifications/verifiers");
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
        first = `${a.verifier.name} ${a.verifier.surname}`;
        second = `${b.verifier.name} ${b.verifier.surname}`;
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
                src: item.verifier.avatar,
                className: "min-w-10 min-h-10",
              }}
              name={`${item.verifier.name} ${item.verifier.surname}`}
            />
          );
        case "notes":
          if (!item.cancelled_at) {
            return <></>;
          }
          return (
            <div className="min-w-36">
              {cancellationReasons(item.cancelation_payload?.reason ?? "")}
            </div>
          );
        case "status":
          return (
            <Chip
              variant="flat"
              size="sm"
              color={item.cancelled_at ? "danger" : "success"}
            >
              {item.cancelled_at
                ? t("status.cancelled.title")
                : t("status.active.title")}
            </Chip>
          );
        default:
          return cellValue !== undefined && typeof cellValue !== "object"
            ? cellValue
            : String(cellValue);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items]
  );

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg text-default-700 font-medium">{t("title")}</h3>
      </CardHeader>
      <CardBody>
        <Table
          isHeaderSticky
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
              <div className="py-12 px-2 flex items-center justify-center flex-col gap-4">
                <p>{t("noVerifiers")}</p>
                <Snippet
                  hideSymbol
                  classNames={{
                    pre: `${ibm.className}`,
                  }}
                  codeString={getUrl(session.data?.user as ESUser)}
                >
                  {t("copyProfileUrl")}
                </Snippet>
              </div>
            }
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

export default VerifiersTable;
