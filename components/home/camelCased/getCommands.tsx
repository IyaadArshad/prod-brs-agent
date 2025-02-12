import { Command } from "@/types/types";
import { baseCommands } from "@/variables/baseCommands";
import { Eye } from "lucide-react";

export function getCommands(splitView: boolean): Command[] {
    return splitView
      ? [
          ...baseCommands,
          {
            icon: <Eye className="w-4 h-4" />,
            title: "Exit Split Screen View",
            description: "/exit",
            action: "exit",
            command: "exit",
          },
        ]
      : baseCommands;
  }