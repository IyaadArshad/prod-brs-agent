import { Loader2, Check } from "lucide-react"

interface StatusIndicatorProps {
  status: "loading" | "done"
  loadingText: string
  doneText: string
}

export function StatusIndicator({ status, loadingText, doneText }: StatusIndicatorProps) {
  return (
    <div
      className={`flex items-center gap-2 bg-[#2f2f2f] text-[#e4e4e7] px-3 py-2 
      relative overflow-hidden`}
      style={{ 
      border: '1px solid #444444!important',
      borderRadius: status === "done" ? '8px!important' : '9999px!important',
      maxWidth: "24rem"
      }}
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
        0% { transform: scale(0); opacity: 0; }
        70% { transform: scale(1.2); opacity: 1; }
        100% { transform: scale(1); opacity: 1; }
      }
      .check-pop {
        animation: checkPop 0.4s ease-out forwards;
      }
      `}</style>
    </div>
  )
}