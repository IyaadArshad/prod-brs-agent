"use client";

import React, { useEffect, useRef } from "react";
import { Crepe } from "@milkdown/crepe";
import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/frame.css";

interface SplitScreenEditorProps {
  markdown: string;
}

export function SplitScreenEditor({ markdown }: SplitScreenEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const crepeInstanceRef = useRef<Awaited<ReturnType<Crepe["create"]>> | null>(
    null
  );

  useEffect(() => {
    const initEditor = async () => {
      if (editorRef.current && !crepeInstanceRef.current) {
        try {
          crepeInstanceRef.current = await new Crepe({
            root: editorRef.current,
            defaultValue: markdown,
          }).create();
        } catch (err) {
          console.error("Error initializing editor:", err);
        }
      }
    };

    initEditor();

    return () => {
      if (crepeInstanceRef.current) {
        crepeInstanceRef.current.destroy();
        crepeInstanceRef.current = null;
      }
    };
  }, [markdown]);

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

        milkdown-block-handle .operation-item:hover {
          background-color: #2f2f2f !important;
          cursor: pointer !important;
        }
        milkdown-block-handle {
          cursor: pointer !important;
        }
        milkdown-block-handle svg {
          cursor: pointer !important;
        } 
        p .crepe-placeholder {
          color: #fff !important;
        }         
        `}</style>
      <div
        ref={editorRef}
        className="milkdown-editor bg-[#2f2f2f] h-full w-full"
      />
    </>
  );
}