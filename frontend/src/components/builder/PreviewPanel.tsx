"use client";

import { useState } from "react";
import {
  SandpackProvider,
  SandpackPreview,
  SandpackCodeEditor,
  SandpackFileExplorer,
} from "@codesandbox/sandpack-react";
import { Monitor, Code2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "preview" | "code";

interface PreviewPanelProps {
  files: Record<string, string>;
}

const SANDPACK_DARK_THEME = {
  colors: {
    surface1: "#0a0a0a",
    surface2: "#141414",
    surface3: "#1a1a1a",
    clickable: "#666",
    base: "#ccc",
    disabled: "#333",
    hover: "#e0e0e0",
    inputBackground: "#111",
    accent: "#6366f1",
    error: "#ef4444",
    errorSurface: "#1c1015",
  },
  syntax: {
    plain: "#d4d4d8",
    comment: { color: "#525252", fontStyle: "italic" as const },
    keyword: "#c084fc",
    tag: "#7dd3fc",
    punctuation: "#525252",
    definition: "#67e8f9",
    property: "#a5b4fc",
    static: "#f9a8d4",
    string: "#86efac",
  },
  font: {
    body: 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: 'var(--font-geist-mono), "Fira Code", "Fira Mono", Menlo, monospace',
    size: "13px",
    lineHeight: "1.6",
  },
};

export default function PreviewPanel({ files }: PreviewPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("preview");
  const [refreshKey, setRefreshKey] = useState(0);

  const sandpackFiles: Record<string, string> = {};
  for (const [path, content] of Object.entries(files)) {
    sandpackFiles[path] = content;
  }

  const hasFiles = Object.keys(files).length > 0;

  return (
    <div className="flex h-full flex-col bg-[#0a0a0a]">
      {/* Tab bar */}
      <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-0">
        <div className="flex">
          {(
            [
              { id: "preview", label: "Preview", icon: Monitor },
              { id: "code", label: "Code", icon: Code2 },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "relative flex items-center gap-1.5 px-3 py-3 text-xs font-medium transition-colors",
                activeTab === id
                  ? "text-white/90"
                  : "text-white/30 hover:text-white/50"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
              {activeTab === id && (
                <span className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-indigo-500" />
              )}
            </button>
          ))}
        </div>

        {activeTab === "preview" && (
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-white/25 transition-colors hover:bg-white/[0.06] hover:text-white/50"
            title="Refresh preview"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="relative flex-1 overflow-hidden">
        {!hasFiles ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.06]">
                <Monitor className="h-5 w-5 text-white/15" />
              </div>
              <p className="text-sm text-white/25">
                Preview will appear here
              </p>
              <p className="mt-1 text-xs text-white/15">
                Waiting for the agent to write code...
              </p>
            </div>
          </div>
        ) : (
          <SandpackProvider
            key={refreshKey}
            template="react-ts"
            files={sandpackFiles}
            theme={SANDPACK_DARK_THEME}
            options={{
              externalResources: ["https://cdn.tailwindcss.com"],
              classes: {
                "sp-wrapper": "!h-full !border-0",
                "sp-layout": "!h-full !border-0 !bg-transparent",
                "sp-stack": "!h-full",
                "sp-preview-container": "!h-full",
                "sp-preview-iframe": "!h-full !bg-white",
              },
            }}
          >
            {activeTab === "preview" ? (
              <div className="h-full rounded-md overflow-hidden m-1">
                <SandpackPreview
                  showNavigator={false}
                  showRefreshButton={false}
                  style={{ height: "100%" }}
                />
              </div>
            ) : (
              <div className="flex h-full">
                <div className="w-48 shrink-0 overflow-y-auto border-r border-white/[0.06]">
                  <SandpackFileExplorer style={{ height: "100%" }} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <SandpackCodeEditor
                    showTabs={false}
                    showLineNumbers
                    style={{ height: "100%" }}
                    readOnly
                  />
                </div>
              </div>
            )}
          </SandpackProvider>
        )}
      </div>
    </div>
  );
}
