"use client";

import { PollVoter, PollVotersResponse } from "@/lib/types/polls";
import { Avatar, Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Spinner } from "@heroui/react";
import { useTranslations } from "next-intl";
import { FC, useCallback, useEffect, useState } from "react";

interface VotersModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  optionId: string | null;
  optionText: string;
}

const VotersModal: FC<VotersModalProps> = ({ isOpen, onOpenChange, optionId, optionText }) => {
  const t = useTranslations("polls");
  const [voters, setVoters] = useState<PollVoter[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const fetchVoters = useCallback(
    async (pageNum: number, append = false) => {
      if (!optionId) return;

      setLoading(true);
      try {
        const res = await fetch(`/api/polls/voters?poll_option_id=${optionId}&page=${pageNum}`);
        if (res.ok) {
          const json: PollVotersResponse = await res.json();
          const payload = json.data;
          setVoters((prev) => (append ? [...prev, ...payload.data] : payload.data));
          setPage(payload.current_page);
          setLastPage(payload.last_page);
          setTotal(payload.total);
        }
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    },
    [optionId],
  );

  // Reset and fetch when modal opens with a new option
  useEffect(() => {
    if (isOpen && optionId) {
      setVoters([]);
      setPage(1);
      setLastPage(1);
      setTotal(0);
      setInitialLoading(true);
      fetchVoters(1);
    }
  }, [isOpen, optionId, fetchVoters]);

  const loadMore = () => {
    if (page < lastPage && !loading) {
      fetchVoters(page + 1, true);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} scrollBehavior="inside">
      <ModalContent>
        {(onClose) => (
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
        )}
      </ModalContent>
    </Modal>
  );
};

export default VotersModal;
