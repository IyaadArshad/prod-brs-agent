import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  documentName: string;
}

export function ShareDialog({ isOpen, onClose, documentName }: ShareDialogProps) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");
  
  // Create a URL-friendly slug from the document name
  // Use the document name directly without modifications
  const shareUrl = `https://brs-agent.datamation.lk/shared/canvas/${documentName}`;
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyStatus("copied");
      setTimeout(() => setCopyStatus("idle"), 2000);
    } catch (error) {
      console.error("Failed to copy URL:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#2f2f2f] border-[#444444] text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium text-white">
            Share '{documentName.replace(/\.\w+$/, "")}'
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          <div className="flex items-center bg-[#1e1e1e] rounded-lg overflow-hidden pr-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 bg-transparent border-none py-3 pl-4 pr-2 text-sm text-white focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="ml-2 py-1.5 px-3 rounded-md bg-[#15847e] hover:bg-[#10655e] transition-colors text-white text-sm font-medium"
            >
              {copyStatus === "copied" ? "Copied!" : "Copy"}
            </button>
          </div>
          
          <p className="text-sm text-gray-300">
            Anyone with the link can view and edit. Your chat messages will not be shared.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
