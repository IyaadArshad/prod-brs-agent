export interface StatusIndicatorProps {
    status: "loading" | "done";
    loadingText: string;
    doneText: string;
}

export interface MessageProps {
    message: Message;
    onEdit?: (id: string, content: string) => void;
    onDelete?: (id: string) => void;
    onRegenerate?: (id: string) => void;
}

export interface Message {
    id: string;
    content: string;
    role: "user" | "assistant";
    timestamp: number;
}

export interface Command {
    icon: React.ReactNode;
    title: string;
    description: string;
    action: string;
    command: string;
}

export interface CommandMenuProps {
    isOpen: boolean;
    onSelect: (action: string) => void;
    filter: string;
    splitView: boolean; // add this prop
}
