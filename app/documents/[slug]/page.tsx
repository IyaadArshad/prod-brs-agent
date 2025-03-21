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
          console.log("[DocumentViewer] File read successfully, data:", data.data);
          md = data.data;
        } else {
          console.error("[DocumentViewer] Error reading file, message:", data.message);
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
    if (!isLoading && markdown && editorRef.current && !crepeInstanceRef.current) {
      console.log("[DocumentViewer] Initializing editor with markdown:", markdown);
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
      console.log("[DocumentViewer] Skipping initialization. isLoading:", isLoading, "markdown:", markdown, "editorRef:", editorRef.current, "instance exists:", !!crepeInstanceRef.current);
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
          className="milkdown-editor bg-[#2f2f2f] h-full w-full"
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
          <DocumentViewer fileName={fileName} />
        </div>
      </div>
    </main>
  );
}