"use client";
import { useState, useEffect, useRef, use } from "react";
import React from "react";
import { Crepe } from "@milkdown/crepe";
import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/frame.css";
import { useSearchParams as useNextSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

interface SplitScreenEditorProps {
  fileName: string;
  isEditing?: boolean;
}

function LoadingAnimation() {
  const [animationData, setAnimationData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLottieAnimation = async () => {
      try {
        const fileUrl = `https://pocketbase.acroford.com/api/files/7k8xxgkrkkd9bjs/drpninrvrobqaau/files_loading_4qC45qHwlG.json`;
        const fileResponse = await fetch(fileUrl);

        if (!fileResponse.ok) {
          throw new Error("Failed to fetch animation file");
        }

        const animationJson = await fileResponse.json();
        setAnimationData(animationJson);
      } catch (err) {
        console.error("Error loading Lottie animation:", err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsLoading(false);
      }
    };

    fetchLottieAnimation();
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white p-8">
        <p>Loading document...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full text-white">
      {animationData ? (
        <>
          <div className="w-64 h-64">
            <Lottie animationData={animationData} loop={true} autoplay={true} />
          </div>
        </>
      ) : (
        <p>Loading document...</p>
      )}
    </div>
  );
}

function CopyIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="#e3e3e3"
      xmlns="http://www.w3.org/2000/svg"
      className="icon-xl-heavy"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7 5C7 3.34315 8.34315 2 10 2H19C20.6569 2 22 3.34315 22 5V14C22 15.6569 20.6569 17 19 17H17V19C17 20.6569 15.6569 22 14 22H5C3.34315 22 2 20.6569 2 19V10C2 8.34315 3.34315 7 5 7H7V5ZM9 7H14C15.6569 7 17 8.34315 17 10V15H19C19.5523 15 20 14.5523 20 14V5C20 4.44772 19.5523 4 19 4H10C9.44772 4 9 4.44772 9 5V7ZM5 9C4.44772 9 4 9.44772 4 10V19C4 19.5523 4.44772 20 5 20H14C14.5523 20 15 19.5523 15 19V10C15 9.44772 14.5523 9 14 9H5Z"
        fill="#e3e3e3"
      ></path>
    </svg>
  );
}

function NextVersionIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="#e3e3e3"
      xmlns="http://www.w3.org/2000/svg"
      className="icon-xl-heavy"
    >
      <path
        d="M3 13.6647C3 12.3976 3.26992 11.2826 3.80973 10.3199C4.35574 9.35091 5.13444 8.59626 6.14582 8.05587C7.16341 7.51548 8.37334 7.24535 9.77563 7.24535H15.3506L18.6732 7.39445L18.2917 8.00926L15.937 6.0528L13.7684 3.92857C13.6629 3.82299 13.576 3.70497 13.5078 3.57454C13.4457 3.4379 13.4147 3.28261 13.4147 3.1087C13.4147 2.78572 13.517 2.52175 13.7218 2.31678C13.9328 2.1056 14.209 2 14.5501 2C14.8666 2 15.1427 2.11801 15.3785 2.35404L20.637 7.54342C20.7549 7.65531 20.8449 7.78888 20.907 7.94411C20.969 8.09321 21 8.24845 21 8.40995C21 8.56519 20.969 8.72056 20.907 8.8758C20.8449 9.0249 20.7549 9.1522 20.637 9.25782L15.3785 14.4472C15.1427 14.6894 14.8666 14.8106 14.5501 14.8106C14.209 14.8106 13.9328 14.705 13.7218 14.4938C13.517 14.2826 13.4147 14.0155 13.4147 13.6926C13.4147 13.5187 13.4457 13.3664 13.5078 13.236C13.576 13.1056 13.6629 12.9876 13.7684 12.8819L15.937 10.7577L18.2917 8.80125L18.6732 9.41619L15.3506 9.56516H9.77563C8.82007 9.56516 8.00726 9.73607 7.33714 10.0776C6.66702 10.4193 6.15513 10.8944 5.80146 11.5031C5.45399 12.1118 5.28026 12.8075 5.28026 13.5901C5.28026 14.3851 5.45399 15.0901 5.80146 15.7049C6.15513 16.3136 6.66702 16.795 7.33714 17.1491C8.00726 17.5032 8.82007 17.6801 9.77563 17.6801H11.9627C12.3041 17.6801 12.5833 17.792 12.8005 18.0155C13.0238 18.2391 13.1355 18.5124 13.1355 18.8354C13.1355 19.1584 13.0238 19.4317 12.8005 19.6553C12.5833 19.8851 12.3041 20 11.9627 20H9.66399C8.28026 20 7.08895 19.736 6.08999 19.208C5.09722 18.6863 4.33403 17.9503 3.80043 17C3.26681 16.0559 3 14.9442 3 13.6647Z"
        fill="#e3e3e3"
      ></path>
    </svg>
  );
}

function PreviousVersionIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="#e3e3e3"
      xmlns="http://www.w3.org/2000/svg"
      className="icon-xl-heavy"
    >
      <path
        d="M21 13.6647C21 14.9442 20.7333 16.0559 20.1996 17C19.666 17.9503 18.8997 18.6863 17.9008 19.208C16.908 19.736 15.7198 20 14.3361 20H12.0372C11.696 20 11.4137 19.8851 11.1902 19.6553C10.9669 19.4317 10.8553 19.1584 10.8553 18.8354C10.8553 18.5124 10.9669 18.2391 11.1902 18.0155C11.4137 17.792 11.696 17.6801 12.0372 17.6801H14.2245C15.18 17.6801 15.9897 17.5032 16.6535 17.1491C17.3237 16.795 17.8325 16.3136 18.1799 15.7049C18.5336 15.0901 18.7105 14.3851 18.7105 13.5901C18.7105 12.8075 18.5336 12.1118 18.1799 11.5031C17.8325 10.8944 17.3237 10.4193 16.6535 10.0776C15.9897 9.73607 15.18 9.56516 14.2245 9.56516H8.64014L5.3268 9.41619L5.70838 8.80125L8.05379 10.7577L10.2316 12.8819C10.331 12.9876 10.4116 13.1056 10.4737 13.236C10.5419 13.3664 10.5761 13.5187 10.5761 13.6926C10.5761 14.0155 10.4705 14.2826 10.2596 14.4938C10.0549 14.705 9.78176 14.8106 9.44056 14.8106C9.13032 14.8106 8.85421 14.6894 8.61223 14.4472L3.36299 9.25782C3.2451 9.1522 3.15513 9.0249 3.09307 8.8758C3.03103 8.72056 3 8.56519 3 8.40995C3 8.24845 3.03103 8.09321 3.09307 7.94411C3.15513 7.78888 3.2451 7.65531 3.36299 7.54342L8.61223 2.35404C8.85421 2.11801 9.13032 2 9.44056 2C9.78176 2 10.0549 2.1056 10.2596 2.31678C10.4705 2.52175 10.5761 2.78572 10.5761 3.1087C10.5761 3.28261 10.5419 3.4379 10.4737 3.57454C10.4116 3.70497 10.331 3.82299 10.2316 3.92857L8.05379 6.0528L5.70838 8.00926L5.3268 7.39445L8.64014 7.24535H14.2245C15.6267 7.24535 16.8335 7.51548 17.8449 8.05587C18.8624 8.59626 19.6412 9.35091 20.1811 10.3199C20.727 11.2826 21 12.3976 21 13.6647Z"
        fill="#e3e3e3"
      ></path>
    </svg>
  );
}

function DropdownIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="#e3e3e3"
      xmlns="http://www.w3.org/2000/svg"
      className="icon-md text-token-text-tertiary"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.29289 9.29289C5.68342 8.90237 6.31658 8.90237 6.70711 9.29289L12 14.5858L17.2929 9.29289C17.6834 8.90237 18.3166 8.90237 18.7071 9.29289C19.0976 9.68342 19.0976 10.3166 18.7071 10.7071L12.7071 16.7071C12.5196 16.8946 12.2652 17 12 17C11.7348 17 11.4804 16.8946 11.2929 16.7071L5.29289 10.7071C4.90237 10.3166 4.90237 9.68342 5.29289 9.29289Z"
        fill="#e3e3e3"
      ></path>
    </svg>
  );
}

function VersionHistoryIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="icon-xl-heavy"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4 5.99929V4.5C4 3.94772 3.55228 3.5 3 3.5C2.44772 3.5 2 3.94772 2 4.5V9C2 9.55228 2.44772 10 3 10H7C7.55228 10 8 9.55228 8 9C8 8.44772 7.55228 8 7 8H5.07004C6.4544 5.60707 9.04034 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C8.194 20 5.0066 17.3412 4.19823 13.7787C4.07601 13.2401 3.54032 12.9026 3.00173 13.0248C2.46314 13.147 2.12559 13.6827 2.24781 14.2213C3.25835 18.6747 7.23965 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C8.72759 2 5.82361 3.57195 4 5.99929ZM12 6C12.5523 6 13 6.44772 13 7V12C13 12.2652 12.8946 12.5196 12.7071 12.7071L10.2071 15.2071C9.81658 15.5976 9.18342 15.5976 8.79289 15.2071C8.40237 14.8166 8.40237 14.1834 8.79289 13.7929L11 11.5858V7C11 6.44772 11.4477 6 12 6Z"
        fill="currentColor"
      ></path>
    </svg>
  );
}

function DocumentViewer({
  fileName,
  isEditing = false,
}: SplitScreenEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const crepeRef = useRef<Crepe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [markdown, setMarkdown] = useState<string>("");

  useEffect(() => {
    if (!fileName) {
      console.log("[DocumentViewer] fileName is empty. Skipping fetch.");
      return;
    }
    console.log("[DocumentViewer] fileName provided:", fileName);

    const fetchData = async () => {
      setIsLoading(true);
      console.log("[DocumentViewer] Starting fetchData...");
      try {
        // Updated API endpoint
        const url = `/api/v3/editor/rawFetch?file_name=${fileName}`;
        console.log("[DocumentViewer] Fetching from URL:", url);
        const response = await fetch(url);
        console.log("[DocumentViewer] Fetch response status:", response.status);
        const data = await response.json();
        console.log("[DocumentViewer] Fetched JSON data:", data);
        let md: string;
        if (data.success) {
          // Extract the latest version content from the new data structure
          const fileData = data.data;
          console.log("[DocumentViewer] File data:", fileData);

          // Get the latest version number and content
          const latestVersion = fileData.data.latestVersion;
          md = fileData.data.versions[latestVersion];

          console.log("[DocumentViewer] Using latest version:", latestVersion);
          console.log("[DocumentViewer] Content:", md);
        } else {
          console.error(
            "[DocumentViewer] Error reading file, message:",
            data.message
          );
          md = data.message;
        }
        console.log("[DocumentViewer] Final markdown content to use:", md);
        setMarkdown(md);
      } catch (err) {
        console.error("[DocumentViewer] Error in fetchData:", err);
        setMarkdown("Error loading document content.");
      } finally {
        setIsLoading(false);
        console.log("[DocumentViewer] fetchData complete.");
      }
    };

    fetchData();

    return () => {
      if (crepeRef.current) {
        console.log("[DocumentViewer] Destroying editor instance.");
        crepeRef.current.destroy();
        crepeRef.current = null;
      }
    };
  }, [fileName]);

  useEffect(() => {
    if (!isLoading && markdown && editorRef.current && !crepeRef.current) {
      console.log(
        "[DocumentViewer] Initializing editor with markdown:",
        markdown
      );
      (async () => {
        try {
          // Create a new Crepe instance
          const crepe = new Crepe({
            root: editorRef.current,
            defaultValue: markdown,
          });

          // Store the Crepe instance
          crepeRef.current = crepe;

          // Create the editor
          await crepe.create();

          // When isEditing=true: setReadonly(false) → Editor is editable
          // When isEditing=false: setReadonly(true) → Editor is read-only (not editable)
          crepe.setReadonly(!isEditing);
          console.log(
            `[DocumentViewer] Editor read-only mode set to: ${!isEditing} (isEditing: ${isEditing})`
          );

          console.log("[DocumentViewer] Editor created successfully.");
        } catch (err) {
          console.error("[DocumentViewer] Error initializing editor:", err);
        }
      })();
    } else {
      console.log(
        "[DocumentViewer] Skipping initialization. isLoading:",
        isLoading,
        "markdown:",
        markdown,
        "editorRef:",
        editorRef.current,
        "instance exists:",
        !!crepeRef.current
      );
    }
  }, [isLoading, markdown, isEditing]);

  // When isEditing changes, update the read-only state
  useEffect(() => {
    if (crepeRef.current) {
      // When isEditing=true: setReadonly(false) → Editor is editable
      // When isEditing=false: setReadonly(true) → Editor is read-only (not editable)
      crepeRef.current.setReadonly(!isEditing);
      console.log(
        `[DocumentViewer] Updated editor read-only mode to: ${!isEditing} (isEditing: ${isEditing})`
      );
    }
  }, [isEditing]);

  if (!fileName) {
    return <div className="text-white p-4">Loading document...</div>;
  }

  return (
    <>
      <style>{`
        @font-face {
          font-family: 'Source Code Pro';
          src: url('/SourceCodePro-VariableFont_wght.ttf') format('truetype');
          font-weight: 500;
          font-style: normal;
        }

        milkdown-toolbar {
          background-color: #2f2f2f !important;
        }

        milkdown-toolbar [data-active="true"],
        milkdown-toolbar .active,
        milkdown-toolbar .toolbar-item.active,
        milkdown-toolbar button[aria-pressed="true"] {
          background-color: #e0e0e0 !important;
          color: #fff !important;
        }

        milkdown-toolbar * {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          cursor: pointer !important;
        }
          
        .milkdown-editor, .milkdown-editor * {
          color: #fff !important;
          font-family: 'Roboto', sans-serif !important;
          cursor: text;
        }
        .milkdown-editor p {
          margin-bottom: 1.1em !important;
          font-size: 1.2rem !important;
          line-height: 1.4 !important;
        }
        .milkdown-editor code {
          color: #d4d4d4 !important;
          background-color: #1e1e1e !important;
          border-radius: 12px;
          font-family: 'Source Code Pro' !important;
        }
        .milkdown-editor .operation-item {
          cursor: pointer !important;
        }

        milkdown-link-edit .link-edit {
          background-color: #2f2f2f !important;
          color: #fff !important;
          margin: 12px !important;
        }

        milkdown-link-preview .link-preview {
          background-color: #2f2f2f !important;
          cursor: pointer !important;
          color: #fff !important;
        }

        milkdown-link-preview {
          padding: 12px !important;
        }

        .milkdown-editor table,
        .milkdown-editor .milkdown-table {
          border-radius: 12px !important;
          background-color: transparent !important;
          border-collapse: separate !important;
          border-spacing: 0 !important;
          overflow: hidden !important;
          border: 1px solid #636363 !important;
        }
        
        .milkdown-editor table tr,
        .milkdown-editor .milkdown-table tr {
          height: auto !important;
          line-height: 1 !important;
        }
        
        .milkdown-editor table td,
        .milkdown-editor table th,
        .milkdown-editor .milkdown-table td,
        .milkdown-editor .milkdown-table th {
          border: 1px solid #636363 !important;
          padding: 2px 12px !important;
          min-height: unset !important;
          line-height: 1.2 !important;
          height: auto !important;
        }

        .milkdown-editor table th,
        .milkdown-editor .milkdown-table th {
          border: 1px solid #636363 !important;
          padding-left: 12px !important;
          padding-right: 12px !important;
          padding-bottom: 0px !important;
          background-color: #444444 !important;
        }

        hr {
          border: #636363 !important;
          background-color: #636363 !important;
          margin-top: 1.5em !important;
          margin-bottom: 1.5em !important;
        }
        
        .milkdown-editor milkdown-code-block,
        .milkdown-editor milkdown-code-block * {
          color: #d4d4d4 !important;
          background-color: #1e1e1e !important;
          border-radius: 12px;
          font-family: 'Source Code Pro' !important;
        }

        /* Change cursor for read-only mode */
        .read-only-editor, .read-only-editor * {
          cursor: default !important;
        }
        
        /* Keep certain elements clickable even in read-only mode */
        .read-only-editor a, 
        .read-only-editor [role="button"], 
        .read-only-editor button {
          cursor: pointer !important;
        }

        .milkdown-editor ::selection {
          background: #085eec !important;
        }

        /* Action buttons */
        .floating-action-buttons {
          position: fixed;
          bottom: 24px;
          right: 24px;
          background-color: #2f2f2f;
          border-radius: 9999px;
          padding: 8px;
          display: flex;
          gap: 8px;
          z-index: 100;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        
        .action-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 9999px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .action-button:hover {
          background-color: #3d3d3d;
        }

        .action-button svg {
          color: #e3e3e3;
        }

        .action-button.version-history svg {
          fill: #e3e3e3;
        }
        
        `}</style>
      {isLoading ? (
        <LoadingAnimation />
      ) : (
        <>
          <div
            ref={editorRef}
            className={`milkdown-editor overflow-y-auto bg-[#2f2f2f] h-full w-full ${
              !isEditing ? "read-only-editor" : ""
            }`}
          />
          <div className="floating-action-buttons mr-6 mb-4 flex-col p-5 shadow-lg shadow-black/50">
            <button
              className="action-button mb-2 p-1.5"
              title="Toggle actions menu"
              onClick={() => {
                const buttons = document.querySelectorAll(
                  ".floating-action-buttons .action-button:not(:first-child)"
                );
                const icon = document.querySelector(
                  ".floating-action-buttons .action-button:first-child div"
                );

                buttons.forEach((button) => {
                  const el = button as HTMLElement;
                  el.style.display =
                    el.style.display === "none" ? "flex" : "none";
                });

                if (icon) {
                  icon.classList.toggle("rotate-180");
                  const parentButton = icon.closest(
                    ".action-button"
                  ) as HTMLElement;
                  if (parentButton) {
                    parentButton.style.marginBottom = icon.classList.contains(
                      "rotate-180"
                    )
                      ? "0"
                      : "0.5rem";
                  }
                }
              }}
            >
              <div className="transform transition-transform duration-200">
                <DropdownIcon />
              </div>
            </button>

            <button
              className="action-button mb-2 p-1.5"
              title="Copy document"
              onClick={() => {
                if (crepeRef.current) {
                  navigator.clipboard.writeText(markdown);
                  alert("Document content copied to clipboard!");
                }
              }}
            >
              <CopyIcon />
            </button>
            <button
              className="action-button mb-2 p-1.5"
              title="Previous version"
            >
              <PreviousVersionIcon />
            </button>
            <button className="action-button mb-2 p-1.5" title="Next version">
              <NextVersionIcon />
            </button>
            <button
              className="action-button version-history p-1.5"
              title="Version history"
            >
              <VersionHistoryIcon />
            </button>
          </div>
        </>
      )}
    </>
  );
}

export default function DocumentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const unwrappedParams = use(params);
  const fileName = unwrappedParams.slug;
  const searchParams = useNextSearchParams();
  const isEditing = searchParams?.get("isEditing") === "true";

  return (
    <main className="flex min-h-screen flex-col bg-[#1e1e1e]">
      <div className="flex-1 p-4">
        <div className="h-[calc(100vh-2rem)] rounded-md overflow-hidden border border-[#444444]">
          <div className="flex w-full min-w-0 bg-[#2f2f2f] text-[#f9f9f9] items-center justify-between gap-2 self-start border-token-border-light px-4 transition-colors duration-700 border-token-border-light py-3 text-sm font-medium text-token-text-secondary">
            <div className="flex min-w-0 items-center gap-3.5">
              <span className="flex-shrink-0 transition-[filter] grayscale">
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="icon-md text-token-text-tertiary"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M4 5C4 3.34315 5.34315 2 7 2H14.1716C14.9672 2 15.7303 2.31607 16.2929 2.87868L19.1213 5.70711C19.6839 6.26972 20 7.03278 20 7.82843V19C20 20.6569 18.6569 22 17 22H7C5.34315 22 4 20.6569 4 19V5ZM7 4C6.44772 4 6 4.44772 6 5V19C6 19.5523 6.44772 20 7 20H17C17.5523 20 18 19.5523 18 19V7.82843C18 7.56321 17.8946 7.30886 17.7071 7.12132L14.8787 4.29289C14.6911 4.10536 14.4368 4 14.1716 4H7ZM8 10C8 9.44772 8.44772 9 9 9H15C15.5523 9 16 9.44772 16 10C16 10.5523 15.5523 11 15 11H9C8.44772 11 8 10.5523 8 10ZM8 14C8 13.4477 8.44772 13 9 13H13C13.5523 13 14 13.4477 14 14C14 14.5523 13.5523 15 13 15H9C8.44772 15 8 14.5523 8 14Z"
                    fill="currentColor"
                  ></path>
                </svg>
              </span>
              <div>
                <h1 className="line-clamp-1 text-base font-semibold text-token-text-primary">
                  {fileName}
                </h1>
                <div className="flex flex-col gap-1.5 text-xs text-token-text-secondary xs:flex-col sm:flex-row">
                  <div className="cursor-default">
                    <span className="" data-state="closed">
                      {isEditing
                        ? "You’re editing a shared user-generated BRS document"
                        : "You’re viewing a shared user-generated BRS document"}
                    </span>
                  </div>
                  <div>
                    <button
                      onClick={() =>
                        (window.location.href = `?isEditing=${!isEditing}`)
                      }
                      className="underline"
                    >
                      {isEditing ? "Switch to view mode" : "Edit"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 p-2 m-2 rounded-full bg-[#f9f9f9] hover:bg-[#ececec]">
              <span className="" data-state="closed">
                <div className="flex items-cente gap-4">
                  <a
                    className="btn relative btn-primary"
                    href={`/?splitScreen=true&fileName=${fileName}`}
                    target="_blank"
                    data-discover="true"
                  >
                    <div className="flex w-full pl-2 pr-2 pt-1 pb-1  text-[#0d0d0d] items-center justify-center gap-1.5">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="icon-sm"
                      >
                        <text x="-9999" y="-9999" className="">
                          ChatGPT
                        </text>
                        <path
                          d="M9.20509 8.76511V6.50545C9.20509 6.31513 9.27649 6.17234 9.44293 6.0773L13.9861 3.46088C14.6046 3.10413 15.342 2.93769 16.103 2.93769C18.9573 2.93769 20.7651 5.14983 20.7651 7.50454C20.7651 7.67098 20.7651 7.86129 20.7412 8.05161L16.0316 5.2924C15.7462 5.12596 15.4607 5.12596 15.1753 5.2924L9.20509 8.76511ZM19.8135 17.5659V12.1664C19.8135 11.8333 19.6708 11.5955 19.3854 11.429L13.4152 7.95633L15.3656 6.83833C15.5321 6.74328 15.6749 6.74328 15.8413 6.83833L20.3845 9.45474C21.6928 10.216 22.5728 11.8333 22.5728 13.4031C22.5728 15.2108 21.5025 16.8758 19.8135 17.5657V17.5659ZM7.80173 12.8088L5.8513 11.6671C5.68486 11.5721 5.61346 11.4293 5.61346 11.239V6.00613C5.61346 3.46111 7.56389 1.53433 10.2042 1.53433C11.2033 1.53433 12.1307 1.86743 12.9159 2.46202L8.2301 5.17371C7.94475 5.34015 7.80195 5.57798 7.80195 5.91109V12.809L7.80173 12.8088ZM12 15.2349L9.20509 13.6651V10.3351L12 8.76534L14.7947 10.3351V13.6651L12 15.2349ZM13.7958 22.4659C12.7967 22.4659 11.8693 22.1328 11.0841 21.5382L15.7699 18.8265C16.0553 18.6601 16.198 18.4222 16.198 18.0891V11.1912L18.1723 12.3329C18.3388 12.4279 18.4102 12.5707 18.4102 12.761V17.9939C18.4102 20.5389 16.4359 22.4657 13.7958 22.4657V22.4659ZM8.15848 17.1617L3.61528 14.5452C2.30696 13.784 1.42701 12.1667 1.42701 10.5969C1.42701 8.76534 2.52115 7.12414 4.20987 6.43428V11.8574C4.20987 12.1905 4.35266 12.4284 4.63802 12.5948L10.5846 16.0436L8.63415 17.1617C8.46771 17.2567 8.32492 17.2567 8.15848 17.1617ZM7.897 21.0625C5.20919 21.0625 3.23488 19.0407 3.23488 16.5432C3.23488 16.3529 3.25875 16.1626 3.2824 15.9723L7.96817 18.6839C8.25352 18.8504 8.53911 18.8504 8.82446 18.6839L14.7947 15.2351V17.4948C14.7947 17.6851 14.7233 17.8279 14.5568 17.9229L10.0136 20.5393C9.39518 20.8961 8.6578 21.0625 7.89677 21.0625H7.897ZM13.7958 23.8929C16.6739 23.8929 19.0762 21.8474 19.6235 19.1357C22.2874 18.4459 24 15.9484 24 13.4034C24 11.7383 23.2865 10.121 22.002 8.95542C22.121 8.45588 22.1924 7.95633 22.1924 7.45702C22.1924 4.0557 19.4331 1.51045 16.2458 1.51045C15.6037 1.51045 14.9852 1.60549 14.3668 1.81968C13.2963 0.773071 11.8215 0.107086 10.2042 0.107086C7.32606 0.107086 4.92383 2.15256 4.37653 4.86425C1.7126 5.55411 0 8.05161 0 10.5966C0 12.2617 0.713506 13.879 1.99795 15.0446C1.87904 15.5441 1.80764 16.0436 1.80764 16.543C1.80764 19.9443 4.56685 22.4895 7.75421 22.4895C8.39632 22.4895 9.01478 22.3945 9.63324 22.1803C10.7035 23.2269 12.1783 23.8929 13.7958 23.8929Z"
                          fill="currentColor"
                        ></path>
                      </svg>
                      <span className="hidden sm:inline">
                        Edit with ChatGPT{" "}
                        <i>
                          for <b>BRS</b>
                        </i>
                      </span>
                      <span className="inline sm:hidden">Edit</span>
                    </div>
                  </a>
                </div>
              </span>
            </div>
          </div>
          <DocumentViewer fileName={fileName} isEditing={isEditing} />
        </div>
      </div>
    </main>
  );
}