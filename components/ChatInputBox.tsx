import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendHorizontal, Square, Upload, Search } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ReasonIcon as BrainCircuit } from "@/app/icons/reason";

interface ChatInputBoxProps {
  message: string;
  setMessage: (message: string) => void;
  handleSendMessage: () => void;
  handleStopRequest: () => void;
  isStreaming: boolean;
  commandFilter?: string;
  setCommandFilter?: (filter: string) => void;
  selectedButtons?: {
    search: boolean;
    reason: boolean;
  };
  setSelectedButtons?: (buttons: { search: boolean; reason: boolean }) => void;
  centerAlignment?: boolean;
}

export const ChatInputBox: React.FC<ChatInputBoxProps> = ({
  message,
  setMessage,
  handleSendMessage,
  handleStopRequest,
  isStreaming,
  commandFilter,
  setCommandFilter,
  selectedButtons = { search: false, reason: false },
  setSelectedButtons,
  centerAlignment = false,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey && message.trim()) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    if (setCommandFilter && e.target.value.startsWith("/")) {
      setCommandFilter(e.target.value.slice(1));
    } else if (setCommandFilter) {
      setCommandFilter("");
    }
  };

  // Simple version for the welcome screen with center alignment
  if (centerAlignment) {
    return (
      <div className="w-full max-w-2xl relative">
        <Input
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="w-full bg-[#2f2f2f] border-none text-white px-4 py-6 rounded-lg pr-12 focus-visible:ring-0 focus-visible:ring-offset-0"
          placeholder="Message ChatGPT"
        />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                disabled={!message.trim()}
                onClick={isStreaming ? handleStopRequest : handleSendMessage}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:text-white/50 bg-transparent hover:bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isStreaming ? (
                  <Square className="h-5 w-5" />
                ) : (
                  <SendHorizontal className="h-5 w-5" />
                )}
              </Button>
            </TooltipTrigger>
            {!message.trim() && (
              <TooltipContent>
                <p>Please enter a message</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  // Full version with all buttons and features
  return (
    <div className="rounded-xl border border-[#454545] bg-[#303030] shadow-none">
      {/* Top part - Input area */}
      <div className="px-4 pt-4 mb-2">
        <Input
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="w-full border-0 bg-transparent p-0 text-[#ececec] focus-visible:ring-0 focus-visible:ring-offset-0"
          placeholder="Message ChatGPT"
        />
      </div>

      {/* Bottom part - Actions */}
      <div className="mb-2 mt-2 flex items-center justify-between px-4 pb-2">
        <div className="flex gap-x-2">
          {/* Upload button */}
          <button className="flex h-9 w-9 items-center justify-center rounded-full border border-[#454545] bg-transparent hover:bg-[#424242] text-[#b4b4b4]">
            <Upload className="h-[18px] w-[18px] text-[#b4b4b4]" />
          </button>

          {/* Search button */}
          <button
            onClick={() =>
              setSelectedButtons?.({
                search: !selectedButtons.search,
                reason: false, // Disable reason when toggling search
              })
            }
            className={`flex h-9 items-center justify-center rounded-full ${
              selectedButtons.search
                ? "bg-[#2a4a6d] border-0"
                : "border border-[#454545] bg-transparent hover:bg-[#424242]"
            } px-3`}
          >
            <Search
              className={`h-[18px] w-[18px] ${
                selectedButtons.search ? "text-[#48aaff]" : "text-[#b4b4b4]"
              }`}
            />
            <span
              className={`ml-2 text-sm ${
                selectedButtons.search ? "text-[#48aaff]" : "text-[#b4b4b4]"
              }`}
            >
              Search
            </span>
          </button>

          {/* Reason button */}
          <button
            onClick={() =>
              setSelectedButtons?.({
                reason: !selectedButtons.reason,
                search: false, // Disable search when toggling reason
              })
            }
            className={`flex h-9 items-center justify-center rounded-full ${
              selectedButtons.reason
                ? "bg-[#2a4a6d] border-0"
                : "border border-[#454545] bg-transparent hover:bg-[#424242]"
            } px-3`}
          >
            <BrainCircuit
              className={`h-[18px] w-[18px] ${
                selectedButtons.reason ? "text-[#48aaff]" : "text-[#b4b4b4]"
              }`}
            />
            <span
              className={`ml-2 text-sm ${
                selectedButtons.reason ? "text-[#48aaff]" : "text-[#b4b4b4]"
              }`}
            >
              Reason
            </span>
          </button>
        </div>

        {/* Send button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                disabled={!message.trim()}
                onClick={isStreaming ? handleStopRequest : handleSendMessage}
                className={`h-9 w-9 rounded-full ${
                  message.trim()
                    ? "bg-[#ffffff] text-[#0e0e0e] hover:opacity-80"
                    : "bg-[#676767] text-[#2f2f2f]"
                }`}
              >
                {isStreaming ? (
                  <Square className="h-5 w-5" />
                ) : (
                  <SendHorizontal className="h-5 w-5" />
                )}
              </Button>
            </TooltipTrigger>
            {!message.trim() && (
              <TooltipContent>
                <p>Please enter a message</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};