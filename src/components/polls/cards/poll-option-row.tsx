import { Checkbox, cn } from "@heroui/react";
import { FC } from "react";

type Props = {
  value: string;
  option: string;
  percentage?: number;
};

const PollOptionRow: FC<Props> = ({ option, percentage, value }) => {
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
          className="h-[calc(100%+16px)] bg-blue-100 absolute -top-2 left-0 -z-10"
          style={{
            width: `${percentage ?? 0}%`,
          }}
        ></div>
        <div
          className="w-full flex justify-between relative z-20 line-clamp-2"
          title={option}
        >
          {option}
        </div>
      </Checkbox>
    </>
  );
};

export default PollOptionRow;
