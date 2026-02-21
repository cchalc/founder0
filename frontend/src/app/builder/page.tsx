"use client";

import { Suspense, useCallback, useEffect, useReducer, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, PanelLeftClose, PanelLeft } from "lucide-react";
import ChatPanel, { type Message } from "@/components/builder/ChatPanel";
import PreviewPanel from "@/components/builder/PreviewPanel";

interface BuilderState {
  files: Record<string, string>;
  messages: Message[];
  status: "idle" | "running" | "complete" | "error";
  projectName: string;
}

type Action =
  | { type: "START_RUN"; projectName?: string }
  | { type: "ADD_MESSAGE"; message: Message }
  | { type: "UPDATE_FILE"; path: string; content: string }
  | { type: "SET_STATUS"; status: BuilderState["status"] };

function reducer(state: BuilderState, action: Action): BuilderState {
  switch (action.type) {
    case "START_RUN":
      return {
        ...state,
        status: "running",
        messages: [],
        files: {},
        projectName: action.projectName ?? state.projectName,
      };
    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.message] };
    case "UPDATE_FILE":
      return {
        ...state,
        files: { ...state.files, [action.path]: action.content },
      };
    case "SET_STATUS":
      return { ...state, status: action.status };
    default:
      return state;
  }
}

const INITIAL_STATE: BuilderState = {
  files: {},
  messages: [],
  status: "idle",
  projectName: "New Project",
};

export default function BuilderPage() {
  return (
    <Suspense>
      <BuilderContent />
    </Suspense>
  );
}

function BuilderContent() {
  const searchParams = useSearchParams();
  const prompt = searchParams.get("prompt") ?? "";
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [panelWidth, setPanelWidth] = useState(38);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isDragging = useRef(false);
  const hasStarted = useRef(false);

  const startRun = useCallback(
    async (userPrompt: string) => {
      dispatch({ type: "START_RUN", projectName: "Generated App" });

      dispatch({
        type: "ADD_MESSAGE",
        message: {
          id: `user-${Date.now()}`,
          role: "user",
          type: "message",
          content: userPrompt,
          timestamp: Date.now(),
        },
      });

      try {
        const res = await fetch("/api/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: userPrompt }),
        });

        if (!res.ok || !res.body) {
          dispatch({ type: "SET_STATUS", status: "error" });
          dispatch({
            type: "ADD_MESSAGE",
            message: {
              id: `err-${Date.now()}`,
              role: "agent",
              type: "error",
              content: `Failed to connect to agent (${res.status})`,
              timestamp: Date.now(),
            },
          });
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          let currentEvent = "";
          for (const line of lines) {
            if (line.startsWith("event: ")) {
              currentEvent = line.slice(7).trim();
            } else if (line.startsWith("data: ") && currentEvent) {
              try {
                const data = JSON.parse(line.slice(6));
                handleSSEEvent(currentEvent, data);
              } catch {
                // skip malformed data
              }
              currentEvent = "";
            }
          }
        }

        if (state.status === "running") {
          dispatch({ type: "SET_STATUS", status: "complete" });
        }
      } catch {
        dispatch({ type: "SET_STATUS", status: "error" });
        dispatch({
          type: "ADD_MESSAGE",
          message: {
            id: `err-${Date.now()}`,
            role: "agent",
            type: "error",
            content: "Connection to agent lost.",
            timestamp: Date.now(),
          },
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  function handleSSEEvent(event: string, data: Record<string, unknown>) {
    switch (event) {
      case "message":
        dispatch({
          type: "ADD_MESSAGE",
          message: {
            id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            role: (data.role as Message["role"]) ?? "agent",
            type: (data.type as Message["type"]) ?? "message",
            content: (data.content as string) ?? "",
            timestamp: Date.now(),
          },
        });
        break;
      case "file_update":
        dispatch({
          type: "UPDATE_FILE",
          path: data.path as string,
          content: data.content as string,
        });
        break;
      case "status":
        dispatch({
          type: "SET_STATUS",
          status: data.status as BuilderState["status"],
        });
        break;
    }
  }

  useEffect(() => {
    if (prompt && !hasStarted.current) {
      hasStarted.current = true;
      startRun(prompt);
    }
  }, [prompt, startRun]);

  const handleSendMessage = (message: string) => {
    dispatch({
      type: "ADD_MESSAGE",
      message: {
        id: `user-${Date.now()}`,
        role: "user",
        type: "message",
        content: message,
        timestamp: Date.now(),
      },
    });
    startRun(message);
  };

  const handleMouseDown = () => {
    isDragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const pct = (e.clientX / window.innerWidth) * 100;
      setPanelWidth(Math.max(20, Math.min(60, pct)));
    };
    const handleMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const effectiveWidth = sidebarCollapsed ? 0 : panelWidth;

  return (
    <div className="flex h-screen flex-col bg-[#050505] text-white">
      {/* Top bar */}
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-white/[0.06] px-4">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-white/30 transition-colors hover:text-white/60"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span className="text-xs">Back</span>
        </Link>

        <div className="mx-3 h-4 w-px bg-white/[0.08]" />

        <button
          onClick={() => setSidebarCollapsed((v) => !v)}
          className="flex h-7 w-7 items-center justify-center rounded-md text-white/25 transition-colors hover:bg-white/[0.06] hover:text-white/50"
          title={sidebarCollapsed ? "Show chat" : "Hide chat"}
        >
          {sidebarCollapsed ? (
            <PanelLeft className="h-3.5 w-3.5" />
          ) : (
            <PanelLeftClose className="h-3.5 w-3.5" />
          )}
        </button>

        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs font-medium text-white/50"
        >
          {state.projectName}
        </motion.span>

        <div className="ml-auto flex items-center gap-2">
          <div
            className={`h-1.5 w-1.5 rounded-full ${
              state.status === "running"
                ? "bg-emerald-400 animate-pulse"
                : state.status === "complete"
                ? "bg-sky-400"
                : state.status === "error"
                ? "bg-red-400"
                : "bg-white/15"
            }`}
          />
          <span className="font-mono text-[10px] tracking-wide text-white/25 uppercase">
            {state.status}
          </span>
        </div>
      </header>

      {/* Split panels */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat panel */}
        {!sidebarCollapsed && (
          <motion.div
            initial={{ width: `${panelWidth}%` }}
            animate={{ width: `${effectiveWidth}%` }}
            transition={{ duration: 0.15 }}
            className="shrink-0 overflow-hidden border-r border-white/[0.06]"
            style={{ width: `${effectiveWidth}%` }}
          >
            <ChatPanel
              messages={state.messages}
              status={state.status}
              onSendMessage={handleSendMessage}
              projectName={state.projectName}
            />
          </motion.div>
        )}

        {/* Drag handle */}
        {!sidebarCollapsed && (
          <div
            onMouseDown={handleMouseDown}
            className="group relative z-10 w-1 shrink-0 cursor-col-resize"
          >
            <div className="absolute inset-y-0 -left-0.5 w-2 transition-colors group-hover:bg-indigo-500/20 group-active:bg-indigo-500/30" />
          </div>
        )}

        {/* Preview panel */}
        <div className="flex-1 overflow-hidden">
          <PreviewPanel files={state.files} />
        </div>
      </div>
    </div>
  );
}
