"use client";

import { PollVoter, PollVotersResponse } from "@/lib/types/polls";
import { Avatar, Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Spinner } from "@heroui/react";
import { useTranslations } from "next-intl";
import { FC, useEffect, useState } from "react";

interface VotersModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  optionId: string | null;
  optionText: string;
}

/**
 * Inner component that handles data fetching for a single option.
 * Re-mounting via `key` resets all state automatically.
 */
const VotersContent: FC<{
  optionId: string;
  optionText: string;
  onClose: () => void;
}> = ({ optionId, optionText, onClose }) => {
  const t = useTranslations("polls");
  const [voters, setVoters] = useState<PollVoter[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Fetch first page on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/polls/voters?poll_option_id=${optionId}&page=1`);
        if (res.ok && !cancelled) {
          const json: PollVotersResponse = await res.json();
          const payload = json.data;
          setVoters(payload.data);
          setPage(payload.current_page);
          setLastPage(payload.last_page);
          setTotal(payload.total);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setInitialLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [optionId]);

  const loadMore = async () => {
    if (page >= lastPage || loading) return;
    const nextPage = page + 1;
    setLoading(true);
    try {
      const res = await fetch(`/api/polls/voters?poll_option_id=${optionId}&page=${nextPage}`);
      if (res.ok) {
        const json: PollVotersResponse = await res.json();
        const payload = json.data;
        setVoters((prev) => [...prev, ...payload.data]);
        setPage(payload.current_page);
        setLastPage(payload.last_page);
        setTotal(payload.total);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ModalHeader className="flex flex-col gap-1">
        <h3 className="text-lg font-medium">{t("voters.title")}</h3>
        <p className="text-default-500 text-sm font-normal">{optionText}</p>
        {!initialLoading && (
          <p className="text-default-400 text-xs font-normal">{t("voters.total", { count: total })}</p>
        )}
      </ModalHeader>
      <ModalBody>
        {initialLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : voters.length === 0 ? (
          <p className="text-default-500 py-4 text-center">{t("voters.noVoters")}</p>
        ) : (
          <div className="space-y-3">
            {voters.map((voter) => (
              <div
                key={voter.id}
                className="hover:bg-default-100 flex items-center gap-3 rounded-lg p-2 transition-colors"
              >
                <Avatar src={voter.avatar || undefined} name={`${voter.name} ${voter.surname}`} size="sm" />
                <span className="text-sm font-medium">
                  {voter.name} {voter.surname}
                </span>
              </div>
            ))}
            {page < lastPage && (
              <div className="flex justify-center pt-2">
                <Button size="sm" variant="flat" onPress={loadMore} isLoading={loading}>
                  {t("voters.loadMore")}
                </Button>
              </div>
            )}
          </div>
        )}
      </ModalBody>
      <ModalFooter className="flex justify-start">
        <Button onPress={onClose} color="danger">
          {t("close")}
        </Button>
      </ModalFooter>
    </>
  );
};

const VotersModal: FC<VotersModalProps> = ({ isOpen, onOpenChange, optionId, optionText }) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} scrollBehavior="inside">
      <ModalContent>
        {(onClose) =>
          optionId ? (
            <VotersContent key={optionId} optionId={optionId} optionText={optionText} onClose={onClose} />
          ) : null
        }
      </ModalContent>
    </Modal>
  );
};

export default VotersModal;
