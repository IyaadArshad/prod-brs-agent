import { StatusIndicatorProps } from "@/types/types";
import { Check, Loader2 } from "lucide-react";

export function StatusIndicator({
  status,
  loadingText,
  doneText,
}: StatusIndicatorProps) {
  return (
    <div
      className={`flex function-call items-center gap-2 bg-[#2f2f2f] border border-[#444444] text-[#e4e4e7] px-3 py-2 
        ${status === "done" ? "rounded-xl" : "rounded-full"}
        relative overflow-hidden`}
    >
      <div className="relative z-10 flex items-center gap-2">
        {status === "done" ? (
          <>
            <Check className="h-4 w-4 text-green-500" />
            <span className="text-sm">{doneText}</span>
          </>
        ) : (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">{loadingText}</span>
          </>
        )}
      </div>
      <style jsx global>{`
        @keyframes checkPop {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          70% {
            transform: scale(1.2);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .check-pop {
          animation: checkPop 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}