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

  return <div ref={editorRef} className="h-full w-full" />;
}