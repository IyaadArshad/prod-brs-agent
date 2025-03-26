import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle
} from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { DialogClose } from '@radix-ui/react-dialog';
import { DialogHeader } from './ui/dialog';

interface VersionHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  versions: Record<string, string> | null;
  currentVersion: number;
  onSelectVersion: (version: number) => void;
  documentName: string;
}

export function VersionHistoryDialog({
  isOpen,
  onClose,
  versions,
  currentVersion,
  onSelectVersion,
  documentName
}: VersionHistoryDialogProps) {
  if (!versions) return null;
  
  // Convert versions object keys to numbers and sort in descending order
  const sortedVersions = Object.keys(versions)
    .map(key => parseInt(key))
    .sort((a, b) => b - a);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#2f2f2f] text-white border-[#4e4e4e] max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold mb-2">
            Version History - {documentName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="max-h-[60vh] overflow-y-auto pr-2">
          {sortedVersions.length === 0 ? (
            <div className="py-4 text-center text-gray-400">
              No version history available
            </div>
          ) : (
            <div className="space-y-3">
              {sortedVersions.map((version) => (
                <div 
                  key={version}
                  className={`p-4 rounded-lg cursor-pointer transition-colors ${
                    version === currentVersion 
                      ? "bg-[#4e4e4e] border border-[#6e6e6e]" 
                      : "bg-[#363636] hover:bg-[#444444]"
                  }`}
                  onClick={() => onSelectVersion(version)}
                >
                  <div className="flex justify-between items-center">
                    <div className="font-medium">
                      Version {version}
                      {version === currentVersion && " (Current)"}
                    </div>
                    {/* Could add timestamp here if available in the API response */}
                  </div>
                  <div className="mt-2 text-sm text-gray-300 line-clamp-2">
                    {versions[version.toString()].substring(0, 100)}
                    {versions[version.toString()].length > 100 ? "..." : ""}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <DialogClose asChild>
            <Button variant="secondary" className="bg-[#4e4e4e] hover:bg-[#5a5a5a] text-white">
              Close
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
