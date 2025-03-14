"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { JSONContent } from "@sergeysova/craft";
import { SendHorizontal, Square, LucideMoreVertical } from "lucide-react";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Cookies from "js-cookie";
import gravatarUrl from "gravatar-url";
import ReactDOMServer from "react-dom/server";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Message } from "@/types/types";
import { StatusIndicator } from "@/components/indicator";
import { logVerbose } from "@/components/home/camelCased/logVerbose";
import { CommandMenu } from "@/components/home/CommandMenu";
import { MessageComponent } from "@/components/home/MessageComponent";
import { SplitScreenEditor } from "@/components/splitScreenEditor";
import { Upload, Search } from "lucide-react";
import { ReasonIcon as BrainCircuit } from "./icons/reason";

declare global {
  interface Window {
    verbose: boolean;
  }
}

export default function ChatInterface() {
  const [content, setContent] = useState<JSONContent>({});
  const [message, setMessage] = useState("");
  const [commandFilter, setCommandFilter] = useState("");
  const [splitView, setSplitView] = useState(false); // New state
  const [editorWidth, setEditorWidth] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConversationStarted, setIsConversationStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false); // Add this state
  const abortControllerRef = useRef<AbortController | null>(null); // Add this ref
  const [leftPaneToRight, setLeftPaneToRight] = useState(false); // New state
  const [openedDocument, setOpenedDocument] = useState<string>("");
  // NEW: state for loaded file and loading flag
  const [fileContent, setFileContent] = useState("");
  const [isFileLoading, setIsFileLoading] = useState(false);
  // Removed renderedContent state
  // const [renderedContent, setRenderedContent] = useState<string>("");
  const [selectedButtons, setSelectedButtons] = useState({
    search: false,
    reason: false,
  });

  const handleUserRegistration = async () => {
    if (!newUserName.trim() || !newUserEmail.trim()) return;
    setIsRegistering(true);
    try {
      const defaultAvatarUrl =
        "https://brs-agent.acroford.com/images/default_pfp.png";

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
        console.error("Error fetching gravatar:", error);
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
      console.error("Error during user registration:", error);
    } finally {
      setIsRegistering(false);
    }
  };

  useEffect(() => {
    const userCookie = Cookies.get("user");
    if (userCookie) {
      try {
        setUser(JSON.parse(userCookie));
      } catch (e) {
        console.error("Error parsing user cookie:", e);
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

    if (newMessage.content.startsWith("/help") || newMessage.content === "/") {
      // if running help command
      // print help message to chat
      const helpMessage =
        "I can help you with the following commands:\n\n **/help** - Show available commands\n\n/**settings** - Configure options\n\n/**assisted** [filename] - Switch to Assisted View\n\n**/create** [filename] - Create new document\n\n**/open** [filename] - Open Editor Files\n\n Please make sure you type out **full commands.** The command menu only serves for reference purposes";
      // 1.5 second delay
      await new Promise((resolve) => setTimeout(resolve, 1700));
      let currentMessage = "";
      const words = helpMessage.split(" ");
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
        const response = await fetch(
          "https://brs-agent.datamation.lk/api/legacy/data/createFile",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ file_name }),
          }
        );
        const responseData = await response.json();

        if (!response.ok) {
          return { message: responseData.message };
        }
        return responseData.message;
      }

      const parts = newMessage.content.split(" ");
      if (parts.length !== 2 || !parts[1].endsWith(".md")) {
        await new Promise((resolve) => setTimeout(resolve, 950));
        let currentMessage = "";
        const words =
          "Invalid format: \n\n Please provide a single name for a file. \n\n -It must end in '.md' \n\n -Use dashes, underscores, and characters only \n\n -The file name cannot have spaces".split(
            " "
          );
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
      } else {
        // create file and return output
        const response = await createFile(parts[1]);
        let currentMessage = "";
        // Add an initial delay for fade in effect
        await new Promise((resolve) => setTimeout(resolve, 300));
        const words = response.split(" ");
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
      if (
        parts.length === 2 &&
        (parts[1].endsWith(".md") || parts[1].endsWith(".pdf"))
      ) {
        setSplitView(true);
        setOpenedDocument(parts[1]); // Set the opened document name
        assistantMsg = `Opening file: ${parts[1]}`;
      } else {
        assistantMsg =
          "Invalid /open command format. Provide one file name ending with .md or .pdf";
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

  function stripFunctionCallDivs(content: string): string {
    let functionCallText = "";
    const regex =
      /<div class="flex function-call[^>]*>.*?<span[^>]*>(.*?)<\/span>.*?<\/div>/g;
    let match;
    content = content.replace(
      /<div class="flex flex-col gap-2">[\s\S]*?<\/div>/g,
      (match) => {
        const spanMatches =
          match.match(/<span class="[^"]*text-sm[^"]*">([\s\S]*?)<\/span>/g) ||
          [];
        const texts = spanMatches.map((span) => {
          const textMatch = span.match(/<span[^>]*>([\s\S]*?)<\/span>/);
          return textMatch ? textMatch[1] : "";
        });
        functionCallText += texts.join("\n") + "\n";
        return "";
      }
    );

    // Combine extracted function call text with remaining content
    return (functionCallText + content).trim();
  }

  const fetchAIResponse = async (userMessage: Message) => {
    try {
      setIsStreaming(true);
      abortControllerRef.current = new AbortController();
      const cleanedMessages = messages.map((msg) => ({
        role: msg.role,
        content: stripFunctionCallDivs(msg.content),
      }));

      // Dynamically choose API endpoint based on button selections
      const endpoint = selectedButtons.reason 
        ? "/api/v2/completionReason"
        : selectedButtons.search
          ? "/api/v2/completionSearch" 
          : "/api/v2/completion";

      const response = await fetch(endpoint, {
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
          search: selectedButtons.search || false,
          userName: user?.name || "",
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const reader = response.body?.getReader();
      let currentMessage = "";
      let messageId = Date.now().toString();
      let functionCalls: { description: string; status: "loading" | "done" }[] =
        [];

      // Create initial message container
      setMessages((prev) => [
        ...prev,
        {
          id: messageId,
          content: "",
          role: "assistant",
          timestamp: Date.now(),
        },
      ]);

      while (true) {
        const { done, value } = (await reader?.read()) || {};
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const jsonStr = line.replace("data: ", "");
            const json = JSON.parse(jsonStr);

            logVerbose("Stream chunk:", json);

            switch (json.type) {
              case "function": {
                const fnName = json.data;
                const fnParams = json.parameters;
                let fnDescription = fnName;
                if (fnParams && fnParams.file_name) {
                  fnDescription += ` for ${fnParams.file_name}`;
                }
                functionCalls.push({
                  description: fnDescription,
                  status: "loading",
                });

                // Instead of filtering out search function calls, render them normally
                const indicatorsHTML = ReactDOMServer.renderToString(
                  <div className="flex flex-col gap-2">
                    {functionCalls.map((call, index) => (
                      <div
                        key={index}
                        className={
                          index === functionCalls.length - 1
                            ? "bottom-function"
                            : ""
                        }
                      >
                        <StatusIndicator
                          status={call.status}
                          loadingText={`Processing ${call.description}...`}
                          doneText={`Processed ${call.description}`}
                        />
                      </div>
                    ))}
                  </div>
                );

                setMessages((prev) => {
                  const lastMessage = prev[prev.length - 1];
                  if (lastMessage?.id === messageId) {
                    return [
                      ...prev.slice(0, -1),
                      {
                        ...lastMessage,
                        content: `${indicatorsHTML}${currentMessage}`,
                      },
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
                        <div
                          key={index}
                          className={
                            index === functionCalls.length - 1 ? "mb-16" : ""
                          }
                        >
                          <StatusIndicator
                            status={call.status}
                            loadingText={`Processing ${call.description}...`}
                            doneText={`Processed ${call.description}`}
                          />
                        </div>
                      ))}
                    </div>
                  );

                  setMessages((prev) => {
                    const lastMessage = prev[prev.length - 1];
                    if (lastMessage?.id === messageId) {
                      return [
                        ...prev.slice(0, -1),
                        {
                          ...lastMessage,
                          content: `${indicatorsHTML}${currentMessage}`,
                        },
                      ];
                    }
                    return prev;
                  });
                }
                break;
              }

              case "message": {
                // Keep indicators visible while streaming message content
                const newWords = json.content.split(" ");
                for (let word of newWords) {
                  currentMessage += (currentMessage ? " " : "") + word;
                  const indicatorsHTML =
                    functionCalls.length > 0
                      ? ReactDOMServer.renderToString(
                          <div className="flex flex-col gap-2">
                            {functionCalls.map((call, index) => (
                              <div
                                key={index}
                                className={
                                  index === functionCalls.length - 1
                                    ? "mb-4"
                                    : ""
                                }
                              >
                                <StatusIndicator
                                  status={call.status}
                                  loadingText={`Processing ${call.description}...`}
                                  doneText={`Processed ${call.description}`}
                                />
                              </div>
                            ))}
                          </div>
                        )
                      : "";

                  setMessages((prev) => {
                    const lastMessage = prev[prev.length - 1];
                    if (lastMessage?.id === messageId) {
                      return [
                        ...prev.slice(0, -1),
                        {
                          ...lastMessage,
                          content: `${indicatorsHTML}${currentMessage}`,
                        },
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
      if (error instanceof Error && error.name === "AbortError") {
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage?.role === "assistant") {
            return [
              ...prev.slice(0, -1),
              { ...lastMessage, content: lastMessage.content + " [stopped]" },
            ];
          }
          return prev;
        });
      } else {
        console.error("Error fetching AI response:", error);
        setMessages((prev) => [
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

  useEffect(() => {
    if (splitView && openedDocument) {
      setIsFileLoading(true);
      fetch(`/api/legacy/data/readFile?file_name=${openedDocument}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setFileContent(data.data);
          else setFileContent("");
        })
        .catch((error) => console.error("Error reading file:", error))
        .finally(() => setIsFileLoading(false));
    }
  }, [openedDocument, splitView]);

  // Remove the useEffect that previously rendered markdown via renderDocument
  // useEffect(() => {
  //   if (fileContent) {
  //     setRenderedContent(renderDocument(fileContent));
  //   }
  // }, [fileContent]);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#ffffff] text-[#000000] flex flex-col justify-center items-center p-4 relative">
        {/* Centered Content */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm space-y-6"
        >
          <h1 className="text-2xl text-center font-semibold">
            Create an account
          </h1>

          <div className="space-y-4">
            <Input
              id="name"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              placeholder="Name*"
              className="rounded border border-[#00a587] text-[#000000] placeholder:text-[#15847e] placeholder:font-light focus-visible:ring-0 focus-visible:ring-offset-0"
              style={{ borderWidth: "1px" }}
            />
            <Input
              id="email"
              type="email"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              placeholder="Email address*"
              className="rounded border border-[#00a587] text-[#000000] placeholder:text-[#15847e] placeholder:font-light focus-visible:ring-0 focus-visible:ring-offset-0"
              style={{ borderWidth: "1px" }}
            />

            <Button
              onClick={handleUserRegistration}
              disabled={
                !newUserName.trim() || !newUserEmail.trim() || isRegistering
              }
              className="w-full bg-[#15847e] text-[#ffffff] rounded-sm transition-colors hover:bg-[#10655e]"
            >
              {isRegistering ? "Loading..." : "Continue"}
            </Button>
          </div>
        </motion.div>

        {/* Top-left logo addition */}
        <div className="absolute top-3 left-3">
          <h2 className="text-xl font-semibold">
            ChatGPT <span className="text-sm font-normal italic">for BRS</span>
          </h2>
        </div>
      </div>
    );
  }

  return splitView ? (
    <div className="flex h-screen overflow-hidden bg-black">
      {leftPaneToRight ? (
        <>
          {/* Right pane */}
          <div
            className="flex screen flex-col bg-[#1E1E1E] text-white overflow-y-auto chat-container"
            style={{ flexBasis: `${100 - editorWidth}%` }}
          >
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
                          onClick={
                            isStreaming ? handleStopRequest : handleSendMessage
                          }
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
                    {messages.map((msg, index) => (
                      <MessageComponent
                        key={msg.id}
                        message={msg}
                        onEdit={handleEditMessage}
                        onDelete={handleDeleteMessage}
                        onRegenerate={handleRegenerateMessage}
                        streaming={
                          isStreaming &&
                          msg.role === "assistant" &&
                          index === messages.length - 1
                        }
                      />
                    ))}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>

                <div className="">
                  <div className="max-w-3xl mx-auto p-4">
                    <div className="sticky bottom-0 p-4">
                      <div className="rounded-xl border border-[#454545] bg-[#303030] shadow-none">
                        {/* Top part - Input area */}
                        <div className="px-4 pt-4 mb-2">
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
                              if (
                                e.key === "Enter" &&
                                !e.shiftKey &&
                                message.trim()
                              ) {
                                e.preventDefault();
                                handleSendMessage();
                              }
                            }}
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
                                setSelectedButtons((prev) => ({
                                  ...prev,
                                  search: !prev.search,
                                  reason: false // Disable reason when toggling search
                                }))
                              }
                              className={`flex h-9 items-center justify-center rounded-full ${
                                selectedButtons.search
                                  ? "bg-[#2a4a6d] border-0"
                                  : "border border-[#454545] bg-transparent hover:bg-[#424242]"
                              } px-3`}
                            >
                              <Search
                                className={`h-[18px] w-[18px] ${
                                  selectedButtons.search
                                    ? "text-[#48aaff]"
                                    : "text-[#b4b4b4]"
                                }`}
                              />
                              <span
                                className={`ml-2 text-sm ${
                                  selectedButtons.search
                                    ? "text-[#48aaff]"
                                    : "text-[#b4b4b4]"
                                }`}
                              >
                                Search
                              </span>
                            </button>

                            {/* Reason button */}
                            <button
                              onClick={() =>
                                setSelectedButtons((prev) => ({
                                  ...prev,
                                  reason: !prev.reason,
                                  search: false // Disable search when toggling reason
                                }))
                              }
                              className={`flex h-9 items-center justify-center rounded-full ${
                                selectedButtons.reason
                                  ? "bg-[#2a4a6d] border-0"
                                  : "border border-[#454545] bg-transparent hover:bg-[#424242]"
                              } px-3`}
                            >
                              <BrainCircuit
                                className={`h-[18px] w-[18px] ${
                                  selectedButtons.reason
                                    ? "text-[#48aaff]"
                                    : "text-[#b4b4b4]"
                                }`}
                              />
                              <span
                                className={`ml-2 text-sm ${
                                  selectedButtons.reason
                                    ? "text-[#48aaff]"
                                    : "text-[#b4b4b4]"
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
                                  onClick={
                                    isStreaming
                                      ? handleStopRequest
                                      : handleSendMessage
                                  }
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

                      {message.startsWith("/") && (
                        <CommandMenu
                          isOpen={true}
                          onSelect={handleCommandSelect}
                          filter={commandFilter}
                          splitView={splitView}
                        />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      GPT can make mistakes. It is not a bug, it is a feature.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
          <div
            className="w-[3px] bg-black cursor-col-resize"
            onMouseDown={handleMouseDown}
          />
          {/* Left pane on right side with left border */}
          <div
            className="border-l screen border-black overflow-y-auto"
            style={{ flexBasis: `${editorWidth}%`, backgroundColor: "#1e1e1e" }}
          >
            <div>
              {/* Document header bar */}
              <div className="bg-[#2a2a2a] border-b border-[#404040] shadow-sm">
                <div className="p-4 flex items-center justify-between">
                  <h1 className="text-white text-lg font-light">
                    {openedDocument}
                  </h1>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="text-white focus:outline-none">
                        <LucideMoreVertical className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-[rgba(255,255,255,0.7)] backdrop-blur-md shadow-md p-2 min-w-[150px]">
                      <DropdownMenuItem
                        onSelect={() => {
                          setSplitView(false);
                          setOpenedDocument("");
                        }}
                        className="px-2 py-1 hover:bg-gray-200 cursor-pointer"
                      >
                        Close {openedDocument}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => setLeftPaneToRight(true)}
                        className="px-2 py-1 hover:bg-gray-200 cursor-pointer"
                      >
                        Move to right side
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              {/* NEW: Using SplitScreenEditor for viewing the document */}
              {isFileLoading ? (
                <div className="flex flex-col items-center justify-center min-h-screen">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gray-900"></div>
                  <h2 className="text-2xl font-bold mt-4">
                    Loading {openedDocument}
                  </h2>
                  <p className="text-gray-500 mt-2">
                    Please wait while we load your document...
                  </p>
                </div>
              ) : (
                <div className="h-full">
                  <SplitScreenEditor markdown={fileContent} />
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        // Default layout with left pane on left side.
        <>
          {/* Left pane */}
          <div
            className="border-r screen border-black overflow-y-auto"
            style={{ flexBasis: `${editorWidth}%`, backgroundColor: "#1e1e1e" }}
          >
            <div>
              {/* Document header bar */}
              <div className="bg-[#2a2a2a] border-b border-[#404040] shadow-sm">
                <div className="p-3 flex items-center justify-between">
                  <span className="text-white font-light text-sm">
                    {openedDocument}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="text-white focus:outline-none">
                        <LucideMoreVertical className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-[rgba(255,255,255,0.7)] backdrop-blur-md shadow-md p-2 min-w-[150px]">
                      <DropdownMenuItem
                        onSelect={() => {
                          setSplitView(false);
                          setOpenedDocument("");
                        }}
                        className="px-2 py-1 hover:bg-gray-200 cursor-pointer"
                      >
                        Close {openedDocument}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => setLeftPaneToRight(true)}
                        className="px-2 py-1 hover:bg-gray-200 cursor-pointer"
                      >
                        Move to right side
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              {/* NEW: Replace left pane content with loading spinner or markdown */}
              {isFileLoading ? (
                <div className="flex flex-col items-center justify-center min-h-screen">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gray-900"></div>
                  <h2 className="text-2xl font-bold mt-4">
                    Loading {openedDocument}
                  </h2>
                  <p className="text-gray-500 mt-2">
                    Please wait while we load your document...
                  </p>
                </div>
              ) : (
                <div className="h-full">
                  <SplitScreenEditor markdown={fileContent} />
                </div>
              )}
            </div>
          </div>
          <div
            className="w-[3px] bg-black cursor-col-resize"
            onMouseDown={handleMouseDown}
          />
          {/* Right pane */}
          <div
            className="flex screen flex-col bg-[#1E1E1E] text-white overflow-y-auto chat-container"
            style={{ flexBasis: `${100 - editorWidth}%` }}
          >
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
                          onClick={
                            isStreaming ? handleStopRequest : handleSendMessage
                          }
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
                    {messages.map((msg, index) => (
                      <MessageComponent
                        key={msg.id}
                        message={msg}
                        onEdit={handleEditMessage}
                        onDelete={handleDeleteMessage}
                        onRegenerate={handleRegenerateMessage}
                        streaming={
                          isStreaming &&
                          msg.role === "assistant" &&
                          index === messages.length - 1
                        }
                      />
                    ))}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>

                <div className="">
                  <div className="max-w-3xl mx-auto p-4">
                    <div className="sticky bottom-0 p-4">
                      <div className="rounded-xl border border-[#454545] bg-[#303030] shadow-none">
                        {/* Top part - Input area */}
                        <div className="px-4 pt-4 mb-2">
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
                              if (
                                e.key === "Enter" &&
                                !e.shiftKey &&
                                message.trim()
                              ) {
                                e.preventDefault();
                                handleSendMessage();
                              }
                            }}
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
                                setSelectedButtons((prev) => ({
                                  ...prev,
                                  search: !prev.search,
                                  reason: false // Disable reason when toggling search
                                }))
                              }
                              className={`flex h-9 items-center justify-center rounded-full ${
                                selectedButtons.search
                                  ? "bg-[#2a4a6d] border-0"
                                  : "border border-[#454545] bg-transparent hover:bg-[#424242]"
                              } px-3`}
                            >
                              <Search
                                className={`h-[18px] w-[18px] ${
                                  selectedButtons.search
                                    ? "text-[#48aaff]"
                                    : "text-[#b4b4b4]"
                                }`}
                              />
                              <span
                                className={`ml-2 text-sm ${
                                  selectedButtons.search
                                    ? "text-[#48aaff]"
                                    : "text-[#b4b4b4]"
                                }`}
                              >
                                Search
                              </span>
                            </button>

                            {/* Reason button */}
                            <button
                              onClick={() =>
                                setSelectedButtons((prev) => ({
                                  ...prev,
                                  reason: !prev.reason,
                                  search: false // Disable search when toggling reason
                                }))
                              }
                              className={`flex h-9 items-center justify-center rounded-full ${
                                selectedButtons.reason
                                  ? "bg-[#2a4a6d] border-0"
                                  : "border border-[#454545] bg-transparent hover:bg-[#424242]"
                              } px-3`}
                            >
                              <BrainCircuit
                                className={`h-[18px] w-[18px] ${
                                  selectedButtons.reason
                                    ? "text-[#48aaff]"
                                    : "text-[#b4b4b4]"
                                }`}
                              />
                              <span
                                className={`ml-2 text-sm ${
                                  selectedButtons.reason
                                    ? "text-[#48aaff]"
                                    : "text-[#b4b4b4]"
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
                                  onClick={
                                    isStreaming
                                      ? handleStopRequest
                                      : handleSendMessage
                                  }
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

                      {message.startsWith("/") && (
                        <CommandMenu
                          isOpen={true}
                          onSelect={handleCommandSelect}
                          filter={commandFilter}
                          splitView={splitView}
                        />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      GPT can make mistakes. It is not a bug, it is a feature.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  ) : (
    <div className="h-screen chat-container screen text-white flex flex-col overflow-hidden">
      {" "}
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
                    onClick={
                      isStreaming ? handleStopRequest : handleSendMessage
                    }
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
              {messages.map((msg, index) => (
                <MessageComponent
                  key={msg.id}
                  message={msg}
                  onEdit={handleEditMessage}
                  onDelete={handleDeleteMessage}
                  onRegenerate={handleRegenerateMessage}
                  streaming={
                    isStreaming &&
                    msg.role === "assistant" &&
                    index === messages.length - 1
                  }
                />
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          <div className="">
            <div className="max-w-5xl mx-auto p-4">
              <div className="sticky bottom-0 p-4">
                <div className="rounded-xl border border-[#454545] bg-[#303030] shadow-none">
                  {/* Top part - Input area */}
                  <div className="px-4 pt-4 mb-2">
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
                        if (
                          e.key === "Enter" &&
                          !e.shiftKey &&
                          message.trim()
                        ) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
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
                          setSelectedButtons((prev) => ({
                            ...prev,
                            search: !prev.search,
                            reason: false // Disable reason when toggling search
                          }))
                        }
                        className={`flex h-9 items-center justify-center rounded-full ${
                          selectedButtons.search
                            ? "bg-[#2a4a6d] border-0"
                            : "border border-[#454545] bg-transparent hover:bg-[#424242]"
                        } px-3`}
                      >
                        <Search
                          className={`h-[18px] w-[18px] ${
                            selectedButtons.search
                              ? "text-[#48aaff]"
                              : "text-[#b4b4b4]"
                          }`}
                        />
                        <span
                          className={`ml-2 text-sm ${
                            selectedButtons.search
                              ? "text-[#48aaff]"
                              : "text-[#b4b4b4]"
                          }`}
                        >
                          Search
                        </span>
                      </button>

                      {/* Reason button */}
                      <button
                        onClick={() =>
                          setSelectedButtons((prev) => ({
                            ...prev,
                            reason: !prev.reason,
                            search: false // Disable search when toggling reason
                          }))
                        }
                        className={`flex h-9 items-center justify-center rounded-full ${
                          selectedButtons.reason
                            ? "bg-[#2a4a6d] border-0"
                            : "border border-[#454545] bg-transparent hover:bg-[#424242]"
                        } px-3`}
                      >
                        <BrainCircuit
                          className={`h-[18px] w-[18px] ${
                            selectedButtons.reason
                              ? "text-[#48aaff]"
                              : "text-[#b4b4b4]"
                          }`}
                        />
                        <span
                          className={`ml-2 text-sm ${
                            selectedButtons.reason
                              ? "text-[#48aaff]"
                              : "text-[#b4b4b4]"
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
                            onClick={
                              isStreaming
                                ? handleStopRequest
                                : handleSendMessage
                            }
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

                {message.startsWith("/") && (
                  <CommandMenu
                    isOpen={true}
                    onSelect={handleCommandSelect}
                    filter={commandFilter}
                    splitView={splitView}
                  />
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                GPT can make mistakes. It is not a bug, it is a feature.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}