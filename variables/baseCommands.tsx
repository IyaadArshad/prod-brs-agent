import { Command } from "@/types/types";
import { HelpCircle, Eye, FileText } from "lucide-react";

export const baseCommands: Command[] = [
    {
      icon: <HelpCircle className="w-4 h-4" />,
      title: "Show available commands",
      description: "/help",
      action: "help",
      command: "help",
    },
    {
      icon: <HelpCircle className="w-4 h-4" />,
      title: "Configure options",
      description: "/settings",
      action: "settings",
      command: "settings",
    },
    {
      icon: <Eye className="w-4 h-4" />,
      title: "Switch To Assisted View",
      description: "/assisted [filename]",
      action: "assisted",
      command: "assisted",
    },
    {
      icon: <Eye className="w-4 h-4" />,
      title: "Create new document",
      description: "/create [filename]",
      action: "create",
      command: "create",
    },
    {
      icon: <FileText className="w-4 h-4" />,
      title: "Open Editor Files",
      description: "/open [filename]",
      action: "open",
      command: "open",
    },
  ];