import { ChevronDown, RotateCcw } from "lucide-react";
import {
  CopyIcon,
  NextVersionIcon,
  PreviousVersionIcon,
  ShareIcon,
} from "@/app/icons/documentHeader";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface DocumentHeaderProps {
  documentName: string;
  onClose: () => void;
  onMoveSide: () => void;
  moveLabel: string;
}

export function DocumentHeader({
  documentName,
  onClose,
  onMoveSide,
  moveLabel,
}: DocumentHeaderProps) {
  return (
    <header className="flex h-14 flex-none border-none items-center justify-between gap-1 px-3 border-b border-border">
      <div className="flex flex-1 basis-0 items-center gap-1 truncate leading-[0]">
        <DropdownMenu>
          <DropdownMenuTrigger className="grid grid-cols-[1fr_auto] items-center rounded-lg p-1 hover:bg-[#424242] text-left">
            <h2 className="max-w-[270px] overflow-hidden truncate text-lg text-gray-100 pr-2 pl-3">
              {documentName}
            </h2>
            <div className="flex items-center pr-1">
              <ChevronDown className="h-5 w-5" style={{ color: '#b4b4b4' }} />
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
          <button className="h-10 rounded-lg px-2 text-muted-foreground hover:bg-muted focus-visible:outline-0 transition-colors">
            <RotateCcw className="h-6 w-6" />
          </button>

          <button
            disabled
            className="h-10 rounded-lg px-2 text-muted-foreground/40 focus-visible:outline-0"
          >
            <PreviousVersionIcon />
          </button>

          <button
            disabled
            className="h-10 rounded-lg px-2 text-muted-foreground/40 focus-visible:outline-0"
          >
            <NextVersionIcon />
          </button>
        </div>

        <button className="h-10 rounded-lg px-2 text-muted-foreground hover:bg-muted focus-visible:outline-0">
          <CopyIcon />
        </button>

        <button className="h-10 rounded-lg px-2 text-muted-foreground hover:bg-muted focus-visible:outline-0">
          <ShareIcon />
        </button>
      </div>
    </header>
  );
}
