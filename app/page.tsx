"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Cookies from "js-cookie";
import gravatarUrl from "gravatar-url";
import ReactDOMServer from "react-dom/server";
import { Message } from "@/types/types";
import { StatusIndicator } from "@/components/indicator";
import { logVerbose } from "@/components/home/camelCased/logVerbose";
import { CommandMenu } from "@/components/home/CommandMenu";
import { MessageComponent } from "@/components/home/MessageComponent";
import { SplitScreenEditor } from "@/components/splitScreenEditor";
import { DocumentHeader } from "@/components/DocumentHeader";
import { ChatInputBox } from "@/components/ChatInputBox";

declare global {
  interface Window {
    verbose: boolean;
  }
}

export default function ChatInterface() {
  const [message, setMessage] = useState("");
  const [commandFilter, setCommandFilter] = useState("");
  const [splitView, setSplitView] = useState(false);
  const [editorWidth, setEditorWidth] = useState(50); // customize default width
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
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [leftPaneToRight, setLeftPaneToRight] = useState(true); // Changed from false to true
  const [openedDocument, setOpenedDocument] = useState<string>("");
  const [fileContent, setFileContent] = useState("");
  const [isFileLoading, setIsFileLoading] = useState(false);
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
      let newWidth;
      if (leftPaneToRight) {
        // When left pane is on right side
        newWidth = ((window.innerWidth - e.clientX) / window.innerWidth) * 100;
      } else {
        // When left pane is on left side
        newWidth = (e.clientX / window.innerWidth) * 100;
      }
      // Constrain width between 25% and 75%
      newWidth = Math.max(25, Math.min(75, newWidth));
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

    const userInput = message.trim();
    setMessage("");

    // Handle commands without adding them to chat
    if (userInput.startsWith("/")) {
      const commandParts = userInput.split(" ");
      const command = commandParts[0].toLowerCase();

      if (command === "/help" || userInput === "/") {
        // Process help command silently
        // Only show output for errors (none for help)
        const helpMessage =
          "I can help you with the following commands:\n\n **/help** - Show available commands\n\n**/create** [filename] - Create new document\n\n**/open** [filename] - Open Editor Files\n\n Please make sure you type out **full commands.** The command menu only serves for reference purposes";

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
                  id: Date.now().toString(),
                  content: currentMessage,
                  role: "assistant",
                  timestamp: Date.now(),
                },
              ];
            }
          });
        }
        setIsConversationStarted(true);
        return;
      } else if (command === "/create") {
        setIsConversationStarted(true);
        async function createFile(file_name: string) {
          const response = await fetch(
            "http://localhost:3000/api/legacy/data/createFile",
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

        if (commandParts.length !== 2 || !commandParts[1].endsWith(".md")) {
          await new Promise((resolve) => setTimeout(resolve, 950));
          let currentMessage = "";
          const words =
            "Invalid format: \n\n Please provide a single name for a file. \n\n -It must end in '.md' \n\n -Use dashes, underscores, and characters only \n\n -The file name cannot have spaces".split(
              " "
            );
          for (let i = 0; i < words.length; i++) {
            await new Promise((resolve) => setTimeout(resolve, 45));
            currentMessage += (i === 0 ? "" : " ") + words[i];
            setMessages((prev) => [
              ...prev,
              {
                id: Date.now().toString(),
                content: currentMessage,
                role: "assistant",
                timestamp: Date.now(),
              },
            ]);
            break;
          }
        } else {
          // Create file but only show response on error
          const response = await createFile(commandParts[1]);
          if (
            response.includes("Error") ||
            response.includes("failed") ||
            response.includes("Invalid")
          ) {
            setMessages((prev) => [
              ...prev,
              {
                id: Date.now().toString(),
                content: response,
                role: "assistant",
                timestamp: Date.now(),
              },
            ]);
          }
        }
        return;
      } else if (command === "/open") {
        setIsConversationStarted(true);
        const parts = userInput.split(" ");
        if (
          parts.length === 2 &&
          (parts[1].endsWith(".md") || parts[1].endsWith(".pdf"))
        ) {
          setSplitView(true);
          setOpenedDocument(parts[1]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              content:
                "Invalid /open command format. Provide one file name ending with .md or .pdf",
              role: "assistant",
              timestamp: Date.now(),
            },
          ]);
        }
        return;
      } else if (command === "/exit") {
        setSplitView(false);
        return;
      }

      // If we get here, it's an unrecognized command - show error
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: `Unknown command: ${command}. Type /help to see available commands.`,
          role: "assistant",
          timestamp: Date.now(),
        },
      ]);
      setIsConversationStarted(true);
      return;
    }

    // For non-command messages, maintain existing behavior
    const newMessage: Message = {
      id: Date.now().toString(),
      content: userInput,
      role: "user",
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setIsConversationStarted(true);
    await fetchAIResponse(newMessage);
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

  const handleDocumentClose = () => {
    setSplitView(false);
    setOpenedDocument("");
  };

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

                <ChatInputBox
                  message={message}
                  setMessage={setMessage}
                  handleSendMessage={handleSendMessage}
                  handleStopRequest={handleStopRequest}
                  isStreaming={isStreaming}
                  centerAlignment={true}
                />

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
                      <ChatInputBox
                        message={message}
                        setMessage={setMessage}
                        handleSendMessage={handleSendMessage}
                        handleStopRequest={handleStopRequest}
                        isStreaming={isStreaming}
                        commandFilter={commandFilter}
                        setCommandFilter={setCommandFilter}
                        selectedButtons={selectedButtons}
                        setSelectedButtons={setSelectedButtons}
                      />

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
              {/* Document header bar - now using the component */}
              <DocumentHeader
                documentName={openedDocument}
                onClose={handleDocumentClose}
                onMoveSide={() => setLeftPaneToRight(false)}
                moveLabel="Move to left side"
              />

              {/* Editor content */}
              {isFileLoading ? (
                <div className="flex flex-col items-center justify-center min-h-screen">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gray-900"></div>
                  <h2 className="text-2xl text-[#fff] font-bold mt-4">
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
              {/* Document header bar - now using the component */}
              <DocumentHeader
                documentName={openedDocument}
                onClose={handleDocumentClose}
                onMoveSide={() => setLeftPaneToRight(true)}
                moveLabel="Move to right side"
              />

              {/* Editor content */}
              {isFileLoading ? (
                <div className="flex flex-col items-center justify-center min-h-screen">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gray-900"></div>
                  <h2 className="text-2xl text-[#fff] font-bold mt-4">
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

                <ChatInputBox
                  message={message}
                  setMessage={setMessage}
                  handleSendMessage={handleSendMessage}
                  handleStopRequest={handleStopRequest}
                  isStreaming={isStreaming}
                  centerAlignment={true}
                />

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
                      <ChatInputBox
                        message={message}
                        setMessage={setMessage}
                        handleSendMessage={handleSendMessage}
                        handleStopRequest={handleStopRequest}
                        isStreaming={isStreaming}
                        commandFilter={commandFilter}
                        setCommandFilter={setCommandFilter}
                        selectedButtons={selectedButtons}
                        setSelectedButtons={setSelectedButtons}
                      />

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

          <ChatInputBox
            message={message}
            setMessage={setMessage}
            handleSendMessage={handleSendMessage}
            handleStopRequest={handleStopRequest}
            isStreaming={isStreaming}
            centerAlignment={true}
          />

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
                <ChatInputBox
                  message={message}
                  setMessage={setMessage}
                  handleSendMessage={handleSendMessage}
                  handleStopRequest={handleStopRequest}
                  isStreaming={isStreaming}
                  commandFilter={commandFilter}
                  setCommandFilter={setCommandFilter}
                  selectedButtons={selectedButtons}
                  setSelectedButtons={setSelectedButtons}
                />

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