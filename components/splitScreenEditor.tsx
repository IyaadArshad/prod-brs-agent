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
      .milkdown-editor, .milkdown-editor * {
      color: #fff !important;
      font-family: 'Roboto', sans-serif !important;
      }
      .milkdown-editor p {
      margin-bottom: 1.1em !important;
      font-size: 1.2rem !important;
      line-height: 1.4 !important;
      }
      .milkdown-editor milkdown-code-block,
      .milkdown-editor milkdown-code-block * {
      color: #333 !important;
      background-color: #f5f5f5 !important;
      font-family: 'Roboto Mono', monospace !important;
      }
      `}</style>
      <div
        ref={editorRef}
        className="milkdown-editor bg-[#2f2f2f] h-full w-full"
      />
    </>
  );
}