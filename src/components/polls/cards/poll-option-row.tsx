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
            "inline-flex max-w-xl bg-gray-100 w-full m-0 transition-all",
            "hover:bg-gray-200 items-center justify-start",
            "cursor-pointer rounded-lg gap-1 p-2 border-1.5 border-transparent",
            "data-[selected=true]:border-primary overflow-hidden relative z-20"
          ),
          label: "w-full static",
        }}
        value={value}
      >
        <div
          className="h-[calc(100%+16px)] bg-blue-100 absolute -top-2 inset-e-0 -z-10"
          style={{
            width: `${percentage ?? 0}%`,
          }}
        ></div>
        <div className="w-full flex flex-row items-center gap-2 relative z-20 pe-10">
          <div
            className="flex-1 min-w-0 line-clamp-2"
            title={option}
          >
            {option}
          </div>
          {votersAreVisible && votersPreview && votersPreview.length > 0 && (
            <div
              className="flex items-center gap-1 cursor-pointer shrink-0"
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
                  count > 3 ? (
                    <span className="text-tiny text-default-500 ms-1">
                      +{count - 3}
                    </span>
                  ) : null
                }
              >
                {votersPreview.slice(0, 3).map((voter) => (
                  <Avatar
                    key={voter.id}
                    src={voter.avatar || undefined}
                    name={`${voter.name} ${voter.surname}`}
                    className="w-6 h-6"
                  />
                ))}
              </AvatarGroup>
            </div>
          )}
        </div>
        {percentage && percentage > 0 ? (
          <div className="absolute text-xs inset-e-2 top-1/2 -translate-y-1/2 z-30">
            {percentage}%
          </div>
        ) : (
          ""
        )}
      </Checkbox>
    </>
  );
};

export default PollOptionRow;
