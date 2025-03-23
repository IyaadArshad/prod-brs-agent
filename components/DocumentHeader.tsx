import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

interface DocumentHeaderProps {
  documentName: string;
  onClose: () => void;
  onMoveSide: () => void;
  moveLabel: string;
  documentContent?: string;
}

function ShareIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="icon-xl-heavy"
    >
      <path
        d="M6.66669 6.66671L10 3.33337L13.3334 6.66671M10 3.75004V12.5"
        stroke="#e3e3e3"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M3.33331 11.6666V11.8666C3.33331 13.5468 3.33331 14.3869 3.66029 15.0286C3.94791 15.5931 4.40686 16.052 4.97134 16.3396C5.61308 16.6666 6.45316 16.6666 8.13331 16.6666H11.8666C13.5468 16.6666 14.3869 16.6666 15.0286 16.3396C15.5931 16.052 16.052 15.5931 16.3397 15.0286C16.6666 14.3869 16.6666 13.5468 16.6666 11.8666V11.6666"
        stroke="#e3e3e3"
        strokeWidth="1.5"
        strokeLinecap="round"
      ></path>
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="#e3e3e3"
      xmlns="http://www.w3.org/2000/svg"
      className="icon-xl-heavy"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7 5C7 3.34315 8.34315 2 10 2H19C20.6569 2 22 3.34315 22 5V14C22 15.6569 20.6569 17 19 17H17V19C17 20.6569 15.6569 22 14 22H5C3.34315 22 2 20.6569 2 19V10C2 8.34315 3.34315 7 5 7H7V5ZM9 7H14C15.6569 7 17 8.34315 17 10V15H19C19.5523 15 20 14.5523 20 14V5C20 4.44772 19.5523 4 19 4H10C9.44772 4 9 4.44772 9 5V7ZM5 9C4.44772 9 4 9.44772 4 10V19C4 19.5523 4.44772 20 5 20H14C14.5523 20 15 19.5523 15 19V10C15 9.44772 14.5523 9 14 9H5Z"
        fill="#e3e3e3"
      ></path>
    </svg>
  );
}

function NextVersionIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="#e3e3e3"
      xmlns="http://www.w3.org/2000/svg"
      className="icon-xl-heavy"
    >
      <path
        d="M3 13.6647C3 12.3976 3.26992 11.2826 3.80973 10.3199C4.35574 9.35091 5.13444 8.59626 6.14582 8.05587C7.16341 7.51548 8.37334 7.24535 9.77563 7.24535H15.3506L18.6732 7.39445L18.2917 8.00926L15.937 6.0528L13.7684 3.92857C13.6629 3.82299 13.576 3.70497 13.5078 3.57454C13.4457 3.4379 13.4147 3.28261 13.4147 3.1087C13.4147 2.78572 13.517 2.52175 13.7218 2.31678C13.9328 2.1056 14.209 2 14.5501 2C14.8666 2 15.1427 2.11801 15.3785 2.35404L20.637 7.54342C20.7549 7.65531 20.8449 7.78888 20.907 7.94411C20.969 8.09321 21 8.24845 21 8.40995C21 8.56519 20.969 8.72056 20.907 8.8758C20.8449 9.0249 20.7549 9.1522 20.637 9.25782L15.3785 14.4472C15.1427 14.6894 14.8666 14.8106 14.5501 14.8106C14.209 14.8106 13.9328 14.705 13.7218 14.4938C13.517 14.2826 13.4147 14.0155 13.4147 13.6926C13.4147 13.5187 13.4457 13.3664 13.5078 13.236C13.576 13.1056 13.6629 12.9876 13.7684 12.8819L15.937 10.7577L18.2917 8.80125L18.6732 9.41619L15.3506 9.56516H9.77563C8.82007 9.56516 8.00726 9.73607 7.33714 10.0776C6.66702 10.4193 6.15513 10.8944 5.80146 11.5031C5.45399 12.1118 5.28026 12.8075 5.28026 13.5901C5.28026 14.3851 5.45399 15.0901 5.80146 15.7049C6.15513 16.3136 6.66702 16.795 7.33714 17.1491C8.00726 17.5032 8.82007 17.6801 9.77563 17.6801H11.9627C12.3041 17.6801 12.5833 17.792 12.8005 18.0155C13.0238 18.2391 13.1355 18.5124 13.1355 18.8354C13.1355 19.1584 13.0238 19.4317 12.8005 19.6553C12.5833 19.8851 12.3041 20 11.9627 20H9.66399C8.28026 20 7.08895 19.736 6.08999 19.208C5.09722 18.6863 4.33403 17.9503 3.80043 17C3.26681 16.0559 3 14.9442 3 13.6647Z"
        fill="#e3e3e3"
      ></path>
    </svg>
  );
}

function PreviousVersionIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="#e3e3e3"
      xmlns="http://www.w3.org/2000/svg"
      className="icon-xl-heavy"
    >
      <path
        d="M21 13.6647C21 14.9442 20.7333 16.0559 20.1996 17C19.666 17.9503 18.8997 18.6863 17.9008 19.208C16.908 19.736 15.7198 20 14.3361 20H12.0372C11.696 20 11.4137 19.8851 11.1902 19.6553C10.9669 19.4317 10.8553 19.1584 10.8553 18.8354C10.8553 18.5124 10.9669 18.2391 11.1902 18.0155C11.4137 17.792 11.696 17.6801 12.0372 17.6801H14.2245C15.18 17.6801 15.9897 17.5032 16.6535 17.1491C17.3237 16.795 17.8325 16.3136 18.1799 15.7049C18.5336 15.0901 18.7105 14.3851 18.7105 13.5901C18.7105 12.8075 18.5336 12.1118 18.1799 11.5031C17.8325 10.8944 17.3237 10.4193 16.6535 10.0776C15.9897 9.73607 15.18 9.56516 14.2245 9.56516H8.64014L5.3268 9.41619L5.70838 8.80125L8.05379 10.7577L10.2316 12.8819C10.331 12.9876 10.4116 13.1056 10.4737 13.236C10.5419 13.3664 10.5761 13.5187 10.5761 13.6926C10.5761 14.0155 10.4705 14.2826 10.2596 14.4938C10.0549 14.705 9.78176 14.8106 9.44056 14.8106C9.13032 14.8106 8.85421 14.6894 8.61223 14.4472L3.36299 9.25782C3.2451 9.1522 3.15513 9.0249 3.09307 8.8758C3.03103 8.72056 3 8.56519 3 8.40995C3 8.24845 3.03103 8.09321 3.09307 7.94411C3.15513 7.78888 3.2451 7.65531 3.36299 7.54342L8.61223 2.35404C8.85421 2.11801 9.13032 2 9.44056 2C9.78176 2 10.0549 2.1056 10.2596 2.31678C10.4705 2.52175 10.5761 2.78572 10.5761 3.1087C10.5761 3.28261 10.5419 3.4379 10.4737 3.57454C10.4116 3.70497 10.331 3.82299 10.2316 3.92857L8.05379 6.0528L5.70838 8.00926L5.3268 7.39445L8.64014 7.24535H14.2245C15.6267 7.24535 16.8335 7.51548 17.8449 8.05587C18.8624 8.59626 19.6412 9.35091 20.1811 10.3199C20.727 11.2826 21 12.3976 21 13.6647Z"
        fill="#e3e3e3"
      ></path>
    </svg>
  );
}

function DropdownIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="#e3e3e3"
      xmlns="http://www.w3.org/2000/svg"
      className="icon-md text-token-text-tertiary"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.29289 9.29289C5.68342 8.90237 6.31658 8.90237 6.70711 9.29289L12 14.5858L17.2929 9.29289C17.6834 8.90237 18.3166 8.90237 18.7071 9.29289C19.0976 9.68342 19.0976 10.3166 18.7071 10.7071L12.7071 16.7071C12.5196 16.8946 12.2652 17 12 17C11.7348 17 11.4804 16.8946 11.2929 16.7071L5.29289 10.7071C4.90237 10.3166 4.90237 9.68342 5.29289 9.29289Z"
        fill="#e3e3e3"
      ></path>
    </svg>
  );
}

function VersionHistoryIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="icon-xl-heavy"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4 5.99929V4.5C4 3.94772 3.55228 3.5 3 3.5C2.44772 3.5 2 3.94772 2 4.5V9C2 9.55228 2.44772 10 3 10H7C7.55228 10 8 9.55228 8 9C8 8.44772 7.55228 8 7 8H5.07004C6.4544 5.60707 9.04034 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C8.194 20 5.0066 17.3412 4.19823 13.7787C4.07601 13.2401 3.54032 12.9026 3.00173 13.0248C2.46314 13.147 2.12559 13.6827 2.24781 14.2213C3.25835 18.6747 7.23965 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C8.72759 2 5.82361 3.57195 4 5.99929ZM12 6C12.5523 6 13 6.44772 13 7V12C13 12.2652 12.8946 12.5196 12.7071 12.7071L10.2071 15.2071C9.81658 15.5976 9.18342 15.5976 8.79289 15.2071C8.40237 14.8166 8.40237 14.1834 8.79289 13.7929L11 11.5858V7C11 6.44772 11.4477 6 12 6Z"
        fill="currentColor"
      ></path>
    </svg>
  );
}

const IconButton = ({
  children,
  ariaLabel,
  disabled = false,
  onClick,
}: {
  children: React.ReactNode;
  ariaLabel: string;
  disabled?: boolean;
  onClick?: () => void;
}) => {
  return (
    <div className="relative flex items-center justify-center">
      <button
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={onClick}
        className={`group relative h-10 rounded-lg px-2 text-[#e3e3e3] hover:bg-[#4e4e4e] focus-visible:outline-0 ${
          disabled ? "opacity-40 cursor-not-allowed" : "transition-colors"
        }`}
      >
        {children}
      </button>
      <div className="absolute bottom-0 left-1/2 hidden -translate-x-1/2 translate-y-full p-1 rounded text-xs bg-zinc-800 text-zinc-100 group-hover:block">
        {ariaLabel}
      </div>
    </div>
  );
};

export function DocumentHeader({
  documentName,
  onClose,
  onMoveSide,
  moveLabel,
  documentContent = "",
}: DocumentHeaderProps) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  const handleCopy = async () => {
    if (!documentContent) return;
    
    try {
      await navigator.clipboard.writeText(documentContent);
      setCopyStatus("copied");
      // Reset status after 2 seconds
      setTimeout(() => setCopyStatus("idle"), 2000);
    } catch (error) {
      console.error("Failed to copy document content:", error);
      setCopyStatus("error");
      setTimeout(() => setCopyStatus("idle"), 2000);
    }
  };

  return (
    <header className="sticky top-0 flex bg-[#2f2f2f] h-14 flex-none border-none items-center justify-between gap-1 px-3">
      <div className="flex flex-1 basis-0 items-center gap-1 truncate leading-[0]">
        <DropdownMenu>
          <DropdownMenuTrigger className="grid grid-cols-[1fr_auto] items-center rounded-lg p-1 hover:bg-[#424242] text-left">
            <h1 className="max-w-[290px] overflow-hidden truncate text-xl font-sans text-gray-100 pr-2 pl-3">
              {documentName}
            </h1>
            <div className="flex items-center pr-1">
              <DropdownIcon />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={onClose}>
              Close {documentName}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onMoveSide}>
              {moveLabel}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex min-w-0 basis-auto select-none items-center gap-1.5 leading-[0]">
        <div className="flex items-center gap-1.5">
          <IconButton ariaLabel="Version History">
            <VersionHistoryIcon />
          </IconButton>

          <IconButton ariaLabel="Previous Version" disabled>
            <PreviousVersionIcon />
          </IconButton>

          <IconButton ariaLabel="Next Version" disabled>
            <NextVersionIcon />
          </IconButton>
        </div>

        <div className="relative">
          <IconButton ariaLabel={copyStatus === "copied" ? "Copied!" : "Copy as Markdown"} onClick={handleCopy}>
            <CopyIcon />
          </IconButton>
          {copyStatus === "copied" && (
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-green-800 text-white text-xs px-2 py-1 rounded z-50">
              Copied!
            </div>
          )}
          {copyStatus === "error" && (
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-red-800 text-white text-xs px-2 py-1 rounded z-50">
              Failed to copy
            </div>
          )}
        </div>

        <IconButton ariaLabel="Share">
          <ShareIcon />
        </IconButton>
      </div>
    </header>
  );
}