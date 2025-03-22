"use client";
import { useState, useEffect, useRef } from "react";
import React from "react";
import { Crepe } from "@milkdown/crepe";
import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/frame.css";

interface SplitScreenEditorProps {
  fileName: string;
}

export function DocumentViewer({ fileName }: SplitScreenEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const crepeInstanceRef = useRef<Awaited<ReturnType<Crepe["create"]>> | null>(
    null
  );
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
        const url = `/api/legacy/data/readFile?file_name=${fileName}`;
        console.log("[DocumentViewer] Fetching from URL:", url);
        const response = await fetch(url);
        console.log("[DocumentViewer] Fetch response status:", response.status);
        const data = await response.json();
        console.log("[DocumentViewer] Fetched JSON data:", data);
        let md: string;
        if (data.success) {
          console.log(
            "[DocumentViewer] File read successfully, data:",
            data.data
          );
          md = data.data;
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
      } finally {
        setIsLoading(false);
        console.log("[DocumentViewer] fetchData complete.");
      }
    };

    fetchData();

    return () => {
      if (crepeInstanceRef.current) {
        console.log("[DocumentViewer] Destroying editor instance.");
        crepeInstanceRef.current.destroy();
        crepeInstanceRef.current = null;
      }
    };
  }, [fileName]);

  useEffect(() => {
    if (
      !isLoading &&
      markdown &&
      editorRef.current &&
      !crepeInstanceRef.current
    ) {
      console.log(
        "[DocumentViewer] Initializing editor with markdown:",
        markdown
      );
      (async () => {
        try {
          crepeInstanceRef.current = await new Crepe({
            root: editorRef.current,
            defaultValue: markdown,
          }).create();
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
        !!crepeInstanceRef.current
      );
    }
  }, [isLoading, markdown]);

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

        .milkdown-editor ::selection {
          background: #085eec !important;
        }
        `}</style>
      {isLoading ? (
        <div className="flex items-center justify-center h-full text-white">
          Loading document...
        </div>
      ) : (
        <div
          ref={editorRef}
          className="milkdown-editor overflow-y-auto bg-[#2f2f2f] h-full w-full"
        />
      )}
    </>
  );
}

export default function DocumentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [fileName, setFileName] = useState<string>("");

  useEffect(() => {
    console.log("[DocumentPage] Resolving params...");
    const loadParams = async () => {
      try {
        const resolvedParams = await params;
        console.log("[DocumentPage] Resolved params:", resolvedParams);
        setFileName(resolvedParams.slug);
        console.log("[DocumentPage] fileName set to:", resolvedParams.slug);
      } catch (error) {
        console.error("[DocumentPage] Error resolving params:", error);
      }
    };

    loadParams();
  }, [params]);

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
                      You’re viewing a shared user-generated BRS document
                    </span>
                  </div>
                  <div>
                    <button className="underline">Edit</button>
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
          <DocumentViewer fileName={fileName} />
        </div>
      </div>
    </main>
  );
}