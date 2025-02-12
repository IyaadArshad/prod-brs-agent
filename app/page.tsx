"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { JSONContent } from "@sergeysova/craft";
import {
  SendHorizontal,
  Trash2,
  Copy,
  Pencil,
  Check,
  FolderSyncIcon as Sync,
  Layout,
  Square,
  HelpCircle,
  Eye,
  FileText,
} from "lucide-react";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Cookies from 'js-cookie'; // Add this import
import gravatarUrl from "gravatar-url";
import { parseMarkdown } from "@/utils/markdownParser"; // Add this import
import ReactDOMServer from "react-dom/server";
import { Loader2 } from "lucide-react"

interface StatusIndicatorProps {
  status: "loading" | "done"
  loadingText: string
  doneText: string
}

function StatusIndicator({ status, loadingText, doneText }: StatusIndicatorProps) {
  return (
    <div
      className={`flex function-call items-center gap-2 bg-[#2f2f2f] border border-[#44444] text-[#e4e4e7] px-3 py-2 
      ${status === "done" ? "rounded-xl border border-[#444444]" : "rounded-full border border-[#444444]"}
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

declare global {
  interface Window {
    verbose: boolean;
  }
}

function logVerbose(...args: any[]) {
  if (typeof window !== 'undefined' && window.verbose) {
    console.log('[BRS Agent]', ...args);
  }
}

interface MessageProps {
  message: Message;
  onEdit?: (id: string, content: string) => void;
  onDelete?: (id: string) => void;
  onRegenerate?: (id: string) => void;
}

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: number
}

interface Command {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: string;
  command: string;
}
const help = (): { message: string } => ({
  message: "I can help you with the following commands:\n/help - Show available commands\n/settings - Configure options\n/assisted [filename] - Switch to Assisted View\n/create [filename] - Create new document\n/open [filename] - Open Editor Files"
});

const settings = (): { message: string } => ({
  message: "Current settings:\n- Theme: Dark\n- Language: English\n- Notifications: On"
});

const assisted = (filename?: string): { message: string } => ({
  message: `Switching to assisted view for ${filename || '[no filename provided]'}`
});

const create = (filename?: string): { message: string } => ({
  message: `Creating new document: ${filename || '[no filename provided]'}`
});

const open = (filename?: string): { message: string } => ({
  message: `Opening file: ${filename || '[no filename provided]'}`
});

const baseCommands: Command[] = [
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

function getCommands(splitView: boolean): Command[] {
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

interface CommandMenuProps {
  isOpen: boolean;
  onSelect: (action: string) => void;
  filter: string;
  splitView: boolean; // add this prop
}

const CommandMenu: React.FC<CommandMenuProps> = ({ isOpen, onSelect, filter, splitView }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const commands = getCommands(splitView);
  const filteredCommands = commands.filter(
    (command) =>
      command.title.toLowerCase().includes(filter.toLowerCase()) ||
      command.description.toLowerCase().includes(filter.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [filter]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          break;
        case 'Enter':
        case 'Tab':
          e.preventDefault();
          e.stopPropagation(); // Prevent form submission
          if (filteredCommands[selectedIndex]) {
            onSelect(`/${filteredCommands[selectedIndex].command}`);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onSelect]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.15 }}
          className="absolute max-w-4xl bottom-full left-0 w-full mb-2 bg-[#1E1E1E]/80 backdrop-blur-sm border border-[#383838] rounded-lg shadow-lg overflow-hidden"
          onKeyDown={(e) => e.stopPropagation()} // Prevent event bubbling
        >
          <div className="max-h-[300px] overflow-y-auto">
            {filteredCommands.map((command, index) => (
              <button
          key={command.action}
          onClick={(e) => {
            e.preventDefault();
            onSelect(`/${command.command}`);
          }}
          onMouseEnter={() => setSelectedIndex(index)}
          onMouseLeave={() => setSelectedIndex(-1)}
          className={`w-full px-4 py-3 flex items-start gap-3 transition-colors text-left ${
            index === selectedIndex ? 'bg-[#2f2f2f]/80' : ''
          }`}
              >
          <div className="flex-shrink-0 w-6 h-6 rounded bg-gray-800/90 flex items-center justify-center text-white">
            {command.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-200">{command.title}</div>
            <div className="text-sm text-gray-400">{command.description}</div>
          </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const WordSpan = ({ word, index }: { word: string; index: number }) => {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      // Updated transition for a smoother fade-in
      transition={{ duration: 0.4, delay: index * 0.05, ease: "easeInOut" }}
      style={{ display: 'inline', letterSpacing: '-0.01em' }}
    >
      {word}
    </motion.span>
  );
};

// Add this helper function near the top of the file
function groupWords(text: string, groupSize: number): string[] {
  const words = text.split(' ');
  const groups = [];
  for (let i = 0; i < words.length; i += groupSize) {
    groups.push(words.slice(i, i + groupSize).join(' '));
  }
  return groups;
}

function MessageComponent({
  message,
  onEdit,
  onDelete,
  onRegenerate,
}: MessageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setIsCopied(true);
  };

  const handleEdit = () => {
    if (isEditing) {
      onEdit?.(message.id, editedContent);
    }
    setIsEditing(!isEditing);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3 }}
      className={`group flex items-start gap-4 chatty px-24 py-5 hover:bg-[#2A2A2A] relative ${
        message.role === "user" ? "flex-row-reverse" : ""
      }`}
      aria-label={`Message from ${message.role}`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          message.role === "assistant" ? "bg-white" : ""
        }`}
        style={
          message.role === "user"
            ? {
                backgroundImage: `url(${Cookies.get("gravatar")})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {}
        }
      >
        {message.role === "assistant" && (
            <svg
              width="auto"
              height="22"
              viewBox="0 0 41 41"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="icon-md"
              role="img"
            >
              <text x="-9999" y="-9999">
                ChatGPT
              </text>
              <path
                d="M37.5324 16.8707C37.9808 15.5241 38.1363 14.0974 37.9886 12.6859C37.8409 11.2744 37.3934 9.91076 36.676 8.68622C35.6126 6.83404 33.9882 5.3676 32.0373 4.4985C30.0864 3.62941 27.9098 3.40259 25.8215 3.85078C24.8796 2.7893 23.7219 1.94125 22.4257 1.36341C21.1295 0.785575 19.7249 0.491269 18.3058 0.500197C16.1708 0.495044 14.0893 1.16803 12.3614 2.42214C10.6335 3.67624 9.34853 5.44666 8.6917 7.47815C7.30085 7.76286 5.98686 8.3414 4.8377 9.17505C3.68854 10.0087 2.73073 11.0782 2.02839 12.312C0.956464 14.1591 0.498905 16.2988 0.721698 18.4228C0.944492 20.5467 1.83612 22.5449 3.268 24.1293C2.81966 25.4759 2.66413 26.9026 2.81182 28.3141C2.95951 29.7256 3.40701 31.0892 4.12437 32.3138C5.18791 34.1659 6.8123 35.6322 8.76321 36.5013C10.7141 37.3704 12.8907 37.5973 14.9789 37.1492C15.9208 38.2107 17.0786 39.0587 18.3747 39.6366C19.6709 40.2144 21.0755 40.5087 22.4946 40.4998C24.6307 40.5054 26.7133 39.8321 28.4418 38.5772C30.1704 37.3223 31.4556 35.5506 32.1119 33.5179C33.5027 33.2332 34.8167 32.6547 35.9659 31.821C37.115 30.9874 38.0728 29.9178 38.7752 28.684C39.8458 26.8371 40.3023 24.6979 40.0789 22.5748C39.8556 20.4517 38.9639 18.4544 37.5324 16.8707ZM22.4978 37.8849C20.7443 37.8874 19.0459 37.2733 17.6994 36.1501C17.7601 36.117 17.8666 36.0586 17.936 36.0161L25.9004 31.4156C26.1003 31.3019 26.2663 31.137 26.3813 30.9378C26.4964 30.7386 26.5563 30.5124 26.5549 30.2825V19.0542L29.9213 20.998C29.9389 21.0068 29.9541 21.0198 29.9656 21.0359C29.977 21.052 29.9842 21.0707 29.9867 21.0902V30.3889C29.9842 32.375 29.1946 34.2791 27.7909 35.6841C26.3872 37.0892 24.4838 37.8806 22.4978 37.8849ZM6.39227 31.0064C5.51397 29.4888 5.19742 27.7107 5.49804 25.9832C5.55718 26.0187 5.66048 26.0818 5.73461 26.1244L13.699 30.7248C13.8975 30.8408 14.1233 30.902 14.3532 30.902C14.583 30.902 14.8088 30.8408 15.0073 30.7248L24.731 25.1103V28.9979C24.7321 29.0177 24.7283 29.0376 24.7199 29.0556C24.7115 29.0736 24.6988 29.0893 24.6829 29.1012L16.6317 33.7497C14.9096 34.7416 12.8643 35.0097 10.9447 34.4954C9.02506 33.9811 7.38785 32.7263 6.39227 31.0064ZM4.29707 13.6194C5.17156 12.0998 6.55279 10.9364 8.19885 10.3327C8.19885 10.4013 8.19491 10.5228 8.19491 10.6071V19.808C8.19351 20.0378 8.25334 20.2638 8.36823 20.4629C8.48312 20.6619 8.64893 20.8267 8.84863 20.9404L18.5723 26.5542L15.206 28.4979C15.1894 28.5089 15.1703 28.5155 15.1505 28.5173C15.1307 28.5191 15.1107 28.516 15.0924 28.5082L7.04046 23.8557C5.32135 22.8601 4.06716 21.2235 3.55289 19.3046C3.03862 17.3858 3.30624 15.3413 4.29707 13.6194ZM31.955 20.0556L22.2312 14.4411L25.5976 12.4981C25.6142 12.4872 25.6333 12.4805 25.6531 12.4787C25.6729 12.4769 25.6928 12.4801 25.7111 12.4879L33.7631 17.1364C34.9967 17.849 36.0017 18.8982 36.6606 20.1613C37.3194 21.4244 37.6047 22.849 37.4832 24.2684C37.3617 25.6878 36.8382 27.0432 35.9743 28.1759C35.1103 29.3086 33.9415 30.1717 32.6047 30.6641C32.6047 30.5947 32.6047 30.4733 32.6047 30.3889V21.188C32.6066 20.9586 32.5474 20.7328 32.4332 20.5338C32.319 20.3348 32.154 20.1698 31.955 20.0556ZM35.3055 15.0128C35.2464 14.9765 35.1431 14.9142 35.069 14.8717L27.1045 10.2712C26.906 10.1554 26.6803 10.0943 26.4504 10.0943C26.2206 10.0943 25.9948 10.1554 25.7963 10.2712L16.0726 15.8858V11.9982C16.0715 11.9783 16.0753 11.9585 16.0837 11.9405C16.0921 11.9225 16.1048 11.9068 16.1207 11.8949L24.1719 7.25025C25.4053 6.53903 26.8158 6.19376 28.2383 6.25482C29.6608 6.31589 31.0364 6.78077 32.2044 7.59508C33.3723 8.40939 34.2842 9.53945 34.8334 10.8531C35.3826 12.1667 35.5464 13.6095 35.3055 15.0128ZM14.2424 21.9419L10.8752 19.9981C10.8576 19.9893 10.8423 19.9763 10.8309 19.9602C10.8195 19.9441 10.8122 19.9254 10.8098 19.9058V10.6071C10.8107 9.18295 11.2173 7.78848 11.9819 6.58696C12.7466 5.38544 13.8377 4.42659 15.1275 3.82264C16.4173 3.21869 17.8524 2.99464 19.2649 3.1767C20.6775 3.35876 22.0089 3.93941 23.1034 4.85067C23.0427 4.88379 22.937 4.94215 22.8668 4.98473L14.9024 9.58517C14.7025 9.69878 14.5366 9.86356 14.4215 10.0626C14.3065 10.2616 14.2466 10.4877 14.2479 10.7175L14.2424 21.9419ZM16.071 17.9991L20.4018 15.4978L24.7325 17.9975V22.9985L20.4018 25.4983L16.071 22.9985V17.9991Z"
                fill="#000"
              ></path>
            </svg>
        )}
      </div>
      <div
        className={`flex-1 min-w-0 px-1 ${
          message.role === "user" ? "text-right" : ""
        }`}
      >
        {isEditing ? (
          <input
            type="text"
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full bg-[#2f2f2f] border-none text-white px-3 py-1 rounded focus-visible:ring-0 focus-visible:ring-offset-0"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleEdit();
              if (e.key === "Escape") setIsEditing(false);
            }}
          />
        ) : (
          <div className="markdown-body prose prose-invert max-w-none">
            {message.role === "assistant" ? (
              <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: '1.5', letterSpacing: '-0.01em' }}>
                {/(?:\*\*|__|\*|_)/.test(message.content) ? (
                  // Render full parsed markdown so bold/italic are preserved
                  <span dangerouslySetInnerHTML={{ __html: parseMarkdown(message.content) }} />
                ) : (
                  // Animate word groups if no markdown tokens are detected
                  groupWords(message.content, 3).map((group, index) => (
                    <WordSpan key={index} word={group + ' '} index={index} />
                  ))
                )}
              </div>
            ) : (
              <div 
                style={{ 
                  whiteSpace: 'pre-wrap', 
                  wordBreak: 'break-word',
                  lineHeight: '1.5',
                  letterSpacing: '-0.01em'
                }}
                dangerouslySetInnerHTML={{ 
                  __html: parseMarkdown(message.content) 
                }} 
              />
            )}
          </div>
        )}
        {message.role === "assistant" && (
          <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Assistant management buttons (copy, regenerate) */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-gray-400 hover:bg-[#2f2f2f]"
                    onClick={handleCopy}
                  >
                    {isCopied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isCopied ? "Copied!" : "Copy message"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-gray-400 hover:bg-[#2f2f2f]"
                    onClick={() => onRegenerate?.(message.id)}
                  >
                    <Sync className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Regenerate response</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
      {/* Removed previous absolute positioned management buttons */}
      {message.role !== "assistant" && (
        <div
          className={`opacity-0 group-hover:opacity-100 transition-opacity absolute ${
            message.role === "user" ? "left-8" : "right-8"
          }`}
        >
          <>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-gray-400 hover:bg-[#2f2f2f]"
                    onClick={handleEdit}
                  >
                    {isEditing ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Pencil className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isEditing ? "Save edit" : "Edit message"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-gray-400 hover:bg-[#2f2f2f]"
                    onClick={() => onDelete?.(message.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete message</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </>
        </div>
      )}
    </motion.div>
  );
}

export default function ChatInterface() {
  const [content, setContent] = useState<JSONContent>({})
  const [message, setMessage] = useState("");
  const [commandFilter, setCommandFilter] = useState("");
  const [splitView, setSplitView] = useState(false); // New state
  const [editorWidth, setEditorWidth] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false); // Add this state
  const abortControllerRef = useRef<AbortController | null>(null); // Add this ref

  const handleUserRegistration = async () => {
    if (!newUserName.trim() || !newUserEmail.trim()) return;
    setIsRegistering(true);
    try {
      const defaultAvatarUrl = "https://brs-agent.acroford.com/images/default_pfp.png";
      
      // Generate gravatar URL with secure HTTPS and proper size
      const avatarUrl = gravatarUrl(newUserEmail.trim(), { 
        default: defaultAvatarUrl, // Use our default image URL as fallback
        size: 200,
      });

      // Verify if the gravatar image exists
      try {
        const response = await fetch(avatarUrl);
        if (response.ok) {  
          // If gravatar exists, use it
          Cookies.set("gravatar", avatarUrl, { expires: 365 });
        } else {
          // If gravatar doesn't exist, use default image
          Cookies.set("gravatar", defaultAvatarUrl, { expires: 365 });
        }
      } catch (error) {
        console.error('Error fetching gravatar:', error);
        // Fallback to default image on error
        Cookies.set("gravatar", defaultAvatarUrl, { expires: 365 });
      }

      // Store user data
      const userData = { name: newUserName.trim(), email: newUserEmail.trim() };
      Cookies.set("userEmail", newUserEmail.trim(), { expires: 365 });
      Cookies.set("userName", newUserName.trim(), { expires: 365 });
      Cookies.set("user", JSON.stringify(userData), { expires: 365 });
      setUser(userData);
    } catch (error) {
      console.error('Error during user registration:', error);
    } finally {
      setIsRegistering(false);
    }
  };

  useEffect(() => {
    const userCookie = Cookies.get('user');
    if (userCookie) {
      try {
        setUser(JSON.parse(userCookie));
      } catch (e) {
        console.error('Error parsing user cookie:', e);
      }
    }
  }, []);

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      let newWidth = (e.clientX / window.innerWidth) * 100;
      if (newWidth < 25) newWidth = 25;
      if (newWidth > 75) newWidth = 75;
      setEditorWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);
  
  const handleCommandSelect = (action: string) => {
    // Implement the action handling logic here
    console.log(`Selected action: ${action}`);
  };
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConversationStarted, setIsConversationStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: message.trim(),
      role: "user",
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage("");
    setIsConversationStarted(true);

    if (newMessage.content.startsWith("/help") || newMessage.content === "/") { // if running help command
      // print help message to chat
      const helpMessage = "I can help you with the following commands:\n\n **/help** - Show available commands\n\n/**settings** - Configure options\n\n/**assisted** [filename] - Switch to Assisted View\n\n**/create** [filename] - Create new document\n\n**/open** [filename] - Open Editor Files\n\n Please make sure you type out **full commands.** The command menu only serves for reference purposes";
      // 1.5 second delay
      await new Promise((resolve) => setTimeout(resolve, 1700));
      let currentMessage = "";
      const words = helpMessage.split(' ');
      for (let i = 0; i < words.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 20));
        currentMessage += (i === 0 ? "" : " ") + words[i];
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage && lastMessage.role === "assistant") {
        return [
          ...prev.slice(0, -1),
          { ...lastMessage, content: currentMessage },
        ];
          } else {
        return [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            content: currentMessage,
            role: "assistant",
            timestamp: Date.now(),
          },
        ];
          }
        });
      }
    } else if (newMessage.content.startsWith("/create")) {

      async function createFile(file_name: string) {
        const response = await fetch("https://brs-agent.datamation.lk/api/data/createFile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file_name }),
        });
        const responseData = await response.json();

        if (!response.ok) {
          return { message: responseData.message };
        }
        return responseData.message;
      }

      const parts = newMessage.content.split(' ');
      if (parts.length !== 2 || !parts[1].endsWith('.md')) {
        await new Promise((resolve) => setTimeout(resolve, 950));
        let currentMessage = "";
        const words = "Invalid format: \n\n\ Please provide a single name for a file. \n\n\ -It must end in '.md' \n\n\ -Use dashes, underscores, and characters only \n\n\ -The file name cannot have spaces".split(' ');
        for (let i = 0; i < words.length; i++) {
          await new Promise((resolve) => setTimeout(resolve, 45));
          currentMessage += (i === 0 ? "" : " ") + words[i];
          setMessages((prev) => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage && lastMessage.role === "assistant") {
              return [
          ...prev.slice(0, -1),
          { ...lastMessage, content: currentMessage },
              ];
            } else {
              return [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            content: currentMessage,
            role: "assistant",
            timestamp: Date.now(),
          },
              ];
            }
          });
        }
      } else { // create file and return output
        const response = await createFile(parts[1]);
        let currentMessage = "";
        const words = response.split(' ');
        for (let i = 0; i < words.length; i++) {
          await new Promise((resolve) => setTimeout(resolve, 95));
          currentMessage += (i === 0 ? "" : " ") + words[i];
          setMessages((prev) => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage && lastMessage.role === "assistant") {
              return [
          ...prev.slice(0, -1),
          { ...lastMessage, content: currentMessage },
              ];
            } else {
              return [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            content: currentMessage,
            role: "assistant",
            timestamp: Date.now(),
          },
              ];
            }
          });
        }
      }
    } else if (newMessage.content.startsWith("/open")) {
      const parts = newMessage.content.split(" ");
      let assistantMsg = "";
      if (parts.length === 2 && (parts[1].endsWith(".md") || parts[1].endsWith(".pdf"))) {
        setSplitView(true);
        assistantMsg = `Opening file: ${parts[1]}`;
      } else {
        assistantMsg = "Invalid /open command format. Provide one file name ending with .md or .pdf";
      }
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          content: assistantMsg,
          role: "assistant",
          timestamp: Date.now(),
        },
      ]);
      return;
    } else if (newMessage.content.startsWith("/exit")) {
      setSplitView(false);
      return;
    } else {
      await fetchAIResponse(newMessage);
    }
  };

// Add this helper function before fetchAIResponse
function stripFunctionCallDivs(content: string): string {
  let functionCallText = '';
  
  // Extract text from all function call divs
  const regex = /<div class="flex function-call[^>]*>.*?<span[^>]*>(.*?)<\/span>.*?<\/div>/g;
  let match;
  
  // Replace function call divs but collect their text content
  content = content.replace(/<div class="flex flex-col gap-2">[\s\S]*?<\/div>/g, (match) => {
    const spanMatches = match.match(/<span class="[^"]*text-sm[^"]*">([\s\S]*?)<\/span>/g) || [];
    const texts = spanMatches.map(span => {
      const textMatch = span.match(/<span[^>]*>([\s\S]*?)<\/span>/);
      return textMatch ? textMatch[1] : '';
    });
    functionCallText += texts.join('\n') + '\n';
    return '';
  });

  // Combine extracted function call text with remaining content
  return (functionCallText + content).trim();
}

const fetchAIResponse = async (userMessage: Message) => {
  try {
    setIsStreaming(true);
    abortControllerRef.current = new AbortController();
    
    // Remove filter to include messages starting with '/'
    const cleanedMessages = messages.map((msg) => ({
      role: msg.role,
      content: stripFunctionCallDivs(msg.content)
    }));
    
    const response = await fetch("/api/generative/completion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          ...cleanedMessages,
          {
            role: userMessage.role,
            content: userMessage.content,
          },
        ],
      }),
      signal: abortControllerRef.current.signal,
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const reader = response.body?.getReader();
    let currentMessage = "";
    let messageId = Date.now().toString();
    let functionCalls: { description: string, status: "loading" | "done" }[] = [];

    // Create initial message container
    setMessages(prev => [
      ...prev,
      {
        id: messageId,
        content: '',
        role: "assistant",
        timestamp: Date.now(),
      }
    ]);

    while (true) {
      const { done, value } = (await reader?.read()) || {};
      if (done) break;

      const chunk = new TextDecoder().decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        try {
          const jsonStr = line.replace('data: ', '');
          const json = JSON.parse(jsonStr);
          
          logVerbose('Stream chunk:', json);

          switch (json.type) {
            case "function": {
              const fnName = json.data;
              const fnParams = json.parameters;
              let fnDescription = fnName;
              if (fnParams && fnParams.file_name) {
                fnDescription += ` for ${fnParams.file_name}`;
              }
              functionCalls.push({ description: fnDescription, status: "loading" });
              
              // Update status indicators
              const indicatorsHTML = ReactDOMServer.renderToString(
                <div className="flex flex-col gap-2">
                  {functionCalls.map((call, index) => (
                    <div key={index} className={index === functionCalls.length - 1 ? "bottom-function" : ""}>
                      <StatusIndicator
                        status={call.status}
                        loadingText={`Processing ${call.description}...`}
                        doneText={`Processed ${call.description}`}
                      />
                    </div>
                  ))}
                </div>
              );
              
              setMessages(prev => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage?.id === messageId) {
                  return [
                    ...prev.slice(0, -1),
                    {
                      ...lastMessage,
                      content: `${indicatorsHTML}${currentMessage}`
                    }
                  ];
                }
                return prev;
              });
              break;
            }

            case "functionResult": {
              // Update the status of the latest function call to "done"
              if (functionCalls.length > 0) {
                functionCalls[functionCalls.length - 1].status = "done";
                
                // Re-render all indicators with updated status
                const indicatorsHTML = ReactDOMServer.renderToString(
                  <div className="flex flex-col gap-2">
                    {functionCalls.map((call, index) => (
                      <div key={index} className={index === functionCalls.length - 1 ? "mb-16" : ""}>
                        <StatusIndicator
                          status={call.status}
                          loadingText={`Processing ${call.description}...`}
                          doneText={`Processed ${call.description}`}
                        />
                      </div>
                    ))}
                  </div>
                );

                setMessages(prev => {
                  const lastMessage = prev[prev.length - 1];
                  if (lastMessage?.id === messageId) {
                    return [
                      ...prev.slice(0, -1),
                      {
                        ...lastMessage,
                        content: `${indicatorsHTML}${currentMessage}`
                      }
                    ];
                  }
                  return prev;
                });
              }
              break;
            }

            case "message": {
              // Keep indicators visible while streaming message content
              const newWords = json.content.split(' ');
              for (let word of newWords) {
                currentMessage += (currentMessage ? ' ' : '') + word;
                const indicatorsHTML = functionCalls.length > 0 
                  ? ReactDOMServer.renderToString(
                      <div className="flex flex-col gap-2">
                        {functionCalls.map((call, index) => (
                          <div key={index} className={index === functionCalls.length - 1 ? "mb-4" : ""}>
                            <StatusIndicator
                              status={call.status}
                              loadingText={`Processing ${call.description}...`}
                              doneText={`Processed ${call.description}`}
                            />
                          </div>
                        ))}
                      </div>
                    )
                  : '';
                
                setMessages(prev => {
                  const lastMessage = prev[prev.length - 1];
                  if (lastMessage?.id === messageId) {
                    return [
                      ...prev.slice(0, -1),
                      {
                        ...lastMessage,
                        content: `${indicatorsHTML}${currentMessage}`
                      }
                    ];
                  }
                  return prev;
                });
              }
              break;
            }

            case "verbose":
              logVerbose("Verbose log:", json.data);
              break;
            case "end":
              logVerbose("Stream ended");
              break;
          }
        } catch (e) {
          console.error("Error parsing chunk:", e);
        }
      }
    }

  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage?.role === "assistant") {
          return [
            ...prev.slice(0, -1),
            { ...lastMessage, content: lastMessage.content + ' [stopped]' }
          ];
        }
        return prev;
      });
    } else {
      console.error("Error fetching AI response:", error);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          content: "An error occurred while fetching the response.",
          role: "assistant",
          timestamp: Date.now(),
        },
      ]);
    }
  } finally {
    setIsStreaming(false);
    abortControllerRef.current = null;
  }
};

  const handleStopRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleEditMessage = (id: string, newContent: string) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, content: newContent } : msg))
    );
  };

  const handleDeleteMessage = (id: string) => {
    const index = messages.findIndex((msg) => msg.id === id);
    if (index !== -1) {
      setMessages((prev) => prev.slice(0, index));
    }
  };

  const handleRegenerateMessage = async (id: string) => {
    const index = messages.findIndex((msg) => msg.id === id);
    if (index !== -1) {
      const previousUserMessage = messages[index - 1];
      if (previousUserMessage && previousUserMessage.role === "user") {
        setMessages((prev) => prev.slice(0, index));
        await fetchAIResponse(previousUserMessage);
      }
    }
  };

  if (!user) {
    return (
      <div className="h-screen chat-container bg-[#1E1E1E] text-white flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg space-y-8"
        >
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl mb-8"
            >
              Initial Platform Setup
            </motion.h1>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                id="name"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                className="bg-[#2f2f2f] border-none text-white focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="Enter your name"
              />
            </div>

            <div className="space-y-2">
              <Input
                id="email"
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                className="bg-[#2f2f2f] border-none text-white focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="Enter your email"
              />
            </div>

            <Button
              onClick={handleUserRegistration}
              disabled={!newUserName.trim() || !newUserEmail.trim() || isRegistering}
              className="w-full transition-all duration-200 hover:bg-[#c0c0c0] hover:text-[#0e0e0e] bg-[#ffffff] text-[#000000] disabled:hover:bg-[#676767] disabled:hover:text-[#2f2f2f]"
            >
              {isRegistering ? "Loading..." : "Continue"}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    splitView ? (
      <div className="flex h-screen overflow-hidden bg-black"> {/* Ensure parent has black background */}
        {/* Left pane */}
        <div
          className="border-r screen border-black overflow-y-auto"
          style={{ flexBasis: `${editorWidth}%`, backgroundColor: '#1e1e1e' }}
        >
          <div className="">
            { /* <CraftEditor 
              content={content} 
              onUpdate={(editor: { getJSON: () => JSONContent }) => {
                const newContent = editor.getJSON();
                setContent(newContent);
              }}
              className="white-text"
            /> */}
          </div>
        </div>
        <div
          className="w-[3px] bg-black cursor-col-resize"
          onMouseDown={handleMouseDown}
        />
        {/* Right pane */}
        <div
          className="flex screen flex-col bg-[#1E1E1E] text-white overflow-y-auto chat-container" /* Added chat-container class */
          style={{ flexBasis: `${100 - editorWidth}%` }}
        >
          {/* The entire chat interface goes here */}
          {!isConversationStarted ? (
            <main className="flex-1 flex flex-col items-center justify-center p-4">
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl mb-8"
              >
                What can I help with?
              </motion.h1>

              <div className="w-full max-w-2xl relative">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && message.trim()) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
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
              <footer className="p-4 text-center text-sm text-gray-400">
                <p>
                  By messaging GPT, you do not agree to our{" "}
                  <Link href="#" className="underline hover:text-white">
                    Terms
                  </Link>{" "}
                  and have read our{" "}
                  <Link href="#" className="underline hover:text-white">
                    Privacy Policy
                  </Link>
                </p>
              </footer>
            </main>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto">
                <AnimatePresence>
                  {messages.map((msg) => (
                    <MessageComponent
                      key={msg.id}
                      message={msg}
                      onEdit={handleEditMessage}
                      onDelete={handleDeleteMessage}
                      onRegenerate={handleRegenerateMessage}
                    />
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              <div className="">
                <div className="max-w-3xl mx-auto p-4">
                    <div className="relative sticky bottom-0 bg-[#1E1E1E] p-4">
                    <Input
                      value={message}
                      onChange={(e) => {
                      setMessage(e.target.value);
                      if (e.target.value.startsWith("/")) {
                        setCommandFilter(e.target.value.slice(1));
                      } else {
                        setCommandFilter("");
                      }
                      }}
                      onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey && message.trim()) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                      }}
                      className="w-full bg-[#2f2f2f] border-none text-white px-4 py-6 rounded-lg pr-12 focus-visible:ring-0 focus-visible:ring-offset-0"
                      placeholder="Message ChatGPT"
                    />
                    {message.startsWith("/") && (
                      <CommandMenu
                      isOpen={true}
                      onSelect={handleCommandSelect}
                      filter={commandFilter}
                      splitView={splitView} // pass splitView
                      />
                    )}
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
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    GPT can make mistakes. It is not a bug, it is a feature.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    ) : (
      <div className="h-screen chat-container screen bg-[#000000] text-white flex flex-col overflow-hidden"> {/* Changed to black background */}
        {/* The entire chat interface goes here */}
        {!isConversationStarted ? (
          <main className="flex-1 flex flex-col items-center justify-center p-4">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl mb-8"
            >
              What can I help with?
            </motion.h1>

            <div className="w-full max-w-2xl relative">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && message.trim()) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
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
            <footer className="p-4 text-center text-sm text-gray-400">
              <p>
                By messaging GPT, you do not agree to our{" "}
                <Link href="#" className="underline hover:text-white">
                  Terms
                </Link>{" "}
                and have read our{" "}
                <Link href="#" className="underline hover:text-white">
                  Privacy Policy
                </Link>
              </p>
            </footer>
          </main>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence>
                {messages.map((msg) => (
                  <MessageComponent
                    key={msg.id}
                    message={msg}
                    onEdit={handleEditMessage}
                    onDelete={handleDeleteMessage}
                    onRegenerate={handleRegenerateMessage}
                  />
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            <div className="">
              <div className="max-w-5xl mx-auto p-4">
                  <div className="relative sticky bottom-0 bg-[#1E1E1E] p-4">
                  <Input
                    value={message}
                    onChange={(e) => {
                    setMessage(e.target.value);
                    if (e.target.value.startsWith("/")) {
                      setCommandFilter(e.target.value.slice(1));
                    } else {
                      setCommandFilter("");
                    }
                    }}
                    onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && message.trim()) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                    }}
                    className="w-full bg-[#2f2f2f] border-none text-white px-4 py-6 rounded-lg pr-12 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none hover:shadow-[0_0_15px_rgba(0,0,0,0.3)] transition-shadow duration-300 ease-in-out"
                    placeholder="Message ChatGPT"
                    />
                  {message.startsWith("/") && (
                    <CommandMenu
                    isOpen={true}
                    onSelect={handleCommandSelect}
                    filter={commandFilter}
                    splitView={splitView} // pass splitView
                    />
                  )}
                  <TooltipProvider>
                    <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                      size="icon"
                      disabled={!message.trim()}
                      onClick={isStreaming ? handleStopRequest : handleSendMessage}
                      className="absolute send-button right-2 top-1/2 -translate-y-1/2 text-[#ffffff] hover:text-[#c0c0c0] bg-transparent hover:bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
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
                <p className="text-xs text-gray-500 mt-2 text-center">
                  GPT can make mistakes. It is not a bug, it is a feature.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    )
  );
}