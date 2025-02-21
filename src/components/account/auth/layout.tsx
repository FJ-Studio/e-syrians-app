import { HTMLProps, PropsWithChildren } from "react";

type Props = HTMLProps<HTMLDivElement> & PropsWithChildren;
export default function AuthLayout({ children, ...rest }: Props) {
  return (
    <div
      className="flex min-h-[calc(100dvh-148px)] overflow-hidden pt-16 sm:py-20 items-center"
      {...rest}
    >
      <div className="mx-auto flex w-full max-w-2xl flex-col px-4 sm:px-6">
        <div className="relative mt-12 sm:mt-16">
          <svg
            viewBox="0 0 1090 1090"
            aria-hidden="true"
            fill="none"
            preserveAspectRatio="none"
            width="1090"
            height="1090"
            className="absolute -top-7 left-1/2 -z-10 h-[788px] -translate-x-1/2 stroke-gray-300/30 [mask-image:linear-gradient(to_bottom,white_20%,transparent_75%)] sm:-top-9 sm:h-auto"
          >
            <circle cx={545} cy={545} r="544.5" />
            <circle cx={545} cy={545} r="480.5" />
            <circle cx={545} cy={545} r="416.5" />
            <circle cx={545} cy={545} r="352.5" />
          </svg>
        </div>
        <div className="-mx-4 mt-10 flex-auto bg-white px-4 py-10 shadow-2xl shadow-gray-900/10 sm:mx-0 sm:flex-none sm:rounded-3xl sm:p-20">
          {children}
        </div>
      </div>
    </div>
  );
}
