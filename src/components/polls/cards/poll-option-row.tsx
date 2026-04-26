import { PollVoter } from "@/lib/types/polls";
import { Avatar, AvatarGroup, Checkbox, cn } from "@heroui/react";
import { FC } from "react";

type Props = {
  value: string;
  option: string;
  percentage?: number;
  votersPreview?: PollVoter[];
  votersAreVisible?: boolean;
  votesCount?: number;
  onShowVoters?: () => void;
};

const PollOptionRow: FC<Props> = ({
  option,
  percentage,
  value,
  votersPreview,
  votersAreVisible,
  votesCount,
  onShowVoters,
}) => {
  return (
    <>
      <Checkbox
        classNames={{
          base: cn(
            "inline-flex max-w-xl bg-default-100 w-full m-0 transition-all",
            "hover:bg-default-200 items-center justify-start",
            "cursor-pointer rounded-lg gap-1 p-2 border-1.5 border-transparent",
            "data-[selected=true]:border-primary overflow-hidden relative z-20",
          ),
          label: "w-full static",
        }}
        value={value}
      >
        <div
          className="absolute inset-e-0 -top-2 -z-10 h-[calc(100%+16px)] bg-blue-100 dark:bg-blue-900"
          style={{
            width: `${percentage ?? 0}%`,
          }}
        ></div>
        <div className="relative z-20 flex w-full flex-row items-center gap-2 pe-10">
          <div className="line-clamp-2 min-w-0 flex-1" title={option}>
            {option}
          </div>
          {votersAreVisible && votersPreview && votersPreview.length > 0 && (
            <div
              className="flex shrink-0 cursor-pointer items-center gap-1"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onShowVoters?.();
              }}
            >
              <AvatarGroup
                size="sm"
                max={3}
                total={votesCount ?? votersPreview.length}
                renderCount={(count) =>
                  count > 3 ? <span className="text-tiny text-default-500 ms-1">+{count - 3}</span> : null
                }
              >
                {votersPreview.slice(0, 3).map((voter) => (
                  <Avatar
                    key={voter.id}
                    src={voter.avatar || undefined}
                    name={`${voter.name} ${voter.surname}`}
                    className="h-6 w-6"
                  />
                ))}
              </AvatarGroup>
            </div>
          )}
        </div>
        {percentage && percentage > 0 ? (
          <div className="absolute inset-e-2 top-1/2 z-30 -translate-y-1/2 text-xs">{percentage}%</div>
        ) : (
          ""
        )}
      </Checkbox>
    </>
  );
};

export default PollOptionRow;
